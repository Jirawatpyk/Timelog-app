/**
 * Clients List Component (Server Component)
 * Story 3.2: Client Management (AC: 1, 6)
 * Story 3.5: Master Data Admin UI Layout (AC: 2, 3, 4, 5, 7)
 *
 * Server component that fetches clients and passes to client component
 * for interactive features like sorting, searching, and filtering.
 */

import { createClient } from '@/lib/supabase/server';
import { ClientsListClient } from './ClientsListClient';

export async function ClientsList() {
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('name');

  return <ClientsListClient initialClients={clients ?? []} />;
}
