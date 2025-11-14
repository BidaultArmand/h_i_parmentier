import React from 'react';

const Slider = ({ 
  label, 
  value, 
  onChange, 
  leftLabel = '', 
  rightLabel = '',
  min = 0,
  max = 100,
  step = 1 
}) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-base font-medium text-gray-900">
          {label}
        </label>
        <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          {value}
        </span>
      </div>
      <div className="space-y-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700 transition-all"
          style={{
            background: `linear-gradient(to right, #2563eb 0%, #2563eb ${value}%, #e5e7eb ${value}%, #e5e7eb 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-gray-500 font-medium">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      </div>
    </div>
  );
};

export default Slider;
