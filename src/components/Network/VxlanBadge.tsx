import { Webhook } from 'lucide-react';

export const VxlanBadge = ({ count }: { count: number }) => (
    <div className="flex items-center gap-1 bg-purple-900/40 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/30 text-[9px] font-bold animate-pulse">
        <Webhook size={10} />
        <span>VXLAN:{count}</span>
    </div>
);
