/**
 * Add Client Dialog Component
 * Story 3.2: Client Management (AC: 2, 3)
 *
 * Modal dialog for creating new clients with form validation.
 */

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
import { Plus } from 'lucide-react';
import { createClientAction } from '@/actions/master-data';
import { clientSchema, type ClientInput } from '@/schemas/master-data.schema';
import { toast } from 'sonner';
import type { Client } from '@/types/domain';

interface AddClientDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClientCreated?: (client: Client) => void;
}

export function AddClientDialog({
  open: controlledOpen,
  onOpenChange,
  onClientCreated,
}: AddClientDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const form = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
    defaultValues: { name: '' },
  });

  const onSubmit = async (data: ClientInput) => {
    const result = await createClientAction(data);

    if (result.success) {
      toast.success('Client created');
      form.reset();
      onClientCreated?.(result.data);
      handleOpenChange(false);
    } else {
      form.setError('name', { message: result.error });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (isControlled) {
      onOpenChange?.(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
    if (!newOpen) {
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="icon" className="sm:size-auto sm:px-4">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline sm:ml-1">Add Client</span>
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
              placeholder="Client name"
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-destructive text-sm">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Creating...' : 'Create Client'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
