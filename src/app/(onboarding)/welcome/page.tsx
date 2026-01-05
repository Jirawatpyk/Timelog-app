import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { WelcomeScreen } from '@/components/onboarding/WelcomeScreen';

/**
 * Welcome Page
 * Story 8.7: First-Time User Flow
 *
 * Server component that checks onboarding status.
 * - Redirects to /login if not authenticated
 * - Redirects to /entry if already completed onboarding
 * - Renders WelcomeScreen for new users
 */
export default async function WelcomePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Check if already completed onboarding
  const { data: profile } = await supabase
    .from('users')
    .select('has_completed_onboarding')
    .eq('id', user.id)
    .single();

  if (profile?.has_completed_onboarding) {
    redirect('/entry');
  }

  return <WelcomeScreen />;
}
