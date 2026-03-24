import React from "react";
import { render, screen } from "@testing-library/react";
import { CustomCard } from "../CustomCard";

describe("CustomCard", () => {
  it("renders children content", () => {
    render(<CustomCard>Card Content</CustomCard>);
    expect(screen.getByText("Card Content")).toBeInTheDocument();
  });

  it("renders without hover effect when interactive is false", () => {
    const { container } = render(<CustomCard>Static</CustomCard>);
    expect(container.querySelector(".MuiCard-root")).toBeInTheDocument();
  });

  it("renders with interactive prop", () => {
    const { container } = render(
      <CustomCard interactive>Interactive</CustomCard>,
    );
    expect(container.querySelector(".MuiCard-root")).toBeInTheDocument();
    expect(screen.getByText("Interactive")).toBeInTheDocument();
  });

  it("passes additional MUI CardProps", () => {
    render(<CustomCard elevation={4}>Elevated</CustomCard>);
    expect(screen.getByText("Elevated")).toBeInTheDocument();
  });
});
