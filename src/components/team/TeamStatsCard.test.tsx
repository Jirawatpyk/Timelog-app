/**
 * Team Stats Card Tests - Stories 6.1, 6.3
 *
 * Tests for TeamStatsCard component
 * AC2: Summary stats section
 * Story 6.3: Added loggedCount display
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TeamStatsCard } from './TeamStatsCard';

describe('TeamStatsCard', () => {
  it('renders team member count', () => {
    render(<TeamStatsCard totalMembers={5} />);

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('team members')).toBeInTheDocument();
  });

  it('renders Team Summary title', () => {
    render(<TeamStatsCard totalMembers={3} />);

    expect(screen.getByText('Team Summary')).toBeInTheDocument();
  });

  it('renders Users icon', () => {
    render(<TeamStatsCard totalMembers={5} />);

    // Check for icon parent element
    const iconParent = screen.getByText('Team Summary').closest('[class*="flex"]');
    expect(iconParent).toBeInTheDocument();
  });

  it('handles zero members', () => {
    render(<TeamStatsCard totalMembers={0} />);

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('handles single member', () => {
    render(<TeamStatsCard totalMembers={1} />);

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('handles large member count', () => {
    render(<TeamStatsCard totalMembers={999} />);

    expect(screen.getByText('999')).toBeInTheDocument();
  });

  // Story 6.3: loggedCount prop tests
  describe('loggedCount prop (Story 6.3)', () => {
    it('displays logged count when provided', () => {
      render(<TeamStatsCard totalMembers={10} loggedCount={7} />);

      expect(screen.getByText('7')).toBeInTheDocument();
      expect(screen.getByText('logged')).toBeInTheDocument();
    });

    it('does not display logged section when loggedCount is undefined', () => {
      render(<TeamStatsCard totalMembers={10} />);

      expect(screen.queryByText('logged')).not.toBeInTheDocument();
    });

    it('displays zero logged count', () => {
      render(<TeamStatsCard totalMembers={10} loggedCount={0} />);

      // Should show 0 logged (0 is a valid value)
      expect(screen.getByText('logged')).toBeInTheDocument();
    });

    it('shows logged count with green styling', () => {
      const { container } = render(<TeamStatsCard totalMembers={10} loggedCount={5} />);

      // Check for green text color on the count
      const greenElement = container.querySelector('.text-green-600');
      expect(greenElement).toBeInTheDocument();
    });

    it('shows UserCheck icon when loggedCount provided', () => {
      const { container } = render(<TeamStatsCard totalMembers={10} loggedCount={5} />);

      // UserCheck icon should be present
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  // Story 6.4: Full team stats props tests
  describe('Full Stats Props (Story 6.4)', () => {
    it('displays total hours when provided', () => {
      render(
        <TeamStatsCard
          totalMembers={10}
          loggedCount={7}
          totalHours={52.5}
          averageHours={7.5}
        />
      );

      expect(screen.getByText(/52\.5/)).toBeInTheDocument();
      expect(screen.getByText(/hrs total/i)).toBeInTheDocument();
    });

    it('displays average hours when provided', () => {
      render(
        <TeamStatsCard
          totalMembers={10}
          loggedCount={7}
          totalHours={52.5}
          averageHours={7.5}
        />
      );

      expect(screen.getByText(/7\.5/)).toBeInTheDocument();
      expect(screen.getByText(/avg\/person/i)).toBeInTheDocument();
    });

    it('displays compliance rate when loggedCount and totalMembers provided', () => {
      render(
        <TeamStatsCard
          totalMembers={10}
          loggedCount={7}
          totalHours={52.5}
          averageHours={7.5}
        />
      );

      // 7/10 = 70%
      expect(screen.getByText(/70%/)).toBeInTheDocument();
    });

    it('shows 100% compliance with green styling', () => {
      const { container } = render(
        <TeamStatsCard
          totalMembers={10}
          loggedCount={10}
          totalHours={80}
          averageHours={8}
        />
      );

      // 100% compliance should have green styling
      const greenText = container.querySelector('.text-green-600');
      expect(greenText).toBeInTheDocument();
      expect(screen.getByText(/100%/)).toBeInTheDocument();
    });

    it('handles zero hours gracefully', () => {
      render(
        <TeamStatsCard
          totalMembers={10}
          loggedCount={0}
          totalHours={0}
          averageHours={0}
        />
      );

      // Check for 0% compliance
      expect(screen.getByText(/0%/)).toBeInTheDocument();
      // Check for 0.0 hours formatting
      expect(screen.getAllByText(/0\.0/).length).toBeGreaterThan(0);
    });

    it('formats hours with one decimal place', () => {
      render(
        <TeamStatsCard
          totalMembers={5}
          loggedCount={3}
          totalHours={18.333}
          averageHours={6.111}
        />
      );

      // Should be formatted to 1 decimal
      expect(screen.getByText(/18\.3/)).toBeInTheDocument();
      expect(screen.getByText(/6\.1/)).toBeInTheDocument();
    });

    it('does not show extended stats when totalHours is not provided', () => {
      render(<TeamStatsCard totalMembers={10} loggedCount={5} />);

      // Should not show hours or average
      expect(screen.queryByText(/hrs total/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/avg\/person/i)).not.toBeInTheDocument();
    });
  });
});
