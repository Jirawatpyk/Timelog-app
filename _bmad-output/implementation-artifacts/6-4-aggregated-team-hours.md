# Story 6.4: Aggregated Team Hours

## Status: ready-for-dev

## Story

As a **manager**,
I want **to see aggregated hours for my team**,
So that **I can understand team capacity utilization**.

## Acceptance Criteria

### AC 1: Team Stats Card Display
- **Given** I am on the team dashboard
- **When** Viewing the stats section
- **Then** I see a stats card showing:
  - Total hours: "วันนี้: XX ชม. รวม"
  - People count: "(Y คน ลงแล้ว)"
  - Average: "เฉลี่ย X.X ชม./คน"

### AC 2: Period Selector for Team Stats
- **Given** I am on the team dashboard
- **When** I tap on the period selector
- **Then** I can choose between "วันนี้" and "สัปดาห์นี้"

### AC 3: Weekly Stats View
- **Given** Period "สัปดาห์นี้" is selected
- **When** Stats update
- **Then** I see: "สัปดาห์นี้: XXX ชม. รวม"
- **And** I see daily breakdown summary showing hours per day

### AC 4: Compliance Rate Display
- **Given** Team has N members total
- **When** M members have logged today
- **Then** Compliance rate shows: "M/N คน (XX%)"
- **And** Percentage is calculated as (M/N * 100)

### AC 5: Empty State
- **Given** No team members have logged for the selected period
- **When** Stats display
- **Then** I see: "ยังไม่มีข้อมูล" with appropriate empty state

## Tasks

### Task 1: Create Team Stats Types
**File:** `src/types/domain.ts`
- [ ] Add `TeamStats` interface with fields: totalHours, memberCount, loggedCount, averageHours
- [ ] Add `DailyBreakdown` interface for weekly view

### Task 2: Create Team Stats Query Function
**File:** `src/actions/team.ts`
- [ ] Create `getTeamStats(period: 'today' | 'week', departmentIds?: string[])` function
- [ ] Query time_entries aggregated by department(s)
- [ ] Calculate total hours, logged count, average
- [ ] Return `ActionResult<TeamStats>`

### Task 3: Create Daily Breakdown Query Function
**File:** `src/actions/team.ts`
- [ ] Create `getWeeklyBreakdown(departmentIds?: string[])` function
- [ ] Query time_entries grouped by entry_date for current week
- [ ] Return `ActionResult<DailyBreakdown[]>`

### Task 4: Create TeamStatsCard Component
**File:** `src/app/(app)/team/components/TeamStatsCard.tsx`
- [ ] Display total hours with Thai format
- [ ] Display logged member count
- [ ] Display average hours per person (1 decimal place)
- [ ] Use Card component from shadcn/ui

### Task 5: Create Period Selector for Team
**File:** `src/app/(app)/team/components/TeamPeriodSelector.tsx`
- [ ] Create tab-style selector with "วันนี้" and "สัปดาห์นี้"
- [ ] Handle state via URL params `?period=today|week`
- [ ] Style active state with primary color

### Task 6: Create Compliance Rate Display
**File:** `src/app/(app)/team/components/ComplianceRate.tsx`
- [ ] Calculate and display percentage
- [ ] Format as "M/N คน (XX%)"
- [ ] Show green color for 100%, neutral otherwise

### Task 7: Create Weekly Breakdown Component
**File:** `src/app/(app)/team/components/WeeklyBreakdown.tsx`
- [ ] Display 7-day summary (Mon-Sun)
- [ ] Show hours per day in compact format
- [ ] Highlight today's date
- [ ] Show zero for days with no entries

### Task 8: Integrate Stats into Team Page
**File:** `src/app/(app)/team/page.tsx`
- [ ] Add TeamStatsCard at the top
- [ ] Add TeamPeriodSelector
- [ ] Conditionally show WeeklyBreakdown when period='week'
- [ ] Pass department filter to queries

### Task 9: Handle Multi-Department Stats
**File:** `src/actions/team.ts`
- [ ] Filter by manager's departments from manager_departments
- [ ] Aggregate across multiple departments when needed
- [ ] Support single department filter via URL param

### Task 10: Add Loading and Error States
- [ ] Add skeleton loader for TeamStatsCard
- [ ] Handle query errors gracefully
- [ ] Show "ไม่สามารถโหลดข้อมูลได้" on error

## Dev Notes

### Architecture Pattern
- Team Dashboard uses Server Components (no TanStack Query)
- Data fetched at request time via Server Actions
- Use `revalidatePath('/team')` for real-time-ish updates

### Stats Calculation Logic
```typescript
// Total hours = SUM(duration_minutes) / 60
// Average = totalHours / loggedCount (not totalMembers)
// Compliance = loggedCount / totalMembers * 100
```

### Week Definition
- Week runs Monday to Sunday (Thai standard)
- Use `startOfWeek` and `endOfWeek` with locale settings

### SQL Query Pattern
```sql
SELECT
  SUM(duration_minutes) as total_minutes,
  COUNT(DISTINCT user_id) as logged_count
FROM time_entries
WHERE department_id = ANY($departmentIds)
  AND entry_date = CURRENT_DATE  -- or date range for week
```

### Component Dependencies
- Extends `LoggedMembersList` from Story 6.2
- Extends `NotLoggedMembersList` from Story 6.3
- Uses shared period selector pattern from Story 5.1

### Import Convention
```typescript
import { getTeamStats, getWeeklyBreakdown } from '@/actions/team';
import { TeamStatsCard } from './components/TeamStatsCard';
import { TeamPeriodSelector } from './components/TeamPeriodSelector';
```

### Error Handling
```typescript
const result = await getTeamStats(period, departmentIds);
if (!result.success) {
  return <ErrorDisplay message={result.error} />;
}
```

### Accessibility
- Stats values have aria-labels for screen readers
- Period selector is keyboard navigable
- Color is not the only indicator (use icons too)

## Definition of Done

- [ ] Team stats card displays correctly with all metrics
- [ ] Period selector switches between today and week views
- [ ] Weekly breakdown shows daily hours summary
- [ ] Compliance rate calculates correctly
- [ ] Multi-department managers see aggregated stats
- [ ] Empty states display appropriately
- [ ] Loading states implemented
- [ ] No TypeScript errors
- [ ] All imports use @/ aliases
- [ ] Server Actions return ActionResult<T>
