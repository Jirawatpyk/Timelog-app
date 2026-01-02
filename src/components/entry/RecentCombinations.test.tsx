import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RecentCombinations } from './RecentCombinations';
import type { RecentCombination } from '@/types/domain';

// Mock the hook
vi.mock('@/hooks/use-entry-data', () => ({
  useRecentCombinations: vi.fn(),
}));

import { useRecentCombinations } from '@/hooks/use-entry-data';

const mockCombinations: RecentCombination[] = [
  {
    id: 'combo-1',
    userId: 'user-1',
    clientId: 'client-1',
    projectId: 'project-1',
    jobId: 'job-1',
    serviceId: 'service-1',
    taskId: 'task-1',
    lastUsedAt: '2024-01-15T10:00:00Z',
    client: { id: 'client-1', name: 'Acme Corp' },
    project: { id: 'project-1', name: 'Website Redesign' },
    job: { id: 'job-1', name: 'Frontend Development', jobNo: 'J001' },
    service: { id: 'service-1', name: 'Development' },
    task: { id: 'task-1', name: 'Coding' },
  },
  {
    id: 'combo-2',
    userId: 'user-1',
    clientId: 'client-2',
    projectId: 'project-2',
    jobId: 'job-2',
    serviceId: 'service-2',
    taskId: null,
    lastUsedAt: '2024-01-14T10:00:00Z',
    client: { id: 'client-2', name: 'Beta Inc' },
    project: { id: 'project-2', name: 'Mobile App' },
    job: { id: 'job-2', name: 'Backend API', jobNo: null },
    service: { id: 'service-2', name: 'Consulting' },
    task: null,
  },
];

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

function renderWithProvider(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}

describe('RecentCombinations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading skeleton while fetching', () => {
    vi.mocked(useRecentCombinations).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof useRecentCombinations>);

    renderWithProvider(<RecentCombinations onSelect={vi.fn()} />);

    expect(screen.getByTestId('recent-combinations-skeleton')).toBeInTheDocument();
  });

  it('shows empty state when no combinations exist', () => {
    vi.mocked(useRecentCombinations).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useRecentCombinations>);

    renderWithProvider(<RecentCombinations onSelect={vi.fn()} />);

    expect(screen.getByTestId('recent-combinations-empty')).toBeInTheDocument();
    expect(screen.getByText('No recent entries')).toBeInTheDocument();
    expect(screen.getByText('Create your first entry to get started')).toBeInTheDocument();
  });

  it('renders combinations correctly', () => {
    vi.mocked(useRecentCombinations).mockReturnValue({
      data: mockCombinations,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useRecentCombinations>);

    renderWithProvider(<RecentCombinations onSelect={vi.fn()} />);

    expect(screen.getByTestId('recent-combinations')).toBeInTheDocument();
    expect(screen.getAllByTestId('combination-card')).toHaveLength(2);

    // First combination with task
    expect(screen.getByText(/Acme Corp/)).toBeInTheDocument();
    expect(screen.getByText(/Website Redesign/)).toBeInTheDocument();
    expect(screen.getByText(/J001 - Frontend Development/)).toBeInTheDocument();
    // Service name with task appears in format "Development • Coding"
    expect(screen.getByText(/Development.*Coding/)).toBeInTheDocument();

    // Second combination without task
    expect(screen.getByText(/Beta Inc/)).toBeInTheDocument();
    expect(screen.getByText(/Mobile App/)).toBeInTheDocument();
    expect(screen.getByText('Backend API')).toBeInTheDocument();
    // Check Consulting is visible (without task)
    const consultingElements = screen.getAllByText(/Consulting/);
    expect(consultingElements.length).toBeGreaterThan(0);
  });

  it('calls onSelect when combination is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    vi.mocked(useRecentCombinations).mockReturnValue({
      data: mockCombinations,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useRecentCombinations>);

    renderWithProvider(<RecentCombinations onSelect={onSelect} />);

    const cards = screen.getAllByTestId('combination-card');
    await user.click(cards[0]);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(mockCombinations[0]);
  });

  it('renders nothing on error (silent fail)', () => {
    vi.mocked(useRecentCombinations).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch'),
    } as ReturnType<typeof useRecentCombinations>);

    const { container } = renderWithProvider(<RecentCombinations onSelect={vi.fn()} />);

    expect(container.firstChild).toBeNull();
  });

  it('displays job without job number correctly', () => {
    vi.mocked(useRecentCombinations).mockReturnValue({
      data: [mockCombinations[1]], // Use the one without job_no
      isLoading: false,
      error: null,
    } as ReturnType<typeof useRecentCombinations>);

    renderWithProvider(<RecentCombinations onSelect={vi.fn()} />);

    // Should not have "J00X - " prefix
    expect(screen.getByText('Backend API')).toBeInTheDocument();
  });

  it('displays task when present', () => {
    vi.mocked(useRecentCombinations).mockReturnValue({
      data: [mockCombinations[0]], // Use the one with task
      isLoading: false,
      error: null,
    } as ReturnType<typeof useRecentCombinations>);

    renderWithProvider(<RecentCombinations onSelect={vi.fn()} />);

    // Should show service with task
    expect(screen.getByText(/Coding/)).toBeInTheDocument();
  });
});
