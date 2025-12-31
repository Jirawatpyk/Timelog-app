# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Timelog เป็นระบบบันทึกเวลาการทำงานสำหรับทีม พัฒนาด้วย Next.js 16 + Supabase (PostgreSQL 17)

## Essential Commands

```bash
# Development
npm run dev          # Start dev server (localhost:3000)
npm run build        # Build production bundle
npm start            # Start production server

# Testing
npm test             # Run unit tests with Vitest
npm run test:e2e     # Run E2E tests with Playwright

# Linting
npm run lint         # Run ESLint

# Supabase
npx supabase start                    # Start local Supabase
npx supabase migration new <name>     # Create new migration
npx supabase migration up             # Apply migrations
npx supabase gen types typescript --local > src/types/database.types.ts  # Generate types
```

## Architecture

### Tech Stack
- **Frontend:** Next.js 16 (App Router), React 18, TypeScript (strict mode)
- **UI:** shadcn/ui (New York style), Tailwind CSS, framer-motion
- **Backend:** Supabase (PostgreSQL 17 + Auth + RLS)
- **Testing:** Vitest + @testing-library/react (unit), Playwright (E2E)

### Directory Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (app)/              # Protected routes (dashboard, entry, team, admin)
│   └── (auth)/             # Public auth routes (login, sign-up, etc.)
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── shared/             # Reusable app components
├── lib/supabase/           # Supabase clients (client.ts, server.ts, proxy.ts)
├── types/
│   ├── domain.ts           # Domain types (Row, Insert, Update helpers)
│   └── database.types.ts   # Auto-generated Supabase types
├── services/               # Business logic layer
├── actions/                # Server actions
├── schemas/                # Validation schemas
└── hooks/                  # Custom React hooks

supabase/
└── migrations/             # SQL migrations (001-008)

test/
├── setup.ts                # Vitest setup
├── e2e/                    # Playwright tests
├── fixtures/               # Test data factories
└── helpers/                # Test utilities
```

### Database Schema (Core Tables)
- **users** - User profiles linked to auth.users (roles: staff, manager, admin, super_admin)
- **departments** - Organization departments
- **manager_departments** - Manager-to-department assignments (many-to-many)
- **clients** → **projects** → **jobs** - Client hierarchy
- **services**, **tasks** - Lookup tables for time entries
- **time_entries** - Core business data (user, job, service, task, duration, date)
- **user_recent_combinations** - Quick entry optimization
- **audit_logs** - Change tracking

### Authentication & Authorization
- Cookie-based sessions via @supabase/ssr
- Middleware (`middleware.ts`) handles session refresh and route protection
- Row Level Security (RLS) enforced on all tables
- Role-based access: staff < manager < admin < super_admin

### Path Aliases
- `@/*` → `./src/*`

## Development Conventions

- ตอบกลับเป็นภาษาไทยเข้าใจง่าย
- ทำงานแบบ Best Practice และ Reusable Components
- การแบ่งส่วน (Modularity): แบ่งระบบออกเป็นส่วนย่อยๆ ที่ชัดเจน
- ความสามารถในการขยายตัว (Scalability): ออกแบบให้รองรับการเติบโต
- ความปลอดภัย (Security): คำนึงถึงความเสี่ยงตั้งแต่ขั้นตอนออกแบบ
- ประสิทธิภาพ (Performance): ออกแบบให้ทำงานได้อย่างรวดเร็ว

## Type Safety

ใช้ generated types จาก Supabase:
```typescript
import { Tables, TablesInsert, TablesUpdate } from '@/types/database.types';

type User = Tables<'users'>;
type NewTimeEntry = TablesInsert<'time_entries'>;
type UpdateJob = TablesUpdate<'jobs'>;
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```
