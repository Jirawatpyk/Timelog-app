/**
 * Tests for DepartmentsListClient Component
 * Story 3.7: Department Management (AC: 1, 5, 6)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DepartmentsListClient } from './DepartmentsListClient';
import type { Department } from '@/types/domain';

// Mock server actions
const mockToggleDepartmentActive = vi.fn();
const mockCheckDepartmentUsage = vi.fn();

vi.mock('@/actions/master-data', () => ({
  toggleDepartmentActive: (id: string, active: boolean) => mockToggleDepartmentActive(id, active),
  checkDepartmentUsage: (id: string) => mockCheckDepartmentUsage(id),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock child dialog components
vi.mock('@/components/admin/AddDepartmentDialog', () => ({
  AddDepartmentDialog: ({ onDepartmentCreated }: { onDepartmentCreated?: (d: Department) => void }) => (
    <button data-testid="add-department-trigger" onClick={() => onDepartmentCreated?.({ id: 'new', name: 'New Dept', active: true, created_at: '' })}>
      Add Department
    </button>
  ),
}));

vi.mock('@/components/admin/EditDepartmentDialog', () => ({
  EditDepartmentDialog: ({ department, onDepartmentUpdated }: { department: Department; onDepartmentUpdated?: (d: Department) => void }) => (
    <button
      data-testid={`edit-${department.id}`}
      onClick={() => onDepartmentUpdated?.({ ...department, name: 'Updated' })}
    >
      Edit {department.name}
    </button>
  ),
}));

const mockDepartments: Department[] = [
  { id: '1', name: 'Audio Production', active: true, created_at: '2024-01-01' },
  { id: '2', name: 'Video Production', active: true, created_at: '2024-01-01' },
  { id: '3', name: 'Legacy Dept', active: false, created_at: '2024-01-01' },
];

describe('DepartmentsListClient', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the departments list', () => {
      render(<DepartmentsListClient initialDepartments={mockDepartments} />);

      expect(screen.getByTestId('departments-list')).toBeInTheDocument();
    });

    it('displays all departments', () => {
      render(<DepartmentsListClient initialDepartments={mockDepartments} />);

      expect(screen.getByText('Audio Production')).toBeInTheDocument();
      expect(screen.getByText('Video Production')).toBeInTheDocument();
      expect(screen.getByText('Legacy Dept')).toBeInTheDocument();
    });

    it('shows empty state when no departments', () => {
      render(<DepartmentsListClient initialDepartments={[]} />);

      expect(screen.getByText(/no departments yet/i)).toBeInTheDocument();
      expect(screen.getByText(/add your first department/i)).toBeInTheDocument();
    });

    it('shows active/inactive badges', () => {
      render(<DepartmentsListClient initialDepartments={mockDepartments} />);

      // Active departments should have 'Active' badge
      const activeBadges = screen.getAllByText('Active');
      expect(activeBadges.length).toBe(2);

      // Inactive department should have 'Inactive' badge
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });
  });

  describe('Search Filtering', () => {
    it('filters departments by search term', async () => {
      render(<DepartmentsListClient initialDepartments={mockDepartments} />);

      const searchInput = screen.getByPlaceholderText(/search departments/i);
      await user.type(searchInput, 'Audio');

      await waitFor(() => {
        expect(screen.getByText('Audio Production')).toBeInTheDocument();
        // DataTable rows should be filtered - check the table body
        const rows = screen.getAllByRole('row');
        // Header row + 1 data row for 'Audio Production'
        expect(rows.length).toBe(2);
      });
    });

    it('shows no match message when search has no results', async () => {
      render(<DepartmentsListClient initialDepartments={mockDepartments} />);

      const searchInput = screen.getByPlaceholderText(/search departments/i);
      await user.type(searchInput, 'NonExistent');

      await waitFor(() => {
        expect(screen.getByText(/no departments match your filters/i)).toBeInTheDocument();
      });
    });

    it('search is case insensitive', async () => {
      render(<DepartmentsListClient initialDepartments={mockDepartments} />);

      const searchInput = screen.getByPlaceholderText(/search departments/i);
      await user.type(searchInput, 'audio');

      await waitFor(() => {
        expect(screen.getByText('Audio Production')).toBeInTheDocument();
      });
    });
  });

  describe('Status Filtering', () => {
    it('filters by active status when selected', async () => {
      render(<DepartmentsListClient initialDepartments={mockDepartments} />);

      // Find and click the status filter
      const statusFilter = screen.getByRole('combobox');
      await user.click(statusFilter);

      // Select 'Active'
      const activeOption = screen.getByRole('option', { name: /^active$/i });
      await user.click(activeOption);

      expect(screen.getByText('Audio Production')).toBeInTheDocument();
      expect(screen.getByText('Video Production')).toBeInTheDocument();
      expect(screen.queryByText('Legacy Dept')).not.toBeInTheDocument();
    });

    it('filters by inactive status when selected', async () => {
      render(<DepartmentsListClient initialDepartments={mockDepartments} />);

      const statusFilter = screen.getByRole('combobox');
      await user.click(statusFilter);

      const inactiveOption = screen.getByRole('option', { name: /inactive/i });
      await user.click(inactiveOption);

      expect(screen.queryByText('Audio Production')).not.toBeInTheDocument();
      expect(screen.queryByText('Video Production')).not.toBeInTheDocument();
      expect(screen.getByText('Legacy Dept')).toBeInTheDocument();
    });
  });

  describe('Toggle Active Status (AC6)', () => {
    it('shows confirmation dialog when deactivating', async () => {
      mockCheckDepartmentUsage.mockResolvedValue({ success: true, data: { used: true, count: 5 } });

      render(<DepartmentsListClient initialDepartments={mockDepartments} />);

      // Find the toggle switch for Audio Production (first active department)
      const switches = screen.getAllByRole('switch');
      await user.click(switches[0]);

      // Should show confirmation dialog
      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
        expect(screen.getByText(/deactivate audio production/i)).toBeInTheDocument();
        // Check for count separately as it may be in a <strong> tag
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText(/active users/i)).toBeInTheDocument();
      });
    });

    it('deactivates after confirmation', async () => {
      mockCheckDepartmentUsage.mockResolvedValue({ success: true, data: { used: false, count: 0 } });
      mockToggleDepartmentActive.mockResolvedValue({ success: true, data: { ...mockDepartments[0], active: false } });

      render(<DepartmentsListClient initialDepartments={mockDepartments} />);

      const switches = screen.getAllByRole('switch');
      await user.click(switches[0]);

      // Wait for dialog and click confirm
      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      const deactivateButton = screen.getByRole('button', { name: /deactivate/i });
      await user.click(deactivateButton);

      await waitFor(() => {
        expect(mockToggleDepartmentActive).toHaveBeenCalledWith('1', false);
      });
    });

    it('shows success toast after successful deactivation', async () => {
      const { toast } = await import('sonner');
      mockCheckDepartmentUsage.mockResolvedValue({ success: true, data: { used: false, count: 0 } });
      mockToggleDepartmentActive.mockResolvedValue({ success: true, data: { ...mockDepartments[0], active: false } });

      render(<DepartmentsListClient initialDepartments={mockDepartments} />);

      const switches = screen.getAllByRole('switch');
      await user.click(switches[0]);

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      const deactivateButton = screen.getByRole('button', { name: /deactivate/i });
      await user.click(deactivateButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Department deactivated');
      });
    });

    it('activates without confirmation dialog', async () => {
      // Test with inactive department (Legacy Dept)
      mockToggleDepartmentActive.mockResolvedValue({ success: true, data: { ...mockDepartments[2], active: true } });

      render(<DepartmentsListClient initialDepartments={mockDepartments} />);

      // Find the toggle switch for Legacy Dept (inactive department)
      const switches = screen.getAllByRole('switch');
      // switches[2] is for Legacy Dept which is inactive
      await user.click(switches[2]);

      // Should directly call toggle without dialog
      await waitFor(() => {
        expect(mockToggleDepartmentActive).toHaveBeenCalledWith('3', true);
      });

      // No confirmation dialog should appear
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('reverts optimistic update on error', async () => {
      const { toast } = await import('sonner');
      mockCheckDepartmentUsage.mockResolvedValue({ success: true, data: { used: false, count: 0 } });
      mockToggleDepartmentActive.mockResolvedValue({ success: false, error: 'Server error' });

      render(<DepartmentsListClient initialDepartments={mockDepartments} />);

      const switches = screen.getAllByRole('switch');
      // Initially checked (active)
      expect(switches[0]).toBeChecked();

      await user.click(switches[0]);

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      const deactivateButton = screen.getByRole('button', { name: /deactivate/i });
      await user.click(deactivateButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Server error');
      });

      // Should revert to checked state
      expect(switches[0]).toBeChecked();
    });
  });

  describe('Add Department', () => {
    it('renders add department button', () => {
      render(<DepartmentsListClient initialDepartments={mockDepartments} />);

      // The AddDepartmentDialog is rendered as a slot in FilterToolbar
      // It appears twice: once in mobile view (sm:hidden) and once in desktop view (hidden sm:flex)
      const addButtons = screen.getAllByTestId('add-department-trigger');
      expect(addButtons.length).toBeGreaterThanOrEqual(1);
    });

    it('adds new department to list when created', async () => {
      render(<DepartmentsListClient initialDepartments={mockDepartments} />);

      // Get the first add button (there may be multiple for mobile/desktop)
      const addButtons = screen.getAllByTestId('add-department-trigger');
      await user.click(addButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('New Dept')).toBeInTheDocument();
      });
    });
  });

  describe('Edit Department', () => {
    it('renders edit button for each department', () => {
      render(<DepartmentsListClient initialDepartments={mockDepartments} />);

      expect(screen.getByTestId('edit-1')).toBeInTheDocument();
      expect(screen.getByTestId('edit-2')).toBeInTheDocument();
      expect(screen.getByTestId('edit-3')).toBeInTheDocument();
    });

    it('updates department in list when edited', async () => {
      render(<DepartmentsListClient initialDepartments={mockDepartments} />);

      await user.click(screen.getByTestId('edit-1'));

      await waitFor(() => {
        expect(screen.getByText('Updated')).toBeInTheDocument();
      });
    });
  });

  describe('Inactive Department Styling (AC1)', () => {
    it('applies line-through style to inactive department names', () => {
      render(<DepartmentsListClient initialDepartments={mockDepartments} />);

      const legacyText = screen.getByText('Legacy Dept');
      expect(legacyText).toHaveClass('line-through');
    });

    it('applies muted text color to inactive department names', () => {
      render(<DepartmentsListClient initialDepartments={mockDepartments} />);

      const legacyText = screen.getByText('Legacy Dept');
      expect(legacyText).toHaveClass('text-muted-foreground');
    });

    it('active department names do not have line-through', () => {
      render(<DepartmentsListClient initialDepartments={mockDepartments} />);

      const audioText = screen.getByText('Audio Production');
      expect(audioText).not.toHaveClass('line-through');
    });
  });
});
