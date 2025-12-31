# Epic 1 Retrospective: Project Foundation + Seed Data

**Date:** 2025-12-31
**Facilitator:** Bob (Scrum Master)
**Participants:** Alice (PO), Charlie (Senior Dev), Dana (QA), Elena (Junior Dev), Jiraw (Project Lead)

---

## Epic Summary

| Metric | Value |
|--------|-------|
| **Stories Completed** | 5/5 (100%) |
| **Database Tables Created** | 11 tables |
| **RLS Policies** | 20+ policies |
| **E2E Tests** | 24 tests passing |

### Stories Delivered

1. **1-1: Project Initialization** - Next.js + Supabase + shadcn/ui
2. **1-2: Database Schema - Core Tables** - 7 tables (departments, users, clients, projects, jobs, services, tasks)
3. **1-3: Database Schema - Time Entry & Supporting Tables** - 4 tables (time_entries, manager_departments, user_recent_combinations, audit_logs)
4. **1-4: RLS Policies for All Roles** - 24 E2E tests, 4 roles covered
5. **1-5: Seed Data for Development** - Realistic Thai company data, idempotent script

---

## What Went Well

### 1. 100% Delivery Rate
- All 5 stories completed with all ACs verified
- No stories carried over to next epic

### 2. Solid Database Design
- Proper use of `manager_departments` junction table for multi-department manager support
- Snapshot pattern for `time_entries.department_id` preserves historical accuracy
- All constraints, indexes, and triggers in place

### 3. Comprehensive RLS Testing
- 24 E2E tests covering all 4 roles (staff, manager, admin, super_admin)
- Critical negative test cases included (e.g., `manager_cannot_read_entries_from_non_managed_department`)
- Test infrastructure reusable for future epics

### 4. Code Review Value
- Missing index `idx_manager_departments_department` caught during code review (Story 1.3)
- Process prevented production issue

### 5. Good Technology Choices
- Official Vercel Supabase Starter provided solid foundation
- Cookie-based auth, SSR-compatible from day 1

---

## Challenges & Struggles

### 1. UUID Format Issues (High Impact)
**Stories affected:** 1.4, 1.5

**Problem:** PostgreSQL requires valid UUID v4 format (hex digits 0-9, a-f only). Team used human-readable formats like `'user-staff-0001'` which are invalid.

**Time lost:** ~15-20% of Story 1.4 and 1.5 effort

**Root cause:** No UUID convention documented at project start

### 2. Test Configuration Gaps (Medium Impact)
**Story affected:** 1.4

**Problem:** Vitest doesn't load `.env.local` by default. Had to add dotenv configuration manually.

**Solution applied:** Added dotenv loading to vitest.config.ts

### 3. Minor Compatibility Issues (Low Impact)
**Story affected:** 1.1

- Changed Geist font to Inter (Next.js version compatibility)
- Changed deprecated `toast` component to `sonner`

---

## Key Insights

> **Prevention > Debugging**: Having conventions and helpers established early would have saved 15-20% debugging time on UUID issues.

> **Code Review Catches Real Bugs**: The missing index in Story 1.3 was caught during review, not in production.

> **Test Infrastructure Pays Off**: 24 RLS tests give confidence for future changes.

---

## Action Items

| # | Action Item | Owner | Priority | Status |
|---|-------------|-------|----------|--------|
| 1 | Create UUID utility/constants for test fixtures | Charlie (Dev) | High | Pending |
| 2 | Update project-context.md with UUID convention | Charlie (Dev) | High | Pending |
| 3 | Document vitest .env.local setup in CLAUDE.md | Elena (Dev) | Medium | Pending |
| 4 | Add "Lessons Learned" section to project-context.md | Bob (SM) | Low | Pending |

---

## Team Agreements

1. **UUID Format**: Always use valid UUID v4 format (hex digits only: 0-9, a-f)
2. **Test Setup**: Every test file must verify env variables load correctly
3. **Code Review**: UUID format validation added to review checklist

---

## Epic 2 Readiness

| Check | Status |
|-------|--------|
| All Epic 1 stories done? | Yes (5/5) |
| RLS tests passing? | Yes (24/24) |
| Seed data verified? | Yes (idempotent) |
| TypeScript compiles? | Yes |
| Build passing? | Yes |
| Blockers for Epic 2? | None |

**Verdict:** Epic 1 foundation is solid. Ready to proceed with Epic 2: Authentication & Authorization.

---

## Next Epic Preview

**Epic 2: Authentication & Authorization** (4 stories)

| Story | Name | Current Status |
|-------|------|----------------|
| 2-1 | Company Email Login | review |
| 2-2 | Session Persistence & Logout | done |
| 2-3 | Role-Based Access Control Middleware | done |
| 2-4 | Session Timeout Handling | in-progress |

**Dependencies from Epic 1:**
- `users` table + RLS policies (Story 1.2, 1.4)
- Test users from seed data (Story 1.5)
- `get_user_role()` function (Story 1.4)

---

## Retrospective Metadata

- **Duration:** ~15 minutes
- **Format:** Team discussion with structured prompts
- **Previous Retrospective:** None (Epic 1 is the first epic)
