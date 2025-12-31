'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { useUser } from '@/hooks/use-user';
import type { UserRole } from '@/types/domain';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

/**
 * RoleGuard - Client-side role-based access control component
 *
 * This component provides client-side backup protection for role-based access.
 * The middleware handles the primary RBAC enforcement, but this component
 * adds an extra layer of protection for client-side rendered content.
 *
 * @param children - Content to render if user has an allowed role
 * @param allowedRoles - Array of roles that can access this content
 * @param fallback - Optional fallback UI to show during loading or for unauthorized users
 */
export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { role, isLoading } = useUser();
  const router = useRouter();

  // Compute access permission once to avoid duplication
  const hasAccess = useMemo(
    () => role !== null && allowedRoles.includes(role),
    [role, allowedRoles]
  );

  useEffect(() => {
    // Redirect unauthorized users after loading completes
    if (!isLoading && !hasAccess) {
      router.replace('/entry?access=denied');
    }
  }, [isLoading, hasAccess, router]);

  // Show loading state
  if (isLoading) {
    return <>{fallback ?? <div>Loading...</div>}</>;
  }

  // User doesn't have access - show fallback while redirect happens
  if (!hasAccess) {
    return <>{fallback ?? null}</>;
  }

  // User has an allowed role - render children
  return <>{children}</>;
}
