import { ReactNode } from 'react';

interface SidebarCardProps {
  children: ReactNode;
  className?: string;
}

export function SidebarCard({ children, className = '' }: SidebarCardProps) {
  return (
    <div
      className={`bg-gradient-to-br from-white/5 to-black/40 border border-white/10 rounded-2xl shadow-2xl shadow-black/70 p-4 space-y-3 transition hover:shadow-black/90 ${className}`}
    >
      {children}
    </div>
  );
}
