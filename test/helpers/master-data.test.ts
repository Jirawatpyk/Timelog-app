/**
 * Tests for Master Data Test Helpers
 */

import { describe, it, expect } from 'vitest';
import {
  createMockSupabaseQuery,
  createSupabaseMock,
  mockService,
  mockClient,
  mockTask,
  mockProject,
  mockJob,
  mockServices,
  mockClients,
  mockTasks,
  mockProjects,
  mockJobs,
  successResponse,
  errorResponse,
  emptyResponse,
} from './master-data';

describe('createMockSupabaseQuery', () => {
  it('creates all required mock functions', () => {
    const mocks = createMockSupabaseQuery();

    expect(mocks.mockFrom).toBeDefined();
    expect(mocks.mockSelect).toBeDefined();
    expect(mocks.mockOrder).toBeDefined();
    expect(mocks.mockEq).toBeDefined();
    expect(mocks.mockSingle).toBeDefined();
    expect(mocks.mockInsert).toBeDefined();
    expect(mocks.mockUpdate).toBeDefined();
    expect(mocks.mockDelete).toBeDefined();
    expect(mocks.setupMocks).toBeDefined();
  });

  it('setupMocks wires up the query chain correctly', () => {
    const { mockFrom, mockSelect, mockOrder, setupMocks } = createMockSupabaseQuery();
    setupMocks();

    // Test the chain: from() -> select() -> order()
    const fromResult = mockFrom('services');
    expect(fromResult.select).toBeDefined();

    mockSelect.mockReturnValue({ order: mockOrder });
    const selectResult = mockSelect('*');
    expect(selectResult.order).toBeDefined();
  });

  it('setupMocks clears all mocks', () => {
    const { mockFrom, mockSelect, setupMocks } = createMockSupabaseQuery();

    mockFrom.mockReturnValue('test');
    mockSelect.mockReturnValue('test');

    setupMocks();

    expect(mockFrom.mock.calls).toHaveLength(0);
    expect(mockSelect.mock.calls).toHaveLength(0);
  });
});

describe('createSupabaseMock', () => {
  it('creates a mock with createClient function', () => {
    const { mockFrom } = createMockSupabaseQuery();
    const mock = createSupabaseMock(mockFrom);

    expect(mock.createClient).toBeDefined();
    expect(typeof mock.createClient).toBe('function');
  });

  it('createClient returns a promise with from method', async () => {
    const { mockFrom } = createMockSupabaseQuery();
    const mock = createSupabaseMock(mockFrom);

    const client = await mock.createClient();

    expect(client.from).toBe(mockFrom);
  });
});

describe('Mock Data Factories', () => {
  describe('mockService', () => {
    it('creates a service with default values', () => {
      const service = mockService();

      expect(service.id).toBeDefined();
      expect(service.name).toBe('Test Service');
      expect(service.active).toBe(true);
      expect(service.created_at).toBeDefined();
    });

    it('creates a service with custom name', () => {
      const service = mockService('Dubbing');

      expect(service.name).toBe('Dubbing');
    });

    it('creates a service with custom options', () => {
      const service = mockService('Dubbing', {
        id: 'custom-id',
        active: false,
      });

      expect(service.id).toBe('custom-id');
      expect(service.name).toBe('Dubbing');
      expect(service.active).toBe(false);
    });
  });

  describe('mockClient', () => {
    it('creates a client with default values', () => {
      const client = mockClient();

      expect(client.id).toBeDefined();
      expect(client.name).toBe('Test Client');
      expect(client.active).toBe(true);
    });

    it('creates a client with custom values', () => {
      const client = mockClient('Netflix', { active: false });

      expect(client.name).toBe('Netflix');
      expect(client.active).toBe(false);
    });
  });

  describe('mockTask', () => {
    it('creates a task with default values', () => {
      const task = mockTask();

      expect(task.id).toBeDefined();
      expect(task.name).toBe('Test Task');
      expect(task.active).toBe(true);
    });
  });

  describe('mockProject', () => {
    it('creates a project with client_id', () => {
      const project = mockProject('Project Alpha', { client_id: 'client-123' });

      expect(project.name).toBe('Project Alpha');
      expect(project.client_id).toBe('client-123');
      expect(project.active).toBe(true);
    });
  });

  describe('mockJob', () => {
    it('creates a job with project_id and job_no', () => {
      const job = mockJob('Job Alpha', {
        project_id: 'project-123',
        job_no: 'JOB-001',
      });

      expect(job.name).toBe('Job Alpha');
      expect(job.project_id).toBe('project-123');
      expect(job.job_no).toBe('JOB-001');
      expect(job.active).toBe(true);
    });
  });
});

describe('Batch Mock Creators', () => {
  describe('mockServices', () => {
    it('creates multiple services', () => {
      const services = mockServices(3);

      expect(services).toHaveLength(3);
      expect(services[0].name).toBe('Service 1');
      expect(services[1].name).toBe('Service 2');
      expect(services[2].name).toBe('Service 3');
    });

    it('creates services with consistent ids', () => {
      const services = mockServices(2);

      expect(services[0].id).toBe('service-1');
      expect(services[1].id).toBe('service-2');
    });

    it('applies base options to all services', () => {
      const services = mockServices(2, { active: false });

      expect(services[0].active).toBe(false);
      expect(services[1].active).toBe(false);
    });
  });

  describe('mockClients', () => {
    it('creates multiple clients', () => {
      const clients = mockClients(3);

      expect(clients).toHaveLength(3);
      expect(clients[0].name).toBe('Client 1');
    });
  });

  describe('mockTasks', () => {
    it('creates multiple tasks', () => {
      const tasks = mockTasks(3);

      expect(tasks).toHaveLength(3);
      expect(tasks[0].name).toBe('Task 1');
    });
  });

  describe('mockProjects', () => {
    it('creates multiple projects', () => {
      const projects = mockProjects(3);

      expect(projects).toHaveLength(3);
      expect(projects[0].name).toBe('Project 1');
      expect(projects[0].id).toBe('project-1');
    });

    it('applies base options to all projects', () => {
      const projects = mockProjects(2, { client_id: 'shared-client' });

      expect(projects[0].client_id).toBe('shared-client');
      expect(projects[1].client_id).toBe('shared-client');
    });
  });

  describe('mockJobs', () => {
    it('creates multiple jobs', () => {
      const jobs = mockJobs(3);

      expect(jobs).toHaveLength(3);
      expect(jobs[0].name).toBe('Job 1');
      expect(jobs[0].job_no).toBe('JOB-1');
    });

    it('applies base options to all jobs', () => {
      const jobs = mockJobs(2, { project_id: 'shared-project' });

      expect(jobs[0].project_id).toBe('shared-project');
      expect(jobs[1].project_id).toBe('shared-project');
    });
  });
});

describe('Response Helpers', () => {
  describe('successResponse', () => {
    it('wraps data in success format', () => {
      const data = [mockService()];
      const response = successResponse(data);

      expect(response.data).toBe(data);
      expect(response.error).toBeNull();
    });
  });

  describe('errorResponse', () => {
    it('creates error response with default message', () => {
      const response = errorResponse();

      expect(response.data).toBeNull();
      expect(response.error?.message).toBe('Database error');
    });

    it('creates error response with custom message', () => {
      const response = errorResponse('Connection failed');

      expect(response.error?.message).toBe('Connection failed');
    });
  });

  describe('emptyResponse', () => {
    it('creates empty success response', () => {
      const response = emptyResponse();

      expect(response.data).toEqual([]);
      expect(response.error).toBeNull();
    });
  });
});
