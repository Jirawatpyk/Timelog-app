/**
 * Generic Master Data List Fetcher Factory
 *
 * Creates server-side data fetching functions for master data entities.
 * Reduces boilerplate for ServicesList, ClientsList, TasksList server components.
 *
 * @example
 * ```typescript
 * // In ServicesList.tsx
 * import { createListFetcher } from '@/lib/master-data/create-list-fetcher';
 *
 * const fetchServices = createListFetcher('services');
 *
 * export async function ServicesList() {
 *   const services = await fetchServices();
 *   return <ServicesListClient initialServices={services} />;
 * }
 * ```
 *
 * Why not a full generic component?
 * ================================
 * While Server Components are nearly identical, the Client Components have:
 * - Different Add/Edit dialogs per entity
 * - Different server actions (toggleServiceActive, toggleClientActive, etc.)
 * - Different column configurations
 *
 * A full generic would require complex dependency injection patterns that
 * would make the code harder to understand than the current explicit approach.
 * This factory focuses on the common pattern (data fetching) while leaving
 * entity-specific logic explicit.
 */

import { createClient } from '@/lib/supabase/server';
import type { Service, Client, Task, Project, Job } from '@/types/domain';

type MasterDataTable = 'services' | 'clients' | 'tasks' | 'projects' | 'jobs';

interface FetchOptions {
  /** Column to order by (default: 'name') */
  orderBy?: string;
  /** Order direction (default: 'asc') */
  orderDirection?: 'asc' | 'desc';
  /** Whether to filter by active only (default: false, fetches all) */
  activeOnly?: boolean;
}

/** Result type for fetch operations */
export type FetchResult<T> =
  | { success: true; data: T[] }
  | { success: false; error: string };

/**
 * Creates a fetch function for a master data table.
 *
 * @param table - The Supabase table name
 * @param defaultOptions - Default fetch options
 * @returns Async function that fetches data from the table
 */
export function createListFetcher<T>(
  table: MasterDataTable,
  defaultOptions: FetchOptions = {}
) {
  const {
    orderBy = 'name',
    orderDirection = 'asc',
    activeOnly = false,
  } = defaultOptions;

  return async (options: FetchOptions = {}): Promise<FetchResult<T>> => {
    const supabase = await createClient();

    const finalOptions = {
      orderBy: options.orderBy ?? orderBy,
      orderDirection: options.orderDirection ?? orderDirection,
      activeOnly: options.activeOnly ?? activeOnly,
    };

    let query = supabase.from(table).select('*');

    if (finalOptions.activeOnly) {
      query = query.eq('active', true);
    }

    const { data, error } = await query.order(finalOptions.orderBy, {
      ascending: finalOptions.orderDirection === 'asc',
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: (data ?? []) as T[] };
  };
}

/**
 * Pre-configured fetchers for common master data entities.
 * These can be used directly or customized with options.
 * Uses domain types from @/types/domain for type safety.
 */

// Service fetcher - uses Service type from domain
export const fetchServices = createListFetcher<Service>('services');

// Client fetcher - uses Client type from domain
export const fetchClients = createListFetcher<Client>('clients');

// Task fetcher - uses Task type from domain
export const fetchTasks = createListFetcher<Task>('tasks');

// Project fetcher - uses Project type from domain
export const fetchProjects = createListFetcher<Project>('projects');

// Job fetcher - uses Job type from domain
export const fetchJobs = createListFetcher<Job>('jobs');
