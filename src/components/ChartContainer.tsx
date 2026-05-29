'use client';

import { useEffect, useState, type ReactElement } from 'react';
import { ResponsiveContainer } from 'recharts';
import { cn } from '@/utils/cn';

interface ChartContainerProps {
  children: ReactElement;
  className?: string;
  heightClassName?: string;
}

export default function ChartContainer({
  children,
  className,
  heightClassName = 'h-[300px]',
}: ChartContainerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={cn('w-full min-w-0', heightClassName, className)}>
      {mounted ? (
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          {children}
        </ResponsiveContainer>
      ) : (
        <div className="h-full w-full animate-pulse rounded-2xl bg-surface-variant/50" />
      )}
    </div>
  );
}
