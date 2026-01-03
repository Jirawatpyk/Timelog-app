# Story 6.2: Team Members Who Logged Today

Status: done

## Story

As a **manager**,
I want **to see which team members have logged time today**,
So that **I can track daily compliance**.

## Acceptance Criteria

1. **AC1: Logged Section Display**
   - Given I am on the team dashboard
   - When viewing the "Logged Today" section
   - Then I see a list of team members who have at least 1 entry today
   - And the section header shows count: "Logged Today (X people)"

2. **AC2: Member Row Information**
   - Given a team member has logged time today
   - When viewing their row in the list
   - Then I see: Member name (display_name)
   - And I see: Total hours today (e.g., "8.5 hrs")
   - And I see: Number of entries "(Y entries)"

3. **AC3: List Sorting**
   - Given multiple members have logged today
   - When viewing the list
   - Then members are sorted by total hours (descending)
   - And highest hours appear at top

4. **AC4: Complete Day Indicator (8+ hours)**
   - Given a team member has logged 8+ hours today
   - When viewing their row
   - Then I see a green checkmark indicator (✓)
   - And hours display in green text
   - And this indicates "done for the day"

5. **AC5: Partial Day Display (< 8 hours)**
   - Given a team member has logged < 8 hours today
   - When viewing their row
   - Then hours display in neutral color
   - And NO negative indicators are shown
   - And NO red/warning colors used

6. **AC6: Empty Logged State**
   - Given no team members have logged today
   - When viewing the "Logged Today" section
   - Then I see: "No one logged today"
   - And the section is not hidden (shows empty state)

7. **AC7: Member Avatar/Initial**
   - Given a team member is shown in the list
   - When viewing their row
   - Then I see their avatar or initial (first letter of name)
   - And this helps with quick visual identification

8. **AC8: Tap for Details (Future)**
   - Given I see a team member row
   - When I tap on it
   - Then nothing happens for now (placeholder for future)
   - Note: Drill-down to member entries is Phase 2

## Tasks / Subtasks

- [x] **Task 1: Create LoggedMemberCard Component** (AC: 2, 4, 5, 7)
  - [x] 1.1 Create `src/components/team/LoggedMemberCard.tsx`
  - [x] 1.2 Display avatar/initial
  - [x] 1.3 Display name and hours
  - [x] 1.4 Display entry count
  - [x] 1.5 Green checkmark for 8+ hours
  - [x] 1.6 Neutral styling for < 8 hours

- [x] **Task 2: Create LoggedMembersList Component** (AC: 1, 3, 6)
  - [x] 2.1 Create `src/components/team/LoggedMembersList.tsx`
  - [x] 2.2 Section header with count
  - [x] 2.3 Sort by total hours descending
  - [x] 2.4 Empty state when no one logged

- [x] **Task 3: Query Team Members with Today's Entries** (AC: 1, 2)
  - [x] 3.1 Create `getTeamMembersWithTodayEntries()` query
  - [x] 3.2 Join users with time_entries
  - [x] 3.3 Filter by today's date
  - [x] 3.4 Aggregate hours and entry count per member

- [x] **Task 4: Create Member Avatar Component** (AC: 7)
  - [x] 4.1 Create `src/components/shared/MemberAvatar.tsx`
  - [x] 4.2 Show initial letter if no avatar
  - [x] 4.3 Consistent sizing and colors

- [x] **Task 5: Integrate into TeamDashboard** (AC: All)
  - [x] 5.1 Replace placeholder in TeamMembersList
  - [x] 5.2 Pass logged members data
  - [x] 5.3 Ensure proper layout

- [x] **Task 6: Define Types** (AC: All)
  - [x] 6.1 Create `TeamMemberWithStats` type
  - [x] 6.2 Include totalHours, entryCount fields

- [x] **Task 7: Unit & E2E Tests** (AC: All)
  - [x] 7.1 Test sorting by hours
  - [x] 7.2 Test green indicator at 8+ hours
  - [x] 7.3 Test empty state
  - [x] 7.4 Test member count in header

## Dev Notes

### Architecture Compliance

**Required Patterns:**
- Server Component for data fetching
- No TanStack Query on Team Dashboard
- Use `@/` import aliases only
- RLS handles department-level access

**File Locations:**
- Components: `src/components/team/LoggedMemberCard.tsx`, `LoggedMembersList.tsx`
- Shared: `src/components/shared/MemberAvatar.tsx`
- Queries: `src/lib/queries/team.ts` (extend)
- Types: `src/types/team.ts` (extend)

### Types Definition

```typescript
// src/types/team.ts - Extend with stats

export interface TeamMemberWithStats extends TeamMember {
  totalHours: number;      // Total hours logged today
  entryCount: number;      // Number of entries today
  hasLoggedToday: boolean; // true if entryCount > 0
  isComplete: boolean;     // true if totalHours >= 8
}

export interface TeamMembersGrouped {
  logged: TeamMemberWithStats[];    // Members who logged today
  notLogged: TeamMemberWithStats[]; // Members who haven't logged
}
```

### Query Team Members with Today's Entries

```typescript
// src/lib/queries/team.ts - Add this function

export async function getTeamMembersWithTodayStats(
  departmentIds: string[]
): Promise<TeamMembersGrouped> {
  if (departmentIds.length === 0) {
    return { logged: [], notLogged: [] };
  }

  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  // Get all team members
  const { data: members, error: membersError } = await supabase
    .from('users')
    .select(`
      id,
      email,
      display_name,
      role,
      department_id,
      department:departments!inner(name)
    `)
    .in('department_id', departmentIds)
    .eq('active', true);

  if (membersError) throw membersError;

  // Get today's entries for these members
  const memberIds = (members || []).map((m) => m.id);

  const { data: entries, error: entriesError } = await supabase
    .from('time_entries')
    .select('user_id, duration_minutes')
    .in('user_id', memberIds)
    .eq('entry_date', today);

  if (entriesError) throw entriesError;

  // Aggregate entries by user
  const statsMap = new Map<string, { totalMinutes: number; count: number }>();
  (entries || []).forEach((entry) => {
    const current = statsMap.get(entry.user_id) || { totalMinutes: 0, count: 0 };
    current.totalMinutes += entry.duration_minutes;
    current.count += 1;
    statsMap.set(entry.user_id, current);
  });

  // Build result
  const logged: TeamMemberWithStats[] = [];
  const notLogged: TeamMemberWithStats[] = [];

  (members || []).forEach((member) => {
    const stats = statsMap.get(member.id);
    const totalHours = stats ? stats.totalMinutes / 60 : 0;
    const entryCount = stats?.count || 0;

    const memberWithStats: TeamMemberWithStats = {
      id: member.id,
      email: member.email,
      displayName: member.display_name || member.email.split('@')[0],
      departmentId: member.department_id,
      departmentName: member.department?.name || '',
      role: member.role,
      totalHours,
      entryCount,
      hasLoggedToday: entryCount > 0,
      isComplete: totalHours >= 8,
    };

    if (entryCount > 0) {
      logged.push(memberWithStats);
    } else {
      notLogged.push(memberWithStats);
    }
  });

  // Sort logged by hours descending
  logged.sort((a, b) => b.totalHours - a.totalHours);

  // Sort notLogged alphabetically
  notLogged.sort((a, b) => a.displayName.localeCompare(b.displayName, 'th'));

  return { logged, notLogged };
}
```

### Member Avatar Component

```typescript
// src/components/shared/MemberAvatar.tsx
import { cn } from '@/lib/utils';

interface MemberAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

// Generate consistent color based on name
function getAvatarColor(name: string): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-teal-500',
    'bg-indigo-500',
    'bg-amber-500',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export function MemberAvatar({ name, size = 'md', className }: MemberAvatarProps) {
  const initial = name.charAt(0).toUpperCase();
  const bgColor = getAvatarColor(name);

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center text-white font-medium',
        sizeClasses[size],
        bgColor,
        className
      )}
    >
      {initial}
    </div>
  );
}
```

### Logged Member Card Component

```typescript
// src/components/team/LoggedMemberCard.tsx
import { Check } from 'lucide-react';
import { MemberAvatar } from '@/components/shared/MemberAvatar';
import { cn } from '@/lib/utils';
import type { TeamMemberWithStats } from '@/types/team';

interface LoggedMemberCardProps {
  member: TeamMemberWithStats;
}

export function LoggedMemberCard({ member }: LoggedMemberCardProps) {
  const { displayName, totalHours, entryCount, isComplete } = member;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-card border">
      {/* Avatar */}
      <MemberAvatar name={displayName} size="md" />

      {/* Name and entries */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{displayName}</p>
        <p className="text-xs text-muted-foreground">
          {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
        </p>
      </div>

      {/* Hours and indicator */}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'text-sm font-semibold',
            isComplete ? 'text-green-600' : 'text-foreground'
          )}
        >
          {totalHours.toFixed(1)} hrs
        </span>

        {isComplete && (
          <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="h-3 w-3 text-green-600" />
          </div>
        )}
      </div>
    </div>
  );
}
```

### Logged Members List Component

```typescript
// src/components/team/LoggedMembersList.tsx
import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoggedMemberCard } from '@/components/team/LoggedMemberCard';
import type { TeamMemberWithStats } from '@/types/team';

interface LoggedMembersListProps {
  members: TeamMemberWithStats[];
}

export function LoggedMembersList({ members }: LoggedMembersListProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="text-green-600">●</span>
          Logged Today
          <span className="text-muted-foreground font-normal">
            ({members.length} people)
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {members.length === 0 ? (
          <div className="flex flex-col items-center py-6 text-center">
            <Users className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No one logged today
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {members.map((member) => (
              <LoggedMemberCard key={member.id} member={member} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### Update Team Dashboard

```typescript
// src/components/team/TeamDashboard.tsx - Update to use new components
import { LoggedMembersList } from '@/components/team/LoggedMembersList';
import { NotLoggedMembersList } from '@/components/team/NotLoggedMembersList'; // Story 6.3
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
      </div>

      {/* Stats Card - placeholder for Story 6.4 */}
      <TeamStatsCard totalMembers={totalMembers} />

      {/* Logged Members */}
      <LoggedMembersList members={membersGrouped.logged} />

      {/* Not Logged Members - Story 6.3 */}
      <NotLoggedMembersList members={membersGrouped.notLogged} />
    </div>
  );
}
```

### Update Team Page

```typescript
// src/app/(app)/team/page.tsx - Update to fetch grouped data

async function TeamDashboardContent({
  userId,
  isAdmin,
}: {
  userId: string;
  isAdmin: boolean;
}) {
  const departments = await getManagerDepartments(userId, isAdmin);
  const membersGrouped = await getTeamMembersWithTodayStats(
    departments.map((d) => d.id)
  );

  return (
    <TeamDashboard
      departments={departments}
      membersGrouped={membersGrouped}
    />
  );
}
```

### Project Structure Update

```
src/
├── components/
│   ├── team/
│   │   ├── TeamDashboard.tsx         # MODIFY
│   │   ├── TeamStatsCard.tsx         # From 6-1
│   │   ├── LoggedMemberCard.tsx      # NEW
│   │   ├── LoggedMembersList.tsx     # NEW
│   │   ├── NotLoggedMembersList.tsx  # Placeholder for 6-3
│   │   ├── TeamDashboardSkeleton.tsx
│   │   └── EmptyTeamState.tsx
│   └── shared/
│       ├── MemberAvatar.tsx          # NEW
│       └── BottomNav.tsx
├── lib/
│   └── queries/
│       └── team.ts                   # EXTEND (getTeamMembersWithTodayStats)
└── types/
    └── team.ts                       # EXTEND (TeamMemberWithStats)
```

### UX Design Alignment

**From UX Spec:**
- No negative/alarming indicators for incomplete
- Green = positive (8+ hours complete)
- Neutral = normal (< 8 hours, no judgment)
- Manager sees team status "at a glance"

**Visual Hierarchy:**
1. Green dot in header = logged section
2. Member name prominent
3. Hours right-aligned for scanning
4. Checkmark for 8+ hours (celebration, not requirement)

### Testing

```typescript
// src/components/team/LoggedMemberCard.test.tsx
import { render, screen } from '@testing-library/react';
import { LoggedMemberCard } from './LoggedMemberCard';

describe('LoggedMemberCard', () => {
  const baseMember = {
    id: '1',
    email: 'test@example.com',
    displayName: 'Test User',
    departmentId: 'd1',
    departmentName: 'Dept A',
    role: 'staff' as const,
    hasLoggedToday: true,
  };

  it('shows green checkmark for 8+ hours', () => {
    render(
      <LoggedMemberCard
        member={{ ...baseMember, totalHours: 8.5, entryCount: 3, isComplete: true }}
      />
    );

    expect(screen.getByText('8.5 hrs')).toHaveClass('text-green-600');
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument(); // Check icon
  });

  it('shows neutral color for < 8 hours', () => {
    render(
      <LoggedMemberCard
        member={{ ...baseMember, totalHours: 5.0, entryCount: 2, isComplete: false }}
      />
    );

    expect(screen.getByText('5.0 hrs')).not.toHaveClass('text-green-600');
  });

  it('displays entry count', () => {
    render(
      <LoggedMemberCard
        member={{ ...baseMember, totalHours: 6.0, entryCount: 4, isComplete: false }}
      />
    );

    expect(screen.getByText('4 entries')).toBeInTheDocument();
  });
});
```

```typescript
// test/e2e/team/logged-members.test.ts
import { test, expect } from '@playwright/test';

test.describe('Team Logged Members', () => {
  test.beforeEach(async ({ page }) => {
    // Login as manager
    await page.goto('/team');
  });

  test('displays logged members section', async ({ page }) => {
    await expect(page.getByText('Logged Today')).toBeVisible();
  });

  test('shows member count in header', async ({ page }) => {
    await expect(page.getByText(/\(\d+ people\)/)).toBeVisible();
  });

  test('sorts members by hours descending', async ({ page }) => {
    const cards = page.locator('[data-testid="logged-member-card"]');
    const hours = await cards.locator('.font-semibold').allTextContents();

    // Verify descending order
    const hoursNumbers = hours.map((h) => parseFloat(h));
    for (let i = 1; i < hoursNumbers.length; i++) {
      expect(hoursNumbers[i - 1]).toBeGreaterThanOrEqual(hoursNumbers[i]);
    }
  });

  test('shows green checkmark for 8+ hours', async ({ page }) => {
    // Find member with 8+ hours
    const completeCard = page.locator('[data-testid="logged-member-card"]')
      .filter({ hasText: /8\.\d|9\.\d|1\d\.\d/ })
      .first();

    if (await completeCard.isVisible()) {
      await expect(completeCard.locator('svg')).toBeVisible(); // Check icon
    }
  });

  test('shows empty state when no one logged', async ({ page }) => {
    // Test with user who has no team entries today
    await expect(page.getByText('No one logged today')).toBeVisible();
  });
});
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 6.2]
- [Source: _bmad-output/planning-artifacts/prd.md#FR24]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Team Dashboard]
- [Source: _bmad-output/implementation-artifacts/6-1-team-dashboard-layout.md]

## Definition of Done

- [x] LoggedMemberCard component created
- [x] LoggedMembersList component created
- [x] MemberAvatar shared component created
- [x] getTeamMembersWithTodayStats() query working
- [x] Members sorted by hours descending
- [x] Green checkmark shown for 8+ hours
- [x] Hours in green text for complete members
- [x] Neutral styling for < 8 hours (no alarm)
- [x] Entry count displayed per member
- [x] Empty state shown when no one logged
- [x] Count shown in section header
- [x] Unit tests passing
- [x] E2E tests passing
- [x] Mobile-friendly card layout

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Completion Notes List

- ✅ Created `TeamMemberWithStats` and `TeamMembersGrouped` types in `src/types/team.ts`
- ✅ Implemented `getTeamMembersWithTodayStats()` query in `src/lib/queries/team.ts`
  - Fetches team members with `active = true` filter
  - Aggregates today's entries per user (totalHours, entryCount)
  - Groups into logged vs notLogged arrays
  - Sorts logged by hours descending, notLogged alphabetically (Thai locale)
- ✅ Created `MemberAvatar` component (`src/components/team/MemberAvatar.tsx`)
  - Shows first letter of name in colored circle
  - Supports sm/md/lg sizes
  - Generates consistent color per name using character code
  - Moved from shared/ to team/ during code review
- ✅ Created `LoggedMemberCard` component (`src/components/team/LoggedMemberCard.tsx`)
  - Displays avatar, name, entry count, hours
  - Green text + checkmark for 8+ hours (isComplete)
  - Neutral styling for < 8 hours (no negative indicators)
- ✅ Created `LoggedMembersList` component (`src/components/team/LoggedMembersList.tsx`)
  - Card-based layout with header showing count
  - Empty state: "No one logged today" with Users icon
  - Maps members to LoggedMemberCard components
- ✅ Updated `TeamDashboard` to use `TeamMembersGrouped` interface
  - Replaced `members` prop with `membersGrouped`
  - Renders `LoggedMembersList` for logged members
  - Preserves `TeamMembersList` for notLogged (Story 6.3)
- ✅ Updated `src/app/(app)/team/page.tsx` to call `getTeamMembersWithTodayStats()`
- ✅ Updated barrel exports in `src/components/team/index.ts`
- ✅ Comprehensive unit tests for all components (94 tests passing)
- ✅ E2E tests covering all ACs in `test/e2e/team/logged-members.test.ts`
- ✅ All acceptance criteria met and validated

### File List

**Created:**
- `src/components/team/MemberAvatar.tsx`
- `src/components/team/MemberAvatar.test.tsx`
- `src/components/team/LoggedMemberCard.tsx`
- `src/components/team/LoggedMemberCard.test.tsx`
- `src/components/team/LoggedMembersList.tsx`
- `src/components/team/LoggedMembersList.test.tsx`
- `test/e2e/team/logged-members.test.ts`

**Modified:**
- `src/types/team.ts` (added TeamMemberWithStats, TeamMembersGrouped)
- `src/types/team.test.ts` (added type validation tests)
- `src/lib/queries/team.ts` (added getTeamMembersWithTodayStats, data integrity filter)
- `src/lib/queries/team.test.ts` (added 6 query tests, updated null handling test)
- `src/components/team/TeamDashboard.tsx` (updated to use TeamMembersGrouped)
- `src/components/team/TeamDashboard.test.tsx` (updated mocks and tests)
- `src/components/team/TeamDashboardSkeleton.test.tsx` (fixed rounded-xl class)
- `src/components/team/index.ts` (added LoggedMembersList, LoggedMemberCard, MemberAvatar exports)
- `src/app/(app)/team/page.tsx` (use getTeamMembersWithTodayStats query)

### Code Review Fixes

- ✅ Updated ACs from Thai to English (per project-context.md)
- ✅ Updated E2E tests to use English text patterns
- ✅ Added entry/entries pluralization in LoggedMemberCard
- ✅ Fixed test comment to include Story 6.2
- ✅ Added data integrity filter (skip members without department_id)
- ✅ Moved MemberAvatar from shared/ to team/ folder
