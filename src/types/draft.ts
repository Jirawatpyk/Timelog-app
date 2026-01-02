export interface FormDraft<T> {
  data: T;
  savedAt: number; // timestamp
  version: number; // for future migrations
}
