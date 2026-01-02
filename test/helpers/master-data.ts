/**
 * Master Data Test Helpers
 *
 * Provides reusable utilities for testing master data components
 * (Services, Clients, Tasks, Projects, Jobs).
 *
 * Usage:
 * ```typescript
 * import { createMockSupabaseQuery, mockService, mockClient } from '@/test/helpers/master-data';
 *
 * const { mockFrom, mockSelect, mockOrder, setupMocks } = createMockSupabaseQuery();
 *
 * beforeEach(() => {
 *   setupMocks();
 * });
 *
 * it('test', async () => {
 *   mockOrder.mockResolvedValue({ data: [mockService()], error: null });
 *   // ... test code
 * });
 * ```
 */

import { vi } from 'vitest';

// =============================================================================
// MOCK SUPABASE QUERY CHAIN
// =============================================================================

/**
 * Creates mock functions for Supabase query chain.
 * Returns mocks and a setupMocks function to wire them together.
 */
export function createMockSupabaseQuery() {
  const mockSelect = vi.fn();
  const mockOrder = vi.fn();
  const mockFrom = vi.fn();
  const mockEq = vi.fn();
  const mockSingle = vi.fn();
  const mockInsert = vi.fn();
  const mockUpdate = vi.fn();
  const mockDelete = vi.fn();

  /**
   * Sets up the standard query chain: from() -> select() -> order()
   * Call this in beforeEach()
   */
  const setupMocks = () => {
    vi.clearAllMocks();

    // Standard SELECT chain
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    });

    mockSelect.mockReturnValue({
      order: mockOrder,
      eq: mockEq,
      single: mockSingle,
    });

    mockOrder.mockReturnValue({
      eq: mockEq,
    });

    // For INSERT/UPDATE/DELETE chains
    mockInsert.mockReturnValue({
      select: mockSelect,
      single: mockSingle,
    });

    mockUpdate.mockReturnValue({
      eq: mockEq,
      select: mockSelect,
    });

    mockDelete.mockReturnValue({
      eq: mockEq,
    });

    mockEq.mockReturnValue({
      select: mockSelect,
      single: mockSingle,
    });
  };

  return {
    mockFrom,
    mockSelect,
    mockOrder,
    mockEq,
    mockSingle,
    mockInsert,
    mockUpdate,
    mockDelete,
    setupMocks,
  };
}

/**
 * Creates a vi.mock() factory for @/lib/supabase/server
 * Use with vi.mock() hoisting
 */
export function createSupabaseMock(mockFrom: ReturnType<typeof vi.fn>) {
  return {
    createClient: vi.fn(() =>
      Promise.resolve({
        from: mockFrom,
      })
    ),
  };
}

// =============================================================================
// MOCK DATA FACTORIES
// =============================================================================

interface MockOptions {
  id?: string;
  active?: boolean;
  created_at?: string;
}

/**
 * Creates a mock Service object
 */
export function mockService(
  name: string = 'Test Service',
  options: MockOptions = {}
) {
  return {
    id: options.id ?? crypto.randomUUID(),
    name,
    active: options.active ?? true,
    created_at: options.created_at ?? new Date().toISOString(),
  };
}

/**
 * Creates a mock Client object
 */
export function mockClient(
  name: string = 'Test Client',
  options: MockOptions = {}
) {
  return {
    id: options.id ?? crypto.randomUUID(),
    name,
    active: options.active ?? true,
    created_at: options.created_at ?? new Date().toISOString(),
  };
}

/**
 * Creates a mock Task object
 */
export function mockTask(
  name: string = 'Test Task',
  options: MockOptions = {}
) {
  return {
    id: options.id ?? crypto.randomUUID(),
    name,
    active: options.active ?? true,
    created_at: options.created_at ?? new Date().toISOString(),
  };
}

interface MockProjectOptions extends MockOptions {
  client_id?: string;
}

/**
 * Creates a mock Project object
 */
export function mockProject(
  name: string = 'Test Project',
  options: MockProjectOptions = {}
) {
  return {
    id: options.id ?? crypto.randomUUID(),
    name,
    client_id: options.client_id ?? crypto.randomUUID(),
    active: options.active ?? true,
    created_at: options.created_at ?? new Date().toISOString(),
  };
}

interface MockJobOptions extends MockOptions {
  project_id?: string;
  job_no?: string;
  so_no?: string;
}

/**
 * Creates a mock Job object
 */
export function mockJob(
  name: string = 'Test Job',
  options: MockJobOptions = {}
) {
  return {
    id: options.id ?? crypto.randomUUID(),
    name,
    project_id: options.project_id ?? crypto.randomUUID(),
    job_no: options.job_no ?? `JOB-${Date.now()}`,
    so_no: options.so_no ?? null,
    active: options.active ?? true,
    created_at: options.created_at ?? new Date().toISOString(),
  };
}

// =============================================================================
// BATCH MOCK CREATORS
// =============================================================================

/**
 * Creates multiple mock services
 */
export function mockServices(count: number, baseOptions: MockOptions = {}) {
  return Array.from({ length: count }, (_, i) =>
    mockService(`Service ${i + 1}`, { ...baseOptions, id: `service-${i + 1}` })
  );
}

/**
 * Creates multiple mock clients
 */
export function mockClients(count: number, baseOptions: MockOptions = {}) {
  return Array.from({ length: count }, (_, i) =>
    mockClient(`Client ${i + 1}`, { ...baseOptions, id: `client-${i + 1}` })
  );
}

/**
 * Creates multiple mock tasks
 */
export function mockTasks(count: number, baseOptions: MockOptions = {}) {
  return Array.from({ length: count }, (_, i) =>
    mockTask(`Task ${i + 1}`, { ...baseOptions, id: `task-${i + 1}` })
  );
}

/**
 * Creates multiple mock projects
 */
export function mockProjects(count: number, baseOptions: MockProjectOptions = {}) {
  return Array.from({ length: count }, (_, i) =>
    mockProject(`Project ${i + 1}`, { ...baseOptions, id: `project-${i + 1}` })
  );
}

/**
 * Creates multiple mock jobs
 */
export function mockJobs(count: number, baseOptions: MockJobOptions = {}) {
  return Array.from({ length: count }, (_, i) =>
    mockJob(`Job ${i + 1}`, { ...baseOptions, id: `job-${i + 1}`, job_no: `JOB-${i + 1}` })
  );
}

// =============================================================================
// RESPONSE HELPERS
// =============================================================================

/**
 * Creates a successful Supabase response
 */
export function successResponse<T>(data: T) {
  return { data, error: null };
}

/**
 * Creates an error Supabase response
 */
export function errorResponse(message: string = 'Database error') {
  return { data: null, error: { message } };
}

/**
 * Creates an empty Supabase response
 */
export function emptyResponse() {
  return { data: [], error: null };
}
