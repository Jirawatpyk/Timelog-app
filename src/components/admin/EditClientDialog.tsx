/**
 * Edit Client Dialog Component
 * Story 3.2: Client Management (AC: 4, 3)
 *
 * Modal dialog for editing existing clients with form validation.
 */

'use client';

import { useState, useEffect } from 'react';
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
import { updateClientAction } from '@/actions/master-data';
import { clientSchema, type ClientInput } from '@/schemas/master-data.schema';
import { toast } from 'sonner';
import type { Client } from '@/types/domain';
import { Pencil } from 'lucide-react';

interface EditClientDialogProps {
  client: Client;
  onClientUpdated?: (client: Client) => void;
}

export function EditClientDialog({ client, onClientUpdated }: EditClientDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
    defaultValues: { name: client.name },
  });

  // Reset form when dialog opens or client changes
  useEffect(() => {
    if (open) {
      form.reset({ name: client.name });
    }
  }, [open, client.name, form]);

  const onSubmit = async (data: ClientInput) => {
    const result = await updateClientAction(client.id, data);

    if (result.success) {
      toast.success('Client updated');
      onClientUpdated?.(result.data);
      setOpen(false);
    } else {
      form.setError('name', { message: result.error });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Edit">
          <Pencil className="h-4 w-4" />
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
            {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
