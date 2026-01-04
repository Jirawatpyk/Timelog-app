/**
 * Tests for Manager Department Prompt Component
 * Story 7.5: Assign Roles (Task 4)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ManagerDeptPrompt } from './ManagerDeptPrompt';

describe('ManagerDeptPrompt', () => {
  const mockOnAssignNow = vi.fn();
  const mockOnLater = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog when open is true', () => {
    render(
      <ManagerDeptPrompt
        open={true}
        onOpenChange={() => {}}
        onAssignNow={mockOnAssignNow}
        onLater={mockOnLater}
      />
    );

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText('Assign Departments')).toBeInTheDocument();
    expect(screen.getByText('Would you like to assign departments now?')).toBeInTheDocument();
  });

  it('does not render dialog when open is false', () => {
    render(
      <ManagerDeptPrompt
        open={false}
        onOpenChange={() => {}}
        onAssignNow={mockOnAssignNow}
        onLater={mockOnLater}
      />
    );

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('calls onAssignNow when "Assign Now" button is clicked', () => {
    render(
      <ManagerDeptPrompt
        open={true}
        onOpenChange={() => {}}
        onAssignNow={mockOnAssignNow}
        onLater={mockOnLater}
      />
    );

    const assignNowButton = screen.getByRole('button', { name: /assign now/i });
    fireEvent.click(assignNowButton);

    expect(mockOnAssignNow).toHaveBeenCalledTimes(1);
  });

  it('calls onLater when "Later" button is clicked', () => {
    render(
      <ManagerDeptPrompt
        open={true}
        onOpenChange={() => {}}
        onAssignNow={mockOnAssignNow}
        onLater={mockOnLater}
      />
    );

    const laterButton = screen.getByRole('button', { name: /later/i });
    fireEvent.click(laterButton);

    expect(mockOnLater).toHaveBeenCalledTimes(1);
  });

  it('displays correct button labels in English', () => {
    render(
      <ManagerDeptPrompt
        open={true}
        onOpenChange={() => {}}
        onAssignNow={mockOnAssignNow}
        onLater={mockOnLater}
      />
    );

    expect(screen.getByRole('button', { name: /assign now/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /later/i })).toBeInTheDocument();
  });
});
