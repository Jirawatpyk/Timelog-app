/**
 * Entry List Tests - Story 5.2
 *
 * Tests for EntryList component
 * AC1: Entry list sorted (handled by query, not tested here)
 * AC4: Entry tap opens bottom sheet
 * AC6: Edit/Delete actions
 * AC7: Empty state
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EntryList } from './EntryList';
import type { TimeEntryWithDetails } from '@/types/domain';

// Mock next/navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock deleteTimeEntry action
vi.mock('@/actions/entry', () => ({
  deleteTimeEntry: vi.fn(() => Promise.resolve({ success: true, data: undefined })),
}));

// Get reference to mock for assertions
import { deleteTimeEntry } from '@/actions/entry';
const mockDeleteTimeEntry = vi.mocked(deleteTimeEntry);

const mockEntry: TimeEntryWithDetails = {
  id: 'entry-1',
  user_id: 'user-1',
  job_id: 'job-1',
  service_id: 'service-1',
  task_id: 'task-1',
  duration_minutes: 90,
  entry_date: '2026-01-02',
  notes: 'Test notes',
  department_id: 'dept-1',
  created_at: '2026-01-02T09:00:00Z',
  updated_at: '2026-01-02T09:00:00Z',
  deleted_at: null,
  job: {
    id: 'job-1',
    name: 'Website Redesign',
    job_no: 'JOB-001',
    project: {
      id: 'project-1',
      name: 'Digital Transformation',
      client: {
        id: 'client-1',
        name: 'Acme Corp',
      },
    },
  },
  service: {
    id: 'service-1',
    name: 'Development',
  },
  task: {
    id: 'task-1',
    name: 'Frontend',
  },
};

describe('EntryList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Empty State', () => {
    it('renders empty state when no entries', () => {
      render(<EntryList entries={[]} />);

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No entries for this period')).toBeInTheDocument();
    });

    it('renders custom empty message', () => {
      render(<EntryList entries={[]} emptyMessage="No entries for today" />);

      expect(screen.getByText('No entries for today')).toBeInTheDocument();
    });

    it('shows CTA in empty state', () => {
      render(<EntryList entries={[]} />);

      expect(screen.getByRole('link', { name: 'Add Entry' })).toBeInTheDocument();
    });
  });

  describe('Entry Display', () => {
    it('renders entry cards for all entries', () => {
      const entries = [
        mockEntry,
        { ...mockEntry, id: 'entry-2' },
        { ...mockEntry, id: 'entry-3' },
      ];
      render(<EntryList entries={entries} />);

      const cards = screen.getAllByTestId('entry-card');
      expect(cards).toHaveLength(3);
    });

    it('renders entry list container', () => {
      render(<EntryList entries={[mockEntry]} />);

      expect(screen.getByTestId('entry-list')).toBeInTheDocument();
    });
  });

  describe('Entry Tap / Sheet', () => {
    it('opens sheet when entry is tapped', async () => {
      const user = userEvent.setup();
      render(<EntryList entries={[mockEntry]} />);

      await user.click(screen.getByTestId('entry-card'));

      // Sheet should be open (dialog role)
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('shows entry details in sheet', async () => {
      const user = userEvent.setup();
      render(<EntryList entries={[mockEntry]} />);

      await user.click(screen.getByTestId('entry-card'));

      await waitFor(() => {
        expect(screen.getByText('Entry Details')).toBeInTheDocument();
      });
    });
  });

  describe('Edit Action', () => {
    it('navigates to edit page when Edit is clicked', async () => {
      const user = userEvent.setup();
      render(<EntryList entries={[mockEntry]} />);

      // Open sheet
      await user.click(screen.getByTestId('entry-card'));

      // Click Edit
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /edit/i }));

      expect(mockPush).toHaveBeenCalledWith('/entry/edit/entry-1');
    });
  });

  describe('Delete Action', () => {
    it('opens delete confirmation when Delete is clicked', async () => {
      const user = userEvent.setup();
      render(<EntryList entries={[mockEntry]} />);

      // Open sheet
      await user.click(screen.getByTestId('entry-card'));

      // Click Delete in sheet
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /delete/i }));

      // Delete confirmation should appear
      await waitFor(() => {
        expect(screen.getByText('Delete this entry?')).toBeInTheDocument();
      });
    });

    it('calls deleteTimeEntry and shows success toast on confirm', async () => {
      const { toast } = await import('sonner');
      const user = userEvent.setup();
      mockDeleteTimeEntry.mockResolvedValueOnce({ success: true, data: undefined });

      render(<EntryList entries={[mockEntry]} />);

      // Open sheet and click delete
      await user.click(screen.getByTestId('entry-card'));
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /delete/i }));

      // Confirm delete - button in AlertDialog says "Delete"
      await waitFor(() => {
        expect(screen.getByText('Delete this entry?')).toBeInTheDocument();
      });
      // Get all delete buttons, the confirm one is in the AlertDialog footer
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[deleteButtons.length - 1]); // Click the confirm button

      await waitFor(() => {
        expect(mockDeleteTimeEntry).toHaveBeenCalledWith('entry-1');
        expect(toast.success).toHaveBeenCalledWith('Entry deleted');
        expect(mockRefresh).toHaveBeenCalled();
      });
    });

    it('shows error toast on delete failure', async () => {
      const { toast } = await import('sonner');
      const user = userEvent.setup();
      mockDeleteTimeEntry.mockResolvedValueOnce({ success: false, error: 'Delete failed' });

      render(<EntryList entries={[mockEntry]} />);

      // Open sheet and click delete
      await user.click(screen.getByTestId('entry-card'));
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /delete/i }));

      // Confirm delete
      await waitFor(() => {
        expect(screen.getByText('Delete this entry?')).toBeInTheDocument();
      });
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[deleteButtons.length - 1]);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Delete failed');
      });
    });
  });
});
