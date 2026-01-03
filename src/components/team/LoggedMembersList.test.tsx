// src/components/team/LoggedMembersList.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoggedMembersList } from './LoggedMembersList';
import type { TeamMemberWithStats } from '@/types/team';

describe('LoggedMembersList', () => {
  const createMember = (overrides: Partial<TeamMemberWithStats>): TeamMemberWithStats => ({
    id: '1',
    email: 'test@example.com',
    displayName: 'Test User',
    departmentId: 'd1',
    departmentName: 'Department A',
    role: 'staff',
    totalHours: 5.0,
    entryCount: 2,
    hasLoggedToday: true,
    isComplete: false,
    ...overrides,
  });

  describe('Section Header', () => {
    it('displays header "Logged Today"', () => {
      render(<LoggedMembersList members={[]} />);
      expect(screen.getByText('Logged Today')).toBeInTheDocument();
    });

    it('shows member count', () => {
      const members = [
        createMember({ id: '1', displayName: 'User 1' }),
        createMember({ id: '2', displayName: 'User 2' }),
        createMember({ id: '3', displayName: 'User 3' }),
      ];

      render(<LoggedMembersList members={members} />);
      expect(screen.getByText('(3 people)')).toBeInTheDocument();
    });

    it('shows zero count when no members', () => {
      render(<LoggedMembersList members={[]} />);
      expect(screen.getByText('(0 people)')).toBeInTheDocument();
    });

    it('shows green dot indicator in header', () => {
      const { container } = render(<LoggedMembersList members={[]} />);
      const greenDot = container.querySelector('.text-green-600');
      expect(greenDot).toBeInTheDocument();
      expect(greenDot?.textContent).toBe('●');
    });
  });

  describe('Empty State', () => {
    it('shows empty message when no members logged', () => {
      render(<LoggedMembersList members={[]} />);
      expect(screen.getByText('No one logged today')).toBeInTheDocument();
    });

    it('shows Users icon in empty state', () => {
      const { container } = render(<LoggedMembersList members={[]} />);
      const usersIcon = container.querySelector('svg.lucide-users');
      expect(usersIcon).toBeInTheDocument();
    });

    it('centers empty state content', () => {
      const { container } = render(<LoggedMembersList members={[]} />);
      const emptyDiv = screen.getByText('No one logged today').closest('div');
      expect(emptyDiv?.className).toContain('items-center');
      expect(emptyDiv?.className).toContain('text-center');
    });
  });

  describe('Member List', () => {
    it('renders all members', () => {
      const members = [
        createMember({ id: '1', displayName: 'Alice' }),
        createMember({ id: '2', displayName: 'Bob' }),
        createMember({ id: '3', displayName: 'Charlie' }),
      ];

      render(<LoggedMembersList members={members} />);

      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();
    });

    it('renders LoggedMemberCard for each member', () => {
      const members = [
        createMember({ id: '1', displayName: 'Alice', totalHours: 8.0, entryCount: 3 }),
        createMember({ id: '2', displayName: 'Bob', totalHours: 5.5, entryCount: 2 }),
      ];

      render(<LoggedMembersList members={members} />);

      // Check that cards show hours
      expect(screen.getByText('8.0 hrs')).toBeInTheDocument();
      expect(screen.getByText('5.5 hrs')).toBeInTheDocument();

      // Check that cards show entry counts
      expect(screen.getByText('3 entries')).toBeInTheDocument();
      expect(screen.getByText('2 entries')).toBeInTheDocument();
    });

    it('uses space-y-2 for card spacing', () => {
      const members = [
        createMember({ id: '1', displayName: 'Alice' }),
        createMember({ id: '2', displayName: 'Bob' }),
      ];

      render(<LoggedMembersList members={members} />);
      const cardList = screen.getByText('Alice').closest('.space-y-2');
      expect(cardList).toBeInTheDocument();
    });
  });

  describe('Card Container', () => {
    it('uses Card component', () => {
      const { container } = render(<LoggedMembersList members={[]} />);
      // Card component adds border and rounded corners
      expect(container.querySelector('.border')).toBeInTheDocument();
      expect(container.querySelector('.rounded-xl')).toBeInTheDocument();
    });

    it('has CardHeader with title', () => {
      render(<LoggedMembersList members={[]} />);
      const header = screen.getByText('Logged Today').closest('[class*="card"]');
      expect(header).toBeInTheDocument();
    });

    it('has CardContent section', () => {
      render(<LoggedMembersList members={[]} />);
      // CardContent is the parent of the list/empty state
      const content = screen.getByText('No one logged today').closest('div')?.parentElement;
      expect(content).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('renders complete and partial members correctly', () => {
      const members = [
        createMember({
          id: '1',
          displayName: 'Complete User',
          totalHours: 9.0,
          entryCount: 4,
          isComplete: true,
        }),
        createMember({
          id: '2',
          displayName: 'Partial User',
          totalHours: 3.5,
          entryCount: 1,
          isComplete: false,
        }),
      ];

      const { container } = render(<LoggedMembersList members={members} />);

      // Complete user should have green text and checkmark
      const completeHours = screen.getByText('9.0 hrs');
      expect(completeHours.className).toContain('text-green-600');

      // Partial user should have neutral text and no checkmark
      const partialHours = screen.getByText('3.5 hrs');
      expect(partialHours.className).toContain('text-foreground');

      // Check that there's exactly one checkmark (for complete user)
      const checkmarks = container.querySelectorAll('svg.lucide-check');
      expect(checkmarks).toHaveLength(1);
    });

    it('shows correct count matching array length', () => {
      const members = Array.from({ length: 5 }, (_, i) =>
        createMember({ id: `${i}`, displayName: `User ${i}` })
      );

      render(<LoggedMembersList members={members} />);
      expect(screen.getByText('(5 people)')).toBeInTheDocument();
    });
  });
});
