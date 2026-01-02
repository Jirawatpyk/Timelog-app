import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EntryDetailsSheet } from './EntryDetailsSheet';
import type { TimeEntryWithDetails } from '@/types/domain';

// Mock entry data
const createMockEntry = (overrides: Partial<TimeEntryWithDetails> = {}): TimeEntryWithDetails => ({
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
  deleted_at: null,
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
  ...overrides,
});

describe('EntryDetailsSheet', () => {
  beforeEach(() => {
    // Mock current date to 2026-01-02 for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-02T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders entry details when open', () => {
    const entry = createMockEntry();
    const onOpenChange = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <EntryDetailsSheet
        entry={entry}
        open={true}
        onOpenChange={onOpenChange}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('Entry Details')).toBeInTheDocument();
    expect(screen.getByText('Test Client')).toBeInTheDocument();
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('JOB-001 - Test Job')).toBeInTheDocument();
    expect(screen.getByText('Test Service')).toBeInTheDocument();
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test notes')).toBeInTheDocument();
  });

  it('renders job name without job_no when null', () => {
    const entry = createMockEntry({
      job: {
        id: 'job-1',
        name: 'Test Job',
        job_no: null,
        project: {
          id: 'project-1',
          name: 'Test Project',
          client: { id: 'client-1', name: 'Test Client' },
        },
      },
    });

    render(
      <EntryDetailsSheet
        entry={entry}
        open={true}
        onOpenChange={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('Test Job')).toBeInTheDocument();
    expect(screen.queryByText(/JOB-/)).not.toBeInTheDocument();
  });

  it('does not render task row when task is null', () => {
    const entry = createMockEntry({ task: null, task_id: null });

    render(
      <EntryDetailsSheet
        entry={entry}
        open={true}
        onOpenChange={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.queryByText('Task')).not.toBeInTheDocument();
  });

  it('does not render notes row when notes is null', () => {
    const entry = createMockEntry({ notes: null });

    render(
      <EntryDetailsSheet
        entry={entry}
        open={true}
        onOpenChange={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.queryByText('Notes')).not.toBeInTheDocument();
  });

  it('calls onEdit when Edit button is clicked', () => {
    const entry = createMockEntry();
    const onEdit = vi.fn();

    render(
      <EntryDetailsSheet
        entry={entry}
        open={true}
        onOpenChange={vi.fn()}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledWith(entry);
  });

  it('calls onDelete when Delete button is clicked', () => {
    const entry = createMockEntry();
    const onDelete = vi.fn();

    render(
      <EntryDetailsSheet
        entry={entry}
        open={true}
        onOpenChange={vi.fn()}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith(entry);
  });

  it('disables Edit button for entries older than 7 days', () => {
    const entry = createMockEntry({ entry_date: '2025-12-20' });

    render(
      <EntryDetailsSheet
        entry={entry}
        open={true}
        onOpenChange={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    expect(editButton).toBeDisabled();
  });

  it('allows Delete button for entries older than 7 days (no restriction per AC1)', () => {
    const entry = createMockEntry({ entry_date: '2025-12-20' });

    render(
      <EntryDetailsSheet
        entry={entry}
        open={true}
        onOpenChange={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).not.toBeDisabled();
  });

  it('shows restriction message for old entries', () => {
    const entry = createMockEntry({ entry_date: '2025-12-20' });

    render(
      <EntryDetailsSheet
        entry={entry}
        open={true}
        onOpenChange={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('Cannot edit entries older than 7 days')).toBeInTheDocument();
  });

  it('shows warning when entry is about to expire', () => {
    // Entry from 6 days ago (2 days remaining)
    const entry = createMockEntry({ entry_date: '2025-12-27' });

    render(
      <EntryDetailsSheet
        entry={entry}
        open={true}
        onOpenChange={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText(/days left to edit/i)).toBeInTheDocument();
  });

  it('returns null when entry is null', () => {
    const { container } = render(
      <EntryDetailsSheet
        entry={null}
        open={true}
        onOpenChange={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
