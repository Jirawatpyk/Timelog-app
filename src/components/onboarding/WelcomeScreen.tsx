'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, BarChart3, Zap, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FeatureCard } from '@/components/onboarding/FeatureCard';
import { completeOnboarding } from '@/actions/onboarding';
import { toast } from 'sonner';

const features = [
  {
    icon: Clock,
    title: 'Easy Time Logging',
    description: 'Record your work hours quickly and easily',
  },
  {
    icon: BarChart3,
    title: 'Daily/Weekly Summary',
    description: 'Track your logged hours at a glance',
  },
  {
    icon: Zap,
    title: 'Quick Entry from Recent',
    description: 'Tap to auto-fill from previous entries',
  },
];

/**
 * WelcomeScreen Component
 * Story 8.7: First-Time User Flow
 *
 * AC 1: Welcome screen with "Welcome to Timelog!" heading
 * AC 4: 3 feature cards with Clock, BarChart3, Zap icons
 * AC 2, 5: "Get Started" button and "Skip" link both complete onboarding
 */
export function WelcomeScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Focus on "Get Started" button on mount for accessibility
  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

  const handleComplete = async () => {
    setIsLoading(true);
    const result = await completeOnboarding();

    if (result.success) {
      router.push('/entry');
    } else {
      toast.error(result.error || 'Failed to complete onboarding');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-primary/5 to-background">
      {/* Logo/Branding */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-primary">Timelog</h1>
      </motion.div>

      {/* Welcome Message */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="text-2xl font-semibold text-center mb-2"
      >
        Welcome to Timelog!
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="text-muted-foreground text-center mb-8"
      >
        Time tracking for teams
      </motion.p>

      {/* Feature Cards */}
      <div className="w-full max-w-sm space-y-4 mb-8">
        {features.map((feature, index) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            index={index}
          />
        ))}
      </div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="w-full max-w-sm space-y-3"
      >
        <Button
          ref={buttonRef}
          onClick={handleComplete}
          className="w-full h-12 text-lg"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading...
            </>
          ) : (
            'Get Started'
          )}
        </Button>
        <Button
          variant="ghost"
          onClick={handleComplete}
          disabled={isLoading}
          className="w-full text-sm text-muted-foreground hover:text-foreground"
          aria-label="Skip onboarding and go to time entry"
        >
          Skip
        </Button>
      </motion.div>
    </div>
  );
}
