import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from './button';

describe('Button Touch Optimization (Story 8.4)', () => {
  describe('AC 1: Minimum Touch Target Size', () => {
    it('default size has h-11 class (44px height)', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('h-11');
    });

    it('sm size has h-10 class (40px height)', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('h-10');
    });

    it('lg size has h-12 class (48px height)', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('h-12');
    });

    it('icon size has size-11 class (44x44px)', () => {
      render(<Button size="icon" aria-label="Icon button">X</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('size-11');
    });

    it('icon-sm size has size-10 class (40x40px)', () => {
      render(<Button size="icon-sm" aria-label="Small icon">X</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('size-10');
    });

    it('icon-lg size has size-12 class (48x48px)', () => {
      render(<Button size="icon-lg" aria-label="Large icon">X</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('size-12');
    });
  });

  describe('AC 2: Touch Feedback', () => {
    it('has touch-feedback class for 50ms transition', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('touch-feedback');
    });
  });

  describe('Variant compatibility', () => {
    it('default variant works with touch classes', () => {
      render(<Button variant="default">Default</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('h-11');
      expect(button.className).toContain('touch-feedback');
    });

    it('destructive variant works with touch classes', () => {
      render(<Button variant="destructive">Delete</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('h-11');
      expect(button.className).toContain('touch-feedback');
    });

    it('outline variant works with touch classes', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('h-11');
      expect(button.className).toContain('touch-feedback');
    });

    it('ghost variant works with touch classes', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('h-11');
      expect(button.className).toContain('touch-feedback');
    });
  });
});
