'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getActiveClients,
  getProjectsByClient,
  getJobsByProject,
} from '@/actions/entry';

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
