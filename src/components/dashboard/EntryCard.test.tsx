/**
 * Entry Card Tests - Story 5.2
 *
 * Tests for EntryCard component
 * AC2: Entry card shows client, job, service, task, duration, date
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EntryCard } from './EntryCard';
import type { TimeEntryWithDetails } from '@/types/domain';

const mockEntry: TimeEntryWithDetails = {
  id: 'entry-1',
  user_id: 'user-1',
  job_id: 'job-1',
  service_id: 'service-1',
  task_id: 'task-1',
  duration_minutes: 90, // 1.5 hours
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

describe('EntryCard', () => {
  it('renders client name prominently', () => {
    render(<EntryCard entry={mockEntry} onTap={vi.fn()} />);

    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  it('renders job with job_no and name', () => {
    render(<EntryCard entry={mockEntry} onTap={vi.fn()} />);

    expect(screen.getByText('JOB-001 - Website Redesign')).toBeInTheDocument();
  });

  it('renders job name only when job_no is null', () => {
    const entryNoJobNo = {
      ...mockEntry,
      job: {
        ...mockEntry.job,
        job_no: null,
      },
    };
    render(<EntryCard entry={entryNoJobNo} onTap={vi.fn()} />);

    expect(screen.getByText('Website Redesign')).toBeInTheDocument();
  });

  it('renders service and task', () => {
    render(<EntryCard entry={mockEntry} onTap={vi.fn()} />);

    expect(screen.getByText(/Development.*Frontend/)).toBeInTheDocument();
  });

  it('renders service only when task is null', () => {
    const entryNoTask = {
      ...mockEntry,
      task_id: null,
      task: null,
    };
    render(<EntryCard entry={entryNoTask} onTap={vi.fn()} />);

    expect(screen.getByText('Development')).toBeInTheDocument();
    expect(screen.queryByText(/Frontend/)).not.toBeInTheDocument();
  });

  it('renders duration in Thai format', () => {
    render(<EntryCard entry={mockEntry} onTap={vi.fn()} />);

    // 90 minutes = 1.5 hours = "1.5 ชม."
    expect(screen.getByText('1.5 ชม.')).toBeInTheDocument();
  });

  it('renders entry date', () => {
    render(<EntryCard entry={mockEntry} onTap={vi.fn()} />);

    // Jan 2, 2026
    expect(screen.getByText('Jan 2, 2026')).toBeInTheDocument();
  });

  it('calls onTap when clicked', async () => {
    const user = userEvent.setup();
    const handleTap = vi.fn();
    render(<EntryCard entry={mockEntry} onTap={handleTap} />);

    await user.click(screen.getByTestId('entry-card'));

    expect(handleTap).toHaveBeenCalledWith(mockEntry);
  });

  it('has proper touch target size (min-h-[72px])', () => {
    render(<EntryCard entry={mockEntry} onTap={vi.fn()} />);

    const card = screen.getByTestId('entry-card');
    expect(card).toHaveClass('min-h-[72px]');
  });

  it('has focus-visible styles for keyboard navigation', () => {
    render(<EntryCard entry={mockEntry} onTap={vi.fn()} />);

    const card = screen.getByTestId('entry-card');
    expect(card).toHaveClass('focus-visible:ring-2');
  });
});
