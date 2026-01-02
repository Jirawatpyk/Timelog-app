import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  cleanupExpiredDrafts,
  hasDraft,
  getDraftAge,
} from './utils';
import { DRAFT_KEYS, DRAFT_EXPIRY_MS } from './constants';

describe('draft-utils', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('cleanupExpiredDrafts', () => {
    it('removes_expired_entry_draft', () => {
      const expiredDraft = {
        data: { name: 'old' },
        savedAt: Date.now() - DRAFT_EXPIRY_MS - 1000, // 24h + 1s ago
        version: 1,
      };
      sessionStorage.setItem(DRAFT_KEYS.entry, JSON.stringify(expiredDraft));

      cleanupExpiredDrafts();

      expect(sessionStorage.getItem(DRAFT_KEYS.entry)).toBeNull();
    });

    it('keeps_valid_entry_draft', () => {
      const validDraft = {
        data: { name: 'recent' },
        savedAt: Date.now() - 1000, // 1 second ago
        version: 1,
      };
      sessionStorage.setItem(DRAFT_KEYS.entry, JSON.stringify(validDraft));

      cleanupExpiredDrafts();

      expect(sessionStorage.getItem(DRAFT_KEYS.entry)).not.toBeNull();
    });

    it('removes_expired_edit_drafts', () => {
      const expiredDraft = {
        data: {},
        savedAt: Date.now() - DRAFT_EXPIRY_MS - 1000,
        version: 1,
      };
      sessionStorage.setItem(
        DRAFT_KEYS.editEntry('uuid-123'),
        JSON.stringify(expiredDraft)
      );
      sessionStorage.setItem(
        DRAFT_KEYS.editEntry('uuid-456'),
        JSON.stringify(expiredDraft)
      );

      cleanupExpiredDrafts();

      expect(sessionStorage.getItem(DRAFT_KEYS.editEntry('uuid-123'))).toBeNull();
      expect(sessionStorage.getItem(DRAFT_KEYS.editEntry('uuid-456'))).toBeNull();
    });

    it('removes_invalid_JSON_drafts', () => {
      sessionStorage.setItem(DRAFT_KEYS.entry, 'invalid{json');

      cleanupExpiredDrafts();

      expect(sessionStorage.getItem(DRAFT_KEYS.entry)).toBeNull();
    });
  });

  describe('hasDraft', () => {
    it('returns_true_when_draft_exists', () => {
      sessionStorage.setItem('test-key', '{}');

      expect(hasDraft('test-key')).toBe(true);
    });

    it('returns_false_when_draft_does_not_exist', () => {
      expect(hasDraft('nonexistent-key')).toBe(false);
    });
  });

  describe('getDraftAge', () => {
    it('returns_age_in_minutes', () => {
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      const draft = { data: {}, savedAt: fiveMinutesAgo, version: 1 };
      sessionStorage.setItem('test-key', JSON.stringify(draft));

      expect(getDraftAge('test-key')).toBe(5);
    });

    it('returns_null_for_nonexistent_draft', () => {
      expect(getDraftAge('nonexistent')).toBeNull();
    });

    it('returns_null_for_invalid_JSON', () => {
      sessionStorage.setItem('bad-key', 'not json');

      expect(getDraftAge('bad-key')).toBeNull();
    });
  });
});
