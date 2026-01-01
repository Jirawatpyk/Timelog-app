/**
 * Clients List Client Component
 * Story 3.5: Master Data Admin UI Layout (AC: 2, 3, 4, 5, 7)
 *
 * Client-side wrapper for clients list with:
 * - DataTable with sorting
 * - Search filtering
 * - Status filtering
 * - Empty state
 */

'use client';

import { useState, useMemo } from 'react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { SearchInput } from '@/components/admin/SearchInput';
import { StatusFilter, type StatusFilterValue } from '@/components/admin/StatusFilter';
import { EmptyState } from '@/components/admin/EmptyState';
import { AddClientDialog } from '@/components/admin/AddClientDialog';
import { EditClientDialog } from '@/components/admin/EditClientDialog';
import { DeactivateConfirmDialog } from '@/components/admin/DeactivateConfirmDialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toggleClientActive, checkClientUsage } from '@/actions/master-data';
import type { Client } from '@/types/domain';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Users } from 'lucide-react';

interface ClientsListClientProps {
  initialClients: Client[];
}

export function ClientsListClient({ initialClients }: ClientsListClientProps) {
  const [clients, setClients] = useState(initialClients);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Toggle state
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    client: Client | null;
    usageCount: number;
  }>({ open: false, client: null, usageCount: 0 });

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch = client.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && client.active) ||
        (statusFilter === 'inactive' && !client.active);

      return matchesSearch && matchesStatus;
    });
  }, [clients, search, statusFilter]);

  const handleToggle = async (client: Client) => {
    if (client.active) {
      setPendingId(client.id);
      const usageResult = await checkClientUsage(client.id);
      setPendingId(null);

      if (!usageResult.success) {
        toast.error(usageResult.error);
        return;
      }

      setConfirmDialog({
        open: true,
        client,
        usageCount: usageResult.data.count,
      });
      return;
    }

    await performToggle(client);
  };

  const performToggle = async (client: Client) => {
    const newActive = !client.active;

    setClients((prev) =>
      prev.map((c) =>
        c.id === client.id ? { ...c, active: newActive } : c
      )
    );
    setPendingId(client.id);

    const result = await toggleClientActive(client.id, newActive);
    setPendingId(null);
    setConfirmDialog({ open: false, client: null, usageCount: 0 });

    if (!result.success) {
      setClients((prev) =>
        prev.map((c) =>
          c.id === client.id ? { ...c, active: client.active } : c
        )
      );
      toast.error(result.error);
    } else {
      toast.success(newActive ? 'Client activated' : 'Client deactivated');
    }
  };

  const handleClientUpdated = (updated: Client) => {
    setClients((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  const handleClientCreated = (created: Client) => {
    setClients((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    setAddDialogOpen(false);
  };

  const columns: Column<Client>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (client) => (
        <span className={cn(!client.active && 'line-through text-muted-foreground')}>
          {client.name}
        </span>
      ),
    },
    {
      key: 'active',
      header: 'Status',
      sortable: true,
      render: (client) => (
        <Badge variant={client.active ? 'default' : 'secondary'}>
          {client.active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right w-[120px]',
      render: (client) => (
        <div className="flex items-center justify-end gap-2 min-h-[44px]">
          <EditClientDialog
            client={client}
            onClientUpdated={handleClientUpdated}
          />
          <Switch
            checked={client.active ?? true}
            onCheckedChange={() => handleToggle(client)}
            disabled={pendingId === client.id}
            aria-label={client.active ? 'Deactivate client' : 'Activate client'}
            className="touch-manipulation"
          />
        </div>
      ),
    },
  ];

  if (clients.length === 0) {
    return (
      <div data-testid="clients-list">
        <EmptyState
          title="No clients yet"
          description="Add your first client to get started."
          actionLabel="Add Client"
          onAction={() => setAddDialogOpen(true)}
          icon={<Users className="h-8 w-8 text-muted-foreground" />}
        />
        <AddClientDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onClientCreated={handleClientCreated}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="clients-list">
      {/* Toolbar - Mobile: Search on top, Filter+Add below | Desktop: all in one row */}
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search clients..."
          className="w-full sm:flex-1 sm:max-w-xs"
        />
        <div className="flex gap-2 justify-between sm:justify-end">
          <StatusFilter
            value={statusFilter}
            onChange={setStatusFilter}
            className="flex-1 sm:flex-none sm:w-[140px]"
          />
          <AddClientDialog
            open={addDialogOpen}
            onOpenChange={setAddDialogOpen}
            onClientCreated={handleClientCreated}
          />
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No clients match your filters
        </div>
      ) : (
        <DataTable
          data={filteredClients}
          columns={columns}
          keyField="id"
        />
      )}

      {confirmDialog.client && (
        <DeactivateConfirmDialog
          open={confirmDialog.open}
          onOpenChange={(open) =>
            setConfirmDialog({ ...confirmDialog, open })
          }
          itemName={confirmDialog.client.name}
          itemType="client"
          usageCount={confirmDialog.usageCount}
          onConfirm={() => performToggle(confirmDialog.client!)}
          isPending={pendingId === confirmDialog.client?.id}
        />
      )}
    </div>
  );
}
