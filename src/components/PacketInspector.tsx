import { useMemo } from 'react';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { useNetworkStore } from '../store/useNetworkStore';
import type { PacketTraceAclHit } from '../types/NetworkTypes';

export function PacketInspectorPanel() {
  const packetTrace = useNetworkStore((state) => state.packetTrace);
  const devices = useNetworkStore((state) => state.devices);
  const cables = useNetworkStore((state) => state.cables);

  const aclHitRows = useMemo<{ text: string }[]>(() => {
    if (!packetTrace?.aclHits?.length) return [];
    return packetTrace.aclHits.map((hit: PacketTraceAclHit) => {
      const device = devices.find((d: any) => d.id === hit.deviceId);
      return {
        text: `${hit.label} on ${device?.hostname ?? device?.model ?? 'Device'} (${hit.count} times)`
      };
    });
  }, [packetTrace?.aclHits, devices]);

  const hopSegments = useMemo(() => {
    if (!packetTrace) return [];
    const segments: { from: string; to: string }[] = [];
    const path = Array.isArray(packetTrace.path) ? packetTrace.path : [];
    let current = packetTrace.srcDeviceId;

    for (const cableId of path) {
      const cable = cables.find((c: any) => c.id === cableId);
      if (!cable) continue;
      const forward = cable.sourceDeviceId === current;
      const next = forward ? cable.targetDeviceId : cable.sourceDeviceId;
      const fromDevice = devices.find((d: any) => d.id === current);
      const toDevice = devices.find((d: any) => d.id === next);
      const fromPortName = fromDevice?.ports.find((p: any) => p.id === (forward ? cable.sourcePortId : cable.targetPortId))?.name;
      const toPortName = toDevice?.ports.find((p: any) => p.id === (forward ? cable.targetPortId : cable.sourcePortId))?.name;
      const fromLabel = `${fromDevice?.hostname ?? fromDevice?.model ?? 'Device'}${fromPortName ? `:${fromPortName}` : ''}`;
      const toLabel = `${toDevice?.hostname ?? toDevice?.model ?? 'Device'}${toPortName ? `:${toPortName}` : ''}`;
      segments.push({ from: fromLabel, to: toLabel });
      current = next;
    }

    return segments;
  }, [packetTrace, devices, cables]);

  if (!packetTrace) {
    return (
      <div className="text-[10px] text-zinc-500">
        Run a ping or any flow to capture the packet trace and see it here.
      </div>
    );
  }

  const summaryLines: string[] = packetTrace.summary?.split(' | ').filter(Boolean) ?? [];
  const srcDevice = devices.find((d: any) => d.id === packetTrace.srcDeviceId);
  const dstDevice = packetTrace.dstDeviceId ? devices.find((d: any) => d.id === packetTrace.dstDeviceId) : undefined;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-zinc-500">
        <span>Packet Inspector</span>
        <span
          className={`text-[9px] px-2 py-0.5 rounded border ${packetTrace.reason ? 'border-red-500 bg-red-900/60 text-red-200' : 'border-emerald-500 bg-emerald-900/60 text-emerald-200'
            }`}
        >
          {packetTrace.reason ? 'Drop detected' : 'Flow'}
        </span>
      </div>

      <div className="text-sm font-semibold text-white leading-snug flex items-center gap-2">
        <span>{srcDevice?.hostname ?? 'Source device'}</span>
        <ArrowRight size={14} className="text-emerald-400" />
        <span>{dstDevice?.hostname ?? 'Destination'}</span>
      </div>
      <div className="text-[10px] text-zinc-400">
        {packetTrace.srcIp ? `${packetTrace.srcIp}` : 'Source IP unknown'} → {packetTrace.dstIp ? `${packetTrace.dstIp}` : 'Destination IP unknown'}
      </div>

      {packetTrace.reason && (
        <div className="text-[11px] text-red-200 bg-red-900/30 border border-red-600/40 rounded-xl px-3 py-2 flex items-start gap-2">
          <AlertTriangle size={16} />
          <span>{packetTrace.reason}</span>
        </div>
      )}

      <div className="rounded-2xl border border-zinc-800 bg-black/40 p-3 space-y-2">
        {hopSegments.length ? (
          hopSegments.map((hop, index) => (
            <div key={`${hop.from}-${hop.to}-${index}`} className="text-[10px] text-zinc-200">
              <div className="flex items-center gap-2 text-zinc-500">
                <span>Hop {index + 1}</span>
                <ArrowRight size={12} className="text-emerald-400" />
              </div>
              <div className="text-[11px] text-white">
                {hop.from} <span className="text-emerald-400">→</span> {hop.to}
              </div>
            </div>
          ))
        ) : (
          <div className="text-[10px] text-zinc-500">
            No valid path generated (likely blocked before crossing links).
          </div>
        )}
      </div>

      {summaryLines.length > 0 && (
        <div className="space-y-1 text-[10px] text-zinc-300">
          {summaryLines.map((line, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-white/30" />
              <span>{line}</span>
            </div>
          ))}
        </div>
      )}

      {aclHitRows.length > 0 && (
        <div className="space-y-1 text-[10px] text-zinc-300">
          <div className="text-[11px] text-zinc-400 uppercase tracking-[0.3em]">ACL Hits</div>
          {aclHitRows.map((row, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400/60" />
              <span>{row.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
