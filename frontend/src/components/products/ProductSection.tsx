import { Container, type SxProps, type Theme } from "@/mui/material";
import SectionHeader from "@/components/sections/SectionHeader";
import ProductGrid, {
  type ProductGridProps,
} from "@/components/products/ProductGrid";
import type { ReactNode } from "react";
import { tokens } from "@/theme/theme";

type ProductSectionProps = ProductGridProps & {
  title: ReactNode;
  subtitle?: ReactNode;
  actionLabel?: ReactNode;
  onActionClick?: () => void;
  headerMeta?: ReactNode;
  containerSx?: SxProps<Theme>;
};

const ProductSection = ({
  title,
  subtitle,
  actionLabel,
  onActionClick,
  headerMeta,
  containerSx,
  ...gridProps
}: ProductSectionProps) => (
  <Container
    maxWidth={false}
    sx={[
      {
        py: { xs: 2.5, md: 4 },
        px: tokens.pagePaddingX,
        maxWidth: tokens.appMaxWidth,
      },
      ...(Array.isArray(containerSx)
        ? containerSx
        : containerSx
          ? [containerSx]
          : []),
    ]}
  >
    <SectionHeader
      title={title}
      subtitle={subtitle}
      actionLabel={actionLabel}
      onActionClick={onActionClick}
    />
    {headerMeta}
    <ProductGrid {...gridProps} />
  </Container>
);

export default ProductSection;
