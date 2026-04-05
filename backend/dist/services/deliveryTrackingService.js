"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryTrackingService = void 0;
// backend/src/services/deliveryTrackingService.ts
const database_1 = __importDefault(require("../config/database"));
const logger_1 = require("../config/logger");
class DeliveryTrackingService {
    /**
     * Record GPS location update from delivery staff
     */
    static async updateLocation(assignmentId, deliveryStaffId, location) {
        try {
            // Verify assignment belongs to this staff
            const assignment = await database_1.default.deliveryAssignment.findUnique({
                where: { id: assignmentId },
            });
            if (!assignment || assignment.deliveryStaffId !== deliveryStaffId) {
                throw new Error("Unauthorized");
            }
            // Create tracking point
            const tracking = await database_1.default.deliveryTracking.create({
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
            await database_1.default.deliveryAssignment.update({
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
        }
        catch (error) {
            logger_1.logger.error("Error updating location:", error);
            throw error;
        }
    }
    /**
     * Get location history for an assignment
     */
    static async getLocationHistory(assignmentId, limit = 100) {
        try {
            const tracking = await database_1.default.deliveryTracking.findMany({
                where: { assignmentId },
                orderBy: { createdAt: "desc" },
                take: limit,
            });
            return tracking.reverse(); // Return in chronological order for map
        }
        catch (error) {
            logger_1.logger.error("Error getting location history:", error);
            return [];
        }
    }
    /**
     * Get current location of delivery staff
     */
    static async getCurrentLocation(assignmentId) {
        try {
            const tracking = await database_1.default.deliveryTracking.findFirst({
                where: { assignmentId },
                orderBy: { createdAt: "desc" },
            });
            return tracking;
        }
        catch (error) {
            logger_1.logger.error("Error getting current location:", error);
            return null;
        }
    }
    /**
     * Calculate distance traveled for an assignment
     */
    static async calculateDistanceTraveled(assignmentId) {
        try {
            const points = await this.getLocationHistory(assignmentId, 1000);
            if (points.length < 2)
                return 0;
            let totalDistance = 0;
            for (let i = 0; i < points.length - 1; i++) {
                const p1 = points[i];
                const p2 = points[i + 1];
                // Haversine formula for distance calculation
                const distance = this.calculateHaversineDistance(p1.latitude, p1.longitude, p2.latitude, p2.longitude);
                totalDistance += distance;
            }
            // Update assignment with total distance
            await database_1.default.deliveryAssignment.update({
                where: { id: assignmentId },
                data: { distanceTraveled: totalDistance },
            });
            return totalDistance;
        }
        catch (error) {
            logger_1.logger.error("Error calculating distance:", error);
            return 0;
        }
    }
    /**
     * Calculate Haversine distance between two coordinates in km
     */
    static calculateHaversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) *
                Math.cos(this.toRad(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    static toRad(degrees) {
        return (degrees * Math.PI) / 180;
    }
    /**
     * Estimate ETA based on current location and delivery location
     */
    static async estimateETA(assignmentId, avgSpeedKmh = 20) {
        try {
            const assignment = await database_1.default.deliveryAssignment.findUnique({
                where: { id: assignmentId },
            });
            if (!assignment)
                return null;
            const currentLocation = await this.getCurrentLocation(assignmentId);
            if (!currentLocation || !assignment.deliveryLocationJson)
                return null;
            const deliveryLocation = JSON.parse(assignment.deliveryLocationJson);
            // Calculate distance to destination
            const remainingDistance = this.calculateHaversineDistance(currentLocation.latitude, currentLocation.longitude, deliveryLocation.lat, deliveryLocation.lng);
            // Calculate time
            const hoursToDestination = remainingDistance / avgSpeedKmh;
            const minutesToDestination = hoursToDestination * 60;
            const eta = new Date();
            eta.setMinutes(eta.getMinutes() + minutesToDestination);
            return eta;
        }
        catch (error) {
            logger_1.logger.error("Error estimating ETA:", error);
            return null;
        }
    }
    /**
     * Get route polyline for display on map
     */
    static async getRoutePolyline(assignmentId) {
        try {
            const tracking = await this.getLocationHistory(assignmentId, 1000);
            if (tracking.length === 0)
                return null;
            // Format as polyline points
            const points = tracking.map((t) => ({
                lat: t.latitude,
                lng: t.longitude,
                timestamp: t.createdAt,
            }));
            return points;
        }
        catch (error) {
            logger_1.logger.error("Error getting route polyline:", error);
            return null;
        }
    }
    /**
     * Get last location for all active deliveries of a staff
     */
    static async getStaffCurrentLocations(deliveryStaffId) {
        try {
            const activeAssignments = await database_1.default.deliveryAssignment.findMany({
                where: {
                    deliveryStaffId,
                    deliveryStatus: { in: ["PICKED_UP", "IN_TRANSIT"] },
                },
                select: { id: true },
            });
            const locations = await Promise.all(activeAssignments.map(async (assignment) => {
                const location = await this.getCurrentLocation(assignment.id);
                return {
                    assignmentId: assignment.id,
                    location,
                };
            }));
            return locations.filter((l) => l.location !== null);
        }
        catch (error) {
            logger_1.logger.error("Error getting staff locations:", error);
            return [];
        }
    }
    /**
     * Check if delivery staff is near delivery location
     */
    static async isNearDeliveryLocation(assignmentId, distanceThresholdMeters = 1000) {
        try {
            const assignment = await database_1.default.deliveryAssignment.findUnique({
                where: { id: assignmentId },
            });
            if (!assignment || !assignment.deliveryLocationJson)
                return false;
            const currentLocation = await this.getCurrentLocation(assignmentId);
            if (!currentLocation)
                return false;
            const deliveryLocation = JSON.parse(assignment.deliveryLocationJson);
            const distance = this.calculateHaversineDistance(currentLocation.latitude, currentLocation.longitude, deliveryLocation.lat, deliveryLocation.lng);
            const distanceInMeters = distance * 1000;
            return distanceInMeters <= distanceThresholdMeters;
        }
        catch (error) {
            logger_1.logger.error("Error checking proximity:", error);
            return false;
        }
    }
}
exports.DeliveryTrackingService = DeliveryTrackingService;
exports.default = DeliveryTrackingService;
