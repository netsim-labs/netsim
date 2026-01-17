import { useEffect, useMemo, lazy, Suspense } from 'react';
import 'reactflow/dist/style.css';

// Stores
import { useNetworkStore } from './store/useNetworkStore';
import { useAuthStore } from './store/useAuthStore';
import { ReactFlowProvider } from 'reactflow';
import { cn } from './utils/cn';

// Components
import { ErrorBoundary } from './components/ErrorBoundary';
import Sidebar from './components/UI/Sidebar';
import SimulatorCanvas from './components/UI/SimulatorCanvas';
import { Toasts } from './components/Toasts';
import { LabsPanelEnhanced } from './features/labs/components/LabsPanelEnhanced';

// Icons
import { LayoutGrid, Map as MapIcon } from 'lucide-react';

// Views
import { RackView } from './components/Network/Rack/RackView';
// Hooks
import { useSimulatorState } from './hooks/useSimulatorState';
import { useTopologyActions } from './hooks/useTopologyActions';

import { Routes, Route, Navigate } from 'react-router-dom';


export default function App() {
  const { initListener } = useAuthStore();

  useEffect(() => {
    initListener();
  }, [initListener]);

  return (
    <ErrorBoundary>
      <Toasts />
      <Suspense fallback={<div className="bg-[#0b0c0d] h-screen w-screen flex items-center justify-center text-zinc-500">Loading Simulator...</div>}>
        <Routes>

          {/* Root Route - Direct Access to Simulator */}
          <Route path="/" element={
            <ReactFlowProvider>
              <SimulatorWrapper />
            </ReactFlowProvider>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

function SimulatorWrapper() {
  return <Simulator />;
}

function Simulator() {
  const { activeUser, mode } = useAuthStore();
  // @ts-ignore
  const { activeConsoleId, viewMode, setViewMode, showLabsPanel, setShowLabsPanel } = useNetworkStore();

  const uiState = useSimulatorState();
  const topologyActions = useTopologyActions();

  const nodes = useMemo(() => topologyActions.devices.map(d => ({
    id: d.id,
    type: 'networkNode',
    position: d.position,
    data: d,
    selected: false,
  })), [topologyActions.devices]);

  const shouldRenderMiniMap = useMemo(() => {
    return uiState.showMiniMap && topologyActions.devices.length < 100;
  }, [uiState.showMiniMap, topologyActions.devices.length]);

  return (
    <div className="flex h-screen w-screen bg-transparent overflow-hidden text-white font-sans selection:bg-neon-blue/30">

      {/* Floating Sidebar */}
      <Sidebar
        sidebarTab={uiState.sidebarTab}
        setSidebarTab={uiState.setSidebarTab}
        search={uiState.search}
        setSearch={uiState.setSearch}
        sidebarSections={uiState.sidebarSections}
        toggleSection={uiState.toggleSection}
        handleAddDevice={topologyActions.handleAddDevice}
        mode={mode}
        activeUser={activeUser}
      />

      {/* Main Content Area Wrapper */}
      <main className="flex-1 relative flex flex-col bg-transparent overflow-hidden ml-4 rounded-l-3xl shadow-2xl border-l border-white/5 backdrop-blur-sm">

        {/* ====================================================== */}
        {/* PREMIUM CONTROL HUB (Floating Top-Center) */}
        {/* ====================================================== */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[4000] flex items-center gap-2 glass-panel bg-black/45 border-white/[0.1] p-1.5 rounded-[1.6rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] backdrop-blur-3xl animate-fade-in-down ring-1 ring-white/10">

          {/* Topology Tools */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setViewMode('logical')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2",
                viewMode === 'logical'
                  ? "bg-netsim-cyan text-black shadow-neon-cyan/40 scale-105"
                  : "text-zinc-500 hover:text-white hover:bg-white/5"
              )}
            >
              <MapIcon size={13} strokeWidth={2.5} />
              <span className="hidden lg:inline">Map</span>
            </button>
            <button
              onClick={() => setViewMode('physical')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2",
                viewMode === 'physical'
                  ? "bg-netsim-purple text-white shadow-neon-purple/40 scale-105"
                  : "text-zinc-500 hover:text-white hover:bg-white/5"
              )}
            >
              <LayoutGrid size={13} strokeWidth={2.5} />
              <span className="hidden lg:inline">Rack</span>
            </button>
          </div>
        </div>

        {/* Content Views */}
        {viewMode === 'physical' ? (
          <div className="flex-1 bg-[#121212] relative h-full">
            <RackView />
          </div>
        ) : (
          <div className="flex-1 h-full w-full relative">
            <SimulatorCanvas
              nodes={nodes}
              edges={topologyActions.edges}
              onNodesChange={topologyActions.onNodesChange}
              onEdgeDoubleClick={topologyActions.onEdgeDoubleClick}
              onNodeDoubleClick={(_e: any, node: any) => topologyActions.handleOpenDeviceConsole(node.id)}
              shouldRenderMiniMap={shouldRenderMiniMap}
              showMiniMap={uiState.showMiniMap}
              devices={topologyActions.devices}
              activeConsoleId={activeConsoleId}
              hotkeysModal={uiState.hotkeysModal}
              showOnboarding={false}
              completeOnboarding={() => { }}
              skipOnboarding={() => { }}
              handleAddDevice={topologyActions.handleAddDevice}
            />
          </div>
        )}
      </main>

      <LabsPanelEnhanced
        isOpen={showLabsPanel}
        onClose={() => setShowLabsPanel(false)}
      />
    </div>
  );
}
