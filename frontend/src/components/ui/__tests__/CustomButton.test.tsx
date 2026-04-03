import { render, screen, fireEvent } from "@testing-library/react";
import { CustomButton } from "../CustomButton";

describe("CustomButton", () => {
  it("renders children text", () => {
    render(<CustomButton>Click me</CustomButton>);
    expect(
      screen.getByRole("button", { name: "Click me" }),
    ).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = jest.fn();
    render(<CustomButton onClick={onClick}>Click</CustomButton>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is true", () => {
    render(<CustomButton disabled>Disabled</CustomButton>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is disabled when isLoading is true", () => {
    render(<CustomButton isLoading>Loading</CustomButton>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("shows CircularProgress when isLoading", () => {
    render(<CustomButton isLoading>Loading</CustomButton>);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("does not show CircularProgress when not loading", () => {
    render(<CustomButton>Normal</CustomButton>);
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });
});
