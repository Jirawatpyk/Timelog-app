/**
 * Task Item Component
 * Story 3.3: Task Management (AC: 4, 5, 6)
 *
 * Individual task row with edit and toggle functionality.
 */

'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { toggleTaskActive } from '@/actions/master-data';
import { EditTaskDialog } from '@/components/admin/EditTaskDialog';
import type { Task } from '@/types/domain';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const [isActive, setIsActive] = useState(task.active ?? true);
  const [isPending, setIsPending] = useState(false);

  const handleToggle = async () => {
    const previousState = isActive;
    setIsPending(true);
    setIsActive(!isActive); // Optimistic update

    const result = await toggleTaskActive(task.id, !previousState);

    if (!result.success) {
      setIsActive(previousState); // Revert on error
      toast.error(result.error);
    } else {
      toast.success(result.data.active ? 'Task activated' : 'Task deactivated');
    }
    setIsPending(false);
  };

  return (
    <div
      data-testid="task-item"
      className={cn(
        'flex items-center justify-between p-3 border rounded-lg',
        !isActive && 'opacity-50 bg-muted'
      )}
    >
      <span
        data-testid={`task-name-${task.id}`}
        className={cn(!isActive && 'line-through')}
      >
        {task.name}
      </span>

      <div className="flex items-center gap-2">
        <EditTaskDialog task={task} />
        <Switch
          checked={isActive}
          onCheckedChange={handleToggle}
          disabled={isPending}
          aria-label={isActive ? 'Deactivate task' : 'Activate task'}
        />
      </div>
    </div>
  );
}
