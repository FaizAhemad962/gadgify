import React from "react";
import { render, screen } from "@testing-library/react";
import { CustomAlert } from "../CustomAlert";

describe("CustomAlert", () => {
  it("renders with severity and message", () => {
    render(<CustomAlert severity="error">Something went wrong</CustomAlert>);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renders success severity", () => {
    render(<CustomAlert severity="success">Done!</CustomAlert>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Done!")).toBeInTheDocument();
  });

  it("renders warning severity", () => {
    render(<CustomAlert severity="warning">Be careful</CustomAlert>);
    expect(screen.getByText("Be careful")).toBeInTheDocument();
  });

  it("renders info severity", () => {
    render(<CustomAlert severity="info">FYI</CustomAlert>);
    expect(screen.getByText("FYI")).toBeInTheDocument();
  });

  it("passes custom sx props", () => {
    const { container } = render(
      <CustomAlert severity="info" sx={{ color: "red" }}>
        Styled
      </CustomAlert>,
    );
    expect(container.querySelector(".MuiAlert-root")).toBeInTheDocument();
  });
});
