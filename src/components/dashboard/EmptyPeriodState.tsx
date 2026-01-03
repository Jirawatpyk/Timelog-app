/**
 * EmptyPeriodState Component - Story 5.8
 *
 * Period-specific empty states for today, week, and month views.
 * AC1: Empty Today State with CTA
 * AC2: Empty Week State with CTA
 * AC3: Empty Month State with CTA
 */

import { Calendar, CalendarDays, CalendarRange, LucideIcon } from 'lucide-react';
import { EmptyStateBase } from '@/components/dashboard/EmptyStateBase';
import type { Period } from '@/types/dashboard';

interface EmptyPeriodStateProps {
  period: Period;
}

interface PeriodConfig {
  icon: LucideIcon;
  title: string;
  description: string;
}

const periodConfig: Record<Period, PeriodConfig> = {
  today: {
    icon: Calendar,
    title: 'No entries for today',
    description: 'Start logging your time today!',
  },
  week: {
    icon: CalendarDays,
    title: 'No entries this week',
    description: 'No entries recorded this week yet.',
  },
  month: {
    icon: CalendarRange,
    title: 'No entries this month',
    description: 'No entries recorded this month yet.',
  },
};

export function EmptyPeriodState({ period }: EmptyPeriodStateProps) {
  const config = periodConfig[period];

  return (
    <EmptyStateBase
      icon={config.icon}
      title={config.title}
      description={config.description}
      action={{
        label: 'Add Entry',
        href: '/entry',
      }}
      className="empty-period-state"
      data-testid="empty-period-state"
    />
  );
}
