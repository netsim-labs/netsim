import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Router,
  Box,
  Monitor,
  Cpu,
  Plus,
  GraduationCap,
  // ShieldCheck,
  LucideIcon,
} from 'lucide-react';
// StreakWidget removed
import { useNetworkStore } from '../../store/useNetworkStore';
import { UserProfile } from './UserProfile';
import { cn } from '../../utils/cn';
import { Input } from './Input';

export interface SidebarProps {
  sidebarTab?: any;
  setSidebarTab?: any;
  search?: any;
  setSearch?: any;
  sidebarSections?: any;
  toggleSection?: any;
  handleAddDevice?: any;
  mode?: any;
  activeUser?: any;
}

interface DeviceTemplate {
  type: string;
  label: string;
  model: string;
  icon: LucideIcon;
  category: 'routers' | 'switches' | 'endpoints' | 'modules';
  specs: {
    ports: string;
    speed: string;
    description: string;
  };
}

export const deviceTemplates: DeviceTemplate[] = [
  // Routers
  {
    type: 'router',
    label: 'Huawei AR617',
    model: 'Huawei-AR617',
    icon: Router,
    category: 'routers',
    specs: { ports: '5x GE', speed: '1 Gbps', description: 'SD-WAN Access Router' }
  },
  {
    type: 'router',
    label: 'Huawei AR6121',
    model: 'Huawei-AR6121',
    icon: Router,
    category: 'routers',
    specs: { ports: '10x GE', speed: '1 Gbps', description: 'Enterprise Router' }
  },
  {
    type: 'router',
    label: 'Cisco ISR 4321',
    model: 'Cisco-ISR-4321',
    icon: Router,
    category: 'routers',
    specs: { ports: '2x GE, 1x 10G', speed: '10 Gbps', description: 'Edge Router' }
  },
  {
    type: 'router',
    label: 'MikroTik CCR2004',
    model: 'MikroTik-CCR2004',
    icon: Router,
    category: 'routers',
    specs: { ports: '12x 10G', speed: '25 Gbps', description: 'Core Router' }
  },
  // Switches
  {
    type: 'switch',
    label: 'Huawei S5700-28TP',
    model: 'Huawei-S5700-28TP',
    icon: Box,
    category: 'switches',
    specs: { ports: '28x GE', speed: '1 Gbps', description: 'L3 Managed Switch' }
  },
  {
    type: 'switch',
    label: 'Huawei S5700-52X',
    model: 'Huawei-S5700-52X-LI',
    icon: Box,
    category: 'switches',
    specs: { ports: '48x GE, 4x 10G', speed: '10 Gbps', description: 'Core/Aggregation' }
  },
  {
    type: 'switch',
    label: 'Cisco Catalyst 9300',
    model: 'Cisco-Catalyst-9300',
    icon: Box,
    category: 'switches',
    specs: { ports: '24x GE, 4x 10G', speed: '10 Gbps', description: 'Enterprise L3' }
  },
  {
    type: 'switch',
    label: 'Cisco Catalyst 2960L',
    model: 'Cisco-Catalyst-2960L',
    icon: Box,
    category: 'switches',
    specs: { ports: '24x GE, 4x SFP', speed: '1 Gbps', description: 'L2 Access Switch' }
  },
  {
    type: 'switch',
    label: 'MikroTik CRS326',
    model: 'MikroTik-CRS326',
    icon: Box,
    category: 'switches',
    specs: { ports: '24x GE, 2x 10G', speed: '10 Gbps', description: 'Cloud Router Switch' }
  },
  {
    type: 'switch',
    label: 'Aruba CX 6300',
    model: 'Aruba-CX-6300',
    icon: Box,
    category: 'switches',
    specs: { ports: '24x 10G SFP+', speed: '10 Gbps', description: 'Aggregation Switch' }
  },
  // Endpoints
  {
    type: 'pc',
    label: 'PC Client',
    model: 'PC',
    icon: Monitor,
    category: 'endpoints',
    specs: { ports: '1x Eth', speed: '1 Gbps', description: 'Generic Desktop PC' }
  },
  {
    type: 'pc',
    label: 'Access Point',
    model: 'AP-POE',
    icon: Monitor,
    category: 'endpoints',
    specs: { ports: '1x PoE', speed: '1 Gbps', description: 'WiFi Access Point' }
  },
  {
    type: 'pc',
    label: 'VoIP Phone',
    model: 'PHONE-VOIP',
    icon: Monitor,
    category: 'endpoints',
    specs: { ports: '1x Eth', speed: '100 Mbps', description: 'IP Phone' }
  }
];

type CategoryId = 'routers' | 'switches' | 'endpoints' | 'modules';

const categories: Array<{ id: CategoryId; label: string; icon: LucideIcon }> = [
  { id: 'routers', label: 'Routers', icon: Router },
  { id: 'switches', label: 'Switches', icon: Box },
  { id: 'endpoints', label: 'Endpoints', icon: Monitor },
  { id: 'modules', label: 'Modules', icon: Cpu },
];

export default function Sidebar(_props: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    routers: true,
    switches: true,
    endpoints: true,
    modules: true
  });

  const {
    selectSfpModule,
    pendingSfpModule,
    setShowLabsPanel,
    // Gamification removed
    // SelfHealing removed
    setShow3DView
  } = useNetworkStore();

  const toggleCategory = (id: string) => {
    setOpenCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddStart = (e: React.DragEvent, device: DeviceTemplate) => {
    e.dataTransfer.setData('application/reactflow', device.type);
    e.dataTransfer.setData('application/model', device.model);
    e.dataTransfer.effectAllowed = 'move';
  };

  const filteredTemplates = deviceTemplates.filter(d =>
    d.label.toLowerCase().includes(search.toLowerCase()) ||
    d.model.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className={cn(
      "fixed left-4 top-4 bottom-4 z-50 transition-all duration-500 ease-premium flex flex-col overflow-hidden",
      isCollapsed ? "w-20" : "w-80",
      "glass-panel-dark border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[2rem]"
    )}>

      {/* Glow Effect Top */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-netsim-cyan/5 blur-[80px] pointer-events-none" />

      {/* Header / Brand */}
      <div className="p-6 pb-2 flex items-center justify-between relative">
        {!isCollapsed && (
          <div className="flex items-center gap-3 animate-fade-in-left">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-netsim-cyan via-netsim-cyan-light to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(41,217,255,0.3)]">
              <Box size={22} className="text-black" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-white text-lg tracking-tighter leading-none">NETSIM</span>
              <span className="text-[10px] text-netsim-cyan font-bold tracking-[0.2em] uppercase">Community</span>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "p-2.5 rounded-2xl transition-all duration-300 flex items-center justify-center",
            isCollapsed
              ? "mx-auto bg-white/[0.05] border border-white/10 text-netsim-cyan shadow-[0_0_15px_rgba(41,217,255,0.1)] hover:bg-white/[0.08]"
              : "hover:bg-white/10 text-zinc-500 hover:text-white"
          )}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Search Bar */}
      {!isCollapsed && (
        <div className="px-6 py-4 animate-fade-in-up">
          <div className="relative group">
            <Input
              placeholder="Filter assets..."
              variant="cyan"
              className="h-10 text-[12px] bg-black/40 focus:bg-black/50 focus:shadow-[0_0_20px_rgba(41,217,255,0.15)]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Device Catalog Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
        {!isCollapsed ? (
          <>
            {categories.map(cat => (
              <div key={cat.id} className="space-y-3">
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-black text-zinc-500 uppercase tracking-[0.15em] hover:text-netsim-cyan group transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <cat.icon size={13} className="group-hover:text-netsim-cyan" />
                    <span>{cat.label}</span>
                  </div>
                  <ChevronDown size={14} className={cn("transition-transform duration-300", !openCategories[cat.id] && "-rotate-90")} />
                </button>

                {openCategories[cat.id] && (
                  <div className="space-y-2 animate-scale-in">
                    {cat.id === 'modules' ? (
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {['10G-SR', '10G-LR'].map(mod => (
                          <button
                            key={mod}
                            onClick={() => selectSfpModule(mod as any)}
                            className={cn(
                              'flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden group',
                              pendingSfpModule === mod
                                ? 'border-netsim-cyan/50 bg-netsim-cyan/10 shadow-[0_0_15px_rgba(41,217,255,0.1)]'
                                : 'border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20'
                            )}
                          >
                            {pendingSfpModule === mod && (
                              <div className="absolute top-0 right-0 p-1 bg-netsim-cyan text-black rounded-bl-lg">
                                <Plus size={8} className="rotate-45" />
                              </div>
                            )}
                            <Cpu size={20} className={cn("transition-colors duration-300", pendingSfpModule === mod ? "text-netsim-cyan" : "text-zinc-500 group-hover:text-white")} />
                            <span className="text-[10px] font-black tracking-widest text-zinc-400 group-hover:text-white">{mod}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      filteredTemplates.filter(d => d.category === cat.id).map((device, idx) => (
                        <div
                          key={idx}
                          draggable
                          onDragStart={(e) => handleAddStart(e, device)}
                          onClick={() => _props.handleAddDevice && _props.handleAddDevice(device.model)}
                          className="group relative flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] hover:bg-netsim-cyan/[0.08] border border-white/[0.04] hover:border-netsim-cyan/30 cursor-grab active:cursor-grabbing transition-all duration-300"
                        >
                          <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.08] group-hover:border-netsim-cyan/30 group-hover:shadow-[0_0_15px_rgba(41,217,255,0.15)] transition-all">
                            <device.icon size={20} className="text-zinc-400 group-hover:text-netsim-cyan" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-black text-zinc-200 group-hover:text-white truncate uppercase tracking-tight">{device.label}</div>
                            <div className="text-[9px] text-zinc-500 group-hover:text-netsim-cyan opacity-60 font-medium">{device.model}</div>
                          </div>
                          <div className="flex flex-col items-center opacity-40 group-hover:opacity-100 transition-opacity">
                            <Plus size={14} className="text-zinc-500 group-hover:text-netsim-cyan" />
                          </div>

                          {/* Hover Details Pip */}
                          <div className="absolute right-0 top-0 bottom-0 w-1 bg-netsim-cyan scale-y-0 group-hover:scale-y-50 transition-transform duration-300 rounded-l-full" />
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </>
        ) : (
          <div className="flex flex-col gap-6 items-center pt-10 animate-fade-in">
            {categories.map(cat => (
              <div
                key={cat.id}
                className="p-3.5 rounded-2xl bg-white/[0.03] text-zinc-500 hover:text-netsim-cyan hover:bg-netsim-cyan/5 hover:shadow-[0_0_20px_rgba(41,217,255,0.1)] transition-all cursor-pointer border border-white/[0.02] hover:border-netsim-cyan/20 group relative"
                title={cat.label}
                onClick={() => { setIsCollapsed(false); toggleCategory(cat.id); }}
              >
                <cat.icon size={20} className="group-hover:scale-110 transition-transform" />
                <div className="absolute left-[-4px] w-1 h-0 bg-netsim-cyan rounded-r-full group-hover:h-5 top-1/2 -translate-y-1/2 transition-all shadow-[0_0_10px_rgba(41,217,255,0.8)]" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tools Section */}
      <div className="p-4 bg-white/[0.02] border-t border-white/[0.05] space-y-2 relative">
        {/* Streak Widget Removed */}

        <div className="grid grid-cols-1 gap-1">
          <button onClick={() => setShowLabsPanel(true)} className="flex items-center gap-4 p-3.5 text-zinc-400 hover:text-white hover:bg-white/[0.05] rounded-2xl transition-all group overflow-hidden relative">
            <div className="absolute inset-y-0 left-0 w-1 bg-netsim-purple translate-x-[-100%] group-hover:translate-x-0 transition-transform" />
            <GraduationCap size={20} className="group-hover:text-netsim-purple transition-colors" />
            {!isCollapsed && <span className="text-xs font-black uppercase tracking-widest">Labs</span>}
          </button>

          <button onClick={() => setShow3DView(true)} className="flex items-center gap-4 p-3.5 text-zinc-400 hover:text-white hover:bg-white/[0.05] rounded-2xl transition-all group overflow-hidden relative">
            <div className="absolute inset-y-0 left-0 w-1 bg-netsim-pink translate-x-[-100%] group-hover:translate-x-0 transition-transform" />
            <Box size={20} className="text-netsim-pink opacity-80 group-hover:opacity-100" />
            {!isCollapsed && <span className="text-xs font-black uppercase tracking-widest">3D View</span>}
          </button>

          {/* NetGuard/Self-Healing Removed */}
        </div>
      </div>

      {/* User Footer */}
      <div className="relative">
        <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <UserProfile isCollapsed={isCollapsed} />
      </div>

    </aside>
  );
}
