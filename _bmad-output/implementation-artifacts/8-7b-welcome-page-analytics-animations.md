# Story 8.7b: Welcome Page Enhancement - Analytics & Animations

## Status: ready-for-dev

## Story

As a **product owner**,
I want **to track onboarding completion and add micro-interactions**,
So that **I can measure user engagement and create a delightful experience**.

## Background

Story 8.7 implemented functional onboarding. Story 8-7a adds personalization.
This story focuses on **analytics tracking + animations**.

Agent review identified:
- No analytics (can't measure Skip vs Get Started)
- Feature cards lack micro-interactions
- No tap feedback on mobile

## Acceptance Criteria

### AC 1: Analytics Events Table
- **Given** The database schema
- **When** Migration runs
- **Then** `analytics_events` table exists with columns:
  - `id` UUID PRIMARY KEY
  - `event_type` TEXT NOT NULL
  - `user_id` UUID (nullable for anonymous)
  - `properties` JSONB
  - `session_id` TEXT
  - `created_at` TIMESTAMPTZ

### AC 2: Onboarding Completion Tracking
- **Given** I am on the welcome page
- **When** I click "Get Started"
- **Then** System logs event: `{ event_type: 'onboarding_completed', properties: { method: 'get_started', time_spent_ms: 5000 } }`

- **Given** I am on the welcome page
- **When** I click "Skip"
- **Then** System logs event: `{ event_type: 'onboarding_completed', properties: { method: 'skip', time_spent_ms: 2000 } }`

### AC 3: Feature Card Icon Animations
- **Given** I am viewing feature cards
- **When** Cards appear with stagger animation
- **Then** Icons have subtle scale animation (1.0 → 1.1 → 1.0)
- **And** Animation duration: 0.6s with ease-out
- **And** Animation triggers once on card appear

### AC 4: Feature Card Hover/Tap Feedback
- **Given** I am on desktop
- **When** I hover over a feature card
- **Then** Card has subtle lift effect (translateY: -2px, shadow increase)

- **Given** I am on mobile
- **When** I tap a feature card
- **Then** Card has brief scale effect (0.98 → 1.0)
- **And** Uses existing `touch-feedback` class

### AC 5: Time Tracking Accuracy
- **Given** I open the welcome page
- **When** Time tracking starts
- **Then** Timer starts from 0
- **And** Timer pauses when tab loses focus (optional)
- **And** Timer resumes when tab regains focus (optional)

### AC 6: Analytics RLS Policy
- **Given** I am any authenticated user
- **When** I complete onboarding
- **Then** System can INSERT my analytics event
- **And** I can only SELECT my own events
- **And** Admin/Super Admin can SELECT all events

## Design Specifications

### Animation Timings
| Animation | Duration | Easing | Delay |
|-----------|----------|--------|-------|
| Icon scale | 0.6s | ease-out | stagger: index * 0.1s |
| Card hover lift | 0.2s | ease | 0 |
| Card tap scale | 0.1s | ease-out | 0 |

### Icon Animation Keyframes
```css
@keyframes iconPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
```

### Analytics Event Schema
```typescript
interface AnalyticsEvent {
  id: string;
  event_type: 'onboarding_completed' | 'onboarding_viewed' | string;
  user_id: string | null;
  properties: {
    method?: 'get_started' | 'skip';
    time_spent_ms?: number;
    [key: string]: unknown;
  };
  session_id: string | null;
  created_at: string;
}
```

## Tasks

### Task 1: Create Analytics Events Migration
**File:** `supabase/migrations/YYYYMMDD_016_analytics_events.sql`
```sql
-- Migration: 016_analytics_events
-- Story 8.7b: Analytics for onboarding and user behavior tracking

CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  properties JSONB DEFAULT '{}',
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at DESC);

-- RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Users can insert their own events
CREATE POLICY "users_insert_own_events" ON analytics_events
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Users can read their own events
CREATE POLICY "users_read_own_events" ON analytics_events
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Admin/Super Admin can read all events
CREATE POLICY "admin_read_all_events" ON analytics_events
FOR SELECT TO authenticated
USING (public.get_user_role() IN ('admin', 'super_admin'));

COMMENT ON TABLE analytics_events IS 'Product analytics events for user behavior tracking';
```
- [ ] Create migration file
- [ ] Run migration on cloud DB
- [ ] Update database.types.ts

### Task 2: Create Analytics Utility
**File:** `src/lib/analytics.ts`
```typescript
'use server';

import { createClient } from '@/lib/supabase/server';

interface TrackEventParams {
  eventType: string;
  properties?: Record<string, unknown>;
  sessionId?: string;
}

export async function trackEvent({ eventType, properties, sessionId }: TrackEventParams) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  await supabase.from('analytics_events').insert({
    event_type: eventType,
    user_id: user?.id ?? null,
    properties: properties ?? {},
    session_id: sessionId ?? null,
  });
}
```
- [ ] Create trackEvent server action
- [ ] Handle errors gracefully (don't break UX if analytics fails)

### Task 3: Add Time Tracking Hook
**File:** `src/hooks/use-time-spent.ts`
```typescript
import { useState, useEffect, useRef } from 'react';

export function useTimeSpent() {
  const startTimeRef = useRef(Date.now());
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsActive(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const getTimeSpent = () => Date.now() - startTimeRef.current;

  return { getTimeSpent, isActive };
}
```
- [ ] Create useTimeSpent hook
- [ ] Add unit tests

### Task 4: Integrate Analytics in WelcomeScreen
**File:** `src/components/onboarding/WelcomeScreen.tsx`
```typescript
const { getTimeSpent } = useTimeSpent();

const handleComplete = async (method: 'get_started' | 'skip') => {
  setIsLoading(true);

  // Track analytics (fire and forget)
  trackEvent({
    eventType: 'onboarding_completed',
    properties: {
      method,
      time_spent_ms: getTimeSpent(),
    },
  }).catch(() => {}); // Ignore errors

  const result = await completeOnboarding();
  // ... rest of handler
};
```
- [ ] Import and use useTimeSpent hook
- [ ] Call trackEvent on completion
- [ ] Pass method ('get_started' or 'skip') to handler

### Task 5: Add Icon Animation to FeatureCard
**File:** `src/components/onboarding/FeatureCard.tsx`
```typescript
<motion.div
  initial={{ scale: 1 }}
  animate={{ scale: [1, 1.1, 1] }}
  transition={{
    delay: 0.2 + index * 0.1 + 0.3, // After card appears
    duration: 0.6,
    ease: 'easeOut',
    times: [0, 0.5, 1]
  }}
  className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"
>
  <Icon className="w-5 h-5 text-primary" />
</motion.div>
```
- [ ] Wrap icon container in motion.div
- [ ] Add scale keyframe animation
- [ ] Delay after card appears

### Task 6: Add Hover/Tap Feedback to FeatureCard
**File:** `src/components/onboarding/FeatureCard.tsx`
```typescript
<motion.div
  data-testid="feature-card"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
  whileTap={{ scale: 0.98 }}
  transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
  className="flex items-start gap-4 p-4 rounded-lg bg-card border cursor-pointer touch-feedback"
>
```
- [ ] Add whileHover for desktop lift effect
- [ ] Add whileTap for mobile scale effect
- [ ] Add cursor-pointer and touch-feedback classes

### Task 7: Unit Tests
**Files:**
- `src/lib/analytics.test.ts`
- `src/hooks/use-time-spent.test.ts`
- `src/components/onboarding/FeatureCard.test.tsx`

- [ ] Test trackEvent calls Supabase insert
- [ ] Test useTimeSpent returns elapsed time
- [ ] Test FeatureCard has whileHover/whileTap props

### Task 8: E2E Tests
**File:** `test/e2e/onboarding/analytics.test.ts`
- [ ] Test analytics event created on "Get Started"
- [ ] Test analytics event created on "Skip"
- [ ] Test time_spent_ms is > 0

## Definition of Done

- [ ] analytics_events table created
- [ ] RLS policies working (insert own, read own/admin)
- [ ] trackEvent server action works
- [ ] Time tracking hook works
- [ ] Analytics logged on completion
- [ ] Icon scale animation on appear
- [ ] Card hover lift effect (desktop)
- [ ] Card tap scale effect (mobile)
- [ ] touch-feedback class applied
- [ ] All unit tests pass
- [ ] E2E tests pass
- [ ] TypeScript clean
- [ ] Analytics doesn't break UX on failure

## File List

### New Files
- `supabase/migrations/YYYYMMDD_016_analytics_events.sql`
- `src/lib/analytics.ts`
- `src/lib/analytics.test.ts`
- `src/hooks/use-time-spent.ts`
- `src/hooks/use-time-spent.test.ts`
- `test/e2e/onboarding/analytics.test.ts`

### Modified Files
- `src/types/database.types.ts` (regenerated)
- `src/components/onboarding/WelcomeScreen.tsx`
- `src/components/onboarding/FeatureCard.tsx`
- `src/components/onboarding/FeatureCard.test.tsx`

## Dev Agent Record

### Architecture Decisions
1. **Separate analytics_events table** - Not reusing audit_logs because:
   - audit_logs = compliance/security (CRUD tracking)
   - analytics_events = product insights (user behavior)
   - Different RLS policies needed

2. **Server action for tracking** - Ensures user_id is validated server-side

3. **Fire and forget** - Analytics failures don't block UX

4. **Tab visibility tracking** - Optional accuracy improvement
