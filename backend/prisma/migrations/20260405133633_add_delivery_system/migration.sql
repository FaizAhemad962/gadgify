/*
  Warnings:

  - A unique constraint covering the columns `[email,role]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "users_email_key";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "accountName" TEXT;

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "email" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_assignments" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "deliveryStaffId" TEXT NOT NULL,
    "assignmentStatus" TEXT NOT NULL DEFAULT 'ASSIGNED',
    "deliveryStatus" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "pickupLocationJson" TEXT,
    "deliveryLocationJson" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "collectedAt" TIMESTAMP(3),
    "deliveryAt" TIMESTAMP(3),
    "expectedDeliveryAt" TIMESTAMP(3),
    "lastLocationJson" TEXT,
    "distanceTraveled" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cancellationReason" TEXT,
    "failureReason" TEXT,
    "deliveryNote" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "deliveryAttempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_tracking" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "deliveryStaffId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "altitude" DOUBLE PRECISION,
    "speed" DOUBLE PRECISION,
    "bearing" DOUBLE PRECISION,
    "source" TEXT NOT NULL DEFAULT 'GPS',
    "isMoving" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delivery_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_metrics" (
    "id" TEXT NOT NULL,
    "deliveryStaffId" TEXT NOT NULL,
    "todayDeliveries" INTEGER NOT NULL DEFAULT 0,
    "todayEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "todayHoursActive" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "todayDistance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalDeliveries" INTEGER NOT NULL DEFAULT 0,
    "totalEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalDistance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalHoursActive" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageDeliveryTime" INTEGER,
    "onTimeDeliveryPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cancellationRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalRatings" INTEGER NOT NULL DEFAULT 0,
    "ratingDistributionJson" TEXT,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "lastOnlineAt" TIMESTAMP(3),
    "lastOfflineAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_earnings" (
    "id" TEXT NOT NULL,
    "deliveryStaffId" TEXT NOT NULL,
    "assignmentId" TEXT,
    "basePayment" DOUBLE PRECISION NOT NULL,
    "bonusAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deductionAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "bonusReason" TEXT,
    "deductionReason" TEXT,
    "deductionPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_earnings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_ratings" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "assignmentId" TEXT,
    "deliveryStaffId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "onTimeDelivery" BOOLEAN,
    "packageCondition" BOOLEAN,
    "staffBehavior" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_configurations" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "dataType" TEXT NOT NULL DEFAULT 'string',
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "business_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "percentage" INTEGER NOT NULL DEFAULT 100,
    "targetRolesJson" TEXT,
    "targetUsersJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "enabledAt" TIMESTAMP(3),
    "disabledAt" TIMESTAMP(3),

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_email_idx" ON "audit_logs"("email");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_assignments_orderId_key" ON "delivery_assignments"("orderId");

-- CreateIndex
CREATE INDEX "delivery_assignments_deliveryStaffId_idx" ON "delivery_assignments"("deliveryStaffId");

-- CreateIndex
CREATE INDEX "delivery_assignments_deliveryStatus_idx" ON "delivery_assignments"("deliveryStatus");

-- CreateIndex
CREATE INDEX "delivery_assignments_assignmentStatus_idx" ON "delivery_assignments"("assignmentStatus");

-- CreateIndex
CREATE INDEX "delivery_assignments_createdAt_idx" ON "delivery_assignments"("createdAt");

-- CreateIndex
CREATE INDEX "delivery_tracking_assignmentId_idx" ON "delivery_tracking"("assignmentId");

-- CreateIndex
CREATE INDEX "delivery_tracking_deliveryStaffId_idx" ON "delivery_tracking"("deliveryStaffId");

-- CreateIndex
CREATE INDEX "delivery_tracking_createdAt_idx" ON "delivery_tracking"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_metrics_deliveryStaffId_key" ON "delivery_metrics"("deliveryStaffId");

-- CreateIndex
CREATE INDEX "delivery_metrics_deliveryStaffId_idx" ON "delivery_metrics"("deliveryStaffId");

-- CreateIndex
CREATE INDEX "delivery_metrics_onTimeDeliveryPercent_idx" ON "delivery_metrics"("onTimeDeliveryPercent");

-- CreateIndex
CREATE INDEX "delivery_metrics_averageRating_idx" ON "delivery_metrics"("averageRating");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_earnings_assignmentId_key" ON "delivery_earnings"("assignmentId");

-- CreateIndex
CREATE INDEX "delivery_earnings_deliveryStaffId_idx" ON "delivery_earnings"("deliveryStaffId");

-- CreateIndex
CREATE INDEX "delivery_earnings_date_idx" ON "delivery_earnings"("date");

-- CreateIndex
CREATE INDEX "delivery_earnings_status_idx" ON "delivery_earnings"("status");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_ratings_orderId_key" ON "delivery_ratings"("orderId");

-- CreateIndex
CREATE INDEX "delivery_ratings_deliveryStaffId_idx" ON "delivery_ratings"("deliveryStaffId");

-- CreateIndex
CREATE INDEX "delivery_ratings_customerId_idx" ON "delivery_ratings"("customerId");

-- CreateIndex
CREATE INDEX "delivery_ratings_createdAt_idx" ON "delivery_ratings"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "business_configurations_key_key" ON "business_configurations"("key");

-- CreateIndex
CREATE INDEX "business_configurations_key_idx" ON "business_configurations"("key");

-- CreateIndex
CREATE INDEX "business_configurations_isActive_idx" ON "business_configurations"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_name_key" ON "feature_flags"("name");

-- CreateIndex
CREATE INDEX "feature_flags_name_idx" ON "feature_flags"("name");

-- CreateIndex
CREATE INDEX "feature_flags_isEnabled_idx" ON "feature_flags"("isEnabled");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_role_key" ON "users"("email", "role");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_assignments" ADD CONSTRAINT "delivery_assignments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_assignments" ADD CONSTRAINT "delivery_assignments_deliveryStaffId_fkey" FOREIGN KEY ("deliveryStaffId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_tracking" ADD CONSTRAINT "delivery_tracking_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "delivery_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_tracking" ADD CONSTRAINT "delivery_tracking_deliveryStaffId_fkey" FOREIGN KEY ("deliveryStaffId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_metrics" ADD CONSTRAINT "delivery_metrics_deliveryStaffId_fkey" FOREIGN KEY ("deliveryStaffId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_earnings" ADD CONSTRAINT "delivery_earnings_deliveryStaffId_fkey" FOREIGN KEY ("deliveryStaffId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_earnings" ADD CONSTRAINT "delivery_earnings_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "delivery_assignments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_ratings" ADD CONSTRAINT "delivery_ratings_deliveryStaffId_fkey" FOREIGN KEY ("deliveryStaffId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_ratings" ADD CONSTRAINT "delivery_ratings_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_ratings" ADD CONSTRAINT "delivery_ratings_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
