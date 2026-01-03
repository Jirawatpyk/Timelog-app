/**
 * Add Service Dialog Component
 * Story 3.1: Service Type Management (AC: 2, 3)
 *
 * Modal dialog for creating new services with form validation.
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
import { createService } from '@/actions/master-data';
import { serviceSchema, type ServiceInput } from '@/schemas/master-data.schema';
import { toast } from 'sonner';
import type { Service } from '@/types/domain';

interface AddServiceDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onServiceCreated?: (service: Service) => void;
}

export function AddServiceDialog({
  open: controlledOpen,
  onOpenChange,
  onServiceCreated,
}: AddServiceDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const form = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { name: '' },
  });

  const onSubmit = async (data: ServiceInput) => {
    const result = await createService(data);

    if (result.success) {
      toast.success('Service created');
      form.reset();
      onServiceCreated?.(result.data);
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
        <Button size="icon" className="sm:w-auto sm:px-4">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline sm:ml-1">Add Service</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Service</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Service Name</Label>
            <Input
              id="name"
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
            {form.formState.isSubmitting ? 'Creating...' : 'Create Service'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
