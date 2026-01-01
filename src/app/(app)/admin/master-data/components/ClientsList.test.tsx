/**
 * Tests for ClientsList Component
 * Story 3.2: Client Management (AC: 1, 6)
 * Story 3.5: Master Data Admin UI Layout (AC: 2, 3, 4, 5, 7)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClientsList } from './ClientsList';

// Mock Supabase client
const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    from: mockFrom,
  })),
}));

// Mock the client component to simplify testing
vi.mock('./ClientsListClient', () => ({
  ClientsListClient: ({ initialClients }: { initialClients: Array<{ id: string; name: string; active: boolean }> }) => (
    <div data-testid="clients-list">
      {initialClients.length === 0 ? (
        <p>No clients yet</p>
      ) : (
        <table>
          <tbody>
            {initialClients.map((client) => (
              <tr key={client.id} data-testid="client-row">
                <td className={!client.active ? 'line-through' : ''}>{client.name}</td>
                <td>{client.active ? 'Active' : 'Inactive'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button>Add Client</button>
    </div>
  ),
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

  it('displays empty state when no clients exist', async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });

    render(await ClientsList());

    expect(screen.getByText(/no clients yet/i)).toBeInTheDocument();
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

    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
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

  it('passes clients to client component', async () => {
    const mockClients = [
      { id: '1', name: 'Client 1', active: true, created_at: '2024-01-01' },
      { id: '2', name: 'Client 2', active: false, created_at: '2024-01-01' },
    ];
    mockOrder.mockResolvedValue({ data: mockClients, error: null });

    render(await ClientsList());

    const rows = screen.getAllByTestId('client-row');
    expect(rows).toHaveLength(2);
  });
});
