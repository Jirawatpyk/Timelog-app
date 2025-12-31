/**
 * Services List Component (Server Component)
 * Story 3.1: Service Type Management (AC: 1, 6)
 *
 * Displays list of all services with active/inactive visual distinction.
 * - Inactive services appear with reduced opacity and strikethrough text
 * - Admin can see both active and inactive services
 * - Each service has edit and toggle active functionality
 */

import { createClient } from '@/lib/supabase/server';
import { AddServiceDialog } from '@/components/admin/AddServiceDialog';
import { ServiceItem } from './ServiceItem';

export async function ServicesList() {
  const supabase = await createClient();

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .order('name');

  return (
    <div className="space-y-4" data-testid="services-list">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Services</h2>
        <AddServiceDialog />
      </div>

      <div className="space-y-2">
        {services?.length === 0 && (
          <p className="text-muted-foreground">No services found.</p>
        )}
        {services?.map((service) => (
          <ServiceItem key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}
