# Story 8.2: Service Worker & Caching

## Status: ready-for-dev

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
- **And** User sees "อัพเดทใหม่พร้อมใช้งาน" toast on next visit
- **And** Refresh loads new version

### AC 4: Cache Cleanup
- **Given** Old cached assets exist
- **When** New service worker activates
- **Then** Old caches are cleaned up
- **And** Only current version assets remain

## Tasks

### Task 1: Create Service Worker File
**File:** `public/sw.js`
- [ ] Create basic service worker
- [ ] Define cache name with version
- [ ] List assets to precache
- [ ] Handle install event

### Task 2: Implement Cache-First Strategy for Static Assets
**File:** `public/sw.js`
- [ ] Match requests for static assets (js, css, fonts, images)
- [ ] Return from cache if available
- [ ] Fall back to network
- [ ] Update cache after network fetch

### Task 3: Implement Network-First Strategy for API
**File:** `public/sw.js`
- [ ] Match API requests (/api/*, supabase URLs)
- [ ] Try network first
- [ ] Fall back to cache if offline
- [ ] Don't cache auth-related requests

### Task 4: Register Service Worker
**File:** `src/app/layout.tsx` or `src/components/ServiceWorkerRegistration.tsx`
- [ ] Check if service worker is supported
- [ ] Register sw.js on page load
- [ ] Handle registration errors gracefully

### Task 5: Handle Service Worker Updates
**File:** `src/hooks/use-service-worker.ts`
- [ ] Detect when new SW is waiting
- [ ] Show update notification
- [ ] Handle skipWaiting on user action
- [ ] Reload page after update

### Task 6: Create Update Notification Component
**File:** `src/components/shared/UpdateNotification.tsx`
- [ ] Show toast when update available
- [ ] "อัพเดทใหม่พร้อมใช้งาน" message
- [ ] "รีเฟรช" button
- [ ] Auto-dismiss option

### Task 7: Implement Cache Cleanup
**File:** `public/sw.js`
- [ ] On activate event, delete old caches
- [ ] Keep only current version cache
- [ ] Log cleanup for debugging

### Task 8: Define Precache Assets List
**File:** `public/sw.js`
- [ ] Add app shell HTML
- [ ] Add critical CSS
- [ ] Add essential JS bundles
- [ ] Add icons and fonts

### Task 9: Handle Offline Fallback
**File:** `public/sw.js`
- [ ] Create offline fallback page
- [ ] Return fallback for navigation requests when offline
- [ ] Show meaningful offline UI

### Task 10: Test Service Worker Behavior
**File:** Manual testing
- [ ] Test cache on first visit
- [ ] Test fast loading on repeat visit
- [ ] Test update notification
- [ ] Test offline behavior

## Dev Notes

### Architecture Pattern
- Manual service worker (no next-pwa or workbox)
- Simple cache strategies
- Version-based cache names

### Service Worker Implementation
```javascript
// public/sw.js
const CACHE_VERSION = 'v1';
const CACHE_NAME = `timelog-${CACHE_VERSION}`;

const PRECACHE_ASSETS = [
  '/',
  '/entry',
  '/dashboard',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Install event - precache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('timelog-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Take control immediately
  self.clients.claim();
});

// Fetch event - cache strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip auth and API requests
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets - cache first
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Navigation - network first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithFallback(request));
    return;
  }

  // Default - network first
  event.respondWith(networkFirst(request));
});

function isStaticAsset(url) {
  return (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/) ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/_next/static/')
  );
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}

async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Return cached homepage as fallback
    return caches.match('/') || new Response('Offline', { status: 503 });
  }
}
```

### Service Worker Registration
```typescript
// src/components/ServiceWorkerRegistration.tsx
'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration.scope);

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content available
                  window.dispatchEvent(new CustomEvent('swUpdate'));
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('SW registration failed:', error);
        });
    }
  }, []);

  return null;
}
```

### Update Notification Hook
```typescript
// src/hooks/use-service-worker.ts
'use client';

import { useState, useEffect } from 'react';

export function useServiceWorker() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const handleUpdate = () => setUpdateAvailable(true);
    window.addEventListener('swUpdate', handleUpdate);
    return () => window.removeEventListener('swUpdate', handleUpdate);
  }, []);

  const update = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
      });
    }
    window.location.reload();
  };

  return { updateAvailable, update };
}
```

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
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
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
- Announced to screen readers
- Non-blocking (can dismiss)

## Definition of Done

- [ ] Service worker registers successfully
- [ ] Static assets cached on first visit
- [ ] Repeat visits load faster (< 100ms for shell)
- [ ] API calls use network-first strategy
- [ ] Update notification shows when new version available
- [ ] Refresh loads new version
- [ ] Old caches cleaned up
- [ ] Offline navigation shows fallback
- [ ] No TypeScript errors
- [ ] All imports use @/ aliases
