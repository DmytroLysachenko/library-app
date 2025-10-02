import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

const hexColorInputMock = jest.fn();
const hexColorPickerMock = jest.fn();

jest.mock("react-colorful", () => ({
  __esModule: true,
  HexColorInput: ({
    color,
    onChange,
  }: {
    color: string;
    onChange: (value: string) => void;
  }) => {
    hexColorInputMock(color);
    return (
      <input
        data-testid="hex-color-input"
        value={color}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  },
  HexColorPicker: ({
    color,
    onChange,
  }: {
    color: string;
    onChange: (value: string) => void;
  }) => {
    hexColorPickerMock(color);
    return (
      <button
        type="button"
        data-testid="hex-color-picker"
        data-color={color}
        onClick={() => onChange("fedcba")}
      >
        Pick Color
      </button>
    );
  },
}));

import ColorPicker from "@/components/admin/ColorPicker";

describe("ColorPicker", () => {
  beforeEach(() => {
    hexColorInputMock.mockClear();
    hexColorPickerMock.mockClear();
  });

  it("passes the current color to both the input and the picker", () => {
    render(
      <ColorPicker
        value="ff8800"
        onPickerChange={jest.fn()}
      />
    );

    expect(screen.getByTestId("hex-color-input")).toHaveValue("ff8800");
    expect(screen.getByTestId("hex-color-picker")).toHaveAttribute("data-color", "ff8800");
    expect(hexColorInputMock).toHaveBeenCalledWith("ff8800");
    expect(hexColorPickerMock).toHaveBeenCalledWith("ff8800");
  });

  it("propagates changes from the hex input", () => {
    const onPickerChange = jest.fn();

    render(
      <ColorPicker
        value="112233"
        onPickerChange={onPickerChange}
      />
    );

    fireEvent.change(screen.getByTestId("hex-color-input"), {
      target: { value: "123456" },
    });

    expect(onPickerChange).toHaveBeenCalledWith("123456");
  });

  it("propagates selections from the color picker", () => {
    const onPickerChange = jest.fn();

    render(
      <ColorPicker
        value="654321"
        onPickerChange={onPickerChange}
      />
    );

    fireEvent.click(screen.getByTestId("hex-color-picker"));

    expect(onPickerChange).toHaveBeenCalledWith("fedcba");
  });
});
