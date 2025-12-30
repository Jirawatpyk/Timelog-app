---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
workflowStatus: complete
completedAt: 2025-12-30
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/product-brief-Timelog-2025-12-30.md'
workflowType: 'ux-design'
date: 2025-12-30
author: Jiraw
project_name: Timelog
---

# UX Design Specification: Timelog

**Author:** Jiraw
**Date:** 2025-12-30

---

## Executive Summary

### Project Vision

Timelog is an internal time tracking PWA designed with a singular UX philosophy: **"เห็นแล้วอยากลง log"** — making timesheet entry so intuitive and fast that users actually want to log, not dread it.

The design replaces manual Google Sheets workflows with a mobile-first experience that reduces entry time from 2-3 minutes to 30 seconds through smart defaults, recent selections, and minimal friction.

### Empathy Statement

> "น้องมิ้นท์รู้สึก frustrated เมื่อต้องลง timesheet ใน Google Sheets เพราะมัน slow และ confusing เธอต้องการวิธีที่ fast และ effortless ที่ไม่ขัดจังหวะงาน และทำให้รู้สึกว่าเวลาที่ใช้ไปมีค่า"

### Emotional Journey Target

| Phase | Current State | Target State |
|-------|---------------|--------------|
| **Before** | 😩 Dreading timesheet | 😌 No resistance |
| **During** | 😤 Confused, slow | 😊 Effortless, fast |
| **After** | 😑 Relief it's done | 🎯 Satisfied + accomplished |

### Target Users

| Role | Primary Persona | UX Priority | Device Focus |
|------|-----------------|-------------|--------------|
| **Employee** | น้องมิ้นท์ (28, Audio Engineer) | Quick Entry + Personal Stats | Mobile Primary |
| **Manager** | พี่ต้น (38, Dept. Manager) | Team Compliance View | Desktop + Mobile |
| **Executive** | คุณวิชัย (Director) | Company Overview (Phase 2) | Desktop |
| **Admin** | พี่แอน (HR/Admin) | Master Data CRUD | Desktop |

**Primary UX Focus:** Employee experience — **80% of design decisions should optimize for Employee first**. Other roles benefit from good Employee UX (more complete data = better dashboards).

### UX-to-Success Metric Alignment

| UX Decision | Success Metric | Connection |
|-------------|----------------|------------|
| Recent selections (1-tap) | Entry time <30s | Reduces selection time by 80% |
| Big friendly entry button | Compliance >90% | Removes friction to start |
| Personal stats display | Daily usage | Creates feedback loop + motivation |
| Skeleton loading | Perceived performance | Users feel app is fast |

### Key Design Challenges (as HMW Questions)

1. **HMW make timesheet entry feel rewarding instead of obligatory?**
   - Transform "must do" into "want to do"
   - Create positive feedback loops

2. **HMW enable 1-tap entry for 80% of common cases?**
   - Recent selections as primary pattern
   - Smart defaults that match user behavior

3. **HMW design 4 role-based experiences without complexity?**
   - Same design language, different data views
   - Progressive disclosure based on role

4. **HMW achieve zero-training onboarding?**
   - Obvious affordances, no hidden features
   - Contextual guidance that doesn't interrupt

### Design Opportunities

1. **"Recent" as Primary Pattern** — Last 5 combinations enable 1-tap entry for most cases
2. **Positive Reinforcement Micro-Interactions** — Haptic feedback, success animations, progress stats
3. **Visual Status at a Glance** — Color-coded compliance status for managers
4. **"Big Friendly Button" Paradigm** — Quick Entry as the dominant, thumb-optimized action
5. **Accessibility as UX Excellence** — Large touch targets and clear contrast benefit everyone, not just users with disabilities

### Competitive UX Positioning

| Aspect | Toggl/Harvest | Google Sheets | Timelog |
|--------|---------------|---------------|---------|
| Entry Time | 1-2 min (many fields) | 2-3 min (scroll + find) | **30 seconds** |
| Learning Curve | Training needed | Familiar but messy | **Zero training** |
| Mobile Experience | Functional but complex | Poor | **Mobile-first** |
| Customization | Generic for all industries | Manual formulas | **Built for us** |
| Delight Factor | Utilitarian | Frustrating | **"อยากลง log"** |

### Design Principles

These principles guide every UX decision:

1. **Speed Over Features** — If it slows entry, it doesn't ship
2. **Familiar Over Clever** — Use patterns users already know
3. **Prevention Over Correction** — Design so errors can't happen, not just handle them well
4. **Obvious Over Discoverable** — Core actions are immediately visible, no hunting
5. **Employee-First, Always** — When in doubt, optimize for the 80% (employees)
6. **Mobile-First, Desktop-Enhanced** — Design for thumb, scale up for pointer
7. **Feedback Over Silence** — Every action gets immediate, perceivable response
8. **Graceful Recovery** — Never lose user's work; always provide a path forward

---

## Core User Experience

### Defining Experience

**The Core Action: Time Entry**

The single most important interaction in Timelog is **logging time**. Everything else exists to support this core action or provide value from the data it generates.

**Core Experience Target:**
- **Speed:** Complete entry in <30 seconds
- **Taps:** Maximum 6 taps with Recent selections, under 10 for manual entry
- **Flow:** Who (Client/Service) → What (Task) → How Long (Duration)
- **Feel:** "เห็นแล้วอยากลง log" — See it and want to log

**What Must Be Effortless:**
1. Starting a new entry (Big Friendly Button)
2. Selecting recent combinations (1-tap repeat)
3. Setting duration (smart defaults, quick adjustments)
4. Confirming the entry (obvious save action)

### Platform Strategy

| Platform | Priority | Input Method | Key Considerations |
|----------|----------|--------------|-------------------|
| **Mobile PWA** | Primary | Touch-first | Thumb zone optimization, 44px touch targets |
| **Desktop Browser** | Secondary | Mouse/Keyboard | Keyboard shortcuts, hover states |
| **Tablet** | Tertiary | Touch + Keyboard | Hybrid approach |

**Platform-Specific Decisions:**
- **Offline:** localStorage draft auto-save; full offline in Phase 3
- **PWA:** Installable, home screen icon, push notifications (Phase 2)
- **Responsive:** Mobile-first breakpoints (320px → 768px → 1024px+)

### Thumb Zone Mapping

**Mobile Layout Optimization:**

```
┌─────────────────────────┐
│    Header / Stats       │  ← Glanceable info (low priority touch)
├─────────────────────────┤
│                         │
│    Content Zone         │  ← Scrollable list, moderate reach
│    (Recent entries)     │
│                         │
├─────────────────────────┤
│  ┌─────────────────┐    │
│  │  + Quick Entry  │    │  ← PRIMARY ACTION (thumb zone center)
│  └─────────────────┘    │
├─────────────────────────┤
│ 🏠  📊  👤  ⚙️          │  ← Bottom nav (easy thumb reach)
└─────────────────────────┘
```

**Zone Assignments:**
- **Primary Zone (Bottom Center):** Quick Entry FAB, Save/Confirm buttons
- **Secondary Zone (Bottom Edges):** Navigation tabs
- **Stretch Zone (Top):** Non-critical info, stats display
- **Content Zone (Middle):** Scrollable lists, entry forms

### Cognitive Load Management

**Recognition Over Recall:**
- Show recent combinations instead of requiring memory
- Visual Service/Client icons or color codes
- Pre-filled defaults based on patterns

**Chunking (3-Step Mental Model):**
1. **WHO** — Client + Service selection
2. **WHAT** — Task code + optional description
3. **HOW LONG** — Duration input

**Progressive Disclosure:**
- Level 1: Quick Entry with Recent (80% of cases)
- Level 2: Full form with all fields (when needed)
- Level 3: Advanced options (rare cases)

### Micro-Interaction Inventory

| Interaction | Visual Feedback | Haptic Feedback | Timing |
|-------------|-----------------|-----------------|--------|
| Button press | Scale to 95%, subtle shadow | Light tap (iOS) | 100ms |
| Save success | Checkmark animation + green flash | Success pattern | 300ms |
| Selection | Highlight + checkmark | Selection tap | 150ms |
| Pull to refresh | Spinner + subtle bounce | N/A | Variable |
| Error state | Shake + red outline | Error buzz (iOS) | 400ms |
| Delete confirm | Slide + trash icon | Warning tap | 200ms |

**Haptic Feedback Limitations:**
- ✅ iOS Safari: Full haptic support via Taptic Engine
- ⚠️ Android Chrome: Limited/inconsistent support
- ❌ Desktop: No haptic (visual feedback only)

**Fallback Strategy:** Always pair haptic with strong visual feedback; haptic is enhancement, not requirement.

### Edge Case Handling

| Edge Case | User Impact | Design Solution |
|-----------|-------------|-----------------|
| Empty Recent list | New user confusion | Show prompt: "ลองลง log แรกกัน!" + direct to full form |
| Network failure mid-save | Data loss anxiety | Auto-save draft to localStorage + retry banner |
| Session timeout | Lost work frustration | Preserve draft + gentle re-auth flow |
| Invalid duration | Entry rejection | Prevent invalid input (max 24h, min 0.25h) |
| Duplicate entry warning | Accidental doubles | Soft warning, allow override |
| Offline mode | Can't save | Queue locally + sync indicator |

### Failure Recovery & Context Switching

**Auto-Save Strategy:**
- Save draft to localStorage on every field change
- Persist: Client, Service, Task, Duration, Description
- Clear draft only after successful server save

**Context Switch Scenarios:**
| Scenario | Solution |
|----------|----------|
| Phone call interrupts entry | Draft auto-saved, resume on return |
| App backgrounded | State preserved in memory + localStorage |
| Browser tab closed accidentally | Draft recoverable on next visit |
| Network drops during save | Retry queue with visual indicator |

**Recovery UX Pattern:**
```
"มี entry ที่ยังไม่เสร็จ ต้องการทำต่อไหม?"
[ทำต่อ]  [เริ่มใหม่]
```

### Critical Success Moments

1. **First Entry Complete** — User realizes "มันง่ายกว่าที่คิด!"
2. **Recent 1-Tap Entry** — User thinks "ไม่ต้องเลือกใหม่เลย!"
3. **Weekly Stats View** — User sees "สัปดาห์นี้ทำไปเท่าไหร่แล้ว"
4. **Manager Dashboard Load** — Manager sees "เห็นทีมทั้งหมดในหน้าเดียว!"

### Experience Principles Summary

| # | Principle | Application |
|---|-----------|-------------|
| 1 | Speed Over Features | <30s entry, no unnecessary fields |
| 2 | Familiar Over Clever | Standard mobile patterns, no learning curve |
| 3 | Prevention Over Correction | Constrained inputs, smart defaults |
| 4 | Obvious Over Discoverable | Big visible buttons, clear labels |
| 5 | Employee-First | 80% of decisions optimize for quick entry |
| 6 | Mobile-First, Desktop-Enhanced | Design for thumb, enhance for pointer |
| 7 | Feedback Over Silence | Every tap gets immediate visual response |
| 8 | Graceful Recovery | Never lose work, always offer path forward |

---

## Desired Emotional Response

### Primary Emotional Goals

| Emotion | Description | Why It Matters |
|---------|-------------|----------------|
| **ไม่ต่อต้าน (No Resistance)** | User ไม่รู้สึกหนักใจเมื่อต้องลง timesheet | เปลี่ยนจาก "ต้องทำ" เป็น "ทำก็ได้" |
| **Effortless Flow** | รู้สึกว่าทุกอย่างไหลลื่น ไม่ต้องคิดเยอะ | ลด cognitive friction ทำให้อยากกลับมาใช้ |
| **Accomplishment** | รู้สึกว่าทำเสร็จแล้ว มีความคืบหน้า | สร้าง positive reinforcement loop |
| **Trust** | มั่นใจว่า data ไม่หาย ระบบทำงานได้ | ลดความกังวล สร้างความเชื่อมั่น |
| **Contribution** | รู้สึกว่า data ของตัวเองมีค่าต่อทีม | เชื่อมต่อ individual action กับ team value |
| **Closure** | รู้สึกว่า "จบแล้ว" อย่างชัดเจน | ให้ sense of completion ที่ satisfy |

### Emotional Journey Mapping

**Employee Emotional Journey:**

| Stage | Current State | Target State | Design Support |
|-------|---------------|--------------|----------------|
| **Trigger** | 😩 "อีกแล้ว" | 😌 "ลงเลย" | Minimal friction to start |
| **Open** | 😐 หา sheet | 😊 เปิดปุ๊บเห็นทันที | Fast load, Recent visible |
| **Entry** | 😤 กรอกช้า | 😄 แป๊บเดียว | Smart defaults, minimal fields |
| **Save** | 😰 กลัวหาย | ✅ มั่นใจ | Auto-save, instant confirmation |
| **After** | 😑 โล่งใจ | 🎯 ภูมิใจ + จบ | "Done for today" closure |

**Hero's Journey of Timesheet Entry:**

| Act | Stage | Target Emotion | Design Support |
|-----|-------|----------------|----------------|
| **1** | Setup (เปิด app) | "พร้อมเริ่ม" | Fast load, Recent visible |
| **2** | Action (กรอก) | "ลื่นไหล" | Smart defaults, minimal fields |
| **3** | Resolution (Save) | "สำเร็จ + Closure" | Checkmark + "Done for today" |

**Per-Role Emotional Targets:**

| Role | Primary Emotion | Secondary Emotion | Social Emotion | Emotion to Avoid |
|------|-----------------|-------------------|----------------|------------------|
| **Employee** | Effortless | Accomplishment | Contribution | Frustration, Dread |
| **Manager** | Confidence | Relief | Empathy (เข้าใจ workload ทีม) | Anxiety, Judgment |
| **Admin** | Control | Efficiency | Stewardship | Fear of breaking |

### Micro-Emotions

**Critical Micro-Emotions to Design For:**

| Moment | Target Micro-Emotion | Design Approach | Timing |
|--------|---------------------|-----------------|--------|
| Seeing the app icon | Neutral → Slight positive | Clean, friendly icon | - |
| Opening the app | Anticipation (not dread) | Fast load, immediate value | <1s load |
| Empty state (first time) | "พร้อมเริ่ม" | Welcoming prompt, not empty | Instant |
| Tapping Quick Entry | Eagerness | Big, inviting button | 100ms feedback |
| Selecting Recent | Relief + Speed | "ไม่ต้องเลือกใหม่!" | 150ms |
| Filling duration | Confidence | Smart defaults, clear input | Real-time |
| Hitting Save | Satisfaction | Instant feedback, checkmark | Immediate |
| Seeing stats update | Pride | Update ทันทีหลัง save | <300ms |
| "Done for today" | Closure | Show when daily hours met | 1.5s display |
| Error occurs | Calm (not panic) | Clear message, easy fix | 400ms |

**Failure Emotion Matrix:**

| Error Type | Target Emotion | Message Tone |
|------------|----------------|--------------|
| Network fail | "ไม่เป็นไร, มี backup" | "บันทึกไว้แล้ว รอ sync" |
| Validation error | "อ๋อ, แก้ตรงนี้" | "เหลือแค่ duration นะ" |
| Session timeout | "แค่ login ใหม่" | "Data ยังอยู่ครบ!" |

**Emotion Spectrum to Navigate:**

| Avoid | Target |
|-------|--------|
| Dread | Anticipation |
| Confusion | Clarity |
| Frustration | Flow |
| Anxiety | Confidence |
| Boredom | Engagement |
| Isolation | Contribution |
| Incompleteness | Closure |

### Design Implications

**Emotion-to-Design Mapping:**

| Target Emotion | UX Design Choice |
|----------------|------------------|
| **No Resistance** | Big friendly button, minimal required fields |
| **Effortless** | Recent selections, auto-fill, smart defaults |
| **Speed** | <30s target, instant feedback, no loading states |
| **Confidence** | Auto-save indicator, success confirmations |
| **Accomplishment** | Stats display, progress visualization |
| **Trust** | Consistent behavior, graceful error handling |
| **Contribution** | Show how data helps team/company |
| **Closure** | "Done for today" state when daily hours met |

**Delight Moments (MVP Focused):**

1. First entry takes <10 seconds with Recent
2. Weekly summary shows "คุณทำงานไป 40 ชม. สัปดาห์นี้!"
3. "Done for today! ✓" when logged 8+ hours

*Note: Streak indicator moved to Phase 2 to avoid pressure feeling*

**Copy Guidelines (Warm Language):**

| Instead Of | Use |
|------------|-----|
| "บันทึกสำเร็จ" | "บันทึกแล้ว! 🎯" |
| "กรุณากรอกให้ครบ" | "เหลือแค่ duration นะ" |
| "Required" | Use visual cues instead |
| "Error" | "อ๊ะ! ลองใหม่นะ" |
| "You must..." | (Avoid entirely) |

**Anti-Patterns to Avoid:**

- ❌ Loading spinners longer than 1 second
- ❌ Form validation errors after submit
- ❌ Required fields that aren't really required
- ❌ Confirmation dialogs for reversible actions
- ❌ "Are you sure?" for simple entries
- ❌ "Required" / "You must..." language
- ❌ Success messages <1.5s display time
- ❌ Streak pressure in MVP

### Emotional Design Principles

1. **Reduce Before Delight** — Remove friction first, add delight second
2. **Instant Gratification** — Every action gets immediate positive feedback
3. **Progress Over Perfection** — Show what's done, not what's missing
4. **Calm Technology** — Work quietly in background, don't demand attention
5. **Forgiving Design** — Easy to undo, hard to make mistakes
6. **Warm Language** — Use friendly Thai, never transactional/demanding
7. **Clear Closure** — Every session has a satisfying end point
8. **Team Connection** — Individual actions feel meaningful to the team

---

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

#### 1. LINE (Messaging App)

**Why Relevant:** Thai users คุ้นเคยดีมาก เป็น everyday app ที่ทุกคนใช้

| Aspect | Pattern | Applicable to Timelog |
|--------|---------|----------------------|
| **Navigation** | Bottom tab bar (5 items) | ✅ Adopt: Home, Stats, Profile, Settings |
| **Quick Actions** | Chat list = recent first | ✅ Adopt: Recent entries at top |
| **Visual Hierarchy** | Unread badge, bold names | ✅ Adapt: Highlight today's entries |
| **Long Press** | Context menu on messages | ✅ Adopt: Long press entry → Quick actions |
| **Familiarity** | Same layout for years | ✅ Learn: Consistency builds muscle memory |

**Key Takeaway:** Users don't read instructions — they rely on familiar patterns.

#### 2. Grab (Ride-hailing/Delivery)

**Why Relevant:** Excellent "quick booking" flow — 2-3 taps to complete action

| Aspect | Pattern | Applicable to Timelog |
|--------|---------|----------------------|
| **Recent Locations** | 1-tap to reselect | ✅ Adopt: Recent Client+Service combinations |
| **Big Primary CTA** | "Book Now" dominates screen | ✅ Adopt: Big "Quick Entry" button |
| **Progressive Flow** | Pick-up → Destination → Confirm | ✅ Adapt: Client → Task → Duration → Save |
| **Smart Defaults** | Current location auto-filled | ✅ Adapt: Today's date, 1hr default duration |
| **Reachability** | All critical actions bottom half | ✅ Adopt: No top-corner primary buttons |

**Key Takeaway:** Recent selections + smart defaults = minimal effort.

#### 3. K PLUS (Thai Banking App)

**Why Relevant:** Simple home screen, clear hierarchy, trusted by millions

| Aspect | Pattern | Applicable to Timelog |
|--------|---------|----------------------|
| **Home Dashboard** | Balance prominent, actions below | ✅ Adapt: Today's hours logged + Quick Entry |
| **Security + Trust** | Clear confirmations, receipts | ✅ Adopt: Save confirmation, entry receipt |
| **Thai Language** | Natural Thai copy, not translated | ✅ Adopt: Native Thai microcopy |
| **Error Handling** | Clear, non-technical messages | ✅ Adopt: Friendly error messages |
| **High Contrast** | Readable in sunlight | ✅ Adopt: WCAG AA contrast ratios |

**Key Takeaway:** Trust comes from clear feedback and familiar language.

#### 4. Notion Mobile (Productivity App)

**Why Relevant:** Quick capture experience, floating action button

| Aspect | Pattern | Applicable to Timelog |
|--------|---------|----------------------|
| **FAB** | + button always visible | ✅ Adopt: Quick Entry FAB |
| **Templates** | Pre-made structures | ✅ Adapt: Recent as "templates" |
| **Minimal Form** | Start simple, expand if needed | ✅ Adopt: Progressive disclosure |
| **Offline Draft** | Works without connection | ✅ Adopt: localStorage draft |
| **Optimistic UI** | Show changes immediately | ✅ Adopt: Save → show success → sync background |

**Key Takeaway:** The "+" button is universally understood for "create new."

#### 5. Apple Reminders (iOS Built-in)

**Why Relevant:** Excellent quick entry — type and done

| Aspect | Pattern | Applicable to Timelog |
|--------|---------|----------------------|
| **Instant Entry** | Type → Enter → Done | ✅ Inspiration: Aim for similar simplicity |
| **Smart Suggestions** | Date/time from natural language | ⚠️ Phase 2: Auto-suggest from patterns |
| **List Organization** | Simple categories | ✅ Adopt: Group by date/week |
| **Swipe Actions** | Swipe to complete/delete | ✅ Adopt: Swipe to edit/delete entry |
| **Accessibility** | Full VoiceOver support | ✅ Adopt: Screen reader labels |

**Key Takeaway:** Best entry UX feels like "just type and done."

### Transferable UX Patterns

#### Navigation Patterns

| Pattern | Source | Timelog Application |
|---------|--------|---------------------|
| **Bottom Tab Bar** | LINE, Grab | 4 tabs: Home, Stats, Profile, Settings |
| **Recent First** | Grab, LINE | Recent entries/combinations at top of lists |
| **Pull to Refresh** | All mobile apps | Refresh entry list, sync with server |

#### Interaction Patterns

| Pattern | Source | Timelog Application | Complexity |
|---------|--------|---------------------|------------|
| **FAB** | Notion | Primary "Quick Entry" action | Low |
| **1-Tap Recent** | Grab | Tap recent combination → auto-fill | Low |
| **Swipe Actions** | Apple Reminders | Swipe entry row → Edit/Delete | Medium |
| **Long Press** | LINE, iOS | Long press → Quick actions menu | Medium |
| **Pull-down Dismiss** | iOS sheets | Dismiss entry form by pulling down | Low |
| **Confirmation Animation** | K PLUS | Checkmark animation on successful save | Medium |
| **Optimistic UI** | Notion | Show success immediately, sync background | High |

#### Visual Patterns

| Pattern | Source | Timelog Application |
|---------|--------|---------------------|
| **Card-based Layout** | K PLUS, Grab | Each entry as a card with key info |
| **Color-coded Categories** | Notion | Service types with distinct colors |
| **Progress Indicators** | Multiple | Daily/weekly hours progress bar |
| **Empty State Illustration** | Modern apps | Friendly illustration + CTA for first entry |

### Gesture Language Definition

| Gesture | Action | Context |
|---------|--------|---------|
| **Tap** | Select/Activate | Buttons, list items, tabs |
| **Long Press** | Quick actions menu | Entry rows → Duplicate/Edit/Delete |
| **Swipe Left** | Delete action | Entry rows |
| **Swipe Right** | Edit action | Entry rows |
| **Pull Down** | Dismiss sheet / Refresh | Bottom sheets / Lists |
| **Pull Up** | Expand sheet | Half-sheet → Full-sheet |

### Bottom Sheet Hierarchy

| Type | Use Case | Height | Example |
|------|----------|--------|---------|
| **Full-screen** | Complex forms | 100% | Entry form |
| **Half-sheet** | Simple choices | 50% | Select Service, Confirm delete |
| **Toast** | Feedback only | Auto-dismiss | "บันทึกแล้ว! 🎯" |

### Accessibility Requirements

| Requirement | Standard | Implementation |
|-------------|----------|----------------|
| **Touch Targets** | Minimum 44x44px | All interactive elements |
| **Color Contrast** | WCAG AA (4.5:1) | Text on backgrounds |
| **Screen Reader** | ARIA labels | All buttons, inputs, icons |
| **Reduced Motion** | prefers-reduced-motion | Disable animations if requested |
| **Focus Indicators** | Visible focus ring | Keyboard navigation support |

**Reachability Zones:**

```
┌─────────────────────────────┐
│  ❌ AVOID: Cancel/Close     │  ← Hard to reach
├─────────────────────────────┤
│    ⚠️ STRETCH ZONE          │  ← Info display only
├─────────────────────────────┤
│    ✅ NATURAL ZONE          │  ← Main content
├─────────────────────────────┤
│  ✅ PRIMARY: Actions here   │  ← Easy thumb reach
│  [Cancel]  [+Entry]  [Save] │
└─────────────────────────────┘
```

### Anti-Patterns to Avoid

**From Competitor Analysis:**

| Anti-Pattern | Problem | Our Solution |
|--------------|---------|--------------|
| Too Many Required Fields | Slows entry | Only 3 required: Client, Task, Duration |
| Timer-First Design | Doesn't match post-hoc logging | Entry-first, timer optional (Phase 2) |
| Complex Project Hierarchy | Overkill for simple needs | Flat: Service → Client → Task |
| Desktop-First Responsive | Poor mobile experience | Mobile-first design |
| Generic Enterprise UI | Cold, impersonal feel | Warm, Thai-first design |

**From UX Best Practices:**

| Anti-Pattern | Why Bad | Avoid In Timelog |
|--------------|---------|------------------|
| Modal Overload | Interrupts flow | Use bottom sheets, not modals |
| Form Validation on Submit | Frustrating rework | Validate inline, real-time |
| Hidden Navigation | Users get lost | Always-visible bottom nav |
| Skeleton Overuse | Feels slow | Optimistic UI instead |
| Forced Tutorials | Users skip anyway | Contextual hints only |
| Cancel in top-right | Unreachable on mobile | Cancel button bottom-left |
| Non-GPU Animations | Janky, battery drain | Use transform/opacity only |
| Missing screen reader labels | Excludes users | ARIA labels on all interactives |

### Design Inspiration Strategy

#### What to Adopt (Use Directly)

| Pattern | From | Rationale | Complexity |
|---------|------|-----------|------------|
| Bottom Tab Navigation | LINE | Universal, familiar | Low |
| FAB for Primary Action | Notion | Clear, accessible | Low (custom) |
| Recent Selections | Grab | Enables 1-tap repeat | Low |
| Confirmation Animation | K PLUS | Builds trust | Medium |
| Swipe Actions | iOS | Native gesture | Medium |
| Long Press Menu | LINE | Quick actions | Medium |
| Optimistic UI | Notion | Instant feedback | High |

#### What to Adapt

| Pattern | From | Adaptation |
|---------|------|------------|
| Progressive Flow | Grab | Simplify to 3 steps: Who → What → How Long |
| Card Layout | K PLUS | Compact cards for entry list |
| Empty State | Notion | Thai-language, time-tracking specific |
| Smart Defaults | Apple | Today's date, 1hr duration, last Service |
| Bottom Sheet | iOS | 3-tier: Full/Half/Toast hierarchy |

#### What to Avoid

| Pattern | Why Avoid |
|---------|-----------|
| Timer-first UI | Users log after work, not during |
| Complex hierarchies | Keep flat: Service/Client/Task only |
| Desktop-first design | Mobile is primary platform |
| Generic enterprise feel | Build for Thai users specifically |
| Mandatory tutorials | Let UI be self-explanatory |
| Landscape mode (MVP) | Portrait-only for simplicity |
| Top-corner dismiss buttons | Use bottom placement for reachability |

### Tech Stack Alignment

| Pattern | shadcn/ui Support | Additional Dependency |
|---------|-------------------|----------------------|
| Bottom Tab Nav | ✅ Tabs component | - |
| Bottom Sheet | ✅ Sheet component | - |
| FAB | ❌ Custom required | - |
| Swipe Actions | ❌ Custom required | Gesture library |
| Confirmation Animation | ❌ Custom required | Framer Motion |
| Toast Notifications | ✅ Toast component | - |

**Animation Performance Rules:**

- ✅ Use: `transform`, `opacity` (GPU-accelerated)
- ❌ Avoid: `width`, `height`, `margin`, `padding` (layout thrashing)
- ✅ Use: `will-change` hint for animated elements
- ✅ Use: `prefers-reduced-motion` media query

### Pattern Implementation Priority

| Priority | Pattern | MVP Impact | Complexity |
|----------|---------|------------|------------|
| **P0** | Bottom Tab Nav | Core navigation | Low |
| **P0** | FAB Quick Entry | Primary action | Low |
| **P0** | Recent Selections | 80% use case | Low |
| **P0** | Optimistic UI | Perceived speed | High |
| **P1** | Confirmation Animation | Trust + satisfaction | Medium |
| **P1** | Bottom Sheet Hierarchy | Consistent UI | Low |
| **P1** | Accessibility (44px, contrast) | Inclusive design | Low |
| **P2** | Swipe Actions | Native feel | Medium |
| **P2** | Long Press Menu | Power users | Medium |
| **P2** | Pull to Refresh | Standard expectation | Medium |
| **P3** | Empty State Design | First-time UX | Low |

---

## Design System Foundation

### Design System Choice

**Selected:** shadcn/ui + Tailwind CSS

**Rationale:**
- **PRD Alignment:** PRD ระบุ shadcn/ui เป็น tech stack หลักแล้ว
- **Themeable Foundation:** Customizable components พร้อม strong base
- **Speed + Uniqueness Balance:** ได้ทั้ง rapid development และ brand flexibility
- **Thai Dev Community:** มี community support ดี เรียนรู้ง่าย
- **Accessibility Built-in:** Components มี ARIA labels และ keyboard navigation

### Implementation Approach

**Base Configuration:**

| Layer | Technology | Purpose |
|-------|------------|---------|
| **CSS Framework** | Tailwind CSS | Utility-first styling |
| **Component Library** | shadcn/ui | Pre-built accessible components |
| **Animation** | Framer Motion | Custom micro-interactions |
| **Icons** | Lucide React | Outlined, 24px, Regular weight |
| **Theming** | CSS Variables | Dynamic theme switching |

**Theme Strategy:**

| Aspect | MVP (Phase 1) | Phase 2 |
|--------|---------------|---------|
| **Color Mode** | Light Only | Dark Mode support |
| **Brand Colors** | Primary Blue + Service Colors | Extended palette |
| **Typography** | System fonts (Thai + Inter) | Custom font exploration |

### Component Inventory

**Available from shadcn/ui:**

| Component | Use Case | Customization Level |
|-----------|----------|---------------------|
| Button | All actions | Medium (variants) |
| Input | Form fields | Low |
| Select | Dropdowns | Medium |
| Sheet | Bottom sheets | High (custom heights) |
| Tabs | Navigation | Medium |
| Card | Entry cards | High |
| Toast | Notifications | Low |
| Dialog | Confirmations | Medium |
| Skeleton | Loading states | Low |
| Badge | Status indicators | Medium |

**Custom Components Required:**

| Component | Complexity | Description |
|-----------|------------|-------------|
| FAB (Quick Entry) | Low | Floating action button, fixed position |
| SwipeableRow | Medium | Left/right swipe gestures for entry actions |
| EntryCard | Medium | Custom card with entry details + swipe |
| RecentSelector | Low | Horizontal scrollable recent combinations |
| DurationPicker | Medium | Custom time input (0.25h increments) |
| BottomNav | Low | 4-tab bottom navigation |
| ProgressRing | Low | Circular progress for daily hours |
| ServiceIcon | Low | Color-coded service type icons |

### Token Naming Convention

**Semantic Prefixes (per Winston's recommendation):**

| Category | Prefix | Examples |
|----------|--------|----------|
| **Colors** | `--color-` | `--color-primary`, `--color-success`, `--color-error` |
| **Spacing** | `--spacing-` | `--spacing-xs`, `--spacing-md`, `--spacing-xl` |
| **Radius** | `--radius-` | `--radius-sm`, `--radius-md`, `--radius-full` |
| **Shadow** | `--shadow-` | `--shadow-sm`, `--shadow-card`, `--shadow-sheet` |
| **Font** | `--font-` | `--font-size-sm`, `--font-weight-bold` |

**Color Tokens:**

```css
/* Primary */
--color-primary: hsl(221, 83%, 53%);      /* Blue-500 */
--color-primary-hover: hsl(221, 83%, 47%);
--color-primary-active: hsl(221, 83%, 41%);

/* Semantic */
--color-success: hsl(142, 76%, 36%);      /* Green-600 */
--color-warning: hsl(38, 92%, 50%);       /* Amber-500 */
--color-error: hsl(0, 84%, 60%);          /* Red-500 */

/* Neutral */
--color-background: hsl(0, 0%, 100%);
--color-foreground: hsl(222, 47%, 11%);
--color-muted: hsl(210, 40%, 96%);
--color-border: hsl(214, 32%, 91%);
```

### Service Color Coding

**Distinct Colors per Service Type:**

| Service | Color | Hex | Use Case |
|---------|-------|-----|----------|
| **Audiobook** | Blue-500 | #3B82F6 | Primary service |
| **Subtitling** | Purple-500 | #A855F7 | Video/subtitle work |
| **Translation** | Teal-500 | #14B8A6 | Translation projects |
| **Voice Over** | Orange-500 | #F97316 | VO recordings |
| **Editing** | Pink-500 | #EC4899 | Post-production |
| **Other** | Gray-400 | #9CA3AF | Misc services |

**Application:**
- Service icon background uses service color at 10% opacity
- Service badge uses service color
- Entry cards have subtle left border in service color

### Icon Guidelines

**Library:** Lucide React

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| **Style** | Outlined | Clean, modern look |
| **Size** | 24px default | Optimal mobile visibility |
| **Weight** | Regular (1.5px stroke) | Balanced legibility |
| **Touch Target** | 44x44px minimum | Accessibility compliance |

**Icon Naming Convention:**
- Navigation: `Home`, `BarChart3`, `User`, `Settings`
- Actions: `Plus`, `Check`, `X`, `Edit`, `Trash2`
- Services: Custom or `Briefcase`, `Mic`, `FileText`, `Globe`

### Responsive Breakpoints

**Tailwind Default System:**

| Breakpoint | Width | Target |
|------------|-------|--------|
| **Default** | 0-639px | Mobile (Primary) |
| **sm** | 640px+ | Large phones |
| **md** | 768px+ | Tablets |
| **lg** | 1024px+ | Desktop |
| **xl** | 1280px+ | Large desktop |

**Mobile-First Approach:**
- Design for 375px (iPhone SE) as base
- Scale up typography and spacing at breakpoints
- Additional columns only at `lg+`

### Folder Structure

**Feature-Based Organization (per Winston's recommendation):**

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── sheet.tsx
│   │   └── ...
│   ├── custom/          # Custom reusable components
│   │   ├── fab.tsx
│   │   ├── swipeable-row.tsx
│   │   ├── duration-picker.tsx
│   │   └── ...
│   ├── layout/          # Layout components
│   │   ├── bottom-nav.tsx
│   │   ├── page-header.tsx
│   │   └── ...
│   └── features/        # Feature-specific components
│       ├── entry/
│       │   ├── entry-card.tsx
│       │   ├── entry-form.tsx
│       │   └── recent-selector.tsx
│       ├── stats/
│       │   ├── progress-ring.tsx
│       │   └── weekly-summary.tsx
│       └── ...
├── styles/
│   ├── globals.css      # Tailwind base + custom tokens
│   └── themes/
│       └── light.css    # Light theme (MVP)
└── lib/
    └── utils.ts         # cn() helper, etc.
```

### Revised Pattern Priority

**Updated based on Party Mode feedback:**

| Priority | Pattern | MVP Impact | Complexity | Notes |
|----------|---------|------------|------------|-------|
| **P0** | Bottom Tab Nav | Core navigation | Low | shadcn Tabs |
| **P0** | FAB Quick Entry | Primary action | Low | Custom |
| **P0** | Recent Selections | 80% use case | Low | Custom |
| **P0** | Simple Loading States | Perceived performance | Low | Skeleton |
| **P1** | Optimistic UI | Instant feedback | High | **Moved from P0** |
| **P1** | Confirmation Animation | Trust + satisfaction | Medium | Framer Motion |
| **P1** | Bottom Sheet Hierarchy | Consistent UI | Low | shadcn Sheet |
| **P1** | Accessibility (44px, contrast) | Inclusive design | Low | Default |
| **P2** | Swipe Actions | Native feel | Medium | Gesture lib |
| **P2** | Long Press Menu | Power users | Medium | Custom |

**P0 MVP Simplification (per Barry's feedback):**
- Simple skeleton loading states instead of full Optimistic UI for P0
- Optimistic UI complexity moved to P1 to reduce MVP risk
- Focus on "works reliably" before "feels instant"

### Customization Strategy

**Brand Identity Preservation:**

| Aspect | Approach |
|--------|----------|
| **Colors** | Custom primary palette, service colors |
| **Typography** | System fonts for performance, Thai-first |
| **Spacing** | Consistent 4px grid system |
| **Radius** | 8px default, 16px for cards/sheets |
| **Shadows** | Subtle, elevation-based |

**Component Customization Levels:**

| Level | Description | Example |
|-------|-------------|---------|
| **Low** | Use as-is with token overrides | Button, Input |
| **Medium** | Modify variants/sizes | Card, Badge |
| **High** | Significant custom styling | Sheet heights, FAB |
| **Custom** | Build from scratch | SwipeableRow, DurationPicker |

### Design System Principles

1. **Consistency First** — Same patterns across all screens
2. **Token-Driven** — All values come from design tokens
3. **Component Composition** — Build complex UI from simple parts
4. **Mobile-Native Feel** — Gestures and animations feel iOS/Android native
5. **Accessible by Default** — WCAG AA compliance built-in
6. **Performance Budget** — Components must be lightweight

---

## Defining Experience

### Defining Experience Statement

**Primary:** "จำให้ ลงให้ เร็วให้" (Remember for you, Log for you, Fast for you)

**Tagline:** "2 แตะ จบ" (2 taps, done)

**เหตุผลที่เลือก 2-Tap แทน 1-Tap:**
- 1-Tap auto-save มี risk: tap ผิด Recent = save งานผิด
- 2-Tap (Select + Confirm) ให้ control แต่ยังเร็ว
- User รู้สึก "ควบคุมได้" มากกว่า

### User Mental Model

**Current vs. Target State:**

| Aspect | Current (Google Sheets) | Target (Timelog) |
|--------|-------------------------|------------------|
| **Mental Model** | "หา cell → พิมพ์ → หา cell ถัดไป" | "เลือก → ยืนยัน → Done" |
| **Expectation** | ช้า, ยุ่งยาก, ต้องจำ | เร็ว, ง่าย, app จำให้ |
| **Shortcuts** | Copy row เมื่อวาน | Recent = 2-tap repeat |

**Pain Points ที่ต้องแก้:**
1. ต้อง scroll หา row ว่าง
2. ต้องจำ Client code / Service code
3. ต้องกรอกหลาย cells
4. กลัว data หาย

**"Almost Right" Scenario:**
- งานวันนี้ = 90% เหมือน Recent แต่ต่าง duration
- Flow: Tap Recent → Adjust duration inline → Save
- ต้องเร็วเท่า pure repeat

### Success Criteria

**"2-Tap Entry" สำเร็จเมื่อ:**

| Criteria | Measurement | Target |
|----------|-------------|--------|
| **Speed** | เวลาจาก open → save | <15 วินาที (Recent) |
| **Taps** | จำนวน taps ทั้งหมด | 2-3 taps (Recent) |
| **Completion** | User รู้ว่าเสร็จ | Checkmark + haptic |
| **Confidence** | User มั่นใจว่า save แล้ว | "บันทึกแล้ว!" toast |
| **Repeat Rate** | Users กลับมาใช้ Recent | >70% of entries |
| **Error Rate** | Tap ผิด Recent แล้วต้องแก้ | <5% of entries |

**Analytics Tracking:**
- `entry_source`: `recent` | `full_form` | `duplicate`
- `duration_adjusted`: `true` | `false`
- `time_to_save`: milliseconds

### Novel vs. Established Patterns

| Aspect | Pattern Type | Details |
|--------|--------------|---------|
| **Recent Selections** | Established | Grab, LINE ใช้ pattern นี้ |
| **FAB (Quick Entry)** | Established | Notion, Gmail ใช้ pattern นี้ |
| **Pre-fill + Confirm** | Established | Standard form pattern |
| **Inline Duration Adjust** | **Novel Twist** | Stepper บน preview card |
| **Bottom Sheet Form** | Established | iOS standard pattern |

**Novel Element: "Smart Recent with Inline Edit"**
- Tap Recent = Pre-fill form + show preview
- Duration stepper inline: `[-] 2h [+]`
- ไม่ต้องเปิด picker แยก
- Tap "บันทึก" = Save

### Experience Mechanics

**Core Flow: 2-Tap Entry with Recent**

```
┌─────────────────────────────────┐
│  1. INITIATION                  │
│  User opens app → sees Home     │
│  Recent cards visible at top    │
│  Each card: Service color +     │
│  Client abbrev + Task + Duration│
└─────────────────────────────────┘
           ↓
┌─────────────────────────────────┐
│  2. RECOGNITION                 │
│  User scans Recent cards        │
│  Visual differentiation helps:  │
│  - Service color (left border)  │
│  - Client abbreviation (bold)   │
│  - Task name visible            │
└─────────────────────────────────┘
           ↓
┌─────────────────────────────────┐
│  3. TAP 1: SELECT               │
│  User taps Recent card          │
│  → Bottom sheet opens           │
│  → All fields pre-filled        │
│  → Duration stepper: [-] 2h [+] │
│  → "บันทึก" button ready        │
└─────────────────────────────────┘
           ↓
┌─────────────────────────────────┐
│  4. OPTIONAL: ADJUST            │
│  If duration different:         │
│  → Tap [+] or [-] to adjust     │
│  → Instant visual update        │
│  (Still counts as "fast path")  │
└─────────────────────────────────┘
           ↓
┌─────────────────────────────────┐
│  5. TAP 2: CONFIRM              │
│  Tap "บันทึก"                    │
│  → Haptic feedback (iOS)        │
│  → Checkmark animation          │
│  → "บันทึกแล้ว! 🎯" toast        │
│  → Sheet closes automatically   │
└─────────────────────────────────┘
           ↓
┌─────────────────────────────────┐
│  6. CLOSURE + ANTICIPATION      │
│  Stats update: "วันนี้ 8 ชม."    │
│  If 8h+: "Done for today! ✓"    │
│  Recent list updates instantly  │
│  → User knows tomorrow's tap    │
└─────────────────────────────────┘
```

**Alternative Flow: Full Entry (New combination)**

```
FAB (+) → Bottom Sheet → Select Client → Select Service →
Select Task → Set Duration → บันทึก → Done
```
*Target: <30 seconds, <10 taps*

### Recent Card Design

**Card Layout:**

```
┌─────────────────────────────────┐
│ 🔵│ ABC Corp                    │
│   │ Audiobook • Recording       │
│   │ 2h                     [→] │
└─────────────────────────────────┘
```

**Elements:**
- **Left border:** Service color (visual differentiation)
- **Client name:** Bold, abbreviated if long
- **Service + Task:** Secondary text
- **Duration:** Right-aligned
- **Touch target:** Full card tappable (44px+ height)

**Visual Differentiation:**
- Service colors make similar cards distinguishable
- Client abbreviation prominent
- Limit Recent to 5 cards max (reduce cognitive load)

### Empty State Design

**First-Time User Experience:**

```
┌─────────────────────────────────┐
│                                 │
│     📝                          │
│                                 │
│   ยังไม่มี Recent               │
│   ลอง log งานแรกกัน!            │
│                                 │
│   [+ ลง Timesheet แรก]          │
│                                 │
└─────────────────────────────────┘
```

**Empty State Rules:**
- Friendly illustration + Thai copy
- Single CTA to full entry form
- After first entry → Recent appears → Defining experience works

### Draft Handling

**State Management Rules:**

| Scenario | Behavior |
|----------|----------|
| Tap Recent with no draft | Pre-fill from Recent |
| Tap Recent with existing draft | Show dialog: "มี draft อยู่ แทนที่?" |
| User confirms replace | Clear draft, pre-fill from Recent |
| User cancels | Keep draft, close dialog |
| App backgrounded | Draft auto-saved to localStorage |

### Defining Experience Summary

**"จำให้ ลงให้ เร็วให้" — 2 แตะ จบ**

| Element | Description |
|---------|-------------|
| **Trigger** | See Recent card on Home screen |
| **Tap 1** | Select Recent → Pre-fill form with inline stepper |
| **Optional** | Adjust duration with [+]/[-] |
| **Tap 2** | Confirm "บันทึก" → Save |
| **Feedback** | Haptic + Checkmark + Toast |
| **Outcome** | Entry saved, stats updated, Recent refreshed |
| **Emotion** | "App จำให้!" → Control → Accomplishment |

**Why This Works:**
1. **Familiar + Safe** — Pre-fill + confirm ลด risk tap ผิด
2. **Flexible** — Adjust duration ได้โดยไม่เสีย speed
3. **Visual Clarity** — Service colors ช่วย recognize
4. **Builds Habit** — รู้ว่าพรุ่งนี้ tap ไหน

---

## Visual Design Foundation

### Color System

**Layered Token Architecture:**

```css
/* Layer 1: Primitive Tokens */
--blue-500: #3B82F6;
--blue-600: #2563EB;
--green-600: #16A34A;
--green-500: #22C55E;
--amber-500: #F59E0B;
--red-500: #EF4444;

/* Layer 2: Semantic Tokens */
--color-primary: var(--blue-500);
--color-primary-hover: var(--blue-600);
--color-success: var(--green-600);
--color-warning: var(--amber-500);
--color-error: var(--red-500);
--color-celebration: var(--green-500);
```

**Primary & Semantic Palette:**

| Token | Value | Use Case |
|-------|-------|----------|
| `--color-primary` | Blue-500 | Primary actions, FAB |
| `--color-primary-hover` | Blue-600 | Hover states |
| `--color-success` | Green-600 | Save, completion |
| `--color-warning` | Amber-500 | Warnings |
| `--color-error` | Red-500 | Errors, delete |
| `--color-celebration` | Green-500 | "Done for today!" moment |

**Neutral Palette:**

| Token | Value | Use Case |
|-------|-------|----------|
| `--color-background` | White | Page background |
| `--color-surface` | Gray-50 | Card backgrounds |
| `--color-foreground` | Gray-900 | Primary text |
| `--color-muted` | Gray-500 | Secondary text |
| `--color-border` | Gray-200 | Borders |

**Service Colors (Tailwind Config):**

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      service: {
        audiobook: '#3B82F6',
        subtitling: '#A855F7',
        translation: '#14B8A6',
        voiceover: '#F97316',
        editing: '#EC4899',
        other: '#9CA3AF',
      }
    }
  }
}
```

### Typography System

**Font Stack (System Fonts for MVP):**

```css
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI",
             Roboto, "Noto Sans Thai", sans-serif;
```

**Type Scale (5 Levels):**

| Level | Tailwind | Size | Weight | Use Case |
|-------|----------|------|--------|----------|
| **Display** | `text-2xl` | 24px | 600 | Page titles |
| **Heading** | `text-lg` | 18px | 500 | Section headers |
| **Body** | `text-base` | 16px | 400 | Primary content |
| **Small** | `text-sm` | 14px | 400 | Secondary content |
| **Caption** | `text-xs` | 12px | 400 | Labels, timestamps |

**Thai Typography:**
- System Noto Sans Thai on most devices
- Line-height 1.6 for Thai body text
- Min font-weight 400 for readability

### Spacing & Layout

**Spacing (Tailwind Defaults):**

| Class | Value | Use Case |
|-------|-------|----------|
| `p-1` | 4px | Tight gaps |
| `p-2` | 8px | Element gaps |
| `p-4` | 16px | Component padding |
| `p-6` | 24px | Section spacing |
| `p-8` | 32px | Page margins |

**Border Radius (Tailwind Defaults):**

| Class | Value | Use Case |
|-------|-------|----------|
| `rounded` | 4px | Small elements |
| `rounded-md` | 6px | Buttons, inputs |
| `rounded-lg` | 8px | Cards |
| `rounded-xl` | 12px | Bottom sheets |
| `rounded-full` | 9999px | Pills, FAB |

**Shadow System (2 Levels):**

| Token | Value | Use Case |
|-------|-------|----------|
| `shadow-sm` | `0 1px 3px rgba(0,0,0,0.1)` | Cards, buttons |
| `shadow-lg` | `0 10px 25px rgba(0,0,0,0.15)` | Sheets, FAB |

**Layout Strategy (MVP):**
- Flexbox + spacing utilities
- Grid system deferred to Phase 2
- Mobile: single column
- Desktop: 2-column max

### Elevation System

**Z-Index Layers:**

| Layer | z-index | Elements |
|-------|---------|----------|
| **Base** | 0 | Page content |
| **Card** | 10 | Cards, list items |
| **Sticky** | 20 | Sticky headers |
| **FAB** | 30 | Floating action button |
| **Sheet** | 40 | Bottom sheets |
| **Toast** | 50 | Toast notifications |
| **Dialog** | 60 | Modal dialogs |

### Interaction States

**State Definitions:**

| State | Visual Treatment |
|-------|------------------|
| **Default** | Normal appearance |
| **Hover** | Slight darken (desktop) |
| **Active** | Scale 95% + darker |
| **Focus** | 2px ring, offset 2px |
| **Disabled** | 50% opacity |
| **Loading** | Spinner + disabled |
| **Selected** | Primary bg/border |

**Button States Example:**

```jsx
className={cn(
  "transition-all duration-150",
  "hover:bg-blue-600",
  "active:scale-95",
  "focus:ring-2 focus:ring-blue-500",
  "disabled:opacity-50"
)}
```

### Accessibility

**Color Contrast (WCAG AA):**

| Element | Ratio | Status |
|---------|-------|--------|
| Body text (Gray-900/White) | 15.4:1 | Pass |
| Muted text (Gray-500/White) | 5.8:1 | Pass |
| Primary button (White/Blue-500) | 4.5:1 | Pass |

**Touch & Motion:**
- Minimum touch target: 44x44px
- Respect `prefers-reduced-motion`
- Animations under 300ms

**Focus & Screen Reader:**
- Visible focus ring on all interactive
- Keyboard navigation support
- aria-label on all icons/buttons

### Visual Foundation Summary

| Category | MVP | Phase 2 |
|----------|-----|---------|
| **Colors** | Layered tokens | Dark mode |
| **Typography** | System fonts, 5-level | Custom fonts |
| **Shadows** | 2 levels | More if needed |
| **Radius** | Tailwind defaults | - |
| **Layout** | Flexbox only | CSS Grid |
| **States** | All defined | - |
| **Elevation** | 6-layer z-index | - |

---

## Design Direction Decision

### Design Directions Explored

**4 Design Directions ที่สร้างขึ้น:**

| Direction | Style | Density | Key Feature |
|-----------|-------|---------|-------------|
| **1. Clean Card Focus** | Spacious, premium | Low (3-4 items) | Large touch targets |
| **2. Compact List** | Efficient, dense | High (6-8 items) | Quick scanning |
| **3. Hero Stats Dashboard** | Data-centric | Medium | Stats prominent |
| **4. Action-First Minimal** | Zen, focused | Low | FAB hero |

### Chosen Direction

**Direction 2: Compact List Layout (Enhanced)**

```
┌─────────────────────────────────┐
│  Timelog      วันนี้ 4.5 ชม. 🎉  │  Header + Daily summary
├─────────────────────────────────┤
│  Recent                         │
│  ─────────────────────────────  │
│  🔵 **ABC Corp** • Audiobook    │  52px row (enhanced)
│     Recording           2h      │  Bold client, accent duration
│  ─────────────────────────────  │
│  🟣 **XYZ Co** • Subtitling     │
│     Translation         1.5h    │  Long-press = Quick duplicate
│  ─────────────────────────────  │
│                           [+]   │  FAB (56px, haptic feedback)
├─────────────────────────────────┤
│  🏠 Home  📊 Stats  👤 Profile  │  Bottom nav
└─────────────────────────────────┘
```

**Party Mode Enhancements Applied:**

| Original | Enhanced |
|----------|----------|
| 48px row height | **52px** (better touch + breathing room) |
| Flat info hierarchy | **Bold client**, muted service, **accent duration** |
| Basic FAB | FAB with **haptic feedback** |
| No empty state | **Friendly illustration + CTA** |
| No success state | **Brief animation + daily summary** |
| No long-press | **Quick duplicate action** |

### Design Rationale

**Why Direction 2 (Enhanced):**

1. **Efficiency-First** — Power users (internal staff) ต้องการความเร็ว ดู list ได้เยอะ scan เร็ว
2. **52px Sweet Spot** — ดีกว่า 48px (breathing room) แต่ยัง compact
3. **Visual Hierarchy** — Bold client + accent duration ช่วย scan เร็วขึ้น
4. **Delight Moments** — Daily summary header + success animation เพิ่ม positive reinforcement
5. **Power User Features** — Long-press duplicate ลด taps สำหรับ repeat entries

**Trade-offs Accepted:**

- ❌ Less spacious than Direction 1 — OK for power users
- ❌ Less visual delight than Direction 3 — Compensated with animations
- ✅ Maximum efficiency for daily logging

### Implementation Approach

**Component Structure:**

```tsx
// EntryRow - 52px compact row
<div className="flex items-center h-[52px] px-4 border-b">
  <ServiceDot color={service.color} />
  <div className="flex-1 ml-3">
    <span className="font-semibold text-gray-900">{client.name}</span>
    <span className="text-sm text-gray-500"> • {service.name}</span>
    <div className="text-xs text-gray-400">{task.name}</div>
  </div>
  <span className="font-medium text-blue-600">{duration}h</span>
</div>
```

**Key Interactions:**

| Action | Behavior |
|--------|----------|
| **Tap row** | Open pre-fill form (2-tap flow) |
| **Long-press row** | Quick duplicate menu |
| **Tap FAB** | Full entry form |
| **Swipe left** | Edit/Delete (P2) |

**Empty State Design:**

```
┌─────────────────────────────────┐
│                                 │
│         📝 ✨                   │
│                                 │
│   ยังไม่มี Recent               │
│   มาลง log งานแรกกัน!           │
│                                 │
│   [+ เริ่มลง Timesheet]         │
│                                 │
└─────────────────────────────────┘
```

**Success State Design:**

```
After save:
→ Haptic feedback (iOS)
→ Checkmark animation (0.3s)
→ Toast: "บันทึกแล้ว!"
→ Header updates: "วันนี้ 6.5 ชม. 🎉"
→ If 8h+: Confetti micro-animation
```

### Design Direction Summary

| Element | Decision |
|---------|----------|
| **Layout** | Compact List (Direction 2) |
| **Row Height** | 52px (enhanced from 48px) |
| **Density** | High (6-8 items visible) |
| **FAB** | 56px, bottom-right, haptic |
| **Visual Hierarchy** | Bold client, muted service, accent duration |
| **Empty State** | Friendly illustration + CTA |
| **Success State** | Animation + daily summary |
| **Long-press** | Quick duplicate action |

---

## User Journey Flows

### Quick Entry Flow (Employee)

**Journey:** น้องมิ้นท์ ต้องการลง timesheet ให้เสร็จเร็วที่สุด

**Entry Points:**
- Open app → Home screen
- Push notification (reminder)

**Flow Metrics:**

| Path | Steps | Taps | Target Time |
|------|-------|------|-------------|
| **Quick (Recent)** | 3 | 2-3 | < 15 sec |
| **Full Entry** | 7 | 6-8 | < 30 sec |

**Quick Path Flow:**

```
Home Screen
    ↓
Has Recent? ─── No ──→ Empty State + CTA ──→ FAB ──→ Full Entry Form
    │
   Yes
    ↓
Recent Cards
    ↓
Tap 1: Select Recent
    ↓
Bottom Sheet (Pre-filled)
    ↓
Adjust Duration? ─── Yes ──→ [+]/[-] Stepper
    │
   No
    ↓
Tap 2: "บันทึก"
    ↓
Save Entry
    ↓
Haptic → Animation → Toast "เยี่ยม! บันทึกแล้ว [แก้ไข]"
    ↓
Tap แก้ไข? ─── Yes ──→ Reopen Entry
    │
   No
    ↓
Update Stats + Recent
    ↓
Milestone Check ─── 8h ──→ "Day Complete!" Celebration
                │
              Streak ──→ Badge Unlocked
```

**Error Recovery Path:**

```
Save Failed (Network)
    ↓
Queue for Sync → Show Sync Indicator
    ↓
Retry (3 attempts)
    ↓
Still Failed? → Save as Draft → Toast "บันทึกเป็น draft แล้ว"
    ↓
Next App Open → "มี draft ค้างอยู่"
```

**Party Mode Enhancements Applied:**

| Original | Enhanced |
|----------|----------|
| Toast only | Toast with "แก้ไข" action (5 sec) |
| No offline | Queue + sync indicator |
| No retry | 3 retries → draft fallback |
| No milestones | 8h celebration, streak badge |

---

### Team Dashboard Flow (Manager)

**Journey:** พี่ต้น ต้องการดู compliance ทีมและ utilization

**Entry Points:**
- Bottom nav → Stats tab
- Morning routine (daily check)

**Dashboard Flow:**

```
Bottom Nav (Stats)
    ↓
Team Dashboard
    ├── Team Overview Card (Utilization %, Compliance)
    └── Team Member List
            ├── Member 1 ✅ 8h
            ├── Member 2 ⚠️ 4h
            └── Member 3 ❌ 0h
```

**Quick Actions (Enhanced):**

| Action | Gesture | Result |
|--------|---------|--------|
| View detail | Tap row | Member detail + history |
| Quick remind | Swipe right | Push notification sent |
| Bulk remind | Select multiple → Action | Remind all missing |

**Status Icons:**

| Icon | Meaning | Threshold |
|------|---------|-----------|
| ✅ | Complete | ≥ 6h |
| ⚠️ | Partial | 1-5.9h |
| ❌ | Missing | 0h |

---

### First-Time User Flow (Onboarding)

**Journey:** น้องเบล เข้าใช้งานวันแรก

**Onboarding Flow:**

```
Open Timelog Link
    ↓
Authenticated? ─── No ──→ OAuth Login ──→ Back
    │
   Yes
    ↓
Welcome Screen
    ↓
Home (Empty State)
    ↓
Single Tooltip: "กดปุ่มนี้เพื่อเริ่มต้น"
    ↓
Tap FAB / Dismiss
    ↓
Full Entry Form (with contextual hints)
    ↓
บันทึก
    ↓
🎉 "ยินดีด้วย! ลง Timesheet แรกสำเร็จแล้ว"
    ↓
Home with Recent
    ↓
Contextual Hint: "ครั้งหน้าแตะตรงนี้ได้เลย"
```

**Progressive Onboarding:**

| Timing | Element | Type |
|--------|---------|------|
| First open | Welcome screen | Full-screen |
| First home | Single tooltip | Dismissible |
| First form | Field hints | Contextual |
| First save | Celebration | Modal |
| Second home | Recent hint | Contextual |
| Day 3+ | No hints | Clean UI |

---

### Journey Patterns

**Pattern 1: Feedback Loop (4-Step)**

```
Action → Haptic → Animation → Toast [Action] → State Update
```

ทุก action สำคัญต้องมี feedback ครบ 4 ขั้นตอน

**Pattern 2: Error Recovery (Graceful Degradation)**

| Stage | Behavior |
|-------|----------|
| Online | API call → Success/Retry |
| Offline | Queue → Sync indicator |
| 3 failures | Draft fallback |
| Next open | "มี draft ค้างอยู่" |

**Pattern 3: Progressive Loading**

```
Skeleton → Data → Interactive
```

**Pattern 4: Milestone Celebrations**

| Milestone | Trigger | Celebration |
|-----------|---------|-------------|
| First entry | entry_count == 1 | Confetti + "ยินดีด้วย!" |
| Day complete | daily_hours >= 8 | "เยี่ยม! วันนี้ครบแล้ว" |
| Week streak | consecutive_days >= 5 | "5 วันติดต่อกัน!" |

---

### Flow Optimization Principles

1. **Minimize Taps to Value**
   - Recent = 2 taps
   - Full entry = 6-8 taps
   - Edit after save = 1 tap (from toast)

2. **Always Recoverable**
   - Toast with "แก้ไข" action (5 sec window)
   - Draft auto-save on error
   - Offline queue with sync indicator

3. **Track Everything**
   - `flow_started`: User begins journey
   - `flow_completed`: User reaches success
   - `flow_abandoned`: User exits mid-flow
   - `flow_error`: Error occurred

4. **Encourage with Copy**
   - "บันทึกแล้ว" → "**เยี่ยม!** บันทึกแล้ว"
   - "ยังไม่มี Recent" → "**พร้อมลง log วันนี้?**"

5. **Celebrate Milestones**
   - First entry = special moment
   - Daily completion = positive reinforcement
   - Streaks = habit building

---

## Component Strategy

### Design System Components

**Available from shadcn/ui:**

| Component | Use Case | Customization |
|-----------|----------|---------------|
| Button | Actions, CTAs | Variants + colors |
| Input | Form fields | Sizing |
| Select | Dropdowns | Custom trigger |
| Sheet | Bottom sheets | Custom heights |
| Tabs | Navigation | Bottom nav variant |
| Card | Entry cards | Compact variant |
| Toast | Notifications | Thai copy |
| Dialog | Confirmations | Delete confirm |
| Skeleton | Loading states | Entry row shape |
| Badge | Status indicators | Service colors |

**shadcn/ui Gap Analysis:**

| Need | Available | Solution |
|------|-----------|----------|
| FAB | ❌ | Custom component |
| Swipeable Row | ❌ | Custom + @use-gesture/react |
| Duration Stepper | ❌ | Custom component |
| Bottom Nav | ❌ | Custom from Tabs |
| Progress Ring | ❌ | Custom SVG |
| Service Dot | ❌ | Custom primitive |

---

### Shared Primitives

**Extracted Building Blocks:**

```
components/
├── primitives/          # Shared building blocks
│   ├── service-dot.tsx
│   ├── touchable-row.tsx
│   ├── stepper.tsx
│   └── circular-progress.tsx
├── ui/                  # shadcn/ui components
├── custom/              # Composed from primitives
│   ├── fab.tsx
│   ├── recent-card.tsx
│   ├── duration-stepper.tsx
│   ├── bottom-nav.tsx
│   └── progress-ring.tsx
```

**ServiceDot:**

```tsx
interface ServiceDotProps {
  color: string;
  size?: 'sm' | 'md' | 'lg';
}
// Used by: RecentCard, EntryRow, ServiceBadge
```

**TouchableRow:**

```tsx
interface TouchableRowProps {
  onTap: () => void;
  onLongPress?: () => void;
  onSwipeLeft?: () => void;
  haptic?: boolean;
  height?: number;
}
// Used by: RecentCard, TeamMemberRow, EntryRow
```

**Stepper:**

```tsx
interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  debounceMs?: number;
}
// Used by: DurationStepper, QuantityPicker
```

**CircularProgress:**

```tsx
interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
}
// Used by: ProgressRing, DailyProgress
```

---

### Custom Components

#### 1. FAB (Floating Action Button)

**Props Interface:**

```tsx
interface FABProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  hideOnScroll?: boolean;
  'aria-label': string;
}
```

**Specifications:**

| Attribute | Value | Rationale |
|-----------|-------|-----------|
| Size | 56x56px | Comfortable touch target |
| Position | `bottom: 24px, right: 24px` | Thumb zone |
| Safe Area | `env(safe-area-inset-bottom)` | iPhone notch |
| Shadow | `shadow-lg` | Elevation |
| Animation | Scale 95% on press | Tactile feedback |
| Scroll | Hide on scroll down, show on scroll up | Content focus |

**Animation Specs:**

```tsx
// Press animation
transition: 'transform 150ms ease-out'
active: scale(0.95)

// Scroll behavior
hideOnScroll: Intersection Observer
threshold: 50px scroll delta
```

**States:**

| State | Visual |
|-------|--------|
| Default | Blue-500, + icon |
| Hover | Blue-600 |
| Active | Scale 95%, Blue-700 |
| Loading | Spinner, disabled |
| Hidden | translateY(100px), opacity 0 |

---

#### 2. RecentCard

**Props Interface:**

```tsx
interface RecentCardProps {
  entry: RecentEntry;
  onTap: () => void;
  onLongPress?: () => void;
  onSwipeLeft?: () => void;
}

interface RecentEntry {
  id: string;
  client: { name: string; abbrev: string };
  service: { name: string; color: string };
  task: { name: string };
  duration: number;
}
```

**Specifications:**

| Attribute | Value |
|-----------|-------|
| Height | 52px |
| Left border | 4px, service color |
| Client text | Bold, max 20 chars, truncate ellipsis |
| Duration | Blue-600, right-aligned |
| Long-press | 500ms + vibration |
| Swipe threshold | 80px |

**Text Overflow:**

```tsx
// Client name overflow
maxWidth: '20ch'
overflow: 'hidden'
textOverflow: 'ellipsis'
whiteSpace: 'nowrap'
```

**Interaction Specs:**

```tsx
// Long-press timing
longPressDelay: 500ms
hapticFeedback: navigator.vibrate(10)

// Swipe gesture
swipeThreshold: 80px
swipeVelocity: 0.3
```

**States:**

| State | Visual |
|-------|--------|
| Default | White bg, service border |
| Pressed | Gray-50 bg, scale 98% |
| Long-press | Gray-100 bg, menu appears |
| Swiped | Reveal delete action |

---

#### 3. DurationStepper

**Props Interface:**

```tsx
interface DurationStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;        // default: 0.25
  max?: number;        // default: 24
  step?: number;       // default: 0.25
  debounceMs?: number; // default: 300
}
```

**Specifications:**

| Attribute | Value |
|-----------|-------|
| Layout | `[-] 2.0h [+]` inline |
| Button size | 44x44px touch target |
| Step size | 0.25h default |
| Min value | 0.25h |
| Max value | 24h |
| Debounce | 300ms (rapid tap protection) |

**Overflow Protection:**

```tsx
// Rapid tap handling
debounceMs: 300
// Prevents: 1.0 → 1.25 → 1.5 in < 100ms

// Visual feedback on boundary
onMin: opacity 50%, haptic warning
onMax: opacity 50%, haptic warning
```

**Animation:**

```tsx
// Value change
transition: 'all 150ms ease-out'
scale: value > prev ? 1.1 : 0.9
```

---

#### 4. BottomNav

**Specifications:**

| Attribute | Value |
|-----------|-------|
| Height | 64px + safe-area-inset-bottom |
| Items | 4 (Home, Stats, Profile, Settings) |
| Icon size | 24px |
| Label size | 12px |
| Active | Primary color + bold |
| Touch target | 72x64px per item |
| Safe Area | `padding-bottom: env(safe-area-inset-bottom)` |

**Items:**

```tsx
const navItems = [
  { icon: Home, label: 'หน้าหลัก', path: '/' },
  { icon: BarChart3, label: 'สถิติ', path: '/stats' },
  { icon: User, label: 'โปรไฟล์', path: '/profile' },
  { icon: Settings, label: 'ตั้งค่า', path: '/settings' },
];
```

---

#### 5. ProgressRing

**Specifications:**

| Attribute | Value |
|-----------|-------|
| Size | 48px (uses CircularProgress primitive) |
| Track | Gray-200, 4px stroke |
| Fill | Primary, 4px stroke |
| Animation | 300ms ease-out |
| Label | Center, percentage |

**Usage:**

```tsx
<ProgressRing
  value={hoursLogged}
  max={8}
  label={`${hoursLogged}h`}
/>
```

---

### Component Implementation Strategy

**Build Order (Dependencies):**

```
1. Primitives (no dependencies)
   └── ServiceDot, Stepper, CircularProgress

2. TouchableRow (gesture dependency)
   └── Requires: @use-gesture/react

3. Custom components (compose primitives)
   └── FAB, RecentCard, DurationStepper, BottomNav, ProgressRing
```

**Animation Library:**

```tsx
// Framer Motion for:
- FAB entrance/exit
- Success checkmark
- Sheet transitions

// CSS transitions for:
- Button states
- Value changes
- Color transitions
```

**Gesture Handling:**

```tsx
// @use-gesture/react for:
- Long-press (500ms)
- Swipe actions (80px threshold)
- Pull to refresh

// Native for:
- Tap (onClick)
- Scroll
```

---

### Implementation Roadmap

**P0 - Core Components (MVP Critical):**

| Component | Needed For | Complexity |
|-----------|------------|------------|
| FAB | Quick Entry action | Low |
| RecentCard | 2-tap flow | Medium |
| DurationStepper | Entry form | Medium |
| BottomNav | Navigation | Low |

**P1 - Enhanced Experience:**

| Component | Needed For | Complexity |
|-----------|------------|------------|
| ProgressRing | Daily stats | Low |
| Success Animation | Feedback loop | Medium |
| Empty State | First-time UX | Low |

**P2 - Power User Features:**

| Component | Needed For | Complexity |
|-----------|------------|------------|
| SwipeableRow | Quick edit/delete | Medium |
| Long-press Menu | Quick duplicate | Medium |
| Pull to Refresh | Data sync | Low |

**Dependencies:**

```json
{
  "dependencies": {
    "@use-gesture/react": "^10.x",
    "framer-motion": "^10.x"
  }
}
```

---

### Component Checklist

**Before Implementation:**

- [ ] Review primitives for reusability
- [ ] Confirm animation specs (150ms base)
- [ ] Test touch targets (44px minimum)
- [ ] Verify safe area handling
- [ ] Check accessibility (aria-labels)

**Per Component:**

- [ ] Props interface defined
- [ ] All states documented
- [ ] Animation specs clear
- [ ] Edge cases handled (overflow, boundaries)
- [ ] Accessibility complete

---

## UX Consistency Patterns

### Button Hierarchy

**3-Tier Button System:**

| Tier | Style | Use Case | Example |
|------|-------|----------|---------|
| **Primary** | Solid blue, full-width | Main action per screen | "บันทึก", FAB |
| **Secondary** | Outline, muted | Supporting action | "ยกเลิก", "แก้ไข" |
| **Ghost** | Text only | Tertiary action | "ข้าม", link actions |

**Button Placement Rules:**

```
┌─────────────────────────────────────┐
│                                     │
│         Content Area                │
│                                     │
├─────────────────────────────────────┤
│  [Ghost]      [Secondary] [Primary] │  ← Action bar
└─────────────────────────────────────┘

Primary: Right-most (thumb-optimized)
Secondary: Left of Primary
Ghost: Far left
```

**Button States:**

| State | Primary | Secondary | Ghost |
|-------|---------|-----------|-------|
| Default | Blue-500 | Outline | Text only |
| Hover | Blue-600 | Gray bg | Underline |
| Active | Scale 95% | Scale 95% | Scale 95% |
| Disabled | 50% opacity + tooltip | 50% opacity | 50% opacity |
| Loading | Spinner + "กำลัง..." | Spinner | Spinner |

**Button Enhancements:**

| Feature | Implementation |
|---------|----------------|
| Disabled tooltip | Long-press shows reason why disabled |
| Loading text | "บันทึก" → "กำลังบันทึก..." |
| Double-tap guard | 1000ms throttle prevents duplicate submits |

**Touch Target:** ทุก button ต้อง ≥44x44px

---

### Feedback Patterns

**Feedback Types:**

| Type | Visual | Haptic | Duration | Dismiss |
|------|--------|--------|----------|---------|
| **Success (no action)** | Green toast + ✓ | Success tap | 3s | Auto |
| **Success (with action)** | Green toast + ✓ | Success tap | 5s | Auto/Tap |
| **Warning** | Amber toast | Light tap | 5s | Auto/Tap |
| **Error** | Red toast + icon | Error buzz | ∞ | Manual only |
| **Info** | Blue toast | None | 3s | Auto |

**Toast Anatomy:**

```
┌──────────────────────────────────────┐
│ ✓ เยี่ยม! บันทึกแล้ว    [ยกเลิก] [×] │
└──────────────────────────────────────┘

Icon (24px) + Message + Action(s) + Dismiss
```

**Toast Actions:**

| Action | Label | Behavior | When |
|--------|-------|----------|------|
| Undo | "ยกเลิก" | Revert + delete entry | After save |
| Edit | "แก้ไข" | Reopen entry form | After save |
| Retry | "ลองใหม่" | Retry API call | After error |
| Dismiss | "×" | Close toast | Always |

**Success Flow (4-Step):**

```
Action → Haptic (10ms) → Animation (300ms) → Toast (3-5s) → State Update
```

**Error Recovery Pattern:**

```
Error → Toast (persistent) → [ลองใหม่] → Retry (3x max) → Success/Draft fallback
```

**Copy Guidelines:**

| Type | Tone | Structure | Example |
|------|------|-----------|---------|
| Success | Celebratory | Celebration + Info | "เยี่ยม! บันทึกแล้ว" |
| Error | Empathetic | Acknowledge + Problem + Solution | "อ๊ะ! เน็ตหลุด - ลองอีกทีนะ" |
| Warning | Friendly | Reminder + Context | "มี draft ค้างอยู่ ทำต่อไหม?" |
| Info | Helpful | Tip + Action | "แตะค้างเพื่อ duplicate ได้นะ" |

---

### Form Patterns

**Entry Form Structure:**

```
┌─────────────────────────────────────┐
│ × ลง Timesheet                      │  Header + Close
├─────────────────────────────────────┤
│                                     │
│  Client *                           │
│  ┌─────────────────────────────┐   │
│  │ เลือก Client           ▼   │   │
│  └─────────────────────────────┘   │
│                                     │
│  Service *                          │
│  ┌─────────────────────────────┐   │
│  │ เลือก Service          ▼   │   │
│  └─────────────────────────────┘   │
│                                     │
│  Task *                             │
│  ┌─────────────────────────────┐   │
│  │ เลือก Task             ▼   │   │
│  └─────────────────────────────┘   │
│                                     │
│  Duration *          [-] 2.0h [+]   │
│                                     │
│  Note (optional)                    │
│  ┌─────────────────────────────┐   │
│  │ หมายเหตุ...                 │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│        [ยกเลิก]      [บันทึก]       │
└─────────────────────────────────────┘
```

**Form State Machine:**

```
┌──────┐     validate      ┌────────────┐
│ idle │ ───────────────→  │ validating │
└──────┘                   └────────────┘
    ↑                           │
    │                     valid / invalid
    │                           ↓
    │                    ┌────────────┐
    │  error/cancel      │   valid    │
    │  ←─────────────── └────────────┘
    │                           │
    │                        submit
    │                           ↓
    │                    ┌────────────┐
    │                    │ submitting │
    │                    └────────────┘
    │                      │       │
    │               success      error
    │                  ↓           ↓
    │           ┌─────────┐  ┌──────────┐
    └───────────│ success │  │ retrying │ (max 3x)
                └─────────┘  └──────────┘
                                   │
                             still failed
                                   ↓
                            ┌────────────┐
                            │   failed   │ → Save as draft
                            └────────────┘
```

**Validation Rules:**

| Timing | Type | Visual | Message Tone |
|--------|------|--------|--------------|
| On blur | Field-level | Red border + message | "ลืมเลือก Client" |
| On submit | Form-level | Scroll to first error | Summary toast |
| Real-time | Duration | Prevent invalid | Boundary feedback |
| Async | Duplicate check | Warning badge | "ซ้ำกับวันนี้นะ" |

**Validation Messages:**

| Field | Error | Message |
|-------|-------|---------|
| Client | Empty | "ลืมเลือก Client" |
| Duration | < 0.25 | "ขั้นต่ำ 15 นาทีนะ" |
| Duration | > 24 | "เกิน 24 ชั่วโมงแล้ว" |
| Duplicate | Same entry today | "ซ้ำกับที่ลงไปแล้ววันนี้" |

**Retry Configuration:**

```typescript
const retryConfig = {
  maxAttempts: 3,
  backoffMs: [1000, 2000, 4000],
  retryableErrors: ['NETWORK_ERROR', 'TIMEOUT', '503'],
  fallback: 'SAVE_AS_DRAFT'
};
```

---

### Navigation Patterns

**Bottom Navigation:**

```
┌─────────────────────────────────────┐
│  🏠        📊        👤        ⚙️   │
│ หน้าหลัก   สถิติ    โปรไฟล์   ตั้งค่า  │
└─────────────────────────────────────┘

Active: Primary color + bold label
Inactive: Gray-500 + regular label
Touch target: 72x64px per item
```

**Navigation Transitions:**

| From | To | Transition | Duration |
|------|----|------------|----------|
| Tab → Tab | Instant | Fade | 150ms |
| Screen → Sheet | Up | Slide up | 300ms |
| Sheet → Screen | Down | Slide down | 300ms |
| Screen → Detail | Forward | Slide left | 300ms |

**Back Navigation:**

| Context | Action | Behavior |
|---------|--------|----------|
| Sheet open | Swipe down | Close sheet |
| Sheet open | Tap backdrop | Close sheet |
| Detail screen | Back button | Pop screen |
| Form dirty | Back | Confirm discard dialog |

**Deep Link Handling:**

```
Deep Link (/entry/123)
    ↓
Auth Check ─── Not logged in ──→ Store intended route → Login → Redirect back
    │
  Logged in
    ↓
Route Exists? ─── No ──→ Toast "ไม่พบข้อมูล" → Redirect home
    │
   Yes
    ↓
Load Screen
```

**Discard Confirmation:**

```
┌─────────────────────────────────────┐
│       ออกโดยไม่บันทึก?              │
│                                     │
│   ข้อมูลที่กรอกจะหายไปนะ            │
│                                     │
│      [ยกเลิก]      [ไม่บันทึก]        │
└─────────────────────────────────────┘
```

---

### Loading & Empty States

**Loading States:**

| Context | Pattern | Duration |
|---------|---------|----------|
| Initial load | Skeleton | Until data |
| Refresh | Pull spinner | Until complete |
| Action | Button spinner + text | Until complete |
| Navigation | None (instant) | N/A |

**Skeleton Pattern:**

```
┌─────────────────────────────────────┐
│  ████████      วันนี้ █.█ ชม.       │
├─────────────────────────────────────┤
│  Recent                             │
│  ─────────────────────────────────  │
│  ░░│ ████████████                   │
│    │ ████████          ██           │
│  ─────────────────────────────────  │
│  ░░│ ████████████                   │
│    │ ████████          ██           │
└─────────────────────────────────────┘

Pulse animation: 1.5s infinite
Colors: Gray-200 → Gray-100 → Gray-200
```

**Empty States:**

| Context | Icon | Primary | Secondary | CTA |
|---------|------|---------|-----------|-----|
| No Recent | 📝 | "พร้อมลง log แรก?" | "มาเริ่มกัน!" | "+ เริ่มลง Timesheet" |
| No entries today | ☀️ | "วันใหม่ พร้อมลุย!" | "ลงตอนนี้เลย" | "+ ลงตอนนี้" |
| No team data | 👥 | "รอข้อมูลทีม" | "ยังไม่มีใครลงวันนี้" | None |
| Search no results | 🔍 | "หาไม่เจอ" | "ลองคำอื่นดูนะ" | "ล้างการค้นหา" |

**Empty State Structure:**

```
┌─────────────────────────────────────┐
│                                     │
│              [Icon]                 │
│                                     │
│         Primary Message             │
│       Secondary (optional)          │
│                                     │
│            [CTA Button]             │
│                                     │
└─────────────────────────────────────┘
```

---

### Modal & Sheet Patterns

**Sheet Hierarchy:**

| Type | Height | Use Case | Dismiss |
|------|--------|----------|---------|
| **Full** | 100% | Entry form | × button |
| **Half** | 50% | Select list | Swipe/tap backdrop |
| **Toast** | Auto | Feedback | Auto/manual |

**Sheet Behavior:**

| Gesture | Action |
|---------|--------|
| Swipe down | Close (velocity > 0.3) |
| Tap backdrop | Close |
| Pull up (half) | Expand to full |

**Dialog Pattern (Destructive):**

```
┌─────────────────────────────────────┐
│           ลบ Entry นี้?             │
│                                     │
│     Entry นี้จะถูกลบถาวรนะ          │
│                                     │
│      [ยกเลิก]      [ลบ]             │
└─────────────────────────────────────┘

Destructive button: Red, right position
```

---

### Interaction Timing

**Animation Durations:**

| Type | Duration | Easing |
|------|----------|--------|
| Micro (button) | 150ms | ease-out |
| Sheet transition | 300ms | ease-out |
| Toast entrance | 200ms | ease-out |
| Success checkmark | 300ms | spring |

**Haptic Patterns (iOS):**

| Action | Type | Duration |
|--------|------|----------|
| Button tap | Light | 10ms |
| Success | Success | N/A |
| Error | Error | N/A |
| Long-press | Heavy | 10ms |
| Boundary hit | Warning | 10ms |

**Debounce/Throttle:**

| Action | Type | Duration |
|--------|------|----------|
| Stepper tap | Debounce | 300ms |
| Save button | Throttle | 1000ms |
| Search input | Debounce | 500ms |

---

### Copy Voice & Tone

**Personality:** เพื่อนที่เข้าใจ (ไม่ใช่ระบบที่สั่ง)

**Message Structure by Type:**

| Type | Structure | Example |
|------|-----------|---------|
| Success | Celebration + Info | "เยี่ยม! บันทึกแล้ว" |
| Error | Empathy + Problem + Solution | "อ๊ะ! เน็ตหลุด - ลองอีกทีนะ" |
| Warning | Context + Question | "มี draft ค้างอยู่ ทำต่อไหม?" |
| Empty | Encouragement + CTA | "พร้อมลง log แรก? มาเริ่มกัน!" |
| Validation | Gentle reminder | "ลืมเลือก Client" |

**Emoji Usage:**

| Context | Use | Example |
|---------|-----|---------|
| Major success | ✓ or 🎯 | "เยี่ยม! บันทึกแล้ว 🎯" |
| Milestone | 🎉 | "ครบ 8 ชม. แล้ววันนี้! 🎉" |
| Empty state | Contextual icon | 📝, ☀️, 👥, 🔍 |
| Error | None | Keep it calm |

**Words to Avoid:**

| Avoid | Use Instead |
|-------|-------------|
| "กรุณา..." | (just state it) |
| "Required" | Visual indicator |
| "Error" | "อ๊ะ!" or specific issue |
| "Invalid" | Specific guidance |
| "You must..." | (avoid entirely) |

---

## Responsive Design & Accessibility

### Responsive Strategy

**Mobile-First Approach:**

| Platform | Priority | Screen Range | Design Focus |
|----------|----------|--------------|--------------|
| **Mobile** | Primary | 320-767px | Thumb-optimized, single column |
| **Tablet** | Secondary | 768-1023px | Touch + pointer hybrid |
| **Desktop** | Tertiary | 1024px+ | Enhanced features, multi-column |

**Mobile Strategy (Primary):**

```
┌─────────────────────────────────────┐
│  Header (Stats)                     │
├─────────────────────────────────────┤
│                                     │
│  Single Column Content              │
│  - Recent entries                   │
│  - Today's log list                 │
│                                     │
│                              [FAB]  │
├─────────────────────────────────────┤
│  Bottom Navigation                  │
└─────────────────────────────────────┘
```

**Landscape Mobile Strategy:**

```
┌──────────────────────────────────────────────────────┐
│ Stats │        Recent Entries (horizontal scroll)    │
│ Panel │ ─────────────────────────────────────────── │
│ (mini)│ Entry 1 │ Entry 2 │ Entry 3 │ Entry 4  [FAB]│
└──────────────────────────────────────────────────────┘
```

**Tablet Strategy:**

| Context | Behavior |
|---------|----------|
| Portrait | Same as mobile layout |
| Landscape | 2-column (stats sidebar + content) |
| Split View (iPad) | Compact layout in 1/3 split |
| Floating Keyboard | Forms scroll to avoid coverage |

**Desktop Strategy:**

```
┌─────────────────────────────────────────────────────┐
│  Top Navigation + [?] Help                   [User] │
├──────────────────┬──────────────────────────────────┤
│                  │                                  │
│  Sidebar         │  Main Content Area               │
│  - Quick stats   │  - Entry list (table view)       │
│  - Filters       │  - Enhanced charts               │
│  - [+ New Entry] │  - Bulk actions                  │
│                  │                                  │
└──────────────────┴──────────────────────────────────┘
```

**Desktop Enhancements:**

| Feature | Mobile | Desktop |
|---------|--------|---------|
| Entry list | Card view | Table view option |
| Stats | Compact ring | Expanded charts |
| Navigation | Bottom nav | Top nav + sidebar |
| Entry form | Full-screen sheet | Modal dialog |
| Keyboard shortcuts | N/A | Enabled |

**Desktop Keyboard Shortcuts:**

| Shortcut | Action |
|----------|--------|
| `N` | New entry |
| `S` | Save (when form open) |
| `Esc` | Close sheet/cancel |
| `↑`/`↓` | Navigate entry list |
| `Enter` | Select entry / confirm |
| `?` | Show keyboard shortcuts help |

---

### Breakpoint Strategy

**Tailwind Breakpoints (Mobile-First):**

| Breakpoint | Width | Device Target | Layout Change |
|------------|-------|---------------|---------------|
| **Default** | 0-639px | Small phones | Base mobile layout |
| **sm** | 640px+ | Large phones | Wider cards |
| **md** | 768px+ | Tablets | 2-column option |
| **lg** | 1024px+ | Desktop | Full desktop layout |
| **xl** | 1280px+ | Large desktop | Max-width container |

**Container Queries:**

```css
/* Component-level responsiveness */
.entry-card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .entry-card {
    flex-direction: row;
  }
}
```

**Viewport Configuration:**

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

**Safe Area Handling:**

```css
:root {
  --safe-top: env(safe-area-inset-top);
  --safe-bottom: env(safe-area-inset-bottom);
  --safe-left: env(safe-area-inset-left);
  --safe-right: env(safe-area-inset-right);
}

.bottom-nav {
  padding-bottom: var(--safe-bottom);
}
```

---

### Accessibility Strategy

**WCAG Compliance Target: AA + WCAG 2.2**

| Level | Description | Commitment |
|-------|-------------|------------|
| **A** | Essential | ✅ Required |
| **AA** | Industry standard | ✅ Target |
| **AAA** | Exceptional | ⚠️ Where practical |
| **WCAG 2.2** | Latest criteria | ✅ Key additions |

**WCAG 2.2 New Criteria:**

| Criterion | Level | Implementation |
|-----------|-------|----------------|
| 2.5.8 Target Size | AA | 44px buttons, 24px inline minimum |
| 3.2.6 Consistent Help | A | Help "?" icon always in header |
| 3.3.7 Redundant Entry | A | Never ask same info twice |
| 3.3.8 Accessible Auth | AA | No CAPTCHA or cognitive tests |

**Color Accessibility:**

| Element | Contrast Ratio | Status |
|---------|----------------|--------|
| Body text (Gray-900/White) | 15.4:1 | ✅ Pass AAA |
| Muted text (Gray-500/White) | 5.8:1 | ✅ Pass AA |
| Primary button (White/Blue-500) | 4.5:1 | ✅ Pass AA |

**Color Blindness Design:**

| Principle | Implementation |
|-----------|----------------|
| Never rely on color alone | Always pair with icon + text |
| Success | Green + ✓ + "บันทึกแล้ว" |
| Error | Red + ✕ + Error message |
| Warning | Amber + ⚠ + Warning text |

**High Contrast Mode:**

```css
@media (prefers-contrast: more) {
  .button { border: 2px solid currentColor; }
  .card { border: 1px solid currentColor; }
  :focus-visible { outline: 3px solid currentColor; }
}
```

**Cognitive Accessibility:**

| Principle | Implementation |
|-----------|----------------|
| Plain language | Simple Thai, no jargon |
| Memory reduction | Recent selections, auto-fill |
| Error prevention | Confirmation + undo for destructive |
| Consistent layout | Same patterns across screens |

**Touch & Motor:**

| Requirement | Spec |
|-------------|------|
| Touch target (primary) | ≥44x44px |
| Touch target (inline) | ≥24x24px |
| Spacing between targets | ≥8px |
| Gesture alternatives | Required |
| Motion | Respect prefers-reduced-motion |

**Keyboard Navigation:**

| Action | Keyboard |
|--------|----------|
| Navigate elements | Tab / Shift+Tab |
| Activate button/link | Enter / Space |
| Close modal/sheet | Escape |
| Navigate list items | Arrow keys |

**Screen Reader Support:**

| Element | ARIA Implementation |
|---------|---------------------|
| FAB | `aria-label="เพิ่ม Timesheet ใหม่"` |
| Entry card | `role="button" aria-label="[client] [service] [duration]"` |
| Stats updates | `aria-live="polite"` |
| Toasts | `role="alert" aria-live="assertive"` |
| Form errors | `aria-describedby="[error-id]"` |

**Voice Control Compatibility:**

```tsx
// Visible label should match aria-label
<button aria-label="เพิ่ม Timesheet">
  <PlusIcon aria-hidden="true" />
  <span>เพิ่ม</span>
</button>
```

---

### Performance Optimization

**Mobile Performance Budget:**

| Metric | Target | Critical |
|--------|--------|----------|
| First Contentful Paint | <1.5s | <2.5s |
| Largest Contentful Paint | <2.5s | <4s |
| Time to Interactive | <3s | <5s |
| Total Bundle Size | <200KB | <500KB |

**Optimization Strategies:**

| Technique | Implementation |
|-----------|----------------|
| Image lazy loading | `loading="lazy"` + `srcset` |
| Font optimization | `font-display: swap`, subset Thai |
| Code splitting | Route-based chunks |
| CSS purging | Tailwind purge unused |

---

### Testing Strategy

**Responsive Testing Matrix:**

| Device | Screen | Priority |
|--------|--------|----------|
| iPhone SE | 375×667 | P0 |
| iPhone 14 | 390×844 | P0 |
| Pixel 5 | 393×851 | P0 |
| iPad | 768×1024 | P1 |
| Desktop | 1920×1080 | P1 |

**Browser Testing:**

| Browser | Platform | Priority |
|---------|----------|----------|
| Safari | iOS 15+ | P0 |
| Chrome | Android 10+ | P0 |
| Chrome | Desktop | P1 |
| Firefox | Desktop | P2 |

**Accessibility Testing:**

| Test Type | Tool | Frequency |
|-----------|------|-----------|
| Automated audit | axe-core | Every PR |
| Lighthouse a11y | Chrome DevTools | Every PR |
| Keyboard navigation | Manual | Every feature |
| Screen reader | VoiceOver | Every release |
| High contrast | Windows HC mode | Every release |

**Automated A11y Testing:**

```typescript
import AxeBuilder from '@axe-core/playwright';

test('passes accessibility audit', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

---

### Implementation Helpers

**Reduced Motion Hook:**

```typescript
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reducedMotion;
}
```

**Keyboard Shortcuts Hook:**

```typescript
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      const key = e.key.toLowerCase();
      if (shortcuts[key]) {
        e.preventDefault();
        shortcuts[key]();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}
```

---

### Accessibility Checklist

**Before Launch:**

- [ ] Lighthouse accessibility score ≥90
- [ ] No axe-core violations
- [ ] All forms keyboard navigable
- [ ] Screen reader tested (VoiceOver)
- [ ] Color contrast verified
- [ ] Touch targets ≥44px
- [ ] Skip link functional
- [ ] Reduced motion respected
- [ ] High contrast mode works

**Per Component:**

- [ ] Has visible focus indicator
- [ ] Has ARIA labels where needed
- [ ] Keyboard accessible
- [ ] Color not sole indicator
- [ ] Touch target adequate

---

## Addendum: Data Model Clarification

**Date:** 2025-12-30
**Reason:** Discovered during Architecture phase that actual business hierarchy differs from initial PRD

### Updated Master Data Hierarchy

**Original (PRD):**

```
Client → Service → Task (optional)
```

**Corrected (from actual Google Sheets):**

```
Client
  └── Project
        └── Job (Job No., SO No.)

Service (standalone)
Task (optional, standalone)
```

**Relationships:**
- 1 Client has many Projects
- 1 Project has many Jobs
- Job has Job No. and SO No. (Admin-managed reference numbers)
- Service and Task are standalone lookup tables

### UX Impact & Mitigations

| Original Design | Impact | Mitigation |
|-----------------|--------|------------|
| Quick Entry "2 แตะ" | 5 levels = more taps | Recent Combinations pattern |
| RecentCard component | Need full combo | Store Client+Project+Job+Service |
| Admin Master Data | 3 screens | 5 screens (add Projects, Jobs) |
| Cascading dropdowns | Simple | Dependent filtering required |

### Quick Entry Flow (Revised)

**Primary Path (80% of entries) — Preserves "2 แตะ จบ":**

1. Tap Recent Combination from list → Auto-fills all fields
2. Adjust Duration if needed → Save

**Total: 2 taps (unchanged for repeat entries)**

**New Entry Path (20% of entries):**

1. Select Client (with search)
2. Select Project (filtered by Client)
3. Select Job (filtered by Project) — shows Job No., SO No.
4. Select Service
5. Select Task (optional)
6. Set Duration
7. Save

**Optimization:** Smart cascading auto-selects if only 1 option available

### Updated Time Entry Data Model

```typescript
interface TimeEntry {
  id: string;
  userId: string;

  // Cascading hierarchy
  clientId: string;
  projectId: string;
  jobId: string;        // Links to Job No. & SO No.

  // Service selection
  serviceId: string;
  taskId?: string;      // Optional

  // Entry data
  date: string;
  durationMinutes: number;
  note?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

interface RecentCombination {
  id: string;
  userId: string;

  // Full combination for 1-tap entry
  clientId: string;
  projectId: string;
  jobId: string;
  serviceId: string;
  taskId?: string;

  // Usage tracking
  lastUsedAt: string;
  useCount: number;
}
```

### New Component: CascadingJobSelector

```typescript
interface CascadingJobSelectorProps {
  // Current selections
  clientId?: string;
  projectId?: string;
  jobId?: string;

  // Callbacks
  onClientChange: (clientId: string) => void;
  onProjectChange: (projectId: string) => void;
  onJobChange: (jobId: string) => void;

  // Display options
  showJobDetails?: boolean;  // Show Job No., SO No.
  autoSelectSingle?: boolean; // Auto-select if only 1 option
}
```

**Behavior:**
- Client dropdown shows all active clients (with search)
- Project dropdown filtered by selected Client
- Job dropdown filtered by selected Project
- Shows Job No. and SO No. in Job selection for reference
- Auto-selects and moves to next if only 1 option available

### Updated Admin Panel Structure

| Screen | CRUD Operations | Fields |
|--------|-----------------|--------|
| **Clients** | Add, Edit, Deactivate | Name, Active |
| **Projects** | Add, Edit, Deactivate | Client (dropdown), Name, Active |
| **Jobs** | Add, Edit, Deactivate | Project (cascading), Name, Job No., SO No., Active |
| **Services** | Add, Edit, Deactivate | Name, Active |
| **Tasks** | Add, Edit, Deactivate | Name, Active |

### Impact on RecentCard Component

**Updated RecentCard Display:**

```
┌─────────────────────────────────────────┐
│ 🎬 Client Name                          │
│    Project Name > Job Name              │
│    Service Name                         │
│                                    2.5h │
│                            Yesterday ▶  │
└─────────────────────────────────────────┘
```

**Shows:** Client → Project → Job → Service in compact format

---

**End of Addendum**
