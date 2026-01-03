// src/components/team/LoggedMemberCard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoggedMemberCard } from './LoggedMemberCard';
import type { TeamMemberWithStats } from '@/types/team';

describe('LoggedMemberCard', () => {
  const baseMember: TeamMemberWithStats = {
    id: '1',
    email: 'test@example.com',
    displayName: 'Test User',
    departmentId: 'd1',
    departmentName: 'Department A',
    role: 'staff',
    hasLoggedToday: true,
    totalHours: 0,
    entryCount: 0,
    isComplete: false,
  };

  it('displays member name', () => {
    render(
      <LoggedMemberCard
        member={{ ...baseMember, totalHours: 5.0, entryCount: 2 }}
      />
    );
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('displays entry count', () => {
    render(
      <LoggedMemberCard
        member={{ ...baseMember, totalHours: 5.0, entryCount: 3 }}
      />
    );
    expect(screen.getByText('3 entries')).toBeInTheDocument();
  });

  it('displays hours with 1 decimal place', () => {
    render(
      <LoggedMemberCard
        member={{ ...baseMember, totalHours: 5.5, entryCount: 2 }}
      />
    );
    expect(screen.getByText('5.5 hrs')).toBeInTheDocument();
  });

  describe('Complete day (8+ hours)', () => {
    const completeMember: TeamMemberWithStats = {
      ...baseMember,
      totalHours: 8.5,
      entryCount: 3,
      isComplete: true,
    };

    it('shows green checkmark for 8+ hours', () => {
      const { container } = render(<LoggedMemberCard member={completeMember} />);

      const hoursText = screen.getByText('8.5 hrs');
      expect(hoursText.className).toContain('text-green-600');

      // Check icon should be visible
      const svgIcon = container.querySelector('svg');
      expect(svgIcon).toBeInTheDocument();
    });

    it('shows checkmark in green circle', () => {
      const { container } = render(<LoggedMemberCard member={completeMember} />);

      const circleDiv = container.querySelector('.bg-green-100');
      expect(circleDiv).toBeInTheDocument();
      expect(circleDiv?.className).toContain('rounded-full');
      expect(circleDiv?.className).toContain('h-5');
      expect(circleDiv?.className).toContain('w-5');
    });

    it('shows hours in green text', () => {
      render(<LoggedMemberCard member={completeMember} />);
      const hoursText = screen.getByText('8.5 hrs');
      expect(hoursText.className).toContain('text-green-600');
    });
  });

  describe('Partial day (< 8 hours)', () => {
    const partialMember: TeamMemberWithStats = {
      ...baseMember,
      totalHours: 5.0,
      entryCount: 2,
      isComplete: false,
    };

    it('shows neutral color for < 8 hours', () => {
      render(<LoggedMemberCard member={partialMember} />);
      const hoursText = screen.getByText('5.0 hrs');
      expect(hoursText.className).not.toContain('text-green-600');
      expect(hoursText.className).toContain('text-foreground');
    });

    it('does not show checkmark for < 8 hours', () => {
      const { container } = render(<LoggedMemberCard member={partialMember} />);
      const svgIcon = container.querySelector('svg.lucide-check');
      expect(svgIcon).not.toBeInTheDocument();
    });

    it('does not show red or warning indicators', () => {
      const { container } = render(<LoggedMemberCard member={partialMember} />);

      // Should not have red or warning text
      const hoursText = screen.getByText('5.0 hrs');
      expect(hoursText.className).not.toContain('text-red');
      expect(hoursText.className).not.toContain('text-destructive');
      expect(hoursText.className).not.toContain('text-warning');
      expect(hoursText.className).not.toContain('text-amber');

      // Should not have warning icons
      expect(container.querySelector('.text-red-600')).not.toBeInTheDocument();
      expect(container.querySelector('.text-amber-600')).not.toBeInTheDocument();
    });
  });

  it('renders MemberAvatar component', () => {
    const { container } = render(
      <LoggedMemberCard
        member={{ ...baseMember, totalHours: 5.0, entryCount: 2 }}
      />
    );

    // Avatar should show first letter
    expect(screen.getByText('T')).toBeInTheDocument(); // First letter of "Test User"

    // Avatar should be rounded and colored
    const avatar = container.querySelector('.rounded-full');
    expect(avatar).toBeInTheDocument();
  });

  it('has card styling with border', () => {
    const { container } = render(
      <LoggedMemberCard
        member={{ ...baseMember, totalHours: 5.0, entryCount: 2 }}
      />
    );

    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('rounded-lg');
    expect(card.className).toContain('bg-card');
    expect(card.className).toContain('border');
  });

  it('uses flex layout with gap', () => {
    const { container } = render(
      <LoggedMemberCard
        member={{ ...baseMember, totalHours: 5.0, entryCount: 2 }}
      />
    );

    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('flex');
    expect(card.className).toContain('items-center');
    expect(card.className).toContain('gap-3');
  });

  it('handles exactly 8.0 hours as complete', () => {
    render(
      <LoggedMemberCard
        member={{
          ...baseMember,
          totalHours: 8.0,
          entryCount: 1,
          isComplete: true,
        }}
      />
    );

    const hoursText = screen.getByText('8.0 hrs');
    expect(hoursText.className).toContain('text-green-600');
  });

  it('handles single entry correctly', () => {
    render(
      <LoggedMemberCard
        member={{ ...baseMember, totalHours: 2.0, entryCount: 1 }}
      />
    );

    expect(screen.getByText('1 entry')).toBeInTheDocument();
  });

  // Story 6.5: Department name display tests
  describe('showDepartmentName prop', () => {
    it('does not show department name by default', () => {
      render(
        <LoggedMemberCard
          member={{ ...baseMember, totalHours: 5.0, entryCount: 2 }}
        />
      );

      expect(screen.queryByText('Department A')).not.toBeInTheDocument();
    });

    it('shows department name when showDepartmentName is true', () => {
      render(
        <LoggedMemberCard
          member={{ ...baseMember, totalHours: 5.0, entryCount: 2 }}
          showDepartmentName={true}
        />
      );

      expect(screen.getByText('Department A')).toBeInTheDocument();
    });

    it('does not show department name when showDepartmentName is false', () => {
      render(
        <LoggedMemberCard
          member={{ ...baseMember, totalHours: 5.0, entryCount: 2 }}
          showDepartmentName={false}
        />
      );

      expect(screen.queryByText('Department A')).not.toBeInTheDocument();
    });

    it('renders department badge with correct styling', () => {
      const { container } = render(
        <LoggedMemberCard
          member={{ ...baseMember, totalHours: 5.0, entryCount: 2 }}
          showDepartmentName={true}
        />
      );

      const badge = screen.getByText('Department A');
      expect(badge.className).toContain('text-xs');
      expect(badge.className).toContain('text-muted-foreground');
      expect(badge.className).toContain('bg-muted');
      expect(badge.className).toContain('rounded');
    });
  });
});
