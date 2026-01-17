import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { NetworkPort } from '../../types/NetworkTypes';
import { useNetworkStore } from '../../store/useNetworkStore';
import { useUiStore } from '../../store/useUiStore';
import { cn } from '../../utils/cn';
import { Circle, Hexagon, ArrowLeftRight } from 'lucide-react'; // Import icon for Trunk

interface PortProps {
  port: NetworkPort;
  deviceId: string;
}

export const Port = memo(({ port, deviceId }: PortProps) => {
  const { onPortClick, selectedPort, insertSfp, pendingSfpModule } = useNetworkStore();
  const { addToast } = useUiStore();

  const isSFP = port.type === 'SFP';
  const hasModule = !!port.sfpModule;
  const isSelected = selectedPort?.deviceId === deviceId && selectedPort?.portId === port.id;
  const isPendingModule = pendingSfpModule && isSFP && !hasModule;

  // Logical States
  const hasCable = !!port.connectedCableId;
  const isUp = port.status === 'up';
  const isAdminDown = !port.config.enabled;

  // New: L2 Modes
  const isTrunk = port.config.mode === 'trunk';
  const vlanInfo = isTrunk
    ? `Trunk (Allow: ${port.config.allowedVlans?.join(',') || '1'})`
    : `Access (VLAN: ${port.config.vlan})`;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const res = onPortClick(deviceId, port.id);
    if (!res.success && res.message) addToast(res.message, 'error');
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (isSFP) {
      if (!hasModule) insertSfp(deviceId, port.id, '10G-LR');
      else alert(`Info SFP: ${port.sfpModule?.model}`);
    }
  };

  return (
    <div
      className={cn(
        "nodrag relative group flex items-center justify-center w-5 h-5 cursor-pointer z-50",
        isPendingModule && "animate-pulse",
        // Glow amber when module present but no link yet
        isSFP && hasModule && !isUp && "animate-pulse"
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Enhanced Tooltip */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition z-50 whitespace-nowrap border border-gray-600 shadow-xl flex flex-col items-center">
        <span className="font-bold text-yellow-500">{port.name}</span>
        <span className="text-gray-300">{isAdminDown ? '(SHUTDOWN)' : vlanInfo}</span>
        {port.config.ipAddress && <span className="text-green-400">{port.config.ipAddress}</span>}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id={`${deviceId}__${port.id}`}
        className="!opacity-0 !w-px !h-px !absolute !top-1/2 !left-1/2"
      />
      <Handle
        type="target"
        position={Position.Top}
        id={`${deviceId}__${port.id}`}
        className="!opacity-0 !w-px !h-px !absolute !top-1/2 !left-1/2"
      />

      {/* Port Visual */}
      <div
        className={cn(
          "w-4 h-4 flex items-center justify-center rounded-[2px] border transition-all duration-300",
          // Base background
          isSFP ? "bg-[#0f172a]" : "bg-[#1a1510]",

          // Borders based on L2 state (New)
          !isUp && "border-transparent",
          isUp && !isTrunk && "border-green-500/50", // Access normal
          isUp && isTrunk && "border-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.4)]", // Trunk glows orange

          // SFP specific states
          isSFP && hasModule && !isUp && "border-amber-400 bg-amber-900/30 shadow-[0_0_6px_rgba(251,191,36,0.5)]",
          isSFP && hasModule && isUp && "border-green-400 bg-green-900/30 shadow-[0_0_10px_rgba(74,222,128,0.5)]",

          // Error/shutdown states overwrite
          !isUp && hasCable && isAdminDown && "bg-red-900/80 border-red-600",
          !isUp && hasCable && !isAdminDown && "bg-yellow-900/50 border-yellow-700",

          isSelected && "ring-2 ring-white animate-pulse bg-white",
        )}
      >
        {/* Internal iconography */}
        {isSFP ? (
          <Hexagon
            size={10}
            className={cn(
              // Installed + link up -> green
              hasModule && isUp && "text-green-300 fill-green-900 drop-shadow-[0_0_6px_rgba(74,222,128,0.8)]",
              // Installed without link -> amber blink
              hasModule && !isUp && "text-amber-300 fill-amber-900 animate-pulse drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]",
              // No module -> blue base
              !hasModule && "text-blue-900",
              // Pending mode highlights the slot
              isPendingModule && "ring-1 ring-amber-400 ring-offset-1 ring-offset-slate-900"
            )}
          />
        ) : (
          <>
            {isTrunk && isUp ? (
              // Special icon for Trunk
              <ArrowLeftRight size={10} className="text-orange-400" />
            ) : (
              <Circle size={6} className={cn(
                "fill-current",
                isUp ? "text-green-400" : (hasCable ? "text-yellow-600" : "text-yellow-800")
              )} />
            )}
          </>
        )}
      </div>
    </div>
  );
});

Port.displayName = 'Port';
