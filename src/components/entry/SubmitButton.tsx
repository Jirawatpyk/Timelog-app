'use client';

import { Button } from '@/components/ui/button';
import { Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubmitButtonProps {
  isLoading: boolean;
  isSuccess?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

/**
 * Submit Button Component with loading and success states
 * Story 4.4 - AC6: Loading state, disabled during submission, prevent double submission
 */
export function SubmitButton({
  isLoading,
  isSuccess,
  disabled,
  onClick,
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      size="lg"
      disabled={isLoading || disabled}
      onClick={onClick}
      className={cn(
        'w-full min-h-[48px] text-lg font-medium',
        'touch-manipulation',
        isSuccess && 'bg-green-600 hover:bg-green-600'
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Saving...
        </>
      ) : isSuccess ? (
        <>
          <Check className="mr-2 h-5 w-5" />
          Saved!
        </>
      ) : (
        'Save'
      )}
    </Button>
  );
}
