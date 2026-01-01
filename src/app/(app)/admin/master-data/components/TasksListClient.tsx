/**
 * Tasks List Client Component
 * Story 3.5: Master Data Admin UI Layout (AC: 2, 3, 4, 5, 7)
 *
 * Client-side wrapper for tasks list with:
 * - DataTable with sorting
 * - Search filtering
 * - Status filtering
 * - Empty state
 */

'use client';

import { useState, useMemo } from 'react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { SearchInput } from '@/components/admin/SearchInput';
import { StatusFilter, type StatusFilterValue } from '@/components/admin/StatusFilter';
import { EmptyState } from '@/components/admin/EmptyState';
import { AddTaskDialog } from '@/components/admin/AddTaskDialog';
import { EditTaskDialog } from '@/components/admin/EditTaskDialog';
import { DeactivateConfirmDialog } from '@/components/admin/DeactivateConfirmDialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toggleTaskActive, checkTaskUsage } from '@/actions/master-data';
import type { Task } from '@/types/domain';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ListTodo } from 'lucide-react';

interface TasksListClientProps {
  initialTasks: Task[];
}

export function TasksListClient({ initialTasks }: TasksListClientProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Toggle state
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    task: Task | null;
    usageCount: number;
  }>({ open: false, task: null, usageCount: 0 });

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && task.active) ||
        (statusFilter === 'inactive' && !task.active);

      return matchesSearch && matchesStatus;
    });
  }, [tasks, search, statusFilter]);

  const handleToggle = async (task: Task) => {
    if (task.active) {
      setPendingId(task.id);
      const usageResult = await checkTaskUsage(task.id);
      setPendingId(null);

      if (!usageResult.success) {
        toast.error(usageResult.error);
        return;
      }

      setConfirmDialog({
        open: true,
        task,
        usageCount: usageResult.data.count,
      });
      return;
    }

    await performToggle(task);
  };

  const performToggle = async (task: Task) => {
    const newActive = !task.active;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, active: newActive } : t
      )
    );
    setPendingId(task.id);

    const result = await toggleTaskActive(task.id, newActive);
    setPendingId(null);
    setConfirmDialog({ open: false, task: null, usageCount: 0 });

    if (!result.success) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, active: task.active } : t
        )
      );
      toast.error(result.error);
    } else {
      toast.success(newActive ? 'Task activated' : 'Task deactivated');
    }
  };

  const handleTaskUpdated = (updated: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t))
    );
  };

  const handleTaskCreated = (created: Task) => {
    setTasks((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    setAddDialogOpen(false);
  };

  const columns: Column<Task>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (task) => (
        <span className={cn(!task.active && 'line-through text-muted-foreground')}>
          {task.name}
        </span>
      ),
    },
    {
      key: 'active',
      header: 'Status',
      sortable: true,
      render: (task) => (
        <Badge variant={task.active ? 'default' : 'secondary'}>
          {task.active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right w-[120px]',
      render: (task) => (
        <div className="flex items-center justify-end gap-2 min-h-[44px]">
          <EditTaskDialog
            task={task}
            onTaskUpdated={handleTaskUpdated}
          />
          <Switch
            checked={task.active ?? true}
            onCheckedChange={() => handleToggle(task)}
            disabled={pendingId === task.id}
            aria-label={task.active ? 'Deactivate task' : 'Activate task'}
            className="touch-manipulation"
          />
        </div>
      ),
    },
  ];

  if (tasks.length === 0) {
    return (
      <div data-testid="tasks-list">
        <EmptyState
          title="No tasks yet"
          description="Add your first task to get started."
          actionLabel="Add Task"
          onAction={() => setAddDialogOpen(true)}
          icon={<ListTodo className="h-8 w-8 text-muted-foreground" />}
        />
        <AddTaskDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onTaskCreated={handleTaskCreated}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="tasks-list">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1 max-w-md">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search tasks..."
          />
          <StatusFilter value={statusFilter} onChange={setStatusFilter} />
        </div>
        <AddTaskDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onTaskCreated={handleTaskCreated}
        />
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No tasks match your filters
        </div>
      ) : (
        <DataTable
          data={filteredTasks}
          columns={columns}
          keyField="id"
        />
      )}

      {confirmDialog.task && (
        <DeactivateConfirmDialog
          open={confirmDialog.open}
          onOpenChange={(open) =>
            setConfirmDialog({ ...confirmDialog, open })
          }
          itemName={confirmDialog.task.name}
          itemType="task"
          usageCount={confirmDialog.usageCount}
          onConfirm={() => performToggle(confirmDialog.task!)}
          isPending={pendingId === confirmDialog.task?.id}
        />
      )}
    </div>
  );
}
