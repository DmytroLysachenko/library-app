import React from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";

interface ColorPickerProps {
  value: string;
  onPickerChange: (color: string) => void;
}

const ColorPicker = ({ value, onPickerChange }: ColorPickerProps) => {
  return (
    <div className="relative">
      <div className="flex flex-row items-center justify-center mb-4">
        <p>#</p>
        <HexColorInput
          color={value}
          onChange={onPickerChange}
          className="hex-input"
        />
      </div>

      <HexColorPicker
        color={value}
        onChange={onPickerChange}
      />
    </div>
  );
};

export default ColorPicker;
