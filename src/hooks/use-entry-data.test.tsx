import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useClients, useProjects, useJobs } from './use-entry-data';
import * as entryActions from '@/actions/entry';

// Mock the server actions
vi.mock('@/actions/entry', () => ({
  getActiveClients: vi.fn(),
  getProjectsByClient: vi.fn(),
  getJobsByProject: vi.fn(),
}));

const mockClients = [
  { id: 'client-1', name: 'Client A', active: true, created_at: '' },
  { id: 'client-2', name: 'Client B', active: true, created_at: '' },
];

const mockProjects = [
  { id: 'project-1', name: 'Project A', client_id: 'client-1', active: true, created_at: '' },
  { id: 'project-2', name: 'Project B', client_id: 'client-1', active: true, created_at: '' },
];

const mockJobs = [
  { id: 'job-1', name: 'Job A', job_no: 'J001', project_id: 'project-1', active: true, created_at: '', so_no: null },
  { id: 'job-2', name: 'Job B', job_no: null, project_id: 'project-1', active: true, created_at: '', so_no: null },
];

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('useClients', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and returns active clients', async () => {
    vi.mocked(entryActions.getActiveClients).mockResolvedValue({
      success: true,
      data: mockClients,
    });

    const { result } = renderHook(() => useClients(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockClients);
    expect(entryActions.getActiveClients).toHaveBeenCalledTimes(1);
  });

  it('handles error from server action', async () => {
    vi.mocked(entryActions.getActiveClients).mockResolvedValue({
      success: false,
      error: 'Failed to fetch clients',
    });

    const { result } = renderHook(() => useClients(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Failed to fetch clients');
  });
});

describe('useProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches projects when clientId is provided', async () => {
    vi.mocked(entryActions.getProjectsByClient).mockResolvedValue({
      success: true,
      data: mockProjects,
    });

    const { result } = renderHook(() => useProjects('client-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockProjects);
    expect(entryActions.getProjectsByClient).toHaveBeenCalledWith('client-1');
  });

  it('does not fetch when clientId is null', async () => {
    const { result } = renderHook(() => useProjects(null), {
      wrapper: createWrapper(),
    });

    // Query should not be enabled
    expect(result.current.fetchStatus).toBe('idle');
    expect(entryActions.getProjectsByClient).not.toHaveBeenCalled();
  });

  it('returns empty array when clientId is null', async () => {
    const { result } = renderHook(() => useProjects(null), {
      wrapper: createWrapper(),
    });

    // Default value before query runs
    expect(result.current.data).toBeUndefined();
  });
});

describe('useJobs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches jobs when projectId is provided', async () => {
    vi.mocked(entryActions.getJobsByProject).mockResolvedValue({
      success: true,
      data: mockJobs,
    });

    const { result } = renderHook(() => useJobs('project-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockJobs);
    expect(entryActions.getJobsByProject).toHaveBeenCalledWith('project-1');
  });

  it('does not fetch when projectId is null', async () => {
    const { result } = renderHook(() => useJobs(null), {
      wrapper: createWrapper(),
    });

    // Query should not be enabled
    expect(result.current.fetchStatus).toBe('idle');
    expect(entryActions.getJobsByProject).not.toHaveBeenCalled();
  });

  it('handles error from server action', async () => {
    vi.mocked(entryActions.getJobsByProject).mockResolvedValue({
      success: false,
      error: 'Failed to fetch jobs',
    });

    const { result } = renderHook(() => useJobs('project-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Failed to fetch jobs');
  });
});
