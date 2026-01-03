/**
 * Projects List Client Component
 * Story 3.6: Projects & Jobs Admin UI (AC: 1, 2, 3, 4, 10)
 * Updated: Enterprise Filter Pattern for mobile
 *
 * Client-side wrapper for projects list with:
 * - Client filter dropdown
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
import { AddProjectDialog } from '@/components/admin/AddProjectDialog';
import { EditProjectDialog } from '@/components/admin/EditProjectDialog';
import { DeactivateConfirmDialog } from '@/components/admin/DeactivateConfirmDialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toggleProjectActive, checkProjectUsage } from '@/actions/master-data';
import type { ProjectWithClient, Client } from '@/types/domain';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { FolderKanban } from 'lucide-react';

interface ProjectsListClientProps {
  initialProjects: ProjectWithClient[];
  clients: Client[];
}

export function ProjectsListClient({ initialProjects, clients }: ProjectsListClientProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Toggle state
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    project: ProjectWithClient | null;
    usageCount: number;
  }>({ open: false, project: null, usageCount: 0 });

  // Get display values for filter chips
  const getClientDisplayValue = () => {
    if (clientFilter === 'all') return '';
    const client = clients.find((c) => c.id === clientFilter);
    return client?.name || '';
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
        break;
      case 'status':
        setStatusFilter('all');
        break;
    }
  };

  const handleFiltersClear = () => {
    setClientFilter('all');
    setStatusFilter('all');
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(search.toLowerCase()) ||
        project.clientName.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && project.active) ||
        (statusFilter === 'inactive' && !project.active);

      const matchesClient =
        clientFilter === 'all' || project.client_id === clientFilter;

      return matchesSearch && matchesStatus && matchesClient;
    });
  }, [projects, search, statusFilter, clientFilter]);

  const handleToggle = async (project: ProjectWithClient) => {
    if (project.active) {
      setPendingId(project.id);
      const usageResult = await checkProjectUsage(project.id);
      setPendingId(null);

      if (!usageResult.success) {
        toast.error(usageResult.error);
        return;
      }

      setConfirmDialog({
        open: true,
        project,
        usageCount: usageResult.data.count,
      });
      return;
    }

    await performToggle(project);
  };

  const performToggle = async (project: ProjectWithClient) => {
    const newActive = !project.active;

    setProjects((prev) =>
      prev.map((p) =>
        p.id === project.id ? { ...p, active: newActive } : p
      )
    );
    setPendingId(project.id);

    const result = await toggleProjectActive(project.id, newActive);
    setPendingId(null);
    setConfirmDialog({ open: false, project: null, usageCount: 0 });

    if (!result.success) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === project.id ? { ...p, active: project.active } : p
        )
      );
      toast.error(result.error);
    } else {
      toast.success(newActive ? 'Project activated' : 'Project deactivated');
    }
  };

  const handleProjectUpdated = (updated: ProjectWithClient) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  const handleProjectCreated = (created: ProjectWithClient) => {
    setProjects((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    setAddDialogOpen(false);
  };

  const columns: Column<ProjectWithClient>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      className: 'max-w-[150px] sm:max-w-none',
      render: (project) => (
        <span
          className={cn(
            'block truncate',
            !project.active && 'line-through text-muted-foreground'
          )}
          title={project.name}
        >
          {project.name}
        </span>
      ),
    },
    {
      key: 'clientName',
      header: 'Client',
      sortable: true,
      hideOnMobile: true,
      render: (project) => (
        <span className="text-muted-foreground">{project.clientName}</span>
      ),
    },
    {
      key: 'active',
      header: 'Status',
      sortable: true,
      hideOnMobile: true,
      render: (project) => (
        <Badge variant={project.active ? 'default' : 'secondary'}>
          {project.active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right w-[120px]',
      render: (project) => (
        <div className="flex items-center justify-end gap-2 min-h-[44px]">
          <EditProjectDialog
            project={project}
            onProjectUpdated={handleProjectUpdated}
          />
          <Switch
            checked={project.active ?? true}
            onCheckedChange={() => handleToggle(project)}
            disabled={pendingId === project.id}
            aria-label={project.active ? 'Deactivate project' : 'Activate project'}
            className="touch-manipulation"
          />
        </div>
      ),
    },
  ];

  // Desktop filter controls
  const desktopFilters = (
    <>
      <Select value={clientFilter} onValueChange={setClientFilter}>
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
        <Select value={clientFilter} onValueChange={setClientFilter}>
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

      <FilterField label="Status">
        <StatusFilter
          value={statusFilter}
          onChange={setStatusFilter}
          className="w-full"
        />
      </FilterField>
    </>
  );

  if (projects.length === 0) {
    return (
      <div data-testid="projects-list">
        <EmptyState
          title="No projects yet"
          description="Add your first project to get started."
          actionLabel="Add Project"
          onAction={() => setAddDialogOpen(true)}
          icon={<FolderKanban className="h-8 w-8 text-muted-foreground" />}
        />
        <AddProjectDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onProjectCreated={handleProjectCreated}
          clients={clients}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="projects-list">
      <FilterToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search projects..."
        filters={filterConfigs}
        onFilterRemove={handleFilterRemove}
        onFiltersClear={handleFiltersClear}
        desktopFilters={desktopFilters}
        mobileFilters={mobileFilters}
        addButtonSlot={
          <AddProjectDialog
            onProjectCreated={handleProjectCreated}
            clients={clients}
          />
        }
      />

      {filteredProjects.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No projects match your filters
        </div>
      ) : (
        <DataTable
          data={filteredProjects}
          columns={columns}
          keyField="id"
        />
      )}

      {confirmDialog.project && (
        <DeactivateConfirmDialog
          open={confirmDialog.open}
          onOpenChange={(open) =>
            setConfirmDialog({ ...confirmDialog, open })
          }
          itemName={confirmDialog.project.name}
          itemType="project"
          usageCount={confirmDialog.usageCount}
          usageLabel="jobs"
          onConfirm={() => performToggle(confirmDialog.project!)}
          isPending={pendingId === confirmDialog.project?.id}
        />
      )}
    </div>
  );
}
