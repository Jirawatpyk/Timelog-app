// src/components/team/NotLoggedMemberCard.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NotLoggedMemberCard } from './NotLoggedMemberCard';
import type { TeamMemberWithStats } from '@/types/team';

describe('NotLoggedMemberCard', () => {
  const baseMember: TeamMemberWithStats = {
    id: '1',
    email: 'test@example.com',
    displayName: 'Test User',
    departmentId: 'd1',
    departmentName: 'Department A',
    role: 'staff',
    hasLoggedToday: false,
    totalHours: 0,
    entryCount: 0,
    isComplete: false,
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('displays member name', () => {
    vi.setSystemTime(new Date('2025-01-01T10:00:00'));
    render(<NotLoggedMemberCard member={baseMember} />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('renders MemberAvatar with initial', () => {
    vi.setSystemTime(new Date('2025-01-01T10:00:00'));
    render(<NotLoggedMemberCard member={baseMember} />);
    // Avatar should show first letter
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('does NOT display hours', () => {
    vi.setSystemTime(new Date('2025-01-01T10:00:00'));
    render(<NotLoggedMemberCard member={baseMember} />);
    // Should not have any hours display
    expect(screen.queryByText(/hrs/)).not.toBeInTheDocument();
    expect(screen.queryByText(/ชม/)).not.toBeInTheDocument();
    expect(screen.queryByText('0.0')).not.toBeInTheDocument();
  });

  it('does NOT display entry count', () => {
    vi.setSystemTime(new Date('2025-01-01T10:00:00'));
    render(<NotLoggedMemberCard member={baseMember} />);
    expect(screen.queryByText(/entries/)).not.toBeInTheDocument();
    expect(screen.queryByText(/entry/)).not.toBeInTheDocument();
  });

  describe('Time-based styling', () => {
    describe('Before 5 PM (neutral)', () => {
      it('does NOT show orange dot before noon', () => {
        vi.setSystemTime(new Date('2025-01-01T09:00:00'));
        const { container } = render(<NotLoggedMemberCard member={baseMember} />);
        expect(container.querySelector('.bg-orange-400')).not.toBeInTheDocument();
      });

      it('does NOT show orange dot between noon and 5 PM', () => {
        vi.setSystemTime(new Date('2025-01-01T14:00:00'));
        const { container } = render(<NotLoggedMemberCard member={baseMember} />);
        expect(container.querySelector('.bg-orange-400')).not.toBeInTheDocument();
      });

      it('does NOT show orange dot at 4:59 PM', () => {
        vi.setSystemTime(new Date('2025-01-01T16:59:00'));
        const { container } = render(<NotLoggedMemberCard member={baseMember} />);
        expect(container.querySelector('.bg-orange-400')).not.toBeInTheDocument();
      });
    });

    describe('After 5 PM (warning)', () => {
      it('shows orange dot at exactly 5 PM', () => {
        vi.setSystemTime(new Date('2025-01-01T17:00:00'));
        const { container } = render(<NotLoggedMemberCard member={baseMember} />);
        expect(container.querySelector('.bg-orange-400')).toBeInTheDocument();
      });

      it('shows orange dot after 5 PM', () => {
        vi.setSystemTime(new Date('2025-01-01T18:30:00'));
        const { container } = render(<NotLoggedMemberCard member={baseMember} />);
        expect(container.querySelector('.bg-orange-400')).toBeInTheDocument();
      });

      it('orange dot is small (h-2 w-2)', () => {
        vi.setSystemTime(new Date('2025-01-01T17:30:00'));
        const { container } = render(<NotLoggedMemberCard member={baseMember} />);
        const dot = container.querySelector('.bg-orange-400');
        expect(dot?.className).toContain('h-2');
        expect(dot?.className).toContain('w-2');
        expect(dot?.className).toContain('rounded-full');
      });
    });
  });

  describe('No aggressive styling', () => {
    it('does NOT show red indicators at any time', () => {
      vi.setSystemTime(new Date('2025-01-01T20:00:00'));
      const { container } = render(<NotLoggedMemberCard member={baseMember} />);

      expect(container.querySelector('.text-red-600')).not.toBeInTheDocument();
      expect(container.querySelector('.bg-red-100')).not.toBeInTheDocument();
      expect(container.querySelector('.text-destructive')).not.toBeInTheDocument();
    });

    it('does NOT show exclamation or warning icons', () => {
      vi.setSystemTime(new Date('2025-01-01T20:00:00'));
      const { container } = render(<NotLoggedMemberCard member={baseMember} />);

      // Should not have AlertTriangle or AlertCircle icons
      expect(container.querySelector('svg.lucide-alert-triangle')).not.toBeInTheDocument();
      expect(container.querySelector('svg.lucide-alert-circle')).not.toBeInTheDocument();
    });
  });

  it('has card styling with border', () => {
    vi.setSystemTime(new Date('2025-01-01T10:00:00'));
    const { container } = render(<NotLoggedMemberCard member={baseMember} />);

    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('rounded-lg');
    expect(card.className).toContain('bg-card');
    expect(card.className).toContain('border');
  });

  it('uses flex layout with gap (consistent with LoggedMemberCard)', () => {
    vi.setSystemTime(new Date('2025-01-01T10:00:00'));
    const { container } = render(<NotLoggedMemberCard member={baseMember} />);

    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('flex');
    expect(card.className).toContain('items-center');
    expect(card.className).toContain('gap-3');
  });

  it('has p-3 padding (consistent with LoggedMemberCard)', () => {
    vi.setSystemTime(new Date('2025-01-01T10:00:00'));
    const { container } = render(<NotLoggedMemberCard member={baseMember} />);

    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('p-3');
  });

  // Story 6.5: Department name display tests
  describe('showDepartmentName prop', () => {
    it('does not show department name by default', () => {
      vi.setSystemTime(new Date('2025-01-01T10:00:00'));
      render(<NotLoggedMemberCard member={baseMember} />);

      expect(screen.queryByText('Department A')).not.toBeInTheDocument();
    });

    it('shows department name when showDepartmentName is true', () => {
      vi.setSystemTime(new Date('2025-01-01T10:00:00'));
      render(
        <NotLoggedMemberCard member={baseMember} showDepartmentName={true} />
      );

      expect(screen.getByText('Department A')).toBeInTheDocument();
    });

    it('does not show department name when showDepartmentName is false', () => {
      vi.setSystemTime(new Date('2025-01-01T10:00:00'));
      render(
        <NotLoggedMemberCard member={baseMember} showDepartmentName={false} />
      );

      expect(screen.queryByText('Department A')).not.toBeInTheDocument();
    });

    it('renders department badge with correct styling', () => {
      vi.setSystemTime(new Date('2025-01-01T10:00:00'));
      render(
        <NotLoggedMemberCard member={baseMember} showDepartmentName={true} />
      );

      const badge = screen.getByText('Department A');
      expect(badge.className).toContain('text-xs');
      expect(badge.className).toContain('text-muted-foreground');
      expect(badge.className).toContain('bg-muted');
      expect(badge.className).toContain('rounded');
    });
  });
});
