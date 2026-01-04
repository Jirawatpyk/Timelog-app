'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { DepartmentOption } from '@/types/domain';

interface DepartmentMultiSelectProps {
  value: string[];
  onChange: (ids: string[]) => void;
  departments: DepartmentOption[];
}

/**
 * Multi-select component for department assignment
 * Story 7.6: Assign Manager Departments (Task 2)
 */
export function DepartmentMultiSelect({
  value,
  onChange,
  departments,
}: DepartmentMultiSelectProps) {
  const handleToggle = (deptId: string, checked: boolean) => {
    if (checked) {
      onChange([...value, deptId]);
    } else {
      onChange(value.filter((id) => id !== deptId));
    }
  };

  if (departments.length === 0) {
    return (
      <div className="space-y-2">
        <Label>Managed Departments</Label>
        <p className="text-sm text-muted-foreground">No departments available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Managed Departments</Label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {departments.map((dept) => (
          <label
            key={dept.id}
            className="flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-muted transition-colors"
          >
            <Checkbox
              id={`dept-${dept.id}`}
              checked={value.includes(dept.id)}
              onCheckedChange={(checked) => handleToggle(dept.id, !!checked)}
            />
            <span className="text-sm">{dept.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
