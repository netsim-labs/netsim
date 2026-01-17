import { memo, useState } from 'react';
import { getBezierPath, EdgeProps, BaseEdge } from 'reactflow';
import { useNetworkStore } from '../store/useNetworkStore';
import { cn } from '../utils/cn';

/**
 * NetworkCable: Custom React Flow edge representing physical cabling.
 * Pure Tailwind/CSS implementation - No MUI dependencies.
 */
const NetworkCable = memo(function NetworkCable({
  id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, selected,
}: EdgeProps) {
  const { removeCable } = useNetworkStore();
  const [hovered, setHovered] = useState(false);
  const [edgePath] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });

  const isFiber = data?.type === 'Fiber';
  const isTrunk = data?.trunkId !== undefined;

  // Color palette - synced with design system
  const cableColor = isTrunk ? '#00f2fe' : (isFiber ? '#a855f7' : '#facc15');

  const isPartialTrunk = isTrunk && data?.trunkState === 'partial';
  const trafficActive = data?.trafficActive;

  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;
  const label = data?.label as string | undefined;

  return (
    <g
      onDoubleClick={(e) => { e.stopPropagation(); removeCable(id); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="cursor-pointer"
    >
      <defs>
        <filter id={`glow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Interaction Layer (invisible wider stroke) */}
      <path d={edgePath} fill="none" stroke="transparent" strokeWidth={30} />

      {/* Ambient Glow */}
      <path
        d={edgePath}
        fill="none"
        stroke={cableColor}
        strokeWidth={selected ? 12 : 6}
        opacity={selected || hovered ? 0.3 : 0.15}
        className="transition-all duration-300"
        style={{ filter: 'blur(8px)' }}
      />

      {/* Core Shadow */}
      <path
        d={edgePath}
        fill="none"
        stroke="rgba(0,0,0,0.5)"
        strokeWidth={isFiber ? 3 : 5}
        className="transition-all duration-300"
      />

      {/* Main Core Path */}
      <BaseEdge
        path={edgePath}
        style={{
          stroke: selected ? '#fff' : cableColor,
          strokeWidth: isFiber ? 1.5 : 3,
          strokeDasharray: isPartialTrunk ? '8 8' : '0',
          transition: 'all 0.3s ease-in-out',
          filter: (selected || hovered) ? `drop-shadow(0 0 8px ${cableColor})` : 'none'
        }}
      />

      {/* Traffic Pulse Animation */}
      {trafficActive && (
        <path
          d={edgePath}
          fill="none"
          stroke={isFiber ? '#fff' : cableColor}
          strokeWidth={isFiber ? 1.5 : 2.5}
          strokeDasharray="10 20"
          strokeLinecap="round"
          className="animate-traffic-flow"
          style={{
            filter: `drop-shadow(0 0 5px ${cableColor})`,
            opacity: 0.9
          }}
        />
      )}

      {/* Port Labels Display on Hover / Selection */}
      {label && (
        <g
          transform={`translate(${midX}, ${midY})`}
          className={cn(
            "pointer-events-none transition-all duration-500",
            (hovered || selected) ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-2"
          )}
        >
          {/* Glass-panel label box */}
          <rect
            x={-80} y={-16} rx={12} ry={12}
            width={160} height={32}
            className="fill-black/80 backdrop-blur-xl stroke-white/20"
            style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}
          />

          <text
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-white text-[10px] font-black uppercase tracking-[0.1em]"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
          >
            {label}
          </text>

          {/* Connection Indicator Pips */}
          <circle cx={-80} cy={0} r={3} fill={cableColor} className="animate-pulse" />
          <circle cx={80} cy={0} r={3} fill={cableColor} className="animate-pulse" />
        </g>
      )}
    </g>
  );
});

export default NetworkCable;
