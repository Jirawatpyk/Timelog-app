/**
 * FilterSheet Component - Story 5.6
 *
 * Bottom sheet for filtering dashboard entries.
 * Uses shadcn/ui Sheet component.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { ClientOption } from '@/types/dashboard';

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  clients: ClientOption[];
  currentClientId?: string;
}

export function FilterSheet({
  open,
  onClose,
  clients,
  currentClientId,
}: FilterSheetProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedClient, setSelectedClient] = useState(currentClientId || '');

  // Sync selectedClient with prop when sheet opens or currentClientId changes
  useEffect(() => {
    if (open) {
      setSelectedClient(currentClientId || '');
    }
  }, [open, currentClientId]);

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedClient) {
      params.set('client', selectedClient);
    } else {
      params.delete('client');
    }

    const queryString = params.toString();
    router.push(queryString ? `/dashboard?${queryString}` : '/dashboard');
    onClose();
  };

  const handleClear = () => {
    setSelectedClient('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('client');
    const queryString = params.toString();
    router.push(queryString ? `/dashboard?${queryString}` : '/dashboard');
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[300px]">
        <SheetHeader>
          <SheetTitle>Filter Entries</SheetTitle>
        </SheetHeader>

        <div className="py-6">
          <label className="text-sm font-medium mb-2 block">Client</label>
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger>
              <SelectValue placeholder="Select Client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <SheetFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClear}>
            Clear
          </Button>
          <Button onClick={handleApply}>Apply Filter</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
