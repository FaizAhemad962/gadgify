# Frontend UI Implementation Guide

## New Components Created

### 1. **ChangeRoleDialog**

📁 `frontend/src/components/admin/ChangeRoleDialog.tsx`

A dialog component for changing user roles.

**Props:**

```typescript
interface ChangeRoleDialogProps {
  open: boolean;
  userId: string;
  userName: string;
  currentRole: string;
  onClose: () => void;
  onSuccess?: () => void;
}
```

**Usage:**

```tsx
import ChangeRoleDialog from "@/components/admin/ChangeRoleDialog";

<ChangeRoleDialog
  open={isOpen}
  userId={userId}
  userName={userName}
  currentRole={userRole}
  onClose={() => setIsOpen(false)}
  onSuccess={() => refreshUsers()}
/>;
```

**Features:**

- ✅ Shows current role
- ✅ Dropdown to select new role
- ✅ Error handling
- ✅ Loading state
- ✅ Prevents assigning same role

---

### 2. **PendingOrderCard**

📁 `frontend/src/components/orders/PendingOrderCard.tsx`

Card component for displaying orders with payment status.

**Props:**

```typescript
interface OrderCardProps {
  orderId: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  onRetryPayment?: () => void;
}
```

**Usage:**

```tsx
import PendingOrderCard from "@/components/orders/PendingOrderCard";

<PendingOrderCard
  orderId={order.id}
  status={order.status}
  paymentStatus={order.paymentStatus}
  total={order.total}
  createdAt={order.createdAt}
/>;
```

**Features:**

- ✅ Shows order details (ID, total, status)
- ✅ Payment status badge with warning for pending
- ✅ **Retry Payment** button (for PENDING orders)
- ✅ **Cancel Order** button with confirmation
- ✅ Error handling for both actions
- ✅ Loading states
- ✅ i18n translations

---

### 3. **RoleManagementDashboard**

📁 `frontend/src/components/admin/RoleManagementDashboard.tsx`

Admin dashboard for managing user roles and permissions.

**Usage:**

```tsx
import RoleManagementDashboard from "@/components/admin/RoleManagementDashboard";

<RoleManagementDashboard />;
```

**Features:**

- ✅ **Grant Permission Section:** Table showing all granted permissions
- ✅ **User Management Table:** Shows all users with their roles
- ✅ **Change Role:** Edit button to change user roles
- ✅ **Grant Permission Dialog:** Form to grant role change permissions
- ✅ **Revoke Permission:** Delete button to revoke permissions
- ✅ Role color coding (USER: gray, STAFF: blue, ADMIN: orange, SUPER_ADMIN: red)
- ✅ Full i18n support

---

## API Hooks

### Order Management Hooks

📁 `frontend/src/api/orderAPI.ts`

```typescript
// Get all user orders
useOrders();

// Get specific order
useOrder(orderId);

// Create payment intent
useCreatePaymentIntent();

// Retry payment for pending order
useRetryPayment();

// Cancel pending order
useCancelOrder();

// Confirm payment after Razorpay
useConfirmPayment();
```

**Example Usage:**

```tsx
import { useRetryPayment, useCancelOrder } from "@/api/orderAPI";

const retryMutation = useRetryPayment();
const cancelMutation = useCancelOrder();

// Retry payment
try {
  const result = await retryMutation.mutateAsync(orderId);
  // Open Razorpay with result.data
} catch (error) {
  console.error(error);
}

// Cancel order
try {
  await cancelMutation.mutateAsync(orderId);
} catch (error) {
  console.error(error);
}
```

### Role Management Hooks

📁 `frontend/src/api/roleChangeAPI.ts`

```typescript
// Check if current user can change roles
useCheckRoleChangePermission();

// Get all role change permissions (admin only)
useRoleChangePermissions();

// Get permission for specific user
useUserRolePermission(userId);

// Grant role change permission (SUPER_ADMIN only)
useGrantRoleChangePermission();

// Revoke role change permission
useRevokeRoleChangePermission();

// Change user's role (ADMIN+)
useChangeUserRole();
```

**Example Usage:**

```tsx
import {
  useChangeUserRole,
  useCheckRoleChangePermission,
} from "@/api/roleChangeAPI";

const canChangeMutation = useChangeUserRole();
const { data: permission } = useCheckRoleChangePermission();

// Check if user has permission
if (permission?.data.canChangeRoles) {
  // User has role change permission
}

// Change role
try {
  await canChangeMutation.mutateAsync({
    userId: "user-123",
    role: "ADMIN",
  });
} catch (error) {
  console.error(error);
}
```

---

## Integration Examples

### Example 1: Update Orders Page with Retry/Cancel Options

**Current Structure:**

```
frontend/src/pages/OrdersPage.tsx
```

**Update to include:**

```tsx
import { useOrders } from "@/api/orderAPI";
import PendingOrderCard from "@/components/orders/PendingOrderCard";

export const OrdersPage: React.FC = () => {
  const { data: orders, isLoading, error } = useOrders();

  // Separate pending and completed orders
  const pendingOrders =
    orders?.filter((o) => o.paymentStatus === "PENDING") || [];
  const completedOrders =
    orders?.filter((o) => o.paymentStatus !== "PENDING") || [];

  return (
    <Container>
      {/* Pending Orders Section */}
      {pendingOrders.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6">
            Pending Payment ({pendingOrders.length})
          </Typography>
          {pendingOrders.map((order) => (
            <PendingOrderCard
              key={order.id}
              orderId={order.id}
              status={order.status}
              paymentStatus={order.paymentStatus}
              total={order.total}
              createdAt={order.createdAt}
            />
          ))}
        </Box>
      )}

      {/* Completed Orders Section */}
      {completedOrders.length > 0 && (
        <Box>
          <Typography variant="h6">Order History</Typography>
          {completedOrders.map((order) => (
            <PendingOrderCard {...order} />
          ))}
        </Box>
      )}
    </Container>
  );
};
```

---

### Example 2: Add Role Management Page

**Create New File:**

```
frontend/src/pages/admin/RoleManagementPage.tsx
```

```tsx
import React from "react";
import { Container } from "@mui/material";
import RoleManagementDashboard from "@/components/admin/RoleManagementDashboard";
import { useCheckRoleChangePermission } from "@/api/roleChangeAPI";

export const RoleManagementPage: React.FC = () => {
  const { data: permission, isLoading } = useCheckRoleChangePermission();

  if (isLoading) return <CircularProgress />;

  if (!permission?.data.canChangeRoles) {
    return (
      <Container>
        <Alert severity="error">
          You don't have permission to manage roles
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <RoleManagementDashboard />
    </Container>
  );
};
```

**Add Route:**

```tsx
// In your router configuration
{
  path: '/admin/roles',
  element: <RoleManagementPage />,
  requiredRole: 'ADMIN',
}
```

---

### Example 3: Add to Admin Sidebar

**Update Navigation:**

```tsx
import { Link as RouterLink } from "react-router-dom";
import { Security as SecurityIcon } from "@mui/icons-material";

const AdminMenuItem = (
  <ListItem to="/admin/roles" component={RouterLink}>
    <ListItemIcon>
      <SecurityIcon />
    </ListItemIcon>
    <ListItemText primary="Role Management" />
  </ListItem>
);
```

---

## i18n Translation Keys Required

Add these keys to your translation files:

```json
{
  "My Orders": "मेरे ऑर्डर",
  "Retry Payment": "भुगतान दोबारा करें",
  "Cancel Order": "ऑर्डर रद्द करें",
  "Payment Status": "भुगतान की स्थिति",
  "Pending Payment": "लंबित भुगतान",
  "Order History": "ऑर्डर का इतिहास",
  "Can retry payment or cancel this order": "भुगतान दोबारा कर सकते हैं या ऑर्डर रद्द कर सकते हैं",
  "Change User Role": "उपयोगकर्ता की भूमिका बदलें",
  "Current Role": "वर्तमान भूमिका",
  "New Role": "नई भूमिका",
  "Role & Permission Management": "भूमिका और अनुमति प्रबंधन",
  "Grant Role Change Permission": "भूमिका परिवर्तन अनुमति दें",
  "Grant Permission": "अनुमति दें",
  "No permissions granted yet": "अभी तक कोई अनुमति नहीं दी गई",
  "Can Remove Permission": "अनुमति हटा सकते हैं",
  "Revoke Permission": "अनुमति रद्द करें",
  "User Roles": "उपयोगकर्ता की भूमिकाएं"
}
```

---

## Styling & Theme

All components use MUI theme and support light/dark mode by default.

**Custom Theme Integration:**

```tsx
const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    error: { main: "#d32f2f" },
    warning: { main: "#f57c00" },
  },
});

// Wrap components with ThemeProvider
<ThemeProvider theme={theme}>
  <RoleManagementDashboard />
</ThemeProvider>;
```

---

## Error Handling

All components include built-in error handling:

- **API Errors:** Displayed in Alert components
- **Validation Errors:** Form validation messages
- **Loading States:** CircularProgress spinners
- **Confirmation Dialogs:** Before destructive actions

---

## Testing Checklist

- [ ] Retry payment opens Razorpay modal
- [ ] Cancel order shows confirmation dialog
- [ ] Change role updates user immediately
- [ ] Grant permission displays in table
- [ ] Revoke permission removes from table
- [ ] Loading states shown during mutations
- [ ] Error messages display on failures
- [ ] i18n translations work correctly
- [ ] Responsive on mobile devices
- [ ] Colors and icons render properly

---

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

---

## Performance Considerations

1. **Query Caching:** React Query handles caching automatically
2. **Lazy Loading:** Use React.lazy() for admin pages
3. **Pagination:** Add for user lists with many records
4. **Virtual Lists:** For large order histories

---

## Future Enhancements

- [ ] Export orders to CSV
- [ ] Add order filters (date, status, amount)
- [ ] Bulk role assignment
- [ ] Role templates
- [ ] Activity audit log
- [ ] Permission matrix editor
