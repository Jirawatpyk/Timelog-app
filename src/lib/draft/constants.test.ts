import { describe, it, expect } from 'vitest';
import { DRAFT_KEYS, DRAFT_EXPIRY_MS, DRAFT_SAVE_DEBOUNCE_MS } from './constants';

describe('draft constants', () => {
  describe('DRAFT_KEYS', () => {
    it('has_entry_key', () => {
      expect(DRAFT_KEYS.entry).toBe('draft-entry');
    });

    it('editEntry_generates_unique_key_per_id', () => {
      const key1 = DRAFT_KEYS.editEntry('uuid-123');
      const key2 = DRAFT_KEYS.editEntry('uuid-456');

      expect(key1).toBe('draft-entry-uuid-123');
      expect(key2).toBe('draft-entry-uuid-456');
      expect(key1).not.toBe(key2);
    });

    it('editEntry_handles_special_characters', () => {
      const key = DRAFT_KEYS.editEntry('abc-def-123');
      expect(key).toBe('draft-entry-abc-def-123');
    });
  });

  describe('DRAFT_EXPIRY_MS', () => {
    it('equals_24_hours_in_milliseconds', () => {
      const expectedMs = 24 * 60 * 60 * 1000; // 86,400,000 ms
      expect(DRAFT_EXPIRY_MS).toBe(expectedMs);
    });
  });

  describe('DRAFT_SAVE_DEBOUNCE_MS', () => {
    it('equals_2_seconds_in_milliseconds', () => {
      expect(DRAFT_SAVE_DEBOUNCE_MS).toBe(2000);
    });
  });
});
