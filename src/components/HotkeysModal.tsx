import { useEffect, useState } from 'react';
import { Modal } from './UI/Modal';
import { Keyboard, X } from 'lucide-react';
import { cn } from '../utils/cn';

interface HotkeysModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HotkeyGroup {
  title: string;
  shortcuts: {
    keys: string[];
    description: string;
  }[];
}

const hotkeyGroups: HotkeyGroup[] = [
  {
    title: 'General',
    shortcuts: [
      { keys: ['Ctrl', 'K'], description: 'Open Command Palette' },
      { keys: ['Ctrl', '?'], description: 'Show keyboard shortcuts' },
      { keys: ['Ctrl', 'Shift', 'S'], description: 'Quick add switch' },
      { keys: ['Escape'], description: 'Close active panel' },
    ],
  },
  {
    title: 'Canvas Navigation',
    shortcuts: [
      { keys: ['Ctrl', '0'], description: 'Fit View' },
      { keys: ['Ctrl', '+'], description: 'Zoom in' },
      { keys: ['Ctrl', '-'], description: 'Zoom out' },
      { keys: ['Click + Drag'], description: 'Pan Canvas' },
    ],
  },
  {
    title: 'Devices',
    shortcuts: [
      { keys: ['Double click'], description: 'Open CLI console' },
      { keys: ['Click on port'], description: 'Select port' },
      { keys: ['Drag port'], description: 'Create connection' },
    ],
  },
  {
    title: 'CLI Console',
    shortcuts: [
      { keys: ['Tab'], description: 'Autocomplete command' },
      { keys: ['↑', '↓'], description: 'Command history' },
      { keys: ['Ctrl', 'K'], description: 'Close console' },
      { keys: ['Enter'], description: 'Execute command' },
    ],
  },
];

function Kbd({ children }: { children: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center',
        'min-w-[24px] h-5 px-1.5',
        'text-[10px] font-bold font-mono',
        'bg-black/40 border border-white/10',
        'rounded text-zinc-300'
      )}
    >
      {children}
    </kbd>
  );
}

/**
 * Modern Hotkeys help modal - Pure Tailwind implementation.
 */
export function HotkeysModal({ isOpen, onClose }: HotkeysModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" showCloseButton={false}>
      {/* Header */}
      <div className="flex items-center justify-between -mx-6 -mt-4 px-6 py-4 bg-white/[0.02] border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-accent-500/10 border border-accent-500/20 rounded-xl">
            <Keyboard className="w-6 h-6 text-accent-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Keyboard Shortcuts</h2>
            <p className="text-xs text-zinc-500">
              Master NetSim with quick commands
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
        {hotkeyGroups.map((group) => (
          <div key={group.title}>
            <h3 className="text-xs font-bold uppercase tracking-widest text-accent-400 mb-3">
              {group.title}
            </h3>
            <div className="space-y-2">
              {group.shortcuts.map((sh, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex items-center justify-between gap-4',
                    'px-3 py-2 rounded-lg',
                    'bg-white/[0.03] border border-white/[0.03]'
                  )}
                >
                  <span className="text-xs font-medium text-zinc-400">
                    {sh.description}
                  </span>
                  <div className="flex items-center gap-1">
                    {sh.keys.map((k, j) => (
                      <span key={j} className="flex items-center">
                        <Kbd>{k}</Kbd>
                        {j < sh.keys.length - 1 && (
                          <span className="mx-1 text-zinc-600 text-[10px]">+</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="-mx-6 -mb-4 mt-6 px-6 py-3 bg-black/20 border-t border-white/5 text-center">
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
          Press{' '}
          <span className="font-bold text-accent-400">CTRL + ?</span> to see
          this help at any time
        </p>
      </div>
    </Modal>
  );
}

/**
 * Hook to manage Hotkeys Modal state and global listener.
 */
export function useHotkeysModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '?') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
}
