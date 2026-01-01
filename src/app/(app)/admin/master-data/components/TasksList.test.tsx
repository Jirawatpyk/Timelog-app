/**
 * Tests for TasksList Component
 * Story 3.3: Task Management (AC: 1, 6)
 * Story 3.5: Master Data Admin UI Layout (AC: 2, 3, 4, 5, 7)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TasksList } from './TasksList';

// Mock Supabase client
const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    from: mockFrom,
  })),
}));

// Mock the client component to simplify testing
vi.mock('./TasksListClient', () => ({
  TasksListClient: ({ initialTasks }: { initialTasks: Array<{ id: string; name: string; active: boolean }> }) => (
    <div data-testid="tasks-list">
      {initialTasks.length === 0 ? (
        <p>No tasks yet</p>
      ) : (
        <table>
          <tbody>
            {initialTasks.map((task) => (
              <tr key={task.id} data-testid="task-row">
                <td className={!task.active ? 'line-through' : ''}>{task.name}</td>
                <td>{task.active ? 'Active' : 'Inactive'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button>Add Task</button>
    </div>
  ),
}));

describe('TasksList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      order: mockOrder,
    });
  });

  it('displays empty state when no tasks exist', async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });

    render(await TasksList());

    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
  });

  it('displays list of tasks with names', async () => {
    const mockTasks = [
      { id: '1', name: 'Translation', active: true, created_at: '2024-01-01' },
      { id: '2', name: 'Review', active: true, created_at: '2024-01-01' },
    ];
    mockOrder.mockResolvedValue({ data: mockTasks, error: null });

    render(await TasksList());

    expect(screen.getByText('Translation')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
  });

  it('displays active status for each task', async () => {
    const mockTasks = [
      { id: '1', name: 'Translation', active: true, created_at: '2024-01-01' },
      { id: '2', name: 'Review', active: false, created_at: '2024-01-01' },
    ];
    mockOrder.mockResolvedValue({ data: mockTasks, error: null });

    render(await TasksList());

    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('orders tasks by name', async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });

    await TasksList();

    expect(mockFrom).toHaveBeenCalledWith('tasks');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockOrder).toHaveBeenCalledWith('name');
  });

  it('has correct data-testid attribute', async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });

    render(await TasksList());

    expect(screen.getByTestId('tasks-list')).toBeInTheDocument();
  });

  it('renders Add Task button', async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });

    render(await TasksList());

    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
  });

  it('passes tasks to client component', async () => {
    const mockTasks = [
      { id: '1', name: 'Task 1', active: true, created_at: '2024-01-01' },
      { id: '2', name: 'Task 2', active: false, created_at: '2024-01-01' },
    ];
    mockOrder.mockResolvedValue({ data: mockTasks, error: null });

    render(await TasksList());

    const rows = screen.getAllByTestId('task-row');
    expect(rows).toHaveLength(2);
  });
});
