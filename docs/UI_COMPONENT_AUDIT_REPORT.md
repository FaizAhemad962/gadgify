# UI Component Audit Report

Date: 2026-06-11

## Scope

Reviewed frontend UI usage across `frontend/src/components`, `frontend/src/pages`, and the theme layer, focusing on:

- Buttons and button variants
- Text fields and form controls
- MUI component overrides
- Icon sizing
- Typography usage
- Reusable UI wrappers
- Consistency risks across customer, auth, and admin screens

## Executive Summary

The UI has improved, but the component system is still not fully standardized. The biggest issue is not one broken component; it is inconsistent usage. There are global MUI overrides, custom wrapper components, admin-specific style tokens, auth-specific style tokens, and many inline `sx` overrides competing with each other.

Current usage count from the codebase:

| Component usage | Count |
| --- | ---: |
| Raw MUI `Button` | 70 |
| `CustomButton` | 39 |
| Raw MUI `TextField` | 57 |
| `CustomTextField` | 5 |
| Raw MUI `IconButton` | 41 |
| `CustomIconButton` | 3 |
| `Typography` | 375 |
| `Chip` | 35 |

This means the app still depends mostly on raw MUI components, so visual consistency cannot be controlled from one file yet.

## Critical Findings

### 1. Button System Is Split

**Impact:** High

**Problem:** The app uses both raw MUI `Button` and `CustomButton`. `CustomButton` contains the modern gradient/glass-like button styling, but many pages still use raw `Button`.

**Examples:**

- `frontend/src/pages/OrderDetailPage.tsx`
- `frontend/src/pages/ProfilePage.tsx`
- `frontend/src/pages/CartPage.tsx`
- `frontend/src/components/ProductCard.tsx`
- `frontend/src/components/sections/HeroCarousel.tsx`
- `frontend/src/pages/NewsletterUnsubscribePage.tsx`

**Root cause:** `CustomButton` was introduced after many pages already had direct MUI button styling. Migration is partial.

**Risk:** Future button changes will require editing many files. Button height, radius, loading state, hover behavior, and color usage will drift again.

**Recommendation:** Make `CustomButton` the default for app-level actions. Keep raw MUI `Button` only for internal MUI compositions where necessary.

**Target standard:**

- Primary customer action: `appVariant="primary"`
- Admin primary action: `appVariant="admin"`
- Cancel/low emphasis: `appVariant="ghost"`
- Destructive: `appVariant="danger"`
- Upload/select file: `appVariant="upload"`
- Secondary outline: `appVariant="secondary"`

## High Priority Findings

### 2. Text Field System Is Not Standardized

**Impact:** High

**Problem:** `CustomTextField` exists but is currently just a pass-through wrapper:

```tsx
export const CustomTextField = (props: TextFieldProps) => {
  return <TextField {...props} sx={props.sx ?? {}} />;
};
```

Meanwhile, the app has 57 direct `TextField` usages and multiple style systems:

- global `MuiTextField` override in `theme.ts`
- `authInputSx` in `components/auth/authStyles.ts`
- `adminSearchFieldSx` and dialog rules in `adminStyleTokens.ts`
- many inline page-level overrides

**Risk:** Form fields can look different between auth, profile, checkout, admin dialogs, and filters.

**Recommendation:** Convert `CustomTextField` into a real standard wrapper with variants:

- `appVariant="default"`
- `appVariant="glass"`
- `appVariant="admin"`
- `appVariant="search"`
- `appVariant="compact"`

Then migrate all common forms gradually.

### 3. Icon Sizes Are Partially Standardized

**Impact:** Medium / High

**Problem:** `navigationStyles.ts` provides useful icon tokens:

- `appIconSx.sm`
- `appIconSx.md`
- `appIconSx.lg`
- `appIconSx.section`
- `appIconSx.card`
- `navLinkIconSx`
- `navActionIconSx`
- `navDrawerIconSx`

But many files still use direct icon sizing:

- `fontSize="small"`
- `fontSize="inherit"`
- inline `fontSize: "1.3rem"`
- inline `fontSize: 10`
- chart axis font sizes

**Examples:**

- `frontend/src/pages/admin/AdminProducts.tsx`
- `frontend/src/components/product/RatingForm.tsx`
- `frontend/src/components/product/RatingsList.tsx`
- `frontend/src/components/common/StarRating.tsx`
- `frontend/src/components/sections/HeroCarousel.tsx`

**Recommendation:** Keep direct sizes only for third-party chart components and rating stars. For app icons, use the shared icon scale.

### 4. Typography Has Two Competing Systems

**Impact:** High

**Problem:** Typography is defined in two places:

- `frontend/src/theme/theme.ts`
- `frontend/src/theme/typography.ts`

The second file defines a richer responsive typography system, but it is not consistently wired into the actual MUI theme. Many pages use inline font sizes instead.

Hotspots for inline typography:

- `frontend/src/pages/HomePage.tsx`
- `frontend/src/components/sections/HeroCarousel.tsx`
- `frontend/src/components/ProductCard.tsx`
- `frontend/src/pages/admin/AdminProducts.tsx`
- `frontend/src/components/FilterSidebar.tsx`

**Risk:** Headings and body text look different across pages, especially mobile vs desktop.

**Recommendation:** Decide one source of truth. Best path:

1. Move responsive typography into `theme.ts`.
2. Use MUI variants consistently.
3. Add app-specific variants if needed:
   - `heroTitle`
   - `sectionTitle`
   - `cardTitle`
   - `eyebrow`
   - `price`
4. Remove most inline `fontSize` from pages/components.

## Medium Priority Findings

### 5. Custom Wrappers Are Uneven

**Impact:** Medium

Current wrapper quality:

| Component | Status |
| --- | --- |
| `CustomButton` | Useful, should become default |
| `CustomTextField` | Too thin, needs real styles |
| `CustomIconButton` | Too thin, needs variants/sizes |
| `CustomLoadingButton` | Duplicates `CustomButton` loading behavior |
| `CustomSelect` | Has some value, but not widely used |
| `CustomDialog` | Useful direction, should be aligned with admin dialog tokens |
| `CustomMenu` | Good reusable base for language/profile dropdowns |
| `StatusBadge` | Useful, but overlaps with direct `Chip` usage |

**Recommendation:** Consolidate wrappers into a small design-system layer:

- `AppButton`
- `AppTextField`
- `AppIconButton`
- `AppSelect`
- `AppDialog`
- `AppStatusBadge`
- `AppPageHeader`
- `AppSectionHeader`

Avoid maintaining both `CustomLoadingButton` and `CustomButton` unless they serve clearly different roles.

### 6. Admin UI Has Better Tokens Than Customer UI

**Impact:** Medium

Admin has reusable tokens:

- `adminPageSx`
- `adminPanelSx`
- `adminDialogPaperSx`
- `adminDialogTitleSx`
- `adminDialogContentSx`
- `adminDialogActionsSx`
- `adminSearchFieldSx`

Customer pages do not yet have equivalent shared layout tokens. This causes each page to style panels/cards/forms independently.

**Recommendation:** Add customer-facing shared tokens:

- `pageShellSx`
- `glassPanelSx`
- `commerceCardSx`
- `formPanelSx`
- `searchFieldSx`
- `sectionShellSx`

### 7. Raw `Chip` Usage Should Become Status-Driven

**Impact:** Medium

There are 35 direct `Chip` usages. Some are status indicators, some are badges, some are filters. Status chips should not be styled manually.

**Recommendation:**

- Use `StatusBadge` or a new `AppStatusChip` for order/payment/product state.
- Use raw/custom `Chip` only for filters and tags.

## Low Priority Findings

### 8. `sx` Usage Is Very Heavy

**Impact:** Medium over time

Heavy inline `sx` is expected in MUI apps, but this project has repeated patterns that should be promoted to shared tokens. The issue is maintainability, not immediate breakage.

**Recommendation:** Extract repeated styles only when they repeat across 3+ files. Avoid over-abstracting one-off layout styles.

### 9. Some Legacy/Demo Components Still Exist

**Impact:** Low / Medium

Files like `CarouselExamples.tsx` and old UI wrappers may not be production-critical, but they increase search noise and make audits harder.

**Recommendation:** Move examples to `docs/examples`, delete if unused, or clearly mark them as non-production.

## Recommended Implementation Plan

### Phase 1: Standardize Inputs And Buttons

1. Upgrade `CustomTextField` into a real app field.
2. Migrate auth, profile, checkout, admin dialogs, and filters to it.
3. Replace raw page-level action buttons with `CustomButton`.
4. Remove `CustomLoadingButton` or make it a wrapper around `CustomButton`.

### Phase 2: Typography And Icon Cleanup

1. Merge `theme/typography.ts` into the active MUI theme.
2. Define app typography variants or reusable text components.
3. Replace inline app icon sizes with `appIconSx` / `navIconSx`.
4. Keep custom sizes only for charts, ratings, and brand logo rendering.

### Phase 3: Status And Badge System

1. Replace direct status `Chip` usage with `StatusBadge` / `AppStatusChip`.
2. Centralize all status color/label mapping.
3. Make product stock, payment, order, coupon, and user role badges consistent.

### Phase 4: Layout Tokens

1. Add shared customer page/panel/card/form styles.
2. Use them in cart, checkout, profile, wishlist, orders, and product detail pages.
3. Keep admin tokens separate but stylistically aligned.

## Priority File List

### Highest Priority

- `frontend/src/components/ui/CustomTextField.tsx`
- `frontend/src/components/ui/CustomButton.tsx`
- `frontend/src/components/ui/CustomIconButton.tsx`
- `frontend/src/theme/theme.ts`
- `frontend/src/theme/typography.ts`

### Button Migration Hotspots

- `frontend/src/pages/CartPage.tsx`
- `frontend/src/pages/ProfilePage.tsx`
- `frontend/src/pages/OrderDetailPage.tsx`
- `frontend/src/pages/NewsletterUnsubscribePage.tsx`
- `frontend/src/components/ProductCard.tsx`
- `frontend/src/components/sections/HeroCarousel.tsx`
- `frontend/src/components/product/RatingForm.tsx`
- `frontend/src/components/product/RatingsList.tsx`

### Text Field Migration Hotspots

- `frontend/src/pages/admin/AdminProducts.tsx`
- `frontend/src/pages/admin/AdminCoupons.tsx`
- `frontend/src/pages/admin/AdminCategories.tsx`
- `frontend/src/pages/ProfilePage.tsx`
- `frontend/src/pages/CheckoutPage.tsx`
- `frontend/src/pages/auth/SignupPage.tsx`
- `frontend/src/components/FilterSidebar.tsx`

### Typography Hotspots

- `frontend/src/pages/HomePage.tsx`
- `frontend/src/components/sections/HeroCarousel.tsx`
- `frontend/src/components/ProductCard.tsx`
- `frontend/src/pages/admin/AdminProducts.tsx`
- `frontend/src/components/FilterSidebar.tsx`

## Final Recommendation

Do not continue styling page-by-page. The next UI refactor should start by strengthening the reusable primitives:

1. `CustomTextField`
2. `CustomButton`
3. `CustomIconButton`
4. typography theme
5. customer layout tokens

After that, page cleanup will be faster and safer because visual changes will happen in one place instead of many scattered `sx` blocks.
