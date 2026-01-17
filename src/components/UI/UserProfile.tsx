import { LogOut, Crown } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { Avatar } from './Avatar';
import { cn } from '../../utils/cn';

interface UserProfileProps {
  isCollapsed: boolean;
}

export function UserProfile({ isCollapsed }: UserProfileProps) {
  const { activeUser, role, logout } = useAuthStore();

  if (!activeUser) return null;

  return (
    <div className={cn(
      "border-t border-white/[0.08] bg-white/[0.02] backdrop-blur-md transition-all duration-300",
      isCollapsed ? "p-2" : "p-4"
    )}>
      <div className={cn(
        "flex items-center",
        isCollapsed ? "justify-center" : "justify-between gap-3"
      )}>

        {/* User Info Area */}
        <div className="flex items-center gap-3 overflow-hidden group/avatar">
          <Avatar
            size={isCollapsed ? "sm" : "sm"}
            variant={role === 'pro' ? 'premium' : 'cyan'}
            status="online"
            className="cursor-pointer"
          />

          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="text-sm font-bold text-zinc-100 truncate pr-2 group-hover/avatar:text-netsim-cyan transition-colors" title={activeUser.email}>
                {activeUser.name || 'Guest User'}
              </span>
              <div className="flex items-center gap-1.5">
                {role === 'pro' ? (
                  <span className="inline-flex items-center gap-1 text-[9px] font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 uppercase tracking-tighter">
                    <Crown size={9} className="text-amber-400 fill-amber-400" />
                    PRO MEMBER
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                    Free Tier
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        {!isCollapsed && (
          <button
            onClick={() => logout()}
            className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all duration-300"
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
