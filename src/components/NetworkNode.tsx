import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Trash2, Terminal, Monitor } from 'lucide-react';
import { useNetworkStore } from '../store/useNetworkStore';
import { OspfBadge } from './Network/OspfBadge';
import { cn } from '../utils/cn';
import { Tooltip } from './UI/Tooltip';
import { Badge } from './UI/Badge';
import { Button } from './shadcn-ui/button';

type PortBlockProps = {
  label: string;
  columns: number;
  ports: any[];
  deviceId: string;
  onPortClick: (d: string, p: string) => void;
  selectedPort: any;
  isSfp?: boolean;
};

type PortItemProps = {
  p: any;
  deviceId: string;
  onPortClick: (d: string, p: string) => void;
  isSelected: boolean;
  isSfp?: boolean;
};

/**
 * NetworkNode: Custom React Flow node representing physical network hardware.
 * Pure Tailwind implementation - No MUI dependencies.
 */
export const NetworkNode = memo(function NetworkNode({ data }: { data: any }) {
  const { onPortClick, openConsole, removeDevice, selectedPort } = useNetworkStore();

  const isRouter = data.model?.includes('Router') || data.model?.includes('ISR') || data.vendor === 'Router';
  const isPC = data.vendor === 'PC' || data.model === 'PC';
  const is24SfpOnly = data.model === 'NS-Switch-L3-24SFP';
  const isSwitch = !isRouter && !isPC;

  const ports = data?.ports || [];
  const hasAlarm = ports.some((p: any) => p?.loopDetected || p?.status === 'down');
  const needsPoE = data?.model === 'AP-POE' || data?.model === 'PHONE-VOIP';
  const powerOk = !needsPoE || ports.some((p: any) => p?.poePowered);

  const rj45Ports = ports.filter((p: any) => p?.type === 'RJ45');
  const sfpPorts = ports.filter((p: any) => p?.type === 'SFP');
  const wanPorts = ports.filter((p: any) => p?.name?.startsWith('WAN'));
  const lanPorts = ports.filter((p: any) => p?.name?.startsWith('LAN'));

  const geBlocks = isSwitch && !is24SfpOnly
    ? Array.from({ length: Math.ceil((rj45Ports?.length || 0) / 12) }, (_, i) => ({
      label: `GE Stack ${i * 12 + 1}-${Math.min((i + 1) * 12, rj45Ports.length)}`,
      ports: rj45Ports.slice(i * 12, (i + 1) * 12)
    }))
    : [];

  const sfpBlocks = is24SfpOnly
    ? [0, 12].map((start) => ({
      label: `XGE0/0/${start + 1}-${start + 12}`,
      ports: sfpPorts.slice(start, start + 12)
    }))
    : [];

  const modelLabel = isRouter ? 'Layer 3 Router' : isPC ? 'Host Node' : 'Layer 3 Switch';
  const nodeWidth = (isPC ? 280 : isRouter ? 560 : is24SfpOnly ? 820 : (geBlocks.length > 2 ? 880 : 640));

  return (
    <div
      style={{ width: nodeWidth }}
      className={cn(
        'relative rounded-[1.5rem] overflow-hidden group',
        'glass-panel-dark border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)]',
        'transition-all duration-500 ease-out',
        'hover:shadow-[0_50px_120px_rgba(0,0,0,0.9),0_0_50px_rgba(41,217,255,0.05)]',
        'hover:scale-[1.01]',
        data.selected && 'ring-2 ring-netsim-cyan shadow-neon-cyan/20 scale-[1.02]'
      )}
    >
      {/* Top Accent Line */}
      <div className={cn(
        "h-1 w-full bg-gradient-to-r transition-all duration-500 group-hover:opacity-100 opacity-70",
        isRouter ? "from-netsim-purple via-netsim-pink to-netsim-purple" : "from-netsim-cyan via-blue-400 to-netsim-cyan"
      )} />

      {/* Front Panel Header */}
      <div className="drag-handle px-6 py-4 flex items-center justify-between border-b border-white/5 bg-gradient-to-b from-white/[0.08] to-transparent cursor-move">
        <div className="flex items-center gap-6">
          <div className="relative group/logo">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg relative z-10",
              isRouter ? "bg-netsim-purple/20 border border-netsim-purple/30 text-netsim-purple" : "bg-netsim-cyan/20 border border-netsim-cyan/30 text-netsim-cyan"
            )}>
              <span className="text-[12px] font-black uppercase tracking-tighter">NS</span>
            </div>
            <div className="absolute inset-0 bg-netsim-cyan/20 blur-xl opacity-0 group-hover/logo:opacity-100 transition-opacity" />
          </div>

          <div className="h-8 w-px bg-white/5" />

          <div className="flex flex-col">
            <h3 className="text-white font-black text-sm tracking-tight leading-none group-hover:text-netsim-cyan transition-colors">
              {(data?.hostname || 'anonymous').toUpperCase()}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">{modelLabel}</span>
              <Badge variant={isRouter ? 'purple' : 'cyan'} className="text-[8px] h-4 px-1.5 font-black uppercase">
                {data.model}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasAlarm && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full animate-pulse">
              <div className="w-1.5 h-1.5 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              <span className="text-[8px] font-black text-rose-400 uppercase tracking-tighter">Alarm</span>
            </div>
          )}

          {needsPoE && (
            <Badge variant={powerOk ? 'success' : 'danger'} dot className="text-[9px] font-black">PoE</Badge>
          )}

          <div className="flex gap-1.5 ml-2">
            <Tooltip content="CLI Terminal">
              <Button
                variant="glass"
                size="icon"
                className="w-8 h-8 rounded-xl"
                onClick={(e) => { e.stopPropagation(); openConsole(data.id); }}
              >
                <Terminal size={14} className="group-hover:text-netsim-cyan transition-colors" />
              </Button>
            </Tooltip>
            <Tooltip content="Decommission Device">
              <Button
                variant="destructive"
                size="icon"
                className="w-8 h-8 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border-none"
                onClick={(e) => { e.stopPropagation(); removeDevice(data.id); }}
              >
                <Trash2 size={14} />
              </Button>
            </Tooltip>
          </div>
          {data.ospfEnabled && <OspfBadge />}
        </div>
      </div>

      {/* Internal Chassis Area */}
      <div className="p-6 flex gap-10 bg-gradient-to-br from-[#0c0d10] to-[#08090b] relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] pointer-events-none" />

        {/* Hardware Status LEDs */}
        <div className="flex flex-col gap-3 pt-3">
          {[['PWR', true], ['SYS', true], ['STAT', false], ['ALM', hasAlarm]].map(([led, active]) => (
            <div key={led as string} className="flex flex-col items-center gap-1 group/led">
              <div className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                active
                  ? led === 'ALM'
                    ? 'bg-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]'
                    : 'bg-emerald-500 shadow-[0_0_12px_rgba(52,211,153,0.8)]'
                  : 'bg-zinc-900 border border-white/5'
              )} />
              <span className="text-[7px] font-black text-zinc-700 font-mono group-hover/led:text-zinc-500 transition-colors uppercase">{led}</span>
            </div>
          ))}
        </div>

        {/* Port Matrix */}
        <div className="flex-1 relative">
          {isSwitch && !is24SfpOnly && (
            <div className="flex gap-6">
              <div className="flex-1 p-5 rounded-[1.5rem] bg-black/20 border border-white/5 relative overflow-hidden group/stack">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                <span className="text-[10px] font-black text-zinc-600 tracking-[0.2em] block mb-5 uppercase group-hover/stack:text-netsim-cyan transition-colors">Gigabit Access Fabric</span>
                <div className="grid grid-cols-2 gap-5">
                  {geBlocks.map((block) => (
                    <PortBlock
                      key={block.label}
                      label={block.label}
                      columns={6}
                      ports={block.ports}
                      deviceId={data.id}
                      onPortClick={onPortClick}
                      selectedPort={selectedPort}
                    />
                  ))}
                </div>
              </div>

              <div className="w-44 p-5 rounded-[1.5rem] bg-netsim-cyan/5 border border-netsim-cyan/20 relative group/uplink">
                <span className="text-[10px] font-black text-netsim-cyan tracking-[0.2em] block mb-5 uppercase opacity-60 group-hover/uplink:opacity-100 transition-opacity">10G Uplink</span>
                <PortBlock
                  label="XGE Fibra"
                  columns={2}
                  ports={sfpPorts}
                  isSfp
                  deviceId={data.id}
                  onPortClick={onPortClick}
                  selectedPort={selectedPort}
                />
                <div className="absolute inset-0 bg-netsim-cyan/5 opacity-0 group-hover/uplink:opacity-100 transition-opacity blur-2xl" />
              </div>
            </div>
          )}

          {is24SfpOnly && (
            <div className="p-6 rounded-[2rem] bg-netsim-purple/5 border border-netsim-purple/20">
              <span className="text-[11px] font-black text-netsim-purple tracking-[0.3em] uppercase block mb-6">Core Fabric / 24x10G SFP+ Platinum</span>
              <div className="flex flex-col gap-5">
                {sfpBlocks.map(block => (
                  <PortBlock
                    key={block.label}
                    label={block.label}
                    columns={12}
                    ports={block.ports}
                    isSfp
                    deviceId={data.id}
                    onPortClick={onPortClick}
                    selectedPort={selectedPort}
                  />
                ))}
              </div>
            </div>
          )}

          {isRouter && (
            <div className="p-5 rounded-[2rem] bg-white/[0.03] border border-white/5">
              <div className="flex gap-8">
                <div className="flex-1">
                  <span className="text-[9px] font-black text-netsim-pink tracking-[0.2em] block mb-3 uppercase">WAN Infrastructure</span>
                  <div className="grid grid-cols-2 gap-3 bg-black/40 p-4 rounded-3xl border border-white/5">
                    {wanPorts.map((p: any) => (
                      <PortItem key={p.id} p={p} deviceId={data.id} onPortClick={onPortClick} isSelected={selectedPort?.deviceId === data.id && selectedPort?.portId === p.id} />
                    ))}
                  </div>
                </div>
                <div className="flex-[2.5]">
                  <span className="text-[9px] font-black text-zinc-500 tracking-[0.2em] block mb-3 uppercase">Gigabit LAN Access</span>
                  <div className="grid grid-cols-3 gap-3 bg-black/40 p-4 rounded-3xl border border-white/5">
                    {lanPorts.map((p: any) => (
                      <PortItem key={p.id} p={p} deviceId={data.id} onPortClick={onPortClick} isSelected={selectedPort?.deviceId === data.id && selectedPort?.portId === p.id} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {isPC && (
            <div className="py-8 px-6 text-center rounded-[2rem] bg-white/[0.03] border border-white/5 group/pc">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover/pc:bg-netsim-cyan/10 transition-colors">
                <Monitor size={24} className="text-zinc-500 group-hover/pc:text-netsim-cyan transition-colors" />
              </div>
              <span className="text-[10px] font-black text-zinc-600 tracking-[0.1em] block mb-4 uppercase">Direct Gigabit Uplink</span>
              <div className="flex justify-center scale-150">
                <PortItem p={rj45Ports[0]} deviceId={data.id} onPortClick={onPortClick} isSelected={selectedPort?.deviceId === data.id && selectedPort?.portId === rj45Ports[0]?.id} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Equipment Footer Bar */}
      <div className="px-8 py-3 border-t border-white/5 flex justify-between items-center bg-black/40 relative">
        <div className="flex gap-8">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">MAC Identity</span>
            <span className="text-[10px] font-mono text-netsim-cyan font-bold">{(data?.macAddress || '00:00:00:00:00:00').toUpperCase()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">Port Density</span>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span className="text-[10px] text-white font-black">{ports.filter((p: any) => p.status === 'up').length} <span className="text-zinc-500">ACTIVE</span></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-8 w-px bg-white/5" />
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black text-zinc-800 uppercase tracking-[0.3em]">Hardware Auth</span>
            <span className="text-[10px] italic font-black text-zinc-600">SUPRA-V2.5-QUALIFIED</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default NetworkNode;

/**
 * PortBlock Component
 */
const PortBlock = memo(function PortBlock({ label, columns, ports, deviceId, onPortClick, selectedPort, isSfp = false }: PortBlockProps) {
  return (
    <div className="p-2 bg-black/40 rounded-lg border border-white/[0.03]">
      <span className="text-[8px] text-zinc-500 font-bold block mb-1">{label}</span>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {ports.map((p: any) => (
          <PortItem
            key={p.id}
            p={p}
            deviceId={deviceId}
            onPortClick={onPortClick}
            isSelected={selectedPort?.deviceId === deviceId && selectedPort?.portId === p.id}
            isSfp={isSfp}
          />
        ))}
      </div>
    </div>
  );
});

/**
 * Individual Port Component
 */
const PortItem = memo(function PortItem({ p, deviceId, onPortClick, isSelected, isSfp = false }: PortItemProps) {
  const isUp = p.status === 'up';
  const hasModule = !!p.sfpModule;
  const pendingSfpModule = useNetworkStore(state => state.pendingSfpModule);
  const trunkTag = p.ethTrunkId ? `ET${p.ethTrunkId}` : null;
  const noPower = p.poePowered === false;

  const tooltipContent = (
    <div className="p-1">
      <p className="text-blue-400 font-bold text-xs">{p.name}</p>
      <p className="text-[10px] text-zinc-300">{isSfp ? 'SFP+ 10Gbps' : 'RJ45 1000Base-T'}</p>
      <p className={cn('text-[10px] font-bold', isUp ? 'text-green-400' : 'text-red-400')}>
        {isUp ? 'LINK UP' : 'LINK DOWN'}
      </p>
    </div>
  );

  const bgColor = isSfp
    ? (hasModule ? (isUp ? 'bg-green-500' : 'bg-amber-500') : (pendingSfpModule ? 'bg-blue-500' : 'bg-blue-700'))
    : (isUp ? 'bg-amber-400' : 'bg-zinc-800');

  return (
    <div className="relative flex items-center justify-center w-6 h-6">
      {/* Handles on TOP to capture drag events, but with onClick to still allow selection */}
      <Handle
        type="source"
        position={Position.Top}
        id={`${p.id}-s`}
        onClick={() => onPortClick(deviceId, p.id)}
        className="hover:bg-amber-400/20 transition-colors cursor-crosshair"
        style={{ width: '50%', height: '100%', background: 'transparent', border: 'none', top: 0, left: 0, position: 'absolute', zIndex: 60 }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id={`${p.id}-t`}
        onClick={() => onPortClick(deviceId, p.id)}
        className="hover:bg-netsim-cyan/20 transition-colors cursor-crosshair"
        style={{ width: '50%', height: '100%', background: 'transparent', border: 'none', top: 0, right: 0, position: 'absolute', zIndex: 60 }}
      />

      <Tooltip content={tooltipContent} side="top">
        <div
          className={cn(
            'w-6 h-6 rounded flex items-center justify-center relative z-10',
            'border-b-2 border-black/50',
            'transition-all duration-150',
            'hover:scale-110 hover:z-10',
            bgColor,
            isSfp && 'rotate-45',
            (isUp || hasModule) && 'shadow-[0_0_10px_rgba(251,191,36,0.3)]',
            isSelected && 'z-20 shadow-[0_0_15px_rgba(255,255,255,0.6)] ring-2 ring-white',
            noPower && 'bg-red-700 animate-pulse'
          )}
        >
          <div className={cn(
            'w-1.5 h-1.5 rounded-full',
            isUp ? 'bg-white shadow-[0_0_4px_white]' : 'bg-black/20'
          )} />
          {trunkTag && (
            <span className={cn(
              'absolute -top-2.5 -right-2.5 text-[6px] px-1',
              'bg-blue-700 border border-blue-500 rounded',
              isSfp && '-rotate-45'
            )}>
              {trunkTag}
            </span>
          )}
        </div>
      </Tooltip>
    </div>
  );
});
