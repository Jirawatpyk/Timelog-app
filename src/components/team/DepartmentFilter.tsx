// src/components/team/DepartmentFilter.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { DepartmentOption } from '@/types/domain';

interface DepartmentFilterProps {
  departments: DepartmentOption[];
  currentFilter: string;
}

export function DepartmentFilter({ departments, currentFilter }: DepartmentFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === 'all') {
      params.delete('dept');
    } else {
      params.set('dept', value);
    }

    // Preserve other params (e.g., period)
    router.push(`/team?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="department-filter" className="text-sm font-medium">
        Department:
      </label>
      <Select value={currentFilter} onValueChange={handleFilterChange}>
        <SelectTrigger id="department-filter" className="w-[200px]">
          <SelectValue placeholder="All Departments" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Departments</SelectItem>
          {departments.map((dept) => (
            <SelectItem key={dept.id} value={dept.id}>
              {dept.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
