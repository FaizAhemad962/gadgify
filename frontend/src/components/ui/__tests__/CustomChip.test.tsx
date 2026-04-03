import { render, screen } from "@testing-library/react";
import { CustomChip } from "../CustomChip";

describe("CustomChip", () => {
  it("renders with label", () => {
    render(<CustomChip label="Electronics" />);
    expect(screen.getByText("Electronics")).toBeInTheDocument();
  });

  it("renders with custom color prop", () => {
    render(<CustomChip label="Sale" color="error" />);
    expect(screen.getByText("Sale")).toBeInTheDocument();
  });

  it("renders as deletable chip", () => {
    const onDelete = jest.fn();
    render(<CustomChip label="Remove me" onDelete={onDelete} />);
    expect(screen.getByText("Remove me")).toBeInTheDocument();
  });
});
