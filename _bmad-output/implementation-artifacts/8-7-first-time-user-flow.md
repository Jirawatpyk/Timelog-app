# Story 8.7: First-Time User Flow

## Status: ready-for-dev

## Story

As a **new user**,
I want **a smooth onboarding experience**,
So that **I can start using the app immediately**.

## Acceptance Criteria

### AC 1: Welcome Screen Display
- **Given** I am a new user (first login)
- **When** I complete authentication
- **Then** I see a welcome screen: "ยินดีต้อนรับสู่ Timelog!"
- **And** Screen shows 3 key features with illustrations
- **And** I see "เริ่มต้นใช้งาน" button

### AC 2: Complete Onboarding
- **Given** I tap "เริ่มต้นใช้งาน"
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
- **Then** I see feature 1: "บันทึกเวลาง่ายๆ" with clock icon
- **And** I see feature 2: "ดูสรุปรายวัน/สัปดาห์" with chart icon
- **And** I see feature 3: "รายการล่าสุดเพื่อกรอกเร็ว" with lightning icon

### AC 5: Skip Option
- **Given** I am on the welcome screen
- **When** I want to skip
- **Then** I can tap "ข้าม" link at bottom
- **And** Onboarding is marked complete
- **And** I proceed to /entry

## Tasks

### Task 1: Add Onboarding Flag to Users Table
**File:** `supabase/migrations/010_user_onboarding.sql`
- [ ] Add has_completed_onboarding boolean column
- [ ] Default to false for new users
- [ ] Update RLS if needed

### Task 2: Create Welcome Page
**File:** `src/app/(app)/welcome/page.tsx`
- [ ] Server component to check onboarding status
- [ ] Redirect if already completed
- [ ] Render WelcomeScreen client component

### Task 3: Create WelcomeScreen Component
**File:** `src/components/onboarding/WelcomeScreen.tsx`
- [ ] "ยินดีต้อนรับสู่ Timelog!" heading
- [ ] 3 feature cards with icons
- [ ] "เริ่มต้นใช้งาน" primary button
- [ ] "ข้าม" secondary link

### Task 4: Create Feature Card Component
**File:** `src/components/onboarding/FeatureCard.tsx`
- [ ] Icon prop
- [ ] Title prop
- [ ] Description prop
- [ ] Consistent styling

### Task 5: Create Complete Onboarding Action
**File:** `src/actions/onboarding.ts`
- [ ] completeOnboarding server action
- [ ] Update user's has_completed_onboarding
- [ ] Redirect to /entry

### Task 6: Update Auth Flow
**File:** `src/app/(auth)/login/page.tsx` or middleware
- [ ] Check onboarding status after login
- [ ] Redirect new users to /welcome
- [ ] Redirect returning users to /entry

### Task 7: Create Onboarding Check Hook
**File:** `src/hooks/use-onboarding-status.ts`
- [ ] Check if user has completed onboarding
- [ ] Return loading state
- [ ] Handle edge cases

### Task 8: Add Illustrations/Icons
**File:** `src/components/onboarding/WelcomeScreen.tsx`
- [ ] Use lucide-react icons
- [ ] Clock for time entry
- [ ] BarChart for dashboard
- [ ] Zap for quick entry

### Task 9: Style Welcome Screen
**File:** `src/components/onboarding/WelcomeScreen.tsx`
- [ ] Mobile-first design
- [ ] Center content vertically
- [ ] Branded colors
- [ ] Smooth animations

### Task 10: Test Onboarding Flow
**File:** `test/e2e/onboarding/flow.test.ts`
- [ ] Test new user sees welcome
- [ ] Test complete onboarding
- [ ] Test returning user skips
- [ ] Test skip option works

## Dev Notes

### Architecture Pattern
- Server-side onboarding check
- Client component for interactive welcome
- Server action for completion
- Cookie or database flag for state

### Migration: User Onboarding Flag
```sql
-- supabase/migrations/010_user_onboarding.sql

-- Add onboarding flag to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT FALSE;

-- Update existing users to mark as completed (they're not new)
UPDATE users SET has_completed_onboarding = TRUE
WHERE created_at < NOW() - INTERVAL '1 day';
```

### Welcome Page (Server Component)
```typescript
// src/app/(app)/welcome/page.tsx
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

### WelcomeScreen Component
```typescript
// src/components/onboarding/WelcomeScreen.tsx
'use client';

import { Clock, BarChart3, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FeatureCard } from '@/components/onboarding/FeatureCard';
import { completeOnboarding } from '@/actions/onboarding';

const features = [
  {
    icon: Clock,
    title: 'บันทึกเวลาง่ายๆ',
    description: 'กรอกข้อมูลการทำงานได้รวดเร็ว',
  },
  {
    icon: BarChart3,
    title: 'ดูสรุปรายวัน/สัปดาห์',
    description: 'ติดตามชั่วโมงการทำงานของคุณ',
  },
  {
    icon: Zap,
    title: 'รายการล่าสุดเพื่อกรอกเร็ว',
    description: 'แตะเพื่อกรอกแบบฟอร์มอัตโนมัติ',
  },
];

export function WelcomeScreen() {
  const handleComplete = async () => {
    await completeOnboarding();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-primary/5 to-background">
      {/* Logo/Branding */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Timelog</h1>
      </div>

      {/* Welcome Message */}
      <h2 className="text-2xl font-semibold text-center mb-2">
        ยินดีต้อนรับสู่ Timelog!
      </h2>
      <p className="text-muted-foreground text-center mb-8">
        ระบบบันทึกเวลาการทำงานสำหรับทีม
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
        >
          เริ่มต้นใช้งาน
        </Button>
        <button
          onClick={handleComplete}
          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ข้าม
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
import { cn } from '@/lib/utils';

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

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function completeOnboarding() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Update onboarding status
  const { error } = await supabase
    .from('users')
    .update({ has_completed_onboarding: true })
    .eq('id', user.id);

  if (error) {
    console.error('Failed to complete onboarding:', error);
    // Still redirect even on error
  }

  redirect('/entry');
}
```

### Auth Flow Update
```typescript
// In middleware.ts or post-login logic
async function handlePostLogin(userId: string) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('users')
    .select('has_completed_onboarding')
    .eq('id', userId)
    .single();

  if (!profile?.has_completed_onboarding) {
    return '/welcome';
  }

  return '/entry';
}
```

### Component Dependencies
- lucide-react for icons
- shadcn/ui Button
- Server actions for completion
- Supabase for state storage

### Import Convention
```typescript
import { WelcomeScreen } from '@/components/onboarding/WelcomeScreen';
import { FeatureCard } from '@/components/onboarding/FeatureCard';
import { completeOnboarding } from '@/actions/onboarding';
```

### Testing Notes
- Create new user for testing
- Verify redirect logic
- Test both complete and skip paths
- Check flag persistence

### Accessibility
- Focus management on load
- Button is keyboard accessible
- Sufficient color contrast
- Screen reader friendly

## Definition of Done

- [ ] has_completed_onboarding column added
- [ ] Welcome page created at /welcome
- [ ] WelcomeScreen component with 3 features
- [ ] FeatureCard component reusable
- [ ] completeOnboarding action works
- [ ] New users redirected to /welcome
- [ ] Returning users skip to /entry
- [ ] "เริ่มต้นใช้งาน" button works
- [ ] "ข้าม" link works
- [ ] Flag persists across sessions
- [ ] Mobile-friendly design
- [ ] No TypeScript errors
- [ ] All imports use @/ aliases
