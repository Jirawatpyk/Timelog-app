/**
 * FilterChip Component - Story 5.6
 *
 * Displays an active filter with option to clear it.
 * Uses framer-motion for enter/exit animations.
 */

'use client';

import { X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterChipProps {
  label: string;
  value: string;
  paramName: string;
}

export function FilterChip({ label, value, paramName }: FilterChipProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClear = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(paramName);
    const queryString = params.toString();
    router.push(queryString ? `/dashboard?${queryString}` : '/dashboard');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
      >
        <span className="text-muted-foreground">{label}:</span>
        <span className="font-medium">{value}</span>
        <button
          onClick={handleClear}
          className="ml-1 p-0.5 rounded-full hover:bg-primary/20"
          aria-label={`Clear ${label} filter`}
        >
          <X className="h-3 w-3" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
