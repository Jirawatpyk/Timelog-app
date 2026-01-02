/**
 * Haptic Feedback Utility
 * Story 4.6 - AC3: Haptic feedback on delete
 *
 * Provides cross-browser vibration support for mobile devices
 */

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

const PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 50,
  heavy: 100,
  success: 50,
  warning: [50, 50],
  error: [50, 50, 50],
};

/**
 * Trigger haptic feedback if supported by the device
 * @param pattern - The haptic pattern to use
 * @returns true if vibration was triggered, false otherwise
 */
export function hapticFeedback(pattern: HapticPattern = 'light'): boolean {
  if (!('vibrate' in navigator)) {
    return false;
  }

  try {
    navigator.vibrate(PATTERNS[pattern]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if haptic feedback is supported
 */
export function isHapticSupported(): boolean {
  return 'vibrate' in navigator;
}
