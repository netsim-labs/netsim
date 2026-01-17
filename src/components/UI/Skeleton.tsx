import { HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  variant = 'default',
  width,
  height,
  animation = 'pulse',
  className = '',
  ...props
}: SkeletonProps) {
  const baseClasses = 'bg-zinc-800/50';

  const variantClasses = {
    default: 'rounded-lg',
    circular: 'rounded-full',
    rectangular: 'rounded-none'
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-zinc-800/50 via-zinc-700/50 to-zinc-800/50 bg-[length:200%_100%]',
    none: ''
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      aria-hidden="true"
      {...props}
    />
  );
}

// Skeleton for catalog cards
export function CatalogItemSkeleton() {
  return (
    <div className="flex items-start gap-4 bg-[#14171a] border border-zinc-800/50 rounded-2xl px-4 py-3">
      <div className="flex-1 space-y-2">
        <Skeleton height={12} width="40%" />
        <Skeleton height={16} width="70%" />
        <Skeleton height={32} width="100%" />
        <div className="flex gap-1">
          <Skeleton height={20} width={60} className="rounded-full" />
          <Skeleton height={20} width={60} className="rounded-full" />
        </div>
      </div>
      <Skeleton variant="circular" width={40} height={40} />
    </div>
  );
}

// Skeleton for catalog list
export function CatalogListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading catalog">
      {Array.from({ length: count }).map((_, i) => (
        <CatalogItemSkeleton key={i} />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Skeleton for sidebar card
export function SidebarCardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="bg-gradient-to-br from-white/5 to-black/40 border border-white/10 rounded-2xl p-4 space-y-3">
      <Skeleton height={14} width="50%" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={12} width={`${80 - i * 10}%`} />
      ))}
    </div>
  );
}

// Skeleton for console panel
export function ConsoleSkeleton() {
  return (
    <div className="flex flex-col h-full bg-[#0b0c0d] p-4 space-y-2">
      <Skeleton height={24} width="40%" />
      <div className="flex-1 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} height={16} width={`${60 + (i * 5) % 40}%`} />
        ))}
      </div>
      <Skeleton height={40} width="100%" />
    </div>
  );
}

// Skeleton for labs
export function LabCardSkeleton() {
  return (
    <div className="bg-[#0e1322] border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="p-6 space-y-4">
        <div className="flex justify-between">
          <Skeleton variant="circular" width={48} height={48} />
          <Skeleton width={80} height={24} className="rounded-full" />
        </div>
        <Skeleton height={20} width="80%" />
        <Skeleton height={14} width="100%" />
        <Skeleton height={14} width="60%" />
        <div className="flex gap-2">
          <Skeleton width={60} height={20} className="rounded-md" />
          <Skeleton width={80} height={20} className="rounded-md" />
        </div>
      </div>
      <div className="p-4 bg-black/20 border-t border-zinc-800">
        <Skeleton height={40} width="100%" className="rounded-lg" />
      </div>
    </div>
  );
}

export function LabsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="status" aria-label="Loading labs">
      {Array.from({ length: count }).map((_, i) => (
        <LabCardSkeleton key={i} />
      ))}
      <span className="sr-only">Loading labs...</span>
    </div>
  );
}
