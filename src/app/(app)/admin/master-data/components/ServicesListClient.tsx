/**
 * Services List Client Component
 * Story 3.5: Master Data Admin UI Layout (AC: 2, 3, 4, 5, 7)
 *
 * Client-side wrapper for services list with:
 * - DataTable with sorting
 * - Search filtering
 * - Status filtering
 * - Empty state
 */

'use client';

import { useState, useMemo } from 'react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { FilterToolbar, FilterField, type FilterConfig } from '@/components/admin/FilterToolbar';
import { StatusFilter, type StatusFilterValue } from '@/components/admin/StatusFilter';
import { EmptyState } from '@/components/admin/EmptyState';
import { AddServiceDialog } from '@/components/admin/AddServiceDialog';
import { EditServiceDialog } from '@/components/admin/EditServiceDialog';
import { DeactivateConfirmDialog } from '@/components/admin/DeactivateConfirmDialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toggleServiceActive, checkServiceUsage } from '@/actions/master-data';
import type { Service } from '@/types/domain';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Briefcase } from 'lucide-react';

interface ServicesListClientProps {
  initialServices: Service[];
}

export function ServicesListClient({ initialServices }: ServicesListClientProps) {
  const [services, setServices] = useState(initialServices);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Toggle state
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    service: Service | null;
    usageCount: number;
  }>({ open: false, service: null, usageCount: 0 });

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch = service.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && service.active) ||
        (statusFilter === 'inactive' && !service.active);

      return matchesSearch && matchesStatus;
    });
  }, [services, search, statusFilter]);

  const handleToggle = async (service: Service) => {
    // If deactivating, check usage first
    if (service.active) {
      setPendingId(service.id);
      const usageResult = await checkServiceUsage(service.id);
      setPendingId(null);

      if (!usageResult.success) {
        toast.error(usageResult.error);
        return;
      }

      setConfirmDialog({
        open: true,
        service,
        usageCount: usageResult.data.count,
      });
      return;
    }

    // Activating - no confirmation needed
    await performToggle(service);
  };

  const performToggle = async (service: Service) => {
    const newActive = !service.active;

    // Optimistic update
    setServices((prev) =>
      prev.map((s) =>
        s.id === service.id ? { ...s, active: newActive } : s
      )
    );
    setPendingId(service.id);

    const result = await toggleServiceActive(service.id, newActive);
    setPendingId(null);
    setConfirmDialog({ open: false, service: null, usageCount: 0 });

    if (!result.success) {
      // Revert on error
      setServices((prev) =>
        prev.map((s) =>
          s.id === service.id ? { ...s, active: service.active } : s
        )
      );
      toast.error(result.error);
    } else {
      toast.success(newActive ? 'Service activated' : 'Service deactivated');
    }
  };

  const handleServiceUpdated = (updated: Service) => {
    setServices((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
  };

  const handleServiceCreated = (created: Service) => {
    setServices((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    setAddDialogOpen(false);
  };

  // Get display value for filter chips
  const getStatusDisplayValue = () => {
    if (statusFilter === 'all') return '';
    return statusFilter === 'active' ? 'Active' : 'Inactive';
  };

  // Filter configuration for FilterToolbar
  const filterConfigs: FilterConfig[] = [
    {
      key: 'status',
      label: 'Status',
      value: statusFilter,
      displayValue: getStatusDisplayValue(),
    },
  ];

  const handleFilterRemove = (key: string) => {
    if (key === 'status') {
      setStatusFilter('all');
    }
  };

  const handleFiltersClear = () => {
    setStatusFilter('all');
  };

  // Desktop filter controls
  const desktopFilters = (
    <StatusFilter
      value={statusFilter}
      onChange={setStatusFilter}
      className="w-[140px]"
    />
  );

  // Mobile filter controls (in sheet)
  const mobileFilters = (
    <FilterField label="Status">
      <StatusFilter
        value={statusFilter}
        onChange={setStatusFilter}
        className="w-full"
      />
    </FilterField>
  );

  const columns: Column<Service>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      className: 'max-w-[200px] sm:max-w-none',
      render: (service) => (
        <span
          className={cn(
            'block truncate',
            !service.active && 'line-through text-muted-foreground'
          )}
          title={service.name}
        >
          {service.name}
        </span>
      ),
    },
    {
      key: 'active',
      header: 'Status',
      sortable: true,
      hideOnMobile: true,
      render: (service) => (
        <Badge variant={service.active ? 'default' : 'secondary'}>
          {service.active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right w-[120px]',
      render: (service) => (
        <div className="flex items-center justify-end gap-2 min-h-[44px]">
          <EditServiceDialog
            service={service}
            onServiceUpdated={handleServiceUpdated}
          />
          <Switch
            checked={service.active ?? true}
            onCheckedChange={() => handleToggle(service)}
            disabled={pendingId === service.id}
            aria-label={service.active ? 'Deactivate service' : 'Activate service'}
            className="touch-manipulation"
          />
        </div>
      ),
    },
  ];

  // Empty state for no services at all
  if (services.length === 0) {
    return (
      <div data-testid="services-list">
        <EmptyState
          title="No services yet"
          description="Add your first service to get started with time tracking."
          actionLabel="Add Service"
          onAction={() => setAddDialogOpen(true)}
          icon={<Briefcase className="h-8 w-8 text-muted-foreground" />}
        />
        <AddServiceDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onServiceCreated={handleServiceCreated}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="services-list">
      <FilterToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search services..."
        filters={filterConfigs}
        onFilterRemove={handleFilterRemove}
        onFiltersClear={handleFiltersClear}
        desktopFilters={desktopFilters}
        mobileFilters={mobileFilters}
        addButtonSlot={
          <AddServiceDialog
            onServiceCreated={handleServiceCreated}
          />
        }
      />

      {filteredServices.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No services match your filters
        </div>
      ) : (
        <DataTable
          data={filteredServices}
          columns={columns}
          keyField="id"
        />
      )}

      {/* Confirm dialog for deactivation */}
      {confirmDialog.service && (
        <DeactivateConfirmDialog
          open={confirmDialog.open}
          onOpenChange={(open) =>
            setConfirmDialog({ ...confirmDialog, open })
          }
          itemName={confirmDialog.service.name}
          itemType="service"
          usageCount={confirmDialog.usageCount}
          onConfirm={() => performToggle(confirmDialog.service!)}
          isPending={pendingId === confirmDialog.service?.id}
        />
      )}
    </div>
  );
}
