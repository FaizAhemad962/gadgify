# Payment System & Role Management - Implementation Guide

## Critical Fix: Payment Pending Order Bug

### Problem

Previously, when users clicked checkout and filled payment details but didn't complete the payment, the product stock was decremented immediately. This caused:

- Stock loss for uncompleted orders
- Users couldn't retry payments on the same order
- No way to cancel pending orders

### Solution

**Stock is now decremented ONLY when payment is confirmed**, not when the order is created.

#### Order Creation Flow (No Stock Decrement)

1. User creates order → Order created with `paymentStatus: PENDING`
2. Stock remains unchanged
3. Cart is cleared (user can recreate cart items)

#### Payment Confirmation Flow (Stock Decrement)

1. User confirms payment → Razorpay signature verified
2. Order updated with `paymentStatus: COMPLETED`
3. **Stock is decremented at this point**
4. Low stock alerts sent to admin

---

## New Order Management Endpoints

### 1. **Create Order**

```
POST /api/orders
Body: {
  items: [...],
  subtotal: number,
  shipping: number,
  total: number,
  shippingAddress: {...},
  couponCode?: string
}
Response: Order with paymentStatus: PENDING
```

**Note**: Stock is NOT decremented yet

---

### 2. **Retry Payment** ⭐ NEW

```
POST /api/orders/:orderId/retry-payment
Response: {
  success: true,
  razorpayOrderId: string,
  amount: number,
  keyId: string,
  orderId: string
}
```

**Use Case**: User can retry payment if their previous attempt failed

- Only works for orders with `paymentStatus: PENDING`
- User must own the order (or be ADMIN)
- New Razorpay order is created for retry

---

### 3. **Cancel Pending Order** ⭐ NEW

```
DELETE /api/orders/:orderId/cancel
Response: {
  success: true,
  message: "Order cancelled successfully",
  data: order
}
```

**Use Case**: User can cancel pending orders

- Only works for orders with `paymentStatus: PENDING`
- No stock restoration needed (never decremented)
- Order status changed to CANCELLED

---

### 4. **Confirm Payment** (Updated)

```
POST /api/orders/:orderId/confirm-payment
Body: {
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
}
Response: Order with paymentStatus: COMPLETED
```

**What Changed**:

- ✅ Signature verification (same)
- ✅ Order status updated to PROCESSING
- ✅ **Stock is NOW decremented** (NEW)
- ✅ Low stock alerts sent (NEW)
- ✅ Payment success email sent

---

## Order Statuses

| Status     | Payment Status | Stock Impact | Meaning                       |
| ---------- | -------------- | ------------ | ----------------------------- |
| PENDING    | PENDING        | No change    | Created, awaiting payment     |
| CANCELLED  | CANCELLED      | No change    | User cancelled without paying |
| PROCESSING | COMPLETED      | Stock ↓      | Payment confirmed, processing |
| SHIPPED    | COMPLETED      | Stock ↓      | Order shipped                 |
| DELIVERED  | COMPLETED      | Stock ↓      | Order delivered               |

---

## Role Management System

### Role Hierarchy

```
Level 0: USER
         ├─ Regular customer
         └─ Can view own orders & payments

Level 1: SUPPORT_STAFF / DELIVERY_STAFF
         ├─ SUPPORT_STAFF: Customer support (can update order status)
         ├─ DELIVERY_STAFF: Handle deliveries
         └─ Can view assigned orders

Level 2: ADMIN
         ├─ Can manage products, users, orders
         ├─ Can assign SUPPORT_STAFF & DELIVERY_STAFF roles
         ├─ Can grant role change permissions
         └─ Cannot create other ADMINs

Level 3: SUPER_ADMIN
         ├─ Full system control
         ├─ Can create/manage ADMIN accounts
         ├─ Can grant role change permissions
         └─ Only account = Owner
```

### Role Creation Rules

| Current Role   | Can Assign                          | Cannot Assign      |
| -------------- | ----------------------------------- | ------------------ |
| USER           | -                                   | Any role           |
| SUPPORT_STAFF  | -                                   | Any role           |
| DELIVERY_STAFF | -                                   | Any role           |
| ADMIN          | USER, SUPPORT_STAFF, DELIVERY_STAFF | ADMIN, SUPER_ADMIN |
| SUPER_ADMIN    | Any role                            | -                  |

---

## Role Management Endpoints

### 1. **Grant Role Change Permission**

```
POST /api/role-change/grant
Body: {
  email: string,
  canRemovePermission?: boolean
}
```

- Only SUPER_ADMIN can grant
- Gives permission to user to change other users' roles

### 2. **Revoke Role Change Permission**

```
DELETE /api/role-change/revoke/:userId
```

- SUPER_ADMIN or ADMIN can revoke
- User loses ability to change roles

### 3. **Change User Role**

```
PATCH /api/role-change/change-role/:userId
Body: {
  role: "USER" | "ADMIN" | "SUPER_ADMIN" | "DELIVERY_STAFF" | "SUPPORT_STAFF"
}
```

- Only ADMIN+ with permission can do this
- Cannot change own role
- Cannot assign role higher than own level

### 4. **Check Permission**

```
GET /api/role-change/check-permission
Response: {
  success: true,
  canChangeRoles: boolean
}
```

### 5. **Get All Permissions**

```
GET /api/role-change/permissions
```

- Only ADMIN+ can view all
- Shows all active role change permissions

### 6. **Get User Permission**

```
GET /api/role-change/permissions/:userId
```

- ADMIN+ can view any user
- Users can view own permission

---

## Frontend Integration Examples

### Example 1: Retry Failed Payment

```javascript
async function retryPayment(orderId) {
  try {
    const response = await fetch(`/api/orders/${orderId}/retry-payment`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    // Open Razorpay with new order
    const razorpay = new Razorpay({
      key_id: data.data.keyId,
      order_id: data.data.razorpayOrderId,
      amount: data.data.amount,
      // ... rest of config
    });

    razorpay.open();
  } catch (error) {
    console.error("Retry failed:", error);
  }
}
```

### Example 2: Cancel Pending Order

```javascript
async function cancelOrder(orderId) {
  try {
    const response = await fetch(`/api/orders/${orderId}/cancel`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    alert("Order cancelled successfully");
    // Refresh orders list
  } catch (error) {
    console.error("Cancel failed:", error);
  }
}
```

### Example 3: Assign Role (Admin)

```javascript
async function assignRole(userId, newRole) {
  try {
    const response = await fetch(`/api/role-change/change-role/${userId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role: newRole }),
    });

    const data = await response.json();
    alert(`User role changed to ${newRole}`);
  } catch (error) {
    console.error("Role change failed:", error);
  }
}
```

---

## Testing Checklist

- [ ] Create order → Stock should NOT decrease
- [ ] Cancel pending order → Stock should remain unchanged
- [ ] Retry payment → New Razorpay order created
- [ ] Confirm payment → Stock decrements, email sent
- [ ] SUPER_ADMIN can grant permissions
- [ ] ADMIN cannot grant permissions
- [ ] SUPER_ADMIN can create ADMIN accounts
- [ ] ADMIN cannot create ADMIN accounts
- [ ] User cannot change own role
- [ ] Role hierarchy is enforced

---

## Future Enhancements

- [ ] Google OAuth integration
- [ ] Automatic order cancellation after 24 hours if payment pending
- [ ] Partial order refunds
- [ ] Multiple delivery staff assignment
- [ ] Customer support ticket system
