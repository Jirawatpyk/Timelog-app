import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DepartmentChips } from './DepartmentChips';
import type { DepartmentOption } from '@/types/domain';

const mockDepartments: DepartmentOption[] = [
  { id: 'dept-1', name: 'Engineering' },
  { id: 'dept-2', name: 'Marketing' },
  { id: 'dept-3', name: 'Sales' },
  { id: 'dept-4', name: 'HR' },
];

describe('DepartmentChips', () => {
  it('shows "No departments" badge when empty', () => {
    render(<DepartmentChips departments={[]} />);

    expect(screen.getByText('No departments')).toBeInTheDocument();
  });

  it('shows all departments when count <= maxShow', () => {
    render(
      <DepartmentChips
        departments={[mockDepartments[0], mockDepartments[1]]}
        maxShow={2}
      />
    );

    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('Marketing')).toBeInTheDocument();
    expect(screen.queryByText(/\+/)).not.toBeInTheDocument();
  });

  it('shows overflow badge when count > maxShow', () => {
    render(<DepartmentChips departments={mockDepartments} maxShow={2} />);

    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('Marketing')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
    expect(screen.queryByText('Sales')).not.toBeInTheDocument();
    expect(screen.queryByText('HR')).not.toBeInTheDocument();
  });

  it('shows tooltip with remaining departments on hover', async () => {
    const user = userEvent.setup();
    render(<DepartmentChips departments={mockDepartments} maxShow={2} />);

    const overflowBadge = screen.getByText('+2');
    await user.hover(overflowBadge);

    // Tooltip should show remaining departments (check by role)
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Sales, HR');
  });

  it('uses default maxShow of 2', () => {
    render(
      <DepartmentChips
        departments={[mockDepartments[0], mockDepartments[1], mockDepartments[2]]}
      />
    );

    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('Marketing')).toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('renders single department without overflow', () => {
    render(<DepartmentChips departments={[mockDepartments[0]]} maxShow={2} />);

    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.queryByText(/\+/)).not.toBeInTheDocument();
  });

  it('respects custom maxShow value', () => {
    render(<DepartmentChips departments={mockDepartments} maxShow={3} />);

    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('Marketing')).toBeInTheDocument();
    expect(screen.getByText('Sales')).toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
  });
});
