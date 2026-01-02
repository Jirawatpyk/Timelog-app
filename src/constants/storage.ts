export const DRAFT_KEYS = {
  entry: 'draft-entry',
  editEntry: (id: string) => `draft-entry-${id}`,
} as const;

export const DRAFT_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export const DRAFT_SAVE_DEBOUNCE_MS = 2000; // 2 seconds
