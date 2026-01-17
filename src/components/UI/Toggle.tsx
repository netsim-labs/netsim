import React from 'react';
import { cn } from '../../utils/cn';

interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    variant?: 'cyan' | 'purple' | 'pink';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
    checked,
    onChange,
    label,
    variant = 'cyan',
    size = 'md',
    disabled = false,
    className,
}) => {
    const variants = {
        cyan: 'bg-netsim-cyan shadow-[0_0_10px_rgba(41,217,255,0.4)]',
        purple: 'bg-netsim-purple shadow-[0_0_10px_rgba(168,85,247,0.4)]',
        pink: 'bg-netsim-pink shadow-[0_0_10px_rgba(236,72,153,0.4)]',
    };

    const sizes = {
        sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
        md: { track: 'w-10 h-5', thumb: 'w-4 h-4', translate: 'translate-x-5' },
        lg: { track: 'w-14 h-7', thumb: 'w-6 h-6', translate: 'translate-x-7' },
    };

    return (
        <label className={cn(
            'flex items-center gap-3 cursor-pointer group',
            disabled && 'opacity-50 cursor-not-allowed',
            className
        )}>
            {label && (
                <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
                    {label}
                </span>
            )}
            <div
                className="relative inline-flex items-center"
                onClick={() => !disabled && onChange(!checked)}
            >
                <div className={cn(
                    'rounded-full transition-all duration-300 border border-white/10 backdrop-blur-md',
                    sizes[size].track,
                    checked ? variants[variant] : 'bg-white/5 group-hover:bg-white/10'
                )} />
                <div className={cn(
                    'absolute left-0.5 bg-white rounded-full transition-all duration-300 shadow-lg',
                    sizes[size].thumb,
                    checked ? sizes[size].translate : 'translate-x-0'
                )} />
            </div>
        </label>
    );
};
