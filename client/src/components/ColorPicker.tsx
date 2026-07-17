import React from 'react';
import { DEFAULT_COLORS } from '../constants';
import { FiCheck } from 'react-icons/fi';

interface ColorPickerProps {
  selectedColorId: string;
  onChange: (colorId: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColorId,
  onChange
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {DEFAULT_COLORS.map((color) => {
        const isSelected = selectedColorId === color.id;
        return (
          <button
            key={color.id}
            type="button"
            onClick={() => onChange(color.id)}
            style={{ backgroundColor: color.hex }}
            className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center relative shadow-md hover:scale-110 active:scale-95 ${
              isSelected ? 'border-white scale-105 shadow-lg' : 'border-transparent'
            }`}
            title={color.name}
          >
            {isSelected && (
              <FiCheck className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] h-4 w-4 stroke-[3]" />
            )}
          </button>
        );
      })}
    </div>
  );
};
