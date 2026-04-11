import { lazy } from "react";

// Code-split heavy sections - they load only when they come into view
export const FlashSale = lazy(
  () => import(/* webpackChunkName: "section-flash-sale" */ "./FlashSale"),
);
export const BestSellers = lazy(
  () => import(/* webpackChunkName: "section-best-sellers" */ "./BestSellers"),
);
export const FeaturedBrands = lazy(
  () =>
    import(
      /* webpackChunkName: "section-featured-brands" */ "./FeaturedBrands"
    ),
);
export const FAQ = lazy(
  () => import(/* webpackChunkName: "section-faq" */ "./FAQ"),
);
export const HowItWorks = lazy(
  () => import(/* webpackChunkName: "section-how-it-works" */ "./HowItWorks"),
);
export const PaymentSecurity = lazy(
  () =>
    import(
      /* webpackChunkName: "section-payment-security" */ "./PaymentSecurity"
    ),
);
export const SeasonalCollections = lazy(
  () =>
    import(
      /* webpackChunkName: "section-seasonal-collections" */ "./SeasonalCollections"
    ),
);
export const CustomerHighlights = lazy(
  () =>
    import(
      /* webpackChunkName: "section-customer-highlights" */ "./CustomerHighlights"
    ),
);
