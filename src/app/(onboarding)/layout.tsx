/**
 * Onboarding Layout
 * Story 8.7: First-Time User Flow
 *
 * Minimal layout for onboarding screens - no navigation chrome.
 * Provides clean fullscreen experience for first-time users.
 */
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen">
      {children}
    </main>
  );
}
