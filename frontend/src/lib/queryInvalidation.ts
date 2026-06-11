import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";

const invalidate = (queryClient: QueryClient, queryKey: readonly unknown[]) =>
  queryClient.invalidateQueries({ queryKey });

export const invalidateProductData = (
  queryClient: QueryClient,
  productId?: string,
) => {
  invalidate(queryClient, queryKeys.products.all);
  invalidate(queryClient, queryKeys.products.admin);
  invalidate(queryClient, queryKeys.products.trending);
  invalidate(queryClient, queryKeys.products.newArrivals);
  invalidate(queryClient, queryKeys.products.dealOfDay);
  invalidate(queryClient, queryKeys.products.bestSellers);
  invalidate(queryClient, queryKeys.products.topRated);
  invalidate(queryClient, queryKeys.products.flashSale);
  invalidate(queryClient, queryKeys.products.featured);
  invalidate(queryClient, queryKeys.products.related);
  invalidate(queryClient, queryKeys.products.suggestions);

  if (productId) {
    invalidate(queryClient, queryKeys.products.detail(productId));
    invalidate(queryClient, queryKeys.products.ratings(productId));
  }
};

export const invalidateCategoryData = (queryClient: QueryClient) => {
  invalidate(queryClient, queryKeys.categories.all);
  invalidate(queryClient, queryKeys.categories.admin);
  invalidateProductData(queryClient);
};

export const invalidateCartData = (queryClient: QueryClient) => {
  invalidate(queryClient, queryKeys.cart.all);
};

export const invalidateWishlistData = (queryClient: QueryClient) => {
  invalidate(queryClient, queryKeys.wishlist.all);
};

export const invalidateOrderData = (
  queryClient: QueryClient,
  orderId?: string,
) => {
  invalidate(queryClient, queryKeys.orders.all);
  invalidate(queryClient, queryKeys.orders.admin);
  invalidate(queryClient, queryKeys.analytics.admin);

  if (orderId) {
    invalidate(queryClient, queryKeys.orders.detail(orderId));
  }
};

export const invalidateCouponData = (queryClient: QueryClient) => {
  invalidate(queryClient, queryKeys.coupons.admin);
  invalidate(queryClient, queryKeys.cart.all);
};

export const invalidateUserData = (queryClient: QueryClient) => {
  invalidate(queryClient, queryKeys.users.all);
  invalidate(queryClient, queryKeys.users.admin);
  invalidate(queryClient, queryKeys.users.permissions);
  invalidate(queryClient, queryKeys.users.roleChangePermissions);
};

export const invalidateAddressData = (queryClient: QueryClient) => {
  invalidate(queryClient, queryKeys.addresses.all);
};
