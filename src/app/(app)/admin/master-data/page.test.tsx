/**
 * Tests for Master Data Page
 * Story 3.1: Service Type Management (AC: 1)
 * Story 3.5: Master Data Admin UI Layout (AC: 1)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import MasterDataPage from './page';

// Mock the list components since they are server components that fetch data
vi.mock('./components/ServicesList', () => ({
  ServicesList: () => <div data-testid="services-list">Services List Mock</div>,
}));

vi.mock('./components/ClientsList', () => ({
  ClientsList: () => <div data-testid="clients-list">Clients List Mock</div>,
}));

vi.mock('./components/TasksList', () => ({
  TasksList: () => <div data-testid="tasks-list">Tasks List Mock</div>,
}));

// Helper to render page with searchParams
const renderPage = async (tab?: string) => {
  const searchParams = Promise.resolve({ tab });
  render(await MasterDataPage({ searchParams }));
};

describe('MasterDataPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page title', async () => {
    await renderPage();

    expect(screen.getByRole('heading', { name: /master data management/i })).toBeInTheDocument();
  });

  it('renders tabs for Services, Clients, and Tasks', async () => {
    await renderPage();

    expect(screen.getByRole('tab', { name: /services/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /clients/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /tasks/i })).toBeInTheDocument();
  });

  it('shows Services tab as default active', async () => {
    await renderPage();

    const servicesTab = screen.getByRole('tab', { name: /services/i });
    expect(servicesTab).toHaveAttribute('data-state', 'active');
  });

  it('renders ServicesList component in Services tab', async () => {
    await renderPage();

    expect(screen.getByTestId('services-list')).toBeInTheDocument();
  });

  it('shows Clients and Tasks tabs are clickable', async () => {
    await renderPage();

    const clientsTab = screen.getByRole('tab', { name: /clients/i });
    const tasksTab = screen.getByRole('tab', { name: /tasks/i });

    // Verify tabs exist and are not disabled
    expect(clientsTab).toBeInTheDocument();
    expect(clientsTab).not.toBeDisabled();
    expect(tasksTab).toBeInTheDocument();
    expect(tasksTab).not.toBeDisabled();
  });

  it('respects tab URL parameter', async () => {
    await renderPage('clients');

    const clientsTab = screen.getByRole('tab', { name: /clients/i });
    expect(clientsTab).toHaveAttribute('data-state', 'active');
  });

  it('defaults to services for invalid tab parameter', async () => {
    await renderPage('invalid');

    const servicesTab = screen.getByRole('tab', { name: /services/i });
    expect(servicesTab).toHaveAttribute('data-state', 'active');
  });
});
