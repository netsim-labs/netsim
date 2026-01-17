import { Suspense, lazy, useState, useCallback } from 'react';
import ReactFlow, { Background, Controls, MiniMap, ReactFlowProvider } from 'reactflow';
import { NetworkNode } from '../NetworkNode';
import NetworkCable from '../NetworkCable';
import SmartEdge from '../edges/SmartEdge';
import MiniMapNode from './MiniMapNode';
import Hotkeys from '../Hotkeys';
import { useNetworkStore } from '../../store/useNetworkStore';
// import { useAuthStore } from '../../store/useAuthStore';
import { cn } from '../../utils/cn';

// Lazy load heavy panels
const Console = lazy(() => import('../Console'));
const HotkeysModal = lazy(() => import('../HotkeysModal').then(mod => ({ default: mod.HotkeysModal })));
const Onboarding = lazy(() => import('../Onboarding').then(mod => ({ default: mod.Onboarding })));
const Inspector = lazy(() => import('../Inspector').then(mod => ({ default: mod.Inspector })));
// Removed: Automation, Replay, Flashcards panels

const nodeTypes = { networkNode: NetworkNode };
const edgeTypes = {
    networkCable: NetworkCable,
    smart: SmartEdge
};

// Color palette for minimap
const colors = {
    success: '#22c55e',
    primary: '#6366f1',
    secondary: '#a855f7',
    grey: '#404040',
};

// Standard Loading Fallback
const LoadingFallback = () => (
    <div className="h-full flex items-center justify-center bg-black/50 backdrop-blur-xl z-[100]">
        <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] tracking-wider font-black text-zinc-500 uppercase">Loading component...</span>
        </div>
    </div>
);

interface SimulatorCanvasProps {
    nodes: any[];
    edges: any[];
    onNodesChange: (nds: any[]) => void;
    onEdgeDoubleClick: (e: any, edge: any) => void;
    shouldRenderMiniMap: boolean;
    showMiniMap: boolean;
    devices: any[];
    activeConsoleId: string | null;
    hotkeysModal: any;
    showOnboarding: boolean;
    completeOnboarding: () => void;
    skipOnboarding: () => void;
    handleAddDevice: (id: string, position?: { x: number; y: number }) => void;
    onNodeDoubleClick: (e: any, node: any) => void;
}

export default function SimulatorCanvas({
    nodes, edges, onNodesChange, onEdgeDoubleClick,
    shouldRenderMiniMap, showMiniMap, devices,
    /* activeConsoleId, */ hotkeysModal,
    showOnboarding, completeOnboarding, skipOnboarding,
    handleAddDevice, onNodeDoubleClick
}: SimulatorCanvasProps) {
    const { openConsoleIds, addCable, removeCable, devices: storeDevices } = useNetworkStore();
    // Removed automation/replay/flashcards state

    const hasOpenConsoles = openConsoleIds.length > 0;
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null); // Store instance for project()

    const onConnect = useCallback((params: any) => {
        const { source, sourceHandle, target, targetHandle } = params;
        console.log('Attempting connection:', params);

        if (!source || !sourceHandle || !target || !targetHandle) return;

        // Strip suffixes (-s, -t) from handles to get real port IDs
        const sPortId = sourceHandle.replace(/-[st]$/, '');
        const tPortId = targetHandle.replace(/-[st]$/, '');

        // Check if ports are already connected
        const sourceDev = storeDevices.find(d => d.id === source);
        const targetDev = storeDevices.find(d => d.id === target);
        const sourcePort = sourceDev?.ports.find(p => p.id === sPortId);
        const targetPort = targetDev?.ports.find(p => p.id === tPortId);

        console.log('Source Port:', sourcePort, 'Target Port:', targetPort);

        if (sourcePort?.connectedCableId || targetPort?.connectedCableId) {
            console.warn('One of the ports is already occupied');
            return;
        }

        const cableId = `cable-${Math.random().toString(36).substring(2, 9)}`;
        addCable({
            id: cableId,
            sourceDeviceId: source,
            sourcePortId: sPortId, // Use stripped ID
            targetDeviceId: target,
            targetPortId: tPortId, // Use stripped ID
            type: sourcePort?.type === 'SFP' ? 'fiber' : 'copper',
            status: 'up'
        });
        console.log('Cable added successfully:', cableId);
    }, [addCable, storeDevices]);

    const isValidConnection = useCallback((connection: any) => {
        return connection.source !== connection.target;
    }, []);

    const handleMouseMove = useCallback((_e: React.MouseEvent) => {
        // Removed collaboration logic
    }, []);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            const model = event.dataTransfer.getData('application/model');

            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
                return;
            }

            // Get position
            const position = reactFlowInstance?.project({
                x: event.clientX,
                y: event.clientY,
            }) || { x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY };

            if (model) {
                handleAddDevice(model, position);
            }
        },
        [reactFlowInstance, handleAddDevice]
    );

    const miniMapNodeColor = (node: any) => {
        const device: any = node.data;
        if (device?.ospfEnabled) return colors.secondary;
        const up = device?.ports?.some((p: any) => p.status === 'up');
        return up ? colors.primary : colors.grey;
    };

    const miniMapNodeStrokeColor = (node: any) => {
        return node.selected ? colors.primary : 'rgba(255,255,255,0.1)';
    };

    const onEdgesDelete = useCallback((deletedEdges: any[]) => {
        deletedEdges.forEach(edge => {
            removeCable(edge.id);
        });
    }, [removeCable]);

    return (
        <div className="h-full w-full relative overflow-hidden bg-[#080808]">
            <ReactFlowProvider>
                <Hotkeys onAddSwitch={() => handleAddDevice('NS-Switch-L3-24')} />
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    onNodesChange={onNodesChange}
                    onEdgeDoubleClick={onEdgeDoubleClick}
                    onNodeDoubleClick={onNodeDoubleClick}
                    onConnect={onConnect}
                    isValidConnection={isValidConnection}
                    onEdgesDelete={onEdgesDelete}
                    // DND Handlers
                    onInit={setReactFlowInstance}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    fitView
                    snapToGrid
                    proOptions={{ hideAttribution: true }}
                    minZoom={0.05}
                    maxZoom={4}
                    defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
                    nodesDraggable={true}
                    nodesConnectable={true}
                    selectNodesOnDrag={false}
                    onlyRenderVisibleElements={true}
                    style={{ background: 'transparent' }}
                    onMouseMove={handleMouseMove}
                >
                    <Background
                        color="#ffffff"
                        gap={40}
                        size={1}
                        className="opacity-[0.03]"
                    />

                    <Controls className="!bg-black/60 !backdrop-blur-xl !border-white/10 !rounded-2xl !p-1 !shadow-2xl" />

                    {shouldRenderMiniMap && (
                        <MiniMap
                            className="minimap-custom !bg-black/40 !backdrop-blur-3xl !border-white/10 !rounded-[2rem] !shadow-2xl overflow-hidden"
                            nodeColor={miniMapNodeColor}
                            nodeStrokeColor={miniMapNodeStrokeColor}
                            maskColor="rgba(0, 0, 0, 0.7)"
                            nodeComponent={MiniMapNode}
                            pannable
                            zoomable
                        />
                    )}

                    {showMiniMap && devices.length >= 100 && (
                        <div className="absolute bottom-6 right-6 z-10 animate-fade-in-up">
                            <div className={cn(
                                'px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest',
                                'bg-netsim-purple/10 text-netsim-purple border border-netsim-purple/20 backdrop-blur-xl'
                            )}>
                                MiniMap disabled • High Density ({devices.length} Nodes)
                            </div>
                        </div>
                    )}
                </ReactFlow>
            </ReactFlowProvider>

            {/* ============================================ */}
            {/* CLI SIDE PANEL */}
            {/* ============================================ */}
            {hasOpenConsoles && (
                <div
                    className={cn(
                        'absolute right-0 top-0 bottom-0 z-[1100] animate-fade-in-right',
                        'w-full md:w-[600px]',
                        'glass-panel-dark border-l border-white/10 shadow-[-30px_0_100px_rgba(0,0,0,0.8)]',
                        'flex flex-col overflow-hidden'
                    )}
                >
                    <Suspense fallback={<LoadingFallback />}>
                        <Console />
                    </Suspense>
                </div>
            )}

            {/* ============================================ */}
            {/* GLOBAL OVERLAYS */}
            {/* ============================================ */}

            <Suspense fallback={null}>
                <Inspector />
            </Suspense>

            <Suspense fallback={null}>
                <HotkeysModal isOpen={hotkeysModal.isOpen} onClose={hotkeysModal.close} />
            </Suspense>

            {showOnboarding && (
                <Suspense fallback={null}>
                    <Onboarding onComplete={completeOnboarding} onSkip={skipOnboarding} />
                </Suspense>
            )}

            {/* Removed Replay, Flashcards buttons */}

            {/* CUSTOM STYLE FOR REACT FLOW CONTROLS */}
            <style>{`
        .react-flow__controls-button {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
          color: rgba(255, 255, 255, 0.4) !important;
          background: transparent !important;
          transition: all 0.2s ease !important;
        }
        .react-flow__controls-button:hover {
          color: #00f2fe !important;
          background: rgba(0, 242, 254, 0.1) !important;
        }
        .react-flow__controls-button svg {
          fill: currentColor !important;
        }
        .minimap-custom {
          right: 24px !important;
          bottom: 24px !important;
          width: 240px !important;
          height: 160px !important;
        }
      `}</style>
        </div>
    );
}
