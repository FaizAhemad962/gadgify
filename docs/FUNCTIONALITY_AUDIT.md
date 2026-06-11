# Functionality Audit

Date: 2026-06-11

Scope reviewed: frontend routes, React Query usage, cart/wishlist/auth contexts, checkout/payment/order flows, admin CRUD pages, localization files, and backend route/controller coverage at a high level.

## Executive Summary

The application has the core ecommerce spine in place: product browsing, product details, cart, wishlist, checkout, Razorpay payment, orders, admin product/category/coupon/order/user management, ratings, newsletters, legal pages, role-based routes, and multilingual locale files.

The main functional gaps are not absence of pages. They are consistency, production polish, and missing ecommerce-grade behaviors around delivery tracking, returns/cancellations, inventory reservation, localization quality, admin workflows, and real-time updates.

## Storefront

### Home Page

Status: Present.

Working areas:
- Homepage sections exist for hero, trending/new arrivals/deals, best sellers, flash sales, FAQ, payment/security, and marketing content.
- Product cards are now shared through reusable card/grid patterns in key product sections.

Issues and gaps:
- Some homepage content still behaves more like a landing page than a conversion-focused ecommerce homepage.
- There is no personalized merchandising based on viewed products, cart contents, category interest, or previous orders.
- Carousel-heavy sections can still become visually noisy if too many sections compete for attention.

Recommended enhancements:
- Add a stronger above-the-fold product value proposition: delivery promise, trust badge, best deal CTA, and category shortcuts.
- Keep carousel count limited; use static editorial sections for smoother performance.
- Add "Continue browsing", "Recently viewed", and "Recommended for you" sections.

## Product Discovery

Status: Present and improving.

Working areas:
- Products page supports grid/list view, search, category filtering, rating filtering, price filtering, sorting, wishlist, compare, add to cart, and buy now.
- Infinite loading is implemented with an `IntersectionObserver` sentinel.
- Product card layout is reusable through shared layout tokens.

Issues and gaps:
- Filter state is not reflected in the URL, so users cannot share a filtered product page or return with browser back/forward preserving filters.
- No active filter chips summary above results.
- No "clear all filters" control in the main content area.
- Category filtering appears single-category in the API request even though UI state supports an array.
- Product list does not expose "sort by newest", "price low-high", "price high-low", "rating", and "availability" as a cohesive ecommerce control group.

Recommended enhancements:
- Persist filters in query params: `?q=&category=&min=&max=&rating=&sort=`.
- Add active filter chips and a visible reset action.
- Add no-results recovery actions: clear filters, search all products, browse popular categories.
- Add server-backed multi-category filtering or simplify UI to one selected category.

## Product Detail

Status: Present.

Working areas:
- Product image/video gallery exists.
- Quantity selection, add to cart, buy now, wishlist, share, related products, recently viewed, ratings form, and ratings list exist.
- Product detail was moved toward modern glass UI and Product Gallery was optimized for scroll/zoom performance.

Issues and gaps:
- Product detail still needs a full ecommerce detail structure: offers, delivery pincode check, return policy summary, warranty/guarantee, product highlights, specifications, and FAQ.
- "Notify me" uses `localStorage`, which is not synced to backend and does not actually trigger notification delivery.
- Related products are category-based only, not behavior- or similarity-based.
- Some old currency mojibake was found in files and locale content; this must be cleaned before production.

Recommended enhancements:
- Add sections: product highlights, specs table, delivery estimate, return/warranty card, payment offers, and trust badges.
- Move stock notification subscription to backend per user/email.
- Add structured product schema markup for SEO.

## Cart

Status: Present.

Working areas:
- Cart context fetches server cart for authenticated users.
- Add/update/remove/clear operations use React Query and optimistic updates.
- Rapid add-to-cart clicks are buffered per product.

Issues and gaps:
- Optimistic temporary cart items can contain empty product objects until server sync returns.
- Cart does not expose recommended add-ons, coupon entry, delivery estimate, or free-shipping progress.
- Cart is authenticated-only; guest cart is not supported.

Recommended enhancements:
- Add a cart summary component reusable between cart and checkout.
- Add "You may also like" / add-on recommendations.
- Add free-shipping threshold progress.
- Decide if guest cart is required. For broader ecommerce, guest cart materially improves conversion.

## Checkout And Payment

Status: Present.

Working areas:
- Checkout collects shipping address or uses saved addresses.
- Coupon application exists.
- Razorpay order creation, payment intent, confirmation, retry, and failure handling exist.
- Backend validates Maharashtra delivery through middleware.

Issues and gaps:
- Checkout hard-blocks non-Maharashtra addresses. This matches old business scope but conflicts with broader accessibility goals.
- No COD, wallet, card saved preference, or explicit UPI ID entry control in app. Razorpay owns most payment UI.
- Order creation happens before payment completion. Stock decrement happens on payment confirmation, which is safer, but there is no short-lived stock reservation.
- Coupon usage count appears incremented at order creation, before payment success. This can consume coupon usage even if payment is abandoned.
- Address creation/update behavior is not fully surfaced as a standalone address book UX.

Recommended enhancements:
- Make serviceability configurable by pincode/state instead of hardcoded Maharashtra.
- Increment coupon usage only after confirmed payment or release it if order expires/cancels.
- Add payment timeout/abandoned order cleanup.
- Add a reusable address book component with create/edit/delete/default address flows.

## Orders And Delivery

Status: Partially present.

Working areas:
- Orders list exists with search/filter, summary, reorder, payment status, and status chips.
- Order detail exists with payment retry, refresh, invoice download, and timeline.
- Backend has delivery assignment, tracking, staff, analytics, and rating endpoints.

Issues and gaps:
- Customer-facing delivery tracking is not fully wired into the order UI.
- Orders page and order detail poll every 5 seconds. This works but is inefficient at scale.
- Order detail UI still uses older card styling in several sections compared with the newer glass UI.
- Cancellation is limited to pending orders and is not presented as a polished self-service workflow.
- No return/refund request flow after delivery.

Recommended enhancements:
- Add customer delivery tracking panel on order detail using backend tracking endpoints.
- Replace frequent polling with event-based updates or lower-frequency refetch plus manual refresh.
- Add cancellation reasons, refund status, and return request flow.
- Add delivery staff contact/masked phone only when assigned.

## Wishlist And Compare

Status: Present.

Working areas:
- Wishlist is server-backed and invalidated through React Query.
- Compare context and compare page exist.

Issues and gaps:
- Wishlist context keeps local React state and React Query cache, which can drift if not carefully synced.
- Compare appears client-side only and may not persist across sessions/devices.
- Wishlist/compare CTAs are not consistently explained to users.

Recommended enhancements:
- Prefer React Query cache as the single source of truth for wishlist.
- Persist compare for authenticated users or store locally with clear UX.
- Add empty-state recommendations and "move all to cart" for wishlist.

## Auth, Profile, And Account

Status: Present.

Working areas:
- Login, signup, forgot password, reset password, change password, profile, role-aware navigation, and httpOnly-cookie auth are present.
- Auth context checks `/profile` on app start.

Issues and gaps:
- `logout` forces `window.location.href`, causing a full page reload.
- Auth context is not represented as a React Query profile query, so profile freshness is manually managed.
- Profile is not yet a full account center: addresses, orders, security, notifications, and preferences are not separated into clear tabs.
- Theme and recently viewed use `localStorage`; acceptable for preferences/history, but not for sensitive account data.

Recommended enhancements:
- Move auth profile to a `queryKeys.auth.profile` query and invalidate on login/profile update/logout.
- Use router navigation after logout instead of full reload.
- Build profile as an account dashboard with tabs.

## Admin

Status: Present.

Working areas:
- Admin dashboard, products, orders, coupons, categories, users, role management, and data grids exist.
- Product/category/coupon/order/user mutations generally invalidate relevant React Query data.
- Shared admin style tokens and reusable `CustomButton` are being used in many areas.

Issues and gaps:
- Product media management is fragile: removing existing media calls the backend without awaiting or handling failure.
- Product create/update uploads images/videos sequentially, which is slower and can partially fail.
- Admin delete flows still use `window.confirm` in some places instead of reusable confirmation dialogs.
- Some admin tables use plain MUI tables while others use the app data grid, creating inconsistent UX.
- Delivery management backend exists, but no clear admin delivery dashboard route is present in current frontend routes.

Recommended enhancements:
- Make media upload transactional: upload all files, then save product, and rollback/delete orphaned uploads on failure.
- Use `ConfirmDialog` everywhere instead of `window.confirm`.
- Add admin delivery dashboard and assignment flows if delivery staff operations are part of launch.
- Standardize all admin list pages on `AppDataGrid` or a shared responsive admin list component.

## Localization

Status: Present but not production-clean.

Working areas:
- `en.json`, `hi.json`, and `mr.json` exist.
- Navigation, auth, products, cart, checkout, orders, admin, and common keys are covered broadly.

Issues and gaps:
- Locale JSON parsing through PowerShell failed because duplicate keys exist: `securePayment` and `securepayment`.
- Some English locale content contains mojibake for Marathi/Hindi labels and rupee symbols.
- Many components still contain hardcoded English strings.
- Some `t()` calls use fallback strings inline, which is useful during development but hides missing locale discipline.

Recommended enhancements:
- Remove duplicate/conflicting keys.
- Run a locale-key validator in CI.
- Replace all hardcoded user-facing text with locale keys.
- Add a currency formatter utility instead of inline `₹` or corrupted `â‚¹` strings.

## Security And Data Correctness Notes

Working areas:
- Auth uses httpOnly cookies.
- API client uses `withCredentials`.
- Backend has helmet, CORS allowlist, rate limiting, sanitization, and payment limiter.

Issues and gaps:
- API client still logs response status and error details to console.
- CSRF comments say tokens were removed. If auth is cookie-based, CSRF posture must be explicitly reviewed.
- Backend has debug `console.log` in controllers/routes.
- Coupon usage before payment success can create business-data inconsistency.

Recommended enhancements:
- Remove production console logs.
- Revisit CSRF protection strategy for cookie-authenticated mutation endpoints.
- Add audit events for admin destructive actions.
- Add server-side order expiry and failed-payment cleanup.

