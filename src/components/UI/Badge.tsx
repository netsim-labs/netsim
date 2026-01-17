import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'cyan' | 'purple' | 'pink';
    size?: 'sm' | 'md' | 'lg';
    glow?: boolean;
    dot?: boolean;
    children?: ReactNode;
}

const variantStyles = {
    default: 'bg-zinc-800/50 text-zinc-300 border-zinc-700/50',
    success: 'bg-green-500/10 text-green-400 border-green-500/30 shadow-[0_0_12px_rgba(34,197,94,0.15)]',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]',
    danger: 'bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.15)]',
    info: 'bg-netsim-cyan/10 text-netsim-cyan border-netsim-cyan/30 shadow-[0_0_12px_rgba(41,217,255,0.15)]',
    accent: 'bg-netsim-purple/10 text-netsim-purple border-netsim-purple/30 shadow-[0_0_12px_rgba(168,85,247,0.15)]',
    cyan: 'bg-netsim-cyan/10 text-netsim-cyan border-netsim-cyan/30 shadow-[0_0_12px_rgba(41,217,255,0.15)]',
    purple: 'bg-netsim-purple/10 text-netsim-purple border-netsim-purple/30 shadow-[0_0_12px_rgba(168,85,247,0.15)]',
    pink: 'bg-netsim-pink/10 text-netsim-pink border-netsim-pink/30 shadow-[0_0_12px_rgba(236,72,153,0.15)]',
};

const dotColors = {
    default: 'bg-zinc-400',
    success: 'bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.8)]',
    warning: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]',
    danger: 'bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.8)]',
    info: 'bg-netsim-cyan shadow-[0_0_8px_rgba(41,217,255,0.8)]',
    accent: 'bg-netsim-purple shadow-[0_0_8px_rgba(168,85,247,0.8)]',
    cyan: 'bg-netsim-cyan shadow-[0_0_8px_rgba(41,217,255,0.8)]',
    purple: 'bg-netsim-purple shadow-[0_0_8px_rgba(168,85,247,0.8)]',
    pink: 'bg-netsim-pink shadow-[0_0_8px_rgba(236,72,153,0.8)]',
};

const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1',
};

export function Badge({
    variant = 'default',
    size = 'md',
    glow = false,
    dot = false,
    children,
    className,
    ...props
}: BadgeProps & { variant?: keyof typeof variantStyles }) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 font-medium rounded-full border transition-all duration-300',
                variantStyles[variant as keyof typeof variantStyles],
                sizeStyles[size],
                glow && 'animate-neon-pulse',
                className
            )}
            {...props}
        >
            {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant as keyof typeof dotColors] || dotColors.default)} />}
            {children}
        </span>
    );
}
