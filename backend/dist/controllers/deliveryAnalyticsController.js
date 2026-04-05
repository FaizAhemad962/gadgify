"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDeliveryReport = exports.getDeliveryHeatmap = exports.getStaffPerformance = exports.getDeliveryOverview = void 0;
const database_1 = __importDefault(require("../config/database"));
const deliveryMetricsService_1 = require("../services/deliveryMetricsService");
/**
 * GET /api/delivery/admin/analytics/overview
 * Get comprehensive delivery analytics
 */
const getDeliveryOverview = async (req, res) => {
    try {
        const analytics = await deliveryMetricsService_1.DeliveryMetricsService.getPerformanceAnalytics();
        res.status(200).json({
            success: true,
            message: "Delivery overview retrieved",
            data: analytics,
        });
    }
    catch (error) {
        throw error;
    }
};
exports.getDeliveryOverview = getDeliveryOverview;
/**
 * GET /api/delivery/admin/analytics/by-staff
 * Get performance metrics broken down by staff member
 */
const getStaffPerformance = async (req, res) => {
    try {
        const { staffId } = req.query;
        if (staffId) {
            const metrics = await deliveryMetricsService_1.DeliveryMetricsService.getMetrics(staffId);
            return res.status(200).json({
                success: true,
                message: "Staff performance retrieved",
                data: metrics,
            });
        }
        // Get all staff analytics
        const allAnalytics = await deliveryMetricsService_1.DeliveryMetricsService.getPerformanceAnalytics();
        res.status(200).json({
            success: true,
            message: "Staff performance retrieved",
            data: allAnalytics,
        });
    }
    catch (error) {
        throw error;
    }
};
exports.getStaffPerformance = getStaffPerformance;
/**
 * GET /api/delivery/admin/analytics/heatmap
 * Get delivery density heatmap data
 */
const getDeliveryHeatmap = async (req, res) => {
    try {
        // Get all completed deliveries
        const trackings = await database_1.default.deliveryTracking.findMany({
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
        const heatmapData = [];
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
    }
    catch (error) {
        throw error;
    }
};
exports.getDeliveryHeatmap = getDeliveryHeatmap;
/**
 * GET /api/delivery/admin/analytics/reports
 * Generate detailed delivery reports
 */
const generateDeliveryReport = async (req, res) => {
    try {
        const { format = "JSON" } = req.query;
        const analytics = await deliveryMetricsService_1.DeliveryMetricsService.getPerformanceAnalytics();
        if (format === "CSV") {
            const csv = convertToCSV(analytics);
            res.setHeader("Content-Type", "text/csv");
            res.setHeader("Content-Disposition", `attachment; filename="delivery-report-${Date.now()}.csv"`);
            res.send(csv);
            return;
        }
        res.status(200).json({
            success: true,
            message: "Report generated",
            data: analytics,
        });
    }
    catch (error) {
        throw error;
    }
};
exports.generateDeliveryReport = generateDeliveryReport;
/**
 * Helper function to convert data to CSV format
 */
function convertToCSV(data) {
    const rows = [];
    rows.push("Delivery Analytics Report");
    rows.push(`Generated: ${new Date().toISOString()}`);
    rows.push("");
    rows.push("Summary Statistics");
    rows.push(`Total Deliveries,${data.totalDeliveries || 0}`);
    rows.push(`Completed Deliveries,${data.completedDeliveries || 0}`);
    rows.push(`Failed Deliveries,${data.failedDeliveries || 0}`);
    return rows.join("\n");
}
