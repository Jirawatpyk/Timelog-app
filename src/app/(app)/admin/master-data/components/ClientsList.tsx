/**
 * Clients List Component (Server Component)
 * Story 3.2: Client Management (AC: 1, 6)
 *
 * Displays list of all clients with active/inactive visual distinction.
 * - Inactive clients appear with reduced opacity and strikethrough text
 * - Admin can see both active and inactive clients
 * - Each client has edit and toggle active functionality
 */

import { createClient } from '@/lib/supabase/server';
import { AddClientDialog } from '@/components/admin/AddClientDialog';
import { ClientItem } from './ClientItem';

export async function ClientsList() {
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('name');

  return (
    <div className="space-y-4" data-testid="clients-list">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Clients</h2>
        <AddClientDialog />
      </div>

      <div className="space-y-2">
        {clients?.length === 0 && (
          <p className="text-muted-foreground">No clients found.</p>
        )}
        {clients?.map((client) => (
          <ClientItem key={client.id} client={client} />
        ))}
      </div>
    </div>
  );
}
