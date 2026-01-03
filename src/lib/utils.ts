import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a Date object to ISO date string (YYYY-MM-DD) using LOCAL timezone.
 *
 * IMPORTANT: Do NOT use date.toISOString().split('T')[0] as it converts to UTC
 * which can shift the date backward in timezones ahead of UTC (e.g., Thailand UTC+7).
 *
 * @param date - Date object to format
 * @returns ISO date string in local timezone (e.g., "2026-01-04")
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
