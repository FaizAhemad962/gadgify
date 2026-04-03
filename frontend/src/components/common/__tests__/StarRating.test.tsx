import { render, screen } from "@testing-library/react";
import { StarRating } from "../StarRating";

describe("StarRating", () => {
  it("renders the rating number", () => {
    render(<StarRating rating={4.5} />);
    expect(screen.getByText("4.5")).toBeInTheDocument();
  });

  it("renders total ratings count when provided", () => {
    render(<StarRating rating={3.0} totalRatings={120} />);
    expect(screen.getByText("3.0")).toBeInTheDocument();
    expect(screen.getByText("(120)")).toBeInTheDocument();
  });

  it("hides rating number when showNumber is false", () => {
    render(<StarRating rating={4.0} showNumber={false} />);
    expect(screen.queryByText("4.0")).not.toBeInTheDocument();
  });

  it("does not show total ratings when not provided", () => {
    render(<StarRating rating={5.0} />);
    expect(screen.getByText("5.0")).toBeInTheDocument();
    expect(screen.queryByText(/\(\d+\)/)).not.toBeInTheDocument();
  });

  it("renders 5 stars for a perfect rating", () => {
    const { container } = render(<StarRating rating={5} showNumber={false} />);
    // All 5 should be full stars (Star icon), no half or empty
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBe(5);
  });

  it("renders for zero rating", () => {
    const { container } = render(<StarRating rating={0} showNumber={false} />);
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBe(5); // 5 empty stars
  });
});
