'use client';

import { useJobs } from '@/hooks/use-entry-data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import type { Job } from '@/types/domain';

interface JobSelectorProps {
  projectId: string | null;
  value: string;
  onChange: (jobId: string) => void;
  disabled?: boolean;
  error?: string;
}

/**
 * Format job display string
 * Story 4.2 - AC3: Jobs display as "{job_no} - {name}" or just "{name}" if no job_no
 */
function formatJobDisplay(job: Job): string {
  if (job.job_no) {
    return `${job.job_no} - ${job.name}`;
  }
  return job.name;
}

/**
 * Job Selector Component
 * Story 4.2 - AC3, AC4, AC5, AC6, AC7:
 * - Enabled after project selection
 * - Shows loading state while fetching
 * - Shows "No jobs available" when empty
 * - Displays job_no - name format
 * - Clears when project changes
 */
export function JobSelector({
  projectId,
  value,
  onChange,
  disabled,
  error,
}: JobSelectorProps) {
  const { data: jobs, isLoading, isFetching, isError, refetch } = useJobs(projectId);

  const showLoading = (isLoading || isFetching) && !!projectId;

  if (showLoading) {
    return (
      <div className="space-y-2">
        <Label>Job</Label>
        <Skeleton className="h-11 w-full rounded-md" data-testid="job-selector-loading" />
      </div>
    );
  }

  if (isError && projectId) {
    return (
      <div className="space-y-2">
        <Label>Job</Label>
        <div className="flex items-center gap-2" data-testid="job-selector-error">
          <span className="text-sm text-destructive">Failed to load jobs</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            data-testid="job-selector-retry"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="jobId">Job *</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          id="jobId"
          className={`w-full ${error ? 'border-destructive' : ''}`}
          data-testid="job-selector"
        >
          <SelectValue
            placeholder={disabled ? 'Select project first' : 'Select a job'}
          />
        </SelectTrigger>
        <SelectContent>
          {jobs && jobs.length > 0 ? (
            jobs.map((job) => (
              <SelectItem key={job.id} value={job.id}>
                {formatJobDisplay(job)}
              </SelectItem>
            ))
          ) : (
            <div className="py-2 px-2 text-sm text-muted-foreground">
              No jobs available
            </div>
          )}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    </div>
  );
}
