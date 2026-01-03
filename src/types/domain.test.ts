import { describe, expect, it } from 'vitest';
import type { DepartmentOption, DepartmentFilter } from './domain';

describe('DepartmentOption', () => {
  it('should have id and name fields', () => {
    const option: DepartmentOption = {
      id: 'dept-1',
      name: 'Engineering',
    };

    expect(option.id).toBe('dept-1');
    expect(option.name).toBe('Engineering');
  });

  it('should allow creating multiple department options', () => {
    const options: DepartmentOption[] = [
      { id: 'dept-1', name: 'Engineering' },
      { id: 'dept-2', name: 'Marketing' },
      { id: 'dept-3', name: 'Sales' },
    ];

    expect(options).toHaveLength(3);
    expect(options[0].name).toBe('Engineering');
    expect(options[2].id).toBe('dept-3');
  });
});

describe('DepartmentFilter', () => {
  it('should accept "all" as value', () => {
    const filter: DepartmentFilter = 'all';
    expect(filter).toBe('all');
  });

  it('should accept department ID as value', () => {
    const filter: DepartmentFilter = 'dept-uuid-123';
    expect(filter).toBe('dept-uuid-123');
  });

  it('should be compatible with string type', () => {
    const filter: DepartmentFilter = 'all';
    const urlParam: string = filter;
    expect(urlParam).toBe('all');
  });

  it('should allow type checking for all vs specific department', () => {
    const filter: DepartmentFilter = 'all';
    const isAllDepartments = filter === 'all';
    const isSpecificDepartment = filter !== 'all';

    expect(isAllDepartments).toBe(true);
    expect(isSpecificDepartment).toBe(false);
  });
});
