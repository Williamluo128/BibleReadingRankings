import React from 'react';
import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div
    className={clsx('animate-pulse bg-border-warm/70', className)}
    aria-hidden
  />
);

export const HomeStatsSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border-warm mb-20">
    <div className="col-span-2 md:row-span-2 bg-surface p-8 md:p-12 min-h-[200px]">
      <Skeleton className="h-16 w-32 mb-4" />
      <Skeleton className="h-3 w-20" />
    </div>
    {[0, 1, 2].map((i) => (
      <div key={i} className="bg-surface p-6 min-h-[100px]">
        <Skeleton className="h-10 w-16 mb-3" />
        <Skeleton className="h-3 w-14" />
      </div>
    ))}
  </div>
);

export const HomeActivitySkeleton: React.FC = () => (
  <div className="mb-20 space-y-0">
    {[0, 1, 2, 3].map((i) => (
      <div key={i} className="flex justify-between py-4 border-b border-border-warm">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-5 w-16" />
      </div>
    ))}
  </div>
);

export const AnalyticsSkeleton: React.FC = () => (
  <div className="space-y-20">
    <section>
      <Skeleton className="h-3 w-24 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col items-center">
            <Skeleton className="h-32 w-32 rounded-full" />
            <Skeleton className="h-3 w-20 mt-4" />
          </div>
        ))}
      </div>
    </section>
    <section>
      <Skeleton className="h-3 w-28 mb-8" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border-warm">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-surface p-6 min-h-[112px]">
            <Skeleton className="h-3 w-20 mb-4" />
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
    </section>
    <section>
      <Skeleton className="h-3 w-20 mb-8" />
      <Skeleton className="h-64 w-full border border-border-warm" />
    </section>
  </div>
);
