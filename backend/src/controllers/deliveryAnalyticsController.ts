import { Response } from "express";
import prisma from "../config/database";
import { AuthRequest } from "../middlewares/auth";
import { DeliveryMetricsService } from "../services/deliveryMetricsService";

/**
 * GET /api/delivery/admin/analytics/overview
 * Get comprehensive delivery analytics
 */
export const getDeliveryOverview = async (req: AuthRequest, res: Response) => {
  try {
    const analytics = await DeliveryMetricsService.getPerformanceAnalytics();

    res.status(200).json({
      success: true,
      message: "Delivery overview retrieved",
      data: analytics,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * GET /api/delivery/admin/analytics/by-staff
 * Get performance metrics broken down by staff member
 */
export const getStaffPerformance = async (req: AuthRequest, res: Response) => {
  try {
    const { staffId } = req.query;

    if (staffId) {
      const metrics = await DeliveryMetricsService.getMetrics(
        staffId as string,
      );
      return res.status(200).json({
        success: true,
        message: "Staff performance retrieved",
        data: metrics,
      });
    }

    // Get all staff analytics
    const allAnalytics = await DeliveryMetricsService.getPerformanceAnalytics();

    res.status(200).json({
      success: true,
      message: "Staff performance retrieved",
      data: allAnalytics,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * GET /api/delivery/admin/analytics/heatmap
 * Get delivery density heatmap data
 */
export const getDeliveryHeatmap = async (req: AuthRequest, res: Response) => {
  try {
    // Get all completed deliveries
    const trackings = await prisma.deliveryTracking.findMany({
      where: {
        createdAt: {
          gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      select: {
        latitude: true,
        longitude: true,
      },
    });

    // Simple grid clustering (Maharashtra bounds)
    const lat_min = 18.5;
    const lat_max = 22.5;
    const lon_min = 72.6;
    const lon_max = 78.0;
    const gridSize = 20;

    const lat_step = (lat_max - lat_min) / gridSize;
    const lon_step = (lon_max - lon_min) / gridSize;

    const heatmapData: any[] = [];

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const cellLat = lat_min + lat_step * i;
        const cellLon = lon_min + lon_step * j;

        const pointsInCell = trackings.filter((p) => {
          const dlat = Math.abs(p.latitude - cellLat);
          const dlon = Math.abs(p.longitude - cellLon);
          return dlat <= lat_step / 2 && dlon <= lon_step / 2;
        });

        if (pointsInCell.length > 0) {
          heatmapData.push({
            lat: cellLat,
            lon: cellLon,
            intensity: pointsInCell.length,
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      message: "Heatmap data retrieved",
      data: {
        bounds: { lat_min, lat_max, lon_min, lon_max },
        gridSize,
        heatmapData,
        totalPoints: trackings.length,
      },
    });
  } catch (error) {
    throw error;
  }
};

/**
 * GET /api/delivery/admin/analytics/reports
 * Generate detailed delivery reports
 */
export const generateDeliveryReport = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { format = "JSON" } = req.query;

    const analytics = await DeliveryMetricsService.getPerformanceAnalytics();

    if (format === "CSV") {
      const csv = convertToCSV(analytics);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="delivery-report-${Date.now()}.csv"`,
      );
      res.send(csv);
      return;
    }

    res.status(200).json({
      success: true,
      message: "Report generated",
      data: analytics,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Helper function to convert data to CSV format
 */
function convertToCSV(data: any): string {
  const rows: string[] = [];

  rows.push("Delivery Analytics Report");
  rows.push(`Generated: ${new Date().toISOString()}`);
  rows.push("");
  rows.push("Summary Statistics");
  rows.push(`Total Deliveries,${data.totalDeliveries || 0}`);
  rows.push(`Completed Deliveries,${data.completedDeliveries || 0}`);
  rows.push(`Failed Deliveries,${data.failedDeliveries || 0}`);

  return rows.join("\n");
}
