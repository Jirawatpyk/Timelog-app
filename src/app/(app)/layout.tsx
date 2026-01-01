import { EnvVarWarning } from '@/components/env-var-warning';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { AuthStateListener } from '@/components/shared/auth-state-listener';
import { UserProfileDropdown } from '@/components/shared/user-profile-dropdown';
import { BottomNav, Sidebar } from '@/components/navigation';
import { hasEnvVars } from '@/lib/utils';
import Link from 'next/link';

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
 *
 * Story 4.12: Desktop Header Enhancement
 * - Desktop: Full UserProfileDropdown (name + role badge) + ThemeSwitcher in header
 * - Mobile: Compact UserProfileDropdown (short name only), ThemeSwitcher in footer
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
            <nav className="w-full flex border-b border-b-foreground/10 h-16">
              <div className="w-full flex justify-between items-center p-3 px-5 text-sm">
                <div className="flex items-center font-semibold">
                  <Link href={'/'}>Timelog</Link>
                </div>
                {!hasEnvVars ? (
                  <EnvVarWarning />
                ) : (
                  <>
                    {/* Desktop: ThemeSwitcher + Full UserProfileDropdown (AC 1, 7) */}
                    <div className="hidden md:flex items-center gap-4">
                      <ThemeSwitcher />
                      <UserProfileDropdown />
                    </div>

                    {/* Mobile: Compact UserProfileDropdown (AC 5 - consistent with desktop) */}
                    <div className="md:hidden">
                      <UserProfileDropdown compact />
                    </div>
                  </>
                )}
              </div>
            </nav>

            {/* Page content */}
            <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
              {children}
            </div>

            {/* Footer - Mobile ThemeSwitcher only (AC 7) */}
            <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs py-4 md:hidden">
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
