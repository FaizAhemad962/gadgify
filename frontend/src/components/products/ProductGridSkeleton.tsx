import { Box, Card, CardContent, Skeleton } from "@/mui/material";
import { tokens } from "@/theme/theme";
import {
  productCardLayout,
  productGridColumns,
  productGridGap,
} from "@/components/products/productLayout";

type ProductGridSkeletonProps = {
  count?: number;
  columns?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
  };
};

const ProductGridSkeleton = ({
  count = 4,
  columns = productGridColumns,
}: ProductGridSkeletonProps) => (
  <Box
    aria-hidden="true"
    sx={{
      display: "grid",
      gridTemplateColumns: columns,
      gap: productGridGap,
    }}
  >
    {Array.from({ length: count }).map((_, index) => (
      <Card
        key={index}
        sx={{
          height: "100%",
          borderRadius: productCardLayout.radius,
          border: `1px solid ${tokens.gray200}`,
          overflow: "hidden",
        }}
      >
        <Skeleton
          variant="rectangular"
          height={productCardLayout.skeletonImageHeight}
          animation="wave"
        />
        <CardContent sx={{ p: 2 }}>
          <Skeleton variant="text" width="86%" height={24} />
          <Skeleton variant="text" width="64%" height={20} />
          <Skeleton variant="text" width="42%" height={22} sx={{ mt: 1 }} />
          <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
            <Skeleton variant="rounded" width="50%" height={36} />
            <Skeleton variant="rounded" width="50%" height={36} />
          </Box>
        </CardContent>
      </Card>
    ))}
  </Box>
);

export default ProductGridSkeleton;
