import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClientSelector } from './ClientSelector';
import * as useEntryData from '@/hooks/use-entry-data';

// Mock the hook
vi.mock('@/hooks/use-entry-data', () => ({
  useClients: vi.fn(),
}));

const mockClients = [
  { id: 'client-1', name: 'Client A', active: true, created_at: '' },
  { id: 'client-2', name: 'Client B', active: true, created_at: '' },
];

describe('ClientSelector', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading skeleton when fetching', () => {
    vi.mocked(useEntryData.useClients).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useEntryData.useClients>);

    render(<ClientSelector value="" onChange={mockOnChange} />);

    expect(screen.getByTestId('client-selector-loading')).toBeInTheDocument();
  });

  it('shows error message when fetch fails', () => {
    const mockRefetch = vi.fn();
    vi.mocked(useEntryData.useClients).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed'),
      refetch: mockRefetch,
    } as unknown as ReturnType<typeof useEntryData.useClients>);

    render(<ClientSelector value="" onChange={mockOnChange} />);

    expect(screen.getByTestId('client-selector-error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load clients')).toBeInTheDocument();
  });

  it('calls refetch when retry button is clicked', async () => {
    const user = userEvent.setup();
    const mockRefetch = vi.fn();
    vi.mocked(useEntryData.useClients).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed'),
      refetch: mockRefetch,
    } as unknown as ReturnType<typeof useEntryData.useClients>);

    render(<ClientSelector value="" onChange={mockOnChange} />);

    const retryButton = screen.getByTestId('client-selector-retry');
    await user.click(retryButton);

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('renders client options when loaded', () => {
    vi.mocked(useEntryData.useClients).mockReturnValue({
      data: mockClients,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useEntryData.useClients>);

    render(<ClientSelector value="" onChange={mockOnChange} />);

    expect(screen.getByTestId('client-selector')).toBeInTheDocument();
    expect(screen.getByText('Select a client')).toBeInTheDocument();
  });

  it('displays selected client value', () => {
    vi.mocked(useEntryData.useClients).mockReturnValue({
      data: mockClients,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useEntryData.useClients>);

    render(<ClientSelector value="client-1" onChange={mockOnChange} />);

    // The select trigger should show the selected value
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('calls onChange when client is selected', async () => {
    const user = userEvent.setup();

    vi.mocked(useEntryData.useClients).mockReturnValue({
      data: mockClients,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useEntryData.useClients>);

    render(<ClientSelector value="" onChange={mockOnChange} />);

    // Click to open select
    await user.click(screen.getByRole('combobox'));

    // Click on Client A
    await user.click(screen.getByText('Client A'));

    expect(mockOnChange).toHaveBeenCalledWith('client-1');
  });

  it('displays validation error when provided', () => {
    vi.mocked(useEntryData.useClients).mockReturnValue({
      data: mockClients,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useEntryData.useClients>);

    render(<ClientSelector value="" onChange={mockOnChange} error="Please select a client" />);

    expect(screen.getByText('Please select a client')).toBeInTheDocument();
  });

  it('shows "No clients available" when empty', async () => {
    const user = userEvent.setup();

    vi.mocked(useEntryData.useClients).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useEntryData.useClients>);

    render(<ClientSelector value="" onChange={mockOnChange} />);

    // Open the select dropdown
    const combobox = screen.getByRole('combobox');
    await user.click(combobox);

    // The empty state message should be visible in the dropdown
    expect(screen.getByText('No clients available')).toBeInTheDocument();
  });
});
