# Story 8.1: PWA Installation

## Status: ready-for-dev

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
- [ ] Set name: "Timelog"
- [ ] Set short_name: "Timelog"
- [ ] Set description
- [ ] Set start_url: "/entry"
- [ ] Set display: "standalone"
- [ ] Set background_color and theme_color
- [ ] Set orientation: "portrait"

### Task 2: Create App Icons
**File:** `public/icons/`
- [ ] Create icon-192.png (192x192)
- [ ] Create icon-512.png (512x512)
- [ ] Create icon-maskable-192.png (with safe zone)
- [ ] Create icon-maskable-512.png (with safe zone)
- [ ] Use Timelog branding/colors

### Task 3: Add Manifest Link to Layout
**File:** `src/app/layout.tsx`
- [ ] Add `<link rel="manifest" href="/manifest.json">`
- [ ] Add theme-color meta tag
- [ ] Add mobile-web-app-capable meta

### Task 4: Add iOS Meta Tags
**File:** `src/app/layout.tsx`
- [ ] Add apple-mobile-web-app-capable
- [ ] Add apple-mobile-web-app-status-bar-style
- [ ] Add apple-mobile-web-app-title
- [ ] Add apple-touch-icon links

### Task 5: Create iOS Splash Screens
**File:** `public/splash/`
- [ ] Create splash screens for common iOS sizes
- [ ] Add apple-touch-startup-image links
- [ ] Match app branding

### Task 6: Create Favicon Set
**File:** `public/`
- [ ] Create favicon.ico (multi-size)
- [ ] Create favicon-16x16.png
- [ ] Create favicon-32x32.png
- [ ] Add favicon links to layout

### Task 7: Configure Manifest Icons Array
**File:** `public/manifest.json`
- [ ] Add icons array with all sizes
- [ ] Set purpose: "any" and "maskable"
- [ ] Ensure correct paths

### Task 8: Test PWA Installation
**File:** Manual testing
- [ ] Test on Chrome Android
- [ ] Test on Safari iOS
- [ ] Verify standalone mode
- [ ] Verify splash screen
- [ ] Verify icon appearance

### Task 9: Add PWA Meta for Full Screen
**File:** `src/app/layout.tsx`
- [ ] Add viewport meta with viewport-fit=cover
- [ ] Handle safe areas (notch, home indicator)
- [ ] Test on iPhone with notch

### Task 10: Create Install Instructions Component (Optional)
**File:** `src/components/shared/InstallPrompt.tsx`
- [ ] Detect if app is installable
- [ ] Show custom install banner
- [ ] Handle beforeinstallprompt event
- [ ] Dismiss and don't show again option

## Dev Notes

### Architecture Pattern
- Manual PWA setup (no next-pwa library)
- Static manifest.json in public folder
- Meta tags in root layout

### Manifest Configuration
```json
// public/manifest.json
{
  "name": "Timelog - ระบบบันทึกเวลา",
  "short_name": "Timelog",
  "description": "ระบบบันทึกเวลาการทำงานสำหรับทีม",
  "start_url": "/entry",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0066CC",
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
  description: 'ระบบบันทึกเวลาการทำงานสำหรับทีม',
  manifest: '/manifest.json',
  themeColor: '#0066CC',
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

- [ ] manifest.json created with all required fields
- [ ] Icons in 192x192 and 512x512 sizes
- [ ] Maskable icons created
- [ ] iOS meta tags added
- [ ] Theme color configured
- [ ] App installable on Chrome Android
- [ ] App installable on Safari iOS
- [ ] Standalone mode works correctly
- [ ] Splash screen displays
- [ ] Lighthouse PWA score passes basic checks
- [ ] No TypeScript errors
- [ ] All imports use @/ aliases
