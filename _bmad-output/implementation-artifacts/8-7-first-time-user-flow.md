# Story 8.7: First-Time User Flow

## Status: done

## Story

As a **new user**,
I want **a smooth onboarding experience**,
So that **I can start using the app immediately**.

## Acceptance Criteria

### AC 1: Welcome Screen Display
- **Given** I am a new user (first login)
- **When** I complete authentication
- **Then** I see a welcome screen: "Welcome to Timelog!"
- **And** Screen shows 3 key features with icons
- **And** I see "Get Started" button

### AC 2: Complete Onboarding
- **Given** I tap "Get Started"
- **When** Onboarding completes
- **Then** I am taken to /entry page
- **And** First-time flag is set in user preferences
- **And** Onboarding won't show again

### AC 3: Returning User Skip
- **Given** I am a returning user
- **When** I login
- **Then** I skip onboarding and go directly to /entry
- **And** No welcome screen shown

### AC 4: Feature Highlights
- **Given** Welcome screen is displayed
- **When** I view the content
- **Then** I see feature 1: "Easy Time Logging" with Clock icon
- **And** I see feature 2: "Daily/Weekly Summary" with BarChart icon
- **And** I see feature 3: "Quick Entry from Recent" with Zap icon

### AC 5: Skip Option
- **Given** I am on the welcome screen
- **When** I want to skip
- **Then** I can tap "Skip" link at bottom
- **And** Onboarding is marked complete
- **And** I proceed to /entry

## Tasks

### Task 1: Add Onboarding Flag to Users Table
**File:** `supabase/migrations/20260105073913_015_user_onboarding.sql`
- [x] Add `has_completed_onboarding` boolean column (default false)
- [x] Update existing users to true (they're not new)
- [x] No RLS changes needed (uses existing user policies)

### Task 2: Create Welcome Page
**File:** `src/app/(onboarding)/welcome/page.tsx`
- [x] Server component to check onboarding status
- [x] Redirect to /entry if already completed
- [x] Render WelcomeScreen client component
- [x] Separate route group for clean fullscreen design (no nav chrome)

### Task 3: Create WelcomeScreen and FeatureCard Components
**Files:**
- `src/components/onboarding/WelcomeScreen.tsx`
- `src/components/onboarding/FeatureCard.tsx`
- [x] "Welcome to Timelog!" heading
- [x] 3 feature cards with lucide-react icons (Clock, BarChart3, Zap)
- [x] "Get Started" primary button
- [x] "Skip" secondary link
- [x] Mobile-first design with gradient background
- [x] Stagger animation for feature cards

### Task 4: Create Complete Onboarding Action
**File:** `src/actions/onboarding.ts`
- [x] `completeOnboarding()` server action
- [x] Update user's `has_completed_onboarding` to true
- [x] Return `ActionResult<void>` (client handles redirect)

### Task 5: Update Middleware for Onboarding Check
**File:** `src/lib/supabase/proxy.ts`
- [x] After auth check, query onboarding status
- [x] Redirect new users to /welcome
- [x] Redirect returning users to /entry (or requested page)
- [x] Skip check for /welcome route itself

### Task 6: Unit Tests
**Files:**
- `src/components/onboarding/WelcomeScreen.test.tsx`
- `src/components/onboarding/FeatureCard.test.tsx`
- `src/actions/onboarding.test.ts`
- [x] Test WelcomeScreen renders all elements
- [x] Test FeatureCard with different icons
- [x] Test completeOnboarding action success/error

### Task 7: E2E Tests
**File:** `test/e2e/onboarding/flow.test.ts`
- [x] Test new user sees welcome screen
- [x] Test "Get Started" completes onboarding
- [x] Test "Skip" completes onboarding
- [x] Test returning user skips welcome
- [x] Test flag persists across sessions

## Dev Notes

### Architecture Pattern
- Server-side onboarding check in middleware
- Client component for interactive welcome
- Server action for completion (returns ActionResult)
- Database flag for persistent state

### Migration: User Onboarding Flag
```sql
-- supabase/migrations/YYYYMMDDHHMMSS_015_user_onboarding.sql

-- Migration: 015_user_onboarding
-- Story 8.7: First-Time User Flow
-- AC 2: First-time flag in user preferences

-- Add onboarding flag to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT FALSE;

-- Update existing users to mark as completed (they're not new)
UPDATE users SET has_completed_onboarding = TRUE
WHERE created_at < NOW() - INTERVAL '1 day';

COMMENT ON COLUMN users.has_completed_onboarding
IS 'Whether user has completed first-time onboarding flow';
```

### Welcome Page (Server Component)
```typescript
// src/app/(onboarding)/welcome/page.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { WelcomeScreen } from '@/components/onboarding/WelcomeScreen';

export default async function WelcomePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Check if already completed onboarding
  const { data: profile } = await supabase
    .from('users')
    .select('has_completed_onboarding')
    .eq('id', user.id)
    .single();

  if (profile?.has_completed_onboarding) {
    redirect('/entry');
  }

  return <WelcomeScreen />;
}
```

### WelcomeScreen Component (Simplified Example)
> Note: Actual implementation includes framer-motion animations, useRef for focus, and useEffect for accessibility.

```typescript
// src/components/onboarding/WelcomeScreen.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, BarChart3, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FeatureCard } from '@/components/onboarding/FeatureCard';
import { completeOnboarding } from '@/actions/onboarding';
import { toast } from 'sonner';

const features = [
  {
    icon: Clock,
    title: 'Easy Time Logging',
    description: 'Record your work hours quickly and easily',
  },
  {
    icon: BarChart3,
    title: 'Daily/Weekly Summary',
    description: 'Track your logged hours at a glance',
  },
  {
    icon: Zap,
    title: 'Quick Entry from Recent',
    description: 'Tap to auto-fill from previous entries',
  },
];

export function WelcomeScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    setIsLoading(true);
    const result = await completeOnboarding();

    if (result.success) {
      router.push('/entry');
    } else {
      toast.error(result.error || 'Failed to complete onboarding');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-primary/5 to-background">
      {/* Logo/Branding */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Timelog</h1>
      </div>

      {/* Welcome Message */}
      <h2 className="text-2xl font-semibold text-center mb-2">
        Welcome to Timelog!
      </h2>
      <p className="text-muted-foreground text-center mb-8">
        Time tracking for teams
      </p>

      {/* Feature Cards */}
      <div className="w-full max-w-sm space-y-4 mb-8">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="w-full max-w-sm space-y-3">
        <Button
          onClick={handleComplete}
          className="w-full h-12 text-lg"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Get Started'}
        </Button>
        <button
          onClick={handleComplete}
          disabled={isLoading}
          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
```

### FeatureCard Component
```typescript
// src/components/onboarding/FeatureCard.tsx
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-card border">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
```

### Complete Onboarding Action
```typescript
// src/actions/onboarding.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult } from '@/types/domain';

export async function completeOnboarding(): Promise<ActionResult<void>> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { error } = await supabase
    .from('users')
    .update({ has_completed_onboarding: true })
    .eq('id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: undefined };
}
```

### Middleware Update Pattern
```typescript
// In middleware.ts - add after auth check
async function getOnboardingRedirect(userId: string): Promise<string | null> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('users')
    .select('has_completed_onboarding')
    .eq('id', userId)
    .single();

  if (!profile?.has_completed_onboarding) {
    return '/welcome';
  }

  return null; // No redirect needed
}
```

### Component Dependencies
- lucide-react (Clock, BarChart3, Zap icons)
- shadcn/ui Button
- sonner for toast notifications
- framer-motion (optional, for stagger animation)

### Import Convention
```typescript
import { WelcomeScreen } from '@/components/onboarding/WelcomeScreen';
import { FeatureCard } from '@/components/onboarding/FeatureCard';
import { completeOnboarding } from '@/actions/onboarding';
```

### Testing Notes
- Create new user for E2E testing
- Use service role to reset onboarding flag between tests
- Test both "Get Started" and "Skip" paths
- Verify flag persists across browser sessions

### Accessibility
- Focus on "Get Started" button on page load
- Keyboard accessible buttons
- Sufficient color contrast
- Screen reader friendly with proper headings

## Definition of Done

- [x] `has_completed_onboarding` column added to users table
- [x] Existing users marked as completed
- [x] Welcome page created at /welcome
- [x] WelcomeScreen component with 3 features (English text)
- [x] FeatureCard component reusable
- [x] `completeOnboarding` action returns ActionResult
- [x] Middleware redirects new users to /welcome
- [x] Returning users skip to /entry
- [x] "Get Started" button works
- [x] "Skip" link works
- [x] Loading state during completion
- [x] Mobile-friendly design
- [x] Unit tests pass (24 tests)
- [x] E2E tests pass (9 scenarios)
- [x] No TypeScript errors
- [x] All imports use @/ aliases

## File List

### New Files
- `supabase/migrations/20260105073913_015_user_onboarding.sql`
- `src/app/(onboarding)/layout.tsx` - Minimal layout (no nav chrome)
- `src/app/(onboarding)/welcome/page.tsx`
- `src/components/onboarding/WelcomeScreen.tsx`
- `src/components/onboarding/WelcomeScreen.test.tsx`
- `src/components/onboarding/FeatureCard.tsx`
- `src/components/onboarding/FeatureCard.test.tsx`
- `src/components/onboarding/index.ts`
- `src/actions/onboarding.ts`
- `src/actions/onboarding.test.ts`
- `src/lib/supabase/proxy.test.ts` - Middleware unit tests
- `test/e2e/onboarding/flow.test.ts`

### Modified Files
- `src/lib/supabase/proxy.ts` - Add onboarding check in middleware
- `src/constants/routes.ts` - Add WELCOME route and permissions
- `src/types/database.types.ts` - Add has_completed_onboarding field
- `src/app/(app)/admin/users/components/AddUserDialog.test.tsx` - Add new field to mock
- `src/app/(app)/admin/users/components/EditUserDialog.test.tsx` - Add new field to mock

## Dev Agent Record

### Implementation Plan
- Task 1: Created migration 20260105073913_015_user_onboarding.sql with has_completed_onboarding column
- Task 2-4: Created welcome page, components, and action following red-green-refactor
- Task 5: Updated proxy.ts middleware to check onboarding status
- Task 6: Created comprehensive unit tests (24 tests)
- Task 7: Created E2E tests (9 scenarios)

### Completion Notes
Story 8.7 First-Time User Flow is complete.

**Implementation:**
- Added `has_completed_onboarding` boolean column to users table (default false)
- Existing users automatically marked as completed
- Welcome page with server-side onboarding check
- WelcomeScreen component with framer-motion stagger animations
- FeatureCard reusable component
- completeOnboarding server action returning ActionResult
- Middleware redirect logic for new/returning users

**Tests:**
- 24 unit tests passing (WelcomeScreen 14, FeatureCard 5, onboarding action 5)
- 9 E2E test scenarios for full flow coverage
- TypeScript clean compilation

## Change Log

| Date | Change |
|------|--------|
| 2026-01-05 | Fixed Thai→English UI, migration number, consolidated tasks, added ActionResult pattern |
| 2026-01-05 | Implemented full story: migration, components, action, middleware, tests |
