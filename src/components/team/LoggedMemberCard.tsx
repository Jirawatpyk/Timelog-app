// src/components/team/LoggedMemberCard.tsx
import { Check } from 'lucide-react';
import { MemberAvatar } from '@/components/team/MemberAvatar';
import { cn } from '@/lib/utils';
import type { TeamMemberWithStats } from '@/types/team';

interface LoggedMemberCardProps {
  member: TeamMemberWithStats;
  showDepartmentName?: boolean;
}

export function LoggedMemberCard({
  member,
  showDepartmentName = false,
}: LoggedMemberCardProps) {
  const { displayName, totalHours, entryCount, isComplete, departmentName } = member;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-card border">
      {/* Avatar */}
      <MemberAvatar name={displayName} size="md" />

      {/* Name and entries */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm truncate">{displayName}</p>
          {showDepartmentName && (
            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {departmentName}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
        </p>
      </div>

      {/* Hours and indicator */}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'text-sm font-semibold',
            isComplete ? 'text-green-600' : 'text-foreground'
          )}
        >
          {totalHours.toFixed(1)} hrs
        </span>

        {isComplete && (
          <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="h-3 w-3 text-green-600 lucide-check" />
          </div>
        )}
      </div>
    </div>
  );
}
