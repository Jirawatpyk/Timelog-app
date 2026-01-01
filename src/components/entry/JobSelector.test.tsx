import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JobSelector } from './JobSelector';
import * as useEntryData from '@/hooks/use-entry-data';

// Mock the hook
vi.mock('@/hooks/use-entry-data', () => ({
  useJobs: vi.fn(),
}));

const mockJobs = [
  { id: 'job-1', name: 'Job A', job_no: 'J001', project_id: 'project-1', active: true, created_at: '', updated_at: '' },
  { id: 'job-2', name: 'Job B', job_no: null, project_id: 'project-1', active: true, created_at: '', updated_at: '' },
];

describe('JobSelector', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading skeleton when fetching with projectId', () => {
    vi.mocked(useEntryData.useJobs).mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: true,
      isError: false,
      error: null,
    } as ReturnType<typeof useEntryData.useJobs>);

    render(<JobSelector projectId="project-1" value="" onChange={mockOnChange} />);

    expect(screen.getByTestId('job-selector-loading')).toBeInTheDocument();
  });

  it('shows disabled state with placeholder when no project selected', () => {
    vi.mocked(useEntryData.useJobs).mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useEntryData.useJobs>);

    render(<JobSelector projectId={null} value="" onChange={mockOnChange} disabled />);

    expect(screen.getByText('Select project first')).toBeInTheDocument();
    // Note: Radix Select with disabled may have data-disabled instead
    const combobox = screen.getByRole('combobox');
    expect(combobox).toHaveAttribute('data-disabled');
  });

  it('renders job options when loaded', () => {
    vi.mocked(useEntryData.useJobs).mockReturnValue({
      data: mockJobs,
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useEntryData.useJobs>);

    render(<JobSelector projectId="project-1" value="" onChange={mockOnChange} />);

    expect(screen.getByTestId('job-selector')).toBeInTheDocument();
    expect(screen.getByText('Select a job')).toBeInTheDocument();
  });

  it('formats job display with job_no when available (AC3)', async () => {
    const user = userEvent.setup();

    vi.mocked(useEntryData.useJobs).mockReturnValue({
      data: mockJobs,
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useEntryData.useJobs>);

    render(<JobSelector projectId="project-1" value="" onChange={mockOnChange} />);

    await user.click(screen.getByRole('combobox'));

    // Job with job_no should display as "J001 - Job A"
    expect(screen.getByText('J001 - Job A')).toBeInTheDocument();
    // Job without job_no should display as just "Job B"
    expect(screen.getByText('Job B')).toBeInTheDocument();
  });

  it('calls onChange when job is selected', async () => {
    const user = userEvent.setup();

    vi.mocked(useEntryData.useJobs).mockReturnValue({
      data: mockJobs,
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useEntryData.useJobs>);

    render(<JobSelector projectId="project-1" value="" onChange={mockOnChange} />);

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('J001 - Job A'));

    expect(mockOnChange).toHaveBeenCalledWith('job-1');
  });

  it('displays validation error when provided', () => {
    vi.mocked(useEntryData.useJobs).mockReturnValue({
      data: mockJobs,
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useEntryData.useJobs>);

    render(
      <JobSelector
        projectId="project-1"
        value=""
        onChange={mockOnChange}
        error="Please select a job"
      />
    );

    expect(screen.getByText('Please select a job')).toBeInTheDocument();
  });

  it('shows "No jobs available" when empty (AC6)', async () => {
    const user = userEvent.setup();

    vi.mocked(useEntryData.useJobs).mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useEntryData.useJobs>);

    render(<JobSelector projectId="project-1" value="" onChange={mockOnChange} />);

    const combobox = screen.getByRole('combobox');
    await user.click(combobox);

    expect(screen.getByText('No jobs available')).toBeInTheDocument();
  });

  it('shows error message when fetch fails', () => {
    const mockRefetch = vi.fn();
    vi.mocked(useEntryData.useJobs).mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      error: new Error('Failed'),
      refetch: mockRefetch,
    } as unknown as ReturnType<typeof useEntryData.useJobs>);

    render(<JobSelector projectId="project-1" value="" onChange={mockOnChange} />);

    expect(screen.getByTestId('job-selector-error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load jobs')).toBeInTheDocument();
  });

  it('calls refetch when retry button is clicked', async () => {
    const user = userEvent.setup();
    const mockRefetch = vi.fn();
    vi.mocked(useEntryData.useJobs).mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      error: new Error('Failed'),
      refetch: mockRefetch,
    } as unknown as ReturnType<typeof useEntryData.useJobs>);

    render(<JobSelector projectId="project-1" value="" onChange={mockOnChange} />);

    const retryButton = screen.getByTestId('job-selector-retry');
    await user.click(retryButton);

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('does not show error when no project is selected', () => {
    vi.mocked(useEntryData.useJobs).mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      error: new Error('Failed'),
    } as unknown as ReturnType<typeof useEntryData.useJobs>);

    render(<JobSelector projectId={null} value="" onChange={mockOnChange} disabled />);

    // Should show disabled state, not error state
    expect(screen.queryByTestId('job-selector-error')).not.toBeInTheDocument();
  });
});
