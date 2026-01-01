/**
 * Tests for ServicesList Component
 * Story 3.1: Service Type Management (AC: 1, 6)
 * Story 3.5: Master Data Admin UI Layout (AC: 2, 3, 4, 5, 7)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ServicesList } from './ServicesList';

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
vi.mock('./ServicesListClient', () => ({
  ServicesListClient: ({ initialServices }: { initialServices: Array<{ id: string; name: string; active: boolean }> }) => (
    <div data-testid="services-list">
      {initialServices.length === 0 ? (
        <p>No services yet</p>
      ) : (
        <table>
          <tbody>
            {initialServices.map((service) => (
              <tr key={service.id} data-testid="service-row">
                <td className={!service.active ? 'line-through' : ''}>{service.name}</td>
                <td>{service.active ? 'Active' : 'Inactive'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button>Add Service</button>
    </div>
  ),
}));

describe('ServicesList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      order: mockOrder,
    });
  });

  it('displays empty state when no services exist', async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });

    render(await ServicesList());

    expect(screen.getByText(/no services yet/i)).toBeInTheDocument();
  });

  it('displays list of services with names', async () => {
    const mockServices = [
      { id: '1', name: 'Dubbing', active: true, created_at: '2024-01-01' },
      { id: '2', name: 'Subtitling', active: true, created_at: '2024-01-01' },
    ];
    mockOrder.mockResolvedValue({ data: mockServices, error: null });

    render(await ServicesList());

    expect(screen.getByText('Dubbing')).toBeInTheDocument();
    expect(screen.getByText('Subtitling')).toBeInTheDocument();
  });

  it('displays active status for each service', async () => {
    const mockServices = [
      { id: '1', name: 'Dubbing', active: true, created_at: '2024-01-01' },
      { id: '2', name: 'Subtitling', active: false, created_at: '2024-01-01' },
    ];
    mockOrder.mockResolvedValue({ data: mockServices, error: null });

    render(await ServicesList());

    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('orders services by name', async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });

    await ServicesList();

    expect(mockFrom).toHaveBeenCalledWith('services');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockOrder).toHaveBeenCalledWith('name');
  });

  it('has correct data-testid attribute', async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });

    render(await ServicesList());

    expect(screen.getByTestId('services-list')).toBeInTheDocument();
  });

  it('renders Add Service button', async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });

    render(await ServicesList());

    expect(screen.getByRole('button', { name: /add service/i })).toBeInTheDocument();
  });

  it('passes services to client component', async () => {
    const mockServices = [
      { id: '1', name: 'Service 1', active: true, created_at: '2024-01-01' },
      { id: '2', name: 'Service 2', active: false, created_at: '2024-01-01' },
    ];
    mockOrder.mockResolvedValue({ data: mockServices, error: null });

    render(await ServicesList());

    const rows = screen.getAllByTestId('service-row');
    expect(rows).toHaveLength(2);
  });
});
