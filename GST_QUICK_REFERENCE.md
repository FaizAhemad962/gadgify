# 🧮 GST Calculation Quick Reference

## The Rule
**GST Amount = (Base Price × GST %) / 100**  
**Final Price = Base Price + GST Amount**

---

## Examples

### Example 1: iPhone 14
```
Base Price:    ₹69,999
GST %:         18
GST Amount:    ₹69,999 × 18% = ₹12,599.82
Final Price:   ₹69,999 + ₹12,599.82 = ₹82,598.82
```

### Example 2: Headphones
```
Base Price:    ₹5,000
GST %:         18
GST Amount:    ₹5,000 × 18% = ₹900
Final Price:   ₹5,000 + ₹900 = ₹5,900
```

### Example 3: 2 Items in Cart
```
Item 1: ₹1,000 × 2 = ₹2,000 (Qty: 2)
Item 2: ₹500 × 1 = ₹500 (Qty: 1)

Subtotal:      ₹2,500
GST (18%):     ₹450
Final Total:   ₹2,950
```

---

## Code Usage

### Import
```typescript
import { calculateGST, formatPrice } from '@/utils/gstCalculator'
```

### Single Item
```typescript
const gst = calculateGST(5000, 18)
console.log(gst.gstAmount)    // 900
console.log(gst.finalPrice)   // 5900
console.log(formatPrice(gst.finalPrice)) // "₹5,900.00"
```

### Multiple Items
```typescript
const subtotal = product.price * quantity
const gst = calculateGST(subtotal, product.gstPercentage)
console.log(gst.finalPrice) // Total with GST
```

### Invoice Generation
```typescript
const invoice = generateInvoiceBreakdown(5000, 18, 2)
// invoice = {
//   itemPrice: 5000,
//   quantity: 2,
//   subtotal: 10000,
//   gstAmount: 1800,
//   total: 11800
// }
```

---

## HSN Code Reference

| HSN Code | Product | Standard GST |
|----------|---------|--------------|
| 8517.62  | Mobile Phones | 18% |
| 8471     | Computers | 12% |
| 8528     | Monitors | 18% |
| 8544     | Cables | 18% |
| 8504     | Power Adapters | 18% |
| 8509     | Vacuum Cleaners | 18% |
| 8516     | Electric Heaters | 18% |

---

## Database Schema
```sql
-- Product table (CORRECT)
CREATE TABLE products (
  id UUID PRIMARY KEY,
  price FLOAT NOT NULL,           -- Base price
  hsnNo VARCHAR(20),              -- HSN code
  gstPercentage FLOAT,            -- Tax rate (0-100)
  -- NO gstPrice column ✓
);

-- Order Items (Keep GST for records)
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  productId UUID,
  quantity INT,
  price FLOAT,                    -- Price at time of order
  gstPercentage FLOAT,            -- GST rate at time
  gstAmount FLOAT,                -- Calculated GST
  total FLOAT                     -- Price + GST
);
```

---

## Admin Form UI

```
Price Input:              [1000] ₹
HSN Code Input:           [8517.62]
GST % Input:              [18] %

┌──────────────────────────────────┐
│ 💰 Tax Calculation (Read-Only)   │
│ Base Price:    ₹1,000.00        │
│ GST (18%):     ₹180.00          │
│ Final Price:   ₹1,180.00        │
└──────────────────────────────────┘
```

---

## Files with GST Logic

| File | Purpose | What It Does |
|------|---------|--------------|
| `gstCalculator.ts` | Utilities | Calculate, format, generate breakdowns |
| `AdminProducts.tsx` | Admin Form | Show read-only calculated values |
| `ProductsPage.tsx` | Display | Calculate & show final price to users |
| `CartPage.tsx` | Cart | Calculate GST per item and total |
| `CheckoutPage.tsx` | Payment | Show GST breakdown before payment |

---

## Common Mistakes ❌ vs ✅

### ❌ Wrong: Storing GST Amount
```typescript
// DON'T DO THIS
const product = {
  price: 1000,
  gstPrice: 180  // ❌ Hard-coded, causes audit issues
}
```

### ✅ Correct: Calculate Dynamically
```typescript
// DO THIS
const gst = calculateGST(product.price, product.gstPercentage)
const gstAmount = gst.gstAmount  // 180 (calculated)
const finalPrice = gst.finalPrice // 1180 (calculated)
```

---

## Testing Quick Checks

- [ ] Admin form: GST % field is editable
- [ ] Admin form: GST Amount field is read-only
- [ ] Admin form: Final Price field is read-only
- [ ] Values update when price/GST % changes
- [ ] Create product: Works without gstPrice
- [ ] Edit product: Works without gstPrice
- [ ] Cart: Shows GST breakdown per item
- [ ] Checkout: Shows total with GST

---

**Remember:** GST is ALWAYS calculated, NEVER stored (except in orders for history).
