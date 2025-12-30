---
stepsCompleted: [1, 2, 3, 4, 6, 7, 8, 9, 10, 11]
workflowStatus: complete
completedAt: 2025-12-30
inputDocuments:
  - '_bmad-output/planning-artifacts/product-brief-Timelog-2025-12-30.md'
  - '_bmad-output/analysis/brainstorming-session-2025-12-30.md'
workflowType: 'prd'
lastStep: 2
documentCounts:
  brief: 1
  research: 0
  brainstorming: 1
  projectDocs: 0
date: 2025-12-30
author: Jiraw
project_name: Timelog
---

# Product Requirements Document - Timelog

**Author:** Jiraw
**Date:** 2025-12-30

## Executive Summary

**Timelog** is a custom-built internal time tracking Progressive Web App (PWA) designed to replace manual Google Sheets workflows for our organization. The application serves approximately 60 users across four distinct roles: Employees, Managers, Executives, and Admins.

### The Core Insight

> **"เห็นแล้วอยากลง log"** — The app must be so intuitive and fast that users actually *want* to log their time, not dread it.

This single principle drives every design decision: if it adds friction, it doesn't ship.

### The Problem

Our organization currently uses shared Google Sheets for time tracking, creating three critical challenges:

1. **Employee Friction:** Too many fields to fill, shared sheets cause conflicts, and slow performance discourages daily logging
2. **Manager Blindness:** No real-time visibility into team workload, utilization, or compliance status
3. **Executive Data Gap:** No aggregated data available for timely business decisions; must wait for manual end-of-month reports

The cost barrier of ฿200,000+/year for commercial solutions (Toggl, Harvest, Clockify) prevents adopting existing tools, while generic tools don't fit our multimedia/localization workflow.

### The Solution

A mobile-first PWA that enables:

- **Time entry reduced from 2-3 minutes to 30 seconds (80% faster)** with just 2-3 taps
- **Role-appropriate dashboards** with real-time data
- **Zero subscription cost** using Supabase + Vercel free tiers
- **Trust-based workflow** with no approval bottlenecks

### What Makes This Special

1. **"เห็นแล้วอยากลง log":** UX so good that logging time feels effortless, not like a chore
2. **Custom-built for us:** Exact fit for our Services, Clients, and Task codes
3. **Zero subscription cost:** Free tiers vs ฿200K+/year commercial tools
4. **Real users, real feedback:** We can iterate daily with actual employees
5. **Thai-first UX:** Designed specifically for Thai users and workflows

## Project Classification

**Technical Type:** Web Application (PWA)
**Domain:** General (Internal Enterprise Tool)
**Complexity:** Low-Medium
**Project Context:** Greenfield - new project

**Technology Stack:**

- Frontend: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- Backend: Supabase (Auth + PostgreSQL + Row Level Security + Real-time)
- Platform: Progressive Web App (installable, offline-capable)
- Hosting: Vercel (frontend) + Supabase (backend)

## Success Criteria

### User Success

**Employee Success (Primary):**

- Complete time entry in <30 seconds (baseline: currently 2-3 minutes)
- Compliance rate >90% daily completion
- Experience: "เห็นแล้วอยากลง log" — intuitive enough to become habit
- Can view personal statistics (daily/weekly/monthly)

**Manager Success:**

- Dashboard loads with real-time team Utilization instantly
- Report generation time <1 minute (vs manual Excel work)
- Instant visibility into who logged/didn't log
- No more chasing team members for timesheet compliance

**Executive Success:**

- Company-wide overview accessible in single dashboard
- Real-time data for decision making (no more waiting for month-end reports)

**Admin Success:**

- Easy master data management without fear of breaking formulas
- Simple user and role management

### Business Success

| Metric | Target | Baseline | Measurement |
|--------|--------|----------|-------------|
| Data Completeness | >95% of work hours captured | Unknown | Daily audit |
| Time Savings | >80% reduction | 2-3 min/entry | Before/After comparison |
| Adoption | 100% staff within 2 weeks | 0% | Active users / Total staff |
| Satisfaction | NPS >7 | N/A | Quarterly survey |
| Cost Savings | ฿200,000+/year | ฿0 (Sheets) | vs Commercial tools |

**Note:** Adoption target assumes executive mandate for migration. If voluntary adoption, adjust to >90%.

### Technical Success

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | >99.5% | Supabase/Vercel monitoring |
| Data Accuracy | >99% | Automated integrity checks + audit sampling |
| Page Load Time | <2 seconds | Lighthouse |
| Time to Interactive | <3 seconds on 3G | Lighthouse mobile |
| Error Rate | <1% of requests | Application monitoring |
| Database Size | <400 MB (Year 1) | Supabase dashboard |
| Concurrent Users | 60 without degradation | Load testing |

### Security Success

| Metric | Target | Measurement |
|--------|--------|-------------|
| Unauthorized Access | Zero incidents | Audit logs |
| RLS Policies | 100% validated for all roles | Security testing |
| Data Isolation | Complete per-user/per-role | Penetration testing |

### Measurable Outcomes

**MVP Success Gates (Go/No-Go after 1 month):**

1. ✅ 100% staff using the app (no Google Sheets fallback)
2. ✅ Entry time <30 seconds (measured average)
3. ✅ Compliance rate >90%
4. ✅ Positive manager feedback on dashboard utility
5. ✅ Zero data loss incidents
6. ✅ Zero P1 bugs in production after 1 week
7. ✅ All acceptance criteria tests pass 100%

**Upgrade Trigger:** If database exceeds 350 MB, evaluate Supabase Pro upgrade

## Product Scope

### MVP - Minimum Viable Product (Phase 1)

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

### Growth Features (Phase 2)

- Calendar Sync (Google/Outlook integration)
- Auto-suggest from work patterns
- Company Analytics Dashboard (Executive)
- Export Reports (PDF, Excel)
- Timer Mode (Start/Stop tracking)

**Phase 2 Success Criteria:** >50% of users enable Calendar Sync within 1 month of release

### Vision (Phase 3+)

- AI-powered time prediction
- Full Offline Mode with sync
- Third-party integrations (Asana, Monday, etc.)
- Multi-tenant SaaS (if commercializing) — *Note: Major architecture effort*

## User Journeys

### Journey 1: น้องมิ้นท์ - จากความรำคาญสู่นิสัยที่ดี

**มิ้นท์** เป็น Audio Engineer วัย 28 ปี ที่รักงาน Audiobook และ Localization แต่เกลียดการลง timesheet ทุกเย็นเธอต้องเปิด Google Sheets รอโหลดนาน scroll หา row ว่าง แล้วกรอก 8-10 ช่อง กว่าจะเสร็จใช้เวลา 3 นาที บางวันลืมลง ต้องนั่งนึกว่าเมื่อวานทำอะไรบ้าง

วันแรกที่ใช้ Timelog มิ้นท์ login ด้วย email บริษัท เห็นหน้า Home ที่มีปุ่มใหญ่ "ลง Log" กดปุ่ม เลือก Client ล่าสุดที่ทำ (ระบบจำไว้ให้) → เลือก Service → ใส่เวลา → กด Save **ไม่ถึง 30 วินาที**

มิ้นท์หัวเราะ "แค่นี้เองเหรอ?" ตอนเย็นเธอลองดู Personal Dashboard เห็นชั่วโมงวันนี้ สัปดาห์นี้ เดือนนี้ รู้สึกภูมิใจที่เห็น data ตัวเอง

**Breakthrough moment:** หลังจากใช้ไป 1 สัปดาห์ มิ้นท์พบว่าเธอลง timesheet ทุกวันโดยไม่ต้องคิด — มันกลายเป็นนิสัย "เห็นแล้วอยากลง log" กลายเป็นจริง

**Requirements Revealed:**

- Quick Entry (2-3 taps)
- Auto-suggest recent Client/Service
- Duration auto-calculation
- Personal Dashboard with stats
- Mobile-responsive UI

---

### Journey 2: พี่ต้น - จากตามงานเช้าสู่กาแฟอย่างสบายใจ

**พี่ต้น** เป็น Department Manager ดูแลทีม 8 คน ทุกเช้าเขาต้องเปิด Google Sheets scroll หาข้อมูลลูกทีม copy ใส่ Excel ทำ Utilization report ส่ง Management ใช้เวลา 30-45 นาที ถ้าใครไม่ลง timesheet ต้องเดินไปถาม หรือ Line ตามทีละคน

เช้าวันแรกที่ใช้ Timelog พี่ต้นเปิด Team Dashboard เห็น **Utilization ทั้งทีมในหน้าเดียว** มี compliance indicator บอกว่าใครลง/ไม่ลงแล้ว ไม่ต้อง scroll ไม่ต้อง copy ข้อมูลพร้อมใช้ทันที

วันที่ 2 ระบบส่ง **notification อัตโนมัติ** ให้ลูกทีมที่ยังไม่ลง timesheet เมื่อวาน พี่ต้นไม่ต้องตามเอง!

**Breakthrough moment:** วันที่ 3 พี่ต้นพบว่าเขามีเวลาดื่มกาแฟเช้าอย่างสบายใจ — report ที่เคยใช้ 45 นาที ตอนนี้ไม่ถึง 1 นาที ที่สำคัญคือ น้องๆ ลง timesheet ครบทุกคน เพราะมันง่าย + มี reminder

**Requirements Revealed:**

- Team Dashboard with Utilization view
- Compliance status (who logged/didn't log)
- Real-time data updates
- Department filter
- Manager role with team visibility
- Basic reminder notifications (automated)

---

### Journey 3: คุณวิชัย - จากรอ Report สู่ Real-time Insights

**คุณวิชัย** เป็น Operations Director ที่ต้องตัดสินใจเรื่อง resource allocation และ capacity planning ปัจจุบันเขาต้องรอ report สิ้นเดือนจาก Manager แต่ละแผนก แล้วมานั่งรวมข้อมูลเอง บางครั้งตัดสินใจช้าเพราะ data ไม่พร้อม

วันแรกที่เปิด Timelog คุณวิชัยเห็น **Company Overview Dashboard** — cards แสดง Utilization รวมทั้งบริษัท, breakdown ตามแผนก, top clients by hours ทุกอย่าง real-time

เขาคลิกที่แผนก AV ที่มี Utilization ต่ำ → **drill-down** เห็น breakdown ของแต่ละคนในแผนก → เข้าใจทันทีว่าเกิดอะไรขึ้น ไม่ต้องถาม Manager

ตอนประชุม Management คุณวิชัยเปิด dashboard บน projector "ตัวเลขนี้คือตอนนี้เลย ไม่ใช่เมื่อเดือนที่แล้ว"

**Breakthrough moment:** เมื่อมี urgent project เข้ามา คุณวิชัยเปิด dashboard ดู capacity ทันที click drill-down ไปดู individual availability จัดสรร resource ได้ภายในชั่วโมงนั้น

**Requirements Revealed:**

- Company-wide Dashboard
- Department comparison view
- Interactive drill-down (click to see details)
- Real-time aggregated data
- Executive role with full visibility
- Capacity/Utilization overview

---

### Journey 4: พี่แอน - จากกลัวลบ Formula สู่ Admin ที่มั่นใจ

**พี่แอน** เป็น HR/Admin ที่รับผิดชอบ maintain DATA sheet — เพิ่ม employee ใหม่, update Services, แก้ไข Client list ทุกครั้งที่แก้ sheet เธอกลัวว่าจะลบ formula หรือทำ dropdown พัง ต้อง backup ก่อนทุกครั้ง

วันแรกที่เปิด Timelog Admin Panel พี่แอนเห็น interface ที่ชัดเจน:

- **Users tab:** เพิ่ม/แก้ไข พนักงาน กำหนด role
- **Services tab:** จัดการ service list
- **Clients tab:** เพิ่ม/แก้ไข client

เธอลองเพิ่ม employee ใหม่ — กรอกชื่อ, email, เลือก department, กำหนด role → Save ไม่มี formula ให้กลัว ไม่มี dropdown ที่จะพัง

**Breakthrough moment:** เมื่อมี employee ลาออก พี่แอนเปิด Admin Panel → deactivate user → เสร็จ ไม่ต้องกลัวว่า historical data จะหาย ระบบจัดการให้

**Requirements Revealed:**

- Admin Panel with CRUD operations
- User management (add, edit, deactivate)
- Master data management (Services, Clients, Task codes)
- Role assignment
- Safe operations (no formula risk)

---

### Journey 5: น้องเบล - First Day Onboarding

**น้องเบล** เพิ่งเข้าทำงานวันแรก HR ส่ง link Timelog มาให้พร้อม email "ลง timesheet ด้วยนะ"

เบลเปิด link บน iPad กด "Login with Work Email" ระบบ redirect ไป login แล้วกลับมา ตอนนี้เห็นหน้า Home ที่เรียบง่าย มีปุ่มใหญ่ "ลง Log" และ tutorial tooltip บอกว่า "เริ่มต้นใช้งาน กดปุ่มนี้"

เบลลองกด → เลือก Client (มี search) → เลือก Service (มี icons) → ใส่เวลา → Save

"ง่ายกว่าที่คิด!" เบลลง timesheet วันแรกสำเร็จใน 2 นาที (รวมเวลา explore)

**Note:** เบลเริ่มต้นใหม่กับ Timelog — ไม่มี historical data จาก Google Sheets เพราะเราตัดสินใจ start fresh

**Breakthrough moment:** สัปดาห์แรก เบลใช้ Timelog ได้คล่องโดยไม่ต้องถามใคร — app มัน intuitive พอที่จะ self-learn

**Requirements Revealed:**

- Simple onboarding flow
- Work email authentication (Supabase Auth)
- First-time user guidance/tooltips
- Searchable dropdowns
- Visual service selection (icons)
- Mobile-friendly (iPad/Tablet)

---

### Journey Requirements Summary

| Journey | Key Capabilities Revealed |
|---------|---------------------------|
| **น้องมิ้นท์ (Employee)** | Quick Entry, Auto-suggest, Personal Dashboard, Mobile UI |
| **พี่ต้น (Manager)** | Team Dashboard, Compliance Status, Real-time Updates, Auto-reminder |
| **คุณวิชัย (Executive)** | Company Overview, Department Comparison, Interactive Drill-down |
| **พี่แอน (Admin)** | User Management, Master Data CRUD, Role Assignment |
| **น้องเบล (New Employee)** | Onboarding Flow, Search/Filter, Visual Selection, Tooltips |

### Capability Areas Identified

1. **Time Entry System:** Quick entry, auto-suggest, duration calculation
2. **Personal Dashboard:** Stats, history, edit/delete
3. **Team Dashboard:** Utilization, compliance, department view, auto-reminder
4. **Executive Dashboard:** Company-wide, comparisons, interactive drill-down
5. **Admin Panel:** Users, Services, Clients, Roles
6. **Authentication:** Work email login, role-based access
7. **Onboarding:** First-time guidance, intuitive UI
8. **Notifications:** Basic reminder for non-compliance

### Key Decisions Captured

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Executive Dashboard | Interactive Drill-down | มีประโยชน์มากกว่า, Executive ต้องการดู detail |
| Notifications | Basic Reminder | ลด manual follow-up, เพิ่ม compliance |
| Historical Data | Start Fresh | ง่ายกว่า, ไม่ต้อง migration complexity |

## Innovation & Novel Patterns

### Detected Innovation Areas

#### 1. Consumer-Grade UX for Enterprise Boring Tasks

**Core Philosophy:** "เห็นแล้วอยากลง log"

**The Real Innovation:** ไม่ใช่ "Desire-Driven UX" ที่เป็นของใหม่ — Consumer apps ทำมานาน แต่สิ่งที่ innovative คือ **การนำ Consumer UX obsession มาใช้กับ Enterprise boring tasks** ที่ปกติถูกออกแบบให้ "ใช้งานได้" ไม่ใช่ "อยากใช้"

| Design Principle | Implementation |
|------------------|----------------|
| Extreme Simplicity | 2-3 taps แทน 8-10 fields |
| Time Obsession | 30 วินาที แทน 3 นาที (80% faster) |
| Smart Defaults | Auto-suggest recent Client/Service |
| Instant Gratification | เห็น stats ทันทีหลัง log |

**Micro-Interactions for Reinforcement:**

- ✅ Subtle success animation เมื่อ save สำเร็จ
- 🎯 Weekly streak indicator (optional, non-intrusive)
- 📊 Personal stats comparison (this week vs last week)

*Note: ไม่ใช่ gamification เต็มรูปแบบ แต่เป็น subtle reinforcement ที่ช่วยสร้างนิสัย*

#### 2. Trust-First Enterprise Architecture

**Core Philosophy:** Transparency แทน Control

| Traditional Control | Timelog Trust-First |
|--------------------|---------------------|
| Submit → Approve → Done | Submit → Done |
| Manager approves entries | Manager sees real-time dashboard |
| Bottleneck at approval | Zero bottleneck |
| Trust but verify later | Transparent by default |

**Key Insight:** Accountability ไม่ต้องมาจาก approval — มาจาก visibility ได้ (ทุกคนเห็นว่าใครลง/ไม่ลง)

### Why This Works For Us

Trust-First architecture เหมาะกับ Timelog เพราะ context เฉพาะของเรา:

| Factor | Why It Enables Trust-First |
|--------|---------------------------|
| **Internal Tool** | Trust baseline สูงกว่า external tool — ทุกคนเป็นพนักงานบริษัทเดียวกัน |
| **Small Scale (~60 users)** | Peer accountability works — ทุกคนรู้จักกัน |
| **Thai Work Culture** | หน้าตาสำคัญ — ไม่มีใครอยากเป็นคนเดียวที่ไม่ลง log |
| **Real-time Visibility** | Manager เห็นทันทีว่าใครไม่ลง — ไม่ต้อง approve เพื่อ verify |
| **Custom-Built** | ออกแบบได้ 100% ตาม use case — ไม่ต้อง serve หลาย scenarios |

**When Trust-First May NOT Work:**

- External/client-facing tools (trust baseline ต่ำกว่า)
- Large organizations (1000+ users) ที่ peer pressure ไม่ work
- Regulated industries ที่ต้องมี audit trail แบบ formal

### Market Context & Competitive Landscape

| Tool | Approach | Timelog Difference |
|------|----------|-------------------|
| Toggl, Harvest | Feature-rich, complex UI | Consumer-grade simplicity first |
| Google Sheets | Manual, no structure | Structured but simple |
| Enterprise SAP/Oracle | Approval workflows, control | Trust-first, no approval |

**Competitive Insight:** Commercial tools optimize for "features" — Timelog optimizes for "desire to use"

### Validation Approach

| Innovation | Validation Method | Success Metric |
|------------|-------------------|----------------|
| Consumer-Grade UX | User behavior tracking | >90% daily compliance without heavy reminders |
| Trust-First | Compliance rate comparison | Same/better compliance vs approval-based systems |
| 30-second entry | Time measurement | Average entry time <30 seconds |
| Micro-interactions | User feedback | Positive sentiment on "feel" of the app |

**Validation Timeline:**

- Week 1: Measure baseline entry time and compliance
- Week 2-4: Track if compliance sustains without heavy reminders
- Month 2: Compare with industry benchmarks

### Risk Mitigation

| Risk | Mitigation Strategy |
|------|---------------------|
| "Too simple" = missing features | Start minimal, add based on real feedback only |
| Trust-first = abuse potential | Real-time visibility creates peer accountability |
| No approval = data quality issues | Manager dashboard shows anomalies instantly |
| Users still don't want to log | Fallback: add micro-interactions → soft reminders → escalation path |

**Escalation Path (if trust doesn't work):**

1. First: Add subtle micro-interactions (streak, animation)
2. Second: Add soft daily reminder notification
3. Third: Manager receives non-compliance alert
4. Last resort: Add optional approval workflow (Phase 2)

## Web Application (PWA) Specific Requirements

### Project-Type Overview

Timelog เป็น Progressive Web App (PWA) ที่ออกแบบเป็น Single Page Application สำหรับใช้งานภายในองค์กร โดยเน้น mobile-first experience และ real-time data synchronization

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Architecture | SPA (Single Page App) | App-like experience, no page reloads |
| SEO | Not Required | Internal tool behind login |
| Real-time | Required | Live dashboard updates via Supabase |
| Accessibility | Basic Level | Keyboard + screen reader support |

### Browser Support Matrix

**Supported Browsers (Modern Only):**

| Browser | Minimum Version | Priority |
|---------|-----------------|----------|
| Chrome | Latest 2 versions | Primary |
| Edge | Latest 2 versions | Primary |
| Safari | Latest 2 versions | Primary (iOS) |
| Firefox | Latest 2 versions | Secondary |

**Not Supported:**

- Internet Explorer (any version)
- Legacy mobile browsers
- Browsers older than 2 versions

### Responsive Design Requirements

**Breakpoint Strategy:**

| Breakpoint | Width | Target Device | Priority |
|------------|-------|---------------|----------|
| Mobile | < 640px | iPhone, Android phones | **Primary** |
| Tablet | 640px - 1024px | iPad, Android tablets | Secondary |
| Desktop | > 1024px | Laptops, monitors | Secondary |

**Mobile-First Approach:**

- Design starts from mobile, scales up
- Touch-friendly targets (min 44x44px)
- Thumb-zone optimization for quick entry
- No hover-dependent interactions
- **Safe-area padding** for iPhone X+ (notch, home indicator)
- **Pull-to-refresh** gesture support for dashboards

**Critical Mobile Flows:**

1. Quick Entry — must work perfectly on phone
2. Personal Dashboard — daily stats at a glance
3. Login — seamless on any device

### Performance Targets

| Metric | Target | Tool | Priority |
|--------|--------|------|----------|
| First Contentful Paint (FCP) | < 1.5s | Lighthouse | High |
| Largest Contentful Paint (LCP) | < 2.5s | Lighthouse | High |
| Time to Interactive (TTI) | < 3.0s | Lighthouse | High |
| Cumulative Layout Shift (CLS) | < 0.1 | Lighthouse | Medium |
| First Input Delay (FID) | < 100ms | Lighthouse | Medium |

**Performance Budget:**

| Resource | Budget |
|----------|--------|
| JavaScript (gzipped) | < 150KB |
| CSS (gzipped) | < 30KB |
| Total page weight | < 500KB |
| API response time | < 200ms |

**Loading States:**

- **Skeleton loading** แทน spinner — รู้สึก faster และ modern กว่า
- Progressive content reveal

### Real-time Architecture

**Supabase Realtime Integration:**

| Feature | Real-time Need | Implementation |
|---------|----------------|----------------|
| Manager Dashboard | High | Subscribe to team entries |
| Executive Overview | Medium | Subscribe to aggregated data |
| Personal Dashboard | Low | Refresh on demand / polling |
| Quick Entry | None | Standard POST request |

**RLS-Based Filtering:**

Supabase Realtime uses Row Level Security (RLS) for filtering:

- ไม่ใช้ query-based filters ใน subscription
- RLS policies กำหนด row visibility per user/role
- Client subscribes to table, RLS filters automatically

**Fallback:** If WebSocket fails, fallback to 30-second polling

### PWA Capabilities

**Installation & Offline:**

| Feature | MVP | Phase 2 |
|---------|-----|---------|
| Add to Home Screen | ✅ | ✅ |
| App Icon & Splash | ✅ | ✅ |
| Basic Offline Page | ✅ | ✅ |
| Offline Data Entry | ❌ | ✅ |
| Background Sync | ❌ | ✅ |

**PWA Manifest Configuration:**

```json
{
  "name": "Timelog",
  "short_name": "Timelog",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#[to be defined in UX Design]",
  "background_color": "#[to be defined in UX Design]"
}
```

**Service Worker Strategy (MVP):**

- Cache static assets (JS, CSS, images)
- Show offline fallback page when disconnected
- No offline data mutation in MVP

### Mobile UX Enhancements

**Micro-Interactions:**

| Interaction | Implementation | Purpose |
|-------------|----------------|---------|
| Save Success | Subtle animation + **haptic feedback** | Reinforce positive behavior |
| Pull-to-Refresh | Native gesture on dashboards | Expected mobile pattern |
| Loading | Skeleton screens | Perceived performance |

**Safe Areas (iOS):**

```css
/* Bottom navigation / Quick Entry button */
padding-bottom: env(safe-area-inset-bottom);

/* Top header if fixed */
padding-top: env(safe-area-inset-top);
```

### Accessibility (Basic Level)

**Compliance Target:** WCAG 2.1 Level A (with some AA)

| Requirement | Implementation |
|-------------|----------------|
| Keyboard Navigation | All interactive elements focusable |
| Focus Indicators | Visible focus ring on all controls |
| Screen Reader | Semantic HTML + ARIA labels |
| Color Contrast | 4.5:1 minimum for text |
| Touch Targets | 44x44px minimum |
| Form Labels | All inputs have associated labels |

### Development Standards

**TypeScript Configuration:**

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

**Code Quality:**

- ESLint: Next.js default + strict rules
- Prettier: Standard configuration
- Husky: Pre-commit hooks for linting

**shadcn/ui Component Strategy:**

- Use pre-built components for consistency
- Customize theme colors (defined in UX Design phase)
- Mobile-optimized variants for touch

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Problem-Solving MVP + Experience MVP Hybrid

- แก้ปัญหา Google Sheets ให้ได้ก่อน (core problem)
- แต่ต้องรักษา "เห็นแล้วอยากลง log" experience ไว้ด้วย

**Resource Reality:**

| Factor | Constraint | Impact on Scope |
|--------|------------|-----------------|
| Team Size | Solo Developer (1 คน) | ต้อง lean มาก, ไม่มี parallel work |
| Timeline | 2-3 เดือน | ~8-12 weeks development |
| Tech Stack | Next.js + Supabase | Fast development, but learning curve |
| Users | ~60 internal users | No scale concerns for MVP |

**Realistic Development Capacity:**

| Calculation | Hours |
|-------------|-------|
| Solo dev @ ~30 hrs/week × 12 weeks | 360 hrs |
| Deduct 20% for bugs/unexpected | -72 hrs |
| **Available for features** | **288 hrs** |

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**

| Journey | MVP Support | Notes |
|---------|-------------|-------|
| น้องมิ้นท์ (Employee) | ✅ Full | Quick Entry + Personal Dashboard |
| พี่ต้น (Manager) | ✅ Full | Team Dashboard + Compliance View |
| คุณวิชัย (Executive) | ❌ Phase 2 | Defer to reduce scope |
| พี่แอน (Admin) | ✅ Full | User + Master Data Management |
| น้องเบล (New Employee) | ✅ Full | Same as Employee journey |

**Must-Have Capabilities (MVP):**

| Capability | Priority | Est. Hours | Notes |
|------------|----------|------------|-------|
| **Infrastructure & Setup** | | | |
| DB Schema + RLS Policies | P0 | 16 | Foundation |
| Deployment (Vercel + Supabase) | P0 | 8 | CI/CD setup |
| Master Data Seeding | P0 | 4 | Services/Clients/Tasks |
| **Core Features** | | | |
| Authentication (Supabase Auth) | P0 | 16 | Login/logout/session |
| Quick Entry (2-3 taps) | P0 | 48 | Core value prop (+ UX iteration) |
| Personal Dashboard | P0 | 24 | Employee stats |
| Team Dashboard (Basic) | P0 | 24 | Compliance view only |
| Admin Panel (Users) | P0 | 24 | CRUD operations |
| Admin Panel (Master Data) | P0 | 16 | Services/Clients/Tasks |
| **Quality & Buffer** | | | |
| Testing & QA | P0 | 32 | Manual + automated |
| Bug Fixing Buffer | P0 | 24 | Unexpected issues |
| **Total MVP** | | **236 hrs** | Within 288 hr budget |

**Explicitly OUT of MVP:**

| Feature | Why Deferred | Phase |
|---------|--------------|-------|
| Company Overview (Executive) | Solo dev capacity | Phase 2 |
| Interactive Drill-down | Complexity | Phase 2 |
| Basic Notifications | Manager can follow up manually | Phase 2 |
| Calendar Sync | Integration complexity | Phase 2 |
| Auto-suggest (ML) | Nice-to-have | Phase 2 |
| Timer Mode | Alternative workflow | Phase 2 |
| Export Reports | Manual export acceptable | Phase 2 |
| Offline Data Entry | Service worker complexity | Phase 3 |

### Post-MVP Features

**Phase 2 (Month 4-6):**

| Feature | Value | Effort | Priority |
|---------|-------|--------|----------|
| Company Overview (Executive) | High | Medium | P1 |
| Basic Notifications | High | Low | P1 |
| Export Reports (PDF/Excel) | High | Low | P1 |
| Team Dashboard (Utilization) | Medium | Medium | P2 |
| Auto-suggest Recent | Medium | Low | P2 |

**Phase 3 (Month 7+):**

| Feature | Value | Effort |
|---------|-------|--------|
| Executive Drill-down | High | High |
| Calendar Sync | High | High |
| Timer Mode | Medium | Medium |
| Offline Data Entry | Medium | High |

### Risk Mitigation Strategy

**Technical Risks:**

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Supabase RLS complexity | High | High | Extra 16 hrs allocated; test thoroughly |
| Next.js 14 learning curve | Medium | Medium | Use simple patterns first |
| Real-time bugs | Medium | Medium | Start with polling, add Realtime later |
| Performance issues | Low | Medium | Performance budget defined |

**Scope Risks:**

| Risk | Mitigation |
|------|------------|
| Feature creep | Strict MVP boundary, "OUT of MVP" list |
| Underestimated effort | 24 hr bug buffer + realistic estimates |
| Solo dev burnout | Sustainable pace, no crunch |
| Stakeholder wants Executive features | Clear Phase 1/2 communication upfront |

### Launch Strategy

**Soft Launch (Week 1):**

- 5-10 pilot users (mix of Employee + Manager)
- Gather feedback aggressively
- Fix critical bugs immediately

**Full Launch (Week 2-3):**

- All ~60 users onboarded
- Executive announcement
- Google Sheets access removed (mandate)

**Success Gates:**

| Gate | Metric | Pass Criteria |
|------|--------|---------------|
| Week 1 | Pilot feedback | No critical blockers |
| Week 2 | Adoption | 100% pilot using daily |
| Month 1 | Full adoption | >90% compliance rate |
| Month 2 | Satisfaction | Positive feedback from majority |

### Scope Change Protocol

**If timeline slips:**

1. First cut: Team Dashboard → basic list only, no charts
2. Second cut: Admin Master Data → hardcode initially
3. Never cut: Quick Entry, Personal Dashboard, Auth

**If ahead of schedule:**

1. Add: Basic Notifications
2. Add: Company Overview (basic)
3. Do NOT add: Calendar Sync (save for Phase 2)

## Functional Requirements

### Authentication & Access Control

- FR1: User can log in using their company email address
- FR2: User can log out from any page
- FR3: System maintains user session across browser refreshes
- FR4: System assigns role-based permissions (Employee, Manager, Executive, Admin)
- FR5: User can only access features appropriate to their assigned role
- FR6: System handles session timeout gracefully with clear messaging

### Time Entry

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

### Personal Dashboard

- FR17: Employee can view their time entries for today
- FR18: Employee can view their time entries for the current week
- FR19: Employee can view their time entries for the current month
- FR20: Employee can view total hours logged per time period
- FR21: Employee can filter their entries by Client
- FR22: Employee can search their entries

### Team Management & Visibility

- FR23: Manager can view team members' time entries
- FR24: Manager can see which team members have logged time today
- FR25: Manager can see which team members have NOT logged time today
- FR26: Manager can view aggregated team hours
- FR27: System updates team data in near real-time (polling 30s for MVP)

### User Administration

- FR28: Admin can create new user accounts
- FR29: Admin can edit existing user information
- FR30: Admin can deactivate user accounts
- FR31: Admin can assign roles to users
- FR32: Admin can filter users by department or role

### Master Data Management

- FR33: Admin can add new Services to the system
- FR34: Admin can edit existing Services
- FR35: Admin can add new Clients to the system
- FR36: Admin can edit existing Clients
- FR37: Admin can add new Task codes to the system
- FR38: Admin can edit existing Task codes
- FR39: System prevents deletion of master data with existing time entries (soft delete)

### Mobile & PWA Experience

- FR40: User can install the application to their home screen
- FR41: Application provides touch-optimized interface
- FR42: Application displays meaningful offline message when disconnected
- FR43: User can pull-to-refresh dashboard data

### System & UX Foundations

- FR44: User can navigate between major sections (Entry, Dashboard, Admin)
- FR45: System displays meaningful empty state messages
- FR46: System displays skeleton loading indicators during data fetch
- FR47: System maintains audit log of time entry changes

### First-Time User Experience

- FR48: New user can start using the app immediately after first login (no setup required)
- FR49: System provides contextual guidance for first-time users

### Clarifications

| Topic | Clarification |
|-------|---------------|
| Task Field | Optional — Employee can log without selecting Task |
| Recently Used | Last 5 Client/Service combinations |
| Real-time Updates | MVP uses polling (30 seconds), not WebSocket |
| Offline | MVP shows offline message only, no offline data entry |

## Non-Functional Requirements

### Performance

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| **NFR-P1:** Page Load Time | < 2 seconds | Lighthouse |
| **NFR-P2:** Time to Interactive | < 3 seconds on 3G | Lighthouse mobile |
| **NFR-P3:** First Contentful Paint | < 1.5 seconds | Lighthouse |
| **NFR-P4:** Largest Contentful Paint | < 2.5 seconds | Lighthouse |
| **NFR-P5:** Cumulative Layout Shift | < 0.1 | Lighthouse |
| **NFR-P6:** API Response Time | < 200ms (p95) | Application monitoring |
| **NFR-P7:** Entry Form Render | < 500ms | Performance profiling |
| **NFR-P8:** Concurrent Users | 60 without degradation | Load testing |
| **NFR-P9:** Database Query Time | < 100ms single-row, < 500ms aggregates | Supabase logs |

**Performance Budget:**

| Resource | Budget |
|----------|--------|
| JavaScript (gzipped) | < 200KB (excluding Next.js runtime) |
| CSS (gzipped) | < 30KB |
| Total page weight | < 500KB |

### Security

| Requirement | Specification |
|-------------|---------------|
| **NFR-S1:** Authentication | Supabase Auth with company email only |
| **NFR-S2:** Authorization | Role-based access control (Employee, Manager, Executive, Admin) |
| **NFR-S3:** Data Isolation | Row Level Security (RLS) — users see only permitted data |
| **NFR-S4:** Transport Security | HTTPS only (TLS 1.2+) |
| **NFR-S5:** Session Management | Secure session tokens, automatic timeout after inactivity |
| **NFR-S6:** Audit Trail | All time entry changes logged with timestamp and user |
| **NFR-S7:** No Secrets in Client | API keys and secrets server-side only |
| **NFR-S8:** Rate Limiting | 100 requests/minute per user (prevent accidental loops) |

**Security Boundaries:**

- RLS policies validated per role before deployment
- Zero unauthorized access incidents (target)
- No PII exposure in client-side logs

### Reliability

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| **NFR-R1:** Uptime | > 99.5% | Supabase/Vercel monitoring |
| **NFR-R2:** Data Accuracy | > 99% | Automated nightly integrity checks (entry counts vs audit log) |
| **NFR-R3:** Error Rate | < 1% of requests | Application monitoring |
| **NFR-R4:** Data Loss Prevention | Zero incidents | Backup verification |
| **NFR-R5:** Recovery Time Objective (RTO) | < 8 hours | Disaster recovery test |
| **NFR-R6:** Recovery Point Objective (RPO) | < 1 hour | Backup frequency |
| **NFR-R7:** Backup Strategy | Daily automatic + Point-in-Time Recovery (if Pro tier) | Supabase dashboard |

**Graceful Degradation:**

- Offline: Show meaningful message, cache static assets
- API Failure: Retry with exponential backoff, user notification
- Real-time Failure: Fallback to 30-second polling

### Scalability (Minimal Scope)

| Requirement | Target | Notes |
|-------------|--------|-------|
| **NFR-SC1:** User Capacity | 60 users (2x headroom = 120) | Internal tool, no rapid growth |
| **NFR-SC2:** Data Growth | < 400 MB Year 1 | Monitor via Supabase dashboard |
| **NFR-SC3:** Upgrade Trigger | > 350 MB database | Evaluate Supabase Pro |

**Explicitly NOT in Scope:**

- Horizontal scaling
- Multi-region deployment
- Auto-scaling infrastructure

### Accessibility (Basic Level)

**Compliance Target:** WCAG 2.1 Level A (with select Level AA)

| Requirement | Specification |
|-------------|---------------|
| **NFR-A1:** Keyboard Navigation | All interactive elements reachable via keyboard |
| **NFR-A2:** Focus Indicators | Visible focus ring on all controls |
| **NFR-A3:** Screen Reader | Semantic HTML + ARIA labels where needed |
| **NFR-A4:** Color Contrast | 4.5:1 minimum for text |
| **NFR-A5:** Touch Targets | 44x44px minimum |
| **NFR-A6:** Form Labels | All inputs have associated labels |
| **NFR-A7:** Error Messages | Clear, descriptive error feedback |

**Explicitly NOT in Scope (MVP):**

- Full WCAG 2.1 Level AA compliance
- Multi-language support
- High-contrast theme

### Testability

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| **NFR-T1:** Unit Test Coverage | > 70% for business logic | Coverage report |
| **NFR-T2:** E2E Test Coverage | 100% of MVP user journeys | Test suite |

### Observability

| Requirement | Specification |
|-------------|---------------|
| **NFR-O1:** Structured Logging | All errors logged with correlation IDs |
| **NFR-O2:** Error Tracking | Client-side errors captured and reported |
| **NFR-O3:** Performance Monitoring | Core Web Vitals tracked in production |

### Developer Experience

| Requirement | Target |
|-------------|--------|
| **NFR-D1:** Local Setup | Development environment setup < 10 minutes |
| **NFR-D2:** Build Time | Production build < 3 minutes |
| **NFR-D3:** Hot Reload | Development hot reload < 2 seconds |

