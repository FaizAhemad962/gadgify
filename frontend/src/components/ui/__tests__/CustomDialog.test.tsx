import { render, screen } from "@testing-library/react";
import { CustomDialog } from "../CustomDialog";

describe("CustomDialog", () => {
  const defaultProps = {
    open: true,
    title: "Confirm Action",
    contentNode: <p>Are you sure?</p>,
    onClose: jest.fn(),
  };

  it("renders title and content when open", () => {
    render(<CustomDialog {...defaultProps} />);
    expect(screen.getByText("Confirm Action")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
  });

  it("renders actions when provided", () => {
    render(<CustomDialog {...defaultProps} actions={<button>OK</button>} />);
    expect(screen.getByRole("button", { name: "OK" })).toBeInTheDocument();
  });

  it("does not render actions when not provided", () => {
    render(<CustomDialog {...defaultProps} />);
    expect(
      screen.queryByRole("button", { name: "OK" }),
    ).not.toBeInTheDocument();
  });

  it("is not visible when open is false", () => {
    render(<CustomDialog {...defaultProps} open={false} />);
    expect(screen.queryByText("Confirm Action")).not.toBeInTheDocument();
  });
});
