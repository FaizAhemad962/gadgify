import { Box, Typography, type SxProps, type Theme } from "@/mui/material";
import ProductCard from "@/components/ProductCard";
import ProductGridSkeleton from "@/components/products/ProductGridSkeleton";
import { productGridColumns, productGridGap } from "@/components/products/productLayout";
import type { Product } from "@/types";
import type { ReactNode } from "react";

type ProductGridColumns = {
  xs?: string;
  sm?: string;
  md?: string;
  lg?: string;
};

export type ProductGridProps = {
  products: Product[];
  isLoading?: boolean;
  skeletonCount?: number;
  emptyMessage?: ReactNode;
  columns?: ProductGridColumns;
  isInWishlist: (id: string) => boolean;
  isToggling: (id: string) => boolean;
  toggleWishlist: (id: string) => Promise<void>;
  onAddToCart: (id: string) => void | Promise<void>;
  onBuyNow: (id: string) => void | Promise<void>;
  onNavigate: (id: string) => void;
  t: (key: string) => string;
  sx?: SxProps<Theme>;
};

const ProductGrid = ({
  products,
  isLoading = false,
  skeletonCount = 4,
  emptyMessage,
  columns = productGridColumns,
  isInWishlist,
  isToggling,
  toggleWishlist,
  onAddToCart,
  onBuyNow,
  onNavigate,
  t,
  sx,
}: ProductGridProps) => {
  if (isLoading) {
    return <ProductGridSkeleton count={skeletonCount} columns={columns} />;
  }

  if (products.length === 0) {
    return emptyMessage ? (
      <Box sx={{ textAlign: "center", py: 6 }}>
        {typeof emptyMessage === "string" ? (
          <Typography variant="body1" color="text.secondary">
            {emptyMessage}
          </Typography>
        ) : (
          emptyMessage
        )}
      </Box>
    ) : null;
  }

  return (
    <Box
      sx={[
        {
          display: "grid",
          gridTemplateColumns: columns,
          gridAutoRows: "1fr",
          gap: productGridGap,
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isInWishlist={isInWishlist}
          isToggling={isToggling}
          toggleWishlist={toggleWishlist}
          onAddToCart={onAddToCart}
          onBuyNow={onBuyNow}
          onNavigate={onNavigate}
          t={t}
        />
      ))}
    </Box>
  );
};

export default ProductGrid;
