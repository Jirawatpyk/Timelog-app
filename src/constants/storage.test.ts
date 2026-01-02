import { describe, it, expect } from 'vitest';
import { DRAFT_KEYS, DRAFT_EXPIRY_MS, DRAFT_SAVE_DEBOUNCE_MS } from './storage';

describe('storage constants', () => {
  describe('DRAFT_KEYS', () => {
    it('has_entry_key', () => {
      expect(DRAFT_KEYS.entry).toBe('draft-entry');
    });

    it('generates_editEntry_key_with_id', () => {
      expect(DRAFT_KEYS.editEntry('abc-123')).toBe('draft-entry-abc-123');
    });

    it('generates_unique_editEntry_keys_for_different_ids', () => {
      const key1 = DRAFT_KEYS.editEntry('id-1');
      const key2 = DRAFT_KEYS.editEntry('id-2');
      expect(key1).not.toBe(key2);
    });
  });

  describe('DRAFT_EXPIRY_MS', () => {
    it('equals_24_hours_in_milliseconds', () => {
      const expectedMs = 24 * 60 * 60 * 1000;
      expect(DRAFT_EXPIRY_MS).toBe(expectedMs);
    });
  });

  describe('DRAFT_SAVE_DEBOUNCE_MS', () => {
    it('equals_2_seconds_in_milliseconds', () => {
      expect(DRAFT_SAVE_DEBOUNCE_MS).toBe(2000);
    });
  });
});
