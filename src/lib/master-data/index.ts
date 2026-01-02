/**
 * Master Data Library
 *
 * Provides utilities for fetching and managing master data entities
 * (Services, Clients, Tasks, Projects, Jobs).
 *
 * @example
 * ```typescript
 * import { fetchServices, fetchClients, createListFetcher } from '@/lib/master-data';
 *
 * // Use pre-configured fetchers
 * const servicesResult = await fetchServices();
 * if (servicesResult.success) {
 *   console.log(servicesResult.data);
 * }
 *
 * // Or create custom fetcher
 * const fetchActiveServices = createListFetcher<Service>('services', { activeOnly: true });
 * ```
 */

export {
  createListFetcher,
  fetchServices,
  fetchClients,
  fetchTasks,
  fetchProjects,
  fetchJobs,
  type FetchResult,
} from './create-list-fetcher';
