/**
 * FilterSheet Component
 * Mobile-friendly bottom sheet for filter controls
 * Enterprise Filter Pattern - Part 2
 */

'use client';

import { ReactNode } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
  SheetClose,
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
  /** Sheet side: bottom (mobile) or right (desktop). Default: bottom */
  side?: 'bottom' | 'right';
  /** Show built-in trigger button. Default: true */
  showTrigger?: boolean;
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
  side = 'bottom',
  showTrigger = true,
}: FilterSheetProps) {
  const handleApply = () => {
    onApply();
    onOpenChange(false);
  };

  const isBottom = side === 'bottom';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {showTrigger && (
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
      )}
      <SheetContent
        side={side}
        className={cn(
          '[&>button]:hidden',
          isBottom && 'h-auto max-h-[85vh] rounded-t-xl px-6 pt-3 pb-6'
        )}
      >
        <div className={cn('flex items-center justify-between', isBottom ? 'mb-3' : 'mb-4')}>
          <SheetTitle>{title}</SheetTitle>
          <SheetClose asChild>
            <Button variant="ghost" size="icon-sm" className="-mr-2">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </SheetClose>
        </div>
        <div className={cn('flex flex-col gap-4', isBottom ? 'py-2' : 'py-4')}>{children}</div>
        <SheetFooter className={cn('flex-row gap-2', isBottom ? 'p-0' : 'sm:justify-between')}>
          <Button variant="outline" onClick={onClear} className={isBottom ? 'flex-1' : ''}>
            Clear
          </Button>
          <Button onClick={handleApply} className={isBottom ? 'flex-1' : ''}>
            Apply{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </Button>
        </SheetFooter>
        {/* Bottom safe area spacer for iOS home indicator */}
        {isBottom && <div className="h-4 shrink-0" />}
      </SheetContent>
    </Sheet>
  );
}

interface FilterFieldProps {
  label: string;
  children: ReactNode;
  className?: string;
  /** Optional htmlFor to link label to input for accessibility */
  htmlFor?: string;
}

export function FilterField({ label, children, className, htmlFor }: FilterFieldProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
