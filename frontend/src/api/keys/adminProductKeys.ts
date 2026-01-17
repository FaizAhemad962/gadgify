// src/api/products.keys.ts
export const adminProductsKeys = {
  all: ['admin-products'] as const,
  list: (page: number, limit: number, search: string) =>
    ['admin-products', page, limit, search] as const,
}
