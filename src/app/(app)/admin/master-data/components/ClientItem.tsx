/**
 * Client Item Component
 * Story 3.2: Client Management (AC: 4, 5, 6)
 * Story 3.4: Soft Delete Protection (AC: 1)
 *
 * Individual client row with edit and toggle functionality.
 * Shows confirmation dialog before deactivating items in use.
 */

'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { toggleClientActive, checkClientUsage } from '@/actions/master-data';
import { EditClientDialog } from '@/components/admin/EditClientDialog';
import { DeactivateConfirmDialog } from '@/components/admin/DeactivateConfirmDialog';
import type { Client } from '@/types/domain';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ClientItemProps {
  client: Client;
}

export function ClientItem({ client }: ClientItemProps) {
  const [isActive, setIsActive] = useState(client.active ?? true);
  const [isPending, setIsPending] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [usageCount, setUsageCount] = useState(0);

  const handleToggle = async () => {
    // If deactivating, check usage first
    if (isActive) {
      setIsPending(true);
      const usageResult = await checkClientUsage(client.id);
      setIsPending(false);

      if (!usageResult.success) {
        toast.error(usageResult.error);
        return;
      }

      // Show confirmation dialog with usage count
      setUsageCount(usageResult.data.count);
      setShowConfirmDialog(true);
      return;
    }

    // Activating - no confirmation needed
    await performToggle();
  };

  const performToggle = async () => {
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
    setShowConfirmDialog(false);
  };

  return (
    <>
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

      <DeactivateConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        itemName={client.name}
        itemType="client"
        usageCount={usageCount}
        onConfirm={performToggle}
        isPending={isPending}
      />
    </>
  );
}
