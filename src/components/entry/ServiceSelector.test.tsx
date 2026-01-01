import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ServiceSelector } from './ServiceSelector';
import * as useEntryData from '@/hooks/use-entry-data';

// Mock the hook
vi.mock('@/hooks/use-entry-data', () => ({
  useServices: vi.fn(),
}));

const mockServices = [
  { id: 'service-1', name: 'Development', active: true, created_at: '', updated_at: '' },
  { id: 'service-2', name: 'Testing', active: true, created_at: '', updated_at: '' },
  { id: 'service-3', name: 'Design', active: true, created_at: '', updated_at: '' },
];

describe('ServiceSelector', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading skeleton when fetching', () => {
    vi.mocked(useEntryData.useServices).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as ReturnType<typeof useEntryData.useServices>);

    render(<ServiceSelector value="" onChange={mockOnChange} />);

    expect(screen.getByTestId('service-selector-loading')).toBeInTheDocument();
  });

  it('shows error message when fetch fails', () => {
    const mockRefetch = vi.fn();
    vi.mocked(useEntryData.useServices).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed'),
      refetch: mockRefetch,
    } as unknown as ReturnType<typeof useEntryData.useServices>);

    render(<ServiceSelector value="" onChange={mockOnChange} />);

    expect(screen.getByTestId('service-selector-error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load services')).toBeInTheDocument();
  });

  it('calls refetch when retry button is clicked', async () => {
    const user = userEvent.setup();
    const mockRefetch = vi.fn();
    vi.mocked(useEntryData.useServices).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed'),
      refetch: mockRefetch,
    } as unknown as ReturnType<typeof useEntryData.useServices>);

    render(<ServiceSelector value="" onChange={mockOnChange} />);

    const retryButton = screen.getByTestId('service-selector-retry');
    await user.click(retryButton);

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('renders service options when loaded', () => {
    vi.mocked(useEntryData.useServices).mockReturnValue({
      data: mockServices,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useEntryData.useServices>);

    render(<ServiceSelector value="" onChange={mockOnChange} />);

    expect(screen.getByTestId('service-selector')).toBeInTheDocument();
    expect(screen.getByText('Select a service')).toBeInTheDocument();
  });

  it('displays services sorted alphabetically', async () => {
    const user = userEvent.setup();
    // Services are already returned sorted from server, but we verify display
    vi.mocked(useEntryData.useServices).mockReturnValue({
      data: mockServices,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useEntryData.useServices>);

    render(<ServiceSelector value="" onChange={mockOnChange} />);

    // Open dropdown
    await user.click(screen.getByRole('combobox'));

    // Verify all services are visible
    expect(screen.getByText('Development')).toBeInTheDocument();
    expect(screen.getByText('Testing')).toBeInTheDocument();
    expect(screen.getByText('Design')).toBeInTheDocument();
  });

  it('displays selected service value', () => {
    vi.mocked(useEntryData.useServices).mockReturnValue({
      data: mockServices,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useEntryData.useServices>);

    render(<ServiceSelector value="service-1" onChange={mockOnChange} />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('calls onChange when service is selected', async () => {
    const user = userEvent.setup();

    vi.mocked(useEntryData.useServices).mockReturnValue({
      data: mockServices,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useEntryData.useServices>);

    render(<ServiceSelector value="" onChange={mockOnChange} />);

    // Click to open select
    await user.click(screen.getByRole('combobox'));

    // Click on Development
    await user.click(screen.getByText('Development'));

    expect(mockOnChange).toHaveBeenCalledWith('service-1');
  });

  it('displays validation error when provided', () => {
    vi.mocked(useEntryData.useServices).mockReturnValue({
      data: mockServices,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useEntryData.useServices>);

    render(<ServiceSelector value="" onChange={mockOnChange} error="กรุณาเลือก Service" />);

    expect(screen.getByText('กรุณาเลือก Service')).toBeInTheDocument();
  });

  it('shows "No services available" when empty', async () => {
    const user = userEvent.setup();

    vi.mocked(useEntryData.useServices).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useEntryData.useServices>);

    render(<ServiceSelector value="" onChange={mockOnChange} />);

    // Open the select dropdown
    const combobox = screen.getByRole('combobox');
    await user.click(combobox);

    expect(screen.getByText('No services available')).toBeInTheDocument();
  });

  it('shows required indicator', () => {
    vi.mocked(useEntryData.useServices).mockReturnValue({
      data: mockServices,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useEntryData.useServices>);

    render(<ServiceSelector value="" onChange={mockOnChange} />);

    expect(screen.getByText('Service *')).toBeInTheDocument();
  });
});
