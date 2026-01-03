/**
 * Master Data Management Page
 * Story 3.1: Service Type Management (AC: 1)
 * Story 3.5: Master Data Admin UI Layout (AC: 1)
 * Story 3.6: Projects & Jobs Admin UI (AC: 9)
 *
 * Provides admin interface for managing master data:
 * - Clients (Story 3.2)
 * - Projects (Story 3.6)
 * - Jobs (Story 3.6)
 * - Services (Story 3.1)
 * - Tasks (Story 3.3)
 *
 * Tab order: Clients → Projects → Jobs → Services → Tasks (data hierarchy)
 * Features URL-synced tabs for preserving navigation state.
 */

import { Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ClientsList } from './components/ClientsList';
import { ProjectsList } from './components/ProjectsList';
import { JobsList } from './components/JobsList';
import { ServicesList } from './components/ServicesList';
import { TasksList } from './components/TasksList';
import Link from 'next/link';

interface MasterDataPageProps {
  searchParams: Promise<{ tab?: string }>;
}

/**
 * Table Skeleton Components
 * Matches actual FilterToolbar layouts for each tab type
 *
 * Mobile: Search (flex-1) + Filter button (icon) + Add button (icon)
 * Desktop: Search (w-64) + inline filters + Add button
 *
 * Filter widths based on actual components:
 * - Client filter: w-[180px]
 * - Project filter: w-[180px]
 * - Status filter: w-[140px]
 */

// Base table rows skeleton (shared by all variants)
function TableRowsSkeleton() {
  return (
    <div className="border rounded-md">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4 border-b last:border-b-0">
          <Skeleton className="h-5 flex-1" />
          <Skeleton className="h-5 w-20 hidden sm:block" />
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  );
}

// Clients, Services, Tasks: 1 filter (Status only)
function TableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2 sm:gap-4 sm:justify-between">
        {/* Mobile: Search + Filter button + Add button */}
        <div className="flex items-center gap-2 flex-1 sm:flex-none">
          <Skeleton className="h-10 flex-1 sm:w-64 sm:flex-none" />
          <Skeleton className="h-10 w-10 sm:hidden" /> {/* Filter button (mobile) */}
          <Skeleton className="h-9 w-9 sm:hidden" /> {/* Add button (mobile) */}
        </div>
        {/* Desktop: Status filter + Add button */}
        <div className="hidden sm:flex sm:items-center sm:gap-2">
          <Skeleton className="h-10 w-[140px]" /> {/* Status filter */}
          <Skeleton className="h-9 w-[100px]" /> {/* Add button */}
        </div>
      </div>
      <TableRowsSkeleton />
    </div>
  );
}

// Projects: 2 filters (Client + Status)
function ProjectsTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2 sm:gap-4 sm:justify-between">
        {/* Mobile: Search + Filter button + Add button */}
        <div className="flex items-center gap-2 flex-1 sm:flex-none">
          <Skeleton className="h-10 flex-1 sm:w-64 sm:flex-none" />
          <Skeleton className="h-10 w-10 sm:hidden" /> {/* Filter button (mobile) */}
          <Skeleton className="h-9 w-9 sm:hidden" /> {/* Add button (mobile) */}
        </div>
        {/* Desktop: Client filter + Status filter + Add button */}
        <div className="hidden sm:flex sm:items-center sm:gap-2">
          <Skeleton className="h-10 w-[180px]" /> {/* Client filter */}
          <Skeleton className="h-10 w-[140px]" /> {/* Status filter */}
          <Skeleton className="h-9 w-[120px]" /> {/* Add button */}
        </div>
      </div>
      <TableRowsSkeleton />
    </div>
  );
}

// Jobs: 3 filters (Client + Project + Status)
function JobsTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2 sm:gap-4 sm:justify-between">
        {/* Mobile: Search + Filter button + Add button */}
        <div className="flex items-center gap-2 flex-1 sm:flex-none">
          <Skeleton className="h-10 flex-1 sm:w-64 sm:flex-none" />
          <Skeleton className="h-10 w-10 sm:hidden" /> {/* Filter button (mobile) */}
          <Skeleton className="h-9 w-9 sm:hidden" /> {/* Add button (mobile) */}
        </div>
        {/* Desktop: Client + Project + Status filters + Add button */}
        <div className="hidden sm:flex sm:items-center sm:gap-2">
          <Skeleton className="h-10 w-[180px]" /> {/* Client filter */}
          <Skeleton className="h-10 w-[180px]" /> {/* Project filter */}
          <Skeleton className="h-10 w-[140px]" /> {/* Status filter */}
          <Skeleton className="h-9 w-[100px]" /> {/* Add button */}
        </div>
      </div>
      <TableRowsSkeleton />
    </div>
  );
}

// Tab order follows data hierarchy: Clients → Projects → Jobs → Services → Tasks
const validTabs = ['clients', 'projects', 'jobs', 'services', 'tasks'] as const;
type TabValue = (typeof validTabs)[number];

function isValidTab(tab: string | undefined): tab is TabValue {
  return validTabs.includes(tab as TabValue);
}

export default async function MasterDataPage({ searchParams }: MasterDataPageProps) {
  const params = await searchParams;
  const activeTab: TabValue = isValidTab(params.tab) ? params.tab : 'clients';

  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold mb-6">Master Data Management</h1>

      <Tabs value={activeTab} className="w-full">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger value="clients" asChild>
            <Link href="?tab=clients" scroll={false}>
              Clients
            </Link>
          </TabsTrigger>
          <TabsTrigger value="projects" asChild>
            <Link href="?tab=projects" scroll={false}>
              Projects
            </Link>
          </TabsTrigger>
          <TabsTrigger value="jobs" asChild>
            <Link href="?tab=jobs" scroll={false}>
              Jobs
            </Link>
          </TabsTrigger>
          <TabsTrigger value="services" asChild>
            <Link href="?tab=services" scroll={false}>
              Services
            </Link>
          </TabsTrigger>
          <TabsTrigger value="tasks" asChild>
            <Link href="?tab=tasks" scroll={false}>
              Tasks
            </Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="mt-0">
          <Suspense fallback={<TableSkeleton />}>
            <ClientsList />
          </Suspense>
        </TabsContent>

        <TabsContent value="projects" className="mt-0">
          <Suspense fallback={<ProjectsTableSkeleton />}>
            <ProjectsList />
          </Suspense>
        </TabsContent>

        <TabsContent value="jobs" className="mt-0">
          <Suspense fallback={<JobsTableSkeleton />}>
            <JobsList />
          </Suspense>
        </TabsContent>

        <TabsContent value="services" className="mt-0">
          <Suspense fallback={<TableSkeleton />}>
            <ServicesList />
          </Suspense>
        </TabsContent>

        <TabsContent value="tasks" className="mt-0">
          <Suspense fallback={<TableSkeleton />}>
            <TasksList />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
