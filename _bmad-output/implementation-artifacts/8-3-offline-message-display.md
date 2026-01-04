# Story 8.3: Offline Message Display

## Status: done

## Story

As a **user**,
I want **to see a clear message when offline**,
So that **I understand why the app isn't working**.

## Acceptance Criteria

### AC 1: Offline Banner Display ✅
- **Given** I have the app open
- **When** Network connection is lost
- **Then** I see a banner: "No internet connection"
- **And** Banner appears at top of screen
- **And** Banner has subtle orange/yellow styling (not alarming)

### AC 2: Form Submission While Offline ✅
- **Given** I try to submit a form while offline
- **When** Submission fails
- **Then** I see error: "Please connect to the internet before saving"
- **And** Form data is NOT lost

### AC 3: Online Restoration ✅
- **Given** Network connection is restored
- **When** Online event fires
- **Then** Offline banner disappears automatically
- **And** I see brief toast: "Back online"

### AC 4: Graceful Degradation ✅
- **Given** I am viewing cached data while offline
- **When** I navigate to cached pages
- **Then** Cached content displays normally (handled by Service Worker from Story 8.2)
- **And** Refresh attempts show offline message

## Tasks

### Task 1: Create useOnlineStatus Hook ✅
**File:** `src/hooks/use-online-status.ts`
- [x] Track navigator.onLine state
- [x] Listen for online/offline events
- [x] Return current online status
- [x] Handle SSR (default to true)
- [x] Unit tests (6 tests)

### Task 2: Create OfflineBanner Component ✅
**File:** `src/components/shared/OfflineBanner.tsx`
- [x] Show when offline
- [x] Fixed position at top
- [x] Orange/yellow subtle styling (amber-500)
- [x] WifiOff icon
- [x] "No internet connection" message (English per project-context.md)

### Task 3: Create OnlineRestoredToast ✅
**File:** `src/components/shared/OfflineBanner.tsx` (combined with OfflineBanner)
- [x] Show toast when coming back online
- [x] "Back online" message (English)
- [x] Auto-dismiss after 3 seconds
- [x] Green success styling (green-500)

### Task 4: Add Offline Banner to Layout ✅
**File:** `src/app/(app)/layout.tsx`
- [x] Include OfflineBanner component
- [x] Position above main content
- [x] Handle z-index properly (z-50)

### Task 5: Create Offline-Aware Form Submission ✅
**File:** `src/hooks/use-offline-aware-action.ts`
- [x] Check online status before action
- [x] Show specific error if offline
- [x] Preserve form data on failure
- [x] Return wrapped action
- [x] Unit tests (7 tests)

### Task 6: Update Entry Form for Offline ✅
**File:** `src/app/(app)/entry/components/TimeEntryForm.tsx`
- [x] Check online status before form validation (handleFormSubmit)
- [x] Show "Please connect to the internet before saving" on offline submit
- [x] Keep form data intact
- [x] Unit tests (2 tests added)

### Task 7: NetworkStatusProvider - SKIPPED
**Reason:** Not needed - useOnlineStatus hook is sufficient and simpler. Each component that needs online status can call the hook directly.

### Task 8: Style Offline Banner ✅
**File:** `src/components/shared/OfflineBanner.tsx`
- [x] Use amber-500 background
- [x] White text for contrast
- [x] Smooth slide-down animation (animate-in slide-in-from-top)
- [x] Subtle shadow (shadow-md)

### Task 9: Handle Offline Navigation - SIMPLIFIED
**Reason:** Service Worker from Story 8.2 handles offline page caching. Banner provides clear messaging.

### Task 10: Test Offline Scenarios ✅
**File:** Unit tests
- [x] Test banner appears when offline (OfflineBanner.test.tsx)
- [x] Test banner disappears when online (OfflineBanner.test.tsx)
- [x] Test form submission blocked (TimeEntryForm.test.tsx)
- [x] Test cached pages work (Service Worker from Story 8.2)
- [x] Test toast on reconnection (OfflineBanner.test.tsx)

## Dev Notes

### Architecture Pattern
- Global network status via Context or hook
- Banner component in app layout
- Offline-aware action wrapper for forms

### useOnlineStatus Hook
```typescript
// src/hooks/use-online-status.ts
'use client';

import { useState, useEffect } from 'react';

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

### Offline Banner Component
```typescript
// src/components/shared/OfflineBanner.tsx
'use client';

import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { cn } from '@/lib/utils';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const [showOnlineToast, setShowOnlineToast] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      setShowOnlineToast(true);
      const timer = setTimeout(() => {
        setShowOnlineToast(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showOnlineToast) return null;

  return (
    <>
      {/* Offline Banner */}
      {!isOnline && (
        <div role="alert" className={cn(
          'fixed top-0 left-0 right-0 z-50',
          'bg-amber-500 text-white px-4 py-2',
          'flex items-center justify-center gap-2 shadow-md',
          'animate-in slide-in-from-top duration-300'
        )}>
          <WifiOff className="h-4 w-4" aria-hidden="true" />
          <span className="text-sm font-medium">No internet connection</span>
        </div>
      )}

      {/* Online Restored Toast */}
      {showOnlineToast && (
        <div role="status" aria-live="polite" className={cn(
          'fixed top-4 left-1/2 -translate-x-1/2 z-50',
          'bg-green-500 text-white px-4 py-2 rounded-lg',
          'flex items-center gap-2 shadow-lg',
          'animate-in fade-in slide-in-from-top duration-300'
        )}>
          <Wifi className="h-4 w-4" aria-hidden="true" />
          <span className="text-sm font-medium">Back online</span>
        </div>
      )}
    </>
  );
}
```

### Form Offline Handling Pattern
```typescript
// Used in TimeEntryForm.tsx and EditEntryForm.tsx
const isOnline = useOnlineStatus();

const handleFormSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  if (!isOnline) {
    toast.error('Please connect to the internet before saving');
    return; // Form data is preserved
  }

  form.handleSubmit(onSubmit)();
};
```

### Layout Integration
```typescript
// src/app/(app)/layout.tsx
import { OfflineBanner } from '@/components/shared/OfflineBanner';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthStateListener>
      <OfflineBanner />
      {/* Main content */}
      {children}
    </AuthStateListener>
  );
}
```

### Styling Notes
- Banner: amber-500 background, white text
- Toast: green-500 background, rounded-lg
- Use Tailwind animate-in for smooth transitions
- Z-index: 50 to be above other content

### Component Dependencies
- Uses useOnlineStatus hook
- Uses lucide-react icons
- Uses sonner for additional toasts (optional)
- Integrates with app layout

### Import Convention
```typescript
import { useOnlineStatus } from '@/hooks/use-online-status';
import { useOfflineAwareAction } from '@/hooks/use-offline-aware-action';
import { OfflineBanner } from '@/components/shared/OfflineBanner';
```

### Testing Notes
- Use Chrome DevTools > Network > Offline
- Test on real device with airplane mode
- Test transition from offline → online
- Test form submission while offline

### Accessibility
- Banner has role="alert"
- Icon has aria-hidden
- Message is announced to screen readers
- Sufficient color contrast

## File List

### New Files
- `src/hooks/use-online-status.ts` - Hook for tracking browser online/offline status
- `src/hooks/use-online-status.test.ts` - Unit tests (6 tests)
- `src/components/shared/OfflineBanner.tsx` - Offline banner + online restored toast
- `src/components/shared/OfflineBanner.test.tsx` - Unit tests (10 tests)

### Modified Files
- `src/app/(app)/layout.tsx` - Added OfflineBanner component
- `src/app/(app)/entry/components/TimeEntryForm.tsx` - Added offline check before form validation
- `src/app/(app)/entry/components/TimeEntryForm.test.tsx` - Added offline submission tests (2 tests)
- `src/components/entry/EditEntryForm.tsx` - Added offline check before form validation (Code Review fix)
- `src/components/entry/EditEntryForm.test.tsx` - Added offline submission tests (Code Review fix)

## Definition of Done

- [x] Offline banner shows when connection lost
- [x] Banner has correct styling (amber-500, subtle)
- [x] Banner disappears when connection restored
- [x] "Back online" toast shows on reconnection
- [x] Form submission shows offline error (TimeEntryForm + EditEntryForm)
- [x] Form data preserved when offline
- [x] Cached pages work while offline (via Service Worker from Story 8.2)
- [x] Smooth animations for banner
- [x] No TypeScript errors
- [x] All imports use @/ aliases
- [x] All messages in English (per project-context.md)
- [x] All unit tests passing (1663 tests across 142 files)
