/**
 * Master data fixtures for RLS E2E testing
 * Story 1.4: RLS Policies for All Roles (AC: 8, 9, 10)
 */

export interface TestClient {
  id: string;
  name: string;
  active: boolean;
}

export interface TestProject {
  id: string;
  clientId: string;
  name: string;
  active: boolean;
}

export interface TestJob {
  id: string;
  projectId: string;
  name: string;
  jobNo: string;
  active: boolean;
}

export interface TestService {
  id: string;
  name: string;
  active: boolean;
}

export interface TestTask {
  id: string;
  name: string;
  active: boolean;
}

/**
 * Test client data (valid UUID v4 format)
 */
export const testClients: Record<string, TestClient> = {
  clientA: {
    id: 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',
    name: 'Test Client A',
    active: true,
  },
  clientB: {
    id: 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaab',
    name: 'Test Client B',
    active: true,
  },
  inactiveClient: {
    id: 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaac',
    name: 'Inactive Test Client',
    active: false,
  },
};

/**
 * Test project data (valid UUID v4 format)
 */
export const testProjects: Record<string, TestProject> = {
  projectA: {
    id: 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbba',
    clientId: testClients.clientA.id,
    name: 'Test Project A',
    active: true,
  },
  projectB: {
    id: 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbb',
    clientId: testClients.clientB.id,
    name: 'Test Project B',
    active: true,
  },
};

/**
 * Test job data (valid UUID v4 format)
 */
export const testJobs: Record<string, TestJob> = {
  jobA: {
    id: 'cccccccc-cccc-4ccc-cccc-ccccccccccca',
    projectId: testProjects.projectA.id,
    name: 'Test Job A',
    jobNo: 'JOB-001',
    active: true,
  },
  jobB: {
    id: 'cccccccc-cccc-4ccc-cccc-cccccccccccb',
    projectId: testProjects.projectB.id,
    name: 'Test Job B',
    jobNo: 'JOB-002',
    active: true,
  },
};

/**
 * Test service data (valid UUID v4 format)
 */
export const testServices: Record<string, TestService> = {
  serviceA: {
    id: 'dddddddd-dddd-4ddd-dddd-ddddddddddda',
    name: 'Audio Recording',
    active: true,
  },
  serviceB: {
    id: 'dddddddd-dddd-4ddd-dddd-ddddddddddb',
    name: 'Video Editing',
    active: true,
  },
};

/**
 * Test task data (valid UUID v4 format)
 */
export const testTasks: Record<string, TestTask> = {
  taskA: {
    id: 'eeeeeeee-eeee-4eee-eeee-eeeeeeeeeeea',
    name: 'Recording Session',
    active: true,
  },
  taskB: {
    id: 'eeeeeeee-eeee-4eee-eeee-eeeeeeeeeeb',
    name: 'Post-Production',
    active: true,
  },
};
