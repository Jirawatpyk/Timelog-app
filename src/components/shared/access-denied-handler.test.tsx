import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { AccessDeniedHandler } from './access-denied-handler';
import { toast } from 'sonner';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

// Mock next/navigation
const mockReplace = vi.fn();
const mockGet = vi.fn();
const mockToString = vi.fn();

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: mockGet,
    toString: mockToString,
  }),
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: () => '/entry',
}));

describe('AccessDeniedHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockToString.mockReturnValue('access=denied');
  });

  it('should show toast when access=denied query param is present', async () => {
    mockGet.mockReturnValue('denied');

    render(<AccessDeniedHandler />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Access Denied', {
        description: 'You do not have permission to access that page.',
        duration: 4000,
      });
    });
  });

  it('should clean up URL after showing toast', async () => {
    mockGet.mockReturnValue('denied');

    render(<AccessDeniedHandler />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/entry', { scroll: false });
    });
  });

  it('should not show toast when access param is not denied', () => {
    mockGet.mockReturnValue(null);

    render(<AccessDeniedHandler />);

    expect(toast.error).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('should not show toast when access param has different value', () => {
    mockGet.mockReturnValue('granted');

    render(<AccessDeniedHandler />);

    expect(toast.error).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('should render null (no visible content)', () => {
    mockGet.mockReturnValue(null);

    const { container } = render(<AccessDeniedHandler />);

    expect(container.firstChild).toBeNull();
  });
});
