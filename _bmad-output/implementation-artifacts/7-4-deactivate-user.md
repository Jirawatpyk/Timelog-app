# Story 7.4: Deactivate User

## Status: done

## Story

As an **admin**,
I want **to deactivate user accounts**,
So that **former employees can no longer access the system**.

## Acceptance Criteria

### AC 1: Deactivate Button and Confirmation
- **Given** I am viewing a user's details or row
- **When** I click "Deactivate"
- **Then** I see confirmation dialog with warning icon

### AC 2: Successful Deactivation
- **Given** I confirm deactivation
- **When** Deactivation succeeds
- **Then** User's is_active is set to false
- **And** User can no longer login (middleware checks is_active)
- **And** User's existing sessions are invalidated on next request
- **And** I see toast: "User deactivated"
- **And** User shows as "Inactive" in the list

### AC 3: Reactivate User
- **Given** User is already inactive
- **When** I click "Reactivate"
- **Then** User's is_active is set to true
- **And** User can login again
- **And** I see toast: "User reactivated"

### AC 4: Super Admin Protection
- **Given** I try to deactivate a super_admin as an admin
- **When** I click deactivate
- **Then** I see error: "Cannot deactivate Super Admin"

### AC 5: Self-Deactivation Prevention
- **Given** I am logged in as admin
- **When** I try to deactivate my own account
- **Then** Button is disabled (cannot click)

## Tasks

### Task 1: Create Deactivate User Server Action
**File:** `src/actions/user.ts`
- [x] Create `deactivateUser(id: string)` function
- [x] Check permission (can't deactivate super_admin as admin)
- [x] Check not self-deactivation
- [x] Update is_active to false
- [x] Return `ActionResult<User>`

### Task 2: Create Reactivate User Server Action
**File:** `src/actions/user.ts`
- [x] Create `reactivateUser(id: string)` function
- [x] Update is_active to true
- [x] Return `ActionResult<User>`

### Task 3: Create Toggle Status Button
**File:** `src/app/(app)/admin/users/components/StatusToggleButton.tsx`
- [x] Show "Deactivate" for active users
- [x] Show "Reactivate" for inactive users
- [x] Different colors (red for deactivate, green for reactivate)

### Task 4: Create Deactivation Confirmation Dialog
**File:** `src/app/(app)/admin/users/components/StatusToggleButton.tsx` (integrated)
- [x] Use AlertDialog from shadcn
- [x] Show user name in message
- [x] Warning icon
- [x] "Cancel" and "Deactivate" buttons

### Task 5: Implement Session Invalidation
**File:** `src/actions/user.ts`
- [x] Session invalidation handled by middleware checking is_active flag
- [x] Deactivated users blocked on next auth check
- [x] Note: Immediate invalidation via Admin API optional enhancement

### Task 6: Add Status Toggle to UserTable
**File:** `src/app/(app)/admin/users/components/UserTable.tsx`
- [x] Add StatusToggleButton to actions column
- [x] Pass user id and current status
- [x] Handle loading state during toggle

### Task 7: Implement Self-Deactivation Check
**File:** `src/actions/user.ts`
- [x] Get current user's id from auth
- [x] Compare with target user id
- [x] Return error if same

### Task 8: Implement Super Admin Protection
**File:** `src/actions/user.ts`
- [x] Get target user's role
- [x] Get current user's role
- [x] Prevent admin from deactivating super_admin

### Task 9: Update List After Status Change
**File:** `src/app/(app)/admin/users/components/StatusToggleButton.tsx`
- [x] Call revalidatePath after action
- [x] Show loading spinner during action
- [x] router.refresh() for immediate UI update

### Task 10: Add Visual Indicator for Inactive Users
**File:** `src/app/(app)/admin/users/components/UserTable.tsx`
- [x] Gray out entire row for inactive users (opacity-50 bg-muted/50)
- [x] Applied to both desktop table and mobile cards
- [x] Clear visual distinction

## Dev Notes

### Architecture Pattern
- Server Actions handle status toggle
- AlertDialog for confirmation
- Optimistic UI update (optional)

### Server Action Pattern
```typescript
// src/actions/user.ts
'use server';

export async function deactivateUser(id: string): Promise<ActionResult<User>> {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  // Prevent self-deactivation
  if (authUser?.id === id) {
    return { success: false, error: 'Cannot deactivate your own account' };
  }

  // Get current user's role
  const { data: currentUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', authUser?.id)
    .single();

  // Get target user's role
  const { data: targetUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', id)
    .single();

  // Prevent admin from deactivating super_admin
  if (targetUser?.role === 'super_admin' && currentUser?.role !== 'super_admin') {
    return { success: false, error: 'Cannot deactivate Super Admin' };
  }

  // Deactivate user
  const { data: user, error } = await supabase
    .from('users')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: 'Failed to deactivate user' };
  }

  // TODO: Invalidate user sessions via Supabase Admin API
  // Requires service_role key - implement in Phase 2

  revalidatePath('/admin/users');
  return { success: true, data: user };
}

export async function reactivateUser(id: string): Promise<ActionResult<User>> {
  const supabase = await createClient();

  const { data: user, error } = await supabase
    .from('users')
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: 'Failed to reactivate user' };
  }

  revalidatePath('/admin/users');
  return { success: true, data: user };
}
```

### Status Toggle Button Pattern
```typescript
// StatusToggleButton.tsx
interface StatusToggleButtonProps {
  userId: string;
  isActive: boolean;
  userName: string;
}

function StatusToggleButton({ userId, isActive, userName }: StatusToggleButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    if (isActive) {
      setShowConfirm(true); // Show confirmation for deactivation
    } else {
      // Reactivate directly
      startTransition(async () => {
        const result = await reactivateUser(userId);
        if (result.success) {
          toast.success('User reactivated');
        } else {
          toast.error(result.error);
        }
      });
    }
  };

  // ...
}
```

### Session Invalidation Note
- Full session invalidation requires Supabase Admin API
- Requires `SUPABASE_SERVICE_ROLE_KEY` environment variable
- For MVP, user will be blocked on next auth check
- Middleware checks `is_active` flag on each request

### Middleware Auth Check
```typescript
// middleware.ts - Add to existing auth check
const { data: profile } = await supabase
  .from('users')
  .select('is_active')
  .eq('id', user.id)
  .single();

if (!profile?.is_active) {
  await supabase.auth.signOut();
  return NextResponse.redirect('/login?error=account_deactivated');
}
```

### Component Dependencies
- Builds on UserRow from Story 7.1
- Uses AlertDialog from shadcn/ui
- Uses toast for notifications

### Import Convention
```typescript
import { deactivateUser, reactivateUser } from '@/actions/user';
import { DeactivateConfirmDialog } from './components/DeactivateConfirmDialog';
import { StatusToggleButton } from './components/StatusToggleButton';
```

### Visual Styling for Inactive
```typescript
const rowClassName = cn(
  'border-b transition-colors',
  !user.is_active && 'opacity-50 bg-gray-50'
);
```

### Accessibility
- Confirmation dialog has proper focus management
- Button text changes based on state
- Screen reader announces status change
- Loading state indicated visually and via aria-busy

## Dev Agent Record

### Implementation Date: 2026-01-04

### Implementation Notes:
- Created `deactivateUser` and `reactivateUser` server actions with full permission checks
- `StatusToggleButton` component handles both states with integrated confirmation dialog
- English error messages per project-context.md
- Session invalidation handled by middleware is_active check (MVP approach)
- Visual indicator for inactive users: opacity-50 + bg-muted/50 on row/card

### Tests Added:
- `src/actions/user.test.ts`: 10 new tests for deactivateUser/reactivateUser
- `src/app/(app)/admin/users/components/StatusToggleButton.test.tsx`: 12 tests
- `src/app/(app)/admin/users/components/UserTable.test.tsx`: 2 tests for inactive visual indicator
- `test/e2e/admin/deactivate-user.test.ts`: 10 E2E tests covering all ACs

### Completion Notes:
All acceptance criteria met. Implementation uses English UI text. Total: 1763 unit tests + 10 E2E tests passing.

## File List

### New Files:
- `src/app/(app)/admin/users/components/StatusToggleButton.tsx`
- `src/app/(app)/admin/users/components/StatusToggleButton.test.tsx`
- `test/e2e/admin/deactivate-user.test.ts`

### Modified Files:
- `src/actions/user.ts` - Added deactivateUser, reactivateUser functions with permission checks
- `src/actions/user.test.ts` - Added tests for new functions
- `src/app/(app)/admin/users/page.tsx` - Added currentUserId prop
- `src/app/(app)/admin/users/components/UserTable.tsx` - Added StatusToggleButton, inactive styling
- `src/app/(app)/admin/users/components/UserTable.test.tsx` - Updated props, added visual tests
- `src/lib/supabase/proxy.ts` - Added is_active check for session invalidation (Code Review fix)

## Change Log

- 2026-01-04: Story 7.4 implementation complete (all tasks)
- 2026-01-04: Code Review fixes applied:
  - CRITICAL: Added is_active check to middleware (proxy.ts)
  - HIGH: Added permission check to reactivateUser (admin/super_admin only)
  - HIGH: Added warning icon to confirmation dialog
  - MEDIUM: Dialog stays open on error
  - MEDIUM: Added E2E tests (10 test cases)
  - LOW: Dark mode friendly green color
  - DOC: Updated ACs and Dev Notes to English

## Definition of Done

- [x] Deactivate button shows for active users
- [x] Reactivate button shows for inactive users
- [x] Confirmation dialog appears before deactivation
- [x] Status toggles correctly
- [x] Toast messages display appropriately
- [x] Self-deactivation prevented
- [x] Admin cannot deactivate super_admin
- [x] Inactive users show visual distinction
- [x] User cannot login after deactivation (via middleware is_active check)
- [x] No TypeScript errors
- [x] All imports use @/ aliases
- [x] Server Actions return ActionResult<T>
