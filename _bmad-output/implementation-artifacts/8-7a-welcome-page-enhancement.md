# Story 8.7a: Welcome Page Enhancement - Personalization & Branding

## Status: ready-for-dev

## Story

As a **new user**,
I want **a personalized welcome with clear branding**,
So that **I feel recognized and trust the app immediately**.

## Background

Story 8.7 implemented functional onboarding. Agent review identified:
- No personalization (generic "Welcome to Timelog!")
- Logo is text-only (no visual identity)
- Design lacks polish

This story focuses on **personalization + branding** only.
Animation and analytics are split to Story 8-7b.

## Acceptance Criteria

### AC 1: Personalized Welcome Greeting
- **Given** I am a new user with `display_name` = "John Doe"
- **When** The welcome page loads
- **Then** I see heading: "Welcome, John!"
- **And** First name is extracted from display_name

- **Given** I am a new user with `display_name` = NULL
- **When** The welcome page loads
- **Then** I see heading: "Welcome!" (no name)

- **Given** I am a new user with `display_name` = NULL but email = "john@example.com"
- **When** The welcome page loads
- **Then** I see heading: "Welcome, john!" (from email prefix)

### AC 2: Timelog Logo Display
- **Given** I am on the welcome page
- **When** I view the header section
- **Then** I see Timelog logo (SVG icon + text)
- **And** Logo size: icon 40x40px, text 24px font
- **And** Logo has fade-in animation (0.4s duration)

### AC 3: Enhanced Gradient Background
- **Given** I am on the welcome page
- **When** I view the background
- **Then** Background has gradient: `from-primary/10 via-primary/5 to-background`
- **And** Gradient is smooth and subtle (not jarring)

### AC 4: Respect Reduced Motion Preference
- **Given** I have `prefers-reduced-motion: reduce` enabled
- **When** The welcome page loads
- **Then** All animations are disabled or simplified
- **And** Content appears immediately without motion

## Design Specifications

### Color Palette (from globals.css)
| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `--primary` | hsl(221, 83%, 53%) | hsl(217, 91%, 60%) |
| `--background` | hsl(0, 0%, 100%) | hsl(222, 47%, 11%) |

### Typography
| Element | Class | Size |
|---------|-------|------|
| Logo text | `text-2xl font-bold` | 24px |
| Welcome heading | `text-2xl font-semibold` | 24px |
| Subtitle | `text-base text-muted-foreground` | 16px |

### Layout
| Element | Specification |
|---------|--------------|
| Container | `max-w-sm` (384px) |
| Logo icon | 40x40px |
| Spacing | `space-y-4` between sections |
| Padding | `p-6` mobile, `p-8` desktop |

### Logo Design
```
┌─────────────────────────┐
│  [Clock Icon]  Timelog  │
│     40x40      24px     │
└─────────────────────────┘
```
- Use `Clock` icon from lucide-react as temporary logo
- Icon color: `text-primary`
- Text color: `text-primary`

## Tasks

### Task 1: Query User Name in Server Component
**File:** `src/app/(onboarding)/welcome/page.tsx`
```typescript
const { data: profile } = await supabase
  .from('users')
  .select('has_completed_onboarding, display_name, email')
  .eq('id', user.id)
  .single();

// Extract first name
function getFirstName(displayName: string | null, email: string | null): string | null {
  if (displayName) {
    return displayName.split(' ')[0];
  }
  if (email) {
    return email.split('@')[0];
  }
  return null;
}

const firstName = getFirstName(profile?.display_name, user.email);
```
- [ ] Add display_name and email to query
- [ ] Create getFirstName helper function
- [ ] Pass firstName as prop to WelcomeScreen

### Task 2: Update WelcomeScreen Props
**File:** `src/components/onboarding/WelcomeScreen.tsx`
- [ ] Add `firstName?: string | null` prop
- [ ] Update heading: `Welcome${firstName ? `, ${firstName}` : ''}!`
- [ ] Keep "to Timelog" as subtitle

### Task 3: Create Logo Component
**File:** `src/components/onboarding/Logo.tsx`
```typescript
interface LogoProps {
  className?: string;
  iconSize?: number;
}

export function Logo({ className, iconSize = 40 }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Clock className="text-primary" style={{ width: iconSize, height: iconSize }} />
      <span className="text-2xl font-bold text-primary">Timelog</span>
    </div>
  );
}
```
- [ ] Create Logo component with Clock icon
- [ ] Export from index.ts

### Task 4: Update Gradient Background
**File:** `src/components/onboarding/WelcomeScreen.tsx`
- [ ] Change: `from-primary/5 to-background`
- [ ] To: `from-primary/10 via-primary/5 to-background`

### Task 5: Add Reduced Motion Support
**File:** `src/components/onboarding/WelcomeScreen.tsx`
```typescript
// Use framer-motion's built-in support
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.4 }}
  // Automatically respects prefers-reduced-motion
/>
```
- [ ] Verify framer-motion respects prefers-reduced-motion (it does by default)
- [ ] Add test for reduced motion

### Task 6: Unit Tests
**File:** `src/components/onboarding/WelcomeScreen.test.tsx`
- [ ] Test: shows "Welcome, John!" when firstName="John"
- [ ] Test: shows "Welcome!" when firstName=null
- [ ] Test: Logo component renders icon and text

**File:** `src/components/onboarding/Logo.test.tsx`
- [ ] Test: renders Clock icon
- [ ] Test: renders "Timelog" text
- [ ] Test: accepts custom iconSize prop

## Success Metrics

| Metric | Baseline | Target | How to Measure |
|--------|----------|--------|----------------|
| Skip Rate | Unknown | < 30% | analytics_events (8-7b) |
| Time on Welcome | Unknown | 5-15s | time_spent_ms (8-7b) |
| First Entry Completion | Unknown | > 80% | Track in dashboard |

> Note: Baseline will be established after 8-7b analytics implementation.

## Definition of Done

- [ ] Personalized greeting shows first name
- [ ] Fallback to email prefix if no display_name
- [ ] Fallback to "Welcome!" if no name available
- [ ] Logo component with Clock icon + text
- [ ] Enhanced gradient background
- [ ] Respects prefers-reduced-motion
- [ ] All unit tests pass
- [ ] TypeScript clean
- [ ] Mobile-friendly

## File List

### New Files
- `src/components/onboarding/Logo.tsx`
- `src/components/onboarding/Logo.test.tsx`

### Modified Files
- `src/app/(onboarding)/welcome/page.tsx`
- `src/components/onboarding/WelcomeScreen.tsx`
- `src/components/onboarding/WelcomeScreen.test.tsx`
- `src/components/onboarding/index.ts`

## Dev Agent Record

### Implementation Notes
- framer-motion v11+ automatically respects prefers-reduced-motion
- No external logo asset needed - use Clock icon as brand mark
- First name extraction handles edge cases (no spaces, email-only)
