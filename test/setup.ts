import '@testing-library/jest-dom';

// Mock for Radix UI components that use pointer capture
// jsdom doesn't implement these methods
Element.prototype.hasPointerCapture = () => false;
Element.prototype.setPointerCapture = () => {};
Element.prototype.releasePointerCapture = () => {};

// Mock scrollIntoView for Radix UI Select
Element.prototype.scrollIntoView = () => {};

// Mock ResizeObserver for components that use it
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
