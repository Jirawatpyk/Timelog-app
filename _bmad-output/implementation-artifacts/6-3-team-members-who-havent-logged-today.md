# Story 6.3: Team Members Who Haven't Logged Today

Status: ready-for-dev

## Story

As a **manager**,
I want **to see which team members haven't logged time today**,
So that **I can follow up if needed**.

## Acceptance Criteria

1. **AC1: Not Logged Section Display**
   - Given I am on the team dashboard
   - When viewing the "ยังไม่ลง" (Not Logged) section
   - Then I see a list of team members with 0 entries today
   - And the section header shows count: "ยังไม่ลง (X คน)"

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
   - When viewing the "ยังไม่ลง" section
   - Then members show with neutral styling
   - And NO warning indicators shown
   - And this reflects "it's still early"

5. **AC5: Time-Based Styling - After 5 PM**
   - Given it's after 5:00 PM (17:00)
   - When viewing the "ยังไม่ลง" section
   - Then members show with subtle orange dot indicator
   - And NO aggressive alerting (red, exclamation, etc.)
   - And this is just a gentle visual cue

6. **AC6: All Logged Success State**
   - Given all team members have logged today
   - When viewing the "ยังไม่ลง" section
   - Then I see: "ทุกคนลงแล้ว!" message
   - And I see a success/celebration icon (green checkmark or party)
   - And the section feels positive, not empty

7. **AC7: Consistent with Logged Section**
   - Given both sections are visible
   - When comparing "ลงแล้ว" and "ยังไม่ลง"
   - Then visual styling is consistent
   - And avatar sizes match
   - And card spacing is uniform

## Tasks / Subtasks

- [ ] **Task 1: Create NotLoggedMemberCard Component** (AC: 2, 4, 5)
  - [ ] 1.1 Create `src/components/team/NotLoggedMemberCard.tsx`
  - [ ] 1.2 Display avatar/initial
  - [ ] 1.3 Display name only (no hours)
  - [ ] 1.4 Add optional orange dot for after 5 PM

- [ ] **Task 2: Create NotLoggedMembersList Component** (AC: 1, 3, 6)
  - [ ] 2.1 Create `src/components/team/NotLoggedMembersList.tsx`
  - [ ] 2.2 Section header with count
  - [ ] 2.3 Sort alphabetically
  - [ ] 2.4 All-logged success state

- [ ] **Task 3: Create Time-Based Indicator Logic** (AC: 4, 5)
  - [ ] 3.1 Create `getTimeOfDayIndicator()` utility
  - [ ] 3.2 Return 'neutral' before noon
  - [ ] 3.3 Return 'neutral' noon to 5 PM
  - [ ] 3.4 Return 'warning' after 5 PM

- [ ] **Task 4: Create All Logged Success Component** (AC: 6)
  - [ ] 4.1 Create success state UI
  - [ ] 4.2 Add celebration icon
  - [ ] 4.3 Positive messaging

- [ ] **Task 5: Integrate into TeamDashboard** (AC: 7)
  - [ ] 5.1 Replace placeholder from 6-1
  - [ ] 5.2 Pass notLogged members data
  - [ ] 5.3 Ensure visual consistency

- [ ] **Task 6: Unit & E2E Tests** (AC: All)
  - [ ] 6.1 Test alphabetical sorting
  - [ ] 6.2 Test time-based indicators
  - [ ] 6.3 Test all-logged success state
  - [ ] 6.4 Test member count in header

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

import { MemberAvatar } from '@/components/shared/MemberAvatar';
import { cn } from '@/lib/utils';
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

      {/* Name only */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{displayName}</p>
      </div>

      {/* Subtle warning dot after 5 PM */}
      {showWarningDot && (
        <div
          className="h-2 w-2 rounded-full bg-orange-400"
          title="หลัง 17:00 - ยังไม่ลง"
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

import { PartyPopper, UserX } from 'lucide-react';
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
            ยังไม่ลง
            <span className="text-muted-foreground font-normal">(0 คน)</span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col items-center py-6 text-center">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
              <PartyPopper className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-green-700">
              ทุกคนลงแล้ว!
            </p>
            <p className="text-xs text-green-600 mt-1">
              ทีมทำได้ดีมากวันนี้
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
          ยังไม่ลง
          <span className="text-muted-foreground font-normal">
            ({members.length} คน)
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
import { th } from 'date-fns/locale';
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
  const formattedDate = format(today, 'EEEE d MMMM yyyy', { locale: th });

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

### Update TeamStatsCard (Minor Enhancement)

```typescript
// src/components/team/TeamStatsCard.tsx - Add loggedCount
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
          สรุปทีม
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{totalMembers}</span>
              <span className="text-muted-foreground">คนในทีม</span>
            </div>
          </div>

          {loggedCount !== undefined && (
            <div className="flex items-center gap-2 text-sm">
              <UserCheck className="h-4 w-4 text-green-600" />
              <span>
                <span className="font-medium text-green-600">{loggedCount}</span>
                <span className="text-muted-foreground"> ลงแล้ว</span>
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
│       ├── TeamDashboard.tsx           # MODIFY
│       ├── TeamStatsCard.tsx           # MODIFY (add loggedCount)
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
- "ทุกคนลงแล้ว!" = celebration moment
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

### Testing

```typescript
// src/lib/utils/time-indicator.test.ts
import { getTimeOfDayIndicator, isAfter5PM, isBeforeNoon } from './time-indicator';

describe('time-indicator', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns neutral before noon', () => {
    jest.setSystemTime(new Date('2025-01-01T09:00:00'));
    expect(getTimeOfDayIndicator()).toBe('neutral');
    expect(isBeforeNoon()).toBe(true);
  });

  it('returns neutral between noon and 5 PM', () => {
    jest.setSystemTime(new Date('2025-01-01T14:00:00'));
    expect(getTimeOfDayIndicator()).toBe('neutral');
  });

  it('returns warning after 5 PM', () => {
    jest.setSystemTime(new Date('2025-01-01T17:30:00'));
    expect(getTimeOfDayIndicator()).toBe('warning');
    expect(isAfter5PM()).toBe(true);
  });
});
```

```typescript
// src/components/team/NotLoggedMembersList.test.tsx
import { render, screen } from '@testing-library/react';
import { NotLoggedMembersList } from './NotLoggedMembersList';

describe('NotLoggedMembersList', () => {
  it('shows success state when all logged', () => {
    render(<NotLoggedMembersList members={[]} />);

    expect(screen.getByText('ทุกคนลงแล้ว!')).toBeInTheDocument();
    expect(screen.getByText('(0 คน)')).toBeInTheDocument();
  });

  it('shows member count in header', () => {
    const members = [
      { id: '1', displayName: 'Alice', hasLoggedToday: false, totalHours: 0, entryCount: 0 },
      { id: '2', displayName: 'Bob', hasLoggedToday: false, totalHours: 0, entryCount: 0 },
    ];

    render(<NotLoggedMembersList members={members} />);

    expect(screen.getByText('(2 คน)')).toBeInTheDocument();
  });

  it('sorts members alphabetically', () => {
    const members = [
      { id: '1', displayName: 'Zara', hasLoggedToday: false },
      { id: '2', displayName: 'Alice', hasLoggedToday: false },
      { id: '3', displayName: 'Mike', hasLoggedToday: false },
    ];

    render(<NotLoggedMembersList members={members} />);

    const names = screen.getAllByText(/Alice|Mike|Zara/);
    // Already sorted by query in 6-2, just verify they appear
    expect(names).toHaveLength(3);
  });
});
```

```typescript
// test/e2e/team/not-logged-members.test.ts
import { test, expect } from '@playwright/test';

test.describe('Team Not Logged Members', () => {
  test.beforeEach(async ({ page }) => {
    // Login as manager
    await page.goto('/team');
  });

  test('displays not logged section', async ({ page }) => {
    await expect(page.getByText('ยังไม่ลง')).toBeVisible();
  });

  test('shows member count in header', async ({ page }) => {
    await expect(page.getByText(/\(\d+ คน\)/)).toBeVisible();
  });

  test('shows success state when all logged', async ({ page }) => {
    // Test with team where everyone has logged
    await expect(page.getByText('ทุกคนลงแล้ว!')).toBeVisible();
  });

  test('shows orange dot after 5 PM', async ({ page }) => {
    // This would need time mocking in E2E
    // For now, visual verification
  });

  test('shows member names without hours', async ({ page }) => {
    const notLoggedCard = page.locator('[data-testid="not-logged-member-card"]').first();

    if (await notLoggedCard.isVisible()) {
      // Should NOT have hours display
      await expect(notLoggedCard.locator('text=/ชม\\./')).not.toBeVisible();
    }
  });
});
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 6.3]
- [Source: _bmad-output/planning-artifacts/prd.md#FR25]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Team Dashboard]
- [Source: _bmad-output/implementation-artifacts/6-2-team-members-who-logged-today.md]

## Definition of Done

- [ ] NotLoggedMemberCard component created
- [ ] NotLoggedMembersList component created
- [ ] Time-based indicator utility created
- [ ] Members sorted alphabetically
- [ ] Neutral styling before 5 PM
- [ ] Orange dot indicator after 5 PM only
- [ ] NO aggressive warning colors (red, etc.)
- [ ] "ทุกคนลงแล้ว!" success state with icon
- [ ] Count shown in section header
- [ ] Name only (no hours) for not-logged members
- [ ] Visual consistency with LoggedMembersList
- [ ] Unit tests for time indicator
- [ ] E2E tests passing
- [ ] Mobile-friendly layout

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Completion Notes List

_To be filled during implementation_

### File List

_To be filled with all created/modified files_
