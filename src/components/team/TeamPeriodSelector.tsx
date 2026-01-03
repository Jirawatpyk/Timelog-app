// src/components/team/TeamPeriodSelector.tsx
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { TeamStatsPeriod } from '@/types/team';

interface TeamPeriodSelectorProps {
  period?: TeamStatsPeriod;
}

export function TeamPeriodSelector({ period = 'today' }: TeamPeriodSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePeriodChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', value);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Tabs value={period} onValueChange={handlePeriodChange}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="today">Today</TabsTrigger>
        <TabsTrigger value="week">This Week</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
