/**
 * FilterChip Component Tests
 * Enterprise Filter Pattern - Unit tests
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { FilterChip, FilterChips } from './FilterChip';

describe('FilterChip', () => {
  it('renders label and value', () => {
    render(
      <FilterChip
        label="Client"
        value="Acme Corp"
        onRemove={() => {}}
      />
    );

    expect(screen.getByText('Client:')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  it('truncates long values with title attribute', () => {
    const longValue = 'บริษัท ไทยเอ็นเตอร์เทนเมนต์ จำกัด';
    render(
      <FilterChip
        label="Client"
        value={longValue}
        onRemove={() => {}}
      />
    );

    const valueElement = screen.getByText(longValue);
    expect(valueElement).toHaveAttribute('title', longValue);
    expect(valueElement).toHaveClass('truncate');
  });

  it('calls onRemove when X button is clicked', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    render(
      <FilterChip
        label="Status"
        value="Active"
        onRemove={onRemove}
      />
    );

    await user.click(screen.getByRole('button', { name: /remove status filter/i }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    render(
      <FilterChip
        label="Test"
        value="Value"
        onRemove={() => {}}
        className="custom-class"
      />
    );

    const chip = screen.getByText('Test:').closest('div');
    expect(chip).toHaveClass('custom-class');
  });
});

describe('FilterChips', () => {
  const mockFilters = [
    { key: 'client', label: 'Client', value: 'client-1', displayValue: 'Acme Corp' },
    { key: 'status', label: 'Status', value: 'active', displayValue: 'Active' },
    { key: 'project', label: 'Project', value: 'all', displayValue: '' }, // Should be hidden
  ];

  it('renders only active filters (non-all values)', () => {
    render(
      <FilterChips
        filters={mockFilters}
        onRemove={() => {}}
      />
    );

    expect(screen.getByText('Client:')).toBeInTheDocument();
    expect(screen.getByText('Status:')).toBeInTheDocument();
    expect(screen.queryByText('Project:')).not.toBeInTheDocument();
  });

  it('returns null when no active filters', () => {
    const { container } = render(
      <FilterChips
        filters={[
          { key: 'client', label: 'Client', value: 'all', displayValue: '' },
        ]}
        onRemove={() => {}}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('calls onRemove with correct key', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    render(
      <FilterChips
        filters={mockFilters}
        onRemove={onRemove}
      />
    );

    await user.click(screen.getByRole('button', { name: /remove client filter/i }));
    expect(onRemove).toHaveBeenCalledWith('client');
  });

  it('shows Clear All button when multiple active filters and onClearAll provided', () => {
    render(
      <FilterChips
        filters={mockFilters}
        onRemove={() => {}}
        onClearAll={() => {}}
      />
    );

    expect(screen.getByText('Clear all')).toBeInTheDocument();
  });

  it('hides Clear All when only one active filter', () => {
    render(
      <FilterChips
        filters={[mockFilters[0]]}
        onRemove={() => {}}
        onClearAll={() => {}}
      />
    );

    expect(screen.queryByText('Clear all')).not.toBeInTheDocument();
  });

  it('calls onClearAll when Clear All clicked', async () => {
    const user = userEvent.setup();
    const onClearAll = vi.fn();

    render(
      <FilterChips
        filters={mockFilters}
        onRemove={() => {}}
        onClearAll={onClearAll}
      />
    );

    await user.click(screen.getByText('Clear all'));
    expect(onClearAll).toHaveBeenCalledTimes(1);
  });
});
