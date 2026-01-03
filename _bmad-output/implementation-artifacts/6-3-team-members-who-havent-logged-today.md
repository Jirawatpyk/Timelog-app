# Story 6.3: Team Members Who Haven't Logged Today

Status: done

## Story

As a **manager**,
I want **to see which team members haven't logged time today**,
So that **I can follow up if needed**.

## Acceptance Criteria

1. **AC1: Not Logged Section Display**
   - Given I am on the team dashboard
   - When viewing the "Not Logged" section
   - Then I see a list of team members with 0 entries today
   - And the section header shows count: "Not Logged (X people)"

2. **AC2: Member Row Information**
   - Given a team member has not logged today
   - When viewing their row in the list
   - Then I see: Member name (display_name) only
   - And I do NOT see hours (there are none)
   - And I see their avatar/initial

3. **AC3: Alphabetical Sorting**
   - Given multiple members haven't logged today
   - When viewing the list
   - Then members are sorted alphabetically by name
   - And this helps managers find specific people

4. **AC4: Time-Based Styling - Before Noon**
   - Given it's before 12:00 PM (noon)
   - When viewing the "Not Logged" section
   - Then members show with neutral styling
   - And NO warning indicators shown
   - And this reflects "it's still early"

5. **AC5: Time-Based Styling - After 5 PM**
   - Given it's after 5:00 PM (17:00)
   - When viewing the "Not Logged" section
   - Then members show with subtle orange dot indicator
   - And NO aggressive alerting (red, exclamation, etc.)
   - And this is just a gentle visual cue

6. **AC6: All Logged Success State**
   - Given all team members have logged today
   - When viewing the "Not Logged" section
   - Then I see: "Everyone has logged!" message
   - And I see a success/celebration icon (green checkmark or party)
   - And the section feels positive, not empty

7. **AC7: Consistent with Logged Section**
   - Given both sections are visible
   - When comparing "Logged Today" and "Not Logged"
   - Then visual styling is consistent
   - And avatar sizes match
   - And card spacing is uniform

## Tasks / Subtasks

- [x] **Task 1: Create NotLoggedMemberCard Component** (AC: 2, 4, 5)
  - [x] 1.1 Create `src/components/team/NotLoggedMemberCard.tsx`
  - [x] 1.2 Display avatar/initial
  - [x] 1.3 Display name only (no hours)
  - [x] 1.4 Add optional orange dot for after 5 PM

- [x] **Task 2: Create NotLoggedMembersList Component** (AC: 1, 3, 6)
  - [x] 2.1 Create `src/components/team/NotLoggedMembersList.tsx`
  - [x] 2.2 Section header with count
  - [x] 2.3 Sort alphabetically (handled by query in team.ts)
  - [x] 2.4 All-logged success state

- [x] **Task 3: Create Time-Based Indicator Logic** (AC: 4, 5)
  - [x] 3.1 Create `getTimeOfDayIndicator()` utility
  - [x] 3.2 Return 'neutral' before noon
  - [x] 3.3 Return 'neutral' noon to 5 PM
  - [x] 3.4 Return 'warning' after 5 PM

- [x] **Task 4: Create All Logged Success Component** (AC: 6)
  - [x] 4.1 Create success state UI
  - [x] 4.2 Add celebration icon (PartyPopper)
  - [x] 4.3 Positive messaging

- [x] **Task 5: Integrate into TeamDashboard** (AC: 7)
  - [x] 5.1 Replace placeholder from 6-1
  - [x] 5.2 Pass notLogged members data
  - [x] 5.3 Ensure visual consistency

- [x] **Task 6: Unit & E2E Tests** (AC: All)
  - [x] 6.1 Test alphabetical sorting
  - [x] 6.2 Test time-based indicators
  - [x] 6.3 Test all-logged success state
  - [x] 6.4 Test member count in header

## Dev Notes

### Architecture Compliance

**Required Patterns:**
- Server Component for data (already from 6-2)
- Client Component for time-based styling (needs current time)
- No TanStack Query on Team Dashboard
- Use `@/` import aliases only

**File Locations:**
- Components: `src/components/team/NotLoggedMemberCard.tsx`, `NotLoggedMembersList.tsx`
- Utils: `src/lib/utils/time-indicator.ts`

### Time-Based Indicator Utility

```typescript
// src/lib/utils/time-indicator.ts

export type TimeIndicator = 'neutral' | 'warning';

export function getTimeOfDayIndicator(): TimeIndicator {
  const now = new Date();
  const hour = now.getHours();

  // After 5 PM (17:00) = subtle warning
  if (hour >= 17) {
    return 'warning';
  }

  // Before 5 PM = neutral (including before noon)
  return 'neutral';
}

export function isAfter5PM(): boolean {
  return new Date().getHours() >= 17;
}

export function isBeforeNoon(): boolean {
  return new Date().getHours() < 12;
}
```

### Not Logged Member Card Component

```typescript
// src/components/team/NotLoggedMemberCard.tsx
'use client';

import { MemberAvatar } from '@/components/team/MemberAvatar';
import { isAfter5PM } from '@/lib/utils/time-indicator';
import type { TeamMemberWithStats } from '@/types/team';

interface NotLoggedMemberCardProps {
  member: TeamMemberWithStats;
}

export function NotLoggedMemberCard({ member }: NotLoggedMemberCardProps) {
  const { displayName } = member;
  const showWarningDot = isAfter5PM();

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-card border">
      {/* Avatar */}
      <MemberAvatar name={displayName} size="md" />

      {/* Name only - no hours for not logged members */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{displayName}</p>
      </div>

      {/* Subtle warning dot after 5 PM only */}
      {showWarningDot && (
        <div
          className="h-2 w-2 rounded-full bg-orange-400"
          title="After 17:00 - not logged yet"
        />
      )}
    </div>
  );
}
```

### Not Logged Members List Component

```typescript
// src/components/team/NotLoggedMembersList.tsx
'use client';

import { PartyPopper } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NotLoggedMemberCard } from '@/components/team/NotLoggedMemberCard';
import type { TeamMemberWithStats } from '@/types/team';

interface NotLoggedMembersListProps {
  members: TeamMemberWithStats[];
}

export function NotLoggedMembersList({ members }: NotLoggedMembersListProps) {
  // All logged - success state!
  if (members.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="text-green-600">●</span>
            Not Logged
            <span className="text-muted-foreground font-normal">(0 people)</span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col items-center py-6 text-center">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
              <PartyPopper className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-green-700">
              Everyone has logged!
            </p>
            <p className="text-xs text-green-600 mt-1">
              Great job team!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="text-muted-foreground">○</span>
          Not Logged
          <span className="text-muted-foreground font-normal">
            ({members.length} {members.length === 1 ? 'person' : 'people'})
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {members.map((member) => (
            <NotLoggedMemberCard key={member.id} member={member} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Updated Team Dashboard

```typescript
// src/components/team/TeamDashboard.tsx
import { format } from 'date-fns';
import { TeamStatsCard } from '@/components/team/TeamStatsCard';
import { LoggedMembersList } from '@/components/team/LoggedMembersList';
import { NotLoggedMembersList } from '@/components/team/NotLoggedMembersList';
import { EmptyTeamState } from '@/components/team/EmptyTeamState';
import type { TeamMembersGrouped, ManagerDepartment } from '@/types/team';

interface TeamDashboardProps {
  departments: ManagerDepartment[];
  membersGrouped: TeamMembersGrouped;
}

export function TeamDashboard({ departments, membersGrouped }: TeamDashboardProps) {
  const today = new Date();
  const formattedDate = format(today, 'EEEE, MMMM d, yyyy');

  const totalMembers = membersGrouped.logged.length + membersGrouped.notLogged.length;

  if (totalMembers === 0) {
    return <EmptyTeamState />;
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold">Team Dashboard</h1>
        <p className="text-sm text-muted-foreground capitalize">
          {formattedDate}
        </p>
        {departments.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {departments.map((d) => d.name).join(', ')}
          </p>
        )}
      </div>

      {/* Stats Card - Story 6.4 will enhance this */}
      <TeamStatsCard
        totalMembers={totalMembers}
        loggedCount={membersGrouped.logged.length}
      />

      {/* Logged Members - Story 6.2 */}
      <LoggedMembersList members={membersGrouped.logged} />

      {/* Not Logged Members - This story */}
      <NotLoggedMembersList members={membersGrouped.notLogged} />
    </div>
  );
}
```

### Updated TeamStatsCard

```typescript
// src/components/team/TeamStatsCard.tsx - Added loggedCount prop
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck } from 'lucide-react';

interface TeamStatsCardProps {
  totalMembers: number;
  loggedCount?: number;
}

export function TeamStatsCard({ totalMembers, loggedCount }: TeamStatsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Users className="h-4 w-4" />
          Team Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{totalMembers}</span>
            <span className="text-muted-foreground">team members</span>
          </div>

          {loggedCount !== undefined && (
            <div className="flex items-center gap-2 text-sm">
              <UserCheck className="h-4 w-4 text-green-600" />
              <span>
                <span className="font-medium text-green-600">{loggedCount}</span>
                <span className="text-muted-foreground"> logged</span>
              </span>
            </div>
          )}
        </div>
        {/* Additional stats will be added in Story 6.4 */}
      </CardContent>
    </Card>
  );
}
```

### Project Structure Update

```
src/
├── components/
│   └── team/
│       ├── TeamDashboard.tsx           # MODIFIED
│       ├── TeamStatsCard.tsx           # MODIFIED (added loggedCount)
│       ├── LoggedMemberCard.tsx        # From 6-2
│       ├── LoggedMembersList.tsx       # From 6-2
│       ├── NotLoggedMemberCard.tsx     # NEW
│       ├── NotLoggedMembersList.tsx    # NEW
│       ├── TeamDashboardSkeleton.tsx
│       └── EmptyTeamState.tsx
├── lib/
│   └── utils/
│       └── time-indicator.ts           # NEW
└── types/
    └── team.ts                         # From 6-1, 6-2
```

### UX Design Alignment

**From UX Spec:**
- NO aggressive alerting for not logged
- Subtle orange dot = gentle reminder, not alarm
- "Everyone has logged!" = celebration moment
- Manager sees compliance without stress

**Visual Design:**
| Time | Indicator | Meaning |
|------|-----------|---------|
| Before noon | None | It's early |
| Noon - 5 PM | None | Working hours |
| After 5 PM | Orange dot | Gentle reminder |

**Color Palette:**
- Neutral: Default card styling
- Warning: `bg-orange-400` (dot only, very subtle)
- Success: `bg-green-100`, `text-green-600`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 6.3]
- [Source: _bmad-output/planning-artifacts/prd.md#FR25]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Team Dashboard]
- [Source: _bmad-output/implementation-artifacts/6-2-team-members-who-logged-today.md]

## Definition of Done

- [x] NotLoggedMemberCard component created
- [x] NotLoggedMembersList component created
- [x] Time-based indicator utility created
- [x] Members sorted alphabetically
- [x] Neutral styling before 5 PM
- [x] Orange dot indicator after 5 PM only
- [x] NO aggressive warning colors (red, etc.)
- [x] "Everyone has logged!" success state with icon
- [x] Count shown in section header
- [x] Name only (no hours) for not-logged members
- [x] Visual consistency with LoggedMembersList
- [x] Unit tests for time indicator
- [x] E2E tests created
- [x] Mobile-friendly layout

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

1. **Task 1 Complete:** Created NotLoggedMemberCard component with avatar, name only (no hours), and optional orange dot after 5 PM
2. **Task 2 Complete:** Created NotLoggedMembersList component with section header showing count, proper pluralization (person/people)
3. **Task 3 Complete:** Created time-indicator utility with `getTimeOfDayIndicator()`, `isAfter5PM()`, `isBeforeNoon()` functions
4. **Task 4 Complete:** Success state with PartyPopper icon, green styling, "Everyone has logged!" message
5. **Task 5 Complete:** Integrated into TeamDashboard, replaced placeholder, added loggedCount to TeamStatsCard
6. **Task 6 Complete:** Unit tests (29 tests for NotLoggedMemberCard, 14 for NotLoggedMembersList, 14 for time-indicator) and E2E test file created
7. **Config Fix:** Updated vitest.config.ts to exclude E2E tests from Vitest (they run with Playwright)
8. **Language Update:** Changed UI text from Thai to English per user request

### File List

**New Files:**
- `src/lib/utils/time-indicator.ts` - Time-based indicator utility functions
- `src/lib/utils/time-indicator.test.ts` - Unit tests for time indicator (14 tests)
- `src/components/team/NotLoggedMemberCard.tsx` - Individual card for not logged member
- `src/components/team/NotLoggedMemberCard.test.tsx` - Unit tests (15 tests)
- `src/components/team/NotLoggedMembersList.tsx` - List component with success state
- `src/components/team/NotLoggedMembersList.test.tsx` - Unit tests (14 tests)
- `test/e2e/team/not-logged-members.test.ts` - E2E tests for story 6.3

**Modified Files:**
- `src/components/team/TeamDashboard.tsx` - Integrated NotLoggedMembersList
- `src/components/team/TeamStatsCard.tsx` - Added loggedCount prop
- `src/components/team/index.ts` - Added exports for new components
- `vitest.config.ts` - Added exclude pattern for E2E tests

### Change Log

- 2026-01-03: Implemented Story 6.3 - Not Logged Members display with time-based indicators and success state
- 2026-01-03: Code Review Fixes:
  - H1: Removed unused `isBeforeNoon()` function (dead code)
  - M1: Added 5 tests for TeamStatsCard `loggedCount` prop
  - M3: Fixed pre-existing bug in `check-manager-access.test.ts` (redirect mock wasn't throwing)
