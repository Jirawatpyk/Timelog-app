/**
 * Master Data Management Page
 * Story 3.1: Service Type Management (AC: 1)
 *
 * Provides admin interface for managing master data:
 * - Services (Story 3.1)
 * - Clients (Story 3.2)
 * - Tasks (Story 3.3)
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServicesList } from './components/ServicesList';
import { ClientsList } from './components/ClientsList';
import { TasksList } from './components/TasksList';

export default async function MasterDataPage() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Master Data Management</h1>

      <Tabs defaultValue="services">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          <ServicesList />
        </TabsContent>

        <TabsContent value="clients">
          <ClientsList />
        </TabsContent>

        <TabsContent value="tasks">
          <TasksList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
