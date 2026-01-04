'use client';

import { useServices } from '@/hooks/use-entry-data';
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

interface ServiceSelectorProps {
  value: string;
  onChange: (serviceId: string) => void;
  error?: string;
}

/**
 * Service Selector Component
 * Story 4.3 - AC1: Shows active services sorted alphabetically
 */
export function ServiceSelector({ value, onChange, error }: ServiceSelectorProps) {
  const { data: services, isLoading, isError, refetch } = useServices();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Service</Label>
        <Skeleton className="h-11 w-full rounded-md" data-testid="service-selector-loading" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-2">
        <Label>Service</Label>
        <div className="flex items-center gap-2" data-testid="service-selector-error">
          <span className="text-sm text-destructive">Failed to load services</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            data-testid="service-selector-retry"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="serviceId">Service *</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          id="serviceId"
          className={`w-full ${error ? 'border-destructive' : ''}`}
          data-testid="service-selector"
        >
          <SelectValue placeholder="Select a service" />
        </SelectTrigger>
        <SelectContent>
          {services && services.length > 0 ? (
            services.map((service) => (
              <SelectItem key={service.id} value={service.id}>
                {service.name}
              </SelectItem>
            ))
          ) : (
            <div className="py-2 px-2 text-sm text-muted-foreground">
              No services available
            </div>
          )}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    </div>
  );
}
