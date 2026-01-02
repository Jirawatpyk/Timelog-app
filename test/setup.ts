import '@testing-library/jest-dom';

/**
 * Vitest Global Test Setup
 *
 * This file provides global mocks required for testing React components that use
 * Radix UI primitives (via shadcn/ui). These mocks are necessary because jsdom
 * (the DOM implementation used by Vitest) doesn't implement certain browser APIs
 * that Radix UI components rely on.
 *
 * WHY THESE MOCKS ARE NEEDED:
 * ==========================
 *
 * Radix UI uses modern browser APIs for accessibility and interaction handling.
 * Without these mocks, tests will fail with errors like:
 * - "TypeError: element.setPointerCapture is not a function"
 * - "TypeError: element.scrollIntoView is not a function"
 * - "ReferenceError: ResizeObserver is not defined"
 *
 * WHEN TO ADD NEW MOCKS:
 * =====================
 * If you encounter similar "not a function" or "not defined" errors when testing
 * components that use Radix UI (Select, Dialog, DropdownMenu, etc.), add the
 * missing mock here rather than in individual test files.
 *
 * REFERENCE:
 * - Radix UI testing docs: https://www.radix-ui.com/docs/primitives/guides/testing
 * - jsdom limitations: https://github.com/jsdom/jsdom#unimplemented-parts-of-the-web-platform
 */

// =============================================================================
// POINTER CAPTURE MOCKS
// =============================================================================
// Radix UI uses pointer capture for drag operations in Slider, ScrollArea,
// and for focus management in Select, DropdownMenu, etc.
// jsdom doesn't implement the Pointer Events API.
Element.prototype.hasPointerCapture = () => false;
Element.prototype.setPointerCapture = () => {};
Element.prototype.releasePointerCapture = () => {};

// =============================================================================
// SCROLL INTO VIEW MOCK
// =============================================================================
// Radix UI Select scrolls the selected item into view when the dropdown opens.
// jsdom doesn't implement scrollIntoView.
Element.prototype.scrollIntoView = () => {};

// =============================================================================
// RESIZE OBSERVER MOCK
// =============================================================================
// Many Radix UI components (Popover, Tooltip, Select) use ResizeObserver to
// reposition themselves when content size changes.
// jsdom doesn't implement ResizeObserver.
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
