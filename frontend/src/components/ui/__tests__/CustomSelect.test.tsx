import React from "react";
import { render, screen } from "@testing-library/react";
import { CustomSelect } from "../CustomSelect";

describe("CustomSelect", () => {
  const options = [
    { value: "a", label: "Option A" },
    { value: "b", label: "Option B" },
    { value: "c", label: "Option C" },
  ];

  it("renders with label", () => {
    render(<CustomSelect label="Category" options={options} value="a" />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("Category")).toBeInTheDocument();
  });

  it("renders the selected value", () => {
    render(<CustomSelect label="Pick" options={options} value="b" />);
    expect(screen.getByText("Option B")).toBeInTheDocument();
  });

  it("renders with no selection", () => {
    render(<CustomSelect label="Pick" options={options} value="" />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("Pick")).toBeInTheDocument();
  });
});
