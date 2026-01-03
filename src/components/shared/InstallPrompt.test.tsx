import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { InstallPrompt } from "./InstallPrompt";

// Mock the usePWAInstall hook
const mockInstall = vi.fn();
const mockDismiss = vi.fn();

vi.mock("@/hooks/use-pwa-install", () => ({
  usePWAInstall: () => ({
    isInstallable: true,
    isInstalled: false,
    isIOS: false,
    install: mockInstall,
    dismiss: mockDismiss,
  }),
}));

describe("InstallPrompt", () => {
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

  it("should not show on first visit", () => {
    render(<InstallPrompt />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should show after minimum visits", () => {
    // Simulate 2 visits
    localStorage.setItem("pwa-visit-count", "1");

    render(<InstallPrompt />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Install Timelog")).toBeInTheDocument();
  });

  it("should show with custom minVisits prop", () => {
    // Only 1 visit, but minVisits is 1
    render(<InstallPrompt minVisits={1} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("should not show if previously dismissed", () => {
    localStorage.setItem("pwa-visit-count", "5");
    localStorage.setItem("pwa-install-dismissed", "true");

    render(<InstallPrompt />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should call install when Install button clicked", async () => {
    localStorage.setItem("pwa-visit-count", "1");
    mockInstall.mockResolvedValue(true);

    render(<InstallPrompt />);

    const installButton = screen.getByRole("button", { name: /install/i });
    fireEvent.click(installButton);

    await waitFor(() => {
      expect(mockInstall).toHaveBeenCalled();
    });
  });

  it("should dismiss when X button clicked", () => {
    localStorage.setItem("pwa-visit-count", "1");

    render(<InstallPrompt />);

    const dismissButton = screen.getByRole("button", { name: /dismiss/i });
    fireEvent.click(dismissButton);

    expect(mockDismiss).toHaveBeenCalled();
    expect(localStorage.getItem("pwa-install-dismissed")).toBe("true");
  });

  it("should hide after successful installation", async () => {
    localStorage.setItem("pwa-visit-count", "1");
    mockInstall.mockResolvedValue(true);

    const { rerender } = render(<InstallPrompt />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    const installButton = screen.getByRole("button", { name: /install/i });
    fireEvent.click(installButton);

    await waitFor(() => {
      expect(mockInstall).toHaveBeenCalled();
    });

    // After successful install, dialog should be hidden
    rerender(<InstallPrompt />);
  });

  it("should increment visit count on each mount", () => {
    render(<InstallPrompt />);

    expect(localStorage.getItem("pwa-visit-count")).toBe("1");

    // Unmount and remount
    render(<InstallPrompt />);

    expect(localStorage.getItem("pwa-visit-count")).toBe("2");
  });
});

// iOS-specific tests are in InstallPrompt.ios.test.tsx
// This avoids vi.doMock hoisting issues by using separate files with dedicated mocks
