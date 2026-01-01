import { DeployButton } from '@/components/deploy-button';
import { EnvVarWarning } from '@/components/env-var-warning';
import { AuthButton } from '@/components/auth-button';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { AuthStateListener } from '@/components/shared/auth-state-listener';
import { BottomNav, Sidebar } from '@/components/navigation';
import { hasEnvVars } from '@/lib/utils';
import Link from 'next/link';
import { Suspense } from 'react';

/**
 * Protected App Layout
 *
 * Story 4.1: Bottom Navigation Component
 * - Adds BottomNav for mobile navigation
 * - Adds bottom padding to prevent content overlap with nav (pb-20 on mobile)
 *
 * Story 4.11: Desktop Sidebar Navigation
 * - Adds Sidebar for desktop navigation (hidden on mobile)
 * - Uses flex layout to position sidebar + content side by side on desktop
 */
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthStateListener>
      {/* Flex container for Sidebar + Main content */}
      <div className="flex min-h-screen">
        {/* Desktop Sidebar Navigation - Story 4.11 */}
        <Sidebar />

        {/* Main content area with bottom padding for mobile nav */}
        <main className="flex-1 flex flex-col items-center pb-20 md:pb-0">
          <div className="flex-1 w-full flex flex-col gap-20 items-center">
            {/* Top navigation bar */}
            <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
              <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                <div className="flex gap-5 items-center font-semibold">
                  <Link href={'/'}>Timelog</Link>
                  {/* Hide DeployButton on mobile to save space */}
                  <div className="hidden md:flex items-center gap-2">
                    <DeployButton />
                  </div>
                </div>
                {!hasEnvVars ? (
                  <EnvVarWarning />
                ) : (
                  <Suspense>
                    <AuthButton />
                  </Suspense>
                )}
              </div>
            </nav>

            {/* Page content */}
            <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
              {children}
            </div>

            {/* Footer */}
            <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
              <p>
                Powered by{' '}
                <a
                  href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
                  target="_blank"
                  className="font-bold hover:underline"
                  rel="noreferrer"
                >
                  Supabase
                </a>
              </p>
              <ThemeSwitcher />
            </footer>
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Story 4.1 (mobile only) */}
      <BottomNav />
    </AuthStateListener>
  );
}
