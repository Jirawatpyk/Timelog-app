'use client';

import { useProjects } from '@/hooks/use-entry-data';
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

interface ProjectSelectorProps {
  clientId: string | null;
  value: string;
  onChange: (projectId: string) => void;
  disabled?: boolean;
  error?: string;
}

/**
 * Project Selector Component
 * Story 4.2 - AC2, AC3, AC5, AC6, AC7:
 * - Enabled after client selection
 * - Shows loading state while fetching
 * - Shows "No projects available" when empty
 * - Clears when client changes
 */
export function ProjectSelector({
  clientId,
  value,
  onChange,
  disabled,
  error,
}: ProjectSelectorProps) {
  const { data: projects, isLoading, isFetching, isError, refetch } = useProjects(clientId);

  const showLoading = (isLoading || isFetching) && !!clientId;

  if (showLoading) {
    return (
      <div className="space-y-2">
        <Label>Project</Label>
        <Skeleton className="h-11 w-full rounded-md" data-testid="project-selector-loading" />
      </div>
    );
  }

  if (isError && clientId) {
    return (
      <div className="space-y-2">
        <Label>Project</Label>
        <div className="flex items-center gap-2" data-testid="project-selector-error">
          <span className="text-sm text-destructive">Failed to load projects</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            data-testid="project-selector-retry"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="projectId">Project *</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          id="projectId"
          className={`w-full ${error ? 'border-destructive' : ''}`}
          data-testid="project-selector"
        >
          <SelectValue
            placeholder={disabled ? 'Select client first' : 'Select a project'}
          />
        </SelectTrigger>
        <SelectContent>
          {projects && projects.length > 0 ? (
            projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))
          ) : (
            <div className="py-2 px-2 text-sm text-muted-foreground">
              No projects available
            </div>
          )}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    </div>
  );
}
