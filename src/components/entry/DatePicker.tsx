'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { formatThaiDate, isFutureDate, parseISODate } from '@/lib/thai-date';

interface DatePickerProps {
  value: string; // ISO format: YYYY-MM-DD
  onChange: (date: string) => void;
  error?: string;
}

/**
 * Date Picker Component with Thai date formatting
 * Story 4.4 - AC1, AC2, AC3, AC4: Date selection with Thai format and future warning
 */
export function DatePicker({ value, onChange, error }: DatePickerProps) {
  const [open, setOpen] = useState(false);

  // Parse the ISO string to Date for Calendar component
  const selectedDate = value ? parseISODate(value) : new Date();

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      // Convert to ISO format for storage
      const isoDate = format(date, 'yyyy-MM-dd');
      onChange(isoDate);
      setOpen(false);
    }
  };

  const showFutureWarning = value && isFutureDate(value, 1);

  return (
    <div className="space-y-2">
      <Label htmlFor="entry-date">Date *</Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="entry-date"
            type="button"
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal min-h-[44px]',
              !value && 'text-muted-foreground',
              error && 'border-destructive'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? formatThaiDate(value) : 'Select date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Future date warning (AC4) */}
      {showFutureWarning && (
        <p className="text-sm text-amber-600 dark:text-amber-500">
          ⚠️ Selected date is in the future
        </p>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
