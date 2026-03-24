import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CustomLoadingButton } from "../CustomLoadingButton";

describe("CustomLoadingButton", () => {
  it("renders children text", () => {
    render(<CustomLoadingButton>Submit</CustomLoadingButton>);
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
  });

  it("is disabled when isLoading is true", () => {
    render(<CustomLoadingButton isLoading>Saving</CustomLoadingButton>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("shows spinner when isLoading", () => {
    render(<CustomLoadingButton isLoading>Saving</CustomLoadingButton>);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("does not show spinner when not loading", () => {
    render(<CustomLoadingButton>Save</CustomLoadingButton>);
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("calls onClick when clicked and not loading", () => {
    const onClick = jest.fn();
    render(<CustomLoadingButton onClick={onClick}>Go</CustomLoadingButton>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire onClick when disabled", () => {
    const onClick = jest.fn();
    render(
      <CustomLoadingButton onClick={onClick} disabled>
        Go
      </CustomLoadingButton>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });
});
