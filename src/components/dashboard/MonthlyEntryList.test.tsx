/**
 * MonthlyEntryList Component Tests - Story 5.4
 *
 * Tests for the monthly entry list with week grouping.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MonthlyEntryList } from './MonthlyEntryList';
import type { TimeEntryWithDetails } from '@/types/domain';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock delete action
vi.mock('@/actions/entry', () => ({
  deleteTimeEntry: vi.fn().mockResolvedValue({ success: true }),
}));

// Helper to create mock entries
function createMockEntry(
  id: string,
  entryDate: string,
  durationMinutes: number
): TimeEntryWithDetails {
  return {
    id,
    user_id: 'user-1',
    job_id: 'job-1',
    service_id: 'service-1',
    task_id: 'task-1',
    department_id: 'dept-1',
    entry_date: entryDate,
    duration_minutes: durationMinutes,
    notes: null,
    created_at: '2025-01-01T10:00:00Z',
    updated_at: '2025-01-01T10:00:00Z',
    deleted_at: null,
    job: {
      id: 'job-1',
      name: 'Test Job',
      job_no: 'J001',
      project: {
        id: 'project-1',
        name: 'Test Project',
        client: {
          id: 'client-1',
          name: 'Test Client',
        },
      },
    },
    service: {
      id: 'service-1',
      name: 'Development',
    },
    task: {
      id: 'task-1',
      name: 'Coding',
    },
  };
}

describe('MonthlyEntryList', () => {
  const monthDate = new Date(2025, 0, 15); // January 2025

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders entries grouped by week', () => {
      const entries: TimeEntryWithDetails[] = [
        createMockEntry('1', '2025-01-02', 60), // Week 1
        createMockEntry('2', '2025-01-15', 120), // Week 3
      ];

      render(<MonthlyEntryList entries={entries} monthDate={monthDate} />);

      // Should see week headers
      expect(screen.getByText(/Week 1/)).toBeInTheDocument();
      expect(screen.getByText(/Week 3/)).toBeInTheDocument();
    });

    it('displays empty state when no entries', () => {
      render(<MonthlyEntryList entries={[]} monthDate={monthDate} />);

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No entries this month')).toBeInTheDocument();
    });

    it('shows week subtotals in headers', () => {
      const entries: TimeEntryWithDetails[] = [
        createMockEntry('1', '2025-01-15', 60), // 1 hour
        createMockEntry('2', '2025-01-16', 120), // 2 hours
      ];

      render(<MonthlyEntryList entries={entries} monthDate={monthDate} />);

      // Week 3 should show 3.0 hrs total
      expect(screen.getByText('3.0 hrs')).toBeInTheDocument();
    });

    it('shows entry count in week headers', () => {
      const entries: TimeEntryWithDetails[] = [
        createMockEntry('1', '2025-01-15', 60),
        createMockEntry('2', '2025-01-16', 60),
      ];

      render(<MonthlyEntryList entries={entries} monthDate={monthDate} />);

      expect(screen.getByText('(2 entries)')).toBeInTheDocument();
    });

    it('renders entry cards for each entry', () => {
      const entries: TimeEntryWithDetails[] = [
        createMockEntry('1', '2025-01-15', 60),
      ];

      render(<MonthlyEntryList entries={entries} monthDate={monthDate} />);

      expect(screen.getByTestId('entry-card')).toBeInTheDocument();
    });
  });

  describe('entry interaction', () => {
    it('opens details sheet when entry is tapped', async () => {
      const user = userEvent.setup();
      const entries: TimeEntryWithDetails[] = [
        createMockEntry('1', '2025-01-15', 60),
      ];

      render(<MonthlyEntryList entries={entries} monthDate={monthDate} />);

      const entryCard = screen.getByTestId('entry-card');
      await user.click(entryCard);

      // Should show the details sheet
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('week ordering', () => {
    it('displays weeks in ascending order (Week 1 first)', () => {
      const entries: TimeEntryWithDetails[] = [
        createMockEntry('1', '2025-01-28', 60), // Week 5
        createMockEntry('2', '2025-01-02', 60), // Week 1
        createMockEntry('3', '2025-01-15', 60), // Week 3
      ];

      render(<MonthlyEntryList entries={entries} monthDate={monthDate} />);

      const weekHeaders = screen.getAllByTestId('week-header');

      // Weeks should be in order: 1, 3, 5
      expect(weekHeaders[0]).toHaveTextContent('Week 1');
      expect(weekHeaders[1]).toHaveTextContent('Week 3');
      expect(weekHeaders[2]).toHaveTextContent('Week 5');
    });
  });

  describe('date display on entry cards', () => {
    it('shows date on entry cards in monthly view', () => {
      const entries: TimeEntryWithDetails[] = [
        createMockEntry('1', '2025-01-15', 60),
      ];

      render(<MonthlyEntryList entries={entries} monthDate={monthDate} />);

      // Should show the date (format is "Jan 15, 2025")
      expect(screen.getByText(/Jan 15, 2025/)).toBeInTheDocument();
    });
  });
});
