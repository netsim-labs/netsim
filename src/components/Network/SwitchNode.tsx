import React, { memo } from 'react';
import { NodeProps } from 'reactflow';
import { NetworkDevice } from '../../types/NetworkTypes';
import { useNetworkStore } from '../../store/useNetworkStore';
import { Port } from './Port';
import { Server, TerminalSquare, Router as RouterIcon, Trash2, Shield, Wifi, Box } from 'lucide-react'; // <--- Import Trash2, Shield, Wifi
import { cn } from '../../utils/cn';
import { VxlanBadge } from './VxlanBadge';

export const SwitchNode = memo(({ data, selected }: NodeProps<NetworkDevice>) => {
    const { openConsole, removeDevice } = useNetworkStore(); // <--- Bring removeDevice
    const isRouter = data.model.includes('Router') || data.model.includes('AR') || data.model.includes('ISR');
    const isFirewall = data.model.includes('USG') || data.model.includes('ASA');
    const isWireless = data.model.includes('AC') || data.model.includes('WLC');
    const is24Port = data.model.includes('24') || data.model.includes('28');

    const rj45Ports = data.ports.filter(p => p.type === 'RJ45');
    const sfpPorts = data.ports.filter(p => p.type === 'SFP');

    let widthClass = "w-[580px]";
    if (isRouter || isFirewall) widthClass = "w-[300px]";
    else if (is24Port || isWireless) widthClass = "w-[360px]";

    let containerStyle = "bg-[#151619] border-gray-600";
    let headerStyle = "bg-gray-800 border-gray-700";

    if (isRouter) {
        containerStyle = "bg-[#151210] border-orange-500/50";
        headerStyle = "bg-orange-900/30 border-orange-800";
    } else if (isFirewall) {
        containerStyle = "bg-[#1a0f0f] border-red-500/50";
        headerStyle = "bg-red-900/30 border-red-800";
    } else if (isWireless) {
        containerStyle = "bg-[#0f1a15] border-emerald-500/50";
        headerStyle = "bg-emerald-900/30 border-emerald-800";
    }

    // Delete handler
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent node selection
        // Simple confirmation
        if (window.confirm(`Delete ${data.hostname}? Cables will be disconnected.`)) {
            removeDevice(data.id);
        }
    };

    return (
        <div
            className={cn(
                "rounded border-2 shadow-2xl overflow-hidden transition-all duration-200",
                containerStyle,
                selected && "ring-2 ring-white/20",
                widthClass
            )}
        >
            {/* Header */}
            <div className={cn("px-3 py-1.5 border-b flex items-center justify-between", headerStyle)}>
                <div className="flex items-center gap-2">
                    {isRouter && <RouterIcon size={14} className="text-orange-500" />}
                    {isFirewall && <Shield size={14} className="text-red-500" />}
                    {isWireless && <Wifi size={14} className="text-emerald-500" />}
                    {!isRouter && !isFirewall && !isWireless && <Server size={14} className="text-blue-400" />}
                    <span className="text-xs font-bold text-gray-200 tracking-wider font-mono">{data.hostname}</span>
                    <span className="text-[9px] text-gray-500 ml-2 uppercase">{data.model}</span>
                    {data.vxlanVnis && data.vxlanVnis.length > 0 && (
                        <div className="ml-2">
                            <VxlanBadge count={data.vxlanVnis.length} />
                        </div>
                    )}
                    {data.containerlab && (
                        <div className="ml-2" title="Containerlab Configured">
                            <Box size={14} className="text-blue-400" />
                        </div>
                    )}
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex items-center gap-1">
                    {/* Console Button */}
                    <button
                        onClick={(e) => { e.stopPropagation(); openConsole(data.id); }}
                        className="nodrag p-1 text-gray-400 hover:text-green-400 transition hover:bg-white/10 rounded"
                        title="Open Console"
                    >
                        <TerminalSquare size={14} />
                    </button>

                    {/* Delete Button */}
                    <button
                        onClick={handleDelete}
                        className="nodrag p-1 text-gray-500 hover:text-red-500 transition hover:bg-red-500/10 rounded"
                        title="Delete Device"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* Front Panel (Same as before) */}
            <div className="p-2 flex items-center gap-2 bg-[#0a0a0a]">
                {rj45Ports.length > 0 && (
                    <div className="flex-1">
                        <div className="text-[8px] text-gray-600 mb-0.5 uppercase tracking-widest pl-1">Ethernet</div>
                        <div className={cn("grid gap-x-1 gap-y-1", isRouter ? "grid-cols-4" : "grid-cols-12")}>
                            {rj45Ports.map((port) => <Port key={port.id} port={port} deviceId={data.id} />)}
                        </div>
                    </div>
                )}
                {rj45Ports.length > 0 && sfpPorts.length > 0 && <div className="w-px h-10 bg-gray-800 mx-1"></div>}
                {sfpPorts.length > 0 && (
                    <div className="flex-shrink-0">
                        <div className="text-[8px] text-blue-500/50 mb-0.5 uppercase tracking-widest text-right pr-1">Uplink</div>
                        <div className="grid grid-cols-2 gap-1">
                            {sfpPorts.map((port) => <Port key={port.id} port={port} deviceId={data.id} />)}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="bg-black py-0.5 px-2 text-[8px] text-gray-600 flex justify-between font-mono">
                <span>{data.vendor} VRP</span>
                <span>{data.ports.filter(p => p.status === 'up').length} UP</span>
            </div>
        </div>
    );
});

SwitchNode.displayName = 'SwitchNode';
