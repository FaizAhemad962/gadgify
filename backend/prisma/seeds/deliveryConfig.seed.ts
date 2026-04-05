// backend/prisma/seeds/deliveryConfig.seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedDeliveryConfiguration() {
  console.log("🚚 Seeding Delivery System Configuration...");

  // Define all delivery-related configuration
  const deliveryConfigs = [
    {
      key: "delivery_radius_km",
      value: "10",
      dataType: "number",
      description:
        "Maximum distance in km for auto-assigning deliveries to staff",
    },
    {
      key: "payment_per_delivery",
      value: "30",
      dataType: "number",
      description: "Base payment in INR per delivery",
    },
    {
      key: "bonus_threshold_deliveries",
      value: "50",
      dataType: "number",
      description: "Number of deliveries to unlock bonus",
    },
    {
      key: "bonus_per_50_deliveries",
      value: "200",
      dataType: "number",
      description: "Bonus amount in INR for every 50 deliveries",
    },
    {
      key: "on_time_bonus_multiplier",
      value: "1.5",
      dataType: "number",
      description: "Multiplier for on-time delivery bonuses (1.5x = 50% extra)",
    },
    {
      key: "cancellation_penalty_percent",
      value: "25",
      dataType: "number",
      description: "Percentage penalty for cancelling assigned delivery",
    },
    {
      key: "auto_assign_enabled",
      value: "true",
      dataType: "boolean",
      description: "Enable automatic order assignment to delivery staff",
    },
    {
      key: "auto_assign_max_distance_km",
      value: "5",
      dataType: "number",
      description: "Maximum distance for auto-assignment",
    },
    {
      key: "auto_assign_max_active_deliveries",
      value: "5",
      dataType: "number",
      description: "Maximum active deliveries per staff member",
    },
    {
      key: "delivery_eta_buffer_minutes",
      value: "15",
      dataType: "number",
      description: "Buffer time in minutes for ETA calculations",
    },
    {
      key: "minimum_delivery_rating",
      value: "3.5",
      dataType: "number",
      description: "Minimum average rating to stay active as delivery staff",
    },
    {
      key: "acceptance_timeout_seconds",
      value: "300",
      dataType: "number",
      description:
        "Seconds to wait before auto-reassigning if delivery staff does not accept",
    },
    {
      key: "allow_delivery_reassignment",
      value: "true",
      dataType: "boolean",
      description: "Allow reassignment of deliveries between staff",
    },
    {
      key: "notification_on_assignment",
      value: "true",
      dataType: "boolean",
      description: "Send notification when order is assigned",
    },
    {
      key: "notification_near_delivery",
      value: "1000",
      dataType: "number",
      description: "Notify customer when staff is within X meters",
    },
    {
      key: "avg_delivery_time_minutes",
      value: "40",
      dataType: "number",
      description: "Average expected delivery time in minutes",
    },
    {
      key: "max_failed_delivery_attempts",
      value: "3",
      dataType: "number",
      description: "Maximum failed delivery attempts before marking as failed",
    },
    {
      key: "delivery_rating_required_for_payout",
      value: "3",
      dataType: "number",
      description: "Minimum rating to process payout",
    },
  ];

  // Upsert each configuration
  for (const config of deliveryConfigs) {
    const existing = await prisma.businessConfiguration.findUnique({
      where: { key: config.key },
    });

    if (existing) {
      console.log(`  ✓ ${config.key} already exists (skipping)`);
    } else {
      await prisma.businessConfiguration.create({
        data: {
          ...config,
          isActive: true,
        } as any,
      });
      console.log(`  ✓ Created ${config.key}`);
    }
  }

  // Define feature flags for delivery features
  const deliveryFeatures = [
    {
      name: "DELIVERY_TRACKING_ENABLED",
      description: "Enable real-time delivery tracking for customers",
      isEnabled: true,
    },
    {
      name: "AUTO_ASSIGNMENT_ENABLED",
      description: "Enable automatic order assignment to delivery staff",
      isEnabled: true,
    },
    {
      name: "DELIVERY_LIVE_MAP",
      description: "Show live map to customer during delivery",
      isEnabled: true,
    },
    {
      name: "DELIVERY_RATING_ENABLED",
      description: "Allow customers to rate delivery staff",
      isEnabled: true,
    },
    {
      name: "DELIVERY_EARNINGS_VISIBLE",
      description: "Show earnings breakdown to delivery staff",
      isEnabled: true,
    },
    {
      name: "DELIVERY_PERFORMANCE_BONUS",
      description: "Enable bonus for on-time deliveries",
      isEnabled: true,
    },
  ];

  // Create feature flags
  for (const flag of deliveryFeatures) {
    const existing = await prisma.featureFlag.findUnique({
      where: { name: flag.name },
    });

    if (existing) {
      console.log(`  ✓ Feature flag ${flag.name} already exists (skipping)`);
    } else {
      await prisma.featureFlag.create({
        data: {
          ...flag,
          percentage: 100,
        } as any,
      });
      console.log(`  ✓ Created feature flag ${flag.name}`);
    }
  }

  console.log("✅ Delivery configuration seeded successfully!");
}

// Run if this file is executed directly
if (require.main === module) {
  seedDeliveryConfiguration()
    .catch((error) => {
      console.error("Error seeding delivery config:", error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
