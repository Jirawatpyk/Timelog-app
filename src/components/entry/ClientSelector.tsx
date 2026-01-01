'use client';

import { useClients } from '@/hooks/use-entry-data';
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

interface ClientSelectorProps {
  value: string;
  onChange: (clientId: string) => void;
  error?: string;
}

/**
 * Client Selector Component
 * Story 4.2 - AC1, AC2: Shows active clients, enables project selection on change
 */
export function ClientSelector({ value, onChange, error }: ClientSelectorProps) {
  const { data: clients, isLoading, isError, refetch } = useClients();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Client</Label>
        <Skeleton className="h-10 w-full" data-testid="client-selector-loading" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-2">
        <Label>Client</Label>
        <div className="flex items-center gap-2" data-testid="client-selector-error">
          <span className="text-sm text-destructive">Failed to load clients</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            data-testid="client-selector-retry"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="client">Client *</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          id="client"
          className={`w-full ${error ? 'border-destructive' : ''}`}
          data-testid="client-selector"
        >
          <SelectValue placeholder="Select a client" />
        </SelectTrigger>
        <SelectContent>
          {clients && clients.length > 0 ? (
            clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))
          ) : (
            <div className="py-2 px-2 text-sm text-muted-foreground">
              No clients available
            </div>
          )}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
