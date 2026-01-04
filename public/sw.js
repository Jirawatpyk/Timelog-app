/**
 * Service Worker for Timelog PWA
 * Story 8.2: Service Worker & Caching
 *
 * Strategies:
 * - Static assets (JS, CSS, fonts, images): Cache-first
 * - API calls (Supabase, /api/*): Network-first
 * - Navigation: Network-first with offline fallback
 */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `timelog-${CACHE_VERSION}`;

/**
 * Assets to precache on install
 * These are the essential shell assets for the app
 */
const PRECACHE_ASSETS = [
  '/',
  '/entry',
  '/dashboard',
  '/team',
  '/admin',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
  '/favicon.ico',
];

/**
 * Install event - Precache essential assets
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      })
  );
  // Activate immediately without waiting for old SW to finish
  self.skipWaiting();
});

/**
 * Activate event - Clean up old caches
 */
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
  // Take control of all clients immediately
  self.clients.claim();
});

/**
 * Fetch event - Handle requests with appropriate strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests except for CDN assets
  if (url.origin !== self.location.origin && !isCdnAsset(url)) {
    return;
  }

  // API requests (Supabase, /api/*) - Network first
  if (isApiRequest(url)) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets - Cache first
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Navigation requests - Network first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithFallback(request));
    return;
  }

  // Default - Network first
  event.respondWith(networkFirst(request));
});

/**
 * Listen for skip waiting message from client
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if URL is an API request
 */
function isApiRequest(url) {
  return (
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('supabase') ||
    url.pathname.startsWith('/auth/') ||
    url.pathname === '/auth' ||
    url.pathname.includes('/rest/v1/')
  );
}

/**
 * Check if URL is a static asset
 */
function isStaticAsset(url) {
  const staticExtensions = /\.(js|css|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot|ico)$/i;
  return (
    staticExtensions.test(url.pathname) ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/splash/') ||
    url.pathname.startsWith('/_next/static/')
  );
}

/**
 * Check if URL is a CDN asset (fonts, etc.)
 */
function isCdnAsset(url) {
  return (
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  );
}

// ============================================================================
// Cache Strategies
// ============================================================================

/**
 * Cache-first strategy
 * Best for static assets that don't change often
 */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

/**
 * Network-first strategy
 * Best for API calls and dynamic content
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    // Only cache successful responses for non-auth requests
    if (response.ok && !request.url.includes('/auth')) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

/**
 * Network-first with offline fallback
 * Best for navigation requests
 */
async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Try to find cached version of the requested page
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // Return cached homepage as ultimate fallback
    const fallback = await caches.match('/');
    if (fallback) {
      return fallback;
    }

    return new Response('Offline - Please check your connection', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/html' },
    });
  }
}
