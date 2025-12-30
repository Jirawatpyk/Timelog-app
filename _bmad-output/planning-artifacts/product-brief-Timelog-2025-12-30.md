---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments:
  - '_bmad-output/analysis/brainstorming-session-2025-12-30.md'
date: 2025-12-30
author: Jiraw
project_name: Timelog
---

# Product Brief: Timelog

## Executive Summary

**Timelog** is a custom-built internal time tracking application designed specifically for our organization, replacing manual Google Sheets workflows with a modern, mobile-first Progressive Web App (PWA).

**Why Build vs Buy:**

- Commercial tools cost ฿200,000+/year (Toggl, Harvest, Clockify)
- Generic tools don't fit our multimedia/localization workflow
- Building internally = ฿0/month using free tiers (Supabase + Vercel)
- We have unfair advantage: real users, real feedback, exact requirements

**Core Value Proposition:**

- **For Employees:** 30-second time entry with smart auto-suggestions - "เห็นแล้วอยากลง log"
- **For Managers:** Real-time team visibility and utilization tracking
- **For Executives:** Company-wide analytics and business insights
- **For Admins:** Centralized master data management

**MVP Focus (Phase 1):**

1. Quick Entry - 2-3 taps to log
2. Personal Dashboard - Employee sees own stats
3. Team Dashboard - Manager sees team overview
4. Admin Panel - Manage master data

---

## Core Vision

### Problem Statement

Our organization uses shared Google Sheets for time tracking, creating three critical challenges:

1. **Employee Friction:** Too many fields, shared sheets cause conflicts, slow performance
2. **Manager Blindness:** No visibility into team workload or compliance
3. **Executive Data Gap:** No aggregated data for business decisions

### Problem Impact

- Incomplete time data affects billing accuracy
- Managers cannot identify resource allocation issues
- Executives make decisions without data support
- ฿200,000+/year cost barrier prevents adopting commercial solutions

### Why Existing Solutions Fall Short

**Commercial Tools (Toggl, Harvest, Clockify):**

- Expensive: ฿16,000-21,000/month for 50 users
- Generic: Not designed for multimedia/localization workflows
- Overkill: Features we don't need, missing features we do need

**Google Sheets:**

- Shared access causes conflicts
- No role-based visibility
- Poor mobile experience
- No real-time dashboards

### Proposed Solution

A custom internal PWA built specifically for our organization:

1. **Speed:** 2-3 taps to log time
2. **Simplicity:** Clean UI that makes users "want to log"
3. **Visibility:** Role-appropriate dashboards
4. **Cost:** ฿0/month using Supabase + Vercel free tiers

### Key Differentiators

1. **Custom-built for us:** Exact fit for our Services, Clients, Task codes
2. **Zero subscription cost:** Free tiers vs ฿200K+/year commercial tools
3. **Trust-based workflow:** No approval bottlenecks
4. **Real users, real feedback:** Iterate with actual employees daily
5. **Thai-first UX:** ออกแบบสำหรับคนไทยโดยเฉพาะ

---

## Target Users

### Primary Users

#### Employee (~50 users)

**Persona:** "น้องมิ้นท์" - Audio Engineer, 28 ปี

- **Work Style:** Hybrid (3 วันออฟฟิศ, 2 วัน WFH)
- **Devices:** Desktop, Tablet
- **Tech Skill:** Medium - ใช้ apps ทั่วไปได้ ไม่ชอบระบบซับซ้อน
- **Daily Tasks:** Audiobook, Subtitling, Localization, Meetings

**Pain Points:**

- Google Sheets ช้า, กลัวลงซ้ำ
- ลืมลง timesheet บ่อย
- ต้องจำว่าทำอะไรบ้าง

**Success Criteria:** "ลงได้ใน 30 วินาที ผมลงทุกวันแน่นอน!"

#### Manager (~5-8 users)

**Persona:** "พี่ต้น" - Department Manager, 38 ปี, ดูแล 4-10 คน

- **Key Responsibility:** รายงาน Utilization ทุกวันให้ Management
- **Devices:** Desktop
- **Tech Skill:** Medium - Excel proficient

**Pain Points:**

- เสียเวลาเช้าทำ report
- ไม่รู้ว่าใครลง/ไม่ลง timesheet
- ต้อง scroll หาข้อมูลใน sheet ใหญ่

**Success Criteria:** "เปิด app มาเห็น Utilization ทันที ไม่ต้องทำอะไร!"

### Secondary Users

#### Executive (2-3 users)

**Persona:** "คุณวิชัย" - Operations Director

- **Needs:** Company-wide overview, High-level metrics
- **Pain:** รอ report สิ้นเดือน, ตัดสินใจช้า
- **Success:** "เปิด dashboard เห็นทั้งบริษัทในหน้าเดียว"

#### Admin (1-2 users)

**Persona:** "พี่แอน" - HR/Admin

- **Tasks:** Manage users, Services, Clients master data
- **Pain:** แก้ DATA sheet ยุ่งยาก กลัวลบ formula
- **Success:** "Admin panel ที่แก้ไขง่าย ไม่ต้องกลัวพัง"

### User Journey

**Employee Journey:**
Discovery (Manager mandate) → Onboarding (5-min setup) → Daily Use (2-tap entry) → Aha! ("30 วิก็ลงได้!")

**Manager Journey:**
Discovery (Executive mandate) → Onboarding (Dashboard setup) → Daily Use (View utilization) → Aha! ("ไม่ต้องไล่ถามลูกทีม!")

**Key Value Loop:**
Employee ลง log ง่าย → Data เข้าระบบ → Manager เห็นทันที → Report สำเร็จ → Employee รู้ว่า data มีค่า

---

## Success Metrics

### User Success Metrics

**Employee Success:**
- Entry time: <30 seconds per timesheet entry
- Compliance: >90% daily completion rate
- Experience: "เห็นแล้วอยากลง log" - intuitive enough to become habit

**Manager Success:**
- Dashboard loads with real-time Utilization instantly
- Report generation time: <1 minute (vs manual Excel work)
- Instant visibility into team compliance

**Executive Success:**
- Company-wide overview in single dashboard
- Real-time data for decision making

### Business Objectives

- **Data Completeness:** >95% of work hours captured
- **Time Savings:** >80% reduction in entry time
- **Adoption:** 100% staff adoption within 2 weeks
- **Satisfaction:** NPS >7
- **Cost:** ฿0/month (vs ฿200,000+/year commercial)

### Key Performance Indicators

- **DAU:** >90% of staff using daily
- **Entry Speed:** <30 seconds average
- **Compliance Rate:** >90% entries on-time
- **Uptime:** >99.5%
- **Data Accuracy:** >99%

---

## MVP Scope

### Core Features (Phase 1)

1. **Quick Entry System**
   - 2-3 taps to complete timesheet entry
   - Auto-fill recent selections
   - Duration auto-calculation

2. **Personal Dashboard (Employee)**
   - View own entries (daily/weekly/monthly)
   - Personal statistics and totals
   - Edit/delete own entries

3. **Team Dashboard (Manager)**
   - Real-time team Utilization view
   - Compliance status (who logged/didn't log)
   - Team overview without manual report

4. **Admin Panel**
   - User management (CRUD)
   - Master data: Services, Clients, Task codes
   - Role assignment

### Out of Scope for MVP

- Calendar Sync → Phase 2
- Auto-suggest Patterns → Phase 2
- Company Analytics → Phase 2
- Export/Reports → Phase 2
- Offline Mode → Phase 3
- Third-party Integrations → Phase 3

### MVP Success Criteria

- 100% staff adoption within 2 weeks
- Entry time <30 seconds (measured)
- Compliance rate >90%
- Complete migration from Google Sheets
- Positive manager feedback on dashboard utility

### Future Vision

**Phase 2:** Calendar sync, Auto-suggest, Company analytics, Export reports
**Phase 3:** AI predictions, Full offline, Integrations, Multi-tenant SaaS
