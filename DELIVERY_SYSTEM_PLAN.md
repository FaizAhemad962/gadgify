# 🚚 Delivery Staff System - Full Development Plan

**Status**: Phase 2 - Full Featured Implementation  
**Scope**: Core functionality + analytics, reports, edge cases  
**Principle**: Zero hardcoding - all configuration in database

---

## 📋 Architecture Overview

### Database Models (Prisma)

```
User (role: DELIVERY_STAFF)
  ├── DeliveryAssignment[] (orders assigned to this staff)
  ├── DeliveryTracking[] (location updates)
  ├── DeliveryMetrics[] (performance stats)
  ├── PickupRequest[] (items to pick up)
  ├── DeliveryRating[] (ratings from customers)
  └── DeliveryEarnings[] (payment records)

Order
  ├── DeliveryAssignment (assigned staff)
  ├── DeliveryTracking[] (location history)
  └── DeliveryRating (customer satisfaction)

BusinessConfiguration (key-value store)
  ├── delivery_radius_km
  ├── payment_per_delivery
  ├── bonus_threshold_deliveries
  ├── cancellation_penalty_percent
  ├── auto_assign_enabled
  └── ... (all configurable)
```

### Core Features

#### 1. **Order Assignment** (Backend)

- ✅ Manual assignment by ADMIN/SUPER_ADMIN
- ✅ Auto-assignment based on:
  - Delivery staff location
  - Order delivery location proximity
  - Current load (# of active deliveries)
  - Availability status (Online/Offline)
- ✅ Batch assignment for multiple orders
- ✅ Reassignment if staff cancels

#### 2. **Real-Time Tracking** (Frontend + Backend)

- ✅ Continuous GPS location updates
- ✅ Live map for customer
- ✅ Delivery staff route optimization
- ✅ ETA calculation
- ✅ Distance remaining

#### 3. **Delivery Staff Dashboard** (Frontend)

- ✅ Active deliveries (map view + list)
- ✅ Pending orders to accept/reject
- ✅ Completed deliveries today
- ✅ Today's earnings
- ✅ Performance metrics
- ✅ Rating & feedback from customers

#### 4. **Performance Metrics & Analytics**

- ✅ On-time delivery rate
- ✅ Customer ratings distribution
- ✅ Earnings breakdown (by delivery type, bonus, etc.)
- ✅ Hours worked, deliveries per hour
- ✅ Peak performance times
- ✅ Cancellation reasons

#### 5. **Admin Controls**

- ✅ Assign/unassign orders to delivery staff
- ✅ View all deliveries (map, list, filter)
- ✅ Performance analytics by staff
- ✅ Adjust delivery wage/bonus
- ✅ Manage delivery areas/zones

---

## 🗄️ Database Schema

### Model 1: DeliveryAssignment

```prisma
model DeliveryAssignment {
  id                  String   @id @default(uuid())
  orderId             String   @unique
  deliveryStaffId     String

  # Status flow: ASSIGNED → ACCEPTED/REJECTED → PICKED_UP → IN_TRANSIT → DELIVERED
  assignmentStatus    String   @default("ASSIGNED") // ASSIGNED, ACCEPTED, REJECTED, CANCELLED
  deliveryStatus      String   @default("NOT_STARTED") // NOT_STARTED, PICKED_UP, IN_TRANSIT, DELIVERED, FAILED

  # Location
  pickupLocation      String?  // JSON: {lat, lng, address}
  deliveryLocation    String   // JSON: {lat, lng, address}
  actualPickupLocation String? // Staff's actual location when picking up

  # Timing
  assignedAt          DateTime @default(now())
  acceptedAt          DateTime?
  rejectedAt          DateTime?
  collectedAt         DateTime? // When staff picked up from warehouse
  pickupAt            DateTime? // When staff picked up from customer location (returns)
  deliveryAt          DateTime? // When customer received
  expectedDeliveryAt  DateTime?
  actualDeliveryAt    DateTime?

  # Tracking
  lastLocation        String?  // JSON: {lat, lng, timestamp}
  route               String?  // JSON array of location points for map
  distanceTraveled    Float    @default(0) // in km

  # Reason for status
  cancellationReason  String?
  failureReason       String?
  deliveryNote        String?

  # Metadata
  attempts            Int      @default(1)
  deliveryAttempts    Int      @default(0)

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  order               Order    @relation(fields: [orderId], references: [id], onDelete: Restrict)
  deliveryStaff       User     @relation(fields: [deliveryStaffId], references: [id], onDelete: Restrict)

  @@map("delivery_assignments")
  @@index([deliveryStaffId])
  @@index([deliveryStatus])
  @@index([assignmentStatus])
  @@index([createdAt])
}
```

### Model 2: DeliveryTracking

```prisma
model DeliveryTracking {
  id                  String   @id @default(uuid())
  assignmentId        String
  deliveryStaffId     String

  # Location
  latitude            Float
  longitude           Float
  accuracy            Float?   // GPS accuracy in meters
  altitude            Float?

  # Speed and bearing
  speed               Float?   // in km/h
  bearing             Float?   // compass direction 0-360

  # Metadata
  source              String   @default("GPS") // GPS, CELLULAR, etc.
  isMoving            Boolean  @default(false)

  createdAt           DateTime @default(now())

  assignment          DeliveryAssignment @relation(fields: [assignmentId], references: [id], onDelete: Cascade)
  deliveryStaff       User     @relation(fields: [deliveryStaffId], references: [id], onDelete: Cascade)

  @@map("delivery_tracking")
  @@index([assignmentId])
  @@index([deliveryStaffId])
  @@index([createdAt])
  @@index([latitude, longitude])
}
```

### Model 3: DeliveryMetrics

```prisma
model DeliveryMetrics {
  id                      String   @id @default(uuid())
  deliveryStaffId         String   @unique

  # Today's metrics (reset daily)
  todayDeliveries         Int      @default(0)
  todayEarnings           Float    @default(0)
  todayHoursActive        Float    @default(0)
  todayDistance           Float    @default(0) // in km

  # Overall metrics
  totalDeliveries         Int      @default(0)
  totalEarnings           Float    @default(0)
  totalDistance           Float    @default(0)
  totalHoursActive        Float    @default(0)

  # Performance
  averageDeliveryTime     Int?     // in minutes
  onTimeDeliveryPercent   Float    @default(0) // 0-100
  cancellationRate        Float    @default(0) // 0-100

  # Ratings
  averageRating           Float    @default(0) // 1-5
  totalRatings            Int      @default(0)
  ratingDistribution      String?  // JSON: {5: count, 4: count, ...}

  # Availability
  isOnline                Boolean  @default(false)
  lastOnlineAt            DateTime?
  lastOfflineAt           DateTime?

  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt

  deliveryStaff           User     @relation(fields: [deliveryStaffId], references: [id], onDelete: Cascade)

  @@map("delivery_metrics")
  @@index([deliveryStaffId])
  @@index([onTimeDeliveryPercent])
  @@index([averageRating])
}
```

### Model 4: DeliveryEarnings

```prisma
model DeliveryEarnings {
  id                  String   @id @default(uuid())
  deliveryStaffId     String
  assignmentId        String?

  # Earnings breakdown
  basePayment         Float
  bonusAmount         Float   @default(0)
  deductionAmount     Float   @default(0)
  totalAmount         Float

  # Bonus details
  bonusReason         String? // "EARLY_DELIVERY", "CUSTOMER_RATING", "VOLUME_BONUS"

  # Deduction details
  deductionReason     String? // "CANCELLATION", "LATE_DELIVERY", "CUSTOMER_COMPLAINT"
  deductionPercent    Float   @default(0)

  # Metadata
  date                DateTime @default(now()) // For daily settlements
  status              String   @default("PENDING") // PENDING, PROCESSED, PAID
  paidAt              DateTime?

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  deliveryStaff       User     @relation(fields: [deliveryStaffId], references: [id], onDelete: Cascade)
  assignment          DeliveryAssignment? @relation(fields: [assignmentId], references: [id], onDelete: SetNull)

  @@map("delivery_earnings")
  @@index([deliveryStaffId])
  @@index([date])
  @@index([status])
}
```

### Model 5: DeliveryRating

```prisma
model DeliveryRating {
  id                  String   @id @default(uuid())
  orderId             String   @unique
  deliveryStaffId     String
  customerId          String

  # Rating
  rating              Int      // 1-5 stars
  comment             String?

  # Feedback categories
  onTimeDelivery      Boolean? // Was delivery on time?
  packageCondition    Boolean? // Was package in good condition?
  staffBehavior       Boolean? // Was staff polite/professional?

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  deliveryStaff       User     @relation(fields: [deliveryStaffId], references: [id], onDelete: Cascade)
  order               Order    @relation(fields: [orderId], references: [id], onDelete: Restrict)
  customer            User     @relation("DeliveryRatings", fields: [customerId], references: [id], onDelete: Restrict)

  @@map("delivery_ratings")
  @@index([deliveryStaffId])
  @@index([customerId])
  @@index([createdAt])
}
```

**Need to update Order model:**

```prisma
model Order {
  // ... existing fields ...

  deliveryAssignment  DeliveryAssignment?
  deliveryRating      DeliveryRating?

  @@map("orders")
}
```

**Need to update User model:**

```prisma
model User {
  // ... existing fields ...

  # For delivery staff
  deliveryAssignments    DeliveryAssignment[]
  deliveryTracking       DeliveryTracking[]
  deliveryMetrics        DeliveryMetrics?
  deliveryEarnings       DeliveryEarnings[]
  deliveryRatings        DeliveryRating[]
  deliveryRatingsFrom    DeliveryRating[] @relation("DeliveryRatings")

  @@map("users")
}
```

---

## 🔧 Business Configuration (Database-Driven - No Hardcoding!)

These go into `BusinessConfiguration` table:

```json
{
  "delivery_radius_km": 10,
  "payment_per_delivery": 30,
  "bonus_threshold_deliveries": 50,
  "bonus_per_50_deliveries": 200,
  "on_time_bonus_multiplier": 1.5,
  "cancellation_penalty_percent": 25,
  "auto_assign_enabled": true,
  "auto_assign_max_distance_km": 5,
  "auto_assign_max_active_deliveries": 5,
  "delivery_eta_buffer_minutes": 15,
  "minimum_delivery_rating": 3.5,
  "acceptance_timeout_seconds": 300,
  "allow_delivery_reassignment": true,
  "notification_on_assignment": true,
  "notification_near_delivery": 1000 // in meters
}
```

---

## 📦 API Routes

### Order Assignment (Admin)

```
POST   /api/admin/delivery/assign           // Assign order to staff
POST   /api/admin/delivery/batch-assign     // Assign multiple orders
POST   /api/admin/delivery/reassign         // Reassign order to different staff
GET    /api/admin/delivery/assignments      // List all assignments
GET    /api/admin/delivery/assignments/:id  // Assignment details
DELETE /api/admin/delivery/assignments/:id  // Cancel assignment
```

### Delivery Staff (Mobile/Dashboard)

```
GET    /api/delivery/dashboard              // Staff dashboard stats
GET    /api/delivery/active-orders          // Staff's active deliveries
GET    /api/delivery/orders/:id             // Order details
POST   /api/delivery/orders/:id/accept      // Accept delivery
POST   /api/delivery/orders/:id/reject      // Reject delivery
POST   /api/delivery/location               // Update GPS location
GET    /api/delivery/location/history       // Location history
POST   /api/delivery/pickup                 // Mark as picked up
POST   /api/delivery/delivered              // Mark as delivered
POST   /api/delivery/failed                 // Mark delivery failed
GET    /api/delivery/earnings/today         // Today's earnings
GET    /api/delivery/earnings/monthly       // Monthly earnings
GET    /api/delivery/metrics                // Performance metrics
POST   /api/delivery/status/online          // Go online
POST   /api/delivery/status/offline         // Go offline
```

### Customer (Tracking)

```
GET    /api/orders/:id/tracking             // Track delivery (live)
GET    /api/orders/:id/delivery-staff       // Get assigned staff info
POST   /api/orders/:id/rating               // Rate delivery & staff
```

### Analytics (Admin)

```
GET    /api/admin/analytics/delivery/overview    // All delivery stats
GET    /api/admin/analytics/delivery/by-staff    // Performance by staff
GET    /api/admin/analytics/delivery/heatmap     // Delivery density map
GET    /api/admin/analytics/delivery/reports     // Detailed reports
```

---

## 🎨 Frontend Components

### Delivery Staff Dashboard

```
src/pages/delivery/DeliveryDashboard.tsx
├── HeaderStats (today deliveries, earnings, rating)
├── ActiveDeliveries (map view + list)
├── PendingOrders (to accept/reject)
├── TodayHistory (completed deliveries)
└── PerformanceChart (graphs)
```

### Real-Time Tracking Map

```
src/components/delivery/DeliveryMap.tsx
├── GoogleMaps Integration
├── Delivery staff marker (animated)
├── Order location pin
├── Route polyline
├── ETA display
└── Live updates (WebSocket or polling)
```

### Order Acceptance UI

```
src/components/delivery/OrderAcceptance.tsx
├── Order details
├── Delivery address
├── Customer info
├── Time estimates
├── [Accept] [Reject] buttons
```

### Metrics & Earnings

```
src/pages/delivery/DeliveryMetrics.tsx
├── Today's earnings breakdown
├── Monthly earnings
├── On-time delivery rate
├── Customer ratings distribution
├── Peak hours analysis
```

### Admin Delivery Management

```
src/pages/admin/DeliveryManagement.tsx
├── All deliveries (map + list)
├── Staff availability status
├── Bulk assignment UI
├── Performance analytics
├── Settings (configuration)
```

---

## 🔄 Implementation Phases

### Phase 1: Core Data Models & API (Week 1)

- [ ] Create Prisma migrations
- [ ] Create DeliveryAssignment, DeliveryTracking, DeliveryMetrics models
- [ ] Create BusinessConfiguration entries
- [ ] Build basic assignment API
- [ ] Update Order & User models

### Phase 2: Backend Services (Week 2)

- [ ] DeliveryAssignmentService (manual + auto-assign)
- [ ] DeliveryTrackingService (location handling)
- [ ] DeliveryMetricsService (stats calculation)
- [ ] DeliveryEarningsService (payment calculation)
- [ ] All routes & controllers

### Phase 3: Delivery Staff Dashboard (Week 2.5)

- [ ] Dashboard page UI
- [ ] Active orders display
- [ ] Order acceptance UI
- [ ] Accept/reject functionality
- [ ] Location tracking integration

### Phase 4: Real-Time Tracking (Week 3)

- [ ] GPS location update API
- [ ] Map component with live updates
- [ ] Customer tracking page
- [ ] Estimated arrival time (ETA)
- [ ] WebSocket for real-time positions

### Phase 5: Metrics & Analytics (Week 3.5)

- [ ] Performance metrics calculation
- [ ] Rating system implementation
- [ ] Admin analytics dashboard
- [ ] Staff performance reports
- [ ] Earnings breakdown

### Phase 6: Quality & Polish (Week 4)

- [ ] End-to-end testing
- [ ] Edge case handling
- [ ] Push notifications
- [ ] Error handling & retry logic
- [ ] Performance optimization

---

## ✅ Checklist

**Schema & Config**

- [ ] Add 5 new Prisma models
- [ ] Create migrations
- [ ] Add 15+ BusinessConfiguration entries
- [ ] Update Order & User relations

**Backend Services**

- [ ] AssignmentService (13 methods)
- [ ] TrackingService (8 methods)
- [ ] MetricsService (10 methods)
- [ ] EarningsService (6 methods)

**API Endpoints**

- [ ] 12 admin assignment routes
- [ ] 12 delivery staff routes
- [ ] 3 customer tracking routes
- [ ] 4 analytics routes

**Frontend**

- [ ] Delivery Dashboard
- [ ] Real-time map
- [ ] Order acceptance UI
- [ ] Metrics page
- [ ] Admin management page

**Features**

- [ ] Manual order assignment
- [ ] Auto-assignment algorithm
- [ ] Real-time GPS tracking
- [ ] Performance metrics
- [ ] Rating system
- [ ] Payment calculation

---

## 🎯 Success Criteria

✅ **Functional**

- Delivery staff can see assigned orders
- Real-time location tracking works
- Performance metrics calculate correctly
- Earnings breakdown is accurate
- Customers can rate delivery

✅ **Scalable**

- Supports 1000+ delivery staff
- Real-time updates fast (<500ms)
- Database queries optimized with indexes
- No hardcoded values (all in config)

✅ **Maintainable**

- Clean service/controller separation
- Clear error handling
- Comprehensive logging
- Configuration-driven design

---

## 🚀 Next: Ready to Build!

Start with **Phase 1: Database Models & Configuration**

Let's begin! 🎉
