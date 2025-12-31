/**
 * Application message constants
 * Story 2.4: Session Timeout Handling
 *
 * Centralized message strings for consistency across the app.
 */

export const AUTH_MESSAGES = {
  SESSION_EXPIRED_TITLE: 'Session Expired',
  SESSION_EXPIRED_DESCRIPTION: 'Your session has expired. Please login again.',
  SIGNED_OUT_TITLE: 'Signed Out',
  SIGNED_OUT_DESCRIPTION: 'You have been signed out.',
  PLEASE_LOGIN: 'Please login to continue',
  PLEASE_LOGIN_AGAIN: 'Please login again.',
} as const;

export const AUTH_ROUTES = {
  LOGIN_EXPIRED: '/login?expired=true',
  LOGIN: '/login',
} as const;
