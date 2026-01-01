import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TimeEntryForm } from './TimeEntryForm';
import * as useEntryData from '@/hooks/use-entry-data';

// Mock the hooks
vi.mock('@/hooks/use-entry-data', () => ({
  useClients: vi.fn(),
  useProjects: vi.fn(),
  useJobs: vi.fn(),
}));

const mockClients = [
  { id: 'client-1', name: 'Client A', active: true, created_at: '', updated_at: '' },
  { id: 'client-2', name: 'Client B', active: true, created_at: '', updated_at: '' },
];

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('TimeEntryForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    vi.mocked(useEntryData.useClients).mockReturnValue({
      data: mockClients,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useEntryData.useClients>);

    vi.mocked(useEntryData.useProjects).mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useEntryData.useProjects>);

    vi.mocked(useEntryData.useJobs).mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useEntryData.useJobs>);
  });

  it('renders the form with all selectors', () => {
    render(<TimeEntryForm />, { wrapper: createWrapper() });

    expect(screen.getByTestId('time-entry-form')).toBeInTheDocument();
    expect(screen.getByTestId('client-selector')).toBeInTheDocument();
    expect(screen.getByTestId('project-selector')).toBeInTheDocument();
    expect(screen.getByTestId('job-selector')).toBeInTheDocument();
  });

  it('initially shows placeholder text for disabled selectors (AC1)', () => {
    render(<TimeEntryForm />, { wrapper: createWrapper() });

    // Project selector should show "Select client first"
    expect(screen.getByText('Select client first')).toBeInTheDocument();

    // Job selector should show "Select project first"
    expect(screen.getByText('Select project first')).toBeInTheDocument();
  });

  it('initially disables project and job selectors (AC1)', () => {
    render(<TimeEntryForm />, { wrapper: createWrapper() });

    // Check that project and job selectors are disabled (have data-disabled attribute)
    const projectSelector = screen.getByTestId('project-selector');
    const jobSelector = screen.getByTestId('job-selector');

    expect(projectSelector).toHaveAttribute('data-disabled');
    expect(jobSelector).toHaveAttribute('data-disabled');
  });

  it('client selector is enabled on initial render', () => {
    render(<TimeEntryForm />, { wrapper: createWrapper() });

    const clientSelector = screen.getByTestId('client-selector');
    expect(clientSelector).not.toHaveAttribute('data-disabled');
  });

  it('calls useProjects with null initially', () => {
    render(<TimeEntryForm />, { wrapper: createWrapper() });

    // Verify useProjects was called with null (no client selected)
    expect(useEntryData.useProjects).toHaveBeenCalledWith(null);
  });

  it('calls useJobs with null initially', () => {
    render(<TimeEntryForm />, { wrapper: createWrapper() });

    // Verify useJobs was called with null (no project selected)
    expect(useEntryData.useJobs).toHaveBeenCalledWith(null);
  });

  it('renders placeholder sections for future stories', () => {
    render(<TimeEntryForm />, { wrapper: createWrapper() });

    // Check that placeholder text exists for Story 4.3 and 4.4
    expect(screen.getByText(/Story 4.3/)).toBeInTheDocument();
    expect(screen.getByText(/Story 4.4/)).toBeInTheDocument();
  });
});
