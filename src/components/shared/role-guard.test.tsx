import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RoleGuard } from './role-guard';
import type { UserRole } from '@/types/domain';

// Mock useUser hook
const mockUseUser = vi.fn();
vi.mock('@/hooks/use-user', () => ({
  useUser: () => mockUseUser(),
}));

// Mock next/navigation
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

describe('RoleGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when loading', () => {
    it('should show default loading state', () => {
      mockUseUser.mockReturnValue({
        role: null,
        isLoading: true,
      });

      render(
        <RoleGuard allowedRoles={['admin']}>
          <div>Protected Content</div>
        </RoleGuard>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should show custom fallback during loading', () => {
      mockUseUser.mockReturnValue({
        role: null,
        isLoading: true,
      });

      render(
        <RoleGuard allowedRoles={['admin']} fallback={<div>Custom Loading</div>}>
          <div>Protected Content</div>
        </RoleGuard>
      );

      expect(screen.getByText('Custom Loading')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('when user has allowed role', () => {
    it('should render children for staff when staff is allowed', () => {
      mockUseUser.mockReturnValue({
        role: 'staff' as UserRole,
        isLoading: false,
      });

      render(
        <RoleGuard allowedRoles={['staff']}>
          <div>Protected Content</div>
        </RoleGuard>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should render children for manager when manager is allowed', () => {
      mockUseUser.mockReturnValue({
        role: 'manager' as UserRole,
        isLoading: false,
      });

      render(
        <RoleGuard allowedRoles={['manager', 'admin', 'super_admin']}>
          <div>Protected Content</div>
        </RoleGuard>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should render children for admin when admin is allowed', () => {
      mockUseUser.mockReturnValue({
        role: 'admin' as UserRole,
        isLoading: false,
      });

      render(
        <RoleGuard allowedRoles={['admin', 'super_admin']}>
          <div>Protected Content</div>
        </RoleGuard>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should render children for super_admin when super_admin is allowed', () => {
      mockUseUser.mockReturnValue({
        role: 'super_admin' as UserRole,
        isLoading: false,
      });

      render(
        <RoleGuard allowedRoles={['admin', 'super_admin']}>
          <div>Protected Content</div>
        </RoleGuard>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('when user has unauthorized role', () => {
    it('should redirect staff when trying to access admin content', () => {
      mockUseUser.mockReturnValue({
        role: 'staff' as UserRole,
        isLoading: false,
      });

      render(
        <RoleGuard allowedRoles={['admin', 'super_admin']}>
          <div>Protected Content</div>
        </RoleGuard>
      );

      expect(mockReplace).toHaveBeenCalledWith('/entry?access=denied');
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should redirect manager when trying to access admin content', () => {
      mockUseUser.mockReturnValue({
        role: 'manager' as UserRole,
        isLoading: false,
      });

      render(
        <RoleGuard allowedRoles={['admin', 'super_admin']}>
          <div>Protected Content</div>
        </RoleGuard>
      );

      expect(mockReplace).toHaveBeenCalledWith('/entry?access=denied');
    });

    it('should redirect staff when trying to access team content', () => {
      mockUseUser.mockReturnValue({
        role: 'staff' as UserRole,
        isLoading: false,
      });

      render(
        <RoleGuard allowedRoles={['manager', 'admin', 'super_admin']}>
          <div>Team Content</div>
        </RoleGuard>
      );

      expect(mockReplace).toHaveBeenCalledWith('/entry?access=denied');
    });
  });

  describe('when user has no role', () => {
    it('should redirect when role is null', () => {
      mockUseUser.mockReturnValue({
        role: null,
        isLoading: false,
      });

      render(
        <RoleGuard allowedRoles={['staff']}>
          <div>Protected Content</div>
        </RoleGuard>
      );

      expect(mockReplace).toHaveBeenCalledWith('/entry?access=denied');
    });
  });

  describe('with custom fallback', () => {
    it('should show fallback for unauthorized users', () => {
      mockUseUser.mockReturnValue({
        role: 'staff' as UserRole,
        isLoading: false,
      });

      render(
        <RoleGuard allowedRoles={['admin']} fallback={<div>No Access</div>}>
          <div>Protected Content</div>
        </RoleGuard>
      );

      expect(screen.getByText('No Access')).toBeInTheDocument();
    });
  });
});
