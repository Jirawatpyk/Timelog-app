import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DepartmentMultiSelect } from './DepartmentMultiSelect';
import type { DepartmentOption } from '@/types/domain';

const mockDepartments: DepartmentOption[] = [
  { id: 'dept-1', name: 'Engineering' },
  { id: 'dept-2', name: 'Marketing' },
  { id: 'dept-3', name: 'Sales' },
];

describe('DepartmentMultiSelect', () => {
  it('renders all departments as checkboxes', () => {
    render(
      <DepartmentMultiSelect
        value={[]}
        onChange={() => {}}
        departments={mockDepartments}
      />
    );

    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('Marketing')).toBeInTheDocument();
    expect(screen.getByText('Sales')).toBeInTheDocument();
  });

  it('shows checked state for selected departments', () => {
    render(
      <DepartmentMultiSelect
        value={['dept-1', 'dept-3']}
        onChange={() => {}}
        departments={mockDepartments}
      />
    );

    const engCheckbox = screen.getByRole('checkbox', { name: /engineering/i });
    const marketingCheckbox = screen.getByRole('checkbox', { name: /marketing/i });
    const salesCheckbox = screen.getByRole('checkbox', { name: /sales/i });

    expect(engCheckbox).toBeChecked();
    expect(marketingCheckbox).not.toBeChecked();
    expect(salesCheckbox).toBeChecked();
  });

  it('calls onChange with added department when clicking unchecked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <DepartmentMultiSelect
        value={['dept-1']}
        onChange={onChange}
        departments={mockDepartments}
      />
    );

    await user.click(screen.getByText('Marketing'));

    expect(onChange).toHaveBeenCalledWith(['dept-1', 'dept-2']);
  });

  it('calls onChange with removed department when clicking checked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <DepartmentMultiSelect
        value={['dept-1', 'dept-2']}
        onChange={onChange}
        departments={mockDepartments}
      />
    );

    await user.click(screen.getByText('Engineering'));

    expect(onChange).toHaveBeenCalledWith(['dept-2']);
  });

  it('shows empty state when no departments available', () => {
    render(
      <DepartmentMultiSelect
        value={[]}
        onChange={() => {}}
        departments={[]}
      />
    );

    expect(screen.getByText('No departments available')).toBeInTheDocument();
  });

  it('renders label "Managed Departments"', () => {
    render(
      <DepartmentMultiSelect
        value={[]}
        onChange={() => {}}
        departments={mockDepartments}
      />
    );

    expect(screen.getByText('Managed Departments')).toBeInTheDocument();
  });
});
