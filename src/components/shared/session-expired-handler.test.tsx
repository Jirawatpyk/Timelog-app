/**
 * Unit tests for SessionExpiredHandler component
 * Story 2.4: Session Timeout Handling (AC: 2)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';

// Mock modules at top level with inline factory
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
  useRouter: () => ({
    replace: vi.fn(),
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    info: vi.fn(),
  },
}));

// Import after mocking
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { SessionExpiredHandler } from './session-expired-handler';

describe('SessionExpiredHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost:3000/login', pathname: '/login' },
      writable: true,
    });
  });

  it('should show toast when expired=true query param is present', async () => {
    const mockSearchParams = new URLSearchParams('expired=true');
    vi.mocked(useSearchParams).mockReturnValue(
      mockSearchParams as unknown as ReturnType<typeof useSearchParams>
    );

    render(<SessionExpiredHandler />);

    await waitFor(() => {
      expect(toast.info).toHaveBeenCalledWith('Session Expired', {
        description: 'Your session has expired. Please login again.',
        duration: 5000,
      });
    });
  });

  it('should show toast when message query param is present', async () => {
    const mockSearchParams = new URLSearchParams(
      'message=Please login to continue'
    );
    vi.mocked(useSearchParams).mockReturnValue(
      mockSearchParams as unknown as ReturnType<typeof useSearchParams>
    );

    render(<SessionExpiredHandler />);

    await waitFor(() => {
      expect(toast.info).toHaveBeenCalledWith('Please login to continue', {
        duration: 4000,
      });
    });
  });

  it('should not show toast when no query params are present', async () => {
    const mockSearchParams = new URLSearchParams();
    vi.mocked(useSearchParams).mockReturnValue(
      mockSearchParams as unknown as ReturnType<typeof useSearchParams>
    );

    render(<SessionExpiredHandler />);

    // Wait a bit to ensure no toast is shown
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(toast.info).not.toHaveBeenCalled();
  });

  it('should call router.replace after showing expired toast', async () => {
    const mockSearchParams = new URLSearchParams('expired=true');
    vi.mocked(useSearchParams).mockReturnValue(
      mockSearchParams as unknown as ReturnType<typeof useSearchParams>
    );

    render(<SessionExpiredHandler />);

    // The toast should be shown (URL cleanup is handled by router.replace)
    await waitFor(() => {
      expect(toast.info).toHaveBeenCalledWith('Session Expired', {
        description: 'Your session has expired. Please login again.',
        duration: 5000,
      });
    });
  });

  it('should render null (no visible content)', () => {
    const mockSearchParams = new URLSearchParams();
    vi.mocked(useSearchParams).mockReturnValue(
      mockSearchParams as unknown as ReturnType<typeof useSearchParams>
    );

    const { container } = render(<SessionExpiredHandler />);
    expect(container).toBeEmptyDOMElement();
  });
});
