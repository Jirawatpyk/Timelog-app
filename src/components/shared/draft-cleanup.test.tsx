import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { DraftCleanup } from './draft-cleanup';
import * as draftModule from '@/lib/draft';

// Mock the draft module
vi.mock('@/lib/draft', () => ({
  cleanupExpiredDrafts: vi.fn(),
}));

describe('DraftCleanup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls_cleanupExpiredDrafts_on_mount', () => {
    render(<DraftCleanup />);

    expect(draftModule.cleanupExpiredDrafts).toHaveBeenCalledTimes(1);
  });

  it('renders_null_no_visible_output', () => {
    const { container } = render(<DraftCleanup />);

    expect(container.firstChild).toBeNull();
  });

  it('only_calls_cleanup_once_even_on_rerender', () => {
    const { rerender } = render(<DraftCleanup />);

    rerender(<DraftCleanup />);
    rerender(<DraftCleanup />);

    // useEffect with [] deps should only run once
    expect(draftModule.cleanupExpiredDrafts).toHaveBeenCalledTimes(1);
  });
});
