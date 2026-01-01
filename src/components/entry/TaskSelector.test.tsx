import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskSelector } from './TaskSelector';
import * as useEntryData from '@/hooks/use-entry-data';

// Mock the hook
vi.mock('@/hooks/use-entry-data', () => ({
  useTasks: vi.fn(),
}));

const mockTasks = [
  { id: 'task-1', name: 'Development', active: true, created_at: '', updated_at: '' },
  { id: 'task-2', name: 'Meeting', active: true, created_at: '', updated_at: '' },
  { id: 'task-3', name: 'Review', active: true, created_at: '', updated_at: '' },
];

describe('TaskSelector', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading skeleton when fetching', () => {
    vi.mocked(useEntryData.useTasks).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as ReturnType<typeof useEntryData.useTasks>);

    render(<TaskSelector value={null} onChange={mockOnChange} />);

    expect(screen.getByTestId('task-selector-loading')).toBeInTheDocument();
  });

  it('shows error message when fetch fails', () => {
    const mockRefetch = vi.fn();
    vi.mocked(useEntryData.useTasks).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed'),
      refetch: mockRefetch,
    } as unknown as ReturnType<typeof useEntryData.useTasks>);

    render(<TaskSelector value={null} onChange={mockOnChange} />);

    expect(screen.getByTestId('task-selector-error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load tasks')).toBeInTheDocument();
  });

  it('calls refetch when retry button is clicked', async () => {
    const user = userEvent.setup();
    const mockRefetch = vi.fn();
    vi.mocked(useEntryData.useTasks).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed'),
      refetch: mockRefetch,
    } as unknown as ReturnType<typeof useEntryData.useTasks>);

    render(<TaskSelector value={null} onChange={mockOnChange} />);

    const retryButton = screen.getByTestId('task-selector-retry');
    await user.click(retryButton);

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('renders task options when loaded', () => {
    vi.mocked(useEntryData.useTasks).mockReturnValue({
      data: mockTasks,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useEntryData.useTasks>);

    render(<TaskSelector value={null} onChange={mockOnChange} />);

    expect(screen.getByTestId('task-selector')).toBeInTheDocument();
    expect(screen.getByText('Select a task (optional)')).toBeInTheDocument();
  });

  it('shows optional indicator in label', () => {
    vi.mocked(useEntryData.useTasks).mockReturnValue({
      data: mockTasks,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useEntryData.useTasks>);

    render(<TaskSelector value={null} onChange={mockOnChange} />);

    expect(screen.getByText('(Optional)')).toBeInTheDocument();
  });

  it('calls onChange when task is selected', async () => {
    const user = userEvent.setup();

    vi.mocked(useEntryData.useTasks).mockReturnValue({
      data: mockTasks,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useEntryData.useTasks>);

    render(<TaskSelector value={null} onChange={mockOnChange} />);

    // Click to open select
    await user.click(screen.getByRole('combobox'));

    // Click on Development
    await user.click(screen.getByText('Development'));

    expect(mockOnChange).toHaveBeenCalledWith('task-1');
  });

  it('displays selected task value', () => {
    vi.mocked(useEntryData.useTasks).mockReturnValue({
      data: mockTasks,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useEntryData.useTasks>);

    render(<TaskSelector value="task-1" onChange={mockOnChange} />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('shows clear button when value is selected', () => {
    vi.mocked(useEntryData.useTasks).mockReturnValue({
      data: mockTasks,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useEntryData.useTasks>);

    render(<TaskSelector value="task-1" onChange={mockOnChange} />);

    expect(screen.getByTestId('task-selector-clear')).toBeInTheDocument();
  });

  it('does not show clear button when no value selected', () => {
    vi.mocked(useEntryData.useTasks).mockReturnValue({
      data: mockTasks,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useEntryData.useTasks>);

    render(<TaskSelector value={null} onChange={mockOnChange} />);

    expect(screen.queryByTestId('task-selector-clear')).not.toBeInTheDocument();
  });

  it('calls onChange with null when clear button is clicked', async () => {
    const user = userEvent.setup();

    vi.mocked(useEntryData.useTasks).mockReturnValue({
      data: mockTasks,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useEntryData.useTasks>);

    render(<TaskSelector value="task-1" onChange={mockOnChange} />);

    await user.click(screen.getByTestId('task-selector-clear'));

    expect(mockOnChange).toHaveBeenCalledWith(null);
  });

  it('displays validation error when provided', () => {
    vi.mocked(useEntryData.useTasks).mockReturnValue({
      data: mockTasks,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useEntryData.useTasks>);

    render(<TaskSelector value={null} onChange={mockOnChange} error="Invalid task" />);

    expect(screen.getByText('Invalid task')).toBeInTheDocument();
  });

  it('shows "No tasks available" when empty', async () => {
    const user = userEvent.setup();

    vi.mocked(useEntryData.useTasks).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useEntryData.useTasks>);

    render(<TaskSelector value={null} onChange={mockOnChange} />);

    // Open the select dropdown
    const combobox = screen.getByRole('combobox');
    await user.click(combobox);

    expect(screen.getByText('No tasks available')).toBeInTheDocument();
  });

  it('accepts null value for empty selection', () => {
    vi.mocked(useEntryData.useTasks).mockReturnValue({
      data: mockTasks,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useEntryData.useTasks>);

    // Should not throw when value is null
    expect(() => {
      render(<TaskSelector value={null} onChange={mockOnChange} />);
    }).not.toThrow();
  });
});
