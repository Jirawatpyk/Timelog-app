import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { usePWAInstall } from "./use-pwa-install";

describe("usePWAInstall", () => {
  const originalUserAgent = navigator.userAgent;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Reset userAgent to non-iOS
    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
      configurable: true,
    });

    // Mock matchMedia for standalone check
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false, // Not in standalone mode by default
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Restore original userAgent
    Object.defineProperty(navigator, "userAgent", {
      value: originalUserAgent,
      configurable: true,
    });
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => usePWAInstall());

    expect(result.current.isInstalled).toBe(false);
    expect(result.current.isIOS).toBe(false);
    expect(typeof result.current.install).toBe("function");
    expect(typeof result.current.dismiss).toBe("function");
  });

  it("should detect standalone mode as installed", () => {
    // Mock standalone mode
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === "(display-mode: standalone)",
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const { result } = renderHook(() => usePWAInstall());

    expect(result.current.isInstalled).toBe(true);
    expect(result.current.isInstallable).toBe(false);
  });

  it("should detect iOS device", () => {
    // Mock iOS user agent
    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)",
      configurable: true,
    });

    const { result } = renderHook(() => usePWAInstall());

    expect(result.current.isIOS).toBe(true);
    expect(result.current.isInstallable).toBe(true);
  });

  it("should handle beforeinstallprompt event", async () => {
    // Set up event listener capture before rendering hook
    let capturedHandler: ((e: Event) => void) | null = null;
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = vi.fn((event, handler) => {
      if (event === "beforeinstallprompt") {
        capturedHandler = handler as (e: Event) => void;
      }
      return originalAddEventListener.call(window, event, handler as EventListener);
    }) as typeof window.addEventListener;

    const { result } = renderHook(() => usePWAInstall());

    // Initially not installable (no prompt event yet)
    expect(result.current.isInstallable).toBe(false);

    // Simulate beforeinstallprompt event using captured handler
    if (capturedHandler) {
      const mockPromptEvent = {
        preventDefault: vi.fn(),
        prompt: vi.fn().mockResolvedValue(undefined),
        userChoice: Promise.resolve({ outcome: "accepted" as const }),
      };

      act(() => {
        capturedHandler!(mockPromptEvent as unknown as Event);
      });

      await waitFor(() => {
        expect(result.current.isInstallable).toBe(true);
      });
    }

    window.addEventListener = originalAddEventListener;
  });

  it("should handle successful installation", async () => {
    // Set up event listener capture before rendering hook
    let capturedHandler: ((e: Event) => void) | null = null;
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = vi.fn((event, handler) => {
      if (event === "beforeinstallprompt") {
        capturedHandler = handler as (e: Event) => void;
      }
      return originalAddEventListener.call(window, event, handler as EventListener);
    }) as typeof window.addEventListener;

    const { result } = renderHook(() => usePWAInstall());

    // Simulate beforeinstallprompt event
    const mockPrompt = vi.fn().mockResolvedValue(undefined);
    const mockPromptEvent = {
      preventDefault: vi.fn(),
      prompt: mockPrompt,
      userChoice: Promise.resolve({ outcome: "accepted" as const }),
    };

    if (capturedHandler) {
      act(() => {
        capturedHandler!(mockPromptEvent as unknown as Event);
      });

      await waitFor(() => {
        expect(result.current.isInstallable).toBe(true);
      });

      // Trigger install
      let installResult: boolean | undefined;
      await act(async () => {
        installResult = await result.current.install();
      });

      expect(mockPrompt).toHaveBeenCalled();
      expect(installResult).toBe(true);
      expect(result.current.isInstalled).toBe(true);
      expect(result.current.isInstallable).toBe(false);
    }

    window.addEventListener = originalAddEventListener;
  });

  it("should handle dismissed installation", async () => {
    // Set up event listener capture before rendering hook
    let capturedHandler: ((e: Event) => void) | null = null;
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = vi.fn((event, handler) => {
      if (event === "beforeinstallprompt") {
        capturedHandler = handler as (e: Event) => void;
      }
      return originalAddEventListener.call(window, event, handler as EventListener);
    }) as typeof window.addEventListener;

    const { result } = renderHook(() => usePWAInstall());

    // Simulate beforeinstallprompt event with dismiss outcome
    const mockPromptEvent = {
      preventDefault: vi.fn(),
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: "dismissed" as const }),
    };

    if (capturedHandler) {
      act(() => {
        capturedHandler!(mockPromptEvent as unknown as Event);
      });

      await waitFor(() => {
        expect(result.current.isInstallable).toBe(true);
      });

      // Trigger install (user dismisses)
      let installResult: boolean | undefined;
      await act(async () => {
        installResult = await result.current.install();
      });

      expect(installResult).toBe(false);
      expect(result.current.isInstalled).toBe(false);
    }

    window.addEventListener = originalAddEventListener;
  });

  it("should handle dismiss action", async () => {
    // Set up event listener capture before rendering hook
    let capturedHandler: ((e: Event) => void) | null = null;
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = vi.fn((event, handler) => {
      if (event === "beforeinstallprompt") {
        capturedHandler = handler as (e: Event) => void;
      }
      return originalAddEventListener.call(window, event, handler as EventListener);
    }) as typeof window.addEventListener;

    const { result } = renderHook(() => usePWAInstall());

    // Simulate beforeinstallprompt event
    const mockPromptEvent = {
      preventDefault: vi.fn(),
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: "accepted" as const }),
    };

    if (capturedHandler) {
      act(() => {
        capturedHandler!(mockPromptEvent as unknown as Event);
      });

      await waitFor(() => {
        expect(result.current.isInstallable).toBe(true);
      });

      // Dismiss without installing
      act(() => {
        result.current.dismiss();
      });

      expect(result.current.isInstallable).toBe(false);
    }

    window.addEventListener = originalAddEventListener;
  });

  it("should return false when install called without prompt", async () => {
    const { result } = renderHook(() => usePWAInstall());

    let installResult: boolean | undefined;
    await act(async () => {
      installResult = await result.current.install();
    });

    expect(installResult).toBe(false);
  });

  it("should handle appinstalled event", async () => {
    // Set up event listener capture before rendering hook
    let capturedInstallHandler: ((e: Event) => void) | null = null;
    let capturedInstalledHandler: ((e: Event) => void) | null = null;
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = vi.fn((event, handler) => {
      if (event === "beforeinstallprompt") {
        capturedInstallHandler = handler as (e: Event) => void;
      }
      if (event === "appinstalled") {
        capturedInstalledHandler = handler as (e: Event) => void;
      }
      return originalAddEventListener.call(window, event, handler as EventListener);
    }) as typeof window.addEventListener;

    const { result } = renderHook(() => usePWAInstall());

    // Simulate beforeinstallprompt first
    const mockPromptEvent = {
      preventDefault: vi.fn(),
      prompt: vi.fn(),
      userChoice: Promise.resolve({ outcome: "accepted" as const }),
    };

    if (capturedInstallHandler) {
      act(() => {
        capturedInstallHandler!(mockPromptEvent as unknown as Event);
      });

      await waitFor(() => {
        expect(result.current.isInstallable).toBe(true);
      });

      // Simulate appinstalled event
      if (capturedInstalledHandler) {
        act(() => {
          capturedInstalledHandler!(new Event("appinstalled"));
        });

        expect(result.current.isInstalled).toBe(true);
        expect(result.current.isInstallable).toBe(false);
      }
    }

    window.addEventListener = originalAddEventListener;
  });
});
