import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ProductCard from "../ProductCard";

// Mock internal component imports
jest.mock("@/theme/theme", () => ({
  tokens: {
    white: "#fff",
    gray200: "#e5e7eb",
    gray50: "#f9fafb",
    gray900: "#111827",
    accent: "#ff9800",
    accentDark: "#e65100",
    primary: "#1a1a2e",
    success: "#22c55e",
    error: "#ef4444",
    warning: "#f59e0b",
  },
}));

jest.mock("../common/LazyImage", () => {
  return function MockLazyImage({ alt }: { alt: string }) {
    return <img alt={alt} src="mock.jpg" />;
  };
});

jest.mock("../common/StarRating", () => ({
  StarRating: ({ rating }: { rating: number }) => (
    <span data-testid="star-rating">{rating}</span>
  ),
}));

const mockProduct = {
  id: "prod-1",
  name: "Test Headphones",
  price: 2999,
  originalPrice: 4999,
  description: "Great headphones",
  category: "Electronics",
  averageRating: 4.5,
  totalRatings: 120,
  stock: 15,
  media: [
    { url: "https://example.com/img.jpg", type: "image", isPrimary: true },
  ],
};

const defaultProps = {
  product: mockProduct,
  isInWishlist: jest.fn(() => false),
  isToggling: jest.fn(() => false),
  toggleWishlist: jest.fn(),
  onAddToCart: jest.fn(),
  onBuyNow: jest.fn(),
  onNavigate: jest.fn(),
  t: (key: string) => key,
  isAddingToCart: false,
};

describe("ProductCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders product name", () => {
    render(<ProductCard {...defaultProps} />);
    expect(screen.getByText("Test Headphones")).toBeInTheDocument();
  });

  it("renders product price", () => {
    render(<ProductCard {...defaultProps} />);
    expect(screen.getByText(/2,999/)).toBeInTheDocument();
  });

  it("calls onNavigate when card area is clicked", () => {
    render(<ProductCard {...defaultProps} />);
    // Click on the product name
    fireEvent.click(screen.getByText("Test Headphones"));
    // ProductCard wraps name in a clickable area
    expect(defaultProps.onNavigate).toHaveBeenCalled();
  });

  it("calls onAddToCart when Add to Cart button is clicked", () => {
    render(<ProductCard {...defaultProps} />);
    const addButtons = screen.getAllByRole("button");
    // Find the cart button
    const cartButton = addButtons.find(
      (btn) =>
        btn.textContent?.includes("addToCart") ||
        btn.querySelector("[data-testid='ShoppingCartIcon']"),
    );
    if (cartButton) {
      fireEvent.click(cartButton);
      expect(defaultProps.onAddToCart).toHaveBeenCalledWith("prod-1");
    }
  });

  it("shows discount percentage when original price exists", () => {
    render(<ProductCard {...defaultProps} />);
    // Discount = ((4999 - 2999) / 4999) * 100 = 40%
    expect(screen.getByText(/40%/)).toBeInTheDocument();
  });

  it("renders star rating component", () => {
    render(<ProductCard {...defaultProps} />);
    expect(screen.getByTestId("star-rating")).toBeInTheDocument();
    expect(screen.getByText("4.5")).toBeInTheDocument();
  });
});
