# Story 8.7a: Welcome Page Enhancement

## Status: ready-for-dev

## Story

As a **new user**,
I want **a visually appealing and personalized welcome experience**,
So that **I feel welcomed and understand the app's value immediately**.

## Background

Story 8.7 implemented the basic welcome flow with functional requirements met. This story enhances the UX based on agent review feedback to create a more memorable first impression.

## Agent Review Findings

| Agent | Issue |
|-------|-------|
| 🎨 Sally (UX) | No logo/illustration, text-heavy, bland gradient |
| 📋 John (PM) | No personalization, no analytics tracking |
| 🧠 Carson | Missing micro-interactions, no wow factor |

## Acceptance Criteria

### AC 1: Personalized Welcome Message
- **Given** I am a new user on the welcome page
- **When** The page loads
- **Then** I see "Welcome, [First Name]!" with my actual name
- **And** If name is unavailable, fallback to "Welcome!"

### AC 2: App Logo Display
- **Given** I am on the welcome page
- **When** I view the header
- **Then** I see the Timelog logo (SVG/image, not just text)
- **And** Logo has subtle entrance animation

### AC 3: Enhanced Visual Design
- **Given** I am on the welcome page
- **When** I view the page
- **Then** Background has a more vibrant gradient or pattern
- **And** Feature cards have icon micro-animations on appear
- **And** Overall design feels premium and polished

### AC 4: Analytics Event Tracking
- **Given** I am on the welcome page
- **When** I click "Get Started" or "Skip"
- **Then** System logs an analytics event with:
  - Event type: "onboarding_completed" or "onboarding_skipped"
  - User ID
  - Time spent on welcome page
- **And** Event is stored in audit_logs table

### AC 5: Feature Card Enhancements
- **Given** I am viewing feature cards
- **When** Cards appear with stagger animation
- **Then** Icons have subtle pulse or bounce animation
- **And** Cards have hover effect (desktop) / tap feedback (mobile)

## Tasks

### Task 1: Pass User Name to WelcomeScreen
**File:** `src/app/(onboarding)/welcome/page.tsx`
- [ ] Query user's display name from users table
- [ ] Pass name as prop to WelcomeScreen

### Task 2: Update WelcomeScreen for Personalization
**File:** `src/components/onboarding/WelcomeScreen.tsx`
- [ ] Accept `userName` prop
- [ ] Display "Welcome, {userName}!" or fallback "Welcome!"
- [ ] Update tests for new prop

### Task 3: Create/Add Logo Asset
**Files:**
- `public/logo.svg` or `public/images/logo.svg`
- `src/components/onboarding/WelcomeScreen.tsx`
- [ ] Create or source Timelog logo
- [ ] Import and display logo with animation
- [ ] Replace text-only "Timelog" with actual logo

### Task 4: Enhance Visual Design
**File:** `src/components/onboarding/WelcomeScreen.tsx`
- [ ] Update gradient to more vibrant colors
- [ ] Add subtle background pattern or decoration
- [ ] Improve overall visual polish

### Task 5: Add Icon Micro-Animations
**File:** `src/components/onboarding/FeatureCard.tsx`
- [ ] Add subtle icon animation (pulse, bounce, or scale)
- [ ] Add hover/tap feedback on cards
- [ ] Ensure animations don't cause motion sickness (respect prefers-reduced-motion)

### Task 6: Implement Analytics Tracking
**Files:**
- `src/lib/analytics.ts` (new)
- `src/components/onboarding/WelcomeScreen.tsx`
- [ ] Create analytics utility function
- [ ] Track time spent on page
- [ ] Log event to audit_logs on completion
- [ ] Include event type (started/skipped)

### Task 7: Unit Tests
**Files:**
- `src/components/onboarding/WelcomeScreen.test.tsx`
- `src/components/onboarding/FeatureCard.test.tsx`
- [ ] Test personalized welcome message
- [ ] Test logo display
- [ ] Test analytics event firing

### Task 8: E2E Tests
**File:** `test/e2e/onboarding/enhanced-flow.test.ts`
- [ ] Test personalized greeting shows user name
- [ ] Test analytics events are logged
- [ ] Test animations don't break on slow connections

## Dev Notes

### User Name Query Pattern
```typescript
// In welcome/page.tsx
const { data: profile } = await supabase
  .from('users')
  .select('has_completed_onboarding, display_name, email')
  .eq('id', user.id)
  .single();

const userName = profile?.display_name || profile?.email?.split('@')[0] || null;

return <WelcomeScreen userName={userName} />;
```

### Analytics Event Schema
```typescript
interface OnboardingEvent {
  event_type: 'onboarding_completed' | 'onboarding_skipped';
  user_id: string;
  time_spent_ms: number;
  timestamp: string;
}
```

### Respecting Motion Preferences
```typescript
// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Use simpler animations if true
```

## Definition of Done

- [ ] Personalized welcome message shows user name
- [ ] Logo displayed instead of text
- [ ] Enhanced gradient/visual design
- [ ] Icon micro-animations on feature cards
- [ ] Analytics events logged to audit_logs
- [ ] Respects prefers-reduced-motion
- [ ] All unit tests pass
- [ ] E2E tests pass
- [ ] Mobile-friendly
- [ ] No TypeScript errors

## File List

### New Files
- `src/lib/analytics.ts` - Analytics utility
- `public/logo.svg` - Timelog logo asset
- `test/e2e/onboarding/enhanced-flow.test.ts` - Enhanced E2E tests

### Modified Files
- `src/app/(onboarding)/welcome/page.tsx` - Pass user name
- `src/components/onboarding/WelcomeScreen.tsx` - Personalization + logo + design
- `src/components/onboarding/WelcomeScreen.test.tsx` - Updated tests
- `src/components/onboarding/FeatureCard.tsx` - Icon animations
- `src/components/onboarding/FeatureCard.test.tsx` - Animation tests

## Change Log

| Date | Change |
|------|--------|
| 2026-01-05 | Story created based on agent review feedback |
