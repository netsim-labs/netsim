import { createContext, useContext, useState, type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface TabsContextType {
    activeTab: string;
    setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

function useTabsContext() {
    const context = useContext(TabsContext);
    if (!context) throw new Error('Tabs components must be used within a Tabs provider');
    return context;
}

export interface TabsProps {
    defaultValue: string;
    value?: string;
    onChange?: (value: string) => void;
    children: ReactNode;
    className?: string;
}

export function Tabs({ defaultValue, value, onChange, children, className }: TabsProps) {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const activeTab = value ?? internalValue;

    const setActiveTab = (id: string) => {
        if (!value) setInternalValue(id);
        onChange?.(id);
    };

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            <div className={className}>{children}</div>
        </TabsContext.Provider>
    );
}

interface TabListProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export function TabList({ children, className, ...props }: TabListProps) {
    return (
        <div
            role="tablist"
            className={cn('flex gap-1 p-1 bg-black/40 backdrop-blur-md rounded-xl border border-white/10', className)}
            {...props}
        >
            {children}
        </div>
    );
}

interface TabProps extends HTMLAttributes<HTMLButtonElement> {
    value: string;
    children: ReactNode;
    disabled?: boolean;
    variant?: 'cyan' | 'purple' | 'pink';
}

export function Tab({ value, children, className, disabled, variant = 'cyan', ...props }: TabProps) {
    const { activeTab, setActiveTab } = useTabsContext();
    const isActive = activeTab === value;

    const activeStyles = {
        cyan: 'bg-netsim-cyan/20 text-netsim-cyan border-netsim-cyan/30 shadow-[0_0_15px_rgba(41,217,255,0.1)]',
        purple: 'bg-netsim-purple/20 text-netsim-purple border-netsim-purple/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]',
        pink: 'bg-netsim-pink/20 text-netsim-pink border-netsim-pink/30 shadow-[0_0_15px_rgba(236,72,153,0.1)]',
    };

    return (
        <button
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            disabled={disabled}
            onClick={() => setActiveTab(value)}
            className={cn(
                'flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300',
                'focus:outline-none',
                isActive
                    ? cn('border', activeStyles[variant])
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5',
                disabled && 'opacity-50 cursor-not-allowed',
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}

interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
    value: string;
    children: ReactNode;
}

export function TabPanel({ value, children, className, ...props }: TabPanelProps) {
    const { activeTab } = useTabsContext();
    if (activeTab !== value) return null;

    return (
        <div
            role="tabpanel"
            tabIndex={0}
            className={cn('mt-4 focus:outline-none animate-fade-in', className)}
            {...props}
        >
            {children}
        </div>
    );
}
