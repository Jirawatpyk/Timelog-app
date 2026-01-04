import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StatusToggleButton } from './StatusToggleButton';
import { deactivateUser, reactivateUser } from '@/actions/user';
import { toast } from 'sonner';

// Mock server actions
vi.mock('@/actions/user', () => ({
  deactivateUser: vi.fn(),
  reactivateUser: vi.fn(),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

describe('StatusToggleButton (Story 7.4)', () => {
  const defaultProps = {
    userId: 'user-123',
    isActive: true,
    userName: 'John Doe',
    currentUserId: 'admin-456',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows "Deactivate" for active users (AC 1)', () => {
    render(<StatusToggleButton {...defaultProps} isActive={true} />);

    expect(screen.getByRole('button', { name: /deactivate/i })).toBeInTheDocument();
  });

  it('shows "Reactivate" for inactive users (AC 3)', () => {
    render(<StatusToggleButton {...defaultProps} isActive={false} />);

    expect(screen.getByRole('button', { name: /reactivate/i })).toBeInTheDocument();
  });

  it('uses red/destructive style for deactivate button', () => {
    render(<StatusToggleButton {...defaultProps} isActive={true} />);

    const button = screen.getByRole('button', { name: /deactivate/i });
    // Check for destructive variant (red color)
    expect(button).toHaveClass('text-destructive');
  });

  it('uses green style for reactivate button', () => {
    render(<StatusToggleButton {...defaultProps} isActive={false} />);

    const button = screen.getByRole('button', { name: /reactivate/i });
    // Check for green color class
    expect(button).toHaveClass('text-green-600');
  });

  it('opens confirmation dialog when clicking deactivate (AC 1)', () => {
    render(<StatusToggleButton {...defaultProps} isActive={true} />);

    fireEvent.click(screen.getByRole('button', { name: /deactivate/i }));

    // Dialog should appear with confirmation message
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText(/deactivate this user/i)).toBeInTheDocument();
  });

  it('shows user name in confirmation dialog', () => {
    render(<StatusToggleButton {...defaultProps} isActive={true} userName="John Doe" />);

    fireEvent.click(screen.getByRole('button', { name: /deactivate/i }));

    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
  });

  it('reactivates directly without confirmation', async () => {
    vi.mocked(reactivateUser).mockResolvedValue({ success: true, data: {} as never });

    render(<StatusToggleButton {...defaultProps} isActive={false} />);

    fireEvent.click(screen.getByRole('button', { name: /reactivate/i }));

    await waitFor(() => {
      expect(reactivateUser).toHaveBeenCalledWith('user-123');
    });
    expect(toast.success).toHaveBeenCalledWith('User reactivated');
  });

  it('calls deactivateUser after confirmation (AC 2)', async () => {
    vi.mocked(deactivateUser).mockResolvedValue({ success: true, data: {} as never });

    render(<StatusToggleButton {...defaultProps} isActive={true} />);

    // Open dialog
    fireEvent.click(screen.getByRole('button', { name: /deactivate/i }));

    // Confirm deactivation
    fireEvent.click(screen.getByRole('button', { name: /^deactivate$/i }));

    await waitFor(() => {
      expect(deactivateUser).toHaveBeenCalledWith('user-123');
    });
    expect(toast.success).toHaveBeenCalledWith('User deactivated');
  });

  it('closes dialog when clicking cancel', () => {
    render(<StatusToggleButton {...defaultProps} isActive={true} />);

    // Open dialog
    fireEvent.click(screen.getByRole('button', { name: /deactivate/i }));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();

    // Cancel
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('shows error toast on deactivation failure', async () => {
    vi.mocked(deactivateUser).mockResolvedValue({
      success: false,
      error: 'Cannot deactivate Super Admin',
    });

    render(<StatusToggleButton {...defaultProps} isActive={true} />);

    // Open dialog and confirm
    fireEvent.click(screen.getByRole('button', { name: /deactivate/i }));
    fireEvent.click(screen.getByRole('button', { name: /^deactivate$/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Cannot deactivate Super Admin');
    });
  });

  it('shows error toast on reactivation failure', async () => {
    vi.mocked(reactivateUser).mockResolvedValue({
      success: false,
      error: 'Failed to reactivate user',
    });

    render(<StatusToggleButton {...defaultProps} isActive={false} />);

    fireEvent.click(screen.getByRole('button', { name: /reactivate/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to reactivate user');
    });
  });

  it('is disabled when trying to deactivate self (AC 5)', () => {
    render(
      <StatusToggleButton
        {...defaultProps}
        userId="same-user"
        currentUserId="same-user"
        isActive={true}
      />
    );

    const button = screen.getByRole('button', { name: /deactivate/i });
    expect(button).toBeDisabled();
  });
});
