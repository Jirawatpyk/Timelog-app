/**
 * InstallPrompt iOS Tests - Story 8.1
 *
 * Separate test file for iOS-specific scenarios
 * Uses dedicated mock configuration for iOS device simulation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InstallPrompt } from "./InstallPrompt";

// Mock the usePWAInstall hook for iOS device
const mockInstall = vi.fn();
const mockDismiss = vi.fn();

vi.mock("@/hooks/use-pwa-install", () => ({
  usePWAInstall: () => ({
    isInstallable: true,
    isInstalled: false,
    isIOS: true,
    install: mockInstall,
    dismiss: mockDismiss,
  }),
}));

describe("InstallPrompt - iOS Device", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Mock matchMedia
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should show Install button on iOS after minimum visits", () => {
    localStorage.setItem("pwa-visit-count", "1");

    render(<InstallPrompt />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /install/i })).toBeInTheDocument();
  });

  it("should show iOS instructions when Install clicked", () => {
    localStorage.setItem("pwa-visit-count", "1");

    render(<InstallPrompt />);

    const installButton = screen.getByRole("button", { name: /install/i });
    fireEvent.click(installButton);

    // Should show iOS-specific instructions
    expect(screen.getByText(/tap the share button/i)).toBeInTheDocument();
    expect(screen.getByText(/add to home screen/i)).toBeInTheDocument();
  });

  it("should show step-by-step iOS instructions", () => {
    localStorage.setItem("pwa-visit-count", "1");

    render(<InstallPrompt />);

    const installButton = screen.getByRole("button", { name: /install/i });
    fireEvent.click(installButton);

    // Verify all 3 steps are present
    expect(screen.getByText(/tap the share button in safari/i)).toBeInTheDocument();
    expect(screen.getByText(/scroll down and tap.*add to home screen/i)).toBeInTheDocument();
    expect(screen.getByText(/tap.*add.*to confirm/i)).toBeInTheDocument();
  });

  it("should show Share icon in iOS instructions", () => {
    localStorage.setItem("pwa-visit-count", "1");

    const { container } = render(<InstallPrompt />);

    const installButton = screen.getByRole("button", { name: /install/i });
    fireEvent.click(installButton);

    // Share icon should be visible
    const shareIcon = container.querySelector("svg.lucide-share");
    expect(shareIcon).toBeInTheDocument();
  });

  it("should have Got it button to dismiss iOS instructions", () => {
    localStorage.setItem("pwa-visit-count", "1");

    render(<InstallPrompt />);

    const installButton = screen.getByRole("button", { name: /install/i });
    fireEvent.click(installButton);

    const gotItButton = screen.getByRole("button", { name: /got it/i });
    expect(gotItButton).toBeInTheDocument();
  });

  it("should dismiss and save to localStorage when Got it clicked", () => {
    localStorage.setItem("pwa-visit-count", "1");

    render(<InstallPrompt />);

    const installButton = screen.getByRole("button", { name: /install/i });
    fireEvent.click(installButton);

    const gotItButton = screen.getByRole("button", { name: /got it/i });
    fireEvent.click(gotItButton);

    expect(mockDismiss).toHaveBeenCalled();
    expect(localStorage.getItem("pwa-install-dismissed")).toBe("true");
  });

  it("should not call native install on iOS (manual only)", () => {
    localStorage.setItem("pwa-visit-count", "1");

    render(<InstallPrompt />);

    const installButton = screen.getByRole("button", { name: /install/i });
    fireEvent.click(installButton);

    // On iOS, we show instructions instead of calling install()
    expect(mockInstall).not.toHaveBeenCalled();
  });

  it("should have close button in iOS instructions dialog", () => {
    localStorage.setItem("pwa-visit-count", "1");

    render(<InstallPrompt />);

    const installButton = screen.getByRole("button", { name: /install/i });
    fireEvent.click(installButton);

    const closeButton = screen.getByRole("button", { name: /close/i });
    expect(closeButton).toBeInTheDocument();
  });

  it("should dismiss when close button clicked in iOS instructions", () => {
    localStorage.setItem("pwa-visit-count", "1");

    render(<InstallPrompt />);

    const installButton = screen.getByRole("button", { name: /install/i });
    fireEvent.click(installButton);

    const closeButton = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockDismiss).toHaveBeenCalled();
    expect(localStorage.getItem("pwa-install-dismissed")).toBe("true");
  });
});
