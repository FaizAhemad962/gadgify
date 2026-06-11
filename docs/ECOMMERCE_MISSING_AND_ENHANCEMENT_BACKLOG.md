# Ecommerce Missing And Enhancement Backlog

Date: 2026-06-11

This backlog is organized by launch priority. It focuses on functionality correctness, ecommerce completeness, and UX polish.

## Critical Before Production

### 1. Fix Localization Integrity

Problem: Locale JSON contains duplicate/conflicting keys such as `securePayment` and `securepayment`, and some text has corrupted encoding.

Impact: High. Translation tooling can fail, UI text can render incorrectly, and non-English UX looks unprofessional.

Recommended solution:
- Remove duplicate keys.
- Normalize all files to UTF-8.
- Add a locale validation script to CI.
- Add a shared currency formatter.

Example implementation:
```ts
export const formatCurrency = (value: number, locale = "en-IN") =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
```

### 2. Review CSRF For Cookie Authentication

Problem: The API uses httpOnly cookies and `withCredentials`, but CSRF protection comments indicate CSRF headers were removed.

Impact: Critical for production if mutation endpoints accept cookie-authenticated cross-site requests.

Recommended solution:
- Use SameSite cookie policy correctly.
- Add CSRF token for unsafe methods or prove SameSite/Lax/Strict coverage is sufficient for your deployment.
- Document the final decision in security docs.

### 3. Coupon Usage Should Finalize After Payment Success

Problem: Coupon `usedCount` is incremented during order creation, before Razorpay payment confirmation.

Impact: High. Failed/abandoned payments can consume coupon limits.

Recommended solution:
- Reserve coupon usage during pending payment with expiry, or increment only after payment confirmation.
- Release reservation on payment failure, cancellation, or timeout.

### 4. Remove Debug Logging From Production Paths

Problem: `console.log` remains in API client and backend controllers/routes.

Impact: Medium to High. Can leak sensitive operational details and pollute logs.

Recommended solution:
- Replace frontend console logs with user-safe error handling.
- Use structured backend logger with environment-aware log levels.

## High Priority

### 5. Add Delivery Serviceability Model

Problem: Checkout hard-blocks non-Maharashtra addresses.

Impact: High. This conflicts with broader accessibility goals and makes future expansion harder.

Recommended solution:
- Create serviceability rules by pincode/state/city.
- Use backend validation and frontend pincode checker.
- Show delivery ETA and unavailable messaging before checkout.

### 6. Add Customer Delivery Tracking UI

Problem: Backend delivery tracking routes exist, but customer-facing order detail does not fully surface tracking, assigned staff, ETA, or delivery updates.

Impact: High for ecommerce trust.

Recommended solution:
- Add a delivery tracking card to order detail.
- Show assigned staff, status, last update, ETA, and tracking timeline.
- Add delivery rating after delivered.

### 7. Replace Polling With Smarter Order Updates

Problem: Orders and order detail poll every 5 seconds.

Impact: Medium to High. This is simple but wasteful at scale.

Recommended solution:
- Use manual refresh plus background refetch every 30-60 seconds.
- Consider WebSocket/SSE later for order/payment/delivery events.

### 8. Complete Order Self-Service

Missing:
- Cancel order with reason.
- Return/refund request after delivery.
- Refund status.
- Support/contact action.
- Invoice history.

Recommended solution:
- Add order action model by status.
- Add backend return/refund records.
- Show policy summary on order detail.

### 9. Product Detail Ecommerce Completeness

Missing:
- Product highlights.
- Specs table.
- Warranty/return policy.
- Delivery pincode checker.
- Payment offers.
- Product FAQ.
- SEO structured data.

Recommended solution:
- Create reusable sections and feed from product data/admin fields.

## Medium Priority

### 10. URL-Synced Product Filters

Problem: Product filters are state-only.

Impact: Medium. Users cannot share filtered results, and browser navigation feels weaker.

Recommended solution:
- Sync search/filter/sort/page state into URL query params.

### 11. Standardize Admin CRUD UX

Problem: Admin pages mix data grids, plain tables, `window.confirm`, dialogs, and different controls.

Impact: Medium. Admin UX feels inconsistent and costs maintenance time.

Recommended solution:
- Use `AppDataGrid`, `CustomDialog`, `ConfirmDialog`, `CustomButton`, and shared form field components everywhere.

### 12. Product Media Workflow

Problem: Product media upload/removal can partially fail and is sequential.

Impact: Medium. Admin product management can leave orphaned media or stale previews.

Recommended solution:
- Upload files concurrently with progress.
- Save product only after all required media succeeds.
- Await and handle delete-media failures.

### 13. Profile As Account Center

Problem: Profile page is more of an edit form than a full account dashboard.

Impact: Medium.

Recommended solution:
- Tabs/cards for profile, addresses, orders, security, notifications, and preferences.

### 14. Wishlist And Compare Maturity

Missing:
- Move wishlist item to cart.
- Move all wishlist to cart.
- Wishlist empty-state recommendations.
- Persist compare across sessions/devices.

## Nice To Have

### 15. Merchandising And Conversion

Add:
- Recently viewed on home/products.
- Personalized recommendations.
- Best offers strip.
- Low-stock urgency.
- Bundles and add-ons.
- Product badges: Bestseller, New, Limited Deal.

### 16. Better Analytics

Add:
- Funnel events: product view, add to cart, checkout started, payment opened, payment failed, order completed.
- Admin conversion dashboard.
- Search terms with no results.

### 17. Accessibility And Keyboard Polish

Add:
- Keyboard navigable carousels.
- Visible focus states everywhere.
- ARIA labels for icon-only controls.
- Reduced-motion mode for animations.

