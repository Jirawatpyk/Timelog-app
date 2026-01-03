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
});
