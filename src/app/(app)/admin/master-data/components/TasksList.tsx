/**
 * Tasks List Component (Server Component)
 * Story 3.3: Task Management (AC: 1, 6)
 *
 * Displays list of all tasks with active/inactive visual distinction.
 * - Inactive tasks appear with reduced opacity and strikethrough text
 * - Admin can see both active and inactive tasks
 * - Each task has edit and toggle active functionality
 */

import { createClient } from '@/lib/supabase/server';
import { AddTaskDialog } from '@/components/admin/AddTaskDialog';
import { TaskItem } from './TaskItem';

export async function TasksList() {
  const supabase = await createClient();

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .order('name');

  if (error) {
    return (
      <div className="space-y-4" data-testid="tasks-list">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Tasks</h2>
        </div>
        <p className="text-destructive">Failed to load tasks. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="tasks-list">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Tasks</h2>
        <AddTaskDialog />
      </div>

      <div className="space-y-2">
        {tasks?.length === 0 && (
          <p className="text-muted-foreground">No tasks found.</p>
        )}
        {tasks?.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
