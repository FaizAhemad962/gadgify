import { render, screen, fireEvent } from "@testing-library/react";
import { CustomIconButton } from "../CustomIconButton";

describe("CustomIconButton", () => {
  it("renders with children", () => {
    render(
      <CustomIconButton aria-label="close">
        <span>X</span>
      </CustomIconButton>,
    );
    expect(screen.getByRole("button", { name: "close" })).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = jest.fn();
    render(
      <CustomIconButton onClick={onClick} aria-label="action">
        <span>+</span>
      </CustomIconButton>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is true", () => {
    render(
      <CustomIconButton disabled aria-label="disabled">
        <span>-</span>
      </CustomIconButton>,
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
