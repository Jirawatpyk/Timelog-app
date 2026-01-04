import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Textarea } from './textarea';

describe('Textarea Touch Optimization (Story 8.4)', () => {
  describe('AC 1: Minimum Touch Target Size', () => {
    it('has min-h-11 class (minimum 44px height)', () => {
      render(<Textarea placeholder="Enter text" />);
      const textarea = screen.getByPlaceholderText('Enter text');
      expect(textarea.className).toContain('min-h-11');
    });
  });

  describe('AC 4: Form Input Optimization (iOS Zoom Prevention)', () => {
    it('has text-base class for 16px font size', () => {
      render(<Textarea placeholder="Enter text" />);
      const textarea = screen.getByPlaceholderText('Enter text');
      expect(textarea.className).toContain('text-base');
    });

    it('does NOT have md:text-sm class (prevents iOS zoom)', () => {
      render(<Textarea placeholder="Enter text" />);
      const textarea = screen.getByPlaceholderText('Enter text');
      expect(textarea.className).not.toContain('md:text-sm');
    });
  });

  describe('Custom className handling', () => {
    it('preserves custom className while maintaining touch classes', () => {
      render(<Textarea className="custom-class" placeholder="Custom" />);
      const textarea = screen.getByPlaceholderText('Custom');
      expect(textarea.className).toContain('min-h-11');
      expect(textarea.className).toContain('text-base');
      expect(textarea.className).toContain('custom-class');
    });
  });
});
