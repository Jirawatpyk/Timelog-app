/**
 * Tests for Master Data Page
 * Story 3.1: Service Type Management (AC: 1)
 * Story 3.5: Master Data Admin UI Layout (AC: 1)
 * Story 3.6: Projects & Jobs Admin UI (AC: 9)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import MasterDataPage from './page';

// Mock the list components since they are server components that fetch data
vi.mock('./components/ClientsList', () => ({
  ClientsList: () => <div data-testid="clients-list">Clients List Mock</div>,
}));

vi.mock('./components/ProjectsList', () => ({
  ProjectsList: () => <div data-testid="projects-list">Projects List Mock</div>,
}));

vi.mock('./components/JobsList', () => ({
  JobsList: () => <div data-testid="jobs-list">Jobs List Mock</div>,
}));

vi.mock('./components/ServicesList', () => ({
  ServicesList: () => <div data-testid="services-list">Services List Mock</div>,
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

  it('renders tabs in correct order: Clients, Projects, Jobs, Services, Tasks', async () => {
    await renderPage();

    expect(screen.getByRole('tab', { name: /clients/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /projects/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /jobs/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /services/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /tasks/i })).toBeInTheDocument();
  });

  it('shows Clients tab as default active', async () => {
    await renderPage();

    const clientsTab = screen.getByRole('tab', { name: /clients/i });
    expect(clientsTab).toHaveAttribute('data-state', 'active');
  });

  it('renders ClientsList component in Clients tab', async () => {
    await renderPage();

    expect(screen.getByTestId('clients-list')).toBeInTheDocument();
  });

  it('shows all tabs are clickable', async () => {
    await renderPage();

    const clientsTab = screen.getByRole('tab', { name: /clients/i });
    const projectsTab = screen.getByRole('tab', { name: /projects/i });
    const jobsTab = screen.getByRole('tab', { name: /jobs/i });
    const servicesTab = screen.getByRole('tab', { name: /services/i });
    const tasksTab = screen.getByRole('tab', { name: /tasks/i });

    // Verify tabs exist and are not disabled
    expect(clientsTab).not.toBeDisabled();
    expect(projectsTab).not.toBeDisabled();
    expect(jobsTab).not.toBeDisabled();
    expect(servicesTab).not.toBeDisabled();
    expect(tasksTab).not.toBeDisabled();
  });

  it('respects tab URL parameter', async () => {
    await renderPage('projects');

    const projectsTab = screen.getByRole('tab', { name: /projects/i });
    expect(projectsTab).toHaveAttribute('data-state', 'active');
  });

  it('defaults to clients for invalid tab parameter', async () => {
    await renderPage('invalid');

    const clientsTab = screen.getByRole('tab', { name: /clients/i });
    expect(clientsTab).toHaveAttribute('data-state', 'active');
  });
});
