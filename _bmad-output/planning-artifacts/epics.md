---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
  - '_bmad-output/project-context.md'
workflowType: 'epics'
project_name: Timelog
user_name: Jiraw
date: 2025-12-30
---

# Timelog - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Timelog, decomposing the requirements from the PRD, UX Design, Architecture, and Project Context into implementable stories.

## Requirements Inventory

### Functional Requirements

**Authentication & Access Control:**
- FR1: User can log in using their company email address
- FR2: User can log out from any page
- FR3: System maintains user session across browser refreshes
- FR4: System assigns role-based permissions (Employee, Manager, Executive, Admin)
- FR5: User can only access features appropriate to their assigned role
- FR6: System handles session timeout gracefully with clear messaging

**Time Entry:**
- FR7: Employee can create a new time entry
- FR8: Employee can select Client from a list for time entry
- FR9: Employee can select Service from a list for time entry
- FR10: Employee can optionally select Task for time entry
- FR11: Employee can enter duration for time entry
- FR12: Employee can select date for time entry (default: today)
- FR13: Employee can edit their own time entries
- FR14: Employee can delete their own time entries
- FR15: System displays recently used Client/Service combinations (last 5)
- FR16: System validates time entry data before saving with clear error messages

**Personal Dashboard:**
- FR17: Employee can view their time entries for today
- FR18: Employee can view their time entries for the current week
- FR19: Employee can view their time entries for the current month
- FR20: Employee can view total hours logged per time period
- FR21: Employee can filter their entries by Client
- FR22: Employee can search their entries

**Team Management & Visibility:**
- FR23: Manager can view team members' time entries
- FR24: Manager can see which team members have logged time today
- FR25: Manager can see which team members have NOT logged time today
- FR26: Manager can view aggregated team hours
- FR27: System updates team data in near real-time (polling 30s for MVP)

**User Administration:**
- FR28: Admin can create new user accounts
- FR29: Admin can edit existing user information
- FR30: Admin can deactivate user accounts
- FR31: Admin can assign roles to users
- FR32: Admin can filter users by department or role

**Master Data Management:**
- FR33: Admin can add new Services to the system
- FR34: Admin can edit existing Services
- FR35: Admin can add new Clients to the system
- FR36: Admin can edit existing Clients
- FR37: Admin can add new Task codes to the system
- FR38: Admin can edit existing Task codes
- FR39: System prevents deletion of master data with existing time entries (soft delete)

**Mobile & PWA Experience:**
- FR40: User can install the application to their home screen
- FR41: Application provides touch-optimized interface
- FR42: Application displays meaningful offline message when disconnected
- FR43: User can pull-to-refresh dashboard data

**System & UX Foundations:**
- FR44: User can navigate between major sections (Entry, Dashboard, Admin)
- FR45: System displays meaningful empty state messages
- FR46: System displays skeleton loading indicators during data fetch
- FR47: System maintains audit log of time entry changes

**First-Time User Experience:**
- FR48: New user can start using the app immediately after first login (no setup required)
- FR49: System provides contextual guidance for first-time users

**Total: 49 Functional Requirements**

### NonFunctional Requirements

**Performance (9 NFRs):**
- NFR-P1: Page Load Time < 2 seconds
- NFR-P2: Time to Interactive < 3 seconds on 3G
- NFR-P3: First Contentful Paint < 1.5 seconds
- NFR-P4: Largest Contentful Paint < 2.5 seconds
- NFR-P5: Cumulative Layout Shift < 0.1
- NFR-P6: API Response Time < 200ms (p95)
- NFR-P7: Entry Form Render < 500ms
- NFR-P8: Concurrent Users 60 without degradation
- NFR-P9: Database Query Time < 100ms single-row, < 500ms aggregates

**Security (8 NFRs):**
- NFR-S1: Authentication - Supabase Auth with company email only
- NFR-S2: Authorization - Role-based access control (Employee, Manager, Executive, Admin)
- NFR-S3: Data Isolation - Row Level Security (RLS)
- NFR-S4: Transport Security - HTTPS only (TLS 1.2+)
- NFR-S5: Session Management - Secure session tokens, automatic timeout
- NFR-S6: Audit Trail - All time entry changes logged with timestamp and user
- NFR-S7: No Secrets in Client - API keys server-side only
- NFR-S8: Rate Limiting - 100 requests/minute per user

**Reliability (7 NFRs):**
- NFR-R1: Uptime > 99.5%
- NFR-R2: Data Accuracy > 99%
- NFR-R3: Error Rate < 1% of requests
- NFR-R4: Data Loss Prevention - Zero incidents
- NFR-R5: Recovery Time Objective (RTO) < 8 hours
- NFR-R6: Recovery Point Objective (RPO) < 1 hour
- NFR-R7: Backup Strategy - Daily automatic + PITR

**Scalability (3 NFRs):**
- NFR-SC1: User Capacity 60 users (2x headroom = 120)
- NFR-SC2: Data Growth < 400 MB Year 1
- NFR-SC3: Upgrade Trigger > 350 MB database

**Accessibility (7 NFRs):**
- NFR-A1: Keyboard Navigation - All interactive elements reachable
- NFR-A2: Focus Indicators - Visible focus ring on all controls
- NFR-A3: Screen Reader - Semantic HTML + ARIA labels
- NFR-A4: Color Contrast - 4.5:1 minimum for text
- NFR-A5: Touch Targets - 44x44px minimum
- NFR-A6: Form Labels - All inputs have associated labels
- NFR-A7: Error Messages - Clear, descriptive error feedback

**Testability (2 NFRs):**
- NFR-T1: Unit Test Coverage > 70% for business logic
- NFR-T2: E2E Test Coverage - 100% of MVP user journeys

**Observability (3 NFRs):**
- NFR-O1: Structured Logging - All errors logged with correlation IDs
- NFR-O2: Error Tracking - Client-side errors captured
- NFR-O3: Performance Monitoring - Core Web Vitals tracked

**Developer Experience (3 NFRs):**
- NFR-D1: Local Setup < 10 minutes
- NFR-D2: Build Time < 3 minutes
- NFR-D3: Hot Reload < 2 seconds

**Total: 42 Non-Functional Requirements**

### Additional Requirements

**From Architecture Document:**

1. **Starter Template:** Use Official Vercel Supabase Starter
   ```bash
   npx create-next-app -e with-supabase timelog
   ```
   This MUST be Epic 1, Story 1

2. **Multi-Department Manager Support:**
   - Junction table `manager_departments` for managers overseeing multiple departments
   - Manager can oversee 2 departments (critical requirement)
   - RLS policies must support multi-department access

3. **Database Schema Requirements:**
   - Client → Project → Job cascading hierarchy
   - Snapshot pattern: `time_entries.department_id` captured at creation time
   - Soft delete for master data with existing time entries

4. **RLS Policies for 4 Roles:**
   - Staff: Own entries only
   - Manager: Own + managed departments
   - Admin: All entries
   - Super Admin: All entries + all admin functions

5. **State Management Pattern:**
   - TanStack Query v5 for Entry page ONLY
   - Server Components for Dashboard/Team/Admin pages
   - Server Actions with `ActionResult<T>` return type

6. **Form Handling Requirements:**
   - React Hook Form + Zod validation
   - Form state persistence via sessionStorage
   - Draft auto-save on field change

7. **PWA Setup Requirements:**
   - Manual PWA setup (manifest.json, sw.js)
   - No next-pwa library

8. **Testing Infrastructure:**
   - Vitest for unit tests
   - Playwright for E2E tests
   - RLS E2E tests mandatory for policy changes

**From UX Design Document:**

9. **Mobile-First Design:**
   - Thumb zone optimization for primary actions
   - 44x44px minimum touch targets
   - Safe area padding for iOS (notch, home indicator)

10. **Micro-Interactions:**
    - Haptic feedback on save success (iOS)
    - Skeleton loading states
    - Pull-to-refresh gestures
    - Success animations (checkmark + green flash)

11. **UX Copy Requirements:**
    - Warm Thai language ("บันทึกแล้ว! 🎯" not "บันทึกสำเร็จ")
    - Friendly error messages ("เหลือแค่ duration นะ")
    - Avoid "Required" / "You must..." language

12. **Empty State Handling:**
    - First-time user prompt: "ลองลง log แรกกัน!"
    - Network failure: "บันทึกไว้แล้ว รอ sync"

13. **Visual Feedback Requirements:**
    - Success message display ≥1.5s
    - Error shake animation 400ms
    - Button press scale to 95%

**From Project Context Document:**

14. **Import Alias Enforcement:**
    - All imports must use `@/` aliases
    - No relative paths allowed

15. **Naming Conventions:**
    - Database: snake_case
    - React/TypeScript: camelCase
    - Components: PascalCase
    - Hooks: use-{name}.ts

16. **Test File Organization:**
    - Co-located tests: `*.test.ts` next to source
    - E2E tests: `test/e2e/flows/` and `test/e2e/rls/`

17. **Constants Location:**
    - `src/constants/storage.ts` for DRAFT_KEYS
    - `src/constants/time.ts` for POLLING_INTERVAL_MS

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 2 | Company email login |
| FR2 | Epic 2 | Logout from any page |
| FR3 | Epic 2 | Session persistence |
| FR4 | Epic 2 | Role-based permissions |
| FR5 | Epic 2 | Role-appropriate access |
| FR6 | Epic 2 | Session timeout handling |
| FR7 | Epic 4 | Create time entry |
| FR8 | Epic 4 | Select Client |
| FR9 | Epic 4 | Select Service |
| FR10 | Epic 4 | Select Task (optional) |
| FR11 | Epic 4 | Enter duration |
| FR12 | Epic 4 | Select date |
| FR13 | Epic 4 | Edit own entries |
| FR14 | Epic 4 | Delete own entries |
| FR15 | Epic 4 | Recent combinations |
| FR16 | Epic 4 | Form validation |
| FR17 | Epic 5 | View today's entries |
| FR18 | Epic 5 | View weekly entries |
| FR19 | Epic 5 | View monthly entries |
| FR20 | Epic 5 | View total hours |
| FR21 | Epic 5 | Filter by Client |
| FR22 | Epic 5 | Search entries |
| FR23 | Epic 6 | View team entries |
| FR24 | Epic 6 | Team logged today |
| FR25 | Epic 6 | Team NOT logged today |
| FR26 | Epic 6 | Aggregated team hours |
| FR27 | Epic 6 | Near real-time updates |
| FR28 | Epic 7 | Create users |
| FR29 | Epic 7 | Edit users |
| FR30 | Epic 7 | Deactivate users |
| FR31 | Epic 7 | Assign roles |
| FR32 | Epic 7 | Filter users |
| FR33 | Epic 3 | Add Services |
| FR34 | Epic 3 | Edit Services |
| FR35 | Epic 3 | Add Clients |
| FR36 | Epic 3 | Edit Clients |
| FR37 | Epic 3 | Add Tasks |
| FR38 | Epic 3 | Edit Tasks |
| FR39 | Epic 3 | Soft delete protection |
| FR40 | Epic 8 | Install to home screen |
| FR41 | Epic 8 | Touch-optimized UI |
| FR42 | Epic 8 | Offline message |
| FR43 | Epic 8 | Pull-to-refresh |
| FR44 | Epic 4 | Navigation |
| FR45 | Epic 5 | Empty states |
| FR46 | Epic 4 | Skeleton loading |
| FR47 | Epic 8 | Audit log |
| FR48 | Epic 8 | Instant start for new users |
| FR49 | Epic 8 | Contextual guidance |

**Coverage:** ✅ All 49 FRs mapped to epics

---

## Epic List

### Epic 1: Project Foundation + Seed Data
**User Outcome:** ระบบพื้นฐานพร้อมสำหรับ development พร้อม realistic test data

**Includes:**
- Project initialization with `npx create-next-app -e with-supabase timelog`
- Database schema (departments, users, clients, projects, jobs, services, tasks, time_entries, manager_departments, user_recent_combinations, audit_logs)
- RLS policies for 4 roles (staff, manager, admin, super_admin)
- Testing infrastructure (Vitest, Playwright)
- Seed data: 10 Clients, 20 Projects, 50 Jobs, 8 Services, 10 Tasks
- Test users for each role

**FRs covered:** Infrastructure (enables all FRs)

---

### Epic 2: Authentication & Authorization
**User Outcome:** Users สามารถ login ด้วย email บริษัท และเข้าถึง features ตาม role

**Includes:**
- Company email login (Supabase Auth)
- Logout from any page
- Session persistence across refreshes
- Role-based access control middleware
- Session timeout with graceful handling

**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6

---

### Epic 3: Master Data Administration
**User Outcome:** Admins สามารถจัดการ Services, Clients, Projects, Jobs, Tasks ได้อย่างมั่นใจ

**Includes:**
- Add/Edit Services
- Add/Edit Clients with Projects hierarchy
- Add/Edit Jobs (nested under Projects)
- Add/Edit Task codes
- Soft delete protection (prevent deletion with existing entries)
- Admin-only access control

**FRs covered:** FR33, FR34, FR35, FR36, FR37, FR38, FR39

**Why Before Entry:** Quick Entry (Epic 4) requires master data to exist for dropdown selections

---

### Epic 4: Quick Time Entry
**User Outcome:** Employees สามารถลง timesheet ได้อย่างรวดเร็วใน <30 วินาที

**Includes:**
- Create time entry with cascading selector (Client → Project → Job → Service → Task)
- Duration input with smart defaults
- Date selection (default: today)
- Edit/Delete own entries
- Recent combinations (last 5 for 1-tap entry)
- Form validation with clear Thai error messages
- Bottom navigation
- Skeleton loading states
- Form draft auto-save (sessionStorage)

**FRs covered:** FR7, FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR15, FR16, FR44, FR46

**Core Value Proposition:** "เห็นแล้วอยากลง log"

---

### Epic 5: Personal Dashboard
**User Outcome:** Employees เห็น entries ของตัวเอง พร้อม stats และสามารถ filter/search ได้

**Includes:**
- View entries: today, this week, this month
- Total hours per period with visual stats
- Filter by Client
- Search entries
- Empty state messages
- Period selector tabs

**FRs covered:** FR17, FR18, FR19, FR20, FR21, FR22, FR45

---

### Epic 6: Team Dashboard
**User Outcome:** Managers เห็น compliance status และ hours ของทีมแบบ real-time

**Includes:**
- View team members' entries
- Compliance status (who logged/didn't log today)
- Aggregated team hours
- Near real-time updates (30s polling)
- Multi-department support (manager can see 2 departments)
- Department filter

**FRs covered:** FR23, FR24, FR25, FR26, FR27

---

### Epic 7: User Administration
**User Outcome:** Admins สามารถจัดการ users และ roles ได้

**Includes:**
- Create user accounts
- Edit user information
- Deactivate users (soft delete)
- Assign roles (staff, manager, admin, super_admin)
- Assign departments
- Assign manager_departments (for multi-department managers)
- Filter by department/role

**FRs covered:** FR28, FR29, FR30, FR31, FR32

---

### Epic 8: PWA & UX Polish
**User Outcome:** App installable บน home screen พร้อม mobile-first UX และ onboarding

**Includes:**
- PWA manifest.json for install to home screen
- Service worker for static asset caching
- Touch-optimized interface (44x44px targets)
- Offline message display
- Pull-to-refresh on dashboards
- Audit log for entry changes (database trigger)
- First-time user flow
- Contextual guidance tooltips
- Haptic feedback (iOS)
- Success animations

**FRs covered:** FR40, FR41, FR42, FR43, FR47, FR48, FR49

---

## Epic Dependencies

```
Epic 1 (Foundation + Seed) → Required by all epics
    ↓
Epic 2 (Auth) → Required for all protected features
    ↓
Epic 3 (Master Data) → Admin creates production data
    ↓
Epic 4 (Entry) → Core feature, uses master data
    ↓
Epic 5 (Personal) → Uses entries from Epic 4
Epic 6 (Team) → Uses entries, requires auth + multi-dept RLS
Epic 7 (Users) → Admin-only, requires auth
    ↓
Epic 8 (PWA) → Polish layer, enhances all epics
```

**Note:** Each epic is STANDALONE — can be deployed and function independently after completion.

---

## Epic 1: Project Foundation + Seed Data

**Epic Goal:** ระบบพื้นฐานพร้อมสำหรับ development พร้อม realistic test data

### Story 1.1: Project Initialization

As a **developer**,
I want **a properly initialized Next.js + Supabase project with all dependencies**,
So that **I can start building features on a solid foundation**.

**Acceptance Criteria:**

**Given** I have Node.js 18+ and npm installed
**When** I run the initialization script
**Then** A Next.js 14 project is created using the official Supabase starter (`npx create-next-app -e with-supabase timelog`)
**And** All dependencies are installed (framer-motion, @use-gesture/react)
**And** Testing infrastructure is configured (Vitest, Playwright)
**And** TypeScript strict mode is enabled
**And** Project structure matches architecture specification
**And** Environment variables template is created (.env.example)
**And** shadcn/ui components are initialized (button, card, input, select, sheet, dialog, toast)

---

### Story 1.2: Database Schema - Core Tables

As a **developer**,
I want **the core database tables created with proper relationships**,
So that **the application can store and manage data**.

**Acceptance Criteria:**

**Given** Supabase project is connected
**When** Migrations are run
**Then** `departments` table exists with id (UUID), name (TEXT), active (BOOLEAN), created_at (TIMESTAMPTZ)
**And** `users` table exists with id (UUID, FK to auth.users), email (TEXT), display_name (TEXT), role (TEXT: staff/manager/admin/super_admin), department_id (UUID, FK), created_at
**And** `clients` table exists with id (UUID), name (TEXT), active (BOOLEAN), created_at
**And** `projects` table exists with id (UUID), client_id (UUID, FK), name (TEXT), active (BOOLEAN), created_at
**And** `jobs` table exists with id (UUID), project_id (UUID, FK), name (TEXT), job_no (TEXT), so_no (TEXT), active (BOOLEAN), created_at
**And** `services` table exists with id (UUID), name (TEXT), active (BOOLEAN), created_at
**And** `tasks` table exists with id (UUID), name (TEXT), active (BOOLEAN), created_at
**And** Foreign key constraints are properly set with ON DELETE CASCADE
**And** Indexes created: idx_projects_client, idx_jobs_project

---

### Story 1.3: Database Schema - Time Entry & Supporting Tables

As a **developer**,
I want **time entry and supporting tables created**,
So that **time tracking functionality can be implemented**.

**Acceptance Criteria:**

**Given** Core tables from Story 1.2 exist
**When** Migrations are run
**Then** `time_entries` table exists with id (UUID), user_id (UUID, FK), job_id (UUID, FK), service_id (UUID, FK), task_id (UUID, FK, nullable), duration_minutes (INTEGER), entry_date (DATE), notes (TEXT), department_id (UUID, snapshot), created_at, updated_at
**And** `manager_departments` junction table exists with id (UUID), manager_id (UUID, FK to users), department_id (UUID, FK), created_at, UNIQUE(manager_id, department_id)
**And** `user_recent_combinations` table exists with id (UUID), user_id (UUID, FK), client_id (UUID), project_id (UUID), job_id (UUID), service_id (UUID), task_id (UUID, nullable), last_used_at (TIMESTAMPTZ)
**And** `audit_logs` table exists with id (UUID), table_name (TEXT), record_id (UUID), action (TEXT), old_data (JSONB), new_data (JSONB), user_id (UUID), created_at
**And** Indexes created: idx_time_entries_user_date, idx_time_entries_dept_date, idx_manager_departments_manager, idx_recent_user

---

### Story 1.4: RLS Policies for All Roles

As a **developer**,
I want **Row Level Security policies configured for all 4 roles**,
So that **data access is properly restricted at the database level**.

**Acceptance Criteria:**

**Given** All database tables exist
**When** RLS policies are applied
**Then** Staff can only SELECT/INSERT/UPDATE/DELETE their own time_entries (user_id = auth.uid())
**And** Managers can SELECT time_entries from their managed departments (via EXISTS subquery on manager_departments)
**And** Managers can INSERT/UPDATE/DELETE only their own time_entries
**And** Admins can SELECT all time_entries
**And** Super Admins have full access (SELECT/INSERT/UPDATE/DELETE) to all tables
**And** All authenticated users can SELECT active master data (clients, projects, jobs, services, tasks WHERE active = true)
**And** Only admin/super_admin roles can INSERT/UPDATE master data tables
**And** RLS is enabled on ALL tables
**And** E2E test exists: staff_cannot_read_other_users_entries
**And** E2E test exists: manager_cannot_read_entries_from_non_managed_department
**And** E2E test exists: manager_can_read_entries_from_both_managed_departments

---

### Story 1.5: Seed Data for Development

As a **developer**,
I want **realistic seed data populated in the database**,
So that **I can develop and test features with meaningful data**.

**Acceptance Criteria:**

**Given** All tables and RLS policies exist
**When** Seed script is executed
**Then** 3 departments exist: "Audio Production", "Video Production", "Localization"
**And** 10 clients exist with realistic Thai company names
**And** 20 projects exist distributed across clients (2 per client average)
**And** 50 jobs exist distributed across projects with realistic job_no (e.g., "JOB-2024-001") and so_no
**And** 8 services exist: "Dubbing", "Subtitling", "QC", "Recording", "Mixing", "Translation", "Voice Over", "ADR"
**And** 10 task codes exist: "Preparation", "Production", "Review", "Revision", "Delivery", "Meeting", "Admin", "Training", "Research", "Support"
**And** 4 test users exist with emails: staff@test.com, manager@test.com, admin@test.com, superadmin@test.com
**And** Test manager is assigned to 2 departments ("Audio Production" + "Video Production") via manager_departments
**And** 20 sample time_entries exist for staff user across different dates
**And** Seed script is idempotent (uses upsert or checks before insert)

---

## Epic 2: Authentication & Authorization

**Epic Goal:** Users สามารถ login ด้วย email บริษัท และเข้าถึง features ตาม role

### Story 2.1: Company Email Login

As a **user**,
I want **to log in using my company email address**,
So that **I can access the time tracking system securely**.

**Acceptance Criteria:**

**Given** I am on the login page
**When** I enter my company email and click "Login with Email"
**Then** Supabase Auth sends a magic link to my email
**And** I receive the email within 30 seconds
**And** Clicking the magic link logs me in and redirects to /entry
**And** My user record is created/updated in the users table with default role 'staff'
**And** Invalid email formats show inline validation error
**And** Login page is mobile-responsive with 44x44px touch targets

---

### Story 2.2: Session Persistence & Logout

As a **logged-in user**,
I want **my session to persist across browser refreshes and be able to logout**,
So that **I don't have to login repeatedly but can securely end my session**.

**Acceptance Criteria:**

**Given** I am logged in
**When** I refresh the browser
**Then** My session is maintained and I remain logged in
**And** Logout button is visible in the header/profile area on all pages
**When** I click logout
**Then** My session is terminated via Supabase Auth signOut
**And** I am redirected to the login page
**And** Attempting to access protected routes (/entry, /dashboard, /team, /admin) redirects to login
**And** Session cookies are cleared on logout

---

### Story 2.3: Role-Based Access Control Middleware

As a **system**,
I want **to enforce role-based access control via Next.js middleware**,
So that **users can only access features appropriate to their role**.

**Acceptance Criteria:**

**Given** A user is authenticated
**When** They attempt to access a protected route
**Then** Middleware checks their role from the users table
**And** Staff (role='staff') can access: /entry, /dashboard
**And** Managers (role='manager') can access: /entry, /dashboard, /team
**And** Admins (role='admin') can access: /entry, /dashboard, /team, /admin
**And** Super Admins (role='super_admin') can access all routes
**And** Unauthorized access to /admin by staff shows "ไม่มีสิทธิ์เข้าถึง" and redirects to /entry
**And** Unauthorized access to /team by staff redirects to /dashboard
**And** User role is fetched once per session and cached

---

### Story 2.4: Session Timeout Handling

As a **user**,
I want **graceful handling when my session expires**,
So that **I understand what happened and can easily re-authenticate**.

**Acceptance Criteria:**

**Given** My session has expired (after 7 days of inactivity)
**When** I attempt any action requiring authentication
**Then** I see a friendly toast message: "เซสชั่นหมดอายุ กรุณา login ใหม่"
**And** Any form data on the current page is preserved in sessionStorage before redirect
**And** I am redirected to login page with returnUrl parameter
**And** After successful re-login, I am returned to the page I was on (via returnUrl)
**And** API calls that fail due to expired session return 401 and trigger re-auth flow

---

## Epic 3: Master Data Administration

**Epic Goal:** Super Admin สามารถจัดการข้อมูลหลัก (Services, Clients, Tasks) ได้อย่างครบถ้วน

### Story 3.1: Service Type Management

As a **super_admin**,
I want **to add and edit service types**,
So that **I can configure the services available for time entries**.

**Acceptance Criteria:**

**Given** I am logged in as super_admin
**When** I navigate to Master Data > Services
**Then** I see a list of all services with name and status columns
**And** I see an "Add Service" button

**Given** I click "Add Service"
**When** I enter service name and click Save
**Then** The new service is created with is_active = true
**And** I see a success toast notification
**And** The service appears in the list

**Given** I click Edit on an existing service
**When** I modify the name or toggle is_active and click Save
**Then** The changes are persisted
**And** I see a success toast notification

**Given** I try to add a service with duplicate name
**When** I click Save
**Then** I see validation error "Service name already exists"
**And** The form is not submitted

---

### Story 3.2: Client Management

As a **super_admin**,
I want **to add and edit clients**,
So that **I can configure the clients available for time entries**.

**Acceptance Criteria:**

**Given** I am logged in as super_admin
**When** I navigate to Master Data > Clients
**Then** I see a list of all clients with name and status columns
**And** I see an "Add Client" button

**Given** I click "Add Client"
**When** I enter client name and click Save
**Then** The new client is created with is_active = true
**And** I see a success toast notification

**Given** I click Edit on an existing client
**When** I modify the name or toggle is_active and click Save
**Then** The changes are persisted
**And** I see a success toast notification

**Given** I try to add a client with duplicate name
**When** I click Save
**Then** I see validation error "Client name already exists"

---

### Story 3.3: Task Management

As a **super_admin**,
I want **to add and edit tasks**,
So that **I can configure the tasks available for time entries**.

**Acceptance Criteria:**

**Given** I am logged in as super_admin
**When** I navigate to Master Data > Tasks
**Then** I see a list of all tasks with name and status columns
**And** I see an "Add Task" button

**Given** I click "Add Task"
**When** I enter task name and click Save
**Then** The new task is created with is_active = true
**And** I see a success toast notification

**Given** I click Edit on an existing task
**When** I modify the name or toggle is_active and click Save
**Then** The changes are persisted

**Given** I try to add a task with duplicate name
**When** I click Save
**Then** I see validation error "Task name already exists"

---

### Story 3.4: Soft Delete Protection

As a **super_admin**,
I want **the system to prevent deletion of master data that is referenced by time entries**,
So that **historical data integrity is preserved**.

**Acceptance Criteria:**

**Given** A service/client/task has been used in time_entries
**When** I try to deactivate it (set is_active = false)
**Then** The operation succeeds (soft delete via is_active flag)
**And** The item no longer appears in dropdowns for new entries
**And** Historical time entries still display the correct name

**Given** A service/client/task has NOT been used in time_entries
**When** I deactivate it
**Then** The operation succeeds
**And** The item can be reactivated later if needed

**Given** Dropdown options for time entry form
**When** Loading services/clients/tasks
**Then** Only items with is_active = true are shown
**And** Query filters: `WHERE is_active = true`

---

### Story 3.5: Master Data Admin UI Layout

As a **super_admin**,
I want **a consistent admin interface for managing master data**,
So that **I can efficiently manage all configuration data**.

**Acceptance Criteria:**

**Given** I am logged in as super_admin
**When** I access the Master Data section
**Then** I see tabs/navigation for Services, Clients, Tasks

**Given** Any master data list page
**When** Viewing the list
**Then** I see a DataTable with columns: Name, Status (Active/Inactive), Actions
**And** I can sort by any column
**And** I can search/filter by name

**Given** I am on mobile viewport
**When** Viewing master data admin
**Then** The layout adapts responsively
**And** All CRUD operations remain accessible

---

## Epic 4: Quick Time Entry

**Epic Goal:** Employees สามารถลง timesheet ได้อย่างรวดเร็วใน <30 วินาที

### Story 4.1: Bottom Navigation Component

As a **user**,
I want **a persistent bottom navigation bar**,
So that **I can quickly switch between Entry, Dashboard, and other sections**.

**Acceptance Criteria:**

**Given** I am logged in on any page
**When** I view the screen on mobile
**Then** I see a bottom navigation bar with icons for: Entry, Dashboard, Team (manager+), Admin (admin+)
**And** The current page icon is highlighted
**And** Touch targets are minimum 44x44px
**And** Navigation items are visible based on my role (staff sees Entry, Dashboard only)

**Given** I tap a navigation icon
**When** The navigation completes
**Then** I am taken to that page without full page reload (client-side navigation)
**And** The navigation bar remains fixed at the bottom

---

### Story 4.2: Time Entry Form - Cascading Selectors

As a **staff member**,
I want **to select Client → Project → Job in a cascading manner**,
So that **I can accurately categorize my time entry**.

**Acceptance Criteria:**

**Given** I am on the /entry page
**When** The page loads
**Then** I see the Client dropdown enabled with active clients
**And** Project and Job dropdowns are disabled until Client is selected

**Given** I select a Client
**When** The selection is confirmed
**Then** The Project dropdown is enabled showing only projects for that client
**And** The Job dropdown remains disabled

**Given** I select a Project
**When** The selection is confirmed
**Then** The Job dropdown is enabled showing only jobs for that project
**And** Jobs display: "{job_no} - {name}"

**Given** I change the Client selection
**When** A different Client is selected
**Then** Project and Job selections are cleared
**And** Project dropdown updates to show the new client's projects

---

### Story 4.3: Time Entry Form - Service, Task & Duration

As a **staff member**,
I want **to select Service, optional Task, and enter duration**,
So that **I can complete my time entry with all required information**.

**Acceptance Criteria:**

**Given** I have selected Client → Project → Job
**When** I continue filling the form
**Then** I see Service dropdown (required) with active services
**And** I see Task dropdown (optional) with active tasks
**And** I see Duration input field

**Given** I tap the Duration field
**When** The input is focused
**Then** I see preset buttons: 0.5h, 1h, 2h, 4h, 8h
**And** I can enter custom hours (0.25 increments)
**And** Invalid values show error: "กรุณาใส่เวลาที่ถูกต้อง (0.25-24 ชั่วโมง)"

**Given** I enter duration as decimal hours (e.g., 1.5)
**When** The entry is saved
**Then** The duration is stored as minutes (90)
**And** Display shows "1.5 ชม." or "1 ชม. 30 นาที"

---

### Story 4.4: Time Entry Form - Date Selection & Submission

As a **staff member**,
I want **to select an entry date and submit my time entry**,
So that **my work hours are recorded for the correct day**.

**Acceptance Criteria:**

**Given** I am filling out the time entry form
**When** I view the date field
**Then** It defaults to today's date
**And** I can tap to open a date picker

**Given** I select a different date
**When** The date picker confirms
**Then** The selected date is displayed in Thai format: "31 ธ.ค. 2567"
**And** Future dates more than 1 day ahead show warning (but are allowed)

**Given** All required fields are filled (Client, Project, Job, Service, Duration, Date)
**When** I tap "บันทึก" (Save) button
**Then** The entry is created via Server Action
**And** I see success animation (confetti or checkmark)
**And** The form resets for next entry
**And** The entry appears in my dashboard immediately

**Given** Server Action fails
**When** Error response is received
**Then** I see toast: "ไม่สามารถบันทึกได้ กรุณาลองอีกครั้ง"
**And** Form data is preserved

---

### Story 4.5: Edit Own Time Entry

As a **staff member**,
I want **to edit my own time entries**,
So that **I can correct mistakes or update information**.

**Acceptance Criteria:**

**Given** I am viewing my entries on the dashboard
**When** I tap on an entry row
**Then** A bottom sheet slides up with entry details
**And** I see "แก้ไข" (Edit) and "ลบ" (Delete) buttons

**Given** I tap "แก้ไข"
**When** The edit form opens
**Then** All fields are pre-populated with current values
**And** Cascading selectors maintain their hierarchy

**Given** I modify any field and tap "บันทึก"
**When** The update succeeds
**Then** I see success toast: "อัพเดทเรียบร้อย"
**And** The entry list refreshes with updated data
**And** audit_log records the change

**Given** I try to edit an entry from more than 7 days ago
**When** The edit attempt is made
**Then** I see error: "ไม่สามารถแก้ไข entry เก่ากว่า 7 วัน"

---

### Story 4.6: Delete Own Time Entry

As a **staff member**,
I want **to delete my own time entries**,
So that **I can remove incorrect entries**.

**Acceptance Criteria:**

**Given** I am viewing entry details in the bottom sheet
**When** I tap "ลบ" (Delete)
**Then** I see confirmation dialog: "ต้องการลบ entry นี้?"
**And** Options are "ยกเลิก" and "ลบ"

**Given** I confirm deletion
**When** The delete succeeds
**Then** I see toast: "ลบเรียบร้อย"
**And** The entry is removed from the list (soft delete)
**And** audit_log records the deletion
**And** Bottom sheet closes automatically

**Given** I cancel deletion
**When** I tap "ยกเลิก"
**Then** The confirmation closes
**And** The entry remains unchanged

---

### Story 4.7: Recent Combinations Quick Entry

As a **staff member**,
I want **to quickly create entries using my recent combinations**,
So that **I can log repetitive work in seconds**.

**Acceptance Criteria:**

**Given** I am on the /entry page
**When** The page loads
**Then** I see "รายการล่าสุด" section showing up to 5 recent combinations
**And** Each shows: Client > Project > Job > Service (Task if present)

**Given** I tap a recent combination
**When** The tap registers
**Then** The form is populated with that combination's values
**And** Only Duration and Date need to be entered
**And** Focus moves to Duration field

**Given** I save an entry with a new combination
**When** The save succeeds
**Then** The user_recent_combinations table is updated
**And** This combination appears at the top of recent list
**And** If more than 5 combinations, oldest is removed

**Given** I have no recent entries
**When** I view the recent section
**Then** I see: "ยังไม่มีรายการล่าสุด"

---

### Story 4.8: Form Validation & Error States

As a **staff member**,
I want **clear validation feedback on the entry form**,
So that **I can correct errors before submission**.

**Acceptance Criteria:**

**Given** I try to submit without selecting Client
**When** I tap "บันทึก"
**Then** Client field shows error: "กรุณาเลือก Client"
**And** Form scrolls to first error field
**And** Submit button shakes briefly

**Given** I try to submit without duration
**When** I tap "บันทึก"
**Then** Duration field shows error: "กรุณาใส่ระยะเวลา"

**Given** I enter duration > 24 hours
**When** Field loses focus
**Then** Error shows: "ระยะเวลาต้องไม่เกิน 24 ชั่วโมง"

**Given** All validations pass
**When** I tap "บันทึก"
**Then** Button shows loading spinner
**And** Form fields are disabled during submission
**And** No duplicate submissions are possible

---

### Story 4.9: Skeleton Loading States

As a **user**,
I want **to see loading skeletons while data loads**,
So that **I understand the app is working and the layout remains stable**.

**Acceptance Criteria:**

**Given** I navigate to /entry page
**When** Data is loading (recent combinations, dropdown options)
**Then** I see skeleton placeholders matching the final layout
**And** Skeletons have subtle pulse animation
**And** Layout does not shift when real data loads

**Given** Dropdown options are loading
**When** I tap a dropdown
**Then** I see loading indicator inside the dropdown
**And** Dropdown is disabled until data arrives

**Given** Data fails to load
**When** Error occurs
**Then** I see retry button: "ลองใหม่"
**And** Tapping retry refetches the data

---

### Story 4.10: Form Draft Auto-Save

As a **staff member**,
I want **my partially filled form to persist if I navigate away**,
So that **I don't lose my work**.

**Acceptance Criteria:**

**Given** I am filling out the entry form
**When** I select values but don't submit
**Then** Form state is saved to sessionStorage every 2 seconds
**And** Storage key: DRAFT_KEYS.TIME_ENTRY

**Given** I navigate away and return to /entry
**When** The page loads
**Then** Form is restored from sessionStorage draft
**And** I see toast: "พบแบบร่างที่ยังไม่ได้บันทึก"
**And** I can continue or clear the draft

**Given** I successfully submit an entry
**When** Submission completes
**Then** The draft is cleared from sessionStorage

**Given** Draft is older than 24 hours
**When** Page loads
**Then** Draft is discarded
**And** Fresh form is shown

---

## Epic 5: Personal Dashboard

**Epic Goal:** Employees เห็น entries ของตัวเอง พร้อม stats และสามารถ filter/search ได้

### Story 5.1: Dashboard Layout & Period Selector

As a **staff member**,
I want **to view my time entries organized by time period**,
So that **I can track my logged hours effectively**.

**Acceptance Criteria:**

**Given** I am logged in and navigate to /dashboard
**When** The page loads
**Then** I see a period selector with tabs: "วันนี้", "สัปดาห์นี้", "เดือนนี้"
**And** "วันนี้" is selected by default
**And** I see my entries for the selected period
**And** The layout is optimized for mobile (single column, stacked cards)

**Given** I tap a different period tab
**When** The selection changes
**Then** Entries are filtered to show only that period
**And** URL updates with query param (e.g., ?period=week) for shareability
**And** Stats update to reflect the selected period

---

### Story 5.2: Today's Entries View

As a **staff member**,
I want **to see all my entries for today**,
So that **I can verify what I've logged and see remaining work**.

**Acceptance Criteria:**

**Given** I am on the dashboard with "วันนี้" selected
**When** I have entries for today
**Then** I see a list of entries sorted by created_at (newest first)
**And** Each entry shows: Client > Job, Service, Duration, Time logged

**Given** Today is a workday
**When** I view my entries
**Then** I see total hours logged today prominently displayed
**And** I see visual indicator if < 8 hours (subtle, not alarming)

**Given** I tap on an entry
**When** The tap registers
**Then** Bottom sheet opens with full entry details
**And** I can edit or delete from the bottom sheet (links to Epic 4 stories)

---

### Story 5.3: Weekly Entries View

As a **staff member**,
I want **to see all my entries for the current week**,
So that **I can review my weekly progress**.

**Acceptance Criteria:**

**Given** I am on the dashboard with "สัปดาห์นี้" selected
**When** The page loads
**Then** I see entries from Monday to Sunday of current week
**And** Entries are grouped by date with date headers
**And** Each date shows: "จันทร์ 30 ธ.ค." format

**Given** I have entries across multiple days
**When** Viewing weekly view
**Then** I see daily subtotals for each day
**And** I see weekly total at the top
**And** Days with 0 hours show with muted styling

---

### Story 5.4: Monthly Entries View

As a **staff member**,
I want **to see all my entries for the current month**,
So that **I can review my monthly totals**.

**Acceptance Criteria:**

**Given** I am on the dashboard with "เดือนนี้" selected
**When** The page loads
**Then** I see entries from 1st to last day of current month
**And** Entries are grouped by week with week headers
**And** Monthly total is prominently displayed

**Given** The month has many entries (>50)
**When** Scrolling the list
**Then** Virtualized list renders smoothly
**And** Date headers remain sticky while scrolling

---

### Story 5.5: Total Hours Statistics

As a **staff member**,
I want **to see aggregated statistics for my time entries**,
So that **I can understand my work patterns at a glance**.

**Acceptance Criteria:**

**Given** I am on the dashboard
**When** Viewing any period
**Then** I see a stats card at the top showing:
  - Total hours for the period
  - Number of entries
  - Most used Client (if data exists)

**Given** Period is "วันนี้"
**When** Stats display
**Then** I see: "วันนี้: X ชม. (Y รายการ)"

**Given** Period is "สัปดาห์นี้"
**When** Stats display
**Then** I see: "สัปดาห์นี้: X ชม. (Y รายการ)"
**And** I see average per day: "เฉลี่ย X.X ชม./วัน"

---

### Story 5.6: Filter by Client

As a **staff member**,
I want **to filter my entries by client**,
So that **I can see time spent on specific clients**.

**Acceptance Criteria:**

**Given** I am on the dashboard
**When** I tap the filter icon
**Then** I see a filter sheet with Client dropdown
**And** Dropdown shows all clients I've logged time to

**Given** I select a client and apply filter
**When** Filter is active
**Then** Only entries for that client are shown
**And** Stats update to reflect filtered data
**And** Filter chip appears showing active filter
**And** URL updates with ?client=xxx

**Given** I tap the filter chip "x" button
**When** Filter is cleared
**Then** All entries are shown again
**And** URL param is removed

---

### Story 5.7: Search Entries

As a **staff member**,
I want **to search my entries by text**,
So that **I can find specific entries quickly**.

**Acceptance Criteria:**

**Given** I am on the dashboard
**When** I tap the search icon
**Then** Search input appears at the top
**And** Keyboard opens automatically

**Given** I type a search query (min 2 characters)
**When** I stop typing for 300ms (debounced)
**Then** Entries are filtered to match query
**And** Search matches: client name, project name, job name, job_no, service name, notes

**Given** Search returns no results
**When** Query doesn't match any entries
**Then** I see: "ไม่พบรายการที่ค้นหา"
**And** I see option to clear search

**Given** I clear the search
**When** I tap clear button or delete all text
**Then** All entries for current period are shown again

---

### Story 5.8: Empty States

As a **staff member**,
I want **to see helpful messages when there's no data**,
So that **I understand why the list is empty and what to do**.

**Acceptance Criteria:**

**Given** I have no entries for "วันนี้"
**When** Dashboard loads
**Then** I see empty state: "ยังไม่มี entry วันนี้"
**And** I see CTA button: "เพิ่ม Entry" linking to /entry
**And** Illustration or icon is shown (minimal, not distracting)

**Given** I have no entries for "สัปดาห์นี้"
**When** Dashboard loads
**Then** I see: "ยังไม่มี entry สัปดาห์นี้"
**And** Same CTA button appears

**Given** Filter returns no results
**When** Client filter is active but no matching entries
**Then** I see: "ไม่พบ entry สำหรับ [Client Name]"
**And** I see option to clear filter

---

## Epic 6: Team Dashboard

**Epic Goal:** Managers เห็น compliance status และ hours ของทีมแบบ real-time

### Story 6.1: Team Dashboard Layout

As a **manager**,
I want **to view a dashboard of my team's time entries**,
So that **I can monitor team productivity and compliance**.

**Acceptance Criteria:**

**Given** I am logged in as a manager and navigate to /team
**When** The page loads
**Then** I see a team dashboard with my managed department(s)
**And** I see today's date prominently displayed
**And** I see summary stats at the top
**And** I see a list of team members with their status

**Given** I am a staff member
**When** I try to access /team
**Then** I am redirected to /dashboard with message "ไม่มีสิทธิ์เข้าถึง"

---

### Story 6.2: Team Members Who Logged Today

As a **manager**,
I want **to see which team members have logged time today**,
So that **I can track daily compliance**.

**Acceptance Criteria:**

**Given** I am on the team dashboard
**When** Viewing the "ลงแล้ว" (Logged) section
**Then** I see a list of team members who have at least 1 entry today
**And** Each member shows: Name, Total hours today, Number of entries
**And** List is sorted by total hours (descending)

**Given** A team member has logged 8+ hours
**When** Viewing their row
**Then** I see a green checkmark indicator
**And** Hours display in green text

**Given** A team member has logged < 8 hours
**When** Viewing their row
**Then** I see hours in neutral color (no alarm)
**And** No negative indicators shown

---

### Story 6.3: Team Members Who Haven't Logged Today

As a **manager**,
I want **to see which team members haven't logged time today**,
So that **I can follow up if needed**.

**Acceptance Criteria:**

**Given** I am on the team dashboard
**When** Viewing the "ยังไม่ลง" (Not Logged) section
**Then** I see a list of team members with 0 entries today
**And** Each member shows: Name only (no hours to display)
**And** List is sorted alphabetically

**Given** It's before noon
**When** Viewing the "ยังไม่ลง" section
**Then** Members show with neutral styling (it's early)

**Given** It's after 5 PM
**When** Viewing the "ยังไม่ลง" section
**Then** Members show with subtle warning indicator (orange dot)
**And** No aggressive alerting - just visual cue

**Given** All team members have logged today
**When** Viewing the "ยังไม่ลง" section
**Then** I see: "ทุกคนลงแล้ว!" with success icon

---

### Story 6.4: Aggregated Team Hours

As a **manager**,
I want **to see aggregated hours for my team**,
So that **I can understand team capacity utilization**.

**Acceptance Criteria:**

**Given** I am on the team dashboard
**When** Viewing the stats section
**Then** I see: "วันนี้: XX ชม. รวม (Y คน ลงแล้ว)"
**And** I see average: "เฉลี่ย X.X ชม./คน"

**Given** I tap on a period selector (Today, This Week)
**When** Selecting "สัปดาห์นี้"
**Then** Stats update to show weekly totals
**And** I see: "สัปดาห์นี้: XXX ชม. รวม"
**And** I see daily breakdown summary

**Given** Team has 10 members
**When** 8 have logged today
**Then** Compliance rate shows: "80% (8/10 คน)"

---

### Story 6.5: Multi-Department Support

As a **manager of multiple departments**,
I want **to view and filter by department**,
So that **I can focus on specific teams**.

**Acceptance Criteria:**

**Given** I am assigned to manage 2 departments (via manager_departments)
**When** I load the team dashboard
**Then** I see a department filter/selector at the top
**And** Default view shows "ทั้งหมด" (All departments combined)

**Given** I select a specific department
**When** Filter is applied
**Then** Only team members from that department are shown
**And** Stats update to reflect filtered department only
**And** URL updates with ?dept=xxx

**Given** I manage only 1 department
**When** I load the team dashboard
**Then** Department filter is hidden (not needed)
**And** Only my department's members are shown

---

### Story 6.6: Near Real-Time Updates

As a **manager**,
I want **the team dashboard to update automatically**,
So that **I see current data without manual refresh**.

**Acceptance Criteria:**

**Given** I am viewing the team dashboard
**When** The page is open
**Then** Data refreshes automatically every 30 seconds
**And** Polling uses POLLING_INTERVAL_MS from constants
**And** No visible loading indicator during background refresh

**Given** A team member logs a new entry
**When** Next poll occurs (within 30s)
**Then** Their status updates from "ยังไม่ลง" to "ลงแล้ว"
**And** Their hours update in the list
**And** Aggregated stats update

**Given** I manually pull-to-refresh on mobile
**When** Pull gesture completes
**Then** Data refreshes immediately
**And** I see brief loading indicator
**And** Polling timer resets

**Given** Network connection is lost
**When** Poll fails
**Then** No error shown to user (silent retry)
**And** Data remains stale but visible
**And** When connection restored, next poll succeeds

---

## Epic 7: User Administration

**Epic Goal:** Admins สามารถจัดการ users และ roles ได้

### Story 7.1: User List View

As an **admin**,
I want **to view a list of all users in the system**,
So that **I can manage user accounts effectively**.

**Acceptance Criteria:**

**Given** I am logged in as admin and navigate to /admin/users
**When** The page loads
**Then** I see a list of all users
**And** Each user shows: Name, Email, Role, Department, Status (Active/Inactive)
**And** List is paginated (20 per page)
**And** I see total user count

**Given** I am a staff or manager
**When** I try to access /admin/users
**Then** I am redirected with message "ไม่มีสิทธิ์เข้าถึง"

---

### Story 7.2: Create New User

As an **admin**,
I want **to create new user accounts**,
So that **new employees can access the system**.

**Acceptance Criteria:**

**Given** I am on the user list page
**When** I click "เพิ่มผู้ใช้" (Add User)
**Then** I see a form with fields: Email, Display Name, Role, Department

**Given** I fill in all required fields
**When** I click "บันทึก"
**Then** A new user record is created in the users table
**And** User is created with is_active = true
**And** I see success toast: "เพิ่มผู้ใช้สำเร็จ"
**And** User appears in the list

**Given** I enter an email that already exists
**When** I click "บันทึก"
**Then** I see error: "Email นี้มีอยู่ในระบบแล้ว"
**And** Form is not submitted

**Given** I try to create a super_admin as an admin
**When** I select role = super_admin
**Then** I see error: "ไม่สามารถสร้าง Super Admin ได้"
**And** Only super_admin can create other super_admins

---

### Story 7.3: Edit User Information

As an **admin**,
I want **to edit existing user information**,
So that **I can update user details when needed**.

**Acceptance Criteria:**

**Given** I am on the user list
**When** I click Edit on a user row
**Then** I see an edit form pre-populated with user's current data

**Given** I modify any field and click "บันทึก"
**When** Update succeeds
**Then** I see success toast: "อัพเดทผู้ใช้สำเร็จ"
**And** User list reflects the changes
**And** audit_log records the change

**Given** I try to edit a super_admin as an admin
**When** I attempt to modify their record
**Then** I see error: "ไม่สามารถแก้ไข Super Admin ได้"
**And** Only super_admins can edit other super_admins

---

### Story 7.4: Deactivate User

As an **admin**,
I want **to deactivate user accounts**,
So that **former employees can no longer access the system**.

**Acceptance Criteria:**

**Given** I am viewing a user's details
**When** I click "ปิดใช้งาน" (Deactivate)
**Then** I see confirmation: "ต้องการปิดใช้งานผู้ใช้นี้?"

**Given** I confirm deactivation
**When** Deactivation succeeds
**Then** User's is_active is set to false
**And** User can no longer login
**And** User's existing sessions are invalidated
**And** I see toast: "ปิดใช้งานผู้ใช้สำเร็จ"
**And** User shows as "Inactive" in the list

**Given** User is already inactive
**When** I click "เปิดใช้งาน" (Reactivate)
**Then** User's is_active is set to true
**And** User can login again
**And** I see toast: "เปิดใช้งานผู้ใช้สำเร็จ"

---

### Story 7.5: Assign Roles

As an **admin**,
I want **to assign roles to users**,
So that **they have appropriate access levels**.

**Acceptance Criteria:**

**Given** I am editing a user
**When** I view the Role dropdown
**Then** I see options: staff, manager, admin
**And** super_admin is NOT shown (only visible to super_admins)

**Given** I change a user's role from staff to manager
**When** I save the change
**Then** User's role is updated
**And** User gains access to /team page
**And** audit_log records the role change

**Given** I change a user's role to manager
**When** Save completes
**Then** I see prompt: "ต้องการกำหนดแผนกที่ดูแลไหม?"
**And** I can assign departments via manager_departments

**Given** I am a super_admin
**When** I edit roles
**Then** I can see and assign super_admin role
**And** I can edit other super_admins

---

### Story 7.6: Assign Manager Departments

As an **admin**,
I want **to assign departments to managers**,
So that **they can view their team's entries**.

**Acceptance Criteria:**

**Given** I am editing a user with role = manager
**When** I view the department assignment section
**Then** I see a multi-select for departments
**And** Current assignments are pre-selected

**Given** I select 2 departments for a manager
**When** I save
**Then** manager_departments records are created/updated
**And** Manager can now see both departments in /team
**And** RLS allows manager to read entries from both departments

**Given** I remove a department from a manager
**When** I save
**Then** The manager_departments record is deleted
**And** Manager can no longer see that department's entries

**Given** User role is not manager
**When** Viewing their edit form
**Then** Department assignment section is hidden

---

### Story 7.7: Filter Users

As an **admin**,
I want **to filter the user list**,
So that **I can find specific users quickly**.

**Acceptance Criteria:**

**Given** I am on the user list page
**When** I click the filter icon
**Then** I see filter options: Department, Role, Status

**Given** I select Department = "Audio Production"
**When** Filter is applied
**Then** Only users from that department are shown
**And** Filter chip shows active filter
**And** URL updates with ?dept=xxx

**Given** I select Role = "manager"
**When** Filter is applied
**Then** Only managers are shown
**And** Can combine with department filter

**Given** I select Status = "Inactive"
**When** Filter is applied
**Then** Only deactivated users are shown

**Given** I type in search box
**When** Query matches name or email
**Then** List is filtered to matching users
**And** Search is debounced (300ms)

---

## Epic 8: PWA & UX Polish

**Epic Goal:** App installable บน home screen พร้อม mobile-first UX และ onboarding

### Story 8.1: PWA Installation

As a **user**,
I want **to install the app to my home screen**,
So that **I can access it like a native app**.

**Acceptance Criteria:**

**Given** I am on the app using a mobile browser (Chrome/Safari)
**When** The PWA criteria are met
**Then** Browser shows "Add to Home Screen" prompt
**And** App has manifest.json with: name, short_name, icons, theme_color, background_color, display: standalone

**Given** I tap "Add to Home Screen"
**When** Installation completes
**Then** App icon appears on my home screen
**And** Launching shows splash screen with app logo
**And** App opens in standalone mode (no browser UI)

**Given** manifest.json configuration
**When** App is installed
**Then** Icons are provided in sizes: 192x192, 512x512
**And** theme_color matches app primary color (#0066CC)
**And** start_url is set to /entry

---

### Story 8.2: Service Worker & Caching

As a **user**,
I want **static assets cached for fast loading**,
So that **the app loads quickly on repeat visits**.

**Acceptance Criteria:**

**Given** App is loaded for the first time
**When** Service worker registers
**Then** Static assets are cached: JS bundles, CSS, fonts, icons
**And** Cache uses network-first strategy for API calls
**And** Cache uses cache-first strategy for static assets

**Given** I revisit the app
**When** The page loads
**Then** Cached assets load instantly
**And** App shell appears within 100ms
**And** Data fetches in background

**Given** New version is deployed
**When** Service worker detects update
**Then** New assets are cached in background
**And** User sees "อัพเดทใหม่พร้อมใช้งาน" toast on next visit
**And** Refresh loads new version

---

### Story 8.3: Offline Message Display

As a **user**,
I want **to see a clear message when offline**,
So that **I understand why the app isn't working**.

**Acceptance Criteria:**

**Given** I have the app open
**When** Network connection is lost
**Then** I see a banner: "ไม่มีการเชื่อมต่ออินเทอร์เน็ต"
**And** Banner appears at top of screen
**And** Banner has subtle orange/yellow styling (not alarming)

**Given** I try to submit a form while offline
**When** Submission fails
**Then** I see error: "กรุณาเชื่อมต่ออินเทอร์เน็ตก่อนบันทึก"
**And** Form data is NOT lost

**Given** Network connection is restored
**When** Online event fires
**Then** Offline banner disappears automatically
**And** I see brief toast: "กลับมาออนไลน์แล้ว"

---

### Story 8.4: Touch-Optimized UI

As a **mobile user**,
I want **all interactive elements to be easy to tap**,
So that **I can use the app comfortably with my fingers**.

**Acceptance Criteria:**

**Given** Any interactive element (button, link, input)
**When** Measuring tap target size
**Then** Minimum touch target is 44x44px
**And** Sufficient spacing between adjacent targets (8px minimum)

**Given** I tap a button
**When** Touch is registered
**Then** Visual feedback appears within 50ms (ripple or highlight)
**And** No delay before action starts

**Given** I am scrolling a list
**When** My finger is moving
**Then** Touch targets don't accidentally activate
**And** Scroll is smooth (60fps)

**Given** Form inputs
**When** Tapping to focus
**Then** Input zooms appropriately on iOS (font-size >= 16px)
**And** Keyboard doesn't obscure the input

---

### Story 8.5: Pull-to-Refresh

As a **user**,
I want **to pull down to refresh dashboard data**,
So that **I can update the view with a natural gesture**.

**Acceptance Criteria:**

**Given** I am on /dashboard or /team page
**When** I pull down from the top
**Then** I see a loading indicator following my gesture
**And** Indicator shows pull progress

**Given** I pull past the threshold and release
**When** Refresh triggers
**Then** Data is fetched from server
**And** Loading indicator spins
**And** List updates when data arrives
**And** Indicator smoothly hides

**Given** I pull but don't reach threshold
**When** I release
**Then** Indicator bounces back
**And** No refresh occurs

**Given** Pull-to-refresh using @use-gesture/react
**When** Implementing
**Then** Gesture feels native (matches iOS/Android behavior)
**And** Works in PWA standalone mode

---

### Story 8.6: Audit Log Database Trigger

As a **system administrator**,
I want **all time entry changes logged automatically**,
So that **I can audit modifications for compliance**.

**Acceptance Criteria:**

**Given** time_entries table
**When** A row is INSERTed
**Then** audit_logs records: table_name='time_entries', action='INSERT', new_data=row, user_id

**Given** time_entries table
**When** A row is UPDATEd
**Then** audit_logs records: action='UPDATE', old_data=previous, new_data=updated

**Given** time_entries table
**When** A row is DELETEd
**Then** audit_logs records: action='DELETE', old_data=deleted_row

**Given** Audit log trigger
**When** Implemented
**Then** Trigger is a PostgreSQL function attached to time_entries
**And** Runs automatically on all DML operations
**And** Cannot be bypassed by application code

---

### Story 8.7: First-Time User Flow

As a **new user**,
I want **a smooth onboarding experience**,
So that **I can start using the app immediately**.

**Acceptance Criteria:**

**Given** I am a new user (first login)
**When** I complete authentication
**Then** I see a welcome screen: "ยินดีต้อนรับสู่ Timelog!"
**And** Screen shows 3 key features with illustrations
**And** I see "เริ่มต้นใช้งาน" button

**Given** I tap "เริ่มต้นใช้งาน"
**When** Onboarding completes
**Then** I am taken to /entry page
**And** First-time flag is set in user preferences
**And** Onboarding won't show again

**Given** I am a returning user
**When** I login
**Then** I skip onboarding and go directly to /entry
**And** No welcome screen shown

---

### Story 8.8: Contextual Guidance Tooltips

As a **user**,
I want **helpful hints on complex features**,
So that **I can learn how to use them effectively**.

**Acceptance Criteria:**

**Given** I am on the entry form for the first time
**When** The page loads
**Then** I see a tooltip pointing to "รายการล่าสุด": "แตะเพื่อกรอกแบบฟอร์มอัตโนมัติ"
**And** Tooltip has dismiss button

**Given** I dismiss a tooltip
**When** Tapping "x" or outside
**Then** Tooltip disappears
**And** Won't show again (stored in localStorage)

**Given** Complex UI elements (cascading selectors, duration presets)
**When** First interaction
**Then** Brief tooltip explains the feature
**And** Tooltips are non-blocking (can interact through them)

**Given** I want to see tooltips again
**When** I go to Settings > Reset Tooltips
**Then** All tooltips are cleared
**And** Will show again on relevant pages

---

### Story 8.9: Success Animations & Haptic Feedback

As a **user**,
I want **satisfying feedback when I complete actions**,
So that **the app feels responsive and delightful**.

**Acceptance Criteria:**

**Given** I successfully save a time entry
**When** Server confirms save
**Then** I see a success animation (checkmark with confetti using framer-motion)
**And** Animation completes in ~800ms
**And** Form resets after animation

**Given** I am on iOS device
**When** I complete a successful action
**Then** Haptic feedback fires (light impact)
**And** Using navigator.vibrate() fallback for Android

**Given** I delete an entry
**When** Deletion confirms
**Then** Entry animates out (slide + fade)
**And** List reflows smoothly

**Given** Animations
**When** User has prefers-reduced-motion enabled
**Then** Animations are disabled or simplified
**And** Functionality remains unchanged

