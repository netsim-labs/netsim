import React from 'react';
import { cn } from '../../utils/cn';

interface ProgressProps {
    value: number;
    max?: number;
    variant?: 'cyan' | 'purple' | 'pink' | 'success' | 'warning' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    showValue?: boolean;
    className?: string;
    animated?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({
    value,
    max = 100,
    variant = 'cyan',
    size = 'md',
    showValue = false,
    className,
    animated = true,
}) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const variants = {
        cyan: 'bg-netsim-cyan shadow-[0_0_10px_rgba(41,217,255,0.5)]',
        purple: 'bg-netsim-purple shadow-[0_0_10px_rgba(168,85,247,0.5)]',
        pink: 'bg-netsim-pink shadow-[0_0_10px_rgba(236,72,153,0.5)]',
        success: 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]',
        warning: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]',
        danger: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]',
    };

    const sizes = {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-4',
    };

    return (
        <div className={cn('w-full', className)}>
            {showValue && (
                <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-xs font-semibold text-zinc-400">Progress</span>
                    <span className="text-xs font-bold text-white">{Math.round(percentage)}%</span>
                </div>
            )}
            <div className={cn(
                'w-full bg-white/[0.05] rounded-full overflow-hidden border border-white/[0.05] backdrop-blur-sm',
                sizes[size]
            )}>
                <div
                    className={cn(
                        'h-full rounded-full transition-all duration-500 ease-out relative',
                        variants[variant],
                        animated && 'after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:animate-shimmer after:translate-x-[-100%]'
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};
