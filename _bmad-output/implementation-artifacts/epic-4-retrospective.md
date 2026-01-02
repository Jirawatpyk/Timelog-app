# Epic 4 Retrospective: Quick Time Entry

**Date:** 2026-01-02
**Facilitator:** Bob (Scrum Master)
**Participants:** Jiraw

---

## Epic Summary

| Metric | Value |
|--------|-------|
| **Epic Name** | Quick Time Entry |
| **Stories Total** | 12 |
| **Stories Completed** | 12 (100%) |
| **Epic Goal** | "เห็นแล้วอยากลง log" - บันทึกเวลาใน <30 วินาที |
| **FRs Covered** | FR7-FR16, FR44, FR46 |

---

## Stories Completed

| Story | Title | Status |
|-------|-------|--------|
| 4.1 | Bottom Navigation Component | Done |
| 4.2 | Time Entry Form - Cascading Selectors | Done |
| 4.3 | Time Entry Form - Service, Task & Duration | Done |
| 4.4 | Time Entry Form - Date Selection & Submission | Done |
| 4.5 | Edit Own Time Entry | Done |
| 4.6 | Delete Own Time Entry | Done |
| 4.7 | Recent Combinations Quick Entry | Done |
| 4.8 | Form Validation & Error States | Done |
| 4.9 | Skeleton Loading States | Done |
| 4.10 | Form Draft Auto-Save | Done |
| 4.11 | Desktop Sidebar Navigation | Done |
| 4.12 | Desktop Header Enhancement | Done |

---

## What Went Well

### 1. Reusable Patterns Created

- **ActionResult<T>** - Consistent server action return type used across all actions
- **useDraftPersistence hook** - Reusable draft management with sessionStorage
- **canEditEntry() / canDeleteEntry()** - Business rule utilities in `lib/entry-rules.ts`
- **RoleBadge component** - 4 role variants with dark mode support
- **LoadingError component** - Standardized error state with retry functionality

### 2. Code Review Process Effective

| Story | Code Review Finding | Fix Applied |
|-------|---------------------|-------------|
| 4.2 | Missing UUID validation | Added to server actions |
| 4.5 | Missing RecentEntries tests | Added comprehensive tests |
| 4.7 | Missing E2E tests | Created E2E test suite |
| 4.11 | Missing aria-current attribute | Added for accessibility |
| 4.12 | Missing dark mode support | Added dark mode variants |

### 3. Technical Decisions Validated

- **TanStack Query on Entry page only** - Per Architecture document constraint
- **sessionStorage for drafts** - Doesn't persist across sessions (intentional)
- **Snake_case to camelCase transformation** - Clean domain layer
- **Co-located test files** - Easy to maintain alongside source

### 4. Cascading Selector Pattern

The Client → Project → Job cascading pattern with TanStack Query works well:
- Query invalidation on parent change
- Disabled state management
- Loading states per selector

---

## What Could Be Improved

### 1. Test Infrastructure Issues

- Story 4.2 has 14 failing tests from cascading selector mock issues
- Radix UI components require extensive mocking
- Test setup complexity increasing

### 2. Draft Code Organization ✅ RESOLVED

~~Draft-related code is spread across multiple locations.~~

**Resolution:** Consolidated into `src/lib/draft/` module:
```
src/lib/draft/
├── types.ts       - FormDraft<T> interface
├── constants.ts   - DRAFT_KEYS, DRAFT_EXPIRY_MS, DRAFT_SAVE_DEBOUNCE_MS
├── utils.ts       - cleanupExpiredDrafts(), hasDraft(), getDraftAge()
├── use-draft-persistence.ts - React hook
└── index.ts       - Barrel exports
```

Import: `import { useDraftPersistence, DRAFT_KEYS } from '@/lib/draft';`

### 3. Epic 3 Action Items Still Pending

From Epic 3 retrospective, 4 action items remain incomplete:

| # | Action Item | Status |
|---|-------------|--------|
| 1 | Create Generic CRUD Factory `createMasterDataList<T>()` | PENDING |
| 2 | Create Test Helpers for Master Data CRUD | PENDING |
| 3 | Document Radix UI Mock Rationale in test/setup.ts | PENDING |
| 4 | Add Library Selection Criteria to CLAUDE.md | PENDING |

---

## Key Technical Patterns Established

### 1. Server Action Pattern
```typescript
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

### 2. Draft Persistence Pattern
```typescript
// Import from consolidated module: src/lib/draft/
import { useDraftPersistence, DRAFT_KEYS, cleanupExpiredDrafts } from '@/lib/draft';

// Usage in form component
const { clearDraft } = useDraftPersistence({
  form,
  storageKey: DRAFT_KEYS.entry, // or DRAFT_KEYS.editEntry(id)
});

// Constants (24h expiry, 2s debounce)
// DRAFT_EXPIRY_MS = 86,400,000
// DRAFT_SAVE_DEBOUNCE_MS = 2,000
```

### 3. Edit Window Business Rule
```typescript
export const EDIT_WINDOW_DAYS = 7;

export function canEditEntry(entryDate: string): boolean {
  const entry = new Date(entryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cutoffDate = new Date(today);
  cutoffDate.setDate(cutoffDate.getDate() - EDIT_WINDOW_DAYS);
  return entry >= cutoffDate;
}
```

### 4. Recent Combinations Pattern
- Max 5 combinations per user
- Deduplicated by job_id + service_id + task_id
- Updated on entry save (upsert with last_used_at)

---

## Action Items for Epic 4

| # | Action Item | Priority | Owner | Status |
|---|-------------|----------|-------|--------|
| 1 | Fix 14 failing tests from Story 4.2 (cascading selector mocks) | High | Dev | ✅ DONE |
| 2 | Complete Epic 3 pending action items (4 items) | Medium | Team | ✅ DONE |
| 3 | Consolidate draft-related code into single module | Low | Dev | ✅ DONE |
| 4 | Document TanStack Query usage pattern in CLAUDE.md | Medium | Tech Writer | ✅ DONE |

### Completed Action Items Details

**Action Item #1:** Fixed cascading selector tests
- Tests now passing (1059+ total tests)
- Radix UI mocks properly configured in test/setup.ts

**Action Item #2:** All Epic 3 action items completed (see epic-3-retrospective.md):
- ✅ Generic CRUD Factory `createListFetcher<T>()` in `src/lib/master-data/`
- ✅ Test Helpers in `test/helpers/master-data.ts`
- ✅ Radix UI Mock Rationale documented in `test/setup.ts`
- ✅ Library Selection Criteria added to `CLAUDE.md`

**Action Item #3:** Created `src/lib/draft/` consolidated module with:
- types.ts, constants.ts, utils.ts, use-draft-persistence.ts, index.ts
- 22 unit tests (constants: 5, utils: 9, hook: 8)
- Updated CLAUDE.md and project-context.md

**Action Item #4:** Added TanStack Query v5 section to CLAUDE.md with:
- Provider setup pattern
- Query hook pattern with enabled option
- Optimistic updates pattern
- Query key conventions table
- Anti-patterns section

---

## Preparation for Epic 5: Personal Dashboard

### Overview
- **Goal:** Employees เห็น entries ของตัวเอง พร้อม stats และ filter/search
- **Stories:** 8 (5.1 - 5.8)
- **Key Pattern:** Server Components (NOT TanStack Query per Architecture)

### Stories Preview

| Story | Feature |
|-------|---------|
| 5.1 | Dashboard Layout & Period Selector (วันนี้/สัปดาห์/เดือน) |
| 5.2 | Today's Entries View |
| 5.3 | Weekly Entries View (grouped by date) |
| 5.4 | Monthly Entries View (grouped by week) |
| 5.5 | Total Hours Statistics |
| 5.6 | Filter by Client |
| 5.7 | Search Entries |
| 5.8 | Empty States |

### Technical Considerations
- Use Server Components for data fetching
- Period selector via URL query params (?period=week)
- Virtualized list for monthly view (>50 entries)
- Reuse EntryDetailsSheet from Epic 4
- Thai date formatting (e.g., "31 ธ.ค. 2567")

---

## Retrospective Status

**Epic 4 Retrospective: COMPLETE**

---

*Generated by BMAD Scrum Master Agent*
