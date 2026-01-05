'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult } from '@/types/domain';

/**
 * Complete Onboarding Action
 * Story 8.7: First-Time User Flow
 * AC 2: First-time flag is set in user preferences
 *
 * Sets the has_completed_onboarding flag to true for the current user.
 * Client handles redirect after successful completion.
 */
export async function completeOnboarding(): Promise<ActionResult<void>> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { error } = await supabase
    .from('users')
    .update({ has_completed_onboarding: true })
    .eq('id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: undefined };
}
