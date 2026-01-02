'use client';

import { useEffect } from 'react';
import { cleanupExpiredDrafts } from '@/lib/draft-utils';

/**
 * Client component to cleanup expired drafts on app initialization
 * Story 4.10: Form Draft Auto-Save
 */
export function DraftCleanup() {
  useEffect(() => {
    cleanupExpiredDrafts();
  }, []);

  return null;
}
