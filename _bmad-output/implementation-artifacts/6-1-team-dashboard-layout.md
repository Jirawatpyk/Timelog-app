# Story 6.1: Team Dashboard Layout

Status: ready-for-dev

## Story

As a **manager**,
I want **to view a dashboard of my team's time entries**,
So that **I can monitor team productivity and compliance**.

## Acceptance Criteria

1. **AC1: Team Dashboard Page Access**
   - Given I am logged in as a manager
   - When I navigate to /team
   - Then I see the team dashboard page
   - And the page loads successfully

2. **AC2: Dashboard Layout Structure**
   - Given I am on the team dashboard
   - When the page loads
   - Then I see today's date prominently displayed at the top
   - And I see summary stats section
   - And I see a list of team members with their status
   - And layout is optimized for quick scanning

3. **AC3: Managed Departments Display**
   - Given I manage one or more departments
   - When viewing the dashboard
   - Then I see data for all my managed department(s)
   - And department name(s) are visible
   - And only team members from my departments are shown

4. **AC4: Staff Access Restriction**
   - Given I am logged in as a staff member (not manager)
   - When I try to access /team
   - Then I am redirected to /dashboard
   - And I see a toast message: "ไม่มีสิทธิ์เข้าถึง"

5. **AC5: Admin/Super Admin Access**
   - Given I am logged in as admin or super_admin
   - When I navigate to /team
   - Then I can access the team dashboard
   - And I see all departments (not restricted)

6. **AC6: Bottom Navigation Integration**
   - Given I am a manager viewing the app
   - When I look at the bottom navigation
   - Then I see a "Team" tab/icon
   - And tapping it navigates to /team

7. **AC7: Loading State**
   - Given I navigate to /team
   - When data is loading
   - Then I see a skeleton loading state
   - And the layout structure is visible during loading

8. **AC8: Empty Team State**
   - Given I am a manager with no team members
   - When viewing the dashboard
   - Then I see an appropriate empty state message
   - And I understand why there's no data

## Tasks / Subtasks

- [ ] **Task 1: Create Team Dashboard Route** (AC: 1, 4, 5)
  - [ ] 1.1 Create `src/app/(app)/team/page.tsx`
  - [ ] 1.2 Create `src/app/(app)/team/layout.tsx` if needed
  - [ ] 1.3 Add role check for manager/admin/super_admin
  - [ ] 1.4 Implement redirect for unauthorized users

- [ ] **Task 2: Create Authorization Middleware** (AC: 4, 5)
  - [ ] 2.1 Create `checkManagerAccess()` utility
  - [ ] 2.2 Query user role from database
  - [ ] 2.3 Handle redirect with toast message
  - [ ] 2.4 Allow admin/super_admin access

- [ ] **Task 3: Create Team Dashboard Layout Component** (AC: 2)
  - [ ] 3.1 Create `src/components/team/TeamDashboard.tsx`
  - [ ] 3.2 Header with today's date
  - [ ] 3.3 Stats section placeholder
  - [ ] 3.4 Team members list section

- [ ] **Task 4: Create Team Stats Card** (AC: 2)
  - [ ] 4.1 Create `src/components/team/TeamStatsCard.tsx`
  - [ ] 4.2 Display placeholder stats structure
  - [ ] 4.3 Style consistent with personal dashboard

- [ ] **Task 5: Create Team Members List Component** (AC: 2, 3)
  - [ ] 5.1 Create `src/components/team/TeamMembersList.tsx`
  - [ ] 5.2 Sections: "ลงแล้ว" and "ยังไม่ลง"
  - [ ] 5.3 Display member name placeholder

- [ ] **Task 6: Query Manager's Departments** (AC: 3)
  - [ ] 6.1 Create `getManagerDepartments()` query
  - [ ] 6.2 Use manager_departments junction table
  - [ ] 6.3 Return department IDs and names

- [ ] **Task 7: Query Team Members** (AC: 3)
  - [ ] 7.1 Create `getTeamMembers()` query
  - [ ] 7.2 Filter by manager's department(s)
  - [ ] 7.3 Return user list with basic info

- [ ] **Task 8: Create Loading Skeleton** (AC: 7)
  - [ ] 8.1 Create `src/components/team/TeamDashboardSkeleton.tsx`
  - [ ] 8.2 Match layout structure
  - [ ] 8.3 Animate skeleton elements

- [ ] **Task 9: Create Empty Team State** (AC: 8)
  - [ ] 9.1 Create `src/components/team/EmptyTeamState.tsx`
  - [ ] 9.2 Appropriate message for no team members

- [ ] **Task 10: Update Bottom Navigation** (AC: 6)
  - [ ] 10.1 Add Team icon to BottomNav
  - [ ] 10.2 Show only for manager+ roles
  - [ ] 10.3 Highlight when on /team route

- [ ] **Task 11: E2E Tests** (AC: All)
  - [ ] 11.1 Test manager can access /team
  - [ ] 11.2 Test staff is redirected
  - [ ] 11.3 Test admin can access
  - [ ] 11.4 Test loading state
  - [ ] 11.5 Test bottom nav visibility

## Dev Notes

### Architecture Compliance

**Required Patterns:**
- Server Component for data fetching
- No TanStack Query (per architecture rules)
- Use RLS for data access control
- Return `ActionResult<T>` from Server Actions
- Use `@/` import aliases only

**Role-Based Access:**
- `staff` — NO access, redirect to /dashboard
- `manager` — Access to own department(s) only
- `admin` — Access to all departments
- `super_admin` — Access to all departments

**File Locations:**
- Page: `src/app/(app)/team/page.tsx`
- Components: `src/components/team/`
- Queries: `src/lib/queries/team.ts`

### Types Definition

```typescript
// src/types/team.ts

export interface TeamMember {
  id: string;
  email: string;
  displayName: string;
  departmentId: string;
  departmentName: string;
  role: 'staff' | 'manager' | 'admin' | 'super_admin';
}

export interface ManagerDepartment {
  id: string;
  name: string;
}

export interface TeamDashboardData {
  departments: ManagerDepartment[];
  members: TeamMember[];
  // Stats will be added in Story 6.4
}
```

### Authorization Check

```typescript
// src/lib/auth/check-manager-access.ts
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function checkManagerAccess(): Promise<{
  canAccess: boolean;
  userId: string;
  role: string;
  isAdmin: boolean;
}> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = profile?.role || 'staff';
  const canAccess = ['manager', 'admin', 'super_admin'].includes(role);
  const isAdmin = ['admin', 'super_admin'].includes(role);

  return { canAccess, userId: user.id, role, isAdmin };
}
```

### Team Dashboard Page

```typescript
// src/app/(app)/team/page.tsx
import { redirect } from 'next/navigation';
import { checkManagerAccess } from '@/lib/auth/check-manager-access';
import { getManagerDepartments, getTeamMembers } from '@/lib/queries/team';
import { TeamDashboard } from '@/components/team/TeamDashboard';
import { TeamDashboardSkeleton } from '@/components/team/TeamDashboardSkeleton';
import { Suspense } from 'react';

export default async function TeamPage() {
  const { canAccess, userId, isAdmin } = await checkManagerAccess();

  if (!canAccess) {
    // Redirect with message (toast handled client-side)
    redirect('/dashboard?error=no-access');
  }

  return (
    <div className="flex flex-col h-full">
      <Suspense fallback={<TeamDashboardSkeleton />}>
        <TeamDashboardContent userId={userId} isAdmin={isAdmin} />
      </Suspense>
    </div>
  );
}

async function TeamDashboardContent({
  userId,
  isAdmin,
}: {
  userId: string;
  isAdmin: boolean;
}) {
  const departments = await getManagerDepartments(userId, isAdmin);
  const members = await getTeamMembers(departments.map((d) => d.id));

  return (
    <TeamDashboard
      departments={departments}
      members={members}
    />
  );
}
```

### Query Manager's Departments

```typescript
// src/lib/queries/team.ts
import { createClient } from '@/lib/supabase/server';
import type { ManagerDepartment, TeamMember } from '@/types/team';

export async function getManagerDepartments(
  userId: string,
  isAdmin: boolean
): Promise<ManagerDepartment[]> {
  const supabase = await createClient();

  if (isAdmin) {
    // Admin sees all departments
    const { data, error } = await supabase
      .from('departments')
      .select('id, name')
      .eq('active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  // Manager sees only assigned departments
  const { data, error } = await supabase
    .from('manager_departments')
    .select(`
      department:departments!inner(id, name)
    `)
    .eq('manager_id', userId);

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.department.id,
    name: row.department.name,
  }));
}

export async function getTeamMembers(
  departmentIds: string[]
): Promise<TeamMember[]> {
  if (departmentIds.length === 0) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
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
    .eq('active', true)
    .order('display_name');

  if (error) throw error;

  return (data || []).map((user) => ({
    id: user.id,
    email: user.email,
    displayName: user.display_name || user.email.split('@')[0],
    departmentId: user.department_id,
    departmentName: user.department?.name || '',
    role: user.role,
  }));
}
```

### Team Dashboard Component

```typescript
// src/components/team/TeamDashboard.tsx
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { TeamStatsCard } from '@/components/team/TeamStatsCard';
import { TeamMembersList } from '@/components/team/TeamMembersList';
import { EmptyTeamState } from '@/components/team/EmptyTeamState';
import type { ManagerDepartment, TeamMember } from '@/types/team';

interface TeamDashboardProps {
  departments: ManagerDepartment[];
  members: TeamMember[];
}

export function TeamDashboard({ departments, members }: TeamDashboardProps) {
  const today = new Date();
  const formattedDate = format(today, 'EEEE d MMMM yyyy', { locale: th });

  if (members.length === 0) {
    return <EmptyTeamState />;
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header with Date */}
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

      {/* Stats Card (placeholder for Story 6.4) */}
      <TeamStatsCard
        totalMembers={members.length}
        // Additional stats will be added in 6.4
      />

      {/* Team Members List (placeholder for Stories 6.2, 6.3) */}
      <TeamMembersList members={members} />
    </div>
  );
}
```

### Team Stats Card (Placeholder)

```typescript
// src/components/team/TeamStatsCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface TeamStatsCardProps {
  totalMembers: number;
}

export function TeamStatsCard({ totalMembers }: TeamStatsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Users className="h-4 w-4" />
          สรุปทีม
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{totalMembers}</span>
          <span className="text-muted-foreground">คนในทีม</span>
        </div>
        {/* Additional stats will be added in Story 6.4 */}
      </CardContent>
    </Card>
  );
}
```

### Team Members List (Placeholder)

```typescript
// src/components/team/TeamMembersList.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TeamMember } from '@/types/team';

interface TeamMembersListProps {
  members: TeamMember[];
}

export function TeamMembersList({ members }: TeamMembersListProps) {
  return (
    <div className="space-y-4">
      {/* Logged Section - Will be detailed in Story 6.2 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            ลงแล้ว
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            รายละเอียดจะเพิ่มใน Story 6.2
          </p>
        </CardContent>
      </Card>

      {/* Not Logged Section - Will be detailed in Story 6.3 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            ยังไม่ลง
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            รายละเอียดจะเพิ่มใน Story 6.3
          </p>
          {/* Show member names as placeholder */}
          <div className="mt-2 space-y-1">
            {members.slice(0, 5).map((member) => (
              <div key={member.id} className="text-sm">
                {member.displayName}
              </div>
            ))}
            {members.length > 5 && (
              <div className="text-xs text-muted-foreground">
                และอีก {members.length - 5} คน...
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Empty Team State

```typescript
// src/components/team/EmptyTeamState.tsx
import { Users } from 'lucide-react';

export function EmptyTeamState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Users className="h-8 w-8 text-muted-foreground" />
      </div>

      <h3 className="text-lg font-medium mb-2">
        ยังไม่มีสมาชิกในทีม
      </h3>

      <p className="text-sm text-muted-foreground max-w-[250px]">
        ไม่พบสมาชิกในแผนกที่คุณดูแล กรุณาติดต่อ Admin
      </p>
    </div>
  );
}
```

### Team Dashboard Skeleton

```typescript
// src/components/team/TeamDashboardSkeleton.tsx
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function TeamDashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* Stats Card Skeleton */}
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-20" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32" />
        </CardContent>
      </Card>

      {/* Members List Skeleton */}
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-16" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-16" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
```

### Update Bottom Navigation

```typescript
// src/components/shared/BottomNav.tsx - Add Team tab
import { Home, PlusCircle, Users, User } from 'lucide-react';

// Add to nav items (conditionally for managers)
const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/entry', icon: PlusCircle, label: 'Entry' },
  { href: '/team', icon: Users, label: 'Team', managerOnly: true },
  { href: '/profile', icon: User, label: 'Profile' },
];

// Filter based on user role
const visibleItems = navItems.filter(
  (item) => !item.managerOnly || userRole !== 'staff'
);
```

### Handle Redirect Toast

```typescript
// src/app/(app)/dashboard/page.tsx - Handle error param
import { toast } from 'sonner';

// In client component or useEffect
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('error') === 'no-access') {
    toast.error('ไม่มีสิทธิ์เข้าถึง');
    // Clean URL
    window.history.replaceState({}, '', '/dashboard');
  }
}, []);
```

### Project Structure

```
src/
├── app/
│   └── (app)/
│       └── team/
│           └── page.tsx              # NEW
├── components/
│   ├── team/                         # NEW folder
│   │   ├── TeamDashboard.tsx
│   │   ├── TeamStatsCard.tsx
│   │   ├── TeamMembersList.tsx
│   │   ├── TeamDashboardSkeleton.tsx
│   │   └── EmptyTeamState.tsx
│   └── shared/
│       └── BottomNav.tsx             # MODIFY (add Team tab)
├── lib/
│   ├── auth/
│   │   └── check-manager-access.ts   # NEW
│   └── queries/
│       └── team.ts                   # NEW
└── types/
    └── team.ts                       # NEW
```

### RLS Considerations

**Existing RLS policies should handle:**
- Users table: Users can only see their own profile
- manager_departments: Managers can see their assignments
- departments: All authenticated users can read active departments

**No new RLS needed for this story** — queries use service-level auth check.

### Testing

```typescript
// test/e2e/team/access.test.ts
import { test, expect } from '@playwright/test';

test.describe('Team Dashboard Access', () => {
  test('manager can access team dashboard', async ({ page }) => {
    // Login as manager
    await page.goto('/team');

    await expect(page).toHaveURL('/team');
    await expect(page.getByText('Team Dashboard')).toBeVisible();
  });

  test('staff is redirected to dashboard', async ({ page }) => {
    // Login as staff
    await page.goto('/team');

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText('ไม่มีสิทธิ์เข้าถึง')).toBeVisible();
  });

  test('admin can access team dashboard', async ({ page }) => {
    // Login as admin
    await page.goto('/team');

    await expect(page).toHaveURL('/team');
    await expect(page.getByText('Team Dashboard')).toBeVisible();
  });

  test('shows loading skeleton while loading', async ({ page }) => {
    await page.goto('/team');

    // Should briefly show skeleton
    // (may be too fast to catch in real test)
  });

  test('shows today date on dashboard', async ({ page }) => {
    await page.goto('/team');

    // Should show formatted Thai date
    const today = new Date();
    await expect(page.getByText(new RegExp(today.getDate().toString()))).toBeVisible();
  });

  test('shows team tab in bottom nav for manager', async ({ page }) => {
    // Login as manager
    await page.goto('/dashboard');

    await expect(page.getByRole('link', { name: /team/i })).toBeVisible();
  });

  test('hides team tab for staff', async ({ page }) => {
    // Login as staff
    await page.goto('/dashboard');

    await expect(page.getByRole('link', { name: /team/i })).not.toBeVisible();
  });
});
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 6.1]
- [Source: _bmad-output/planning-artifacts/prd.md#FR23-FR27]
- [Source: _bmad-output/planning-artifacts/architecture.md#Multi-Department Manager Support]
- [Source: _bmad-output/project-context.md#RLS Testing Requirements]

## Definition of Done

- [ ] /team route created
- [ ] Manager access check implemented
- [ ] Staff redirected with toast message
- [ ] Admin/Super Admin can access
- [ ] Today's date displayed prominently
- [ ] TeamStatsCard placeholder created
- [ ] TeamMembersList placeholder created
- [ ] getManagerDepartments() query working
- [ ] getTeamMembers() query working
- [ ] Loading skeleton implemented
- [ ] Empty team state handled
- [ ] Bottom nav shows Team tab for managers
- [ ] Bottom nav hides Team tab for staff
- [ ] E2E tests for access control
- [ ] Mobile-friendly layout

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Completion Notes List

_To be filled during implementation_

### File List

_To be filled with all created/modified files_
