import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useUiStore } from '../store/useUiStore';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { cn } from '../utils/cn';

const typeStyles = {
  success: {
    bg: 'bg-green-500/10 border-green-500/40',
    icon: 'text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]',
    shadow: 'shadow-[0_0_30px_rgba(34,197,94,0.25),0_4px_20px_rgba(0,0,0,0.3)]',
  },
  error: {
    bg: 'bg-red-500/10 border-red-500/40',
    icon: 'text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]',
    shadow: 'shadow-[0_0_30px_rgba(239,68,68,0.25),0_4px_20px_rgba(0,0,0,0.3)]',
  },
  info: {
    bg: 'bg-blue-500/10 border-blue-500/40',
    icon: 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]',
    shadow: 'shadow-[0_0_30px_rgba(59,130,246,0.25),0_4px_20px_rgba(0,0,0,0.3)]',
  },
};

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

interface ToastItemProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: (id: string) => void;
}

function ToastItem({ id, message, type, onClose }: ToastItemProps) {
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const styles = typeStyles[type];
  const Icon = icons[type];

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    timerRef.current = setTimeout(() => onClose(id), 5000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [id, onClose]);

  return (
    <div
      role="alert"
      className={cn(
        'flex items-center gap-3 px-4 py-3',
        'backdrop-blur-xl border rounded-xl',
        'animate-slide-in-right',
        styles.bg,
        styles.shadow
      )}
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0', styles.icon)} />
      <p className="flex-1 text-sm font-medium text-white">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

/**
 * Global Notification System (Toasts) - Pure Tailwind implementation.
 * Supports multiple concurrent notifications with premium styling.
 */
export function Toasts() {
  const { toasts, removeToast } = useUiStore();

  if (toasts.length === 0) return null;

  return createPortal(
    <div
      className={cn(
        'fixed top-6 right-6 z-[5000]',
        'w-[calc(100%-48px)] sm:w-80',
        'flex flex-col gap-3',
        'pointer-events-none'
      )}
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem
            id={t.id}
            message={t.message}
            type={t.type}
            onClose={removeToast}
          />
        </div>
      ))}
    </div>,
    document.body
  );
}
