import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ScrollToTop from "../ScrollToTop";

describe("ScrollToTop", () => {
  beforeEach(() => {
    window.scrollTo = jest.fn();
  });

  it("calls window.scrollTo on mount", () => {
    render(
      <MemoryRouter initialEntries={["/products"]}>
        <ScrollToTop />
      </MemoryRouter>,
    );
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: "smooth",
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
