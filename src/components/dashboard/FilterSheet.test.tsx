/**
 * FilterSheet Tests - Story 5.6
 *
 * Tests for the filter sheet component.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FilterSheet } from './FilterSheet';
import type { ClientOption } from '@/types/dashboard';

// Mock next/navigation
const mockPush = vi.fn();
let mockSearchParamsString = '';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({
    toString: () => mockSearchParamsString,
  }),
}));

const mockClients: ClientOption[] = [
  { id: 'client-1', name: 'Alpha Corp' },
  { id: 'client-2', name: 'Beta Inc' },
  { id: 'client-3', name: 'Gamma Ltd' },
];

describe('FilterSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParamsString = '';
  });

  it('renders sheet with title when open', () => {
    render(
      <FilterSheet
        open={true}
        onClose={() => {}}
        clients={mockClients}
        currentClientId={undefined}
      />
    );

    expect(screen.getByText('Filter Entries')).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    render(
      <FilterSheet
        open={false}
        onClose={() => {}}
        clients={mockClients}
        currentClientId={undefined}
      />
    );

    expect(screen.queryByText('Filter Entries')).not.toBeInTheDocument();
  });

  it('renders client dropdown with placeholder', () => {
    render(
      <FilterSheet
        open={true}
        onClose={() => {}}
        clients={mockClients}
        currentClientId={undefined}
      />
    );

    expect(screen.getByText('Select Client')).toBeInTheDocument();
  });

  it('shows all clients in dropdown', async () => {
    const user = userEvent.setup();
    render(
      <FilterSheet
        open={true}
        onClose={() => {}}
        clients={mockClients}
        currentClientId={undefined}
      />
    );

    // Open dropdown
    await user.click(screen.getByRole('combobox'));

    // Check all clients are visible
    expect(screen.getByRole('option', { name: 'Alpha Corp' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Beta Inc' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Gamma Ltd' })).toBeInTheDocument();
  });

  it('applies filter and navigates on Apply click', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    render(
      <FilterSheet
        open={true}
        onClose={handleClose}
        clients={mockClients}
        currentClientId={undefined}
      />
    );

    // Select a client
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Beta Inc' }));

    // Click Apply
    await user.click(screen.getByRole('button', { name: 'Apply Filter' }));

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('client=client-2'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('clears filter on Clear click', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    // Mock existing filter in URL
    mockSearchParamsString = 'client=client-1';

    render(
      <FilterSheet
        open={true}
        onClose={handleClose}
        clients={mockClients}
        currentClientId="client-1"
      />
    );

    // Click Clear
    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
    expect(handleClose).toHaveBeenCalled();
  });

  it('shows current client as selected', () => {
    render(
      <FilterSheet
        open={true}
        onClose={() => {}}
        clients={mockClients}
        currentClientId="client-2"
      />
    );

    // The combobox should show the selected client name
    expect(screen.getByRole('combobox')).toHaveTextContent('Beta Inc');
  });

  it('renders Apply and Clear buttons', () => {
    render(
      <FilterSheet
        open={true}
        onClose={() => {}}
        clients={mockClients}
        currentClientId={undefined}
      />
    );

    expect(screen.getByRole('button', { name: 'Apply Filter' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
  });

  it('resets selected client when sheet reopens with different currentClientId', async () => {
    const { rerender } = render(
      <FilterSheet
        open={true}
        onClose={() => {}}
        clients={mockClients}
        currentClientId="client-1"
      />
    );

    // Should show Alpha Corp (client-1)
    expect(screen.getByRole('combobox')).toHaveTextContent('Alpha Corp');

    // Close and reopen with different client
    rerender(
      <FilterSheet
        open={false}
        onClose={() => {}}
        clients={mockClients}
        currentClientId="client-2"
      />
    );
    rerender(
      <FilterSheet
        open={true}
        onClose={() => {}}
        clients={mockClients}
        currentClientId="client-2"
      />
    );

    // Should now show Beta Inc (client-2)
    expect(screen.getByRole('combobox')).toHaveTextContent('Beta Inc');
  });
});
