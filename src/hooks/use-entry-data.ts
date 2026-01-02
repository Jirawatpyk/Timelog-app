'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getActiveClients,
  getProjectsByClient,
  getJobsByProject,
  getActiveServices,
  getActiveTasks,
  getRecentCombinations,
} from '@/actions/entry';
import { STALE_TIME_MS } from '@/constants/time';

/**
 * Hook to fetch active clients
 * Story 4.2: Used in ClientSelector
 */
export function useClients() {
  return useQuery({
    queryKey: ['clients', 'active'],
    queryFn: async () => {
      const result = await getActiveClients();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });
}

/**
 * Hook to fetch projects for a specific client
 * Story 4.2: Used in ProjectSelector, enabled only when clientId is set
 */
export function useProjects(clientId: string | null) {
  return useQuery({
    queryKey: ['projects', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const result = await getProjectsByClient(clientId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: !!clientId,
  });
}

/**
 * Hook to fetch jobs for a specific project
 * Story 4.2: Used in JobSelector, enabled only when projectId is set
 */
export function useJobs(projectId: string | null) {
  return useQuery({
    queryKey: ['jobs', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const result = await getJobsByProject(projectId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: !!projectId,
  });
}

/**
 * Hook to fetch active services
 * Story 4.3: Used in ServiceSelector
 */
export function useServices() {
  return useQuery({
    queryKey: ['services', 'active'],
    queryFn: async () => {
      const result = await getActiveServices();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });
}

/**
 * Hook to fetch active tasks
 * Story 4.3: Used in TaskSelector (optional field)
 */
export function useTasks() {
  return useQuery({
    queryKey: ['tasks', 'active'],
    queryFn: async () => {
      const result = await getActiveTasks();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });
}

/**
 * Hook to fetch user's recent combinations
 * Story 4.7 - AC1, AC6: Used in RecentCombinations component
 */
export function useRecentCombinations() {
  return useQuery({
    queryKey: ['recentCombinations'],
    queryFn: async () => {
      const result = await getRecentCombinations();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: STALE_TIME_MS, // 30 seconds
  });
}
