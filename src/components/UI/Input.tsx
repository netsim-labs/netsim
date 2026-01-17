import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    variant?: 'default' | 'error' | 'success' | 'cyan' | 'purple' | 'pink';
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    label?: string;
    error?: string;
    hint?: string;
    size?: 'sm' | 'md' | 'lg';
}

const variantStyles = {
    default: 'focus:border-netsim-cyan/50 focus:shadow-[0_0_20px_rgba(41,217,255,0.1)]',
    cyan: 'focus:border-netsim-cyan/50 focus:shadow-[0_0_20px_rgba(41,217,255,0.1)]',
    purple: 'focus:border-netsim-purple/50 focus:shadow-[0_0_20px_rgba(168,85,247,0.1)]',
    pink: 'focus:border-netsim-pink/50 focus:shadow-[0_0_20px_rgba(236,72,153,0.1)]',
    error: 'border-red-500/50 focus:border-red-500 focus:shadow-[0_0_20px_rgba(239,68,68,0.2)]',
    success: 'border-green-500/50 focus:border-green-500 focus:shadow-[0_0_20px_rgba(34,197,94,0.2)]',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            variant = 'default',
            leftIcon,
            rightIcon,
            label,
            error,
            hint,
            className,
            id,
            size,
            ...props
        },
        ref
    ) => {
        const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-zinc-300 mb-1.5 ml-1"
                    >
                        {label}
                    </label>
                )}
                <div className="relative group">
                    {leftIcon && (
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-netsim-cyan">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={cn(
                            'glass-input w-full transition-all duration-300',
                            'placeholder:text-zinc-600',
                            'focus:outline-none focus:bg-white/[0.08]',
                            size === 'sm' ? 'px-3 py-2 text-[11px]' :
                                size === 'lg' ? 'px-5 py-4 text-base' :
                                    'px-4 py-3 text-sm',
                            leftIcon && (size === 'sm' ? 'pl-9' : size === 'lg' ? 'pl-14' : 'pl-11'),
                            rightIcon && (size === 'sm' ? 'pr-9' : size === 'lg' ? 'pr-14' : 'pr-11'),
                            variantStyles[error ? 'error' : variant],
                            className
                        )}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-netsim-cyan">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {(error || hint) && (
                    <p className={cn('mt-1.5 text-xs ml-1', error ? 'text-red-400' : 'text-zinc-500')}>
                        {error || hint}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
