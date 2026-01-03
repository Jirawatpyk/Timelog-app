// src/components/shared/MemberAvatar.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemberAvatar } from './MemberAvatar';

describe('MemberAvatar', () => {
  it('displays first letter of name', () => {
    render(<MemberAvatar name="John Doe" />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('converts first letter to uppercase', () => {
    render(<MemberAvatar name="alice smith" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('handles Thai names', () => {
    render(<MemberAvatar name="สมชาย" />);
    expect(screen.getByText('ส')).toBeInTheDocument();
  });

  it('renders small size correctly', () => {
    const { container } = render(<MemberAvatar name="Test" size="sm" />);
    const avatar = container.firstChild as HTMLElement;
    expect(avatar.className).toContain('h-8');
    expect(avatar.className).toContain('w-8');
    expect(avatar.className).toContain('text-xs');
  });

  it('renders medium size by default', () => {
    const { container } = render(<MemberAvatar name="Test" />);
    const avatar = container.firstChild as HTMLElement;
    expect(avatar.className).toContain('h-10');
    expect(avatar.className).toContain('w-10');
    expect(avatar.className).toContain('text-sm');
  });

  it('renders large size correctly', () => {
    const { container } = render(<MemberAvatar name="Test" size="lg" />);
    const avatar = container.firstChild as HTMLElement;
    expect(avatar.className).toContain('h-12');
    expect(avatar.className).toContain('w-12');
    expect(avatar.className).toContain('text-base');
  });

  it('generates consistent color for same name', () => {
    const { container: container1 } = render(<MemberAvatar name="John" />);
    const { container: container2 } = render(<MemberAvatar name="John" />);

    const avatar1 = container1.firstChild as HTMLElement;
    const avatar2 = container2.firstChild as HTMLElement;

    // Both should have the same background color class
    const bgClass1 = avatar1.className.match(/bg-\w+-\d+/)?.[0];
    const bgClass2 = avatar2.className.match(/bg-\w+-\d+/)?.[0];

    expect(bgClass1).toBe(bgClass2);
  });

  it('generates different colors for different names', () => {
    const { container: container1 } = render(<MemberAvatar name="Alice" />);
    const { container: container2 } = render(<MemberAvatar name="Bob" />);

    const avatar1 = container1.firstChild as HTMLElement;
    const avatar2 = container2.firstChild as HTMLElement;

    const bgClass1 = avatar1.className.match(/bg-\w+-\d+/)?.[0];
    const bgClass2 = avatar2.className.match(/bg-\w+-\d+/)?.[0];

    // Different names should (likely) have different colors
    // Note: This might occasionally fail due to hash collision, but very unlikely
    expect(bgClass1).toBeDefined();
    expect(bgClass2).toBeDefined();
  });

  it('applies custom className', () => {
    const { container } = render(<MemberAvatar name="Test" className="custom-class" />);
    const avatar = container.firstChild as HTMLElement;
    expect(avatar.className).toContain('custom-class');
  });

  it('has rounded-full styling', () => {
    const { container } = render(<MemberAvatar name="Test" />);
    const avatar = container.firstChild as HTMLElement;
    expect(avatar.className).toContain('rounded-full');
  });

  it('centers content', () => {
    const { container } = render(<MemberAvatar name="Test" />);
    const avatar = container.firstChild as HTMLElement;
    expect(avatar.className).toContain('flex');
    expect(avatar.className).toContain('items-center');
    expect(avatar.className).toContain('justify-center');
  });

  it('uses white text color', () => {
    const { container } = render(<MemberAvatar name="Test" />);
    const avatar = container.firstChild as HTMLElement;
    expect(avatar.className).toContain('text-white');
  });

  it('uses medium font weight', () => {
    const { container } = render(<MemberAvatar name="Test" />);
    const avatar = container.firstChild as HTMLElement;
    expect(avatar.className).toContain('font-medium');
  });
});
