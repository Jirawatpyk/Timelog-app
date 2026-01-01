'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

interface SuccessAnimationProps {
  show: boolean;
  onComplete?: () => void;
}

/**
 * Success Animation Component with checkmark and confetti
 * Story 4.4 - AC5: Success animation (checkmark with confetti)
 */
export function SuccessAnimation({ show, onComplete }: SuccessAnimationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          onAnimationComplete={() => {
            // Auto-hide after animation completes (~800ms total)
            setTimeout(() => {
              onComplete?.();
            }, 500);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
              delay: 0.1,
            }}
            className="flex flex-col items-center gap-3 rounded-2xl bg-white p-8 shadow-2xl dark:bg-slate-800"
          >
            {/* Animated checkmark circle */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500"
            >
              <motion.div
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <Check className="h-10 w-10 text-white stroke-[3]" />
              </motion.div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl font-medium text-green-600 dark:text-green-400"
            >
              Saved!
            </motion.p>
          </motion.div>

          {/* Confetti particles */}
          <Confetti />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Simple confetti component with animated particles
 */
function Confetti() {
  const particles = Array.from({ length: 20 });
  const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6'];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{
            opacity: 1,
            x: '50vw',
            y: '50vh',
            scale: 0,
          }}
          animate={{
            opacity: 0,
            x: `${Math.random() * 100}vw`,
            y: `${Math.random() * 100}vh`,
            scale: Math.random() * 0.5 + 0.5,
            rotate: Math.random() * 360,
          }}
          transition={{
            duration: 0.8,
            delay: Math.random() * 0.2,
            ease: 'easeOut',
          }}
          className="absolute h-3 w-3 rounded-full"
          style={{ backgroundColor: colors[i % colors.length] }}
        />
      ))}
    </div>
  );
}
