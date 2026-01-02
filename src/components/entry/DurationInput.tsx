'use client';

import { useState, useEffect, forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DURATION_PRESETS } from '@/lib/duration';
import { cn } from '@/lib/utils';

interface DurationInputProps {
  value: number;
  onChange: (hours: number) => void;
  error?: string;
}

/**
 * Duration Input Component with preset buttons
 * Story 4.3 - AC3, AC4, AC5: Duration input with presets and decimal support
 * Story 4.7 - AC3: Support forwardRef for focus management on quick fill
 */
export const DurationInput = forwardRef<HTMLInputElement, DurationInputProps>(
  function DurationInput({ value, onChange, error }, ref) {
  const [inputValue, setInputValue] = useState(value ? String(value) : '');

  // Sync input value when external value changes (e.g., preset button click)
  useEffect(() => {
    const parsedInput = parseFloat(inputValue);
    // Use tolerance comparison to avoid floating point precision issues
    // e.g., 0.1 + 0.2 !== 0.3 in JavaScript
    const valuesDiffer = isNaN(parsedInput) || Math.abs(value - parsedInput) > 0.001;
    if (valuesDiffer) {
      setInputValue(value ? String(value) : '');
    }
    // inputValue intentionally omitted - we only want to sync when external value changes,
    // not when user is typing (which would cause input to jump around)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    const numVal = parseFloat(val);
    if (!isNaN(numVal)) {
      onChange(numVal);
    }
  };

  const handlePresetClick = (preset: number) => {
    setInputValue(String(preset));
    onChange(preset);
  };

  const handleBlur = () => {
    // Round to nearest 0.25 on blur
    const numVal = parseFloat(inputValue);
    if (!isNaN(numVal) && numVal > 0) {
      const rounded = Math.round(numVal * 4) / 4;
      setInputValue(String(rounded));
      onChange(rounded);
    }
  };

  return (
    <div className="space-y-3">
      <Label htmlFor="durationHours">Duration (hours) *</Label>

      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2">
        {DURATION_PRESETS.map((preset) => (
          <Button
            key={preset}
            type="button"
            variant={value === preset ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePresetClick(preset)}
            className="min-w-[60px]"
            data-selected={value === preset}
          >
            {preset}h
          </Button>
        ))}
      </div>

      {/* Custom input */}
      <div className="relative">
        <Input
          ref={ref}
          id="durationHours"
          type="number"
          step="0.25"
          min="0.25"
          max="24"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder="Enter hours"
          className={cn(
            'pr-12',
            error && 'border-destructive'
          )}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
          hrs
        </span>
      </div>

      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

      {/* Helper text */}
      <p className="text-xs text-muted-foreground">
        Enter hours (e.g., 1.5 = 1 hr 30 min)
      </p>
    </div>
  );
});
