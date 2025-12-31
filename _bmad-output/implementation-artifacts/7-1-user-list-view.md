# Story 7.1: User List View

## Status: ready-for-dev

## Story

As an **admin**,
I want **to view a list of all users in the system**,
So that **I can manage user accounts effectively**.

## Acceptance Criteria

### AC 1: User List Display
- **Given** I am logged in as admin and navigate to /admin/users
- **When** The page loads
- **Then** I see a list of all users
- **And** Each user shows: Name, Email, Role, Department, Status (Active/Inactive)
- **And** I see total user count at the top

### AC 2: Pagination
- **Given** There are more than 20 users
- **When** Viewing the list
- **Then** List is paginated (20 per page)
- **And** I see pagination controls (Previous, Next, page numbers)
- **And** Current page is highlighted

### AC 3: Role-Based Access Control
- **Given** I am a staff or manager
- **When** I try to access /admin/users
- **Then** I am redirected with message "ไม่มีสิทธิ์เข้าถึง"
- **And** Redirected to /dashboard

### AC 4: Super Admin Access
- **Given** I am logged in as super_admin
- **When** I access /admin/users
- **Then** I can see all users including other admins and super_admins

### AC 5: Empty State
- **Given** No users exist (edge case)
- **When** Page loads
- **Then** I see appropriate empty state message

## Tasks

### Task 1: Create User List Types
**File:** `src/types/domain.ts`
- [ ] Add `UserListItem` type with id, email, displayName, role, department, isActive
- [ ] Add `UserListResponse` type with users array and totalCount
- [ ] Add `PaginationParams` type with page, limit

### Task 2: Create Get Users Server Action
**File:** `src/actions/user.ts`
- [ ] Create `getUsers(params: PaginationParams)` function
- [ ] Query users table with department join
- [ ] Include pagination (LIMIT, OFFSET)
- [ ] Return `ActionResult<UserListResponse>`

### Task 3: Create Admin Layout with Access Check
**File:** `src/app/(app)/admin/layout.tsx`
- [ ] Check user role (admin or super_admin)
- [ ] Redirect unauthorized users to /dashboard
- [ ] Show "ไม่มีสิทธิ์เข้าถึง" toast on redirect

### Task 4: Create Users Page
**File:** `src/app/(app)/admin/users/page.tsx`
- [ ] Server Component fetching user list
- [ ] Accept searchParams for pagination
- [ ] Display UserTable component
- [ ] Show total count header

### Task 5: Create UserTable Component
**File:** `src/app/(app)/admin/users/components/UserTable.tsx`
- [ ] Display table with columns: Name, Email, Role, Department, Status, Actions
- [ ] Use Table component from shadcn/ui
- [ ] Responsive design (cards on mobile)
- [ ] Sortable columns (optional for MVP)

### Task 6: Create UserRow Component
**File:** `src/app/(app)/admin/users/components/UserRow.tsx`
- [ ] Display single user row
- [ ] Role badge with color coding (staff=gray, manager=blue, admin=purple, super_admin=red)
- [ ] Status badge (Active=green, Inactive=gray)
- [ ] Actions dropdown (Edit, Deactivate)

### Task 7: Create Pagination Component
**File:** `src/components/shared/Pagination.tsx`
- [ ] Create reusable pagination component
- [ ] Previous/Next buttons
- [ ] Page number display
- [ ] Handle URL updates for page navigation

### Task 8: Style Role Badges
**File:** `src/app/(app)/admin/users/components/RoleBadge.tsx`
- [ ] Create role badge component with color coding
- [ ] Thai labels: "พนักงาน", "หัวหน้า", "แอดมิน", "ซุปเปอร์แอดมิน"
- [ ] Consistent styling with Badge component

### Task 9: Style Status Badges
**File:** `src/app/(app)/admin/users/components/StatusBadge.tsx`
- [ ] Create status badge component
- [ ] Active = green with "ใช้งาน"
- [ ] Inactive = gray with "ปิดใช้งาน"

### Task 10: Add Loading State
**File:** `src/app/(app)/admin/users/loading.tsx`
- [ ] Create skeleton loader for user table
- [ ] Match table structure
- [ ] Smooth loading experience

## Dev Notes

### Architecture Pattern
- Admin pages use Server Components
- Data fetched via Server Actions
- No TanStack Query needed

### Database Query
```typescript
const { data, count } = await supabase
  .from('users')
  .select(`
    id,
    email,
    display_name,
    role,
    is_active,
    department:departments(id, name)
  `, { count: 'exact' })
  .range(offset, offset + limit - 1)
  .order('display_name');
```

### Role Check Pattern
```typescript
// src/app/(app)/admin/layout.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user?.id)
    .single();

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    redirect('/dashboard?error=unauthorized');
  }

  return <>{children}</>;
}
```

### Pagination URL Pattern
```
/admin/users?page=1
/admin/users?page=2
```

### Component Structure
```
src/app/(app)/admin/users/
├── page.tsx              # Server Component
├── loading.tsx           # Loading skeleton
└── components/
    ├── UserTable.tsx
    ├── UserRow.tsx
    ├── RoleBadge.tsx
    └── StatusBadge.tsx
```

### Import Convention
```typescript
import { getUsers } from '@/actions/user';
import { UserTable } from './components/UserTable';
import { Pagination } from '@/components/shared/Pagination';
```

### Role Colors
```typescript
const roleColors = {
  staff: 'bg-gray-100 text-gray-800',
  manager: 'bg-blue-100 text-blue-800',
  admin: 'bg-purple-100 text-purple-800',
  super_admin: 'bg-red-100 text-red-800',
};
```

### Accessibility
- Table has proper headers with scope
- Role and status badges have aria-labels
- Pagination controls are keyboard accessible
- Focus management on page change

## Definition of Done

- [ ] User list displays with all required columns
- [ ] Pagination works correctly (20 per page)
- [ ] Staff/Manager cannot access page (redirect)
- [ ] Admin and Super Admin can access
- [ ] Role badges display with correct colors
- [ ] Status badges show Active/Inactive
- [ ] Total user count displays
- [ ] Loading skeleton implemented
- [ ] Mobile responsive (card view)
- [ ] No TypeScript errors
- [ ] All imports use @/ aliases
- [ ] Server Actions return ActionResult<T>
