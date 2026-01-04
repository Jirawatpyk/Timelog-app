import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Input } from './input';

describe('Input Touch Optimization (Story 8.4)', () => {
  describe('AC 1: Minimum Touch Target Size', () => {
    it('has h-11 class (44px height)', () => {
      render(<Input placeholder="Enter text" />);
      const input = screen.getByPlaceholderText('Enter text');
      expect(input.className).toContain('h-11');
    });
  });

  describe('AC 4: Form Input Optimization (iOS Zoom Prevention)', () => {
    it('has text-base class for 16px font size', () => {
      render(<Input placeholder="Enter text" />);
      const input = screen.getByPlaceholderText('Enter text');
      expect(input.className).toContain('text-base');
    });

    it('does NOT have md:text-sm class (prevents iOS zoom)', () => {
      render(<Input placeholder="Enter text" />);
      const input = screen.getByPlaceholderText('Enter text');
      expect(input.className).not.toContain('md:text-sm');
    });
  });

  describe('Input types', () => {
    it('text input has touch-optimized classes', () => {
      render(<Input type="text" placeholder="Text" />);
      const input = screen.getByPlaceholderText('Text');
      expect(input.className).toContain('h-11');
      expect(input.className).toContain('text-base');
    });

    it('email input has touch-optimized classes', () => {
      render(<Input type="email" placeholder="Email" />);
      const input = screen.getByPlaceholderText('Email');
      expect(input.className).toContain('h-11');
      expect(input.className).toContain('text-base');
    });

    it('password input has touch-optimized classes', () => {
      render(<Input type="password" placeholder="Password" />);
      const input = screen.getByPlaceholderText('Password');
      expect(input.className).toContain('h-11');
      expect(input.className).toContain('text-base');
    });

    it('number input has touch-optimized classes', () => {
      render(<Input type="number" placeholder="Number" />);
      const input = screen.getByPlaceholderText('Number');
      expect(input.className).toContain('h-11');
      expect(input.className).toContain('text-base');
    });
  });

  describe('Custom className handling', () => {
    it('preserves custom className while maintaining touch classes', () => {
      render(<Input className="custom-class" placeholder="Custom" />);
      const input = screen.getByPlaceholderText('Custom');
      expect(input.className).toContain('h-11');
      expect(input.className).toContain('text-base');
      expect(input.className).toContain('custom-class');
    });
  });
});
