import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TimeEntryForm } from './TimeEntryForm';
import * as useEntryData from '@/hooks/use-entry-data';
import { useOnlineStatus } from '@/hooks/use-online-status';

// Mock the hooks
vi.mock('@/hooks/use-entry-data', () => ({
  useClients: vi.fn(),
  useProjects: vi.fn(),
  useJobs: vi.fn(),
  useServices: vi.fn(),
  useTasks: vi.fn(),
  useRecentCombinations: vi.fn(),
}));

// Mock online status hook - Story 8.3
vi.mock('@/hooks/use-online-status', () => ({
  useOnlineStatus: vi.fn(() => true),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
  },
}));

const mockUseOnlineStatus = vi.mocked(useOnlineStatus);

const mockClients = [
  { id: 'client-1', name: 'Client A', active: true, created_at: '' },
  { id: 'client-2', name: 'Client B', active: true, created_at: '' },
];

const mockServices = [
  { id: 'service-1', name: 'Development', active: true, created_at: '' },
  { id: 'service-2', name: 'Testing', active: true, created_at: '' },
];

const mockTasks = [
  { id: 'task-1', name: 'Coding', active: true, created_at: '' },
  { id: 'task-2', name: 'Review', active: true, created_at: '' },
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
    // Default to online - Story 8.3
    mockUseOnlineStatus.mockReturnValue(true);

    // Default mock implementations - use 'as unknown as' to bypass strict UseQueryResult typing
    vi.mocked(useEntryData.useClients).mockReturnValue({
      data: mockClients,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useEntryData.useClients>);

    vi.mocked(useEntryData.useProjects).mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useEntryData.useProjects>);

    vi.mocked(useEntryData.useJobs).mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useEntryData.useJobs>);

    // Story 4.3: Service and Task hooks
    vi.mocked(useEntryData.useServices).mockReturnValue({
      data: mockServices,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useEntryData.useServices>);

    vi.mocked(useEntryData.useTasks).mockReturnValue({
      data: mockTasks,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useEntryData.useTasks>);

    // Story 4.7: Recent combinations hook
    vi.mocked(useEntryData.useRecentCombinations).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useEntryData.useRecentCombinations>);
  });

  it('renders the form with all selectors', () => {
    render(<TimeEntryForm />, { wrapper: createWrapper() });

    expect(screen.getByTestId('time-entry-form')).toBeInTheDocument();
    expect(screen.getByTestId('client-selector')).toBeInTheDocument();
    expect(screen.getByTestId('project-selector')).toBeInTheDocument();
    expect(screen.getByTestId('job-selector')).toBeInTheDocument();
    // Story 4.3 components
    expect(screen.getByTestId('service-selector')).toBeInTheDocument();
    expect(screen.getByTestId('task-selector')).toBeInTheDocument();
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

  it('renders date picker from Story 4.4', () => {
    render(<TimeEntryForm />, { wrapper: createWrapper() });

    // Story 4.4: DatePicker is now implemented
    expect(screen.getByText('Date *')).toBeInTheDocument();
  });

  it('renders submit button from Story 4.4', () => {
    render(<TimeEntryForm />, { wrapper: createWrapper() });

    // Story 4.4: Submit button is now implemented
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  // Story 4.3 tests
  it('renders duration input with preset buttons', () => {
    render(<TimeEntryForm />, { wrapper: createWrapper() });

    // Check duration preset buttons exist
    expect(screen.getByRole('button', { name: '0.5h' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1h' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2h' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4h' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '8h' })).toBeInTheDocument();
  });

  it('renders service selector as required field', () => {
    render(<TimeEntryForm />, { wrapper: createWrapper() });

    expect(screen.getByText('Service *')).toBeInTheDocument();
  });

  it('renders task selector as optional field', () => {
    render(<TimeEntryForm />, { wrapper: createWrapper() });

    expect(screen.getByText('(Optional)')).toBeInTheDocument();
  });

  it('renders duration field as required', () => {
    render(<TimeEntryForm />, { wrapper: createWrapper() });

    expect(screen.getByText('Duration (hours) *')).toBeInTheDocument();
  });

  // Story 8.3: Offline submission tests
  describe('offline submission handling (Story 8.3)', () => {
    it('calls useOnlineStatus hook', () => {
      mockUseOnlineStatus.mockReturnValue(true);
      render(<TimeEntryForm />, { wrapper: createWrapper() });

      // Hook should be called during render
      expect(mockUseOnlineStatus).toHaveBeenCalled();
    });

    it('preserves form when offline', () => {
      mockUseOnlineStatus.mockReturnValue(false);
      render(<TimeEntryForm />, { wrapper: createWrapper() });

      // Form should still be visible and editable even when offline
      expect(screen.getByTestId('time-entry-form')).toBeInTheDocument();
      expect(screen.getByTestId('client-selector')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });
  });
});
