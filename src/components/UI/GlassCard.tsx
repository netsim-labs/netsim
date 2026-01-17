
import React from 'react';
import { cn } from '../../utils/cn';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'interactive' | 'neon' | 'glass-panel' | 'glass-panel-dark' | 'none';
    glow?: boolean;
    glowColor?: 'cyan' | 'purple' | 'pink';
    children: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({
    variant = 'default',
    glow = false,
    glowColor = 'cyan',
    className,
    children,
    ...props
}) => {

    const variants = {
        default: 'glass-card',
        elevated: 'glass-card shadow-2xl bg-white/5',
        interactive: 'glass-card hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 cursor-pointer active:scale-[0.98]',
        neon: 'glass-card border-netsim-cyan/30 shadow-[0_0_20px_rgba(41,217,255,0.1)]',
        'glass-panel': 'glass-panel',
        'glass-panel-dark': 'glass-panel-dark',
        none: ''
    };

    const glowStyles = {
        cyan: 'shadow-[0_0_30px_rgba(41,217,255,0.2)] border-netsim-cyan/30',
        purple: 'shadow-[0_0_30px_rgba(168,85,247,0.2)] border-netsim-purple/30',
        pink: 'shadow-[0_0_30px_rgba(236,72,153,0.2)] border-netsim-pink/30',
    };

    return (
        <div
            className={cn(
                'rounded-2xl transition-all duration-500',
                variants[variant],
                glow && glowStyles[glowColor],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};
