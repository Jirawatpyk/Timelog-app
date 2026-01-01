/**
 * Tasks List Component (Server Component)
 * Story 3.3: Task Management (AC: 1, 6)
 * Story 3.5: Master Data Admin UI Layout (AC: 2, 3, 4, 5, 7)
 *
 * Server component that fetches tasks and passes to client component
 * for interactive features like sorting, searching, and filtering.
 */

import { createClient } from '@/lib/supabase/server';
import { TasksListClient } from './TasksListClient';

export async function TasksList() {
  const supabase = await createClient();

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .order('name');

  if (error) {
    return (
      <div className="space-y-4" data-testid="tasks-list">
        <p className="text-destructive">Failed to load tasks. Please try again.</p>
      </div>
    );
  }

  return <TasksListClient initialTasks={tasks ?? []} />;
}
