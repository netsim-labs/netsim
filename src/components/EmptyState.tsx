import { ReactNode } from 'react';
import { Network, Beaker, FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      {/* Icon */}
      <div className="inline-flex items-center justify-center w-20 h-20 bg-zinc-800/50 border border-zinc-700 rounded-2xl mb-6">
        {icon || <FolderOpen size={32} className="text-zinc-500" />}
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>

      {/* Description */}
      <p className="text-sm text-zinc-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action && (
            <button
              onClick={action.onClick}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 ${action.variant === 'secondary'
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
            >
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="text-sm text-zinc-400 hover:text-white underline underline-offset-4 transition-colors"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Preset empty states for common scenarios
export function EmptyTopology({ onAddDevice, onLoadPreset }: {
  onAddDevice: () => void;
  onLoadPreset: () => void;
}) {
  return (
    <EmptyState
      icon={<Network size={32} className="text-blue-400" />}
      title="Your canvas is empty"
      description="Drag devices from the sidebar or load a predefined topology to start designing your network."
      action={{
        label: 'Add Switch',
        onClick: onAddDevice
      }}
      secondaryAction={{
        label: 'View presets',
        onClick: onLoadPreset
      }}
    />
  );
}

export function EmptyLabs({ onRefresh }: { onRefresh: () => void }) {
  return (
    <EmptyState
      icon={<Beaker size={32} className="text-purple-400" />}
      title="Loading labs..."
      description="Preparing the learning environment. If this takes too long, try refreshing."
      action={{
        label: 'Refresh',
        onClick: onRefresh,
        variant: 'secondary'
      }}
    />
  );
}

export function EmptySnapshots({ onCreate }: { onCreate: () => void }) {
  return (
    <EmptyState
      icon={<FolderOpen size={32} className="text-emerald-400" />}
      title="No snapshots found"
      description="Snapshots allow you to save and restore the state of your topology."
      action={{
        label: 'Create snapshot',
        onClick: onCreate
      }}
    />
  );
}

export function EmptySearch({ query }: { query: string }) {
  return (
    <EmptyState
      icon={<Network size={32} className="text-zinc-500" />}
      title="No results"
      description={`No devices found matching "${query}".`}
    />
  );
}

export function EmptyAlarms() {
  return (
    <div className="text-center py-6">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-3">
        <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p className="text-sm text-zinc-400">No active alarms</p>
      <p className="text-xs text-zinc-600 mt-1">Everything working correctly</p>
    </div>
  );
}
