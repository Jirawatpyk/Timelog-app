# Epic 6 Retrospective: Team Dashboard

**Date:** 2026-01-04
**Facilitator:** Bob (Scrum Master)
**Participants:** Jiraw

---

## Epic Summary

| Metric | Value |
|--------|-------|
| **Epic Name** | Team Dashboard |
| **Stories Total** | 6 |
| **Stories Completed** | 6 (100%) |
| **Epic Goal** | Managers see team compliance status and hours in near real-time |
| **FRs Covered** | FR23-FR27 |

---

## Stories Completed

| Story | Title | Status |
|-------|-------|--------|
| 6.1 | Team Dashboard Layout | Done |
| 6.2 | Team Members Who Logged Today | Done |
| 6.3 | Team Members Who Haven't Logged Today | Done |
| 6.4 | Aggregated Team Hours | Done |
| 6.5 | Multi-Department Support | Done |
| 6.6 | Near Real-Time Updates | Done |

---

## What Went Well

### 1. Server Component + Client Hybrid Architecture Success

Successfully combined Server Components with client-side polling without violating architecture constraints.

- **Data fetching**: Server Components fetch initial data
- **Real-time updates**: Client wrapper uses `router.refresh()` for polling
- **No TanStack Query**: Maintained architecture rule (TanStack Query only for Entry page)

**Pattern Established:**
```typescript
// Server Component (page.tsx) fetches data
// Client wrapper (TeamDashboardClient.tsx) handles polling
// router.refresh() re-fetches Server Component data
```

### 2. Comprehensive Polling System

Story 6.6 delivered a production-ready polling implementation:

| Feature | Implementation |
|---------|---------------|
| **Auto-refresh** | Every 30 seconds via `POLLING_INTERVAL_MS` |
| **Tab visibility** | Pauses when tab hidden, resumes on return |
| **Pull-to-refresh** | Mobile gesture support via `@use-gesture/react` |
| **Silent errors** | Network failures don't disrupt UX |
| **Last updated** | Subtle timestamp indicator in TeamHeader |

**Reusable Hook**: `usePolling()` in `src/hooks/use-polling.ts`

### 3. Multi-Department Manager Support Done Right

Story 6.5 cleanly handles the complex manager_departments junction:

- **Conditional filter**: Only shows when manager has 2+ departments
- **URL state**: `?dept=xxx` for shareable, bookmarkable views
- **Department badges**: Appear on cards when viewing "All Departments"
- **ActionResult pattern**: `getManagerDepartments()` follows established pattern

### 4. UX Design Alignment - Non-Alarming UI

Followed UX spec's emphasis on "supportive, not punitive" design:

| Scenario | UI Treatment |
|----------|-------------|
| **8+ hours logged** | Green text + checkmark (celebration) |
| **< 8 hours logged** | Neutral styling (no judgment) |
| **Not logged (before 5 PM)** | Neutral, no indicator |
| **Not logged (after 5 PM)** | Subtle orange dot (gentle nudge) |
| **Everyone logged** | PartyPopper icon + "Great job, team!" |

### 5. Consistent English UI Throughout

All 6 stories maintained English UI per `project-context.md`:
- "Team Dashboard", "Logged Today", "Not Logged"
- "All Departments", "hrs total", "avg/person"
- Compliance rate, period labels, empty states

### 6. Comprehensive Testing

| Category | Tests Added |
|----------|-------------|
| Unit Tests (Components) | 137 |
| Unit Tests (Queries) | 23 |
| Hook Tests (usePolling) | 12 |
| E2E Tests | 35+ scenarios |
| **Final Total** | 1,477 tests (127 files) |

### 7. Code Review Rigor Maintained

Every story underwent adversarial code review:

| Story | Issues Found | Issues Fixed |
|-------|--------------|--------------|
| 6.1 | 6 | 6 (100%) |
| 6.2 | 6 | 6 (100%) |
| 6.3 | 7 | 7 (100%) |
| 6.4 | 10 | 10 (100%) |
| 6.5 | 8 | 8 (100%) |
| 6.6 | 1 | 1 (100%) |

---

## What Could Be Improved

### 1. Timezone Bug Discovered and Fixed

**Issue**: Dashboard "Today" tab showed yesterday's entries in UTC+ timezones.

**Root Cause**:
```typescript
// Problem: toISOString() converts to UTC
const today = new Date().toISOString().split('T')[0];
// Thailand (UTC+7): Jan 4, 2:00 AM -> "2026-01-03" (wrong!)
```

**Fix Applied**:
```typescript
// Solution: Format in local timezone
export function formatLocalDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
```

**Status**: FIXED in `src/lib/utils.ts`

**Recommendation**: Add to CLAUDE.md as common gotcha for date handling.

### 2. Type Naming Collision Issue

**Issue**: Two different `ManagerDepartment` types existed causing confusion.

**Fix**: Renamed interface to `DepartmentOption` to distinguish from DB row type.

**Recommendation**: Establish naming convention:
- `*Option` for UI/component types
- `*Row` for DB types (auto-generated)

### 3. Supabase Join Type Inference Limitation

**Issue**: Supabase client doesn't correctly infer types for join queries.

**Workaround**:
```typescript
const data = result.data as unknown as TypeRow[];
```

**Status**: Known SDK limitation, documented for future reference.

### 4. Pull-to-Refresh Library Conflict

**Issue**: `@use-gesture/react` onDrag conflicted with `framer-motion` motion.div.

**Fix**: Used regular `<div>` for gesture area instead of `<motion.div>`.

### 5. E2E Test Authentication Complexity

**Issue**: Initial E2E tests didn't properly authenticate as manager role.

**Fix**: Added proper manager authentication helpers to E2E test setup.

---

## Key Technical Patterns Established

### 1. Team Dashboard Architecture

```
/team (Server Component)
 ├── checkManagerAccess() - Role verification
 ├── getManagerDepartments() - Fetch departments
 ├── getTeamMembersWithTodayStats() - Fetch team data
 └── TeamDashboardClient (Client wrapper)
      ├── usePolling() - 30s auto-refresh
      ├── PullToRefresh - Mobile gesture
      └── TeamDashboard - Render content
           ├── TeamHeader (Last updated)
           ├── DepartmentFilter (if multi-dept)
           ├── TeamPeriodSelector
           ├── TeamStatsCard
           ├── LoggedMembersList
           └── NotLoggedMembersList
```

### 2. Polling Hook Pattern

```typescript
// src/hooks/use-polling.ts
export function usePolling(onPoll: () => void, interval = POLLING_INTERVAL_MS) {
  // Features:
  // - Interval execution
  // - Tab visibility pause/resume
  // - Immediate refresh on tab return
  // - Cleanup on unmount
  return { lastUpdated, reset };
}
```

### 3. Time-Based Indicator Pattern

```typescript
// src/lib/utils/time-indicator.ts
export function getTimeOfDayIndicator(): 'neutral' | 'warning' {
  const hour = new Date().getHours();
  return hour >= 17 ? 'warning' : 'neutral';
}
```

### 4. URL State for Team Filters

```typescript
// URL params for Team Dashboard:
// ?period=today|week     - Period selection
// ?dept=uuid|all         - Department filter
// Both preserved on navigation, shareable URLs
```

### 5. Local Date Formatting (Timezone-Safe)

```typescript
// src/lib/utils.ts
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```

---

## Files Created/Modified

### New Files (20+)

**Components:**
- `src/components/team/TeamDashboard.tsx`
- `src/components/team/TeamDashboardClient.tsx`
- `src/components/team/TeamStatsCard.tsx`
- `src/components/team/TeamHeader.tsx`
- `src/components/team/TeamPeriodSelector.tsx`
- `src/components/team/TeamErrorState.tsx`
- `src/components/team/TeamDashboardSkeleton.tsx`
- `src/components/team/EmptyTeamState.tsx`
- `src/components/team/LoggedMemberCard.tsx`
- `src/components/team/LoggedMembersList.tsx`
- `src/components/team/NotLoggedMemberCard.tsx`
- `src/components/team/NotLoggedMembersList.tsx`
- `src/components/team/MemberAvatar.tsx`
- `src/components/team/DepartmentFilter.tsx`
- `src/components/team/WeeklyBreakdown.tsx`
- `src/components/shared/PullToRefresh.tsx`

**Hooks:**
- `src/hooks/use-polling.ts`

**Queries:**
- `src/lib/queries/team.ts` (extended)

**Utils:**
- `src/lib/utils/time-indicator.ts`

**Types:**
- `src/types/team.ts`

**Routes:**
- `src/app/(app)/team/page.tsx`
- `src/app/(app)/team/components/TeamDataProvider.tsx`

---

## Action Items

| # | Action Item | Priority | Owner | Status |
|---|-------------|----------|-------|--------|
| 1 | Add `formatLocalDate()` pattern to CLAUDE.md | High | Dev | ✅ Done |
| 2 | Add type naming convention (`*Option` vs `*Row`) to guidelines | Medium | Dev | ✅ Done |
| 3 | Document manager E2E authentication pattern in test helpers | Medium | Dev | ✅ Done |
| 4 | Document Supabase join type workaround in CLAUDE.md | Low | Dev | ✅ Done |

### Action Items Completion Notes (2026-01-04)

**Item 1-2**: Added to CLAUDE.md in "Date Handling" and "Type Naming Convention" sections.

**Item 3**: Created `test/helpers/e2e-auth.ts` with:
- `loginAsStaff()`, `loginAsManager()`, `loginAsAdmin()`, `loginAsSuperAdmin()`
- `navigateAsManager(page, '/path')` - combined login + navigate
- `TEST_CREDENTIALS` constant for credential management
- Full JSDoc documentation

**Item 4**: Added "Supabase Join Query Type Workaround" section to CLAUDE.md documenting:
- Known SDK limitation with join type inference
- `as unknown as Type[]` workaround pattern
- When to use each solution approach

---

## Preparation for Epic 7: Admin Panel

### Current Status (from sprint-status.yaml)
- Story 7.1 (User List View): Done
- Stories 7.2-7.6: Ready for dev

### Reusable Patterns from Epic 6
1. **Server Component pattern** - Same architecture
2. **Role-based access control** - Extend to admin/super_admin only
3. **URL state management** - For filters and pagination
4. **DataTable patterns** - For user/master data lists
5. **Code review rigor** - Maintain adversarial review

### Key Differences for Epic 7
- Admin-only access (stricter than manager)
- CRUD operations on master data (not just viewing)
- Audit logging requirements
- More complex form validation

---

## Retrospective Status

**Epic 6 Retrospective: COMPLETE**

All 6 stories delivered with:
- ✅ 100% Acceptance Criteria met
- ✅ 200+ new tests written (all passing)
- ✅ English UI per project standards
- ✅ Code review completed for all stories
- ✅ Server Component + Polling hybrid architecture
- ✅ Zero regressions (1,477 total tests passing)

---

*Generated by BMAD Scrum Master Agent*
