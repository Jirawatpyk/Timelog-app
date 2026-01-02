import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EditEntryForm } from './EditEntryForm';
import type { TimeEntryWithDetails } from '@/types/domain';

// Mock the entry actions
vi.mock('@/actions/entry', () => ({
  updateTimeEntry: vi.fn(),
  getActiveClients: vi.fn().mockResolvedValue({ success: true, data: [] }),
  getProjectsByClient: vi.fn().mockResolvedValue({ success: true, data: [] }),
  getJobsByProject: vi.fn().mockResolvedValue({ success: true, data: [] }),
  getActiveServices: vi.fn().mockResolvedValue({ success: true, data: [] }),
  getActiveTasks: vi.fn().mockResolvedValue({ success: true, data: [] }),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const createMockEntry = (): TimeEntryWithDetails => ({
  id: 'entry-1',
  user_id: 'user-1',
  job_id: 'job-1',
  service_id: 'service-1',
  task_id: 'task-1',
  duration_minutes: 90,
  entry_date: '2026-01-02',
  notes: 'Test notes',
  department_id: 'dept-1',
  created_at: '2026-01-02T10:00:00Z',
  updated_at: '2026-01-02T10:00:00Z',
  job: {
    id: 'job-1',
    name: 'Test Job',
    job_no: 'JOB-001',
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
    name: 'Test Service',
  },
  task: {
    id: 'task-1',
    name: 'Test Task',
  },
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('EditEntryForm', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-02T12:00:00'));
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renders the form', () => {
    const entry = createMockEntry();

    render(
      <EditEntryForm
        entry={entry}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByTestId('edit-entry-form')).toBeInTheDocument();
  });

  it('has Cancel and Save buttons', () => {
    const entry = createMockEntry();

    render(
      <EditEntryForm
        entry={entry}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('calls onCancel when Cancel button is clicked', async () => {
    const entry = createMockEntry();
    const onCancel = vi.fn();

    render(
      <EditEntryForm
        entry={entry}
        onSuccess={vi.fn()}
        onCancel={onCancel}
      />,
      { wrapper: createWrapper() }
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    cancelButton.click();

    expect(onCancel).toHaveBeenCalled();
  });

  it('renders fieldsets for form sections', () => {
    const entry = createMockEntry();

    render(
      <EditEntryForm
        entry={entry}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />,
      { wrapper: createWrapper() }
    );

    // Check for fieldsets (accessible via screen reader text)
    expect(screen.getByText('Edit Client, Project, Job')).toBeInTheDocument();
    expect(screen.getByText('Edit Service and Task')).toBeInTheDocument();
    expect(screen.getByText('Edit Duration and Date')).toBeInTheDocument();
  });

  it('has touch-friendly button sizes (48px min height)', () => {
    const entry = createMockEntry();

    render(
      <EditEntryForm
        entry={entry}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
      />,
      { wrapper: createWrapper() }
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    const saveButton = screen.getByRole('button', { name: /save/i });

    expect(cancelButton).toHaveClass('min-h-[48px]');
    expect(saveButton).toHaveClass('min-h-[48px]');
  });
});
