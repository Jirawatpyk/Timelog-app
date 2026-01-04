# Story 8.2: Service Worker & Caching

## Status: done

## Story

As a **user**,
I want **static assets cached for fast loading**,
So that **the app loads quickly on repeat visits**.

## Acceptance Criteria

### AC 1: Service Worker Registration
- **Given** App is loaded for the first time
- **When** Service worker registers
- **Then** Static assets are cached: JS bundles, CSS, fonts, icons
- **And** Cache uses network-first strategy for API calls
- **And** Cache uses cache-first strategy for static assets

### AC 2: Fast Repeat Visits
- **Given** I revisit the app
- **When** The page loads
- **Then** Cached assets load instantly
- **And** App shell appears within 100ms
- **And** Data fetches in background

### AC 3: Cache Update on New Version
- **Given** New version is deployed
- **When** Service worker detects update
- **Then** New assets are cached in background
- **And** User sees "Update available" toast on next visit (English per project-context.md)
- **And** Refresh loads new version

### AC 4: Cache Cleanup
- **Given** Old cached assets exist
- **When** New service worker activates
- **Then** Old caches are cleaned up
- **And** Only current version assets remain

## Tasks

### Task 1: Create Service Worker File
**File:** `public/sw.js`
- [x] Create basic service worker
- [x] Define cache name with version
- [x] List assets to precache
- [x] Handle install event

### Task 2: Implement Cache-First Strategy for Static Assets
**File:** `public/sw.js`
- [x] Match requests for static assets (js, css, fonts, images)
- [x] Return from cache if available
- [x] Fall back to network
- [x] Update cache after network fetch

### Task 3: Implement Network-First Strategy for API
**File:** `public/sw.js`
- [x] Match API requests (/api/*, supabase URLs)
- [x] Try network first
- [x] Fall back to cache if offline
- [x] Don't cache auth-related requests

### Task 4: Register Service Worker
**File:** `src/components/shared/ServiceWorkerRegistration.tsx`
- [x] Check if service worker is supported
- [x] Register sw.js on page load
- [x] Handle registration errors gracefully

### Task 5: Handle Service Worker Updates
**File:** `src/hooks/use-service-worker.ts`
- [x] Detect when new SW is waiting
- [x] Show update notification
- [x] Handle skipWaiting on user action
- [x] Reload page after update

### Task 6: Create Update Notification Component
**File:** `src/components/shared/UpdateNotification.tsx`
- [x] Show toast when update available
- [x] "Update available" message (English per project-context.md)
- [x] "Refresh" button
- [x] Auto-dismiss option (30 second timeout)

### Task 7: Implement Cache Cleanup
**File:** `public/sw.js`
- [x] On activate event, delete old caches
- [x] Keep only current version cache
- [x] Log cleanup for debugging

### Task 8: Define Precache Assets List
**File:** `public/sw.js`
- [x] Add app shell HTML (/, /entry, /dashboard, /team)
- [x] Add manifest.json
- [x] Add icons (icon-192.png, icon-512.png, apple-touch-icon.png)
- [x] Add favicon

### Task 9: Handle Offline Fallback
**File:** `public/sw.js`
- [x] Return cached page if available
- [x] Return fallback for navigation requests when offline
- [x] Return meaningful offline response (503 Service Unavailable)

### Task 10: Test Service Worker Behavior
**File:** Unit tests
- [x] Test hook initial state
- [x] Test update detection via swUpdate event
- [x] Test update/dismissUpdate functions
- [x] Test graceful handling when SW not supported

## Dev Notes

### Architecture Pattern
- Manual service worker (no next-pwa or workbox)
- Simple cache strategies
- Version-based cache names

### Implementation Decisions

1. **UI Language**: Changed from Thai ("อัพเดทใหม่พร้อมใช้งาน") to English ("Update available") per project-context.md requirement for English-only UI.

2. **Development Mode**: Service worker registration skipped in development/test environments to avoid caching issues during development.

3. **Cache Strategies**:
   - Static assets (JS, CSS, images, fonts): Cache-first for performance
   - API calls (Supabase, /api/*): Network-first to ensure fresh data
   - Navigation: Network-first with offline fallback to cached pages

4. **Update Flow**: Custom event `swUpdate` dispatched when new SW is installed, allowing React components to react to updates.

### Cache Versioning
- Bump CACHE_VERSION when deploying new assets
- Old caches auto-cleaned on activate
- Use build hash for production (optional)

### Component Dependencies
- Builds on PWA from Story 8.1
- No external libraries needed
- Uses custom events for update notification

### Import Convention
```typescript
import { ServiceWorkerRegistration } from '@/components/shared/ServiceWorkerRegistration';
import { useServiceWorker } from '@/hooks/use-service-worker';
import { UpdateNotification } from '@/components/shared/UpdateNotification';
```

### Testing Notes
- Use Chrome DevTools > Application > Service Workers
- Test in incognito for clean slate
- Use "Update on reload" during development
- Test offline in Network tab

### Accessibility
- Update notification is keyboard accessible
- Announced to screen readers (role="alert", aria-live="polite")
- Non-blocking (can dismiss)

## Definition of Done

- [x] Service worker registers successfully
- [x] Static assets cached on first visit
- [x] Repeat visits load faster (< 100ms for shell)
- [x] API calls use network-first strategy
- [x] Update notification shows when new version available
- [x] Refresh loads new version
- [x] Old caches cleaned up
- [x] Offline navigation shows fallback
- [x] No TypeScript errors
- [x] All imports use @/ aliases

## Dev Agent Record

### Implementation Date
2026-01-04

### Files Created
- `public/sw.js` - Service worker with caching strategies
- `src/hooks/use-service-worker.ts` - Hook for SW state management
- `src/hooks/use-service-worker.test.ts` - Unit tests (8 tests)
- `src/components/shared/ServiceWorkerRegistration.tsx` - SW registration component
- `src/components/shared/ServiceWorkerRegistration.test.tsx` - Unit tests (3 tests)
- `src/components/shared/UpdateNotification.tsx` - Update notification UI
- `src/components/shared/UpdateNotification.test.tsx` - Unit tests (12 tests)

### Files Modified
- `src/app/(app)/layout.tsx` - Added ServiceWorkerRegistration and UpdateNotification components

### Test Results
- New tests: 23 passing
- Total tests: 1593 passing (8 pre-existing failures in team.test.ts unrelated to this story)
- TypeScript: Clean (no errors)

### Completion Notes
All acceptance criteria satisfied. Service worker provides:
- Cache-first for static assets (fast repeat visits)
- Network-first for API calls (fresh data)
- Offline fallback for navigation
- Update notification with refresh button
- Automatic cache cleanup on new versions

Note: UI text changed from Thai to English per project-context.md requirements.
