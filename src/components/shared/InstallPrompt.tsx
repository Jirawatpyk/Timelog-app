"use client";

import { useState, useEffect } from "react";
import { X, Download, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/use-pwa-install";

const DISMISSED_KEY = "pwa-install-dismissed";
const VISIT_COUNT_KEY = "pwa-visit-count";
const MIN_VISITS_TO_SHOW = 2;

interface InstallPromptProps {
  /** Override minimum visits required (for testing) */
  minVisits?: number;
}

/**
 * PWA Install Prompt Banner
 * Shows a banner prompting users to install the app after 2+ visits
 * Handles both Chrome/Edge (auto-prompt) and iOS (manual instructions)
 */
export function InstallPrompt({ minVisits = MIN_VISITS_TO_SHOW }: InstallPromptProps) {
  const { isInstallable, isInstalled, isIOS, install, dismiss } = usePWAInstall();
  const [shouldShow, setShouldShow] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Don't show if already installed or previously dismissed
    if (isInstalled) {
      setShouldShow(false);
      return;
    }

    const wasDismissed = localStorage.getItem(DISMISSED_KEY);
    if (wasDismissed) {
      setShouldShow(false);
      return;
    }

    // Track visit count
    const visitCount = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || "0", 10);
    const newCount = visitCount + 1;
    localStorage.setItem(VISIT_COUNT_KEY, String(newCount));

    // Show after minimum visits
    if (newCount >= minVisits && isInstallable) {
      setShouldShow(true);
    }
  }, [isInstalled, isInstallable, minVisits]);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    const installed = await install();
    if (installed) {
      setShouldShow(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "true");
    dismiss();
    setShouldShow(false);
    setShowIOSInstructions(false);
  };

  if (!shouldShow) {
    return null;
  }

  if (showIOSInstructions) {
    return (
      <div
        role="dialog"
        aria-label="Install instructions"
        className="fixed bottom-0 left-0 right-0 z-50 bg-primary p-4 text-primary-foreground shadow-lg animate-in slide-in-from-bottom"
      >
        <div className="mx-auto flex max-w-lg flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Share className="h-5 w-5" />
              <span className="font-medium">Install Timelog</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={handleDismiss}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ol className="list-inside list-decimal space-y-1 text-sm">
            <li>Tap the Share button in Safari</li>
            <li>Scroll down and tap &quot;Add to Home Screen&quot;</li>
            <li>Tap &quot;Add&quot; to confirm</li>
          </ol>
          <Button
            variant="secondary"
            size="sm"
            className="self-end"
            onClick={handleDismiss}
          >
            Got it
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-label="Install app"
      className="fixed bottom-0 left-0 right-0 z-50 bg-primary p-4 text-primary-foreground shadow-lg animate-in slide-in-from-bottom"
    >
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Download className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">Install Timelog</p>
            <p className="text-sm opacity-90">
              Add to home screen for quick access
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleInstall}
          >
            Install
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={handleDismiss}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
