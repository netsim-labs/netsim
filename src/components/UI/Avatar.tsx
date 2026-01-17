import React from 'react';
import { User } from 'lucide-react';
import { cn } from '../../utils/cn';

interface AvatarProps {
    src?: string;
    alt?: string;
    fallback?: React.ReactNode;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'cyan' | 'purple' | 'pink' | 'premium';
    status?: 'online' | 'offline' | 'busy' | 'away';
    className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
    src,
    alt,
    fallback,
    size = 'md',
    variant = 'cyan',
    status,
    className,
}) => {
    const sizes = {
        xs: 'w-6 h-6 text-[10px]',
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-lg',
    };

    const variants = {
        cyan: 'from-netsim-cyan to-blue-600',
        purple: 'from-netsim-purple to-indigo-600',
        pink: 'from-netsim-pink to-rose-600',
        premium: 'from-amber-400 via-yellow-500 to-amber-600',
    };

    const statusColors = {
        online: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
        offline: 'bg-zinc-500',
        busy: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]',
        away: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
    };

    const statusSizes = {
        xs: 'w-1.5 h-1.5 border border-black',
        sm: 'w-2 h-2 border-2 border-black',
        md: 'w-2.5 h-2.5 border-2 border-black',
        lg: 'w-3 h-3 border-2 border-black',
        xl: 'w-4 h-4 border-2 border-black',
    };

    return (
        <div className={cn('relative inline-flex flex-shrink-0', className)}>
            <div className={cn(
                'rounded-full flex items-center justify-center overflow-hidden border border-white/20 shadow-lg transition-transform duration-300 hover:scale-110',
                sizes[size],
                !src && cn('bg-gradient-to-tr text-white font-bold', variants[variant])
            )}>
                {src ? (
                    <img
                        src={src}
                        alt={alt || 'Avatar'}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    fallback || <User size={parseInt(sizes[size]) * 0.5} />
                )}
            </div>

            {status && (
                <div className={cn(
                    'absolute bottom-0 right-0 rounded-full',
                    statusColors[status],
                    statusSizes[size]
                )} />
            )}
        </div>
    );
};
