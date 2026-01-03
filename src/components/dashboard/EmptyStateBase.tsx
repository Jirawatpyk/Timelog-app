/**
 * EmptyStateBase Component - Story 5.8
 *
 * Reusable base component for all empty states.
 * AC7: Visual design - muted colors, centered layout, encouraging feel
 *
 * Features:
 * - Icon with muted background styling
 * - Centered vertical layout
 * - Optional primary and secondary actions
 * - Supports both href links and onClick handlers
 */

import Link from 'next/link';
import type { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateBaseAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface EmptyStateBaseProps {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: EmptyStateBaseAction;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  'data-testid'?: string;
}

export function EmptyStateBase({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  'data-testid': testId = 'empty-state-base',
}: EmptyStateBaseProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
      data-testid={testId}
    >
      {/* Icon with muted background */}
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-medium mb-2">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-muted-foreground mb-6 max-w-[250px]">
          {description}
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2">
        {action &&
          (action.href ? (
            <Button asChild aria-label={action.label}>
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : (
            <Button onClick={action.onClick} aria-label={action.label}>
              {action.label}
            </Button>
          ))}

        {secondaryAction && (
          <Button
            variant="ghost"
            onClick={secondaryAction.onClick}
            aria-label={secondaryAction.label}
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}
