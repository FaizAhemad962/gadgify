# Glass UI Ecommerce Roadmap

Date: 2026-06-11

Goal: keep the modern glass look, but make it disciplined, fast, responsive, and ecommerce-focused.

## Design Direction

The app should use "glass" as an accent style, not as a heavy effect everywhere. Heavy `backdrop-filter`, large shadows, and animated cards can make scrolling feel slow. For ecommerce, the design should prioritize readability, product imagery, price clarity, trust, and checkout speed.

Recommended visual system:
- Primary brand: deep navy.
- Accent: orange for conversion CTAs and highlights.
- Surface: white and warm gray.
- Glass surface: subtle translucent panels for hero, nav menus, admin panels, and feature cards.
- Avoid large blurred panels inside long scrolling product lists.

## Shared UI Components To Standardize

### Buttons

Use `CustomButton` across:
- Product cards.
- Product detail.
- Cart.
- Checkout.
- Wishlist.
- Auth.
- Admin modals.
- Category/coupon/product actions.

Button variants:
- `primary`: main purchase action.
- `secondary`: add to cart / safe secondary action.
- `ghost`: navigation/back actions.
- `admin`: admin create/update actions.
- `danger`: delete/cancel actions.

### Fields

Use shared field styles for:
- Auth forms.
- Checkout address forms.
- Profile forms.
- Admin dialogs.
- Coupon/category/product forms.

Requirements:
- Same radius.
- Same focus state.
- Same disabled state.
- Same error/helper text spacing.
- No dark disabled backgrounds.

### Cards

Use card categories:
- Product card.
- Summary card.
- Admin panel card.
- Order card.
- Empty-state card.
- Trust/feature card.

Rules:
- Product cards should not use heavy hover shadows.
- Long lists should avoid `backdrop-filter`.
- Use consistent image aspect ratio.
- Keep action areas stable so layout does not jump.

### Dialogs And Modals

Use a single dialog system:
- Shared max width.
- Sticky header and actions.
- Scrollable content area.
- Consistent top spacing.
- Consistent close/cancel/create/update buttons.
- Mobile full-screen option for complex forms.

Pages needing full standardization:
- Admin products modal.
- Admin coupons modal.
- Admin categories modal.
- Admin users role dialog.
- Confirm delete/cancel dialogs.

## Page-by-Page UI Roadmap

### Home

Target: premium storefront, not only marketing content.

Enhance:
- Hero with clear product promise, offer, and category CTAs.
- Compact carousel height.
- Strong category strip.
- Trending, best sellers, flash sale using the same product card.
- Trust section: secure payment, local delivery, easy support.
- Newsletter with glass panel.

Avoid:
- Too many competing animated sections.
- Large carousel taking most of the first viewport.

### Products

Target: fast product discovery.

Enhance:
- URL-synced filters.
- Active filter chips.
- Sticky desktop filter with correct height.
- Mobile filter drawer with clear/apply actions.
- No-results recovery panel.
- Better sort controls.

Performance rules:
- Normal CSS grid for moderate product counts.
- Server pagination/infinite loading.
- Native lazy images.
- No heavy blur/shadow on product list.

### Product Detail

Target: high-trust product conversion page.

Enhance:
- Product media gallery.
- Product title, price, rating, stock, quantity, CTAs.
- Delivery pincode checker.
- Offers/payment options.
- Return/warranty info.
- Highlights/specifications.
- Reviews and review form.
- Related products and recently viewed.

Glass UI:
- Use one subtle hero detail panel.
- Use soft cards for trust/info.
- Avoid heavy blurred backgrounds while scrolling.

### Cart

Target: reduce friction before checkout.

Enhance:
- Cart item cards with stable controls.
- Free shipping progress.
- Coupon entry.
- Order summary.
- Recommended add-ons.
- Empty cart recovery.

### Checkout

Target: confidence and speed.

Enhance:
- Step layout: address, payment, review.
- Address book component.
- Serviceability check.
- Coupon summary.
- Payment security badges.
- Clear pending/failure state.

### Orders

Target: post-purchase confidence.

Enhance:
- Order cards with status and payment clarity.
- Status-based actions: retry payment, cancel, track, invoice, return.
- Better empty/filter states.
- Lower polling frequency or event updates.

### Order Detail

Target: full order command center.

Enhance:
- Glass header summary.
- Timeline.
- Delivery tracking.
- Shipping address.
- Payment summary.
- Invoice download.
- Return/refund/cancel actions based on state.

### Profile

Target: account center.

Enhance:
- Profile overview.
- Address management.
- Security/change password.
- Notification preferences.
- Order shortcuts.
- Language/theme preferences.

### Admin

Target: clean operations console.

Enhance:
- Keep admin dashboard analytics style as baseline.
- Make products, orders, coupons, categories, users visually consistent.
- Use same table/grid, search, filters, create actions, dialogs, and snackbars.
- Add delivery management if delivery workflow is part of production launch.

## Animation Rules

Use:
- Small opacity/transform transitions.
- Button hover lift only on isolated buttons.
- Skeleton loaders for data loading.
- Reduced motion support.

Avoid:
- Route transition wrappers that delay navigation.
- `transition: all`.
- Heavy hover shadows on lists.
- Repeated `backdrop-filter` on scrolling content.
- Large animated carousels with many images.

## Ecommerce Trust Elements To Add

Add consistently:
- Secure checkout badge.
- Razorpay/payment trust text.
- Delivery estimate.
- Return/refund policy shortcut.
- Support contact.
- GST/invoice availability.
- Product stock confidence.
- Verified reviews.

## Implementation Order

1. Fix locale JSON integrity and currency formatting.
2. Standardize buttons, fields, dialogs, and cards.
3. Finish Product Detail ecommerce sections.
4. Complete checkout address/serviceability UX.
5. Complete order detail delivery tracking and self-service actions.
6. Standardize all admin CRUD pages.
7. Add conversion merchandising and analytics.

