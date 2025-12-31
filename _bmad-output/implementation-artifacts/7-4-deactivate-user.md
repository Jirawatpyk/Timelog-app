# Story 7.4: Deactivate User

## Status: ready-for-dev

## Story

As an **admin**,
I want **to deactivate user accounts**,
So that **former employees can no longer access the system**.

## Acceptance Criteria

### AC 1: Deactivate Button and Confirmation
- **Given** I am viewing a user's details or row
- **When** I click "ปิดใช้งาน" (Deactivate)
- **Then** I see confirmation: "ต้องการปิดใช้งานผู้ใช้นี้?"

### AC 2: Successful Deactivation
- **Given** I confirm deactivation
- **When** Deactivation succeeds
- **Then** User's is_active is set to false
- **And** User can no longer login
- **And** User's existing sessions are invalidated
- **And** I see toast: "ปิดใช้งานผู้ใช้สำเร็จ"
- **And** User shows as "Inactive" in the list

### AC 3: Reactivate User
- **Given** User is already inactive
- **When** I click "เปิดใช้งาน" (Reactivate)
- **Then** User's is_active is set to true
- **And** User can login again
- **And** I see toast: "เปิดใช้งานผู้ใช้สำเร็จ"

### AC 4: Super Admin Protection
- **Given** I try to deactivate a super_admin as an admin
- **When** I click deactivate
- **Then** I see error: "ไม่สามารถปิดใช้งาน Super Admin ได้"

### AC 5: Self-Deactivation Prevention
- **Given** I am logged in as admin
- **When** I try to deactivate my own account
- **Then** I see error: "ไม่สามารถปิดใช้งานบัญชีตัวเองได้"

## Tasks

### Task 1: Create Deactivate User Server Action
**File:** `src/actions/user.ts`
- [ ] Create `deactivateUser(id: string)` function
- [ ] Check permission (can't deactivate super_admin as admin)
- [ ] Check not self-deactivation
- [ ] Update is_active to false
- [ ] Return `ActionResult<User>`

### Task 2: Create Reactivate User Server Action
**File:** `src/actions/user.ts`
- [ ] Create `reactivateUser(id: string)` function
- [ ] Update is_active to true
- [ ] Return `ActionResult<User>`

### Task 3: Create Toggle Status Button
**File:** `src/app/(app)/admin/users/components/StatusToggleButton.tsx`
- [ ] Show "ปิดใช้งาน" for active users
- [ ] Show "เปิดใช้งาน" for inactive users
- [ ] Different colors (red for deactivate, green for reactivate)

### Task 4: Create Deactivation Confirmation Dialog
**File:** `src/app/(app)/admin/users/components/DeactivateConfirmDialog.tsx`
- [ ] Use AlertDialog from shadcn
- [ ] Show user name in message
- [ ] Warning icon
- [ ] "ยกเลิก" and "ปิดใช้งาน" buttons

### Task 5: Implement Session Invalidation
**File:** `src/actions/user.ts`
- [ ] After deactivation, sign out user via Supabase Admin API
- [ ] Clear any refresh tokens
- [ ] Note: Requires service_role key

### Task 6: Add Status Toggle to UserRow
**File:** `src/app/(app)/admin/users/components/UserRow.tsx`
- [ ] Add StatusToggleButton to actions dropdown
- [ ] Pass user id and current status
- [ ] Handle loading state during toggle

### Task 7: Implement Self-Deactivation Check
**File:** `src/actions/user.ts`
- [ ] Get current user's id from auth
- [ ] Compare with target user id
- [ ] Return error if same

### Task 8: Implement Super Admin Protection
**File:** `src/actions/user.ts`
- [ ] Get target user's role
- [ ] Get current user's role
- [ ] Prevent admin from deactivating super_admin

### Task 9: Update List After Status Change
**File:** `src/app/(app)/admin/users/components/StatusToggleButton.tsx`
- [ ] Call revalidatePath after action
- [ ] Update UI optimistically (optional)
- [ ] Show loading spinner during action

### Task 10: Add Visual Indicator for Inactive Users
**File:** `src/app/(app)/admin/users/components/UserRow.tsx`
- [ ] Gray out entire row for inactive users
- [ ] Show strikethrough on name (optional)
- [ ] Clear visual distinction

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
    return { success: false, error: 'ไม่สามารถปิดใช้งานบัญชีตัวเองได้' };
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
    return { success: false, error: 'ไม่สามารถปิดใช้งาน Super Admin ได้' };
  }

  // Deactivate user
  const { data: user, error } = await supabase
    .from('users')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: 'ไม่สามารถปิดใช้งานผู้ใช้ได้' };
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
    return { success: false, error: 'ไม่สามารถเปิดใช้งานผู้ใช้ได้' };
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
          toast.success('เปิดใช้งานผู้ใช้สำเร็จ');
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

## Definition of Done

- [ ] Deactivate button shows for active users
- [ ] Reactivate button shows for inactive users
- [ ] Confirmation dialog appears before deactivation
- [ ] Status toggles correctly
- [ ] Toast messages display appropriately
- [ ] Self-deactivation prevented
- [ ] Admin cannot deactivate super_admin
- [ ] Inactive users show visual distinction
- [ ] User cannot login after deactivation
- [ ] No TypeScript errors
- [ ] All imports use @/ aliases
- [ ] Server Actions return ActionResult<T>
