import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectSelector } from './ProjectSelector';
import * as useEntryData from '@/hooks/use-entry-data';

// Mock the hook
vi.mock('@/hooks/use-entry-data', () => ({
  useProjects: vi.fn(),
}));

const mockProjects = [
  { id: 'project-1', name: 'Project A', client_id: 'client-1', active: true, created_at: '' },
  { id: 'project-2', name: 'Project B', client_id: 'client-1', active: true, created_at: '' },
];

describe('ProjectSelector', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading skeleton when fetching with clientId', () => {
    vi.mocked(useEntryData.useProjects).mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: true,
      isError: false,
      error: null,
    } as ReturnType<typeof useEntryData.useProjects>);

    render(<ProjectSelector clientId="client-1" value="" onChange={mockOnChange} />);

    expect(screen.getByTestId('project-selector-loading')).toBeInTheDocument();
  });

  it('shows disabled state with placeholder when no client selected', () => {
    vi.mocked(useEntryData.useProjects).mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useEntryData.useProjects>);

    render(<ProjectSelector clientId={null} value="" onChange={mockOnChange} disabled />);

    expect(screen.getByText('Select client first')).toBeInTheDocument();
    // Note: Radix Select with disabled may have aria-disabled instead
    const combobox = screen.getByRole('combobox');
    expect(combobox).toHaveAttribute('data-disabled');
  });

  it('renders project options when loaded', () => {
    vi.mocked(useEntryData.useProjects).mockReturnValue({
      data: mockProjects,
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useEntryData.useProjects>);

    render(<ProjectSelector clientId="client-1" value="" onChange={mockOnChange} />);

    expect(screen.getByTestId('project-selector')).toBeInTheDocument();
    expect(screen.getByText('Select a project')).toBeInTheDocument();
  });

  it('calls onChange when project is selected', async () => {
    const user = userEvent.setup();

    vi.mocked(useEntryData.useProjects).mockReturnValue({
      data: mockProjects,
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useEntryData.useProjects>);

    render(<ProjectSelector clientId="client-1" value="" onChange={mockOnChange} />);

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Project A'));

    expect(mockOnChange).toHaveBeenCalledWith('project-1');
  });

  it('displays validation error when provided', () => {
    vi.mocked(useEntryData.useProjects).mockReturnValue({
      data: mockProjects,
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useEntryData.useProjects>);

    render(
      <ProjectSelector
        clientId="client-1"
        value=""
        onChange={mockOnChange}
        error="Please select a project"
      />
    );

    expect(screen.getByText('Please select a project')).toBeInTheDocument();
  });

  it('shows "No projects available" when empty', async () => {
    const user = userEvent.setup();

    vi.mocked(useEntryData.useProjects).mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useEntryData.useProjects>);

    render(<ProjectSelector clientId="client-1" value="" onChange={mockOnChange} />);

    const combobox = screen.getByRole('combobox');
    await user.click(combobox);

    expect(screen.getByText('No projects available')).toBeInTheDocument();
  });

  it('shows error message when fetch fails', () => {
    const mockRefetch = vi.fn();
    vi.mocked(useEntryData.useProjects).mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      error: new Error('Failed'),
      refetch: mockRefetch,
    } as unknown as ReturnType<typeof useEntryData.useProjects>);

    render(<ProjectSelector clientId="client-1" value="" onChange={mockOnChange} />);

    expect(screen.getByTestId('project-selector-error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load projects')).toBeInTheDocument();
  });

  it('calls refetch when retry button is clicked', async () => {
    const user = userEvent.setup();
    const mockRefetch = vi.fn();
    vi.mocked(useEntryData.useProjects).mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      error: new Error('Failed'),
      refetch: mockRefetch,
    } as unknown as ReturnType<typeof useEntryData.useProjects>);

    render(<ProjectSelector clientId="client-1" value="" onChange={mockOnChange} />);

    const retryButton = screen.getByTestId('project-selector-retry');
    await user.click(retryButton);

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('does not show error when no client is selected', () => {
    vi.mocked(useEntryData.useProjects).mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      error: new Error('Failed'),
    } as unknown as ReturnType<typeof useEntryData.useProjects>);

    render(<ProjectSelector clientId={null} value="" onChange={mockOnChange} disabled />);

    // Should show disabled state, not error state
    expect(screen.queryByTestId('project-selector-error')).not.toBeInTheDocument();
  });
});
