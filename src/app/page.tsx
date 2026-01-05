import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

// Force dynamic rendering - this page requires authentication check
export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/entry');
  } else {
    redirect('/login');
  }
}
