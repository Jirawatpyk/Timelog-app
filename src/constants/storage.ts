export const DRAFT_KEYS = {
  entry: 'draft-entry',
  editEntry: (id: string) => `draft-entry-${id}`,
} as const;
