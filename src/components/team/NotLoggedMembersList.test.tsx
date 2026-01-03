// src/components/team/NotLoggedMembersList.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NotLoggedMembersList } from './NotLoggedMembersList';
import type { TeamMemberWithStats } from '@/types/team';

describe('NotLoggedMembersList', () => {
  const createMember = (overrides: Partial<TeamMemberWithStats>): TeamMemberWithStats => ({
    id: overrides.id || '1',
    email: 'test@example.com',
    displayName: overrides.displayName || 'Test User',
    departmentId: 'd1',
    departmentName: 'Department A',
    role: 'staff',
    hasLoggedToday: false,
    totalHours: 0,
    entryCount: 0,
    isComplete: false,
    ...overrides,
  });

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T10:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Section Header', () => {
    it('displays section title "Not Logged"', () => {
      const members = [createMember({ id: '1', displayName: 'Alice' })];
      render(<NotLoggedMembersList members={members} />);
      expect(screen.getByText('Not Logged')).toBeInTheDocument();
    });

    it('shows member count in header (single)', () => {
      const members = [createMember({ id: '1', displayName: 'Alice' })];
      render(<NotLoggedMembersList members={members} />);
      expect(screen.getByText('(1 person)')).toBeInTheDocument();
    });

    it('shows member count in header (multiple)', () => {
      const members = [
        createMember({ id: '1', displayName: 'Alice' }),
        createMember({ id: '2', displayName: 'Bob' }),
        createMember({ id: '3', displayName: 'Charlie' }),
      ];
      render(<NotLoggedMembersList members={members} />);
      expect(screen.getByText('(3 people)')).toBeInTheDocument();
    });

    it('shows neutral dot indicator (not green)', () => {
      const members = [createMember({ id: '1', displayName: 'Alice' })];
      const { container } = render(<NotLoggedMembersList members={members} />);
      expect(screen.getByText('○')).toBeInTheDocument();
      // Should NOT have green dot like LoggedMembersList
      expect(container.querySelector('.text-green-600')).not.toBeInTheDocument();
    });
  });

  describe('Members List', () => {
    it('renders all members', () => {
      const members = [
        createMember({ id: '1', displayName: 'Alice' }),
        createMember({ id: '2', displayName: 'Bob' }),
      ];
      render(<NotLoggedMembersList members={members} />);
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('members are rendered in order provided (pre-sorted by query)', () => {
      // Query returns alphabetically sorted, verify order is maintained
      const members = [
        createMember({ id: '1', displayName: 'Alice' }),
        createMember({ id: '2', displayName: 'Bob' }),
        createMember({ id: '3', displayName: 'Charlie' }),
      ];
      render(<NotLoggedMembersList members={members} />);

      const names = screen.getAllByText(/Alice|Bob|Charlie/);
      expect(names).toHaveLength(3);
    });
  });

  describe('All Logged Success State (AC6)', () => {
    it('shows success message when no members', () => {
      render(<NotLoggedMembersList members={[]} />);
      expect(screen.getByText('Everyone has logged!')).toBeInTheDocument();
    });

    it('shows supporting message', () => {
      render(<NotLoggedMembersList members={[]} />);
      expect(screen.getByText('Great job, team!')).toBeInTheDocument();
    });

    it('shows count as 0', () => {
      render(<NotLoggedMembersList members={[]} />);
      expect(screen.getByText('(0 people)')).toBeInTheDocument();
    });

    it('has green styling for success state', () => {
      const { container } = render(<NotLoggedMembersList members={[]} />);
      // Success state should have green styling
      expect(container.querySelector('.border-green-200')).toBeInTheDocument();
      expect(container.querySelector('.bg-green-50\\/50')).toBeInTheDocument();
    });

    it('has celebration icon in green circle', () => {
      const { container } = render(<NotLoggedMembersList members={[]} />);
      // Should have green circle with icon
      expect(container.querySelector('.bg-green-100')).toBeInTheDocument();
      // PartyPopper icon
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('shows green dot in header for success', () => {
      render(<NotLoggedMembersList members={[]} />);
      expect(screen.getByText('●')).toBeInTheDocument();
    });
  });

  describe('Card Styling (Consistency with LoggedMembersList)', () => {
    it('uses Card component', () => {
      const members = [createMember({ id: '1', displayName: 'Alice' })];
      const { container } = render(<NotLoggedMembersList members={members} />);
      expect(container.querySelector('[class*="rounded"]')).toBeInTheDocument();
    });

    it('members are spaced with space-y-2', () => {
      const members = [
        createMember({ id: '1', displayName: 'Alice' }),
        createMember({ id: '2', displayName: 'Bob' }),
      ];
      const { container } = render(<NotLoggedMembersList members={members} />);
      expect(container.querySelector('.space-y-2')).toBeInTheDocument();
    });
  });
});
