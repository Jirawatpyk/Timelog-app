# Story 3.1: Service Type Management

Status: done

## Story

As an **admin**,
I want **to manage service types (add, edit, deactivate)**,
So that **staff have accurate service options when logging time**.

## Acceptance Criteria

1. **AC1: View All Services**
   - Given I am logged in as admin or super_admin
   - When I navigate to /admin/master-data
   - Then I see a list of all services (active and inactive)
   - And the list shows service name and status

2. **AC2: Add New Service**
   - Given I am on the master data page
   - When I click "Add Service" button
   - Then a form/dialog appears for entering service name
   - And I can submit to create the service
   - And the new service appears in the list

3. **AC3: Unique Service Names**
   - Given I am adding or editing a service
   - When I enter a name that already exists
   - Then validation fails with "Service name already exists"
   - And the form is not submitted

4. **AC4: Edit Service Name**
   - Given I am viewing the services list
   - When I click edit on a service
   - Then I can modify the service name
   - And save changes successfully
   - And the updated name appears in the list

5. **AC5: Toggle Active Status (Soft Delete)**
   - Given I am viewing the services list
   - When I toggle a service's active status
   - Then the service is marked as inactive (or active)
   - And the change persists in the database
   - And a confirmation may be shown for deactivation

6. **AC6: Visual Distinction for Inactive**
   - Given there are inactive services
   - When I view the services list
   - Then inactive services appear grayed out or visually distinct
   - And they are clearly identifiable as inactive

7. **AC7: Inactive Hidden from Time Entry**
   - Given a service is marked as inactive
   - When staff use the time entry form
   - Then the inactive service does NOT appear in the dropdown
   - And only active services are selectable

## Tasks / Subtasks

- [x] **Task 1: Create Admin Master Data Page Layout** (AC: 1)
  - [x] 1.1 Create `app/(app)/admin/master-data/page.tsx`
  - [x] 1.2 Add navigation/tabs for Services, Clients, Tasks
  - [x] 1.3 Create `app/(app)/admin/master-data/layout.tsx` if needed (not needed - parent layout handles)
  - [x] 1.4 Verify admin role access (middleware handles via routes.ts)

- [x] **Task 2: Create Services List Component** (AC: 1, 6)
  - [x] 2.1 Create `app/(app)/admin/master-data/components/ServicesList.tsx`
  - [x] 2.2 Fetch services using Server Component
  - [x] 2.3 Display name and active status
  - [x] 2.4 Style inactive services with opacity or strikethrough

- [x] **Task 3: Create Service Schema** (AC: 3)
  - [x] 3.1 Create `schemas/master-data.schema.ts`
  - [x] 3.2 Define serviceSchema with name validation
  - [x] 3.3 Add min length, max length constraints

- [x] **Task 4: Create Service Server Actions** (AC: 2, 4, 5)
  - [x] 4.1 Create `actions/master-data.ts`
  - [x] 4.2 Implement `createService` action
  - [x] 4.3 Implement `updateService` action
  - [x] 4.4 Implement `toggleServiceActive` action
  - [x] 4.5 Handle unique constraint errors

- [x] **Task 5: Create Add Service Dialog** (AC: 2, 3)
  - [x] 5.1 Create `components/admin/AddServiceDialog.tsx`
  - [x] 5.2 Use shadcn Dialog component
  - [x] 5.3 Add form with React Hook Form + Zod
  - [x] 5.4 Handle submission and errors

- [x] **Task 6: Create Edit Service Dialog** (AC: 4, 3)
  - [x] 6.1 Create `components/admin/EditServiceDialog.tsx`
  - [x] 6.2 Pre-populate form with existing data
  - [x] 6.3 Handle update and unique constraint errors

- [x] **Task 7: Implement Toggle Active** (AC: 5)
  - [x] 7.1 Add toggle switch or button to list items (ServiceItem component)
  - [x] 7.2 Implement optimistic UI update
  - [x] 7.3 Add confirmation dialog for deactivation (optional - not implemented, toast feedback instead)

- [x] **Task 8: Verify RLS & Time Entry Filtering** (AC: 7)
  - [x] 8.1 Confirm RLS policy filters inactive services for non-admin (verified in migration 008_rls_policies.sql)
  - [x] 8.2 Test time entry dropdown only shows active services (RLS policy enforces this)
  - [x] 8.3 Test admin can still see inactive in admin panel (verified via services.test.ts)

## Dev Notes

### Service Schema

```typescript
// src/schemas/master-data.schema.ts
import { z } from 'zod';

export const serviceSchema = z.object({
  name: z
    .string()
    .min(1, 'Service name is required')
    .max(100, 'Service name must be 100 characters or less')
    .trim(),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
```

### Server Actions

```typescript
// src/actions/master-data.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { serviceSchema, type ServiceInput } from '@/schemas/master-data.schema';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createService(input: ServiceInput): Promise<ActionResult<Service>> {
  const supabase = await createClient();

  // Check admin role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile?.role || !['admin', 'super_admin'].includes(profile.role)) {
    return { success: false, error: 'Not authorized' };
  }

  // Validate input
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  // Insert service
  const { data, error } = await supabase
    .from('services')
    .insert({ name: parsed.data.name })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') { // Unique violation
      return { success: false, error: 'Service name already exists' };
    }
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/master-data');
  return { success: true, data };
}

export async function updateService(
  id: string,
  input: ServiceInput
): Promise<ActionResult<Service>> {
  const supabase = await createClient();

  // ... auth check same as above

  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { data, error } = await supabase
    .from('services')
    .update({ name: parsed.data.name })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Service name already exists' };
    }
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/master-data');
  return { success: true, data };
}

export async function toggleServiceActive(
  id: string,
  active: boolean
): Promise<ActionResult<Service>> {
  const supabase = await createClient();

  // ... auth check

  const { data, error } = await supabase
    .from('services')
    .update({ active })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/master-data');
  return { success: true, data };
}
```

### Services List Component

```typescript
// src/app/(app)/admin/master-data/components/ServicesList.tsx
import { createClient } from '@/lib/supabase/server';
import { ServiceItem } from './ServiceItem';
import { AddServiceDialog } from '@/components/admin/AddServiceDialog';

export async function ServicesList() {
  const supabase = await createClient();

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .order('name');

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Services</h2>
        <AddServiceDialog />
      </div>

      <div className="space-y-2">
        {services?.map((service) => (
          <ServiceItem key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}
```

### Service Item Component

```typescript
// src/app/(app)/admin/master-data/components/ServiceItem.tsx
'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toggleServiceActive } from '@/actions/master-data';
import { EditServiceDialog } from '@/components/admin/EditServiceDialog';
import type { Service } from '@/types/domain';
import { cn } from '@/lib/utils';

interface ServiceItemProps {
  service: Service;
}

export function ServiceItem({ service }: ServiceItemProps) {
  const [isActive, setIsActive] = useState(service.active);
  const [isPending, setIsPending] = useState(false);

  const handleToggle = async () => {
    setIsPending(true);
    setIsActive(!isActive); // Optimistic update

    const result = await toggleServiceActive(service.id, !isActive);

    if (!result.success) {
      setIsActive(isActive); // Revert on error
      // Show error toast
    }
    setIsPending(false);
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between p-3 border rounded-lg',
        !isActive && 'opacity-50 bg-muted'
      )}
    >
      <span className={cn(!isActive && 'line-through')}>
        {service.name}
      </span>

      <div className="flex items-center gap-2">
        <EditServiceDialog service={service} />
        <Switch
          checked={isActive}
          onCheckedChange={handleToggle}
          disabled={isPending}
        />
      </div>
    </div>
  );
}
```

### Add Service Dialog

```typescript
// src/components/admin/AddServiceDialog.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createService } from '@/actions/master-data';
import { serviceSchema, type ServiceInput } from '@/schemas/master-data.schema';
import { toast } from 'sonner';

export function AddServiceDialog() {
  const [open, setOpen] = useState(false);

  const form = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { name: '' },
  });

  const onSubmit = async (data: ServiceInput) => {
    const result = await createService(data);

    if (result.success) {
      toast.success('Service created');
      form.reset();
      setOpen(false);
    } else {
      form.setError('name', { message: result.error });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Service</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Service</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              placeholder="Service name"
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Creating...' : 'Create Service'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

### Master Data Page

```typescript
// src/app/(app)/admin/master-data/page.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServicesList } from './components/ServicesList';

export default function MasterDataPage() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Master Data Management</h1>

      <Tabs defaultValue="services">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          <ServicesList />
        </TabsContent>

        <TabsContent value="clients">
          {/* Story 3.2 */}
          <p className="text-muted-foreground">Coming soon...</p>
        </TabsContent>

        <TabsContent value="tasks">
          {/* Story 3.3 */}
          <p className="text-muted-foreground">Coming soon...</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### RLS Policy Reminder

From Story 1.4, services have this RLS policy:
```sql
-- Staff/Manager see only active services
CREATE POLICY "authenticated_read_active_services" ON services
FOR SELECT TO authenticated
USING (active = true OR public.get_user_role() IN ('admin', 'super_admin'));
```

This ensures:
- Admin/Super Admin see all services (active + inactive) for management
- Staff/Manager only see active services in time entry dropdowns

### Project Structure

```
src/
├── app/
│   └── (app)/
│       └── admin/
│           └── master-data/
│               ├── page.tsx              # Main page with tabs
│               └── components/
│                   ├── ServicesList.tsx  # Server component
│                   └── ServiceItem.tsx   # Client component
├── components/
│   └── admin/
│       ├── AddServiceDialog.tsx
│       └── EditServiceDialog.tsx
├── actions/
│   └── master-data.ts                    # CRUD actions
└── schemas/
    └── master-data.schema.ts             # Zod schemas
```

### Existing Services (from Seed Data)

Per Story 1.5, these services exist:
1. Dubbing
2. Subtitling
3. QC
4. Recording
5. Mixing
6. Translation
7. Voice Over
8. ADR

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Master Data RLS]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.1]
- [Source: _bmad-output/project-context.md#Server Actions Pattern]
- [Source: _bmad-output/implementation-artifacts/1-4-rls-policies-for-all-roles.md]

## Definition of Done

- [x] Admin can view all services (active and inactive)
- [x] Admin can add new services with unique names
- [x] Admin can edit existing service names
- [x] Admin can toggle active/inactive status
- [x] Inactive services appear visually distinct
- [x] Unique name validation works (client and server)
- [x] Time entry dropdown only shows active services (RLS enforced)
- [x] All actions use ActionResult<T> pattern
- [x] Toast notifications for success/error

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

1. **Task 1-2: Admin Master Data Page + Services List** - Created tabbed page layout at `/admin/master-data` with Services, Clients, Tasks tabs. Services tab shows full list ordered by name with visual distinction for inactive items (opacity-50, line-through).

2. **Task 3: Service Schema** - Zod validation with trim, min(1), max(100) for service name. Exported `ServiceInput` type for reuse.

3. **Task 4: Server Actions** - Implemented `createService`, `updateService`, `toggleServiceActive` following ActionResult<T> pattern. All actions verify admin/super_admin role, handle unique constraint errors (code 23505), and call `revalidatePath('/admin/master-data')`.

4. **Task 5-6: Add/Edit Dialogs** - shadcn/ui Dialog components with React Hook Form + Zod resolver. Form errors display inline. Success closes dialog with toast notification.

5. **Task 7: Toggle Active** - ServiceItem client component with Switch, optimistic updates, and loading state. Reverts on error with error toast.

6. **Task 8: RLS Verification** - Added `test/e2e/rls/services.test.ts` with 7 tests verifying RLS policy `authenticated_read_active_services`. Policy uses `active = true OR public.get_user_role() IN ('admin', 'super_admin')` ensuring staff only see active services in dropdowns.

7. **Tests**: All 275 tests passing (unit + RLS integration tests).

8. **Code Review Fixes** (Post-Review):
   - Added `uuidSchema` to validate service ID format in updateService/toggleServiceActive
   - Added test for super_admin role authorization
   - Added 5 UUID validation tests to schema tests
   - Fixed File List with correct test counts
   - Added missing UI components (tabs.tsx, switch.tsx) to File List

### File List

**Created:**
- `src/app/(app)/admin/master-data/page.tsx` - Main admin page with tabs
- `src/app/(app)/admin/master-data/page.test.tsx` - Page tests (5 tests)
- `src/app/(app)/admin/master-data/components/ServicesList.tsx` - Server component listing services
- `src/app/(app)/admin/master-data/components/ServicesList.test.tsx` - ServicesList tests (9 tests)
- `src/app/(app)/admin/master-data/components/ServiceItem.tsx` - Client component with toggle/edit
- `src/app/(app)/admin/master-data/components/ServiceItem.test.tsx` - ServiceItem tests (14 tests)
- `src/schemas/master-data.schema.ts` - Zod validation schema (includes uuidSchema)
- `src/schemas/master-data.schema.test.ts` - Schema tests (14 tests)
- `src/actions/master-data.ts` - Server actions with UUID validation (create, update, toggle)
- `src/actions/master-data.test.ts` - Action tests (17 tests, includes super_admin + UUID validation)
- `src/components/admin/AddServiceDialog.tsx` - Add service dialog
- `src/components/admin/AddServiceDialog.test.tsx` - Dialog tests (9 tests)
- `src/components/admin/EditServiceDialog.tsx` - Edit service dialog
- `src/components/admin/EditServiceDialog.test.tsx` - Dialog tests (9 tests)
- `src/components/ui/tabs.tsx` - shadcn/ui Tabs component
- `src/components/ui/switch.tsx` - shadcn/ui Switch component
- `test/e2e/rls/services.test.ts` - RLS policy tests (8 tests)

**Modified:**
- `_bmad-output/implementation-artifacts/sprint-status.yaml` - Updated story status
