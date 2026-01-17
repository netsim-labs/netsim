import { createContext, useContext, useState, useRef, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { ChevronDown } from 'lucide-react';

interface AccordionContextType {
    openItems: Set<string>;
    toggleItem: (id: string) => void;
    multiple: boolean;
}

const AccordionContext = createContext<AccordionContextType | null>(null);

function useAccordionContext() {
    const context = useContext(AccordionContext);
    if (!context) throw new Error('AccordionItem must be used within an Accordion');
    return context;
}

export interface AccordionProps {
    children: ReactNode;
    multiple?: boolean;
    defaultOpen?: string[];
    className?: string;
    onChange?: (openItems: string[]) => void;
}

export function Accordion({ children, multiple = false, defaultOpen = [], className, onChange }: AccordionProps) {
    const [openItems, setOpenItems] = useState<Set<string>>(new Set(defaultOpen));

    const toggleItem = (id: string) => {
        setOpenItems((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                if (!multiple) next.clear();
                next.add(id);
            }
            if (onChange) onChange(Array.from(next));
            return next;
        });
    };

    return (
        <AccordionContext.Provider value={{ openItems, toggleItem, multiple }}>
            <div className={cn('space-y-2', className)}>{children}</div>
        </AccordionContext.Provider>
    );
}

interface AccordionItemProps {
    id: string;
    title: ReactNode;
    children: ReactNode;
    icon?: ReactNode;
    disabled?: boolean;
    className?: string;
}

export function AccordionItem({ id, title, children, icon, disabled = false, className }: AccordionItemProps) {
    const { openItems, toggleItem } = useAccordionContext();
    const contentRef = useRef<HTMLDivElement>(null);
    const isOpen = openItems.has(id);

    return (
        <div
            className={cn(
                'rounded-xl overflow-hidden border border-white/5 bg-black/20 transition-colors',
                isOpen && 'border-accent-500/20 bg-accent-500/5',
                className
            )}
        >
            <button
                type="button"
                onClick={() => !disabled && toggleItem(id)}
                aria-expanded={isOpen}
                disabled={disabled}
                className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium transition-colors',
                    isOpen ? 'text-white' : 'text-zinc-300',
                    'hover:text-white hover:bg-white/5',
                    disabled && 'opacity-50 cursor-not-allowed'
                )}
            >
                {icon && <span className="text-accent-400 flex-shrink-0">{icon}</span>}
                <span className="flex-1">{title}</span>
                <ChevronDown className={cn('w-4 h-4 text-zinc-500 transition-transform duration-200', isOpen && 'rotate-180 text-accent-400')} />
            </button>
            <div
                ref={contentRef}
                className={cn('overflow-hidden transition-all duration-200 ease-out', isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0')}
            >
                <div className="px-4 pb-4 pt-1 text-sm text-zinc-400">{children}</div>
            </div>
        </div>
    );
}
