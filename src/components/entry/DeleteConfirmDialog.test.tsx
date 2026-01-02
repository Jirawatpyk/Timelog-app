import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import type { TimeEntryWithDetails } from '@/types/domain';

// Mock entry data
const mockEntry: TimeEntryWithDetails = {
  id: 'entry-1',
  user_id: 'user-1',
  job_id: 'job-1',
  service_id: 'service-1',
  task_id: null,
  duration_minutes: 120,
  entry_date: '2026-01-02',
  notes: null,
  department_id: 'dept-1',
  created_at: '2026-01-02T10:00:00Z',
  updated_at: '2026-01-02T10:00:00Z',
  job: {
    id: 'job-1',
    name: 'Website Redesign',
    job_no: 'J001',
    project: {
      id: 'project-1',
      name: 'Main Project',
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
  task: null,
};

describe('DeleteConfirmDialog', () => {
  it('renders nothing when entry is null', () => {
    const { container } = render(
      <DeleteConfirmDialog
        entry={null}
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        isDeleting={false}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('displays dialog title when open', () => {
    render(
      <DeleteConfirmDialog
        entry={mockEntry}
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        isDeleting={false}
      />
    );

    expect(screen.getByText('Delete this entry?')).toBeInTheDocument();
  });

  it('displays entry summary with date, client, and duration', () => {
    render(
      <DeleteConfirmDialog
        entry={mockEntry}
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        isDeleting={false}
      />
    );

    // Check for client name
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    // Check for duration (120 minutes = 2 ชม.)
    expect(screen.getByText('2 ชม.')).toBeInTheDocument();
    // Check for labels
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Duration')).toBeInTheDocument();
  });

  it('displays Cancel and Delete buttons', () => {
    render(
      <DeleteConfirmDialog
        entry={mockEntry}
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        isDeleting={false}
      />
    );

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('calls onConfirm when Delete button is clicked', () => {
    const onConfirm = vi.fn();
    render(
      <DeleteConfirmDialog
        entry={mockEntry}
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
        isDeleting={false}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when isDeleting is true', () => {
    render(
      <DeleteConfirmDialog
        entry={mockEntry}
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        isDeleting={true}
      />
    );

    expect(screen.getByText('Deleting...')).toBeInTheDocument();
  });

  it('disables buttons when isDeleting is true', () => {
    render(
      <DeleteConfirmDialog
        entry={mockEntry}
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        isDeleting={true}
      />
    );

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Deleting...' })).toBeDisabled();
  });
});
