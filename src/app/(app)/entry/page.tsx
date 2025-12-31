import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { AccessDeniedHandler } from '@/components/shared/access-denied-handler';

export default async function EntryPage() {
  // Middleware already protects this route - just get user for display
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-4">
      <Suspense fallback={null}>
        <AccessDeniedHandler />
      </Suspense>
      <div className="bg-accent text-sm p-4 rounded-md">
        <h1 className="font-bold text-2xl mb-2">Quick Entry</h1>
        <p className="text-muted-foreground">
          Welcome! The Quick Entry form will be implemented in Epic 4.
        </p>
      </div>
      <div className="bg-muted/50 p-4 rounded-md">
        <p className="text-sm text-muted-foreground">
          Logged in as: <span className="font-mono">{user?.email}</span>
        </p>
      </div>
    </div>
  );
}
