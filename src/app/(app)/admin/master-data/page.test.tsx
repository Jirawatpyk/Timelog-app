/**
 * Tests for Master Data Page
 * Story 3.1: Service Type Management (AC: 1)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import MasterDataPage from './page';

// Mock the ServicesList component since it's a server component that fetches data
vi.mock('./components/ServicesList', () => ({
  ServicesList: () => <div data-testid="services-list">Services List Mock</div>,
}));

describe('MasterDataPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page title', async () => {
    render(await MasterDataPage());

    expect(screen.getByRole('heading', { name: /master data management/i })).toBeInTheDocument();
  });

  it('renders tabs for Services, Clients, and Tasks', async () => {
    render(await MasterDataPage());

    expect(screen.getByRole('tab', { name: /services/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /clients/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /tasks/i })).toBeInTheDocument();
  });

  it('shows Services tab as default active', async () => {
    render(await MasterDataPage());

    const servicesTab = screen.getByRole('tab', { name: /services/i });
    expect(servicesTab).toHaveAttribute('data-state', 'active');
  });

  it('renders ServicesList component in Services tab', async () => {
    render(await MasterDataPage());

    expect(screen.getByTestId('services-list')).toBeInTheDocument();
  });

  it('shows Clients and Tasks tabs are clickable', async () => {
    render(await MasterDataPage());

    const clientsTab = screen.getByRole('tab', { name: /clients/i });
    const tasksTab = screen.getByRole('tab', { name: /tasks/i });

    // Verify tabs exist and are not disabled
    expect(clientsTab).toBeInTheDocument();
    expect(clientsTab).not.toBeDisabled();
    expect(tasksTab).toBeInTheDocument();
    expect(tasksTab).not.toBeDisabled();
  });
});
