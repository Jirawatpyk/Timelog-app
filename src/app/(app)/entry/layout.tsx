import { EntryQueryProvider } from './providers';

/**
 * Entry Layout with TanStack Query Provider
 * Story 4.2: Wraps entry page with QueryClientProvider
 *
 * Per project-context.md: TanStack Query is ONLY used in Entry page
 * Do NOT wrap with Suspense - TanStack Query handles loading states
 */
export default function EntryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <EntryQueryProvider>{children}</EntryQueryProvider>;
}
