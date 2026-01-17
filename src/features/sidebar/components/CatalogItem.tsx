import { Plus } from 'lucide-react';
import type { DeviceModelMeta } from '../../../data/deviceCatalog';

interface CatalogItemProps {
  model: DeviceModelMeta;
  onSelect: () => void;
  disabled?: boolean;
}

export function CatalogItem({ model, onSelect, disabled }: CatalogItemProps) {
  const portBadges: string[] = [];
  if (model.ports?.ge) portBadges.push(`${model.ports.ge}x GE`);
  if (model.ports?.xge) portBadges.push(`${model.ports.xge}x XGE`);
  if (model.power) portBadges.push(model.power);

  return (
    <button
      onClick={disabled ? undefined : onSelect}
      disabled={disabled}
      aria-label={`Add ${model.displayName}`}
      aria-describedby={`catalog-${model.model}-desc`}
      aria-disabled={disabled}
      className={`w-full flex items-start gap-4 bg-[#14171a] border rounded-2xl px-4 py-3 transition ${disabled
          ? 'border-zinc-900 opacity-60 cursor-not-allowed'
          : 'border-white/10 hover:border-blue-500 hover:-translate-y-[1px] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0c0d]'
        }`}
    >
      <div className="flex-1 space-y-1 text-left">
        <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-zinc-400">
          <span>{model.category}</span>
          <span className="font-mono text-[9px] text-zinc-500">{model.model}</span>
        </div>
        <div className="text-sm font-semibold text-white">{model.displayName}</div>
        <p id={`catalog-${model.model}-desc`} className="text-[11px] text-zinc-300 leading-snug">
          {model.description}
        </p>
        <div className="flex flex-wrap gap-1">
          {portBadges.map(badge => (
            <span key={badge} className="text-[9px] text-zinc-200 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
              {badge}
            </span>
          ))}
          {(model.features || []).map(feature => (
            <span key={feature} className="text-[9px] text-emerald-200 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              {feature}
            </span>
          ))}
        </div>
      </div>
      <div
        className={`h-10 w-10 rounded-2xl border flex items-center justify-center ${disabled
            ? 'border-zinc-700 text-zinc-600'
            : 'border-emerald-400 text-emerald-200 hover:bg-emerald-500/20'
          }`}
        aria-hidden="true"
      >
        <Plus size={18} />
      </div>
    </button>
  );
}
