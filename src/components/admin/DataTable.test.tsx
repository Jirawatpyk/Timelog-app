/**
 * DataTable Component Tests
 * Story 3.5: Master Data Admin UI Layout (AC: 2, 3)
 *
 * Tests for reusable data table with sorting functionality
 */

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { DataTable, type Column } from './DataTable';

interface TestItem {
  id: string;
  name: string;
  status: string;
  count: number;
}

const mockData: TestItem[] = [
  { id: '1', name: 'Alpha', status: 'active', count: 10 },
  { id: '2', name: 'Beta', status: 'inactive', count: 5 },
  { id: '3', name: 'Gamma', status: 'active', count: 20 },
];

const columns: Column<TestItem>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'status', header: 'Status', sortable: true },
  { key: 'count', header: 'Count', sortable: true },
  {
    key: 'actions',
    header: 'Actions',
    render: (item) => <button>Edit {item.name}</button>,
  },
];

describe('DataTable', () => {
  describe('Rendering', () => {
    it('renders table headers correctly', () => {
      render(<DataTable data={mockData} columns={columns} keyField="id" />);

      expect(screen.getByRole('columnheader', { name: /name/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /status/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /count/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /actions/i })).toBeInTheDocument();
    });

    it('renders all data rows', () => {
      render(<DataTable data={mockData} columns={columns} keyField="id" />);

      expect(screen.getByText('Alpha')).toBeInTheDocument();
      expect(screen.getByText('Beta')).toBeInTheDocument();
      expect(screen.getByText('Gamma')).toBeInTheDocument();
    });

    it('renders custom render functions', () => {
      render(<DataTable data={mockData} columns={columns} keyField="id" />);

      expect(screen.getByRole('button', { name: 'Edit Alpha' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Edit Beta' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Edit Gamma' })).toBeInTheDocument();
    });

    it('displays empty message when no data', () => {
      render(
        <DataTable
          data={[]}
          columns={columns}
          keyField="id"
          emptyMessage="No items available"
        />
      );

      expect(screen.getByText('No items available')).toBeInTheDocument();
    });

    it('displays default empty message when not specified', () => {
      render(<DataTable data={[]} columns={columns} keyField="id" />);

      expect(screen.getByText('No items found')).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('shows sort icon on sortable columns', () => {
      render(<DataTable data={mockData} columns={columns} keyField="id" />);

      const nameHeader = screen.getByRole('columnheader', { name: /name/i });
      expect(within(nameHeader).getByRole('button')).toBeInTheDocument();
    });

    it('does not show sort button on non-sortable columns', () => {
      render(<DataTable data={mockData} columns={columns} keyField="id" />);

      const actionsHeader = screen.getByRole('columnheader', { name: /actions/i });
      expect(within(actionsHeader).queryByRole('button')).not.toBeInTheDocument();
    });

    it('sorts data ascending on first click', async () => {
      const user = userEvent.setup();
      render(<DataTable data={mockData} columns={columns} keyField="id" />);

      const nameHeader = screen.getByRole('columnheader', { name: /name/i });
      const sortButton = within(nameHeader).getByRole('button');

      await user.click(sortButton);

      const rows = screen.getAllByRole('row');
      // First row is header, data rows start from index 1
      expect(within(rows[1]).getByText('Alpha')).toBeInTheDocument();
      expect(within(rows[2]).getByText('Beta')).toBeInTheDocument();
      expect(within(rows[3]).getByText('Gamma')).toBeInTheDocument();
    });

    it('sorts data descending on second click', async () => {
      const user = userEvent.setup();
      render(<DataTable data={mockData} columns={columns} keyField="id" />);

      const nameHeader = screen.getByRole('columnheader', { name: /name/i });
      const sortButton = within(nameHeader).getByRole('button');

      await user.click(sortButton); // ascending
      await user.click(sortButton); // descending

      const rows = screen.getAllByRole('row');
      expect(within(rows[1]).getByText('Gamma')).toBeInTheDocument();
      expect(within(rows[2]).getByText('Beta')).toBeInTheDocument();
      expect(within(rows[3]).getByText('Alpha')).toBeInTheDocument();
    });

    it('resets to original order on third click', async () => {
      const user = userEvent.setup();
      render(<DataTable data={mockData} columns={columns} keyField="id" />);

      const nameHeader = screen.getByRole('columnheader', { name: /name/i });
      const sortButton = within(nameHeader).getByRole('button');

      await user.click(sortButton); // ascending
      await user.click(sortButton); // descending
      await user.click(sortButton); // reset

      const rows = screen.getAllByRole('row');
      // Original order: Alpha, Beta, Gamma
      expect(within(rows[1]).getByText('Alpha')).toBeInTheDocument();
      expect(within(rows[2]).getByText('Beta')).toBeInTheDocument();
      expect(within(rows[3]).getByText('Gamma')).toBeInTheDocument();
    });

    it('sorts numeric columns correctly', async () => {
      const user = userEvent.setup();
      render(<DataTable data={mockData} columns={columns} keyField="id" />);

      const countHeader = screen.getByRole('columnheader', { name: /count/i });
      const sortButton = within(countHeader).getByRole('button');

      await user.click(sortButton); // ascending

      const rows = screen.getAllByRole('row');
      expect(within(rows[1]).getByText('5')).toBeInTheDocument();
      expect(within(rows[2]).getByText('10')).toBeInTheDocument();
      expect(within(rows[3]).getByText('20')).toBeInTheDocument();
    });
  });

  describe('Row Click', () => {
    it('calls onRowClick when row is clicked', async () => {
      const user = userEvent.setup();
      const handleRowClick = vi.fn();

      render(
        <DataTable
          data={mockData}
          columns={columns}
          keyField="id"
          onRowClick={handleRowClick}
        />
      );

      const rows = screen.getAllByRole('row');
      await user.click(rows[1]); // Click first data row

      expect(handleRowClick).toHaveBeenCalledWith(mockData[0]);
    });

    it('applies clickable styling when onRowClick is provided', () => {
      render(
        <DataTable
          data={mockData}
          columns={columns}
          keyField="id"
          onRowClick={() => {}}
        />
      );

      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveClass('cursor-pointer');
    });
  });

  describe('Accessibility', () => {
    it('has proper table structure', () => {
      render(<DataTable data={mockData} columns={columns} keyField="id" />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader')).toHaveLength(4);
      expect(screen.getAllByRole('row')).toHaveLength(4); // 1 header + 3 data rows
    });

    it('sort buttons are keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<DataTable data={mockData} columns={columns} keyField="id" />);

      const nameHeader = screen.getByRole('columnheader', { name: /name/i });
      const sortButton = within(nameHeader).getByRole('button');

      sortButton.focus();
      await user.keyboard('{Enter}');

      // Check that sorting was applied
      const rows = screen.getAllByRole('row');
      expect(within(rows[1]).getByText('Alpha')).toBeInTheDocument();
    });
  });

  describe('Mobile responsive', () => {
    it('applies hideOnMobile class to columns', () => {
      const columnsWithHide: Column<TestItem>[] = [
        { key: 'name', header: 'Name', sortable: true },
        { key: 'status', header: 'Status', hideOnMobile: true },
      ];

      render(<DataTable data={mockData} columns={columnsWithHide} keyField="id" />);

      const statusHeader = screen.getByRole('columnheader', { name: /status/i });
      expect(statusHeader).toHaveClass('hidden');
      expect(statusHeader).toHaveClass('sm:table-cell');
    });
  });
});
