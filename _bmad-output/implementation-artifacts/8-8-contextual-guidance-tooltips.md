# Story 8.8: Contextual Guidance Tooltips

## Status: ready-for-dev

## Story

As a **user**,
I want **helpful hints on complex features**,
So that **I can learn how to use them effectively**.

## Acceptance Criteria

### AC 1: Entry Form First-Time Tooltip
- **Given** I am on the entry form for the first time
- **When** The page loads
- **Then** I see a tooltip pointing to "รายการล่าสุด": "แตะเพื่อกรอกแบบฟอร์มอัตโนมัติ"
- **And** Tooltip has dismiss button (x)

### AC 2: Dismiss and Remember
- **Given** I dismiss a tooltip
- **When** Tapping "x" or outside
- **Then** Tooltip disappears
- **And** Won't show again (stored in localStorage)

### AC 3: Complex UI Tooltips
- **Given** Complex UI elements (cascading selectors, duration presets)
- **When** First interaction
- **Then** Brief tooltip explains the feature
- **And** Tooltips are non-blocking (can interact through them)

### AC 4: Reset Tooltips
- **Given** I want to see tooltips again
- **When** I go to Settings > Reset Tooltips
- **Then** All tooltips are cleared
- **And** Will show again on relevant pages

### AC 5: Tooltip Positioning
- **Given** A tooltip is displayed
- **When** Viewing on different screen sizes
- **Then** Tooltip positions correctly (above/below target)
- **And** Arrow points to target element
- **And** Doesn't overflow screen edges

## Tasks

### Task 1: Create Tooltip State Management
**File:** `src/hooks/use-tooltip-state.ts`
- [ ] Track seen tooltips in localStorage
- [ ] Provide hasSeen/markAsSeen functions
- [ ] Handle SSR safely

### Task 2: Create GuidanceTooltip Component
**File:** `src/components/shared/GuidanceTooltip.tsx`
- [ ] Floating tooltip with arrow
- [ ] Dismiss button (x)
- [ ] Click outside to dismiss
- [ ] Auto-position (top/bottom)

### Task 3: Create TooltipProvider Context
**File:** `src/components/providers/TooltipProvider.tsx`
- [ ] Global tooltip state management
- [ ] Coordinate multiple tooltips
- [ ] Provide reset function

### Task 4: Add Tooltip to Recent Combinations
**File:** `src/app/(app)/entry/components/RecentCombinations.tsx`
- [ ] Show tooltip on first view
- [ ] "แตะเพื่อกรอกแบบฟอร์มอัตโนมัติ"
- [ ] Position above/below list
- [ ] Tooltip ID: 'recent-combinations'

### Task 5: Add Tooltip to Cascading Selectors
**File:** `src/app/(app)/entry/components/CascadingSelectors.tsx`
- [ ] Show tooltip explaining cascade
- [ ] "เลือกลูกค้าก่อน แล้วโปรเจคจะแสดง"
- [ ] Tooltip ID: 'cascading-selectors'

### Task 6: Add Tooltip to Duration Presets
**File:** `src/app/(app)/entry/components/DurationInput.tsx`
- [ ] Show tooltip for quick duration
- [ ] "แตะตัวเลขเพื่อเลือกเวลาด่วน"
- [ ] Tooltip ID: 'duration-presets'

### Task 7: Create Settings Reset Option
**File:** `src/app/(app)/settings/page.tsx`
- [ ] Add "รีเซ็ตคำแนะนำ" button
- [ ] Clear localStorage tooltip flags
- [ ] Show confirmation toast

### Task 8: Style Tooltips
**File:** `src/components/shared/GuidanceTooltip.tsx`
- [ ] Dark background with white text
- [ ] Subtle shadow
- [ ] Arrow pointing to target
- [ ] Smooth fade-in animation

### Task 9: Handle Mobile Positioning
**File:** `src/components/shared/GuidanceTooltip.tsx`
- [ ] Detect viewport boundaries
- [ ] Flip position if needed
- [ ] Center on mobile if too wide

### Task 10: Test Tooltip Behavior
**File:** Manual testing
- [ ] Test first-time display
- [ ] Test dismiss persistence
- [ ] Test reset functionality
- [ ] Test on mobile devices

## Dev Notes

### Architecture Pattern
- localStorage for seen state
- Context provider for coordination
- Non-blocking floating UI
- Per-tooltip unique IDs

### useTooltipState Hook
```typescript
// src/hooks/use-tooltip-state.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'timelog_seen_tooltips';

export function useTooltipState(tooltipId: string) {
  const [hasSeen, setHasSeen] = useState(true); // Default true to prevent flash

  useEffect(() => {
    const seen = getSeenTooltips();
    setHasSeen(seen.includes(tooltipId));
  }, [tooltipId]);

  const markAsSeen = useCallback(() => {
    const seen = getSeenTooltips();
    if (!seen.includes(tooltipId)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen, tooltipId]));
    }
    setHasSeen(true);
  }, [tooltipId]);

  return { hasSeen, markAsSeen, shouldShow: !hasSeen };
}

function getSeenTooltips(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function resetAllTooltips() {
  localStorage.removeItem(STORAGE_KEY);
}
```

### GuidanceTooltip Component
```typescript
// src/components/shared/GuidanceTooltip.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTooltipState } from '@/hooks/use-tooltip-state';

interface GuidanceTooltipProps {
  id: string;
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom';
  className?: string;
}

export function GuidanceTooltip({
  id,
  children,
  content,
  position = 'top',
  className,
}: GuidanceTooltipProps) {
  const { shouldShow, markAsSeen } = useTooltipState(id);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shouldShow) {
      // Delay to allow page to render
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, [shouldShow]);

  const handleDismiss = () => {
    setIsVisible(false);
    markAsSeen();
  };

  // Click outside handler
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleDismiss();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible]);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {children}

      {isVisible && (
        <div
          className={cn(
            'absolute left-1/2 -translate-x-1/2 z-50',
            'bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg',
            'max-w-[250px] animate-in fade-in duration-200',
            position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          )}
        >
          {/* Arrow */}
          <div
            className={cn(
              'absolute left-1/2 -translate-x-1/2 border-8 border-transparent',
              position === 'top'
                ? 'top-full border-t-gray-900'
                : 'bottom-full border-b-gray-900'
            )}
          />

          {/* Content */}
          <div className="flex items-start gap-2">
            <span className="flex-1">{content}</span>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-0.5 hover:bg-white/10 rounded"
              aria-label="ปิด"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Usage in Components
```typescript
// src/app/(app)/entry/components/RecentCombinations.tsx
import { GuidanceTooltip } from '@/components/shared/GuidanceTooltip';

export function RecentCombinations({ items, onSelect }) {
  return (
    <GuidanceTooltip
      id="recent-combinations"
      content="แตะเพื่อกรอกแบบฟอร์มอัตโนมัติ"
      position="bottom"
    >
      <div className="space-y-2">
        <h3 className="text-sm font-medium">รายการล่าสุด</h3>
        {items.map((item) => (
          <button key={item.id} onClick={() => onSelect(item)}>
            {/* ... */}
          </button>
        ))}
      </div>
    </GuidanceTooltip>
  );
}
```

### Settings Reset
```typescript
// src/app/(app)/settings/page.tsx
'use client';

import { Button } from '@/components/ui/button';
import { resetAllTooltips } from '@/hooks/use-tooltip-state';
import { toast } from 'sonner';

export default function SettingsPage() {
  const handleResetTooltips = () => {
    resetAllTooltips();
    toast.success('รีเซ็ตคำแนะนำแล้ว จะแสดงอีกครั้งเมื่อเข้าหน้านั้นๆ');
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-semibold">ตั้งค่า</h1>

      <section>
        <h2 className="text-lg font-medium mb-2">คำแนะนำ</h2>
        <p className="text-sm text-muted-foreground mb-3">
          รีเซ็ตคำแนะนำเพื่อดูคำอธิบายฟีเจอร์อีกครั้ง
        </p>
        <Button variant="outline" onClick={handleResetTooltips}>
          รีเซ็ตคำแนะนำ
        </Button>
      </section>
    </div>
  );
}
```

### Tooltip IDs Registry
```typescript
// src/constants/tooltips.ts
export const TOOLTIP_IDS = {
  RECENT_COMBINATIONS: 'recent-combinations',
  CASCADING_SELECTORS: 'cascading-selectors',
  DURATION_PRESETS: 'duration-presets',
  DASHBOARD_PERIOD: 'dashboard-period',
} as const;
```

### Component Dependencies
- localStorage for persistence
- lucide-react for X icon
- Tailwind for styling
- No external tooltip library needed

### Import Convention
```typescript
import { GuidanceTooltip } from '@/components/shared/GuidanceTooltip';
import { useTooltipState, resetAllTooltips } from '@/hooks/use-tooltip-state';
import { TOOLTIP_IDS } from '@/constants/tooltips';
```

### Styling Notes
- Dark background (gray-900) for visibility
- White text with good contrast
- Subtle shadow for elevation
- Arrow indicates target
- Max-width prevents overflow

### Testing Notes
- Clear localStorage between tests
- Test first-time user experience
- Test dismiss persistence
- Test reset functionality
- Test positioning on mobile

### Accessibility
- Dismiss button has aria-label
- Focus management optional
- Non-blocking (can interact with page)
- Clear dismiss affordance

## Definition of Done

- [ ] useTooltipState hook created
- [ ] GuidanceTooltip component created
- [ ] Tooltip on Recent Combinations
- [ ] Tooltip on Cascading Selectors
- [ ] Tooltip on Duration Presets
- [ ] Dismiss saves to localStorage
- [ ] Dismissed tooltips don't reappear
- [ ] Settings page has reset option
- [ ] Reset clears all seen tooltips
- [ ] Tooltips position correctly
- [ ] Non-blocking interaction
- [ ] Mobile-friendly positioning
- [ ] No TypeScript errors
- [ ] All imports use @/ aliases
