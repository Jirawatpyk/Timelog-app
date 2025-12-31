# Story 3.2: Client Management

Status: ready-for-dev

## Story

As an **admin**,
I want **to manage clients (add, edit, deactivate)**,
So that **staff have accurate client options when logging time**.

## Acceptance Criteria

1. **AC1: View All Clients**
   - Given I am logged in as admin or super_admin
   - When I navigate to /admin/master-data and select the Clients tab
   - Then I see a list of all clients (active and inactive)
   - And the list shows client name and status

2. **AC2: Add New Client**
   - Given I am on the master data page, Clients tab
   - When I click "Add Client" button
   - Then a form/dialog appears for entering client name
   - And I can submit to create the client
   - And the new client appears in the list

3. **AC3: Unique Client Names**
   - Given I am adding or editing a client
   - When I enter a name that already exists
   - Then validation fails with "Client name already exists"
   - And the form is not submitted

4. **AC4: Edit Client Name**
   - Given I am viewing the clients list
   - When I click edit on a client
   - Then I can modify the client name
   - And save changes successfully
   - And the updated name appears in the list

5. **AC5: Toggle Active Status (Soft Delete)**
   - Given I am viewing the clients list
   - When I toggle a client's active status
   - Then the client is marked as inactive (or active)
   - And the change persists in the database
   - And a confirmation may be shown for deactivation

6. **AC6: Visual Distinction for Inactive**
   - Given there are inactive clients
   - When I view the clients list
   - Then inactive clients appear grayed out or visually distinct
   - And they are clearly identifiable as inactive

7. **AC7: Inactive Hidden from Time Entry**
   - Given a client is marked as inactive
   - When staff use the time entry form
   - Then the inactive client does NOT appear in the dropdown
   - And only active clients are selectable

## Tasks / Subtasks

- [ ] **Task 1: Add Client Schema** (AC: 3)
  - [ ] 1.1 Add `clientSchema` to `schemas/master-data.schema.ts`
  - [ ] 1.2 Define name validation (min 1, max 100 characters)
  - [ ] 1.3 Export `ClientInput` type

- [ ] **Task 2: Create Client Server Actions** (AC: 2, 4, 5)
  - [ ] 2.1 Add `createClient` action to `actions/master-data.ts`
  - [ ] 2.2 Add `updateClient` action
  - [ ] 2.3 Add `toggleClientActive` action
  - [ ] 2.4 Handle unique constraint errors (code 23505)

- [ ] **Task 3: Create Clients List Component** (AC: 1, 6)
  - [ ] 3.1 Create `app/(app)/admin/master-data/components/ClientsList.tsx`
  - [ ] 3.2 Fetch clients using Server Component
  - [ ] 3.3 Display name and active status
  - [ ] 3.4 Style inactive clients with opacity or strikethrough

- [ ] **Task 4: Create Client Item Component** (AC: 5, 6)
  - [ ] 4.1 Create `app/(app)/admin/master-data/components/ClientItem.tsx`
  - [ ] 4.2 Add toggle switch for active status
  - [ ] 4.3 Implement optimistic UI update
  - [ ] 4.4 Add edit button

- [ ] **Task 5: Create Add Client Dialog** (AC: 2, 3)
  - [ ] 5.1 Create `components/admin/AddClientDialog.tsx`
  - [ ] 5.2 Use shadcn Dialog component
  - [ ] 5.3 Add form with React Hook Form + Zod
  - [ ] 5.4 Handle submission and errors

- [ ] **Task 6: Create Edit Client Dialog** (AC: 4, 3)
  - [ ] 6.1 Create `components/admin/EditClientDialog.tsx`
  - [ ] 6.2 Pre-populate form with existing data
  - [ ] 6.3 Handle update and unique constraint errors

- [ ] **Task 7: Integrate Clients Tab** (AC: 1)
  - [ ] 7.1 Update master-data page to render ClientsList in Clients tab
  - [ ] 7.2 Remove "Coming soon..." placeholder

- [ ] **Task 8: Verify RLS & Time Entry Filtering** (AC: 7)
  - [ ] 8.1 Confirm RLS policy filters inactive clients for non-admin
  - [ ] 8.2 Test time entry dropdown only shows active clients
  - [ ] 8.3 Test admin can still see inactive in admin panel

## Dev Notes

### Client Schema

```typescript
// src/schemas/master-data.schema.ts
import { z } from 'zod';

// Existing service schema...

export const clientSchema = z.object({
  name: z
    .string()
    .min(1, 'Client name is required')
    .max(100, 'Client name must be 100 characters or less')
    .trim(),
});

export type ClientInput = z.infer<typeof clientSchema>;
```

### Server Actions

```typescript
// src/actions/master-data.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  clientSchema,
  type ClientInput
} from '@/schemas/master-data.schema';
import type { Client } from '@/types/domain';

// Existing service actions...

export async function createClient(input: ClientInput): Promise<ActionResult<Client>> {
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
  const parsed = clientSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  // Insert client
  const { data, error } = await supabase
    .from('clients')
    .insert({ name: parsed.data.name })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') { // Unique violation
      return { success: false, error: 'Client name already exists' };
    }
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/master-data');
  return { success: true, data };
}

export async function updateClient(
  id: string,
  input: ClientInput
): Promise<ActionResult<Client>> {
  const supabase = await createClient();

  // Auth check
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

  const parsed = clientSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { data, error } = await supabase
    .from('clients')
    .update({ name: parsed.data.name })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Client name already exists' };
    }
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/master-data');
  return { success: true, data };
}

export async function toggleClientActive(
  id: string,
  active: boolean
): Promise<ActionResult<Client>> {
  const supabase = await createClient();

  // Auth check
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

  const { data, error } = await supabase
    .from('clients')
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

### Clients List Component

```typescript
// src/app/(app)/admin/master-data/components/ClientsList.tsx
import { createClient } from '@/lib/supabase/server';
import { ClientItem } from './ClientItem';
import { AddClientDialog } from '@/components/admin/AddClientDialog';

export async function ClientsList() {
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('name');

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Clients</h2>
        <AddClientDialog />
      </div>

      <div className="space-y-2">
        {clients?.map((client) => (
          <ClientItem key={client.id} client={client} />
        ))}
        {(!clients || clients.length === 0) && (
          <p className="text-muted-foreground text-center py-8">
            No clients found. Add your first client.
          </p>
        )}
      </div>
    </div>
  );
}
```

### Client Item Component

```typescript
// src/app/(app)/admin/master-data/components/ClientItem.tsx
'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toggleClientActive } from '@/actions/master-data';
import { EditClientDialog } from '@/components/admin/EditClientDialog';
import type { Client } from '@/types/domain';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';

interface ClientItemProps {
  client: Client;
}

export function ClientItem({ client }: ClientItemProps) {
  const [isActive, setIsActive] = useState(client.active);
  const [isPending, setIsPending] = useState(false);

  const handleToggle = async () => {
    setIsPending(true);
    setIsActive(!isActive); // Optimistic update

    const result = await toggleClientActive(client.id, !isActive);

    if (!result.success) {
      setIsActive(isActive); // Revert on error
      toast.error(result.error);
    } else {
      toast.success(isActive ? 'Client deactivated' : 'Client activated');
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
        {client.name}
      </span>

      <div className="flex items-center gap-2">
        <EditClientDialog client={client} />
        <Switch
          checked={isActive}
          onCheckedChange={handleToggle}
          disabled={isPending}
          aria-label={`Toggle ${client.name} active status`}
        />
      </div>
    </div>
  );
}
```

### Add Client Dialog

```typescript
// src/components/admin/AddClientDialog.tsx
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
import { Label } from '@/components/ui/label';
import { createClient } from '@/actions/master-data';
import { clientSchema, type ClientInput } from '@/schemas/master-data.schema';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

export function AddClientDialog() {
  const [open, setOpen] = useState(false);

  const form = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
    defaultValues: { name: '' },
  });

  const onSubmit = async (data: ClientInput) => {
    const result = await createClient(data);

    if (result.success) {
      toast.success('Client created');
      form.reset();
      setOpen(false);
    } else {
      form.setError('name', { message: result.error });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Client Name</Label>
            <Input
              id="name"
              placeholder="Enter client name"
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-destructive text-sm">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Creating...' : 'Create Client'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

### Edit Client Dialog

```typescript
// src/components/admin/EditClientDialog.tsx
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
import { Label } from '@/components/ui/label';
import { updateClient } from '@/actions/master-data';
import { clientSchema, type ClientInput } from '@/schemas/master-data.schema';
import type { Client } from '@/types/domain';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';

interface EditClientDialogProps {
  client: Client;
}

export function EditClientDialog({ client }: EditClientDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
    defaultValues: { name: client.name },
  });

  const onSubmit = async (data: ClientInput) => {
    const result = await updateClient(client.id, data);

    if (result.success) {
      toast.success('Client updated');
      setOpen(false);
    } else {
      form.setError('name', { message: result.error });
    }
  };

  // Reset form when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      form.reset({ name: client.name });
    }
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit {client.name}</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Client Name</Label>
            <Input
              id="edit-name"
              placeholder="Enter client name"
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-destructive text-sm">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

### Update Master Data Page

```typescript
// src/app/(app)/admin/master-data/page.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServicesList } from './components/ServicesList';
import { ClientsList } from './components/ClientsList';

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
          <ClientsList />
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

From Story 1.4, clients have this RLS policy:
```sql
-- Staff/Manager see only active clients
CREATE POLICY "authenticated_read_active_clients" ON clients
FOR SELECT TO authenticated
USING (active = true OR public.get_user_role() IN ('admin', 'super_admin'));

-- Admin can insert/update
CREATE POLICY "admin_manage_clients" ON clients
FOR ALL TO authenticated
USING (public.get_user_role() IN ('admin', 'super_admin'))
WITH CHECK (public.get_user_role() IN ('admin', 'super_admin'));
```

This ensures:
- Admin/Super Admin see all clients (active + inactive) for management
- Staff/Manager only see active clients in time entry dropdowns

### Database Consideration

Note: Unlike `services` table which has UNIQUE constraint on `name`, the `clients` table does NOT have a database-level UNIQUE constraint per the schema. If unique client names are required, consider either:

1. **Add migration** to add UNIQUE constraint:
```sql
ALTER TABLE clients ADD CONSTRAINT clients_name_unique UNIQUE (name);
```

2. **Handle at application level** with pre-check before insert:
```typescript
// Check if name exists before insert
const { data: existing } = await supabase
  .from('clients')
  .select('id')
  .eq('name', parsed.data.name)
  .single();

if (existing) {
  return { success: false, error: 'Client name already exists' };
}
```

Recommendation: Add the database constraint for data integrity. This should be coordinated with the team.

### Project Structure

```
src/
├── app/
│   └── (app)/
│       └── admin/
│           └── master-data/
│               ├── page.tsx              # Main page with tabs
│               └── components/
│                   ├── ServicesList.tsx  # From Story 3.1
│                   ├── ServiceItem.tsx   # From Story 3.1
│                   ├── ClientsList.tsx   # NEW
│                   └── ClientItem.tsx    # NEW
├── components/
│   └── admin/
│       ├── AddServiceDialog.tsx          # From Story 3.1
│       ├── EditServiceDialog.tsx         # From Story 3.1
│       ├── AddClientDialog.tsx           # NEW
│       └── EditClientDialog.tsx          # NEW
├── actions/
│   └── master-data.ts                    # Extended with client actions
└── schemas/
    └── master-data.schema.ts             # Extended with clientSchema
```

### Existing Clients (from Seed Data)

Per Story 1.5, these clients exist:
1. Netflix
2. Disney+
3. HBO Max
4. Amazon Prime
5. Apple TV+
6. Viu Thailand
7. POPS Worldwide
8. WeTV
9. Tencent Video
10. LINE TV

### Reusable Components Pattern

Consider extracting common patterns between ServiceItem and ClientItem into a shared component if needed, but for MVP keep them separate for clarity and simpler maintenance.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Master Data RLS]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.2]
- [Source: _bmad-output/project-context.md#Server Actions Pattern]
- [Source: _bmad-output/implementation-artifacts/3-1-service-type-management.md]
- [Source: _bmad-output/implementation-artifacts/1-4-rls-policies-for-all-roles.md]

## Definition of Done

- [ ] Admin can view all clients (active and inactive)
- [ ] Admin can add new clients with unique names
- [ ] Admin can edit existing client names
- [ ] Admin can toggle active/inactive status
- [ ] Inactive clients appear visually distinct
- [ ] Unique name validation works (client and server)
- [ ] Time entry dropdown only shows active clients
- [ ] All actions use ActionResult<T> pattern
- [ ] Toast notifications for success/error
- [ ] Components follow same patterns as Story 3.1

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Completion Notes List

_To be filled during implementation_

### File List

_To be filled with all created/modified files_
