import { BaseEdge, EdgeProps, getSmoothStepPath, EdgeLabelRenderer, Position } from 'reactflow';
import { useNetworkStore } from '../../store/useNetworkStore';

export const PacketEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  source,
  target,
  sourceHandleId,
  targetHandleId,
  style = {},
  markerEnd,
  data,
}: EdgeProps) => {

  const devices = useNetworkStore((state) => state.devices);

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isTransmitting = data?.isTransmitting;

  // --- 1. Get Port Info ---
  const getPortInfo = (deviceId: string, handleId?: string | null) => {
    if (!handleId) return null;
    const portId = handleId.split('__')[1];
    const device = devices.find(d => d.id === deviceId);
    const port = device?.ports.find(p => p.id === portId);

    if (!port) return null;

    const shortName = port.name
      .replace('GigabitEthernet', 'GE')
      .replace('Ethernet', 'E');

    return {
      name: shortName,
      ip: port.config.ipAddress
    };
  };

  const sourceInfo = getPortInfo(source, sourceHandleId);
  const targetInfo = getPortInfo(target, targetHandleId);

  // --- 2. Calculate Dynamic Label Position ---
  // This prevents the label from covering the switch. Pushes text outwards.
  const getLabelTransform = (x: number, y: number, pos: Position) => {
    const offset = 8; // Distance in pixels from the port

    switch (pos) {
      case Position.Top:
        // Anchor: bottom of text. Move up (Y - offset)
        return `translate(-50%, -100%) translate(${x}px, ${y - offset}px)`;
      case Position.Bottom:
        // Anchor: top of text. Move down (Y + offset)
        return `translate(-50%, 0%) translate(${x}px, ${y + offset}px)`;
      case Position.Left:
        // Anchor: right of text. Move left
        return `translate(-100%, -50%) translate(${x - offset}px, ${y}px)`;
      case Position.Right:
        // Anchor: left of text. Move right
        return `translate(0%, -50%) translate(${x + offset}px, ${y}px)`;
      default:
        return `translate(-50%, -50%) translate(${x}px, ${y}px)`;
    }
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />

      {isTransmitting && (
        <circle r="4" fill="#ffffff">
          <animateMotion dur="1.5s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}

      <EdgeLabelRenderer>
        {/* Source Label */}
        {sourceInfo && (
          <div
            style={{
              position: 'absolute',
              transform: getLabelTransform(sourceX, sourceY, sourcePosition),
              pointerEvents: 'none',
            }}
            className="nodrag z-50"
          >
            <div className="bg-black/90 text-[8px] text-gray-300 px-1.5 py-0.5 rounded border border-gray-700 shadow-xl backdrop-blur-sm whitespace-nowrap flex flex-col items-center">
              <span className="font-mono text-yellow-500 font-bold leading-none mb-0.5">{sourceInfo.name}</span>
              {sourceInfo.ip && <span className="text-green-400 font-mono leading-none">{sourceInfo.ip}</span>}
            </div>
          </div>
        )}

        {/* Destination Label */}
        {targetInfo && (
          <div
            style={{
              position: 'absolute',
              transform: getLabelTransform(targetX, targetY, targetPosition),
              pointerEvents: 'none',
            }}
            className="nodrag z-50"
          >
            <div className="bg-black/90 text-[8px] text-gray-300 px-1.5 py-0.5 rounded border border-gray-700 shadow-xl backdrop-blur-sm whitespace-nowrap flex flex-col items-center">
              <span className="font-mono text-yellow-500 font-bold leading-none mb-0.5">{targetInfo.name}</span>
              {targetInfo.ip && <span className="text-green-400 font-mono leading-none">{targetInfo.ip}</span>}
            </div>
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
};
