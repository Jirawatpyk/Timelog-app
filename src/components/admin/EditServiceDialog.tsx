/**
 * Edit Service Dialog Component
 * Story 3.1: Service Type Management (AC: 4, 3)
 *
 * Modal dialog for editing existing services with form validation.
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
import { updateService } from '@/actions/master-data';
import { serviceSchema, type ServiceInput } from '@/schemas/master-data.schema';
import { toast } from 'sonner';
import type { Service } from '@/types/domain';
import { Pencil } from 'lucide-react';

interface EditServiceDialogProps {
  service: Service;
}

export function EditServiceDialog({ service }: EditServiceDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { name: service.name },
  });

  // Reset form when dialog opens or service changes
  useEffect(() => {
    if (open) {
      form.reset({ name: service.name });
    }
  }, [open, service.name, form]);

  const onSubmit = async (data: ServiceInput) => {
    const result = await updateService(service.id, data);

    if (result.success) {
      toast.success('Service updated');
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
          <DialogTitle>Edit Service</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Service Name</Label>
            <Input
              id="edit-name"
              placeholder="Service name"
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
