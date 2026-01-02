'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubmitButtonProps {
  isLoading: boolean;
  isSuccess?: boolean;
  disabled?: boolean;
  hasErrors?: boolean;
  onClick?: () => void;
}

/**
 * Submit Button Component with loading, success, and shake animation states
 * Story 4.4 - AC6: Loading state, disabled during submission, prevent double submission
 * Story 4.8 - AC5: Shake animation on validation failure
 */
export function SubmitButton({
  isLoading,
  isSuccess,
  disabled,
  hasErrors,
  onClick,
}: SubmitButtonProps) {
  const [shouldShake, setShouldShake] = useState(false);

  // Trigger shake when hasErrors becomes true
  useEffect(() => {
    if (hasErrors) {
      setShouldShake(true);
      const timer = setTimeout(() => setShouldShake(false), 400);
      return () => clearTimeout(timer);
    }
  }, [hasErrors]);

  return (
    <motion.div
      animate={
        shouldShake
          ? {
              x: [0, -10, 10, -10, 10, 0],
              transition: { duration: 0.4 },
            }
          : {}
      }
      data-testid="submit-button-wrapper"
    >
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
        data-testid="submit-button"
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
    </motion.div>
  );
}
