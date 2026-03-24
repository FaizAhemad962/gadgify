import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import QuantityInput from "../QuantityInput";

describe("QuantityInput", () => {
  it("renders the current value", () => {
    render(<QuantityInput value={3} onChange={jest.fn()} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("increments value when + is clicked", () => {
    const onChange = jest.fn();
    render(<QuantityInput value={2} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("increase quantity"));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("decrements value when - is clicked", () => {
    const onChange = jest.fn();
    render(<QuantityInput value={3} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("decrease quantity"));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("does not decrement below min", () => {
    const onChange = jest.fn();
    render(<QuantityInput value={1} min={1} onChange={onChange} />);
    const decreaseBtn = screen.getByLabelText("decrease quantity");
    expect(decreaseBtn).toBeDisabled();
    fireEvent.click(decreaseBtn);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not increment above max", () => {
    const onChange = jest.fn();
    render(<QuantityInput value={5} max={5} onChange={onChange} />);
    const increaseBtn = screen.getByLabelText("increase quantity");
    expect(increaseBtn).toBeDisabled();
    fireEvent.click(increaseBtn);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("disables both buttons when disabled prop is true", () => {
    render(<QuantityInput value={3} onChange={jest.fn()} disabled />);
    expect(screen.getByLabelText("decrease quantity")).toBeDisabled();
    expect(screen.getByLabelText("increase quantity")).toBeDisabled();
  });

  it("uses default min of 1", () => {
    const onChange = jest.fn();
    render(<QuantityInput value={1} onChange={onChange} />);
    expect(screen.getByLabelText("decrease quantity")).toBeDisabled();
  });
});
