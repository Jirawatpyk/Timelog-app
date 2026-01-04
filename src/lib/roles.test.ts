/**
 * Unit Tests for Role Helper Functions
 * Story 7.5: Assign Roles (Task 6)
 */

import { describe, it, expect } from 'vitest';
import {
  ROLE_HIERARCHY,
  getRoleOptions,
  canAssignRole,
  getRoleLevel,
} from '@/lib/roles';

describe('ROLE_HIERARCHY', () => {
  it('defines all four roles with correct levels', () => {
    expect(ROLE_HIERARCHY.staff).toEqual({ label: 'Staff', level: 1 });
    expect(ROLE_HIERARCHY.manager).toEqual({ label: 'Manager', level: 2 });
    expect(ROLE_HIERARCHY.admin).toEqual({ label: 'Admin', level: 3 });
    expect(ROLE_HIERARCHY.super_admin).toEqual({ label: 'Super Admin', level: 4 });
  });

  it('has exactly 4 roles', () => {
    expect(Object.keys(ROLE_HIERARCHY)).toHaveLength(4);
  });
});

describe('getRoleOptions', () => {
  it('returns staff, manager, admin for admin user (excludes super_admin)', () => {
    const options = getRoleOptions('admin');

    expect(options).toEqual([
      { value: 'staff', label: 'Staff' },
      { value: 'manager', label: 'Manager' },
      { value: 'admin', label: 'Admin' },
    ]);
    expect(options.find((o) => o.value === 'super_admin')).toBeUndefined();
  });

  it('returns all roles including super_admin for super_admin user', () => {
    const options = getRoleOptions('super_admin');

    expect(options).toEqual([
      { value: 'staff', label: 'Staff' },
      { value: 'manager', label: 'Manager' },
      { value: 'admin', label: 'Admin' },
      { value: 'super_admin', label: 'Super Admin' },
    ]);
  });

  it('returns staff, manager, admin for staff user', () => {
    const options = getRoleOptions('staff');

    expect(options).toHaveLength(3);
    expect(options.map((o) => o.value)).not.toContain('super_admin');
  });

  it('returns staff, manager, admin for manager user', () => {
    const options = getRoleOptions('manager');

    expect(options).toHaveLength(3);
    expect(options.map((o) => o.value)).not.toContain('super_admin');
  });
});

describe('canAssignRole', () => {
  it('admin cannot assign super_admin role', () => {
    expect(canAssignRole('admin', 'super_admin')).toBe(false);
  });

  it('super_admin can assign super_admin role', () => {
    expect(canAssignRole('super_admin', 'super_admin')).toBe(true);
  });

  it('admin can assign admin role', () => {
    expect(canAssignRole('admin', 'admin')).toBe(true);
  });

  it('admin can assign manager role', () => {
    expect(canAssignRole('admin', 'manager')).toBe(true);
  });

  it('admin can assign staff role', () => {
    expect(canAssignRole('admin', 'staff')).toBe(true);
  });

  it('super_admin can assign any role', () => {
    expect(canAssignRole('super_admin', 'staff')).toBe(true);
    expect(canAssignRole('super_admin', 'manager')).toBe(true);
    expect(canAssignRole('super_admin', 'admin')).toBe(true);
    expect(canAssignRole('super_admin', 'super_admin')).toBe(true);
  });

  it('staff cannot assign super_admin', () => {
    expect(canAssignRole('staff', 'super_admin')).toBe(false);
  });

  it('manager cannot assign super_admin', () => {
    expect(canAssignRole('manager', 'super_admin')).toBe(false);
  });
});

describe('getRoleLevel', () => {
  it('returns correct level for each role', () => {
    expect(getRoleLevel('staff')).toBe(1);
    expect(getRoleLevel('manager')).toBe(2);
    expect(getRoleLevel('admin')).toBe(3);
    expect(getRoleLevel('super_admin')).toBe(4);
  });
});
