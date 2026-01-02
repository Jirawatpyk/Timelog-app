/**
 * DataTable Component
 * Story 3.5: Master Data Admin UI Layout (AC: 2, 3)
 *
 * Reusable sortable data table for admin interfaces.
 * Supports generic row types, custom renderers, and column sorting.
 */

'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

type SortDirection = 'asc' | 'desc' | null;

export function DataTable<T extends object>({
  data,
  columns,
  keyField,
  emptyMessage = 'No items found',
  onRowClick,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      // Cycle: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortKey(null);
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return data;

    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const comparison = aVal < bVal ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortKey, sortDirection]);

  const getSortIcon = (key: string) => {
    if (sortKey !== key) return <ArrowUpDown className="h-4 w-4 ml-1" />;
    if (sortDirection === 'asc') return <ArrowUp className="h-4 w-4 ml-1" />;
    if (sortDirection === 'desc') return <ArrowDown className="h-4 w-4 ml-1" />;
    return <ArrowUpDown className="h-4 w-4 ml-1" />;
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={String(column.key)}
                className={cn(
                  column.className,
                  column.hideOnMobile && 'hidden sm:table-cell'
                )}
              >
                {column.sortable ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8"
                    onClick={() => handleSort(String(column.key))}
                  >
                    {column.header}
                    {getSortIcon(String(column.key))}
                  </Button>
                ) : (
                  column.header
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((item) => (
            <TableRow
              key={String(item[keyField])}
              onClick={() => onRowClick?.(item)}
              className={cn(onRowClick && 'cursor-pointer hover:bg-muted/50')}
            >
              {columns.map((column) => (
                <TableCell
                  key={String(column.key)}
                  className={cn(
                    column.className,
                    column.hideOnMobile && 'hidden sm:table-cell'
                  )}
                >
                  {column.render
                    ? column.render(item)
                    : String((item as Record<string, unknown>)[column.key as string] ?? '')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
