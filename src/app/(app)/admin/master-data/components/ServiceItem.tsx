/**
 * Service Item Component
 * Story 3.1: Service Type Management (AC: 4, 5, 6)
 *
 * Individual service row with edit and toggle functionality.
 */

'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { toggleServiceActive } from '@/actions/master-data';
import { EditServiceDialog } from '@/components/admin/EditServiceDialog';
import type { Service } from '@/types/domain';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ServiceItemProps {
  service: Service;
}

export function ServiceItem({ service }: ServiceItemProps) {
  const [isActive, setIsActive] = useState(service.active ?? true);
  const [isPending, setIsPending] = useState(false);

  const handleToggle = async () => {
    const previousState = isActive;
    setIsPending(true);
    setIsActive(!isActive); // Optimistic update

    const result = await toggleServiceActive(service.id, !previousState);

    if (!result.success) {
      setIsActive(previousState); // Revert on error
      toast.error(result.error);
    } else {
      toast.success(result.data.active ? 'Service activated' : 'Service deactivated');
    }
    setIsPending(false);
  };

  return (
    <div
      data-testid="service-item"
      className={cn(
        'flex items-center justify-between p-3 border rounded-lg',
        !isActive && 'opacity-50 bg-muted'
      )}
    >
      <span
        data-testid={`service-name-${service.id}`}
        className={cn(!isActive && 'line-through')}
      >
        {service.name}
      </span>

      <div className="flex items-center gap-2">
        <EditServiceDialog service={service} />
        <Switch
          checked={isActive}
          onCheckedChange={handleToggle}
          disabled={isPending}
          aria-label={isActive ? 'Deactivate service' : 'Activate service'}
        />
      </div>
    </div>
  );
}
