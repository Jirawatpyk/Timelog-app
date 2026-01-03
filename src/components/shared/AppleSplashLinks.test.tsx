/**
 * AppleSplashLinks Tests - Story 8.1
 *
 * Tests for iOS splash screen link tags
 * AC4: iOS Support - Splash screen displays correctly
 */

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { AppleSplashLinks } from "./AppleSplashLinks";

describe("AppleSplashLinks", () => {
  it("should render 7 splash screen links", () => {
    const { container } = render(<AppleSplashLinks />);

    const links = container.querySelectorAll('link[rel="apple-touch-startup-image"]');
    expect(links).toHaveLength(7);
  });

  it("should include iPhone 15 Pro Max splash", () => {
    const { container } = render(<AppleSplashLinks />);

    const link = container.querySelector(
      'link[href="/splash/apple-splash-1290-2796.png"]'
    );
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      "media",
      "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)"
    );
  });

  it("should include iPhone 15 Pro / 14 Pro splash", () => {
    const { container } = render(<AppleSplashLinks />);

    const link = container.querySelector(
      'link[href="/splash/apple-splash-1179-2556.png"]'
    );
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      "media",
      "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)"
    );
  });

  it("should include iPhone 14 / 13 / 12 splash", () => {
    const { container } = render(<AppleSplashLinks />);

    const link = container.querySelector(
      'link[href="/splash/apple-splash-1170-2532.png"]'
    );
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      "media",
      "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)"
    );
  });

  it("should include iPhone SE / 8 / 7 / 6s splash", () => {
    const { container } = render(<AppleSplashLinks />);

    const link = container.querySelector(
      'link[href="/splash/apple-splash-750-1334.png"]'
    );
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      "media",
      "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)"
    );
  });

  it("should include 12.9 inch iPad Pro splash", () => {
    const { container } = render(<AppleSplashLinks />);

    const link = container.querySelector(
      'link[href="/splash/apple-splash-2048-2732.png"]'
    );
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      "media",
      "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)"
    );
  });

  it("should include 11 inch iPad Pro splash", () => {
    const { container } = render(<AppleSplashLinks />);

    const link = container.querySelector(
      'link[href="/splash/apple-splash-1668-2388.png"]'
    );
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      "media",
      "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)"
    );
  });

  it("should include 9.7 inch iPad splash", () => {
    const { container } = render(<AppleSplashLinks />);

    const link = container.querySelector(
      'link[href="/splash/apple-splash-1536-2048.png"]'
    );
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      "media",
      "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)"
    );
  });

  it("should render all links with correct rel attribute", () => {
    const { container } = render(<AppleSplashLinks />);

    const links = container.querySelectorAll("link");
    links.forEach((link) => {
      expect(link).toHaveAttribute("rel", "apple-touch-startup-image");
    });
  });

  it("should render all links with media queries", () => {
    const { container } = render(<AppleSplashLinks />);

    const links = container.querySelectorAll("link");
    links.forEach((link) => {
      expect(link).toHaveAttribute("media");
      expect(link.getAttribute("media")).toContain("device-width");
      expect(link.getAttribute("media")).toContain("device-height");
      expect(link.getAttribute("media")).toContain("-webkit-device-pixel-ratio");
    });
  });
});
