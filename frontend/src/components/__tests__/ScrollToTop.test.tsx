import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ScrollToTop from "../ScrollToTop";

describe("ScrollToTop", () => {
  beforeEach(() => {
    window.scrollTo = jest.fn();
  });

  it("scrolls to top on mount", async () => {
    render(
      <MemoryRouter initialEntries={["/products"]}>
        <ScrollToTop />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(window.scrollTo).toHaveBeenCalledWith({
        top: 0,
        left: 0,
        behavior: "auto",
      });
      expect(window.scrollTo).toHaveBeenCalled();
    });
  });

  it("renders nothing (returns null)", () => {
    const { container } = render(
      <MemoryRouter>
        <ScrollToTop />
      </MemoryRouter>,
    );
    expect(container.innerHTML).toBe("");
  });
});
