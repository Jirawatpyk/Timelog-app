"use client";

/**
 * Apple Splash Screen Links
 * Adds iOS splash screen link tags for PWA
 * These require media queries that can't be set via Next.js metadata API
 */
export function AppleSplashLinks() {
  return (
    <>
      {/* iPhone 15 Pro Max */}
      <link
        rel="apple-touch-startup-image"
        href="/splash/apple-splash-1290-2796.png"
        media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)"
      />
      {/* iPhone 15 Pro / 14 Pro */}
      <link
        rel="apple-touch-startup-image"
        href="/splash/apple-splash-1179-2556.png"
        media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)"
      />
      {/* iPhone 14 / 13 / 12 */}
      <link
        rel="apple-touch-startup-image"
        href="/splash/apple-splash-1170-2532.png"
        media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)"
      />
      {/* iPhone SE / 8 / 7 / 6s */}
      <link
        rel="apple-touch-startup-image"
        href="/splash/apple-splash-750-1334.png"
        media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)"
      />
      {/* 12.9" iPad Pro */}
      <link
        rel="apple-touch-startup-image"
        href="/splash/apple-splash-2048-2732.png"
        media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)"
      />
      {/* 11" iPad Pro */}
      <link
        rel="apple-touch-startup-image"
        href="/splash/apple-splash-1668-2388.png"
        media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)"
      />
      {/* 9.7" iPad */}
      <link
        rel="apple-touch-startup-image"
        href="/splash/apple-splash-1536-2048.png"
        media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)"
      />
    </>
  );
}
