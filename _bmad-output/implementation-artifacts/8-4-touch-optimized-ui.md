# Story 8.4: Touch-Optimized UI

## Status: ready-for-dev

## Story

As a **mobile user**,
I want **all interactive elements to be easy to tap**,
So that **I can use the app comfortably with my fingers**.

## Acceptance Criteria

### AC 1: Minimum Touch Target Size
- **Given** Any interactive element (button, link, input)
- **When** Measuring tap target size
- **Then** Minimum touch target is 44x44px
- **And** Sufficient spacing between adjacent targets (8px minimum)

### AC 2: Touch Feedback
- **Given** I tap a button
- **When** Touch is registered
- **Then** Visual feedback appears within 50ms (ripple or highlight)
- **And** No delay before action starts

### AC 3: Scroll vs Tap Distinction
- **Given** I am scrolling a list
- **When** My finger is moving
- **Then** Touch targets don't accidentally activate
- **And** Scroll is smooth (60fps)

### AC 4: Form Input Optimization
- **Given** Form inputs
- **When** Tapping to focus
- **Then** Input zooms appropriately on iOS (font-size >= 16px)
- **And** Keyboard doesn't obscure the input

### AC 5: Safe Area Handling
- **Given** I am using iPhone with notch
- **When** Viewing the app
- **Then** Content respects safe areas (notch, home indicator)
- **And** No content is cut off or obscured

## Tasks

### Task 1: Audit Touch Target Sizes
**File:** All component files
- [ ] Review all buttons for 44x44px minimum
- [ ] Review all links and clickable elements
- [ ] Check icon buttons have adequate padding
- [ ] Document any violations

### Task 2: Create Touch Target Utility Classes
**File:** `src/styles/touch.css` or Tailwind config
- [ ] Create `.touch-target` class for min 44x44px
- [ ] Create `.touch-spacing` for 8px gap
- [ ] Add to Tailwind extend if needed

### Task 3: Update Button Components
**File:** `src/components/ui/button.tsx`
- [ ] Ensure all sizes meet 44px minimum height
- [ ] Add touch feedback styles
- [ ] Verify padding is adequate

### Task 4: Update Form Inputs
**File:** `src/components/ui/input.tsx`
- [ ] Set minimum font-size to 16px (prevents iOS zoom)
- [ ] Ensure height is at least 44px
- [ ] Add proper padding for touch

### Task 5: Add Touch Feedback Styles
**File:** `src/app/globals.css`
- [ ] Add active state with scale transform
- [ ] Add subtle background change on touch
- [ ] Use -webkit-tap-highlight-color
- [ ] Ensure feedback is within 50ms

### Task 6: Configure Safe Area Padding
**File:** `src/app/layout.tsx` and CSS
- [ ] Add `env(safe-area-inset-*)` for all edges
- [ ] Apply to bottom nav especially
- [ ] Test on iPhone with notch
- [ ] Handle home indicator area

### Task 7: Update Bottom Navigation
**File:** `src/components/shared/BottomNav.tsx`
- [ ] Ensure each nav item is 44x44px minimum
- [ ] Add safe-area-inset-bottom padding
- [ ] Adequate spacing between items
- [ ] Clear active state indicator

### Task 8: Update Select/Dropdown Components
**File:** `src/components/ui/select.tsx`
- [ ] Option items at least 44px height
- [ ] Clear touch feedback on options
- [ ] Adequate padding

### Task 9: Update Dialog/Sheet Components
**File:** `src/components/ui/sheet.tsx`, `dialog.tsx`
- [ ] Close button is 44x44px
- [ ] Action buttons meet size requirements
- [ ] Safe area respected at bottom

### Task 10: Test on Real Devices
**File:** Manual testing
- [ ] Test on iPhone (various sizes)
- [ ] Test on Android phone
- [ ] Verify no accidental taps while scrolling
- [ ] Verify keyboard doesn't obscure inputs

## Dev Notes

### Architecture Pattern
- CSS utility classes for touch targets
- Component-level touch optimization
- Safe area CSS variables

### Touch Target Utility Classes
```css
/* src/app/globals.css */

/* Minimum touch target */
.touch-target {
  min-width: 44px;
  min-height: 44px;
}

/* Touch target with centered content */
.touch-target-center {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Touch spacing */
.touch-spacing {
  gap: 8px;
}

/* Touch feedback */
.touch-feedback {
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.1s ease, background-color 0.1s ease;
}

.touch-feedback:active {
  transform: scale(0.97);
  background-color: rgba(0, 0, 0, 0.05);
}

/* Prevent iOS zoom on input focus */
input, select, textarea {
  font-size: 16px !important;
}
```

### Safe Area CSS
```css
/* src/app/globals.css */

/* Safe area utilities */
.safe-area-top {
  padding-top: env(safe-area-inset-top);
}

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.safe-area-left {
  padding-left: env(safe-area-inset-left);
}

.safe-area-right {
  padding-right: env(safe-area-inset-right);
}

.safe-area-all {
  padding: env(safe-area-inset-top) env(safe-area-inset-right)
           env(safe-area-inset-bottom) env(safe-area-inset-left);
}
```

### Bottom Navigation with Safe Area
```typescript
// src/components/shared/BottomNav.tsx
export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center",
              "min-w-[64px] min-h-[44px]", // Touch target
              "touch-feedback",
              isActive && "text-primary"
            )}
          >
            <item.icon className="h-6 w-6" />
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
```

### Button Size Verification
```typescript
// src/components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors touch-feedback",
  {
    variants: {
      size: {
        default: "h-11 px-4 py-2", // 44px height
        sm: "h-10 px-3", // 40px - borderline, consider 44px
        lg: "h-12 px-8", // 48px height
        icon: "h-11 w-11", // 44x44px
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);
```

### Input Font Size (iOS Zoom Prevention)
```typescript
// src/components/ui/input.tsx
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-md border", // 44px height
          "px-3 py-2 text-base", // 16px font (text-base)
          "focus-visible:outline-none focus-visible:ring-2",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
```

### Viewport Meta for Safe Areas
```tsx
// src/app/layout.tsx
export const metadata: Metadata = {
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover', // Enable safe area insets
  },
};
```

### Component Dependencies
- Updates to shadcn/ui components
- CSS utilities in globals.css
- Safe area handling in layout

### Import Convention
```typescript
// Most touch optimizations are CSS-based
// No new imports needed for basic touch optimization
```

### Testing Checklist
- [ ] All buttons are 44x44px or larger
- [ ] All form inputs are 44px height with 16px font
- [ ] Bottom nav respects home indicator
- [ ] Top content respects notch
- [ ] Touch feedback is immediate
- [ ] No iOS zoom on input focus
- [ ] Scrolling doesn't trigger taps

### Accessibility
- Touch targets meet WCAG 2.5.5 (Target Size)
- Visual feedback helps confirm actions
- Sufficient spacing prevents mis-taps
- Works with assistive touch

## Definition of Done

- [ ] All buttons are minimum 44x44px
- [ ] All form inputs are minimum 44px height
- [ ] Font size is 16px+ to prevent iOS zoom
- [ ] Touch feedback appears within 50ms
- [ ] Adjacent targets have 8px+ spacing
- [ ] Safe areas respected (notch, home indicator)
- [ ] Bottom nav has safe area padding
- [ ] Scrolling doesn't trigger accidental taps
- [ ] Tested on real iOS and Android devices
- [ ] No TypeScript errors
- [ ] All imports use @/ aliases
