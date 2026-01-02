'use client';

import { useTasks } from '@/hooks/use-entry-data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface TaskSelectorProps {
  value: string | null;
  onChange: (taskId: string | null) => void;
  error?: string;
}

/**
 * Task Selector Component
 * Story 4.3 - AC2: Optional task selector with clear functionality
 */
export function TaskSelector({ value, onChange, error }: TaskSelectorProps) {
  const { data: tasks, isLoading, isError, refetch } = useTasks();

  const handleClear = () => {
    onChange(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Task <span className="text-muted-foreground">(Optional)</span></Label>
        <Skeleton className="h-10 w-full" data-testid="task-selector-loading" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-2">
        <Label>Task <span className="text-muted-foreground">(Optional)</span></Label>
        <div className="flex items-center gap-2" data-testid="task-selector-error">
          <span className="text-sm text-destructive">Failed to load tasks</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            data-testid="task-selector-retry"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="taskId">
        Task <span className="text-muted-foreground">(Optional)</span>
      </Label>
      <div className="flex gap-2">
        <Select
          value={value ?? ''}
          onValueChange={(val) => onChange(val || null)}
        >
          <SelectTrigger
            id="taskId"
            className={`flex-1 ${error ? 'border-destructive' : ''}`}
            data-testid="task-selector"
          >
            <SelectValue placeholder="Select a task (optional)" />
          </SelectTrigger>
          <SelectContent>
            {tasks && tasks.length > 0 ? (
              tasks.map((task) => (
                <SelectItem key={task.id} value={task.id}>
                  {task.name}
                </SelectItem>
              ))
            ) : (
              <div className="py-2 px-2 text-sm text-muted-foreground">
                No tasks available
              </div>
            )}
          </SelectContent>
        </Select>
        {value && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleClear}
            aria-label="Clear task"
            data-testid="task-selector-clear"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    </div>
  );
}
