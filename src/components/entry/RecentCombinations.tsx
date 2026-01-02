'use client';

import { Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRecentCombinations } from '@/hooks/use-entry-data';
import { cn } from '@/lib/utils';
import type { RecentCombination } from '@/types/domain';

interface RecentCombinationsProps {
  onSelect: (combination: RecentCombination) => void;
}

/**
 * Recent Combinations Component
 * Story 4.7 - AC1: Display up to 5 recent combinations
 * Story 4.7 - AC2: Format as Client > Project > Job > Service (Task)
 * Story 4.7 - AC5: Empty state for new users
 * Story 4.7 - AC6: Loading skeleton
 */
export function RecentCombinations({ onSelect }: RecentCombinationsProps) {
  const { data: combinations, isLoading, error } = useRecentCombinations();

  if (isLoading) {
    return <RecentCombinationsSkeleton />;
  }

  if (error) {
    // Silently fail - not critical for entry flow
    return null;
  }

  if (!combinations || combinations.length === 0) {
    return <EmptyRecentCombinations />;
  }

  return (
    <div className="space-y-3" data-testid="recent-combinations">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>Recent</span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {combinations.map((combo) => (
          <CombinationCard
            key={combo.id}
            combination={combo}
            onClick={() => onSelect(combo)}
          />
        ))}
      </div>
    </div>
  );
}

interface CombinationCardProps {
  combination: RecentCombination;
  onClick: () => void;
}

/**
 * Individual combination card
 * Story 4.7 - AC2: Display Client > Project > Job > Service (Task)
 */
function CombinationCard({ combination, onClick }: CombinationCardProps) {
  const { client, project, job, service, task } = combination;

  return (
    <button
      type="button"
      onClick={onClick}
      data-testid="combination-card"
      className={cn(
        'flex-shrink-0 w-[280px] p-3 rounded-lg border bg-card',
        'text-left transition-colors',
        'hover:bg-accent hover:border-accent-foreground/20',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'touch-manipulation'
      )}
    >
      <div className="space-y-1">
        {/* Client > Project */}
        <p className="text-sm font-medium truncate">
          {client.name} &rsaquo; {project.name}
        </p>

        {/* Job */}
        <p className="text-sm text-muted-foreground truncate">
          {job.jobNo ? `${job.jobNo} - ` : ''}{job.name}
        </p>

        {/* Service (Task) */}
        <p className="text-xs text-muted-foreground truncate">
          {service.name}
          {task && ` \u2022 ${task.name}`}
        </p>
      </div>
    </button>
  );
}

/**
 * Loading skeleton
 * Story 4.7 - AC6: Match final layout to prevent shift
 */
function RecentCombinationsSkeleton() {
  return (
    <div className="space-y-3" data-testid="recent-combinations-skeleton">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-16" />
      </div>

      <div className="flex gap-2 overflow-hidden">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="flex-shrink-0 w-[280px] h-[76px] rounded-lg" />
        ))}
      </div>
    </div>
  );
}

/**
 * Empty state
 * Story 4.7 - AC5: Show hint for first-time users
 */
function EmptyRecentCombinations() {
  return (
    <div className="py-4 text-center text-sm text-muted-foreground" data-testid="recent-combinations-empty">
      <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p>No recent entries</p>
      <p className="text-xs mt-1">Create your first entry to get started</p>
    </div>
  );
}
