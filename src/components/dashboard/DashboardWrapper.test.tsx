/**
 * DashboardWrapper Tests - Story 5.6
 *
 * Tests for the dashboard wrapper component that manages filter state.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { DashboardWrapper } from './DashboardWrapper';
import type { ClientOption } from '@/types/dashboard';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({
    toString: () => '',
  }),
}));

const mockClients: ClientOption[] = [
  { id: 'client-1', name: 'Alpha Corp' },
  { id: 'client-2', name: 'Beta Inc' },
];

describe('DashboardWrapper', () => {
  it('renders children', () => {
    render(
      <DashboardWrapper clients={mockClients} currentClientId={undefined}>
        <div data-testid="child-content">Period Selector</div>
      </DashboardWrapper>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('renders filter button', () => {
    render(
      <DashboardWrapper clients={mockClients} currentClientId={undefined}>
        <div>Content</div>
      </DashboardWrapper>
    );

    expect(screen.getByRole('button', { name: /filter entries/i })).toBeInTheDocument();
  });

  it('shows filter badge when currentClientId is set', () => {
    render(
      <DashboardWrapper clients={mockClients} currentClientId="client-1">
        <div>Content</div>
      </DashboardWrapper>
    );

    const button = screen.getByRole('button', { name: /filter entries/i });
    const badge = button.querySelector('.bg-primary');
    expect(badge).toBeInTheDocument();
  });

  it('does not show filter badge when no currentClientId', () => {
    render(
      <DashboardWrapper clients={mockClients} currentClientId={undefined}>
        <div>Content</div>
      </DashboardWrapper>
    );

    const button = screen.getByRole('button', { name: /filter entries/i });
    const badge = button.querySelector('.bg-primary');
    expect(badge).not.toBeInTheDocument();
  });

  it('opens filter sheet when button clicked', async () => {
    const user = userEvent.setup();

    render(
      <DashboardWrapper clients={mockClients} currentClientId={undefined}>
        <div>Content</div>
      </DashboardWrapper>
    );

    await user.click(screen.getByRole('button', { name: /filter entries/i }));

    // Sheet should be visible with title
    expect(screen.getByText('Filter Entries')).toBeInTheDocument();
  });

  it('closes filter sheet when onClose is triggered', async () => {
    const user = userEvent.setup();

    render(
      <DashboardWrapper clients={mockClients} currentClientId={undefined}>
        <div>Content</div>
      </DashboardWrapper>
    );

    // Open sheet
    await user.click(screen.getByRole('button', { name: /filter entries/i }));
    expect(screen.getByText('Filter Entries')).toBeInTheDocument();

    // Close via Clear button
    await user.click(screen.getByRole('button', { name: 'Clear' }));

    // Sheet should be closed
    expect(screen.queryByText('Filter Entries')).not.toBeInTheDocument();
  });
});
