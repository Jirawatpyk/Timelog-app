import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { RecentEntries } from './RecentEntries';
import { getUserEntries, deleteTimeEntry } from '@/actions/entry';
import type { TimeEntryWithDetails } from '@/types/domain';

// Mock dependencies
vi.mock('@/actions/entry', () => ({
  getUserEntries: vi.fn(),
  deleteTimeEntry: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('@/lib/entry-rules', () => ({
  canEditEntry: vi.fn((date: string) => {
    // Entries within 7 days are editable
    const entryDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cutoffDate = new Date(today);
    cutoffDate.setDate(cutoffDate.getDate() - 7);
    return entryDate >= cutoffDate;
  }),
}));

// Mock components
vi.mock('@/components/entry', () => ({
  EntryDetailsSheet: ({ entry, open, onOpenChange, onEdit, onDelete }: {
    entry: TimeEntryWithDetails | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit: (entry: TimeEntryWithDetails) => void;
    onDelete: (entry: TimeEntryWithDetails) => void;
  }) => (
    open && entry ? (
      <div data-testid="details-sheet">
        <span>{entry.job.project.client.name}</span>
        <button onClick={() => onEdit(entry)}>Edit</button>
        <button onClick={() => onDelete(entry)}>Delete</button>
        <button onClick={() => onOpenChange(false)}>Close</button>
      </div>
    ) : null
  ),
  EditEntrySheet: ({ entry, open, onOpenChange, onSuccess }: {
    entry: TimeEntryWithDetails | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
  }) => (
    open && entry ? (
      <div data-testid="edit-sheet">
        <span>Editing: {entry.job.name}</span>
        <button onClick={onSuccess}>Save</button>
        <button onClick={() => onOpenChange(false)}>Cancel</button>
      </div>
    ) : null
  ),
  DeleteConfirmDialog: ({ entry, open, onOpenChange, onConfirm, isDeleting }: {
    entry: TimeEntryWithDetails | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    isDeleting: boolean;
  }) => (
    open && entry ? (
      <div data-testid="delete-confirm-dialog">
        <span>Delete Entry?</span>
        <span>This action cannot be undone</span>
        <button onClick={() => onOpenChange(false)}>Cancel</button>
        <button onClick={onConfirm} disabled={isDeleting}>Delete</button>
      </div>
    ) : null
  ),
}));

const mockGetUserEntries = vi.mocked(getUserEntries);
const mockDeleteTimeEntry = vi.mocked(deleteTimeEntry);

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}

// Helper to create mock entries
function createMockEntry(overrides: Partial<TimeEntryWithDetails> = {}): TimeEntryWithDetails {
  const today = new Date().toISOString().split('T')[0];
  return {
    id: 'entry-1',
    user_id: 'user-1',
    duration_minutes: 120,
    entry_date: today,
    notes: 'Test notes',
    department_id: 'dept-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    job: {
      id: 'job-1',
      name: 'Job Name',
      job_no: 'J001',
      project: {
        id: 'project-1',
        name: 'Project Name',
        client: {
          id: 'client-1',
          name: 'Client Name',
        },
      },
    },
    service: {
      id: 'service-1',
      name: 'Service Name',
    },
    task: {
      id: 'task-1',
      name: 'Task Name',
    },
    ...overrides,
  };
}

describe('RecentEntries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading state', () => {
    it('shows loading skeleton', () => {
      mockGetUserEntries.mockImplementation(() => new Promise(() => {}));
      renderWithProviders(<RecentEntries />);

      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Empty state', () => {
    it('shows empty message when no entries', async () => {
      mockGetUserEntries.mockResolvedValue({ success: true, data: [] });
      renderWithProviders(<RecentEntries />);

      await waitFor(() => {
        expect(screen.getByText('No entries yet')).toBeInTheDocument();
        expect(screen.getByText('Your logged time will appear here')).toBeInTheDocument();
      });
    });
  });

  describe('Error state', () => {
    it('shows error message on fetch failure', async () => {
      mockGetUserEntries.mockResolvedValue({ success: false, error: 'Failed to fetch' });
      renderWithProviders(<RecentEntries />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load entries')).toBeInTheDocument();
      });
    });
  });

  describe('Entry list display', () => {
    it('renders entry rows', async () => {
      const mockEntries = [
        createMockEntry({ id: 'entry-1' }),
        createMockEntry({ id: 'entry-2', job: { ...createMockEntry().job, name: 'Another Job' } }),
      ];
      mockGetUserEntries.mockResolvedValue({ success: true, data: mockEntries });

      renderWithProviders(<RecentEntries />);

      await waitFor(() => {
        expect(screen.getAllByText('Client Name')).toHaveLength(2);
      });
    });

    it('shows locked badge for old entries', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10);
      const mockEntries = [
        createMockEntry({
          id: 'old-entry',
          entry_date: oldDate.toISOString().split('T')[0],
        }),
      ];
      mockGetUserEntries.mockResolvedValue({ success: true, data: mockEntries });

      renderWithProviders(<RecentEntries />);

      await waitFor(() => {
        expect(screen.getByText('Locked')).toBeInTheDocument();
      });
    });
  });

  describe('Entry interaction', () => {
    it('opens details sheet when entry is tapped', async () => {
      const mockEntries = [createMockEntry()];
      mockGetUserEntries.mockResolvedValue({ success: true, data: mockEntries });

      renderWithProviders(<RecentEntries />);

      await waitFor(() => {
        expect(screen.getByText('Client Name')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /client name/i }));

      await waitFor(() => {
        expect(screen.getByTestId('details-sheet')).toBeInTheDocument();
      });
    });

    it('opens edit sheet when edit is clicked', async () => {
      const mockEntries = [createMockEntry()];
      mockGetUserEntries.mockResolvedValue({ success: true, data: mockEntries });

      renderWithProviders(<RecentEntries />);

      await waitFor(() => {
        expect(screen.getByText('Client Name')).toBeInTheDocument();
      });

      // Open details sheet
      fireEvent.click(screen.getByRole('button', { name: /client name/i }));

      await waitFor(() => {
        expect(screen.getByTestId('details-sheet')).toBeInTheDocument();
      });

      // Click edit
      fireEvent.click(screen.getByRole('button', { name: /edit/i }));

      await waitFor(() => {
        expect(screen.getByTestId('edit-sheet')).toBeInTheDocument();
        expect(screen.getByText('Editing: Job Name')).toBeInTheDocument();
      });
    });
  });

  describe('Delete functionality', () => {
    it('shows delete confirmation dialog', async () => {
      const mockEntries = [createMockEntry()];
      mockGetUserEntries.mockResolvedValue({ success: true, data: mockEntries });

      renderWithProviders(<RecentEntries />);

      await waitFor(() => {
        expect(screen.getByText('Client Name')).toBeInTheDocument();
      });

      // Open details sheet
      fireEvent.click(screen.getByRole('button', { name: /client name/i }));

      await waitFor(() => {
        expect(screen.getByTestId('details-sheet')).toBeInTheDocument();
      });

      // Click delete
      fireEvent.click(screen.getByRole('button', { name: /delete/i }));

      await waitFor(() => {
        expect(screen.getByText('Delete Entry?')).toBeInTheDocument();
        expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();
      });
    });

    it('deletes entry on confirmation', async () => {
      const mockEntries = [createMockEntry()];
      mockGetUserEntries.mockResolvedValue({ success: true, data: mockEntries });
      mockDeleteTimeEntry.mockResolvedValue({ success: true, data: undefined });

      renderWithProviders(<RecentEntries />);

      await waitFor(() => {
        expect(screen.getByText('Client Name')).toBeInTheDocument();
      });

      // Open details sheet
      fireEvent.click(screen.getByRole('button', { name: /client name/i }));

      await waitFor(() => {
        expect(screen.getByTestId('details-sheet')).toBeInTheDocument();
      });

      // Click delete to open confirmation
      fireEvent.click(screen.getByRole('button', { name: /delete/i }));

      await waitFor(() => {
        expect(screen.getByText('Delete Entry?')).toBeInTheDocument();
      });

      // Confirm delete
      const confirmButton = screen.getByRole('button', { name: /^delete$/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockDeleteTimeEntry).toHaveBeenCalledWith('entry-1');
      });
    });
  });
});
