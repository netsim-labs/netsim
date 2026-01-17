import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Settings2,
  ShieldCheck,
  Terminal,
  Trash2,
  Save,
  Monitor,
  Box,
  Copy,
  Zap
} from 'lucide-react';
// import { NetconfExecutor } from '../features/management/NetconfExecutor'; // Removed
import { useNetworkStore } from '../store/useNetworkStore';
import { useUiStore } from '../store/useUiStore';
import { PortMode } from '../types/NetworkTypes';
import { cn } from '../utils/cn';
import { Tooltip } from './UI/Tooltip';
import { Button } from './shadcn-ui/button';
import { Input } from './UI/Input';
import { Badge } from './UI/Badge';
import { Progress } from './UI/Progress';
import { Toggle } from './UI/Toggle';

/**
 * Inspector Panel - Pure Tailwind implementation.
 * Draggable floating panel for device/port configuration.
 */
export function Inspector() {
  const devices = useNetworkStore(state => state.devices);
  const selectedPort = useNetworkStore(state => state.selectedPort);
  const activeConsoleId = useNetworkStore(state => state.activeConsoleId);
  const updatePortConfig = useNetworkStore(state => state.updatePortConfig);
  const updateDevice = useNetworkStore(state => state.updateDevice);
  const removeCable = useNetworkStore(state => state.removeCable);
  const addToast = useUiStore(state => state.addToast);
  const bringToFront = useUiStore(state => state.bringToFront);

  const [form, setForm] = useState({
    description: '',
    mode: 'access' as PortMode,
    vlan: '',
    allowed: '',
    ip: '',
    mask: '',
    enabled: true,
    portSecurityEnabled: false,
    maxMacs: '1',
    sticky: false,
    shutdownOnViolation: true
  });

  const [deviceForm, setDeviceForm] = useState({
    clabKind: '',
    clabImage: '',
    clabCmd: ''
  });

  const [pos, setPos] = useState({ x: 12, y: 12 });
  const dragOffset = useRef({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [zIndex, setZIndex] = useState<number>(() => useUiStore.getState().windowZ['inspector'] ?? 1500);
  const [lastDeviceId, setLastDeviceId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('status');
  const [rpcInput, setRpcInput] = useState('<rpc message-id="101" xmlns="urn:ietf:params:xml:ns:netconf:base:1.0">\n  <get-config>\n    <source><running/></source>\n  </get-config>\n</rpc>');
  const [rpcResponse, setRpcResponse] = useState('');

  const info = useMemo(() => {
    if (selectedPort) {
      const dev = devices.find(d => d.id === selectedPort.deviceId);
      const port = dev?.ports.find(p => p.id === selectedPort.portId);
      return { dev, port, kind: 'port' as const };
    }
    if (activeConsoleId) {
      const dev = devices.find(d => d.id === activeConsoleId);
      setLastDeviceId(activeConsoleId);
      return { dev, port: undefined, kind: 'device' as const };
    }
    if (lastDeviceId) {
      const dev = devices.find(d => d.id === lastDeviceId);
      if (dev) return { dev, port: undefined, kind: 'device' as const };
      else setLastDeviceId(null);
    }
    return null;
  }, [devices, selectedPort, activeConsoleId, lastDeviceId]);

  const { dev, port, kind } = info || { dev: null, port: null, kind: null };

  const runningConfigLines = useMemo(() => {
    if (!dev) return [];
    const lines: string[] = [];
    lines.push(`hostname ${dev.hostname}`);
    dev.ports.forEach(p => {
      lines.push(`interface ${p.name}`);
      if (p.config.description) lines.push(`  description ${p.config.description}`);
      lines.push(p.status === 'down' ? '  shutdown' : '  no shutdown');
      if (p.config.mode === 'access') {
        lines.push('  switchport mode access');
        if (p.config.vlan) lines.push(`  switchport access vlan ${p.config.vlan}`);
      } else if (p.config.mode === 'trunk') {
        lines.push('  switchport mode trunk');
        if (p.config.allowedVlans?.length) {
          lines.push(`  switchport trunk allowed vlan ${p.config.allowedVlans.join(', ')}`);
        }
      }
    });
    return lines;
  }, [dev]);

  const portCounters = useMemo(() => {
    if (!dev) return { up: 0, down: 0 };
    const up = dev.ports.filter(p => p.status === 'up').length;
    return { up, down: dev.ports.length - up, total: dev.ports.length };
  }, [dev]);

  // Position & Dragging Logic
  useEffect(() => {
    const saved = localStorage.getItem('netsim-inspector-pos');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          setPos(parsed);
          return;
        }
      } catch { }
    }
    const x = window.innerWidth - 380;
    const y = 80;
    setPos({ x, y });
  }, []);

  useEffect(() => {
    localStorage.setItem('netsim-inspector-pos', JSON.stringify(pos));
  }, [pos]);

  useEffect(() => {
    if (info?.port) {
      setForm({
        description: info.port.config.description ?? '',
        mode: info.port.config.mode,
        vlan: info.port.config.vlan?.toString() ?? '',
        allowed: info.port.config.allowedVlans?.join(',') ?? '',
        ip: info.port.config.ipAddress ?? '',
        mask: info.port.config.subnetMask?.toString() ?? '',
        enabled: info.port.config.enabled ?? true,
        portSecurityEnabled: info.port.config.portSecurity?.enabled ?? false,
        maxMacs: info.port.config.portSecurity?.maxMacs?.toString() ?? '1',
        sticky: info.port.config.portSecurity?.sticky ?? false,
        shutdownOnViolation: info.port.config.portSecurity?.shutdownOnViolation ?? true
      });
      setActiveTab('config');
    } else {
      setActiveTab('status');
    }
  }, [info]);

  useEffect(() => { if (info) setHidden(false); }, [info]);

  useEffect(() => {
    if (dev) {
      setDeviceForm({
        clabKind: dev.containerlab?.kind || '',
        clabImage: dev.containerlab?.image || '',
        clabCmd: dev.containerlab?.cmd || ''
      });
    }
  }, [dev?.id]);

  const handleSaveDevice = () => {
    if (!dev) return;
    updateDevice(dev.id, {
      containerlab: {
        kind: deviceForm.clabKind,
        image: deviceForm.clabImage,
        cmd: deviceForm.clabCmd || undefined
      }
    });
    addToast('Containerlab configuration saved', 'success');
  };

  const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

  const dock = (side: 'left' | 'right') => {
    const x = side === 'left' ? 24 : Math.max(24, window.innerWidth - 380);
    const y = 80;
    setPos({ x, y });
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!dragging) return;
      setPos({
        x: clamp(e.clientX - dragOffset.current.x, 8, window.innerWidth - 380),
        y: clamp(e.clientY - dragOffset.current.y, 8, window.innerHeight - 100)
      });
    };
    const handleUp = () => setDragging(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [dragging]);

  const startDrag = (e: ReactMouseEvent) => {
    setZIndex(bringToFront('inspector'));
    setDragging(true);
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  };

  const focusFront = () => setZIndex(bringToFront('inspector'));

  const handleSave = () => {
    if (!dev || !port) return;
    updatePortConfig(dev.id, port.id, {
      description: form.description || undefined,
      mode: form.mode,
      vlan: form.vlan ? Number(form.vlan) : undefined,
      allowedVlans: form.allowed ? form.allowed.split(',').map(v => Number(v.trim())) : undefined,
      ipAddress: form.ip || undefined,
      subnetMask: form.mask ? Number(form.mask) : undefined,
      enabled: form.enabled,
      portSecurity: {
        enabled: form.portSecurityEnabled,
        maxMacs: Number(form.maxMacs) || 1,
        sticky: form.sticky,
        stickyMacs: port.config.portSecurity?.stickyMacs || [],
        shutdownOnViolation: form.shutdownOnViolation
      }
    });
    addToast(`Port ${port.name} updated`, 'success');
  };

  const handleSendRpc = async () => {
    if (!dev) return;
    try {
      // Stub for OSS because NetconfExecutor was removed
      setRpcResponse("NETCONF simulator not available in Community Edition.");
      addToast('NETCONF RPC executed (Stub)', 'success');
    } catch (e) {
      setRpcResponse(`Error: ${e}`);
      addToast('RPC Failed', 'error');
    }
  };

  if (!dev) return null;
  if (hidden) {
    return (
      <button
        onClick={() => setHidden(false)}
        className={cn(
          'fixed bottom-6 right-6 z-[1000] animate-bounce-slow',
          'flex items-center gap-3 px-5 py-3 rounded-2xl shadow-neon-cyan',
          'bg-netsim-cyan text-black text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95'
        )}
      >
        <Settings2 size={16} />
        Open Inspector
      </button>
    );
  }

  return (
    <div
      onMouseDown={focusFront}
      style={{ left: pos.x, top: pos.y, zIndex }}
      className={cn(
        'fixed w-[360px] rounded-[2.5rem] flex flex-col max-h-[85vh] overflow-hidden transition-shadow duration-500',
        'glass-panel-dark border border-white/[0.08] shadow-[0_30px_60px_rgba(0,0,0,0.6)]',
        dragging && "shadow-neon-cyan/20 ring-1 ring-netsim-cyan/30"
      )}
    >
      {/* HEADER / DRAG HANDLE */}
      <div
        onMouseDown={startDrag}
        className={cn(
          'flex items-center justify-between p-6 select-none bg-white/[0.02] border-b border-white/[0.05]',
          dragging ? 'cursor-grabbing' : 'cursor-grab'
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-netsim-cyan/10 flex items-center justify-center border border-netsim-cyan/20">
            <Settings2 size={16} className="text-netsim-cyan" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Node Inspector</span>
            <span className="text-xs font-bold text-white truncate max-w-[150px]">{dev.hostname}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Tooltip content="Dock Left">
            <button onClick={() => dock('left')} onMouseDown={e => e.stopPropagation()} className="p-2 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-white transition-all">
              <ChevronLeft size={16} />
            </button>
          </Tooltip>
          <Tooltip content="Dock Right">
            <button onClick={() => dock('right')} onMouseDown={e => e.stopPropagation()} className="p-2 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-white transition-all">
              <ChevronRight size={16} />
            </button>
          </Tooltip>
          <button onClick={(e) => { e.stopPropagation(); setHidden(true); }} className="p-2 rounded-xl hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 transition-all">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="px-6 pt-4">
        <div className="flex p-1 bg-black/40 rounded-2xl border border-white/[0.05]">
          <button
            onClick={() => setActiveTab('status')}
            className={cn("flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all", activeTab === 'status' ? "bg-netsim-cyan text-black shadow-lg" : "text-zinc-500 hover:text-zinc-300")}
          >
            Status
          </button>
          {kind === 'port' && (
            <button
              onClick={() => setActiveTab('config')}
              className={cn("flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all", activeTab === 'config' ? "bg-netsim-cyan text-black shadow-lg" : "text-zinc-500 hover:text-zinc-300")}
            >
              Config
            </button>
          )}
          <button
            onClick={() => setActiveTab('system')}
            className={cn("flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all", activeTab === 'system' ? "bg-netsim-cyan text-black shadow-lg" : "text-zinc-500 hover:text-zinc-300")}
          >
            Core
          </button>
          {dev.netconfEnabled && (
            <button
              onClick={() => setActiveTab('netconf')}
              className={cn("flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all", activeTab === 'netconf' ? "bg-amber-500 text-black shadow-lg" : "text-zinc-500 hover:text-zinc-300")}
            >
              NETCONF
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-4 space-y-6">

        {activeTab === 'status' && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Health Overview */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 glass-card border-emerald-500/20 bg-emerald-500/5 rounded-3xl text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/5 blur-xl group-hover:bg-emerald-500/10 transition-colors" />
                <p className="text-3xl font-black text-white">{portCounters.up}</p>
                <Badge variant="success" size="sm" className="bg-transparent border-none">INTERFACES UP</Badge>
              </div>
              <div className="p-4 glass-card border-rose-500/20 bg-rose-500/5 rounded-3xl text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-12 h-12 bg-rose-500/5 blur-xl group-hover:bg-rose-500/10 transition-colors" />
                <p className="text-3xl font-black text-white">{portCounters.down}</p>
                <Badge variant="danger" size="sm" className="bg-transparent border-none">OFFLINE</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end mb-1">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Port Saturation</span>
                <span className="text-xs font-bold text-white">{Math.round((portCounters.up / (portCounters.total || 1)) * 100)}%</span>
              </div>
              <Progress value={portCounters.up} max={portCounters.total || 1} size="md" variant="cyan" animated />
            </div>

            {/* Port Quick Monitor */}
            <div className="space-y-4">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block border-b border-white/5 pb-2">Active Ports (Top 8)</span>
              <div className="space-y-1">
                {dev.ports.slice(0, 8).map(p => (
                  <div key={p.name} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.03] transition-colors border border-transparent hover:border-white/[0.05] group">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-2 h-2 rounded-full", p.status === 'up' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500")} />
                      <span className="text-[11px] font-mono font-bold text-zinc-300 group-hover:text-white transition-colors">{p.name.replace('GigabitEthernet', 'GE')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-zinc-600 uppercase tracking-tighter">{p.config.mode}</span>
                      <Badge variant={p.status === 'up' ? 'cyan' : 'default'} size="sm" className="px-1.5 py-0 min-w-[40px] text-center">
                        {p.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Routing / Protocol Info */}
            <div className="space-y-3 p-4 glass-card bg-netsim-purple/5 border-netsim-purple/20 rounded-3xl">
              <span className="text-[10px] font-black text-netsim-purple uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={12} /> Live Telemetry
              </span>
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase">OSPF Area</span>
                  <span className="text-sm font-black text-white">{dev.ospfEnabled ? 'Area 0.0.0.0' : 'Disconnected'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase">Route Entries</span>
                  <span className="text-sm font-black text-white">{dev.routingTable?.length || 0} Routes</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'config' && kind === 'port' && port && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center p-4 glass-panel bg-white/[0.02] rounded-3xl border-white/[0.05]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center">
                  <Monitor size={20} className="text-netsim-cyan" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter">Physical Interafce</span>
                  <span className="text-sm font-black text-white">{port.name}</span>
                </div>
              </div>
              <Badge variant={port.status === 'up' ? 'success' : 'danger'} dot glow>{port.status.toUpperCase()}</Badge>
            </div>

            <div className="space-y-4">
              <Input
                label="Description"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                variant="cyan"
                placeholder="Interface purpose..."
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-500 uppercase ml-1">Switching Mode</label>
                  <select
                    value={form.mode}
                    onChange={e => setForm(f => ({ ...f, mode: e.target.value as PortMode }))}
                    className="w-full bg-black/40 border border-white/[0.08] rounded-2xl px-4 py-3 text-xs font-bold text-white focus:border-netsim-cyan/50 focus:outline-none transition-all"
                  >
                    <option value="access">Access</option>
                    <option value="trunk">Trunk</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="routed">Routed</option>
                  </select>
                </div>
                <Input
                  label="PVID / VLAN"
                  value={form.vlan}
                  onChange={e => setForm(f => ({ ...f, vlan: e.target.value }))}
                  variant="cyan"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="IP Address (Routed)"
                  value={form.ip}
                  onChange={e => setForm(f => ({ ...f, ip: e.target.value }))}
                  variant="purple"
                  placeholder="192.168.1.1"
                />
              </div>

              <div className="flex items-center justify-between p-4 glass-card bg-netsim-cyan/5 border-netsim-cyan/20 rounded-3xl">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">Admin Status</span>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase">Enable/Disable physical link</span>
                </div>
                <Toggle
                  checked={form.enabled}
                  onChange={checked => setForm(f => ({ ...f, enabled: checked }))}
                  variant="cyan"
                />
              </div>

              {/* Port Security Segment */}
              <div className="p-5 glass-card bg-black/40 border-white/[0.05] rounded-[2rem] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className={form.portSecurityEnabled ? "text-emerald-500" : "text-zinc-600"} />
                    <span className="text-[11px] font-black text-white uppercase tracking-widest">Port Security</span>
                  </div>
                  <Toggle checked={form.portSecurityEnabled} onChange={c => setForm(f => ({ ...f, portSecurityEnabled: c }))} size="sm" />
                </div>

                {form.portSecurityEnabled && (
                  <div className="space-y-4 pt-2 animate-scale-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-zinc-400">Apply MAC Sticky</span>
                      <Toggle checked={form.sticky} onChange={c => setForm(f => ({ ...f, sticky: c }))} size="sm" variant="purple" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Max MACs" type="number" value={form.maxMacs} onChange={(e: any) => setForm((f: any) => ({ ...f, maxMacs: parseInt(e.target.value) || 1 }))} size="sm" />
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-500 ml-1">Violation</label>
                        <select value={form.shutdownOnViolation ? 'shutdown' : 'protect'} onChange={e => setForm(f => ({ ...f, shutdownOnViolation: e.target.value === 'shutdown' }))} className="w-full bg-black/20 border border-white/5 rounded-xl px-3 py-2 text-[11px] font-bold text-white focus:outline-none">
                          <option value="shutdown">Shutdown</option>
                          <option value="protect">Protect</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 sticky bottom-0 bg-transparent">
                <Button variant="premium" onClick={handleSave} className="flex-1 rounded-2xl shadow-neon-cyan">
                  <Save size={16} className="mr-2" />
                  DEPLOY CONFIG
                </Button>
                {port.connectedCableId && (
                  <Button variant="destructive" onClick={() => removeCable(port.connectedCableId!)} className="aspect-square p-0 w-12 rounded-2xl">
                    <Trash2 size={18} />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Node Identity Card */}
            <div className="p-5 glass-panel bg-gradient-to-br from-netsim-cyan/5 to-netsim-purple/5 border-white/10 rounded-[2.5rem] relative overflow-hidden">
              <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-netsim-cyan/10 blur-[50px] rounded-full" />
              <div className="relative z-10 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <Badge variant="cyan" glow size="lg" className="font-black">{dev.vendor.toUpperCase()}</Badge>
                  <span className="text-[10px] font-black text-zinc-600">ID: {dev.id.slice(0, 8)}</span>
                </div>
                <h3 className="text-xl font-black text-white tracking-tight leading-tight">{dev.hostname}</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default" size="sm" className="bg-white/5 border-white/10">SW v2.5.0</Badge>
                  <Badge variant="default" size="sm" className="bg-white/5 border-white/10">{dev.model}</Badge>
                </div>
              </div>
            </div>

            {/* Containerlab Integration */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <Box size={14} className="text-netsim-cyan" />
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Containerlab Mapping</span>
              </div>
              <div className="p-5 glass-card bg-black/40 border-white/[0.05] rounded-[2rem] space-y-4">
                <Input label="Clab Kind" value={deviceForm.clabKind} onChange={(e: any) => setDeviceForm((f: any) => ({ ...f, clabKind: e.target.value }))} placeholder="e.g. ceos, huawei_vrp" />
                <Input label="Registry Image" value={deviceForm.clabImage} onChange={(e: any) => setDeviceForm((f: any) => ({ ...f, clabImage: e.target.value }))} placeholder="vendor/image:tag" />
                <Button variant="outline" onClick={handleSaveDevice} className="w-full rounded-2xl border-white/[0.08] hover:bg-white/5">
                  Update Engine Mapping
                </Button>
              </div>
            </div>

            {/* Running Config Preview */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <Terminal size={14} className="text-emerald-500" />
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Live Running Config</span>
              </div>
              <div className="p-4 bg-black/60 backdrop-blur-3xl rounded-[2rem] border border-emerald-500/20 max-h-56 overflow-hidden relative group">
                <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-4">
                  <div className="space-y-0.5">
                    {runningConfigLines.map((line, i) => (
                      <pre key={i} className="text-[10px] font-mono text-emerald-400 opacity-80 whitespace-pre leading-relaxed">{line}</pre>
                    ))}
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="glass" size="sm" className="h-8 rounded-xl px-2" onClick={() => {
                    navigator.clipboard.writeText(runningConfigLines.join('\n'));
                    addToast('Config copied to clipboard', 'success');
                  }}>
                    <Copy size={12} className="mr-1" /> Copy
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'netconf' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="p-4 glass-card bg-amber-500/5 border-amber-500/20 rounded-3xl space-y-2">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-amber-500" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Automation Interface</span>
              </div>
              <p className="text-[10px] text-zinc-400">Send XML-over-SSH RPCs directly to the simulated management plane.</p>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-black text-zinc-500 uppercase px-1">XML RPC Payload</span>
              <textarea
                value={rpcInput}
                onChange={e => setRpcInput(e.target.value)}
                rows={8}
                className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-[11px] font-mono text-amber-200 focus:border-amber-500/50 focus:outline-none custom-scrollbar"
                placeholder="<rpc>...</rpc>"
              />
              <Button
                variant="premium"
                onClick={handleSendRpc}
                className="w-full rounded-2xl bg-amber-600 hover:bg-amber-500 shadow-neon-amber"
              >
                Execute RPC
              </Button>
            </div>

            {rpcResponse && (
              <div className="space-y-3">
                <span className="text-[10px] font-black text-zinc-500 uppercase px-1">Server Response</span>
                <div className="p-4 bg-zinc-900 border border-white/5 rounded-2xl max-h-48 overflow-y-auto custom-scrollbar">
                  <pre className="text-[10px] font-mono text-emerald-400 whitespace-pre-wrap">{rpcResponse}</pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FOOTER STATUS */}
      <div className="p-4 bg-black/40 border-t border-white/[0.05] flex justify-between items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-netsim-cyan/5 blur-xl pointer-events-none" />
        <div className="flex items-center gap-2 relative z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Telemetry Active</span>
        </div>
        <span className="text-[9px] font-black text-zinc-700 uppercase relative z-10">NetSim.dev v2.5 SUPRA</span>
      </div>
    </div>
  );
}
