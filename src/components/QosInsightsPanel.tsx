import { useMemo } from 'react';
import { useNetworkStore } from '../store/useNetworkStore';

export function QosInsightsPanel() {
  const devices = useNetworkStore(state => state.devices);

  const latestEntry = useMemo(() => {
    const entries = devices.flatMap(device => (device.qosHistory || []).map(entry => ({
      entry,
      device
    })));
    if (!entries.length) return null;
    entries.sort((a, b) => b.entry.timestamp - a.entry.timestamp);
    return entries[0];
  }, [devices]);

  if (!latestEntry) {
    return (
      <div className="text-[10px] text-zinc-500">
        Nothing new in QoS: run `qos limit`/`qos shape` and generate traffic to see events here.
      </div>
    );
  }

  const { entry, device } = latestEntry;
  const time = new Date(entry.timestamp).toLocaleTimeString();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-zinc-500">
        <span>QoS Insights</span>
        <span className="text-[9px] text-zinc-400">{time}</span>
      </div>
      <div className="rounded-2xl border border-zinc-700 bg-black/30 p-3 space-y-1">
        <div className="text-[11px] text-white font-semibold">{device.hostname}</div>
        <div className="text-[10px] text-zinc-400">Port {entry.portName}</div>
        <div className="text-[11px] text-emerald-300 font-mono tracking-tight">{entry.note || 'No recent events'}</div>
      </div>
    </div>
  );
}
