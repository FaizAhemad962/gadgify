// backend/src/services/deliveryTrackingService.ts
import prisma from "../config/database";
import { logger } from "../config/logger";

interface LocationUpdate {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  bearing?: number;
}

export class DeliveryTrackingService {
  /**
   * Record GPS location update from delivery staff
   */
  static async updateLocation(
    assignmentId: string,
    deliveryStaffId: string,
    location: LocationUpdate,
  ) {
    try {
      // Verify assignment belongs to this staff
      const assignment = await prisma.deliveryAssignment.findUnique({
        where: { id: assignmentId },
      });

      if (!assignment || assignment.deliveryStaffId !== deliveryStaffId) {
        throw new Error("Unauthorized");
      }

      // Create tracking point
      const tracking = await prisma.deliveryTracking.create({
        data: {
          assignmentId,
          deliveryStaffId,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          altitude: location.altitude,
          speed: location.speed,
          bearing: location.bearing,
          source: "GPS",
          isMoving: (location.speed || 0) > 0.5, // Consider moving if speed > 0.5 km/h
        },
      });

      // Update assignment with latest location
      await prisma.deliveryAssignment.update({
        where: { id: assignmentId },
        data: {
          lastLocationJson: JSON.stringify({
            lat: location.latitude,
            lng: location.longitude,
            timestamp: new Date(),
          }),
        },
      });

      return tracking;
    } catch (error) {
      logger.error("Error updating location:", error);
      throw error;
    }
  }

  /**
   * Get location history for an assignment
   */
  static async getLocationHistory(assignmentId: string, limit: number = 100) {
    try {
      const tracking = await prisma.deliveryTracking.findMany({
        where: { assignmentId },
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      return tracking.reverse(); // Return in chronological order for map
    } catch (error) {
      logger.error("Error getting location history:", error);
      return [];
    }
  }

  /**
   * Get current location of delivery staff
   */
  static async getCurrentLocation(assignmentId: string) {
    try {
      const tracking = await prisma.deliveryTracking.findFirst({
        where: { assignmentId },
        orderBy: { createdAt: "desc" },
      });

      return tracking;
    } catch (error) {
      logger.error("Error getting current location:", error);
      return null;
    }
  }

  /**
   * Calculate distance traveled for an assignment
   */
  static async calculateDistanceTraveled(
    assignmentId: string,
  ): Promise<number> {
    try {
      const points = await this.getLocationHistory(assignmentId, 1000);

      if (points.length < 2) return 0;

      let totalDistance = 0;

      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];

        // Haversine formula for distance calculation
        const distance = this.calculateHaversineDistance(
          p1.latitude,
          p1.longitude,
          p2.latitude,
          p2.longitude,
        );

        totalDistance += distance;
      }

      // Update assignment with total distance
      await prisma.deliveryAssignment.update({
        where: { id: assignmentId },
        data: { distanceTraveled: totalDistance },
      });

      return totalDistance;
    } catch (error) {
      logger.error("Error calculating distance:", error);
      return 0;
    }
  }

  /**
   * Calculate Haversine distance between two coordinates in km
   */
  private static calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Estimate ETA based on current location and delivery location
   */
  static async estimateETA(
    assignmentId: string,
    avgSpeedKmh: number = 20,
  ): Promise<Date | null> {
    try {
      const assignment = await prisma.deliveryAssignment.findUnique({
        where: { id: assignmentId },
      });

      if (!assignment) return null;

      const currentLocation = await this.getCurrentLocation(assignmentId);
      if (!currentLocation || !assignment.deliveryLocationJson) return null;

      const deliveryLocation = JSON.parse(assignment.deliveryLocationJson);

      // Calculate distance to destination
      const remainingDistance = this.calculateHaversineDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        deliveryLocation.lat,
        deliveryLocation.lng,
      );

      // Calculate time
      const hoursToDestination = remainingDistance / avgSpeedKmh;
      const minutesToDestination = hoursToDestination * 60;

      const eta = new Date();
      eta.setMinutes(eta.getMinutes() + minutesToDestination);

      return eta;
    } catch (error) {
      logger.error("Error estimating ETA:", error);
      return null;
    }
  }

  /**
   * Get route polyline for display on map
   */
  static async getRoutePolyline(assignmentId: string) {
    try {
      const tracking = await this.getLocationHistory(assignmentId, 1000);

      if (tracking.length === 0) return null;

      // Format as polyline points
      const points = tracking.map((t) => ({
        lat: t.latitude,
        lng: t.longitude,
        timestamp: t.createdAt,
      }));

      return points;
    } catch (error) {
      logger.error("Error getting route polyline:", error);
      return null;
    }
  }

  /**
   * Get last location for all active deliveries of a staff
   */
  static async getStaffCurrentLocations(deliveryStaffId: string) {
    try {
      const activeAssignments = await prisma.deliveryAssignment.findMany({
        where: {
          deliveryStaffId,
          deliveryStatus: { in: ["PICKED_UP", "IN_TRANSIT"] },
        },
        select: { id: true },
      });

      const locations = await Promise.all(
        activeAssignments.map(async (assignment) => {
          const location = await this.getCurrentLocation(assignment.id);
          return {
            assignmentId: assignment.id,
            location,
          };
        }),
      );

      return locations.filter((l) => l.location !== null);
    } catch (error) {
      logger.error("Error getting staff locations:", error);
      return [];
    }
  }

  /**
   * Check if delivery staff is near delivery location
   */
  static async isNearDeliveryLocation(
    assignmentId: string,
    distanceThresholdMeters: number = 1000,
  ): Promise<boolean> {
    try {
      const assignment = await prisma.deliveryAssignment.findUnique({
        where: { id: assignmentId },
      });

      if (!assignment || !assignment.deliveryLocationJson) return false;

      const currentLocation = await this.getCurrentLocation(assignmentId);
      if (!currentLocation) return false;

      const deliveryLocation = JSON.parse(assignment.deliveryLocationJson);

      const distance = this.calculateHaversineDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        deliveryLocation.lat,
        deliveryLocation.lng,
      );

      const distanceInMeters = distance * 1000;
      return distanceInMeters <= distanceThresholdMeters;
    } catch (error) {
      logger.error("Error checking proximity:", error);
      return false;
    }
  }
}

export default DeliveryTrackingService;
