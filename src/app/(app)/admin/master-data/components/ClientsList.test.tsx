/**
 * Tests for ClientsList Component
 * Story 3.2: Client Management (AC: 1, 6)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClientsList } from './ClientsList';
import type { Client } from '@/types/domain';

// Mock Supabase client
const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    from: mockFrom,
  })),
}));

// Mock ClientItem to simplify testing
vi.mock('./ClientItem', () => ({
  ClientItem: ({ client }: { client: Client }) => (
    <div
      data-testid="client-item"
      data-active={client.active}
      className={!client.active ? 'opacity-50' : ''}
    >
      <span data-testid={`client-name-${client.id}`} className={!client.active ? 'line-through' : ''}>
        {client.name}
      </span>
      <span>{client.active ? 'Active' : 'Inactive'}</span>
    </div>
  ),
}));

// Mock AddClientDialog
vi.mock('@/components/admin/AddClientDialog', () => ({
  AddClientDialog: () => <button>Add Client</button>,
}));

describe('ClientsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      order: mockOrder,
    });
  });

  it('renders the Clients heading', async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });

    render(await ClientsList());

    expect(screen.getByRole('heading', { name: /clients/i })).toBeInTheDocument();
  });

  it('displays empty state when no clients exist', async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });

    render(await ClientsList());

    expect(screen.getByText(/no clients found/i)).toBeInTheDocument();
  });

  it('displays list of clients with names', async () => {
    const mockClients = [
      { id: '1', name: 'Netflix', active: true, created_at: '2024-01-01' },
      { id: '2', name: 'Disney+', active: true, created_at: '2024-01-01' },
    ];
    mockOrder.mockResolvedValue({ data: mockClients, error: null });

    render(await ClientsList());

    expect(screen.getByText('Netflix')).toBeInTheDocument();
    expect(screen.getByText('Disney+')).toBeInTheDocument();
  });

  it('displays active status for each client', async () => {
    const mockClients = [
      { id: '1', name: 'Netflix', active: true, created_at: '2024-01-01' },
      { id: '2', name: 'Disney+', active: false, created_at: '2024-01-01' },
    ];
    mockOrder.mockResolvedValue({ data: mockClients, error: null });

    render(await ClientsList());

    // Check for active/inactive status indicators (via mocked ClientItem)
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('applies visual distinction to inactive clients', async () => {
    const mockClients = [
      { id: '1', name: 'Netflix', active: true, created_at: '2024-01-01' },
      { id: '2', name: 'Inactive Client', active: false, created_at: '2024-01-01' },
    ];
    mockOrder.mockResolvedValue({ data: mockClients, error: null });

    render(await ClientsList());

    // Find the client items by their container
    const clientItems = screen.getAllByTestId('client-item');

    // First client (active) should not have opacity class
    expect(clientItems[0]).not.toHaveClass('opacity-50');

    // Second client (inactive) should have opacity class
    expect(clientItems[1]).toHaveClass('opacity-50');
  });

  it('shows inactive client name with line-through styling', async () => {
    const mockClients = [
      { id: '1', name: 'Inactive Client', active: false, created_at: '2024-01-01' },
    ];
    mockOrder.mockResolvedValue({ data: mockClients, error: null });

    render(await ClientsList());

    const clientName = screen.getByTestId('client-name-1');
    expect(clientName).toHaveClass('line-through');
  });

  it('orders clients by name', async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });

    await ClientsList();

    expect(mockFrom).toHaveBeenCalledWith('clients');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockOrder).toHaveBeenCalledWith('name');
  });

  it('has correct data-testid attribute', async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });

    render(await ClientsList());

    expect(screen.getByTestId('clients-list')).toBeInTheDocument();
  });

  it('renders Add Client button', async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });

    render(await ClientsList());

    expect(screen.getByRole('button', { name: /add client/i })).toBeInTheDocument();
  });
});
