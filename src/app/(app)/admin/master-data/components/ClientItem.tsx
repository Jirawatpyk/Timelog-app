/**
 * Client Item Component
 * Story 3.2: Client Management (AC: 4, 5, 6)
 *
 * Individual client row with edit and toggle functionality.
 */

'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { toggleClientActive } from '@/actions/master-data';
import { EditClientDialog } from '@/components/admin/EditClientDialog';
import type { Client } from '@/types/domain';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ClientItemProps {
  client: Client;
}

export function ClientItem({ client }: ClientItemProps) {
  const [isActive, setIsActive] = useState(client.active ?? true);
  const [isPending, setIsPending] = useState(false);

  const handleToggle = async () => {
    const previousState = isActive;
    setIsPending(true);
    setIsActive(!isActive); // Optimistic update

    const result = await toggleClientActive(client.id, !previousState);

    if (!result.success) {
      setIsActive(previousState); // Revert on error
      toast.error(result.error);
    } else {
      toast.success(result.data.active ? 'Client activated' : 'Client deactivated');
    }
    setIsPending(false);
  };

  return (
    <div
      data-testid="client-item"
      className={cn(
        'flex items-center justify-between p-3 border rounded-lg',
        !isActive && 'opacity-50 bg-muted'
      )}
    >
      <span
        data-testid={`client-name-${client.id}`}
        className={cn(!isActive && 'line-through')}
      >
        {client.name}
      </span>

      <div className="flex items-center gap-2">
        <EditClientDialog client={client} />
        <Switch
          checked={isActive}
          onCheckedChange={handleToggle}
          disabled={isPending}
          aria-label={isActive ? 'Deactivate client' : 'Activate client'}
        />
      </div>
    </div>
  );
}
