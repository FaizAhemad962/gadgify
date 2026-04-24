/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Carousel Component Usage Examples
 *
 * This file demonstrates various ways to use the custom Carousel component
 * with different configurations and use cases.
 */

import { useQuery } from "@tanstack/react-query";
import { Box, Card, Typography } from "@mui/material";
import { Carousel, type CarouselProps } from "@/components/common";
import { productsApi } from "@/api/products";
import ProductCard from "@/components/ProductCard";
import { tokens } from "@/theme/theme";
import React from "react";

// ============================================================================
// EXAMPLE 1: Basic Product Carousel
// ============================================================================
export const BasicProductCarousel = () => {
  const { data } = useQuery({
    queryKey: ["products"],
    queryFn: () => productsApi.getAll({ limit: 8 }),
  });

  const products = data?.products || [];

  return (
    <Carousel
      items={products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isInWishlist={function (_id: string): boolean {
            throw new Error("Function not implemented.");
          }}
          isToggling={function (_id: string): boolean {
            throw new Error("Function not implemented.");
          }}
          toggleWishlist={function (_id: string): Promise<void> {
            throw new Error("Function not implemented.");
          }}
          onAddToCart={function (_id: string): void {
            throw new Error("Function not implemented.");
          }}
          onBuyNow={function (_id: string): void {
            throw new Error("Function not implemented.");
          }}
          onNavigate={function (_id: string): void {
            throw new Error("Function not implemented.");
          }}
          t={function (_key: string): string {
            throw new Error("Function not implemented.");
          }}
        />
      ))}
      slidesPerView={3}
      spaceBetween={16}
      showNavigation={true}
      showPagination={true}
    />
  );
};

// ============================================================================
// EXAMPLE 2: Banner/Hero Carousel with Autoplay
// ============================================================================
export const HeroBannerCarousel = () => {
  const banners = [
    {
      id: 1,
      image: "/banners/banner-1.jpg",
      title: "Summer Sale",
      description: "Up to 50% off on selected items",
    },
    {
      id: 2,
      image: "/banners/banner-2.jpg",
      title: "New Arrivals",
      description: "Check out our latest products",
    },
    {
      id: 3,
      image: "/banners/banner-3.jpg",
      title: "Exclusive Deals",
      description: "Limited time offers",
    },
  ];

  return (
    <Carousel
      items={banners.map((banner) => (
        <Box
          key={banner.id}
          sx={{
            position: "relative",
            width: "100%",
            height: { xs: 250, sm: 350, md: 450 },
            borderRadius: 2,
            overflow: "hidden",
            backgroundImage: `url(${banner.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "flex-end",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
              padding: { xs: 2, md: 4 },
              color: tokens.white,
            }}
          >
            <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
              {banner.title}
            </Typography>
            <Typography variant="body2">{banner.description}</Typography>
          </Box>
        </Box>
      ))}
      slidesPerView={1}
      spaceBetween={0}
      autoplay={true}
      autoplayDelay={4000}
      showPagination={true}
      loop={true}
      hidePaginationOnMobile={false}
    />
  );
};

// ============================================================================
// EXAMPLE 3: Brand Logo Carousel
// ============================================================================
export const BrandLogosCarousel = () => {
  const brands = [
    { id: 1, name: "Sony", logo: "/logos/sony.png" },
    { id: 2, name: "Samsung", logo: "/logos/samsung.png" },
    { id: 3, name: "Apple", logo: "/logos/apple.png" },
    { id: 4, name: "LG", logo: "/logos/lg.png" },
    { id: 5, name: "Bosch", logo: "/logos/bosch.png" },
  ];

  return (
    <Carousel
      items={brands.map((brand) => (
        <Box
          key={brand.id}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 150,
            background: tokens.white,
            border: `1px solid ${tokens.gray200}`,
            borderRadius: 2,
            padding: 2,
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: `0 4px 12px rgba(0,0,0,0.1)`,
            },
          }}
        >
          <img
            src={brand.logo}
            alt={brand.name}
            style={{ maxWidth: "80%", maxHeight: "80%", objectFit: "contain" }}
          />
        </Box>
      ))}
      slidesPerView={5}
      spaceBetween={16}
      showNavigation={true}
      showPagination={false}
      pauseOnHover={false}
      breakpoints={[
        { breakpoint: 0, slidesPerView: 2, spaceBetween: 12 },
        { breakpoint: 600, slidesPerView: 3, spaceBetween: 14 },
        { breakpoint: 960, slidesPerView: 4, spaceBetween: 16 },
        { breakpoint: 1280, slidesPerView: 5, spaceBetween: 18 },
      ]}
    />
  );
};

// ============================================================================
// EXAMPLE 4: Testimonials/Reviews Carousel
// ============================================================================
export const TestimonialsCarousel = () => {
  const testimonials = [
    {
      id: 1,
      author: "John Doe",
      rating: 5,
      text: "Great products and excellent service!",
      avatar: "/avatars/john.jpg",
    },
    {
      id: 2,
      author: "Jane Smith",
      rating: 5,
      text: "Very satisfied with my purchase. Highly recommended!",
      avatar: "/avatars/jane.jpg",
    },
    {
      id: 3,
      author: "Mike Johnson",
      rating: 4,
      text: "Good quality and fast delivery.",
      avatar: "/avatars/mike.jpg",
    },
  ];

  return (
    <Carousel
      items={testimonials.map((testimonial) => (
        <Card
          key={testimonial.id}
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            padding: 3,
            background: `linear-gradient(135deg, ${tokens.gray50}, ${tokens.white})`,
          }}
        >
          <Box sx={{ mb: 2 }}>
            {/* Stars */}
            <Box sx={{ display: "flex", gap: 0.5, mb: 2 }}>
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    fontSize: "20px",
                    color: tokens.accent,
                  }}
                >
                  ★
                </Box>
              ))}
            </Box>
            <Typography variant="body2" sx={{ color: "text.primary", mb: 2 }}>
              "{testimonial.text}"
            </Typography>
          </Box>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 2, mt: "auto" }}
          >
            <img
              src={testimonial.avatar}
              alt={testimonial.author}
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
            <Typography variant="subtitle2" fontWeight={600}>
              {testimonial.author}
            </Typography>
          </Box>
        </Card>
      ))}
      slidesPerView={3}
      spaceBetween={16}
      autoplay={true}
      autoplayDelay={6000}
      showPagination={true}
    />
  );
};

// ============================================================================
// EXAMPLE 5: 3D Coverflow Effect Carousel
// ============================================================================
export const CoverflowtCarousel = () => {
  const { data } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => productsApi.getAll({ limit: 8 }),
  });

  const products = data?.products || [];

  return (
    <Carousel
      items={products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isInWishlist={function (_id: string): boolean {
            throw new Error("Function not implemented.");
          }}
          isToggling={function (_id: string): boolean {
            throw new Error("Function not implemented.");
          }}
          toggleWishlist={function (_id: string): Promise<void> {
            throw new Error("Function not implemented.");
          }}
          onAddToCart={function (_id: string): void {
            throw new Error("Function not implemented.");
          }}
          onBuyNow={function (_id: string): void {
            throw new Error("Function not implemented.");
          }}
          onNavigate={function (_id: string): void {
            throw new Error("Function not implemented.");
          }}
          t={function (_key: string): string {
            throw new Error("Function not implemented.");
          }}
        />
      ))}
      slidesPerView={3}
      spaceBetween={16}
      effect="coverflow"
      centeredSlides={true}
      showNavigation={true}
      showPagination={true}
      autoplay={true}
      autoplayDelay={5000}
    />
  );
};

// ============================================================================
// EXAMPLE 6: Mobile-Optimized Carousel
// ============================================================================
export const MobileOptimizedCarousel = () => {
  const { data } = useQuery({
    queryKey: ["products"],
    queryFn: () => productsApi.getAll({ limit: 12 }),
  });

  const products = data?.products || [];

  return (
    <Carousel
      items={products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isInWishlist={function (_id: string): boolean {
            throw new Error("Function not implemented.");
          }}
          isToggling={function (_id: string): boolean {
            throw new Error("Function not implemented.");
          }}
          toggleWishlist={function (_id: string): Promise<void> {
            throw new Error("Function not implemented.");
          }}
          onAddToCart={function (_id: string): void {
            throw new Error("Function not implemented.");
          }}
          onBuyNow={function (_id: string): void {
            throw new Error("Function not implemented.");
          }}
          onNavigate={function (_id: string): void {
            throw new Error("Function not implemented.");
          }}
          t={function (_key: string): string {
            throw new Error("Function not implemented.");
          }}
        />
      ))}
      slidesPerView={2}
      spaceBetween={8}
      showNavigation={true}
      showPagination={true}
      hidePaginationOnMobile={false}
      breakpoints={[
        { breakpoint: 0, slidesPerView: 1.5, spaceBetween: 8 }, // Mobile - 1.5 slides visible
        { breakpoint: 480, slidesPerView: 2, spaceBetween: 10 },
        { breakpoint: 768, slidesPerView: 3, spaceBetween: 12 },
        { breakpoint: 1024, slidesPerView: 4, spaceBetween: 16 },
      ]}
    />
  );
};

// ============================================================================
// EXAMPLE 7: Full-Featured Customized Carousel
// ============================================================================
export const FullFeaturedCarousel = () => {
  const { data } = useQuery({
    queryKey: ["products"],
    queryFn: () => productsApi.getAll({ limit: 20 }),
  });

  const products = data?.products || [];
  const [currentSlide, setCurrentSlide] = React.useState(0);

  const carouselProps: CarouselProps = {
    items: products.map((product) => (
      <ProductCard
        key={product.id}
        product={product}
        isInWishlist={function (_id: string): boolean {
          throw new Error("Function not implemented.");
        }}
        isToggling={function (_id: string): boolean {
          throw new Error("Function not implemented.");
        }}
        toggleWishlist={function (_id: string): Promise<void> {
          throw new Error("Function not implemented.");
        }}
        onAddToCart={function (_id: string): void {
          throw new Error("Function not implemented.");
        }}
        onBuyNow={function (_id: string): void {
          throw new Error("Function not implemented.");
        }}
        onNavigate={function (_id: string): void {
          throw new Error("Function not implemented.");
        }}
        t={function (_key: string): string {
          throw new Error("Function not implemented.");
        }}
      />
    )),
    slidesPerView: 3,
    spaceBetween: 16,
    autoplay: true,
    autoplayDelay: 5000,
    showNavigation: true,
    showPagination: true,
    loop: true,
    effect: "slide",
    pauseOnHover: true,
    keyboard: true,
    mouseWheel: true,
    lazy: true,
    hidePaginationOnMobile: true,
    onSlideChange: (index) => setCurrentSlide(index),
    sx: {
      borderRadius: 3,
      overflow: "hidden",
      boxShadow: `0 4px 20px rgba(0,0,0,0.1)`,
    },
    navButtonSx: {
      background: `${tokens.primary}dd`,
      "&:hover": {
        background: tokens.primary,
      },
    },
    ariaLabel: "Product showcase carousel",
  };

  return (
    <Box>
      <Carousel {...carouselProps} />
      <Typography
        variant="caption"
        sx={{
          display: "block",
          textAlign: "center",
          mt: 2,
          color: "text.secondary",
        }}
      >
        Showing slide {currentSlide + 1} of {products.length}
      </Typography>
    </Box>
  );
};

// ============================================================================
// EXPORT USAGE EXAMPLES
// ============================================================================
export default {
  BasicProductCarousel,
  HeroBannerCarousel,
  BrandLogosCarousel,
  TestimonialsCarousel,
  CoverflowtCarousel,
  MobileOptimizedCarousel,
  FullFeaturedCarousel,
};
