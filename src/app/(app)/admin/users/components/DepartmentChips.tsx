'use client';

import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { DepartmentOption } from '@/types/domain';

interface DepartmentChipsProps {
  departments: DepartmentOption[];
  /** Maximum departments to show before overflow (+N) */
  maxShow?: number;
}

/**
 * Display assigned departments as badges with overflow handling
 * Story 7.6: Assign Manager Departments (Task 4)
 *
 * Shows maxShow departments, then "+N" badge with tooltip for the rest
 */
export function DepartmentChips({ departments, maxShow = 2 }: DepartmentChipsProps) {
  if (departments.length === 0) {
    return (
      <Badge variant="outline" className="text-xs text-muted-foreground">
        No departments
      </Badge>
    );
  }

  const visible = departments.slice(0, maxShow);
  const remaining = departments.length - maxShow;

  return (
    <TooltipProvider>
      <div className="flex gap-1 flex-wrap">
        {visible.map((dept) => (
          <Badge key={dept.id} variant="secondary" className="text-xs">
            {dept.name}
          </Badge>
        ))}
        {remaining > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-xs cursor-help">
                +{remaining}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {departments.slice(maxShow).map((d) => d.name).join(', ')}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
