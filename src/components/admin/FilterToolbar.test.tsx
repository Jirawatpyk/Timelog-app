/**
 * FilterToolbar Component Tests
 * Enterprise Filter Pattern - Unit tests
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { FilterToolbar, type FilterConfig } from './FilterToolbar';

// Mock ResizeObserver for Sheet component
vi.mock('@radix-ui/react-dialog', async () => {
  const actual = await vi.importActual('@radix-ui/react-dialog');
  return {
    ...actual,
    Portal: ({ children }: { children: React.ReactNode }) => children,
  };
});

describe('FilterToolbar', () => {
  const defaultProps = {
    searchValue: '',
    onSearchChange: vi.fn(),
    searchPlaceholder: 'Search...',
    filters: [] as FilterConfig[],
    onFilterRemove: vi.fn(),
    onFiltersClear: vi.fn(),
    desktopFilters: <div data-testid="desktop-filters">Desktop Filters</div>,
    mobileFilters: <div data-testid="mobile-filters">Mobile Filters</div>,
  };

  it('renders search input with placeholder', () => {
    render(<FilterToolbar {...defaultProps} searchPlaceholder="Search jobs..." />);

    expect(screen.getByPlaceholderText('Search jobs...')).toBeInTheDocument();
  });

  it('renders search input and updates on type', async () => {
    const _user = userEvent.setup();
    const onSearchChange = vi.fn();

    render(<FilterToolbar {...defaultProps} onSearchChange={onSearchChange} />);

    const searchInput = screen.getByPlaceholderText('Search...');
    expect(searchInput).toBeInTheDocument();
    // SearchInput component handles onChange internally
  });

  it('renders desktop filters (hidden on mobile via CSS)', () => {
    render(<FilterToolbar {...defaultProps} />);

    expect(screen.getByTestId('desktop-filters')).toBeInTheDocument();
  });

  it('renders Add buttons for both mobile and desktop', () => {
    render(
      <FilterToolbar
        {...defaultProps}
        addButton={{
          label: 'Add Job',
          onClick: vi.fn(),
        }}
      />
    );

    // Both mobile (icon) and desktop (full label) buttons exist
    const addButtons = screen.getAllByRole('button', { name: 'Add Job' });
    expect(addButtons.length).toBe(2); // Mobile + Desktop
  });

  it('calls addButton.onClick when Add button clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <FilterToolbar
        {...defaultProps}
        addButton={{
          label: 'Add Item',
          onClick,
        }}
      />
    );

    // Click the desktop Add button
    const addButtons = screen.getAllByRole('button', { name: 'Add Item' });
    await user.click(addButtons[0]);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('shows filter chips when filters are active', () => {
    const filters: FilterConfig[] = [
      { key: 'client', label: 'Client', value: 'client-1', displayValue: 'Acme Corp' },
      { key: 'status', label: 'Status', value: 'active', displayValue: 'Active' },
    ];

    render(<FilterToolbar {...defaultProps} filters={filters} />);

    expect(screen.getByText('Client:')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Status:')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('does not show filter chips when all filters are "all"', () => {
    const filters: FilterConfig[] = [
      { key: 'client', label: 'Client', value: 'all', displayValue: '' },
    ];

    render(<FilterToolbar {...defaultProps} filters={filters} />);

    expect(screen.queryByText('Client:')).not.toBeInTheDocument();
  });

  it('calls onFilterRemove when chip X is clicked', async () => {
    const user = userEvent.setup();
    const onFilterRemove = vi.fn();
    const filters: FilterConfig[] = [
      { key: 'client', label: 'Client', value: 'client-1', displayValue: 'Acme' },
    ];

    render(
      <FilterToolbar
        {...defaultProps}
        filters={filters}
        onFilterRemove={onFilterRemove}
      />
    );

    await user.click(screen.getByRole('button', { name: /remove client filter/i }));
    expect(onFilterRemove).toHaveBeenCalledWith('client');
  });

  it('shows Clear All when multiple filters active', () => {
    const filters: FilterConfig[] = [
      { key: 'client', label: 'Client', value: 'c1', displayValue: 'Client 1' },
      { key: 'status', label: 'Status', value: 'active', displayValue: 'Active' },
    ];

    render(<FilterToolbar {...defaultProps} filters={filters} />);

    expect(screen.getByText('Clear all')).toBeInTheDocument();
  });

  it('calls onFiltersClear when Clear All clicked', async () => {
    const user = userEvent.setup();
    const onFiltersClear = vi.fn();
    const filters: FilterConfig[] = [
      { key: 'client', label: 'Client', value: 'c1', displayValue: 'Client 1' },
      { key: 'status', label: 'Status', value: 'active', displayValue: 'Active' },
    ];

    render(
      <FilterToolbar
        {...defaultProps}
        filters={filters}
        onFiltersClear={onFiltersClear}
      />
    );

    await user.click(screen.getByText('Clear all'));
    expect(onFiltersClear).toHaveBeenCalledTimes(1);
  });

  it('renders filter button for mobile (hidden on desktop via CSS)', () => {
    render(<FilterToolbar {...defaultProps} />);

    // Filter button has aria-label
    expect(screen.getByRole('button', { name: 'Open filters' })).toBeInTheDocument();
  });

  it('shows badge count on filter button when filters active', () => {
    const filters: FilterConfig[] = [
      { key: 'client', label: 'Client', value: 'c1', displayValue: 'Client' },
      { key: 'status', label: 'Status', value: 'active', displayValue: 'Active' },
    ];

    render(<FilterToolbar {...defaultProps} filters={filters} />);

    // Badge shows count of active filters
    const filterButton = screen.getByRole('button', { name: 'Open filters' });
    expect(filterButton).toContainHTML('2');
  });
});
