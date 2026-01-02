/**
 * FilterSheet Component
 * Mobile-friendly bottom sheet for filter controls
 * Enterprise Filter Pattern - Part 2
 */

'use client';

import { ReactNode } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface FilterSheetProps {
  title?: string;
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: () => void;
  onClear: () => void;
  activeFilterCount?: number;
  triggerClassName?: string;
}

export function FilterSheet({
  title = 'Filters',
  children,
  open,
  onOpenChange,
  onApply,
  onClear,
  activeFilterCount = 0,
  triggerClassName,
}: FilterSheetProps) {
  const handleApply = () => {
    onApply();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn('relative sm:hidden', triggerClassName)}
          aria-label="Open filters"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-auto max-h-[85vh] rounded-t-xl px-6 pt-3 pb-6">
        <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-muted" />
        <SheetHeader className="pb-2">
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 py-2">{children}</div>
        <SheetFooter className="flex-row gap-2">
          <Button variant="outline" onClick={onClear} className="flex-1">
            Clear All
          </Button>
          <Button onClick={handleApply} className="flex-1">
            Apply{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

interface FilterFieldProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export function FilterField({ label, children, className }: FilterFieldProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}
