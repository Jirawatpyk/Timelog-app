// src/components/team/NotLoggedMemberCard.tsx
'use client';

import { MemberAvatar } from '@/components/team/MemberAvatar';
import { isAfter5PM } from '@/lib/utils/time-indicator';
import type { TeamMemberWithStats } from '@/types/team';

interface NotLoggedMemberCardProps {
  member: TeamMemberWithStats;
}

export function NotLoggedMemberCard({ member }: NotLoggedMemberCardProps) {
  const { displayName } = member;
  const showWarningDot = isAfter5PM();

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-card border">
      {/* Avatar */}
      <MemberAvatar name={displayName} size="md" />

      {/* Name only - no hours for not logged members */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{displayName}</p>
      </div>

      {/* Subtle warning dot after 5 PM only */}
      {showWarningDot && (
        <div
          className="h-2 w-2 rounded-full bg-orange-400"
          title="After 17:00 - not logged yet"
        />
      )}
    </div>
  );
}
