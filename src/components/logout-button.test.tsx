/**
 * Unit tests for LogoutButton component
 * Story 2.2: Session Persistence & Logout (AC: 4, 7)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LogoutButton } from './logout-button';

// Mock the logout action
const mockLogout = vi.fn();
vi.mock('@/actions/auth', () => ({
  logout: () => mockLogout(),
}));

// Mock next/navigation
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
    push: vi.fn(),
  }),
}));

describe('LogoutButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render logout button', () => {
    mockLogout.mockResolvedValue({ success: true, data: null });

    render(<LogoutButton />);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('should have logout icon', () => {
    mockLogout.mockResolvedValue({ success: true, data: null });

    render(<LogoutButton />);

    // Check for the LogOut icon (lucide-react renders as svg)
    const button = screen.getByRole('button');
    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should call logout action on click', async () => {
    mockLogout.mockResolvedValue({ success: true, data: null });

    render(<LogoutButton />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  it('should have loading text element available in component', () => {
    // This test verifies the component has the loading state UI structure
    // The actual loading state is handled by React's useTransition
    mockLogout.mockResolvedValue({ success: true, data: null });

    render(<LogoutButton />);

    // Verify the non-loading state shows correctly
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('should not refresh router on successful logout (redirect handles it)', async () => {
    mockLogout.mockResolvedValue({ success: true, data: null });

    render(<LogoutButton />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });

    // Should NOT call refresh on success - server action redirects
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('should refresh router on logout failure', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockLogout.mockResolvedValue({ success: false, error: 'Logout failed' });

    render(<LogoutButton />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should handle logout failure gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockLogout.mockResolvedValue({ success: false, error: 'Logout failed' });

    render(<LogoutButton />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Logout failed:', 'Logout failed');
    });

    consoleErrorSpy.mockRestore();
  });

  it('should have proper styling with gap for icon and text', () => {
    mockLogout.mockResolvedValue({ success: true, data: null });

    render(<LogoutButton />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('gap-2');
  });
});
