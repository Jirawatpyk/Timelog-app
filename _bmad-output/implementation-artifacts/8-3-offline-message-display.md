# Story 8.3: Offline Message Display

## Status: ready-for-dev

## Story

As a **user**,
I want **to see a clear message when offline**,
So that **I understand why the app isn't working**.

## Acceptance Criteria

### AC 1: Offline Banner Display
- **Given** I have the app open
- **When** Network connection is lost
- **Then** I see a banner: "ไม่มีการเชื่อมต่ออินเทอร์เน็ต"
- **And** Banner appears at top of screen
- **And** Banner has subtle orange/yellow styling (not alarming)

### AC 2: Form Submission While Offline
- **Given** I try to submit a form while offline
- **When** Submission fails
- **Then** I see error: "กรุณาเชื่อมต่ออินเทอร์เน็ตก่อนบันทึก"
- **And** Form data is NOT lost

### AC 3: Online Restoration
- **Given** Network connection is restored
- **When** Online event fires
- **Then** Offline banner disappears automatically
- **And** I see brief toast: "กลับมาออนไลน์แล้ว"

### AC 4: Graceful Degradation
- **Given** I am viewing cached data while offline
- **When** I navigate to cached pages
- **Then** Cached content displays normally
- **And** Refresh attempts show offline message

## Tasks

### Task 1: Create useOnlineStatus Hook
**File:** `src/hooks/use-online-status.ts`
- [ ] Track navigator.onLine state
- [ ] Listen for online/offline events
- [ ] Return current online status
- [ ] Handle SSR (default to true)

### Task 2: Create OfflineBanner Component
**File:** `src/components/shared/OfflineBanner.tsx`
- [ ] Show when offline
- [ ] Fixed position at top
- [ ] Orange/yellow subtle styling
- [ ] WifiOff icon
- [ ] "ไม่มีการเชื่อมต่ออินเทอร์เน็ต" message

### Task 3: Create OnlineRestoredToast
**File:** `src/components/shared/OfflineBanner.tsx`
- [ ] Show toast when coming back online
- [ ] "กลับมาออนไลน์แล้ว" message
- [ ] Auto-dismiss after 3 seconds
- [ ] Green success styling

### Task 4: Add Offline Banner to Layout
**File:** `src/app/(app)/layout.tsx`
- [ ] Include OfflineBanner component
- [ ] Position above main content
- [ ] Handle z-index properly

### Task 5: Create Offline-Aware Form Submission
**File:** `src/hooks/use-offline-aware-action.ts`
- [ ] Check online status before action
- [ ] Show specific error if offline
- [ ] Preserve form data on failure
- [ ] Return wrapped action

### Task 6: Update Entry Form for Offline
**File:** `src/app/(app)/entry/components/QuickEntryForm.tsx`
- [ ] Use offline-aware action wrapper
- [ ] Show "กรุณาเชื่อมต่ออินเทอร์เน็ตก่อนบันทึก" on offline submit
- [ ] Keep form data intact

### Task 7: Create NetworkStatusProvider
**File:** `src/components/providers/NetworkStatusProvider.tsx`
- [ ] Wrap app with network status context
- [ ] Provide online status to children
- [ ] Handle transitions (online ↔ offline)

### Task 8: Style Offline Banner
**File:** `src/components/shared/OfflineBanner.tsx`
- [ ] Use amber/yellow-500 background
- [ ] White text for contrast
- [ ] Smooth slide-down animation
- [ ] Subtle shadow

### Task 9: Handle Offline Navigation
**File:** `src/components/shared/OfflineBanner.tsx`
- [ ] Show additional message if trying to load new data
- [ ] "แสดงข้อมูลที่บันทึกไว้" for cached content
- [ ] Clear messaging about limitations

### Task 10: Test Offline Scenarios
**File:** Manual testing
- [ ] Test banner appears when offline
- [ ] Test banner disappears when online
- [ ] Test form submission blocked
- [ ] Test cached pages work
- [ ] Test toast on reconnection

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

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Set initial state
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
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-2 flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-top">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">ไม่มีการเชื่อมต่ออินเทอร์เน็ต</span>
        </div>
      )}

      {/* Online Restored Toast */}
      {showOnlineToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top">
          <Wifi className="h-4 w-4" />
          <span className="text-sm font-medium">กลับมาออนไลน์แล้ว</span>
        </div>
      )}
    </>
  );
}
```

### Offline-Aware Action Wrapper
```typescript
// src/hooks/use-offline-aware-action.ts
'use client';

import { useOnlineStatus } from '@/hooks/use-online-status';
import { toast } from 'sonner';

export function useOfflineAwareAction<T extends (...args: any[]) => Promise<any>>(
  action: T
): T {
  const isOnline = useOnlineStatus();

  const wrappedAction = async (...args: Parameters<T>) => {
    if (!isOnline) {
      toast.error('กรุณาเชื่อมต่ออินเทอร์เน็ตก่อนบันทึก');
      return { success: false, error: 'ไม่มีการเชื่อมต่ออินเทอร์เน็ต' };
    }

    return action(...args);
  };

  return wrappedAction as T;
}
```

### Layout Integration
```typescript
// src/app/(app)/layout.tsx
import { OfflineBanner } from '@/components/shared/OfflineBanner';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OfflineBanner />
      <div className="pt-0 data-[offline=true]:pt-10">
        {/* Main content */}
        {children}
      </div>
      <BottomNav />
    </>
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

## Definition of Done

- [ ] Offline banner shows when connection lost
- [ ] Banner has correct styling (amber/yellow, subtle)
- [ ] Banner disappears when connection restored
- [ ] "กลับมาออนไลน์แล้ว" toast shows on reconnection
- [ ] Form submission shows offline error
- [ ] Form data preserved when offline
- [ ] Cached pages work while offline
- [ ] Smooth animations for banner
- [ ] No TypeScript errors
- [ ] All imports use @/ aliases
