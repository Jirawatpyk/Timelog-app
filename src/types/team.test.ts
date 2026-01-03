// src/types/team.test.ts
import { describe, it, expect } from 'vitest';
import type { TeamMemberWithStats, TeamMembersGrouped } from './team';

describe('Team Types', () => {
  describe('TeamMemberWithStats', () => {
    it('should extend TeamMember with stats fields', () => {
      const member: TeamMemberWithStats = {
        id: '1',
        email: 'test@example.com',
        displayName: 'Test User',
        departmentId: 'd1',
        departmentName: 'Department A',
        role: 'staff',
        totalHours: 8.5,
        entryCount: 3,
        hasLoggedToday: true,
        isComplete: true,
      };

      expect(member.totalHours).toBe(8.5);
      expect(member.entryCount).toBe(3);
      expect(member.hasLoggedToday).toBe(true);
      expect(member.isComplete).toBe(true);
    });

    it('should allow partial day stats (< 8 hours)', () => {
      const member: TeamMemberWithStats = {
        id: '2',
        email: 'partial@example.com',
        displayName: 'Partial User',
        departmentId: 'd1',
        departmentName: 'Department A',
        role: 'staff',
        totalHours: 5.0,
        entryCount: 2,
        hasLoggedToday: true,
        isComplete: false,
      };

      expect(member.isComplete).toBe(false);
      expect(member.totalHours).toBeLessThan(8);
    });

    it('should allow zero stats for not logged members', () => {
      const member: TeamMemberWithStats = {
        id: '3',
        email: 'notlogged@example.com',
        displayName: 'Not Logged User',
        departmentId: 'd1',
        departmentName: 'Department A',
        role: 'staff',
        totalHours: 0,
        entryCount: 0,
        hasLoggedToday: false,
        isComplete: false,
      };

      expect(member.hasLoggedToday).toBe(false);
      expect(member.totalHours).toBe(0);
      expect(member.entryCount).toBe(0);
    });
  });

  describe('TeamMembersGrouped', () => {
    it('should contain logged and notLogged arrays', () => {
      const grouped: TeamMembersGrouped = {
        logged: [
          {
            id: '1',
            email: 'logged@example.com',
            displayName: 'Logged User',
            departmentId: 'd1',
            departmentName: 'Department A',
            role: 'staff',
            totalHours: 8.5,
            entryCount: 3,
            hasLoggedToday: true,
            isComplete: true,
          },
        ],
        notLogged: [
          {
            id: '2',
            email: 'notlogged@example.com',
            displayName: 'Not Logged User',
            departmentId: 'd1',
            departmentName: 'Department A',
            role: 'staff',
            totalHours: 0,
            entryCount: 0,
            hasLoggedToday: false,
            isComplete: false,
          },
        ],
      };

      expect(grouped.logged).toHaveLength(1);
      expect(grouped.notLogged).toHaveLength(1);
      expect(grouped.logged[0].hasLoggedToday).toBe(true);
      expect(grouped.notLogged[0].hasLoggedToday).toBe(false);
    });

    it('should allow empty logged array', () => {
      const grouped: TeamMembersGrouped = {
        logged: [],
        notLogged: [
          {
            id: '1',
            email: 'test@example.com',
            displayName: 'Test User',
            departmentId: 'd1',
            departmentName: 'Department A',
            role: 'staff',
            totalHours: 0,
            entryCount: 0,
            hasLoggedToday: false,
            isComplete: false,
          },
        ],
      };

      expect(grouped.logged).toHaveLength(0);
      expect(grouped.notLogged.length).toBeGreaterThan(0);
    });

    it('should allow empty notLogged array', () => {
      const grouped: TeamMembersGrouped = {
        logged: [
          {
            id: '1',
            email: 'test@example.com',
            displayName: 'Test User',
            departmentId: 'd1',
            departmentName: 'Department A',
            role: 'staff',
            totalHours: 8.0,
            entryCount: 1,
            hasLoggedToday: true,
            isComplete: true,
          },
        ],
        notLogged: [],
      };

      expect(grouped.logged.length).toBeGreaterThan(0);
      expect(grouped.notLogged).toHaveLength(0);
    });
  });
});
