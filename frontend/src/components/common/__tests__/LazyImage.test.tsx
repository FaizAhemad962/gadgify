import { render, screen, fireEvent } from "@testing-library/react";
import LazyImage from "../LazyImage";

describe("LazyImage", () => {
  it("renders an img element with src and alt", () => {
    render(<LazyImage src="https://example.com/img.jpg" alt="Test image" />);
    const img = screen.getByAltText("Test image") as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toBe("https://example.com/img.jpg");
  });

  it("shows 'No Image' when src is empty", () => {
    render(<LazyImage src="" alt="empty" />);
    expect(screen.getByText("No Image")).toBeInTheDocument();
  });

  it("shows 'No Image' on load error", () => {
    render(<LazyImage src="https://example.com/broken.jpg" alt="broken" />);
    const img = screen.getByAltText("broken");
    fireEvent.error(img);
    expect(screen.getByText("No Image")).toBeInTheDocument();
  });

  it("sets loaded state on successful load", () => {
    render(<LazyImage src="https://example.com/ok.jpg" alt="ok" />);
    const img = screen.getByAltText("ok") as HTMLImageElement;
    fireEvent.load(img);
    // After load, opacity should be 1 (visible)
    expect(img.style.opacity).toBe("1");
  });

  it("applies the objectFit style", () => {
    render(
      <LazyImage
        src="https://example.com/img.jpg"
        alt="fit"
        objectFit="contain"
      />,
    );
    const img = screen.getByAltText("fit") as HTMLImageElement;
    expect(img.style.objectFit).toBe("contain");
  });
});
