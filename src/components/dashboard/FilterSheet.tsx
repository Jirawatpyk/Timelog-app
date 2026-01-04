/**
 * FilterSheet Component - Story 5.6
 *
 * Bottom sheet for filtering dashboard entries.
 * Uses shadcn/ui Sheet component.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetFooter,
  SheetClose,
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
      <SheetContent side="bottom" className="h-auto max-h-[400px] rounded-t-xl px-6 pt-3 pb-6 [&>button]:hidden">
        <div className="flex items-center justify-between mb-3">
          <SheetTitle>Filter Entries</SheetTitle>
          <SheetClose asChild>
            <Button variant="ghost" size="icon-sm" className="-mr-2">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </SheetClose>
        </div>

        <div className="py-4">
          <label className="text-sm font-medium mb-2 block">Client</label>
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger className="w-full">
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

        <SheetFooter className="flex-row gap-2 p-0">
          <Button variant="outline" onClick={handleClear} className="flex-1">
            Clear
          </Button>
          <Button onClick={handleApply} className="flex-1">
            Apply
          </Button>
        </SheetFooter>
        {/* Bottom safe area spacer for iOS home indicator */}
        <div className="h-4 shrink-0" />
      </SheetContent>
    </Sheet>
  );
}
