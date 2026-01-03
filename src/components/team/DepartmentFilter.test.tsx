/**
 * DepartmentFilter Component Tests - Story 6.5
 *
 * Tests for department filter dropdown that allows managers to filter team members
 * by department when managing multiple departments.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DepartmentFilter } from './DepartmentFilter';

// Mock Next.js navigation
const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

describe('DepartmentFilter', () => {
  const mockDepartments = [
    { id: 'dept-1', name: 'Engineering' },
    { id: 'dept-2', name: 'Marketing' },
    { id: 'dept-3', name: 'Sales' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset shared URLSearchParams to prevent test pollution
    mockSearchParams.delete('period');
    mockSearchParams.delete('dept');
  });

  it('renders with all departments option', () => {
    render(<DepartmentFilter departments={mockDepartments} currentFilter="all" />);

    expect(screen.getByText('Department:')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('shows current selection', () => {
    render(<DepartmentFilter departments={mockDepartments} currentFilter="all" />);

    // Check that "All Departments" is selected
    expect(screen.getByRole('combobox')).toHaveTextContent('All Departments');
  });

  it('shows specific department when filter applied', () => {
    render(
      <DepartmentFilter departments={mockDepartments} currentFilter="dept-1" />
    );

    // Should show the selected department name
    expect(screen.getByRole('combobox')).toHaveTextContent('Engineering');
  });

  it('navigates to /team?dept=xxx when department selected', async () => {
    const user = userEvent.setup();

    render(<DepartmentFilter departments={mockDepartments} currentFilter="all" />);

    // Open dropdown
    await user.click(screen.getByRole('combobox'));

    // Select Engineering
    await user.click(screen.getByText('Engineering'));

    // Should push to router with dept param
    expect(mockPush).toHaveBeenCalledWith('/team?dept=dept-1');
  });

  it('removes dept param when "All Departments" selected', async () => {
    const user = userEvent.setup();

    render(
      <DepartmentFilter departments={mockDepartments} currentFilter="dept-1" />
    );

    // Open dropdown
    await user.click(screen.getByRole('combobox'));

    // Select "All Departments"
    await user.click(screen.getByText('All Departments'));

    // Should push to router without dept param
    expect(mockPush).toHaveBeenCalledWith('/team?');
  });

  it('preserves period param when changing department', async () => {
    const user = userEvent.setup();

    // Set existing period param
    mockSearchParams.set('period', 'week');

    render(<DepartmentFilter departments={mockDepartments} currentFilter="all" />);

    // Open dropdown
    await user.click(screen.getByRole('combobox'));

    // Select Marketing
    await user.click(screen.getByText('Marketing'));

    // Should preserve period param
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('period=week')
    );
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('dept=dept-2'));
  });

  it('renders all department options in dropdown', async () => {
    const user = userEvent.setup();

    render(<DepartmentFilter departments={mockDepartments} currentFilter="all" />);

    // Open dropdown
    await user.click(screen.getByRole('combobox'));

    // Check all departments are listed (using getAllByText since some appear in both trigger and dropdown)
    expect(screen.getAllByText('All Departments').length).toBeGreaterThan(0);
    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('Marketing')).toBeInTheDocument();
    expect(screen.getByText('Sales')).toBeInTheDocument();
  });

  it('has accessible label', () => {
    render(<DepartmentFilter departments={mockDepartments} currentFilter="all" />);

    const select = screen.getByRole('combobox');
    expect(select).toHaveAccessibleName('Department:');
  });
});
