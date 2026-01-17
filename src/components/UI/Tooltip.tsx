import { useState, useRef, type ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface TooltipProps {
    content: ReactNode;
    children: ReactNode;
    side?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
    disabled?: boolean;
    className?: string;
}

const sideStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

export function Tooltip({
    content,
    children,
    side = 'top',
    delay = 200,
    disabled = false,
    className,
}: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const showTooltip = () => {
        if (disabled) return;
        timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
    };

    const hideTooltip = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsVisible(false);
    };

    return (
        <div
            className="relative inline-block"
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onFocus={showTooltip}
            onBlur={hideTooltip}
        >
            {children}
            {isVisible && content && (
                <div
                    role="tooltip"
                    className={cn(
                        'absolute z-50 px-3 py-1.5 text-xs text-zinc-200',
                        'bg-zinc-800/95 backdrop-blur-sm border border-white/10 rounded-lg',
                        'shadow-lg whitespace-nowrap animate-fade-in-scale pointer-events-none',
                        sideStyles[side],
                        className
                    )}
                >
                    {content}
                </div>
            )}
        </div>
    );
}
