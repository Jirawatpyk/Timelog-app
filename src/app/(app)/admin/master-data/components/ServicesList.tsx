/**
 * Services List Component (Server Component)
 * Story 3.1: Service Type Management (AC: 1, 6)
 * Story 3.5: Master Data Admin UI Layout (AC: 2, 3, 4, 5, 7)
 *
 * Server component that fetches services and passes to client component
 * for interactive features like sorting, searching, and filtering.
 */

import { createClient } from '@/lib/supabase/server';
import { ServicesListClient } from './ServicesListClient';

export async function ServicesList() {
  const supabase = await createClient();

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .order('name');

  return <ServicesListClient initialServices={services ?? []} />;
}
