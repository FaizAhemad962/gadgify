import { render, screen } from "@testing-library/react";
import { CustomTextField } from "../CustomTextField";

describe("CustomTextField", () => {
  it("renders with label", () => {
    render(<CustomTextField label="Email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("renders with placeholder", () => {
    render(<CustomTextField placeholder="Enter name" />);
    expect(screen.getByPlaceholderText("Enter name")).toBeInTheDocument();
  });

  it("renders as disabled", () => {
    render(<CustomTextField label="Disabled" disabled />);
    expect(screen.getByLabelText("Disabled")).toBeDisabled();
  });

  it("displays helper text", () => {
    render(<CustomTextField label="Password" helperText="Min 8 chars" />);
    expect(screen.getByText("Min 8 chars")).toBeInTheDocument();
  });

  it("renders in error state", () => {
    render(<CustomTextField label="Name" error helperText="Required" />);
    expect(screen.getByText("Required")).toBeInTheDocument();
  });
});
