import React from 'react';

const SliderInput = ({ id, label, value, onChange, min, max, step, unit, note = '' }) => (
    <div className="mb-4">
        <label htmlFor={id} className="flex justify-between text-sm font-medium text-gray-700 mb-1">
            <span className="slider-label">{label}</span>
            <span className="slider-value font-bold text-indigo-700">
                {value.toFixed(id === 'mortgage_length' ? 0 : 1)}{unit}
            </span>
        </label>
        <input
            type="range"
            id={id}
            name={id}
            min={min}
            max={max}
            value={value}
            step={step || 1}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={onChange}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
        />
        {note && <p className="text-xs text-gray-600 mt-1">{note}</p>}
    </div>
);

export default SliderInput;