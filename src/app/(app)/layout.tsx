import { EnvVarWarning } from '@/components/env-var-warning';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { AuthStateListener } from '@/components/shared/auth-state-listener';
import { UserProfileDropdown } from '@/components/shared/user-profile-dropdown';
import { DraftCleanup } from '@/components/shared/draft-cleanup';
import { InstallPrompt } from '@/components/shared/InstallPrompt';
import { ServiceWorkerRegistration } from '@/components/shared/ServiceWorkerRegistration';
import { UpdateNotification } from '@/components/shared/UpdateNotification';
import { BottomNav, Sidebar } from '@/components/navigation';
import { hasEnvVars } from '@/lib/utils';
import { CalendarClock } from 'lucide-react';
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
 * - Mobile: Compact UserProfileDropdown (short name only) + ThemeSwitcher in header (consistent)
 */
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthStateListener>
      {/* Cleanup expired drafts on app load - Story 4.10 */}
      <DraftCleanup />
      {/* Flex container for Sidebar + Main content */}
      <div className="flex min-h-screen">
        {/* Desktop Sidebar Navigation - Story 4.11 */}
        <Sidebar />

        {/* Main content area with bottom padding for mobile nav */}
        <main className="flex-1 flex flex-col pb-20 md:pb-0">
          <div className="flex-1 w-full flex flex-col gap-6">
            {/* Top navigation bar */}
            <nav className="w-full flex border-b border-b-foreground/10 h-16">
              <div className="w-full flex justify-between items-center p-3 px-5 text-sm">
                <Link href={'/'} className="flex items-center gap-2 font-semibold">
                  <CalendarClock className="h-5 w-5 text-primary" />
                  <span>Timelog</span>
                </Link>
                {!hasEnvVars ? (
                  <EnvVarWarning />
                ) : (
                  <>
                    {/* Desktop: ThemeSwitcher + Full UserProfileDropdown (AC 1, 7) */}
                    <div className="hidden md:flex items-center gap-4">
                      <ThemeSwitcher />
                      <UserProfileDropdown />
                    </div>

                    {/* Mobile: ThemeSwitcher + Compact UserProfileDropdown (consistent with desktop) */}
                    <div className="md:hidden flex items-center gap-2">
                      <ThemeSwitcher />
                      <UserProfileDropdown compact />
                    </div>
                  </>
                )}
              </div>
            </nav>

            {/* Page content */}
            <div className="flex-1 w-full flex flex-col gap-6 px-5 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Story 4.1 (mobile only) */}
      <BottomNav />

      {/* PWA Install Prompt - Story 8.1 */}
      <InstallPrompt />

      {/* Service Worker Registration - Story 8.2 */}
      <ServiceWorkerRegistration />

      {/* Update Notification - Story 8.2 */}
      <UpdateNotification />
    </AuthStateListener>
  );
}
