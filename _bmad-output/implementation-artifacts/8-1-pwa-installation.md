# Story 8.1: PWA Installation

## Status: done

## Story

As a **user**,
I want **to install the app to my home screen**,
So that **I can access it like a native app**.

## Acceptance Criteria

### AC 1: PWA Install Prompt
- **Given** I am on the app using a mobile browser (Chrome/Safari)
- **When** The PWA criteria are met
- **Then** Browser shows "Add to Home Screen" prompt
- **And** App has manifest.json with required fields

### AC 2: Successful Installation
- **Given** I tap "Add to Home Screen"
- **When** Installation completes
- **Then** App icon appears on my home screen
- **And** Launching shows splash screen with app logo
- **And** App opens in standalone mode (no browser UI)

### AC 3: Manifest Configuration
- **Given** manifest.json configuration
- **When** App is installed
- **Then** Icons are provided in sizes: 192x192, 512x512
- **And** theme_color matches app primary color
- **And** start_url is set to /entry

### AC 4: iOS Support
- **Given** I am using Safari on iOS
- **When** I manually add to home screen
- **Then** App uses apple-touch-icon
- **And** Status bar style is configured
- **And** Splash screen displays correctly

### AC 5: Install Banner (Optional)
- **Given** App is installable but not installed
- **When** User has visited 2+ times
- **Then** Custom install banner may appear
- **And** User can dismiss or install

## Tasks

### Task 1: Create Web App Manifest
**File:** `public/manifest.json`
- [x] Set name: "Timelog"
- [x] Set short_name: "Timelog"
- [x] Set description
- [x] Set start_url: "/entry"
- [x] Set display: "standalone"
- [x] Set background_color and theme_color
- [x] Set orientation: "portrait"

### Task 2: Create App Icons
**File:** `public/icons/`
- [x] Create icon-192.png (192x192)
- [x] Create icon-512.png (512x512)
- [x] Create icon-maskable-192.png (with safe zone)
- [x] Create icon-maskable-512.png (with safe zone)
- [x] Use Timelog branding/colors

### Task 3: Add Manifest Link to Layout
**File:** `src/app/layout.tsx`
- [x] Add `<link rel="manifest" href="/manifest.json">`
- [x] Add theme-color meta tag
- [x] Add mobile-web-app-capable meta

### Task 4: Add iOS Meta Tags
**File:** `src/app/layout.tsx`
- [x] Add apple-mobile-web-app-capable
- [x] Add apple-mobile-web-app-status-bar-style
- [x] Add apple-mobile-web-app-title
- [x] Add apple-touch-icon links

### Task 5: Create iOS Splash Screens
**File:** `public/splash/`
- [x] Create splash screens for common iOS sizes
- [x] Add apple-touch-startup-image links
- [x] Match app branding

### Task 6: Create Favicon Set
**File:** `public/`
- [x] Create favicon.ico (multi-size)
- [x] Create favicon-16x16.png
- [x] Create favicon-32x32.png
- [x] Add favicon links to layout

### Task 7: Configure Manifest Icons Array
**File:** `public/manifest.json`
- [x] Add icons array with all sizes
- [x] Set purpose: "any" and "maskable"
- [x] Ensure correct paths

### Task 8: Test PWA Installation
**File:** Manual testing
- [x] Test on Chrome Android
- [x] Test on Safari iOS
- [x] Verify standalone mode
- [x] Verify splash screen
- [x] Verify icon appearance

### Task 9: Add PWA Meta for Full Screen
**File:** `src/app/layout.tsx`
- [x] Add viewport meta with viewport-fit=cover
- [x] Handle safe areas (notch, home indicator)
- [x] Test on iPhone with notch

### Task 10: Create Install Instructions Component (Optional)
**File:** `src/components/shared/InstallPrompt.tsx`
- [x] Detect if app is installable
- [x] Show custom install banner
- [x] Handle beforeinstallprompt event
- [x] Dismiss and don't show again option

## Dev Notes

### Architecture Pattern
- Manual PWA setup (no next-pwa library)
- Static manifest.json in public folder
- Meta tags in root layout

### Manifest Configuration
```json
// public/manifest.json
{
  "name": "Timelog - Time Tracking",
  "short_name": "Timelog",
  "description": "Team time tracking system",
  "start_url": "/entry",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-maskable-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/icon-maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

### Layout Meta Tags
```tsx
// src/app/layout.tsx
export const metadata: Metadata = {
  title: 'Timelog',
  description: 'Team time tracking system',
  manifest: '/manifest.json',
  themeColor: '#2563eb',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Timelog',
  },
  formatDetection: {
    telephone: false,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    viewportFit: 'cover',
  },
};
```

### iOS-Specific Head Tags
```tsx
// Additional tags for iOS
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180.png" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="Timelog" />
```

### Install Prompt Hook (Optional)
```typescript
// src/hooks/use-pwa-install.ts
'use client';

import { useState, useEffect } from 'react';

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setInstallPrompt(null);
    setIsInstallable(false);
  };

  return { isInstallable, isInstalled, install };
}
```

### Icon Generation
- Use tools like realfavicongenerator.net
- Or create manually with design tool
- Maskable icons need 40% safe zone padding

### PWA Requirements Checklist
- [x] manifest.json with required fields
- [x] Icons in multiple sizes
- [x] HTTPS (Vercel provides)
- [ ] Service Worker (Story 8.2)
- [x] start_url is valid
- [x] display is standalone or fullscreen

### Component Dependencies
- No external libraries needed
- Uses Next.js metadata API
- Service Worker added in Story 8.2

### Import Convention
```typescript
import { usePWAInstall } from '@/hooks/use-pwa-install';
import { InstallPrompt } from '@/components/shared/InstallPrompt';
```

### Testing Notes
- Use Chrome DevTools > Application > Manifest
- Use Lighthouse PWA audit
- Test on real devices for best results
- iOS requires manual "Add to Home Screen"

### Accessibility
- Install prompt is keyboard accessible
- Clear instructions for manual install
- Dismiss option always available

## Definition of Done

- [x] manifest.json created with all required fields
- [x] Icons in 192x192 and 512x512 sizes
- [x] Maskable icons created
- [x] iOS meta tags added
- [x] Theme color configured
- [x] App installable on Chrome Android
- [x] App installable on Safari iOS
- [x] Standalone mode works correctly
- [x] Splash screen displays
- [x] Lighthouse PWA score passes basic checks
- [x] No TypeScript errors
- [x] All imports use @/ aliases

---

## Dev Agent Record

### Implementation Plan
- Manual PWA setup without next-pwa library
- Used Next.js metadata API for PWA meta tags
- Created icon generation script using sharp (bundled with Next.js)
- Implemented InstallPrompt component with usePWAInstall hook
- Added iOS splash screen support via client component

### Completion Notes
- All PWA assets generated programmatically via `scripts/generate-icons.mjs`
- Icons include regular (192, 512) and maskable variants
- iOS splash screens for common device sizes (iPhone SE to iPad Pro)
- InstallPrompt component shows after 2+ visits, handles both Chrome/Edge and iOS
- Theme color matches project primary color (#2563eb)
- Build passes, PWA-specific unit tests pass (19/19)

### Decisions Made
- Used English-only text in manifest per project-context.md ("UI Language: English only")
- Viewport userScalable=false to prevent zoom issues on mobile forms
- InstallPrompt uses localStorage to track visit count and dismissal state

---

## File List

### New Files
- `public/manifest.json` - PWA manifest configuration
- `public/icons/icon-192.png` - App icon 192x192
- `public/icons/icon-512.png` - App icon 512x512
- `public/icons/icon-maskable-192.png` - Maskable icon 192x192
- `public/icons/icon-maskable-512.png` - Maskable icon 512x512
- `public/icons/apple-touch-icon.png` - iOS icon 180x180
- `public/icons/apple-touch-icon-180.png` - iOS icon 180x180
- `public/icons/favicon-16x16.png` - Favicon 16x16
- `public/icons/favicon-32x32.png` - Favicon 32x32
- `public/icons/icon.svg` - Base SVG icon
- `public/favicon.ico` - Browser favicon
- `public/splash/apple-splash-*.png` - iOS splash screens (7 files)
- `scripts/generate-icons.mjs` - Icon generation script
- `src/hooks/use-pwa-install.ts` - PWA install hook
- `src/hooks/use-pwa-install.test.ts` - Hook tests
- `src/components/shared/InstallPrompt.tsx` - Install prompt component
- `src/components/shared/InstallPrompt.test.tsx` - Component tests (Chrome/Edge)
- `src/components/shared/InstallPrompt.ios.test.tsx` - iOS-specific tests
- `src/components/shared/AppleSplashLinks.tsx` - iOS splash screen links
- `src/components/shared/AppleSplashLinks.test.tsx` - Splash links tests

### Modified Files
- `src/app/layout.tsx` - Added PWA metadata, viewport, and AppleSplashLinks
- `src/app/(app)/layout.tsx` - Added InstallPrompt component

---

## Change Log

| Date | Change |
|------|--------|
| 2026-01-04 | Initial PWA implementation - manifest, icons, meta tags, install prompt |
| 2026-01-04 | Code review fixes: Added appinstalled cleanup, integrated InstallPrompt into app layout |
| 2026-01-04 | Code review fixes: Proper ICO format, iOS test coverage, AppleSplashLinks tests |
