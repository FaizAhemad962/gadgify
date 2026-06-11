export const queryKeys = {
  products: {
    all: ["products"] as const,
    admin: ["admin-products"] as const,
    detail: (id: string | undefined) => ["product", id] as const,
    trending: ["trending-products"] as const,
    newArrivals: ["new-arrivals"] as const,
    dealOfDay: ["deal-of-day"] as const,
    bestSellers: ["best-sellers"] as const,
    topRated: ["top-rated-products"] as const,
    flashSale: ["flash-sale-products"] as const,
    suggestions: ["product-suggestions"] as const,
    featured: ["featured-products"] as const,
    related: ["related-products"] as const,
    ratings: (productId: string | undefined) => ["ratings", productId] as const,
  },
  categories: {
    all: ["categories"] as const,
    admin: ["admin-categories"] as const,
  },
  cart: {
    all: ["cart"] as const,
  },
  wishlist: {
    all: ["wishlist"] as const,
  },
  orders: {
    all: ["orders"] as const,
    detail: (id: string | undefined) => ["order", id] as const,
    admin: ["admin-orders"] as const,
  },
  coupons: {
    admin: ["admin-coupons"] as const,
  },
  users: {
    all: ["users"] as const,
    admin: ["admin-users"] as const,
    permissions: ["permissions"] as const,
    roleChangePermissions: ["roleChangePermissions"] as const,
  },
  analytics: {
    admin: ["admin-analytics"] as const,
  },
  addresses: {
    all: ["addresses"] as const,
  },
  auth: {
    profile: ["profile"] as const,
  },
} as const;
