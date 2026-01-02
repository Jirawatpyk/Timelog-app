'use client';

import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { FieldErrors } from 'react-hook-form';

interface FormErrorSummaryProps {
  errors: FieldErrors;
  show?: boolean;
}

/**
 * Form Error Summary Component
 * Story 4.8 - Displays summary of form validation errors at the top
 */
export function FormErrorSummary({ errors, show = true }: FormErrorSummaryProps) {
  const errorCount = Object.keys(errors).length;

  if (!show || errorCount === 0) return null;

  return (
    <Alert variant="destructive" className="mb-4" role="alert" aria-live="polite">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Please fix the following errors</AlertTitle>
      <AlertDescription>
        {errorCount} field{errorCount > 1 ? 's' : ''} require{errorCount === 1 ? 's' : ''} attention
      </AlertDescription>
    </Alert>
  );
}
