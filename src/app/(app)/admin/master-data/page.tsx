/**
 * Master Data Management Page
 * Story 3.1: Service Type Management (AC: 1)
 * Story 3.5: Master Data Admin UI Layout (AC: 1)
 *
 * Provides admin interface for managing master data:
 * - Services (Story 3.1)
 * - Clients (Story 3.2)
 * - Tasks (Story 3.3)
 *
 * Features URL-synced tabs for preserving navigation state.
 */

import { Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ServicesList } from './components/ServicesList';
import { ClientsList } from './components/ClientsList';
import { TasksList } from './components/TasksList';
import Link from 'next/link';

interface MasterDataPageProps {
  searchParams: Promise<{ tab?: string }>;
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-10 w-full sm:w-64" />
        <Skeleton className="h-10 w-full sm:w-32" />
        <Skeleton className="h-10 w-full sm:w-24 sm:ml-auto" />
      </div>
      <div className="border rounded-md">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b last:border-b-0">
            <Skeleton className="h-5 flex-1" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

const validTabs = ['services', 'clients', 'tasks'] as const;
type TabValue = (typeof validTabs)[number];

function isValidTab(tab: string | undefined): tab is TabValue {
  return validTabs.includes(tab as TabValue);
}

export default async function MasterDataPage({ searchParams }: MasterDataPageProps) {
  const params = await searchParams;
  const activeTab: TabValue = isValidTab(params.tab) ? params.tab : 'services';

  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold mb-6">Master Data Management</h1>

      <Tabs value={activeTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="services" asChild>
            <Link href="?tab=services" scroll={false}>
              Services
            </Link>
          </TabsTrigger>
          <TabsTrigger value="clients" asChild>
            <Link href="?tab=clients" scroll={false}>
              Clients
            </Link>
          </TabsTrigger>
          <TabsTrigger value="tasks" asChild>
            <Link href="?tab=tasks" scroll={false}>
              Tasks
            </Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="mt-0">
          <Suspense fallback={<TableSkeleton />}>
            <ServicesList />
          </Suspense>
        </TabsContent>

        <TabsContent value="clients" className="mt-0">
          <Suspense fallback={<TableSkeleton />}>
            <ClientsList />
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
