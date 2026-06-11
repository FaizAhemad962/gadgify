# Frontend UI Refactor Plan

## Goal

Make the storefront feel like a polished e-commerce site: consistent spacing, responsive layouts, clean navigation, stable filters, reusable components, and complete localization through `en.json`, `mr.json`, and `hi.json`.

## Design Direction

The application should become a clean, trustworthy, conversion-focused e-commerce store. The target direction is:

- Amazon / Flipkart for browsing utility and clear commerce flows.
- Apple / Nike for visual polish, whitespace, and premium product presentation.
- Modern Shopify storefronts for simplicity, trust, and fast checkout.

The goal is not to add heavy animations. The goal is to make the UI consistent, responsive, credible, and easy to buy from.

## UI Principles

1. Trust first:
   - Clear navbar, visible cart/account access, secure payment messaging.
   - Product detail pages should clearly show images, price, stock, delivery info, return/refund policy, GST/invoice note, and purchase actions.
   - Checkout should feel calm, short, and safe.

2. Consistent design system:
   - One spacing scale.
   - One max page width.
   - One card style.
   - One button hierarchy.
   - One status-chip system.
   - One responsive layout pattern.

3. Premium storefront homepage:
   - Strong hero section with product/category message.
   - Featured categories.
   - Trending products.
   - Best sellers.
   - Deals / flash sale.
   - Trust section for delivery, secure payment, authentic products, and support.
   - Reviews/testimonials.
   - FAQ near the bottom.

4. Better product browsing:
   - Sticky filter sidebar on desktop.
   - Bottom-sheet filter drawer on mobile.
   - Sort and active filter chips.
   - Product cards with consistent image ratio, price, discount, stock, rating, quick add, and wishlist.
   - Skeleton loading instead of large spinners where possible.

5. Product detail as a sales page:
   - Large gallery.
   - Sticky purchase panel on desktop.
   - Clear CTAs: `Add to Cart` and `Buy Now`.
   - Delivery estimate / pincode check.
   - Product highlights and specifications.
   - Related products and recently viewed products.

6. Cart and checkout should be simple:
   - No visual clutter.
   - Clear order summary.
   - Clean coupon handling.
   - Obvious payment state.
   - Duplicate-submit prevention.
   - Clear pending/failed payment retry flow.

7. Admin should feel like a real operations panel:
   - Use the stronger dashboard design language across all admin pages.
   - Standardize page headers, toolbar, search, filters, tables, empty states, and dialogs.
   - Split product creation into media, basic info, pricing/tax, inventory, and category sections.
   - Show clear order status/payment chips and row-level update states.

## Visual Style

- Background: soft off-white / light gray.
- Cards: white surfaces with rounded corners, light borders, and subtle shadows.
- Accent color: use the brand accent consistently for CTAs and important highlights.
- Typography: larger headings and readable body text.
- Product images: consistent square or 4:5 ratio.
- Buttons:
  - Primary for purchase actions.
  - Secondary for wishlist, filter, and view actions.
  - Danger only for delete/cancel actions.
- Animation:
  - Small fade/slide for drawers and dialogs.
  - Button hover/focus states.
  - No route transition.
  - No heavy card movement during scroll.

## High-Level Implementation Order

1. Foundation:
   - Theme tokens, layout constants, responsive spacing.
   - Remove global card hover transform.
   - Create `PageShell`, `Section`, `ResponsiveGrid`, and `StickyPanel`.

2. Navigation:
   - Refactor navbar and drawer.
   - Keep desktop/mobile links consistent.
   - Group admin links better.

3. Product browse:
   - Fix `FilterSidebar`.
   - Polish product card.
   - Improve product grid responsiveness.
   - Add mobile filter drawer.

4. Product detail:
   - Finish gallery polish.
   - Add sticky buy panel.
   - Add delivery, trust, and specification sections.

5. Cart / checkout / payment / orders:
   - Shared order summary.
   - Shared payment status.
   - Shared order status chips.
   - Central Razorpay hook.
   - Better retry/pending payment UX.

6. Admin UI:
   - Shared admin shell/header/toolbar.
   - Refactor products, orders, coupons, categories, and users.
   - Responsive admin tables/cards.

7. Localization:
   - Move all UI text into `en.json`, `mr.json`, and `hi.json`.
   - Remove fallback text from components.
   - Audit missing keys.

## Reviewed Files

- `frontend/src/theme/theme.ts`
- `frontend/src/components/layout/Navbar.tsx`
- `frontend/src/components/ui/Drawer.tsx`
- `frontend/src/components/FilterSidebar.tsx`
- `frontend/src/components/ProductCard.tsx`
- `frontend/src/pages/ProductDetailPage.tsx`
- `frontend/src/components/product/ProductGallery.tsx`
- `frontend/src/components/products/ProductGrid.tsx`
- `frontend/src/components/products/ProductSection.tsx`
- `frontend/src/components/sections/FlashSale.tsx`
- `frontend/src/components/sections/BestSellers.tsx`
- `frontend/src/pages/admin/AdminDashboard.tsx`
- `frontend/src/pages/admin/AdminProducts.tsx`
- `frontend/src/pages/admin/AdminOrders.tsx`
- `frontend/src/pages/CartPage.tsx`
- `frontend/src/pages/CheckoutPage.tsx`
- `frontend/src/pages/OrdersPage.tsx`
- `frontend/src/pages/OrderDetailPage.tsx`
- `frontend/src/components/OrderTimeline.tsx`
- `frontend/src/components/orders/PendingOrderCard.tsx`
- `frontend/src/components/sections/PaymentSecurity.tsx`
- `frontend/src/hooks/usePlaceOrder.ts`
- `frontend/src/api/orders.ts`
- `frontend/src/api/orderAPI.ts`
- `frontend/src/utils/generateInvoice.ts`
- `frontend/src/pages/admin/AdminCoupons.tsx`
- `frontend/src/pages/admin/AdminCategories.tsx`
- `frontend/src/pages/admin/AdminUsers.tsx`
- `frontend/src/components/admin/AdminProductsDataGrid.tsx`
- `frontend/src/components/admin/AdminOrdersDataGrid.tsx`
- `frontend/src/components/admin/RoleManagementDashboard.tsx`
- `frontend/src/i18n/locales/en.json`
- `frontend/src/i18n/locales/mr.json`
- `frontend/src/i18n/locales/hi.json`

## Current Findings

## 1. Layout, Spacing, Width, And Height

Problem:
- Many components use one-off `px`, `py`, `width`, `height`, `gap`, and `maxWidth` values.
- Navbar, drawer, filter sidebar, cards, and page sections do not follow one shared layout scale.
- Some sections use `Container`, others use raw `Box`, and padding varies page to page.

Impact:
- The site feels visually inconsistent.
- Mobile/tablet layouts are more likely to break.
- Future UI changes require editing many files.

Plan:
- Define shared layout constants:
  - `APP_MAX_WIDTH`
  - `NAVBAR_HEIGHT`
  - `PAGE_X_PADDING`
  - `SECTION_Y_PADDING`
  - `CARD_RADIUS`
  - `SURFACE_BORDER`
- Create reusable layout components:
  - `PageShell`
  - `Section`
  - `ResponsiveGrid`
  - `StickyPanel`
- Replace hard-coded spacing gradually.

Priority: Critical

## 2. Theme And Design System

Problem:
- `theme.ts` has useful tokens, but components still use many raw values.
- `MuiCard` globally applies hover `transform: translateY(-4px)`, which can hurt dense e-commerce grids.
- Typography sizes are quite small for e-commerce marketing sections.
- Some comments/text appear mojibake in PowerShell output, so encoding should be verified.

Impact:
- UI looks less premium and less cohesive.
- Cards and filter areas can feel cramped.
- Global hover transforms may contribute to scroll stutter.

Plan:
- Add design tokens for:
  - layout widths
  - navbar/sidebar sizes
  - shadows
  - section spacing
  - product image ratios
- Move repeated surface styles into theme/component utilities.
- Remove or limit global `MuiCard` hover transform. Use opt-in hover styles only.
- Review `theme.ts` and CSS files for encoding issues.

Priority: Critical

## 3. Navbar

Problem:
- `Navbar.tsx` is still too large.
- Navigation item creation, desktop rendering, drawer rendering, user menu, and auth CTAs are all mixed.
- Admin links can overcrowd desktop navigation.
- Mobile drawer and navbar are closer now, but still need better responsive grouping.
- Some alignment/indentation issues remain in mapped buttons.

Plan:
- Extract:
  - `useNavigationItems`
  - `DesktopNavLinks`
  - `NavActions`
  - `UserMenu`
  - `MobileNavDrawer`
- Use a shared nav model for desktop and mobile.
- Move admin links into either:
  - compact admin dropdown, or
  - admin-only secondary menu.
- Standardize nav height and padding with theme tokens.
- Keep cart, wishlist, profile, login, signup consistently available.

Priority: Critical

## 4. Sidebar / Drawer

Problem:
- `Drawer.tsx` has hard-coded width, header height, radius, and colors.
- `brand` prop exists but is not really used.
- It is generic but currently tuned for navbar only.
- Needs better mobile width behavior and language/account sections.

Plan:
- Make `AppDrawer` support:
  - `header`
  - `footer`
  - `sectionTitle`
  - `selected`
  - responsive `width`
- Use theme tokens for drawer width and spacing.
- Remove unused `brand` prop or implement it properly.
- Add safe mobile width: `min(320px, 100vw)`.

Priority: High

## 5. Filter Sidebar

Problem:
- Price range max is inconsistent: component uses `10000`, slider max is `5000`.
- `priceRange` prop is accepted but not used.
- Manual input layout switches oddly between row/column.
- Rating labels are hard-coded: `Star(s) & above`.
- Rupee symbols and helper text are hard-coded.
- Filter sidebar uses fixed padding, sticky top, max height, and scroll styles.
- `sx` is spread directly, which is less safe for MUI `SxProps`.

Impact:
- Filters may behave incorrectly.
- Mobile filter drawer can feel cramped.
- Localization is incomplete.

Plan:
- Fix price constants:
  - create `DEFAULT_MIN_PRICE`
  - create `DEFAULT_MAX_PRICE`
  - use same max for slider, inputs, validation, and page state.
- Either use `priceRange` or remove it.
- Extract:
  - `PriceRangeFilter`
  - `RatingFilter`
  - `CategoryFilter`
  - `SortFilter`
  - `FilterActions`
- Move all labels to localization:
  - `filters.title`
  - `filters.sortBy`
  - `filters.priceRange`
  - `filters.minPrice`
  - `filters.maxPrice`
  - `filters.ratingAndAbove`
  - `filters.clearAll`
  - `filters.dragToFilter`
- Make desktop sticky behavior use navbar height token.
- Make mobile drawer filter layout touch-friendly.

Priority: Critical

## 6. Product UI

Already done:
- `ProductGrid`
- `ProductSection`
- `ProductGridSkeleton`
- `SectionHeader`
- `ProductGallery`
- Related products, recently viewed, best sellers, flash sale product grids reused.

Remaining:
- Split `ProductCard` into:
  - `ProductImage`
  - `ProductActionButtons`
  - `ProductPrice`
  - `ProductStockLabel`
  - `ProductRatingSummary`
- Standardize product image aspect ratio.
- Make wishlist/compare buttons consistent across card/list/detail.
- Improve product-card mobile button sizing.

Priority: High

## 7. Cart, Checkout, Payments, And Orders

Problem:
- `CartPage` and `CheckoutPage` duplicate summary, coupon, trust, price rows, and item rows.
- `CheckoutPage`, `OrderDetailPage`, and `PendingOrderCard` duplicate Razorpay/payment retry logic.
- Order status and payment status color/label mapping is duplicated in multiple files.
- `OrdersPage` and `OrderDetailPage` poll every 5 seconds, which can hurt performance and backend load.
- Some payment/order labels use `t("literal text")` or hard-coded strings instead of stable localization keys.
- `api/orders.ts` and `api/orderAPI.ts` overlap, which creates two competing order API layers.
- Invoice generation is separate from the order UI plan and should be checked for consistency with displayed totals, GST, shipping, discounts, and localization.
- Many texts are hard-coded or partially localized.
- Visual style differs between cart and checkout.

Impact:
- Payment failures and retries can behave inconsistently across pages.
- Polling can make the app feel slower and increase server load.
- Users may see different totals/status labels across cart, checkout, order detail, invoices, and admin orders.
- Future payment method changes will require edits in many places.

Plan:
- Create:
  - `OrderSummaryCard`
  - `PriceBreakdown`
  - `CouponBox`
  - `CartItemCard`
  - `CheckoutItemList`
  - `TrustSignals`
  - `PaymentMethodCard`
  - `PaymentStatusBanner`
  - `OrderStatusChip`
  - `PaymentStatusChip`
  - `OrderTimelineCard`
  - `InvoiceActions`
- Create payment/order hooks:
  - `useRazorpayPayment`
  - `useRetryPayment`
  - `useOrderPolling`
  - `useOrderStatusLabels`
- Centralize status metadata:
  - order status label
  - order status color
  - payment status label
  - payment status color
  - allowed admin transitions
- Replace fixed 5-second polling with a controlled strategy:
  - poll only for pending payment or active fulfillment states
  - stop polling for delivered/cancelled/failed terminal states
  - pause/refetch intelligently on tab focus
- Consolidate `api/orders.ts` and `api/orderAPI.ts` into one order API layer.
- Use same price calculation and display format across cart, checkout, order detail, admin orders, and invoice.
- Move all cart/checkout/payment/order strings to localization keys:
  - `cart.*`
  - `checkout.*`
  - `orders.*`
  - `payment.*`
  - `invoice.*`
- Verify Razorpay script loading, failure states, retry states, disabled buttons, and duplicate-submit prevention.

Priority: Critical

## 8. Auth Pages

Problem:
- `LoginPage`, `SignupPage`, forgot/reset pages likely duplicate layout and field styling.
- Hard-coded text exists, for example login link phrasing.

Plan:
- Create:
  - `AuthLayout`
  - `AuthCard`
  - `PasswordField`
  - `AuthTrustBadges`
- Move all visible copy to localization.
- Standardize auth page spacing and responsiveness.

Priority: Medium

## 9. Profile

Problem:
- `ProfilePage` mixes avatar upload, form, role display, account actions.

Plan:
- Create:
  - `ProfileHeader`
  - `ProfilePhotoUploader`
  - `ProfileForm`
  - `AccountActions`

Priority: Medium

## 10. Admin UI

Problem:
- `AdminDashboard` has a stronger visual design than the rest of the admin area.
- `AdminProducts`, `AdminCoupons`, `AdminCategories`, and `AdminUsers` are mostly page-level state plus tables/dialogs, so they feel less interactive and less polished.
- Admin pages repeat page headers, search bars, CRUD dialogs, snackbars, table styling, empty states, and action buttons.
- Some admin pages use MUI `Table`, while others use `AppDataGrid`, so spacing, pagination, loading, and responsive behavior are inconsistent.
- Admin order management should reuse the same status metadata as customer order pages.
- Admin order actions need better interaction states for status changes, payment visibility, and failure handling.
- Admin product creation/editing is very large in one file and mixes media upload, form validation, preview UI, category handling, and table actions.
- Role management uses `t("literal text")` instead of stable localization keys.
- Some visible admin icons/text display mojibake in terminal output, so encoding and localization keys need verification.

Impact:
- Admin CRUD pages feel basic compared with the analytics dashboard.
- Mobile/tablet admin use is likely weak because wide tables are not adapted into cards or scroll-friendly layouts.
- Future admin features will be slower to build because common patterns are duplicated.
- Localization and accessibility are incomplete for admin workflows.

Plan:
- Create shared admin UI primitives:
  - `AdminPageShell`
  - `AdminPageHeader`
  - `AdminToolbar`
  - `AdminMetricCard`
  - `AdminEmptyState`
  - `AdminConfirmDialog`
  - `AdminFormDialog`
  - `AdminStatusChip`
  - `AdminActionMenu`
- Standardize list/table behavior:
  - use `AppDataGrid` where pagination/search/server-side data is needed
  - use responsive card lists for small screens
  - provide consistent skeleton loading and empty states
  - move row actions into a compact menu on mobile
- Refactor admin orders:
  - reuse `OrderStatusChip` and `PaymentStatusChip`
  - use shared allowed transition metadata
  - show clear pending/failed payment state
  - add consistent row-level loading when status is updating
  - keep admin order table responsive on tablet/mobile
- Refactor product admin:
  - extract `ProductFormDialog`
  - extract `ProductMediaUploader`
  - extract `ProductInventoryFields`
  - extract `ProductPricingFields`
  - extract `ProductCategoryField`
  - keep table/data fetching separate from form/media logic
- Refactor coupon/category/user admin pages:
  - replace ad hoc headers with `AdminPageHeader`
  - replace repeated snackbars/dialogs with reusable admin components
  - add clearer interactive states for create/edit/delete
  - add better empty states and disabled/loading button states
- Improve admin responsiveness:
  - desktop: toolbar + table/data grid
  - tablet: compact table columns and action menu
  - mobile: card list with primary actions and detail drawer/dialog
- Move all admin text to localization keys under `admin.*`.

Priority: High

## 11. Localization

Problem:
- Many components still use fallback strings inside `t("key", "Fallback")`.
- Some visible text is hard-coded in JSX.
- `en.json`, `mr.json`, and `hi.json` should have the same key tree.
- Console output shows mojibake for Marathi/Hindi, so encoding must be verified before editing translations.

Plan:
- Create a localization audit script:
  - compare key trees of `en.json`, `mr.json`, `hi.json`
  - list missing keys
  - list extra keys
  - list `t()` fallbacks in code
  - list likely hard-coded visible strings in TSX
- Add missing keys first in `en.json`.
- Mirror keys in `mr.json` and `hi.json`.
- Remove fallback strings from code after keys exist.
- Keep dynamic product/category names separate from UI labels.

Priority: Critical

## Suggested Implementation Order

1. Fix theme/layout constants and global card hover behavior.
2. Refactor navbar into reusable nav components and shared nav item hook.
3. Refactor drawer/sidebar sizing and responsiveness.
4. Fix and split `FilterSidebar`.
5. Refactor cart, checkout, payment retry, order list, order detail, and invoice UI.
6. Refactor admin UI shells, CRUD pages, tables, dialogs, and empty states.
7. Add localization audit script and normalize `en/mr/hi` key trees.
8. Split `ProductCard`.
9. Extract auth layout components.
10. Extract profile components.
11. Final visual QA across mobile, tablet, desktop.

## Verification Checklist

For each refactor slice:
- Run focused ESLint.
- Run `npm run build`.
- Check responsive layouts:
  - 360px mobile
  - 768px tablet
  - 1024px small desktop
  - 1440px desktop
- Check languages:
  - English
  - Marathi
  - Hindi
- Check pages:
  - Home
  - Products
  - Product detail
  - Cart
  - Checkout
  - Orders
  - Order detail
  - Pending payment / retry payment
  - Invoice download
  - Profile
  - Login / Signup
  - Admin dashboard
  - Admin products
  - Admin orders
  - Admin coupons
  - Admin categories
  - Admin users
