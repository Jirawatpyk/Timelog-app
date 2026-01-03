"use client";

import { useState, useEffect, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface UsePWAInstallReturn {
  /** Whether the app can be installed (browser supports PWA and hasn't installed yet) */
  isInstallable: boolean;
  /** Whether the app is already installed (running in standalone mode) */
  isInstalled: boolean;
  /** Whether the app is running on iOS (requires manual install) */
  isIOS: boolean;
  /** Trigger the install prompt (Chrome/Edge only) */
  install: () => Promise<boolean>;
  /** Dismiss the install prompt without installing */
  dismiss: () => void;
}

/**
 * Hook for PWA installation state and actions
 * Handles both Chrome/Edge (beforeinstallprompt) and iOS (manual) scenarios
 */
export function usePWAInstall(): UsePWAInstallReturn {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS standalone check
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if iOS
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as Window & { MSStream?: unknown }).MSStream;
    setIsIOS(isIOSDevice);

    // iOS doesn't support beforeinstallprompt, but we can show manual instructions
    if (isIOSDevice) {
      setIsInstallable(true);
      return;
    }

    // Listen for beforeinstallprompt (Chrome, Edge, etc.)
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Listen for successful installation
    const installedHandler = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
    };
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const install = useCallback(async (): Promise<boolean> => {
    if (!installPrompt) {
      return false;
    }

    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
      setIsInstallable(false);
    }

    setInstallPrompt(null);
    return outcome === "accepted";
  }, [installPrompt]);

  const dismiss = useCallback(() => {
    setIsInstallable(false);
    setInstallPrompt(null);
  }, []);

  return {
    isInstallable,
    isInstalled,
    isIOS,
    install,
    dismiss,
  };
}
