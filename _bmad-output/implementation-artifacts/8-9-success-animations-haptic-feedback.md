# Story 8.9: Success Animations & Haptic Feedback

## Status: ready-for-dev

## Story

As a **user**,
I want **satisfying feedback when I complete actions**,
So that **the app feels responsive and delightful**.

## Acceptance Criteria

### AC 1: Save Success Animation
- **Given** I successfully save a time entry
- **When** Server confirms save
- **Then** I see a success animation (checkmark with confetti using framer-motion)
- **And** Animation completes in ~800ms
- **And** Form resets after animation

### AC 2: Haptic Feedback
- **Given** I am on iOS device
- **When** I complete a successful action
- **Then** Haptic feedback fires (light impact)
- **And** Using navigator.vibrate() fallback for Android

### AC 3: Delete Animation
- **Given** I delete an entry
- **When** Deletion confirms
- **Then** Entry animates out (slide + fade)
- **And** List reflows smoothly

### AC 4: Reduced Motion Support
- **Given** Animations
- **When** User has prefers-reduced-motion enabled
- **Then** Animations are disabled or simplified
- **And** Functionality remains unchanged

### AC 5: Button Loading States
- **Given** I tap submit button
- **When** Action is processing
- **Then** Button shows loading spinner
- **And** Button is disabled during processing
- **And** Success animation plays after complete

## Tasks

### Task 1: Create SuccessAnimation Component
**File:** `src/components/shared/SuccessAnimation.tsx`
- [ ] Animated checkmark with circle
- [ ] Optional confetti burst
- [ ] ~800ms duration
- [ ] Triggers callback on complete

### Task 2: Create useHaptic Hook
**File:** `src/hooks/use-haptic.ts`
- [ ] Detect haptic support
- [ ] Light, medium, heavy patterns
- [ ] navigator.vibrate fallback
- [ ] Graceful degradation

### Task 3: Create AnimatedListItem Component
**File:** `src/components/shared/AnimatedListItem.tsx`
- [ ] Enter animation (fade + slide in)
- [ ] Exit animation (slide + fade out)
- [ ] Use framer-motion AnimatePresence
- [ ] Smooth list reflow

### Task 4: Integrate Success Animation in Entry Form
**File:** `src/app/(app)/entry/components/QuickEntryForm.tsx`
- [ ] Show SuccessAnimation on save
- [ ] Trigger haptic feedback
- [ ] Reset form after animation
- [ ] Handle overlay positioning

### Task 5: Add Delete Animation to Entry List
**File:** `src/app/(app)/dashboard/components/EntryList.tsx`
- [ ] Wrap items in AnimatedListItem
- [ ] Animate out on delete
- [ ] Haptic on delete confirm

### Task 6: Create Confetti Effect
**File:** `src/components/shared/Confetti.tsx`
- [ ] Particle burst animation
- [ ] Colorful, lightweight
- [ ] Auto-cleanup after animation
- [ ] Canvas or CSS-based

### Task 7: Add Reduced Motion Support
**File:** `src/hooks/use-reduced-motion.ts`
- [ ] Detect prefers-reduced-motion
- [ ] Provide hook for components
- [ ] Disable/simplify animations

### Task 8: Create Button Loading Component
**File:** `src/components/ui/loading-button.tsx`
- [ ] Extends shadcn Button
- [ ] isLoading prop
- [ ] Spinner replaces text
- [ ] Disabled during loading

### Task 9: Add Haptic to Key Actions
**File:** Various components
- [ ] Save time entry (success)
- [ ] Delete entry (warning)
- [ ] Pull-to-refresh (light)
- [ ] Error states (error pattern)

### Task 10: Test Animations
**File:** Manual testing
- [ ] Test on real iOS device
- [ ] Test on Android device
- [ ] Test reduced motion
- [ ] Test animation timing

## Dev Notes

### Architecture Pattern
- framer-motion for animations
- Custom hooks for haptic/reduced-motion
- Reusable animation components
- CSS fallbacks where possible

### SuccessAnimation Component
```typescript
// src/components/shared/SuccessAnimation.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { Confetti } from '@/components/shared/Confetti';

interface SuccessAnimationProps {
  show: boolean;
  onComplete?: () => void;
}

export function SuccessAnimation({ show, onComplete }: SuccessAnimationProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
          onAnimationComplete={() => {
            setTimeout(() => onComplete?.(), 800);
          }}
        >
          {/* Success Circle */}
          <motion.div
            initial={prefersReducedMotion ? {} : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center shadow-lg"
          >
            <motion.div
              initial={prefersReducedMotion ? {} : { scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <Check className="w-12 h-12 text-white stroke-[3]" />
            </motion.div>
          </motion.div>

          {/* Confetti */}
          {!prefersReducedMotion && <Confetti />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### useHaptic Hook
```typescript
// src/hooks/use-haptic.ts
'use client';

import { useCallback } from 'react';

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

const PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 30,
  success: [10, 50, 10],
  warning: [20, 100, 20],
  error: [50, 100, 50, 100, 50],
};

export function useHaptic() {
  const trigger = useCallback((pattern: HapticPattern = 'light') => {
    // iOS Haptic Engine (if available)
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(PATTERNS[pattern]);
      } catch {
        // Silently fail
      }
    }
  }, []);

  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  return { trigger, isSupported };
}
```

### useReducedMotion Hook
```typescript
// src/hooks/use-reduced-motion.ts
'use client';

import { useState, useEffect } from 'react';

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}
```

### AnimatedListItem Component
```typescript
// src/components/shared/AnimatedListItem.tsx
'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface AnimatedListItemProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedListItem({ children, className }: AnimatedListItemProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

### Confetti Component
```typescript
// src/components/shared/Confetti.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
}

export function Confetti() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles: Particle[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 200 - 100,
      y: Math.random() * -200 - 50,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            x: '50%',
            y: '50%',
            scale: 0,
            rotate: 0,
          }}
          animate={{
            x: `calc(50% + ${particle.x}px)`,
            y: `calc(50% + ${particle.y}px)`,
            scale: [0, 1, 0],
            rotate: particle.rotation,
          }}
          transition={{
            duration: 0.8,
            ease: 'easeOut',
          }}
          className="absolute w-3 h-3 rounded-sm"
          style={{ backgroundColor: particle.color }}
        />
      ))}
    </div>
  );
}
```

### LoadingButton Component
```typescript
// src/components/ui/loading-button.tsx
'use client';

import { Loader2 } from 'lucide-react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
  loadingText?: string;
}

export function LoadingButton({
  children,
  isLoading,
  loadingText,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={disabled || isLoading}
      className={cn(className)}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText || 'กำลังบันทึก...'}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
```

### Entry Form Integration
```typescript
// src/app/(app)/entry/components/QuickEntryForm.tsx
import { useState } from 'react';
import { SuccessAnimation } from '@/components/shared/SuccessAnimation';
import { LoadingButton } from '@/components/ui/loading-button';
import { useHaptic } from '@/hooks/use-haptic';

export function QuickEntryForm() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { trigger: haptic } = useHaptic();

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    const result = await saveTimeEntry(data);

    if (result.success) {
      haptic('success');
      setShowSuccess(true);
    } else {
      haptic('error');
      // Show error toast
    }

    setIsSubmitting(false);
  };

  const handleAnimationComplete = () => {
    setShowSuccess(false);
    form.reset();
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
        <LoadingButton type="submit" isLoading={isSubmitting}>
          บันทึก
        </LoadingButton>
      </form>

      <SuccessAnimation
        show={showSuccess}
        onComplete={handleAnimationComplete}
      />
    </>
  );
}
```

### Entry List with Delete Animation
```typescript
// src/app/(app)/dashboard/components/EntryList.tsx
import { AnimatePresence } from 'framer-motion';
import { AnimatedListItem } from '@/components/shared/AnimatedListItem';

export function EntryList({ entries }: { entries: TimeEntry[] }) {
  return (
    <AnimatePresence mode="popLayout">
      {entries.map((entry) => (
        <AnimatedListItem key={entry.id}>
          <EntryCard entry={entry} />
        </AnimatedListItem>
      ))}
    </AnimatePresence>
  );
}
```

### Component Dependencies
- framer-motion (already in project)
- lucide-react for icons
- Custom hooks for haptic/motion

### Import Convention
```typescript
import { SuccessAnimation } from '@/components/shared/SuccessAnimation';
import { AnimatedListItem } from '@/components/shared/AnimatedListItem';
import { Confetti } from '@/components/shared/Confetti';
import { LoadingButton } from '@/components/ui/loading-button';
import { useHaptic } from '@/hooks/use-haptic';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
```

### Testing Notes
- Use Chrome DevTools to simulate reduced motion
- Test on real devices for haptic
- Verify animation timing feels right
- Test overlay doesn't block interaction

### Accessibility
- Respects prefers-reduced-motion
- Success state announced to screen readers
- Loading state communicated
- No motion-only feedback (always visual too)

## Definition of Done

- [ ] SuccessAnimation component with checkmark
- [ ] Confetti particle effect
- [ ] useHaptic hook for vibration
- [ ] useReducedMotion hook
- [ ] AnimatedListItem for list animations
- [ ] LoadingButton component
- [ ] Entry form shows success animation
- [ ] Haptic fires on save success
- [ ] Delete animates out smoothly
- [ ] Reduced motion disables animations
- [ ] Button shows loading state
- [ ] ~800ms animation duration
- [ ] No TypeScript errors
- [ ] All imports use @/ aliases
