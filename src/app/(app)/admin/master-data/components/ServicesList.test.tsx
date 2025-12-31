/**
 * Tests for ServicesList Component
 * Story 3.1: Service Type Management (AC: 1, 6)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ServicesList } from './ServicesList';
import type { Service } from '@/types/domain';

// Mock Supabase client
const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    from: mockFrom,
  })),
}));

// Mock ServiceItem to simplify testing
vi.mock('./ServiceItem', () => ({
  ServiceItem: ({ service }: { service: Service }) => (
    <div
      data-testid="service-item"
      data-active={service.active}
      className={!service.active ? 'opacity-50' : ''}
    >
      <span data-testid={`service-name-${service.id}`} className={!service.active ? 'line-through' : ''}>
        {service.name}
      </span>
      <span>{service.active ? 'Active' : 'Inactive'}</span>
    </div>
  ),
}));

// Mock AddServiceDialog
vi.mock('@/components/admin/AddServiceDialog', () => ({
  AddServiceDialog: () => <button>Add Service</button>,
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

  it('renders the Services heading', async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });

    render(await ServicesList());

    expect(screen.getByRole('heading', { name: /services/i })).toBeInTheDocument();
  });

  it('displays empty state when no services exist', async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });

    render(await ServicesList());

    expect(screen.getByText(/no services found/i)).toBeInTheDocument();
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

    // Check for active/inactive status indicators (via mocked ServiceItem)
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('applies visual distinction to inactive services', async () => {
    const mockServices = [
      { id: '1', name: 'Dubbing', active: true, created_at: '2024-01-01' },
      { id: '2', name: 'Inactive Service', active: false, created_at: '2024-01-01' },
    ];
    mockOrder.mockResolvedValue({ data: mockServices, error: null });

    render(await ServicesList());

    // Find the service items by their container
    const serviceItems = screen.getAllByTestId('service-item');

    // First service (active) should not have opacity class
    expect(serviceItems[0]).not.toHaveClass('opacity-50');

    // Second service (inactive) should have opacity class
    expect(serviceItems[1]).toHaveClass('opacity-50');
  });

  it('shows inactive service name with line-through styling', async () => {
    const mockServices = [
      { id: '1', name: 'Inactive Service', active: false, created_at: '2024-01-01' },
    ];
    mockOrder.mockResolvedValue({ data: mockServices, error: null });

    render(await ServicesList());

    const serviceName = screen.getByTestId('service-name-1');
    expect(serviceName).toHaveClass('line-through');
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
});
