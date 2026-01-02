import type { FieldErrors } from 'react-hook-form';

/**
 * Field order for time entry form (matches form layout)
 * Story 4.8 - AC4: Used to determine scroll target
 */
export const TIME_ENTRY_FIELD_ORDER = [
  'clientId',
  'projectId',
  'jobId',
  'serviceId',
  'taskId',
  'durationHours',
  'entryDate',
  'notes',
] as const;

/**
 * Scroll to and focus the first form field with an error
 * Story 4.8 - AC4: Scroll to first error on validation failure
 *
 * @param errors - React Hook Form errors object
 * @param fieldOrder - Array of field names in display order
 */
export function scrollToFirstError(
  errors: FieldErrors,
  fieldOrder: readonly string[] = TIME_ENTRY_FIELD_ORDER
): void {
  // Find first field with error in display order
  const firstErrorField = fieldOrder.find((field) => field in errors);

  if (!firstErrorField) return;

  // Find the element by ID
  const element = document.getElementById(firstErrorField);

  // Fallback: try to find by data-testid
  const fallbackElement = document.querySelector(
    `[data-testid="${firstErrorField}-selector"]`
  ) as HTMLElement | null;

  const targetElement = element || fallbackElement;

  if (!targetElement) return;

  // Scroll into view with smooth animation
  targetElement.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });

  // Focus after scroll completes
  setTimeout(() => {
    // Try to focus the element or its first focusable child
    if (targetElement.tabIndex >= 0 || targetElement.matches('input, select, button, textarea')) {
      targetElement.focus();
    } else {
      // For select triggers, find the button inside
      const focusable = targetElement.querySelector('button, input, select, textarea') as HTMLElement | null;
      focusable?.focus();
    }
  }, 300);
}

/**
 * Trigger haptic feedback for form errors
 * Story 4.8 - Provides tactile feedback on validation failure
 */
export function triggerErrorHaptic(): void {
  if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
    navigator.vibrate([50, 50, 50]); // Short error pattern
  }
}

/**
 * Trigger haptic feedback for success
 */
export function triggerSuccessHaptic(): void {
  if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
    navigator.vibrate(50); // Single short pulse
  }
}
