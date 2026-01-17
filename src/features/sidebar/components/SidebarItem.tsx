import { ReactNode } from 'react';
import { Plus } from 'lucide-react';

interface SidebarItemProps {
  label: string;
  sub: string;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function SidebarItem({ label, sub, icon, onClick, disabled }: SidebarItemProps) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={`${label}: ${sub}`}
      aria-disabled={disabled}
      className={`w-full flex justify-between items-center bg-[#15171a] p-4 rounded-xl border ${
        disabled
          ? 'border-zinc-900 opacity-50 cursor-not-allowed'
          : 'border-zinc-800 hover:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0c0d]'
      } transition-all group shadow-lg`}
    >
      <div className="text-left">
        <div className="text-xs font-black text-zinc-100 uppercase tracking-tighter">{label}</div>
        <div className="text-[9px] text-zinc-500 font-mono">{sub}</div>
      </div>
      <div className="p-1.5 bg-zinc-800 rounded-lg group-hover:bg-blue-600 transition-colors flex items-center justify-center">
        {icon ?? <Plus size={14} />}
      </div>
    </button>
  );
}
