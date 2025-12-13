import { useState } from "react";

interface PreferenceSliderProps {
  label: string;
  defaultValue?: number;
  onChange?: (value: number) => void;
}

export default function PreferenceSlider({ label, defaultValue = 50, onChange }: PreferenceSliderProps) {
  const [value, setValue] = useState(defaultValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    setValue(newValue);
    onChange?.(newValue);
  };

  return (
    <div className="space-y-2" data-testid={`container-slider-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex justify-between items-center">
        <label className="text-sm text-text-secondary">{label}</label>
        <span className="text-accent-gold font-bold text-sm">{value}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={handleChange}
        className="w-full"
        data-testid={`input-slider-${label.toLowerCase().replace(/\s+/g, '-')}`}
      />
    </div>
  );
}
