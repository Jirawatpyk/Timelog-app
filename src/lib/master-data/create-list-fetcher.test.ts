/**
 * Tests for createListFetcher factory
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createListFetcher } from './create-list-fetcher';

// Mock Supabase client
const mockOrder = vi.fn();
const mockEq = vi.fn();
const mockSelect = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      from: mockFrom,
    })
  ),
}));

describe('createListFetcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default chain
    mockFrom.mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
    });
    mockEq.mockReturnValue({
      order: mockOrder,
    });
  });

  it('creates a fetcher function', () => {
    const fetcher = createListFetcher('services');
    expect(typeof fetcher).toBe('function');
  });

  it('fetches from the correct table', async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });

    const fetcher = createListFetcher('services');
    await fetcher();

    expect(mockFrom).toHaveBeenCalledWith('services');
    expect(mockSelect).toHaveBeenCalledWith('*');
  });

  it('orders by name ascending by default', async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });

    const fetcher = createListFetcher('clients');
    await fetcher();

    expect(mockOrder).toHaveBeenCalledWith('name', { ascending: true });
  });

  it('respects custom orderBy option', async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });

    const fetcher = createListFetcher('tasks', { orderBy: 'created_at' });
    await fetcher();

    expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: true });
  });

  it('respects descending order', async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });

    const fetcher = createListFetcher('services', { orderDirection: 'desc' });
    await fetcher();

    expect(mockOrder).toHaveBeenCalledWith('name', { ascending: false });
  });

  it('filters by active when activeOnly is true', async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });

    const fetcher = createListFetcher('services', { activeOnly: true });
    await fetcher();

    expect(mockEq).toHaveBeenCalledWith('active', true);
  });

  it('does not filter by active when activeOnly is false', async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });

    const fetcher = createListFetcher('services');
    await fetcher();

    expect(mockEq).not.toHaveBeenCalled();
  });

  it('returns success with data from Supabase', async () => {
    const mockData = [
      { id: '1', name: 'Service 1', active: true },
      { id: '2', name: 'Service 2', active: false },
    ];
    mockOrder.mockResolvedValue({ data: mockData, error: null });

    const fetcher = createListFetcher('services');
    const result = await fetcher();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(mockData);
    }
  });

  it('returns success with empty array when data is null', async () => {
    mockOrder.mockResolvedValue({ data: null, error: null });

    const fetcher = createListFetcher('services');
    const result = await fetcher();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual([]);
    }
  });

  it('returns error when Supabase query fails', async () => {
    mockOrder.mockResolvedValue({ data: null, error: { message: 'Database connection failed' } });

    const fetcher = createListFetcher('services');
    const result = await fetcher();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Database connection failed');
    }
  });

  it('allows runtime options to override defaults', async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });

    const fetcher = createListFetcher('services', { orderBy: 'name' });
    await fetcher({ orderBy: 'created_at', orderDirection: 'desc' });

    expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('works with different table names', async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });

    const servicesFetcher = createListFetcher('services');
    const clientsFetcher = createListFetcher('clients');
    const tasksFetcher = createListFetcher('tasks');

    await servicesFetcher();
    expect(mockFrom).toHaveBeenLastCalledWith('services');

    await clientsFetcher();
    expect(mockFrom).toHaveBeenLastCalledWith('clients');

    await tasksFetcher();
    expect(mockFrom).toHaveBeenLastCalledWith('tasks');
  });
});
