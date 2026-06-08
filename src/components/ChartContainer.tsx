'use client';

import { useEffect, useState, type ReactElement } from 'react';
import { ChartContainer as ShadcnChartContainer } from '@/components/ui/chart';
import { cn } from '@/utils/cn';

interface ChartContainerProps {
  children: ReactElement;
  className?: string;
  heightClassName?: string;
  config?: Record<string, { label?: string; icon?: any; color?: string }>;
}

export default function ChartContainer({
  children,
  className,
  heightClassName = 'h-[300px]',
  config = {},
}: ChartContainerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn('w-full min-w-0', heightClassName, className)}>
        <div className="h-full w-full animate-pulse rounded-2xl bg-surface-variant/50" />
      </div>
    );
  }

  return (
    <div className={cn('w-full min-w-0', heightClassName, className)}>
      <ShadcnChartContainer config={config} className="h-full w-full">
        {children}
      </ShadcnChartContainer>
    </div>
  );
}
