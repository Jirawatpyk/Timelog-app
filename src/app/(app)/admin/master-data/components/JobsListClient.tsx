/**
 * Jobs List Client Component
 * Story 3.6: Projects & Jobs Admin UI (AC: 5, 6, 7, 8, 10)
 * Updated: Enterprise Filter Pattern for mobile
 *
 * Client-side wrapper for jobs list with:
 * - Cascading Client -> Project filter
 * - Responsive FilterToolbar (desktop inline, mobile sheet)
 * - DataTable with sorting
 * - Search filtering
 * - Status filtering
 */

'use client';

import { useState, useMemo } from 'react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { FilterToolbar, FilterField, type FilterConfig } from '@/components/admin/FilterToolbar';
import { StatusFilter, type StatusFilterValue } from '@/components/admin/StatusFilter';
import { EmptyState } from '@/components/admin/EmptyState';
import { AddJobDialog } from '@/components/admin/AddJobDialog';
import { EditJobDialog } from '@/components/admin/EditJobDialog';
import { DeactivateConfirmDialog } from '@/components/admin/DeactivateConfirmDialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button as _Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toggleJobActive, checkJobUsage } from '@/actions/master-data';
import type { JobWithProject, Client, ProjectWithClient } from '@/types/domain';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Briefcase, Plus as _Plus } from 'lucide-react';

interface JobsListClientProps {
  initialJobs: JobWithProject[];
  clients: Client[];
  projects: ProjectWithClient[];
}

export function JobsListClient({ initialJobs, clients, projects }: JobsListClientProps) {
  const [jobs, setJobs] = useState(initialJobs);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Toggle state
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    job: JobWithProject | null;
    usageCount: number;
  }>({ open: false, job: null, usageCount: 0 });

  // Filter projects based on selected client
  const filteredProjects = useMemo(() => {
    if (clientFilter === 'all') return projects;
    return projects.filter((p) => p.client_id === clientFilter);
  }, [projects, clientFilter]);

  // Reset project filter when client changes
  const handleClientFilterChange = (newClientId: string) => {
    setClientFilter(newClientId);
    setProjectFilter('all');
  };

  // Get display values for filter chips
  const getClientDisplayValue = () => {
    if (clientFilter === 'all') return '';
    const client = clients.find((c) => c.id === clientFilter);
    return client?.name || '';
  };

  const getProjectDisplayValue = () => {
    if (projectFilter === 'all') return '';
    const project = projects.find((p) => p.id === projectFilter);
    return project?.name || '';
  };

  const getStatusDisplayValue = () => {
    if (statusFilter === 'all') return '';
    return statusFilter === 'active' ? 'Active' : 'Inactive';
  };

  // Filter configuration for FilterToolbar
  const filterConfigs: FilterConfig[] = [
    {
      key: 'client',
      label: 'Client',
      value: clientFilter,
      displayValue: getClientDisplayValue(),
    },
    {
      key: 'project',
      label: 'Project',
      value: projectFilter,
      displayValue: getProjectDisplayValue(),
    },
    {
      key: 'status',
      label: 'Status',
      value: statusFilter,
      displayValue: getStatusDisplayValue(),
    },
  ];

  const handleFilterRemove = (key: string) => {
    switch (key) {
      case 'client':
        setClientFilter('all');
        setProjectFilter('all');
        break;
      case 'project':
        setProjectFilter('all');
        break;
      case 'status':
        setStatusFilter('all');
        break;
    }
  };

  const handleFiltersClear = () => {
    setClientFilter('all');
    setProjectFilter('all');
    setStatusFilter('all');
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        job.name.toLowerCase().includes(search.toLowerCase()) ||
        job.projectName.toLowerCase().includes(search.toLowerCase()) ||
        job.clientName.toLowerCase().includes(search.toLowerCase()) ||
        (job.job_no?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (job.so_no?.toLowerCase().includes(search.toLowerCase()) ?? false);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && job.active) ||
        (statusFilter === 'inactive' && !job.active);

      const matchesClient =
        clientFilter === 'all' || job.clientId === clientFilter;

      const matchesProject =
        projectFilter === 'all' || job.project_id === projectFilter;

      return matchesSearch && matchesStatus && matchesClient && matchesProject;
    });
  }, [jobs, search, statusFilter, clientFilter, projectFilter]);

  const handleToggle = async (job: JobWithProject) => {
    if (job.active) {
      setPendingId(job.id);
      const usageResult = await checkJobUsage(job.id);
      setPendingId(null);

      if (!usageResult.success) {
        toast.error(usageResult.error);
        return;
      }

      setConfirmDialog({
        open: true,
        job,
        usageCount: usageResult.data.count,
      });
      return;
    }

    await performToggle(job);
  };

  const performToggle = async (job: JobWithProject) => {
    const newActive = !job.active;

    setJobs((prev) =>
      prev.map((j) => (j.id === job.id ? { ...j, active: newActive } : j))
    );
    setPendingId(job.id);

    const result = await toggleJobActive(job.id, newActive);
    setPendingId(null);
    setConfirmDialog({ open: false, job: null, usageCount: 0 });

    if (!result.success) {
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, active: job.active } : j))
      );
      toast.error(result.error);
    } else {
      toast.success(newActive ? 'Job activated' : 'Job deactivated');
    }
  };

  const handleJobUpdated = (updated: JobWithProject) => {
    setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
  };

  const handleJobCreated = (created: JobWithProject) => {
    setJobs((prev) =>
      [...prev, created].sort((a, b) => a.name.localeCompare(b.name))
    );
    setAddDialogOpen(false);
  };

  const columns: Column<JobWithProject>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      className: 'max-w-[120px] sm:max-w-none',
      render: (job) => (
        <span
          className={cn(
            'block truncate',
            !job.active && 'line-through text-muted-foreground'
          )}
          title={job.name}
        >
          {job.name}
        </span>
      ),
    },
    {
      key: 'job_no',
      header: 'Job No',
      sortable: true,
      hideOnMobile: true,
      render: (job) => (
        <span className="text-muted-foreground">{job.job_no || '-'}</span>
      ),
    },
    {
      key: 'so_no',
      header: 'SO No',
      sortable: true,
      hideOnMobile: true,
      render: (job) => (
        <span className="text-muted-foreground">{job.so_no || '-'}</span>
      ),
    },
    {
      key: 'projectName',
      header: 'Project',
      sortable: true,
      hideOnMobile: true,
      render: (job) => (
        <span className="text-muted-foreground">{job.projectName}</span>
      ),
    },
    {
      key: 'active',
      header: 'Status',
      sortable: true,
      hideOnMobile: true,
      render: (job) => (
        <Badge variant={job.active ? 'default' : 'secondary'}>
          {job.active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right w-[120px]',
      render: (job) => (
        <div className="flex items-center justify-end gap-2 min-h-[44px]">
          <EditJobDialog job={job} onJobUpdated={handleJobUpdated} />
          <Switch
            checked={job.active ?? true}
            onCheckedChange={() => handleToggle(job)}
            disabled={pendingId === job.id}
            aria-label={job.active ? 'Deactivate job' : 'Activate job'}
            className="touch-manipulation"
          />
        </div>
      ),
    },
  ];

  // Desktop filter controls
  const desktopFilters = (
    <>
      <Select value={clientFilter} onValueChange={handleClientFilterChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Clients" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Clients</SelectItem>
          {clients.map((client) => (
            <SelectItem key={client.id} value={client.id}>
              {client.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={projectFilter} onValueChange={setProjectFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Projects" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Projects</SelectItem>
          {filteredProjects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <StatusFilter
        value={statusFilter}
        onChange={setStatusFilter}
        className="w-[140px]"
      />
    </>
  );

  // Mobile filter controls (in sheet)
  const mobileFilters = (
    <>
      <FilterField label="Client">
        <Select value={clientFilter} onValueChange={handleClientFilterChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Clients" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Project">
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {filteredProjects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Status">
        <StatusFilter
          value={statusFilter}
          onChange={setStatusFilter}
          className="w-full"
        />
      </FilterField>
    </>
  );

  if (jobs.length === 0) {
    return (
      <div data-testid="jobs-list">
        <EmptyState
          title="No jobs yet"
          description="Add your first job to get started."
          actionLabel="Add Job"
          onAction={() => setAddDialogOpen(true)}
          icon={<Briefcase className="h-8 w-8 text-muted-foreground" />}
        />
        <AddJobDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onJobCreated={handleJobCreated}
          clients={clients}
          projects={projects}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="jobs-list">
      <FilterToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search jobs..."
        filters={filterConfigs}
        onFilterRemove={handleFilterRemove}
        onFiltersClear={handleFiltersClear}
        desktopFilters={desktopFilters}
        mobileFilters={mobileFilters}
        addButton={{
          label: 'Add Job',
          onClick: () => setAddDialogOpen(true),
        }}
      />

      {filteredJobs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No jobs match your filters
        </div>
      ) : (
        <DataTable data={filteredJobs} columns={columns} keyField="id" />
      )}

      <AddJobDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onJobCreated={handleJobCreated}
        clients={clients}
        projects={projects}
      />

      {confirmDialog.job && (
        <DeactivateConfirmDialog
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
          itemName={confirmDialog.job.name}
          itemType="job"
          usageCount={confirmDialog.usageCount}
          usageLabel="time entries"
          onConfirm={() => performToggle(confirmDialog.job!)}
          isPending={pendingId === confirmDialog.job?.id}
        />
      )}
    </div>
  );
}
