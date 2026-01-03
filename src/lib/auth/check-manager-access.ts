// src/lib/auth/check-manager-access.ts
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export interface ManagerAccessResult {
  canAccess: boolean;
  userId: string;
  role: string;
  isAdmin: boolean;
}

export async function checkManagerAccess(): Promise<ManagerAccessResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = profile?.role || 'staff';
  const canAccess = ['manager', 'admin', 'super_admin'].includes(role);
  const isAdmin = ['admin', 'super_admin'].includes(role);

  return { canAccess, userId: user.id, role, isAdmin };
}
