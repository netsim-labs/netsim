import { BaseEdge, EdgeLabelRenderer, getBezierPath, useReactFlow, EdgeProps } from 'reactflow';
import { useState, memo } from 'react';
import { useNetworkStore } from '../../store/useNetworkStore';

const SmartEdge = memo(function SmartEdge({
    id,
    sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition,
    style = {},
    markerEnd,
    data,
    selected,
}: EdgeProps) {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX, sourceY, sourcePosition,
        targetX, targetY, targetPosition,
    });
    const { deleteElements } = useReactFlow();
    const removeCable = useNetworkStore(state => state.removeCable);
    const [isHovered, setIsHovered] = useState(false);

    const onEdgeDelete = (evt: React.MouseEvent) => {
        evt.stopPropagation();
        // We call our store to handle the side effects (ports down)
        removeCable(id);
        // And also tell React Flow to remove it from selection/view
        deleteElements({ edges: [{ id }] });
    };

    const isFiber = data?.type === 'fiber' || data?.type === 'Fiber';
    const cableColor = selected || isHovered ? '#fbbf24' : (isFiber ? '#a855f7' : '#64748b');

    return (
        <>
            <BaseEdge
                path={edgePath}
                markerEnd={markerEnd}
                style={{
                    ...style,
                    strokeWidth: 3,
                    stroke: cableColor,
                    filter: (selected || isHovered) ? 'drop-shadow(0 0 6px #fbbf24)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                }}
                interactionWidth={20}
            />

            {/* Invisible Hover Area Handler */}
            <path
                d={edgePath}
                fill="none"
                strokeOpacity={0}
                strokeWidth={20}
                className="react-flow__edge-interaction cursor-pointer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onDoubleClick={onEdgeDelete}
            />

            {(isHovered || selected) && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            background: '#0f172a',
                            color: '#fbbf24',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: 11,
                            fontWeight: 800,
                            border: '2px solid #fbbf24',
                            pointerEvents: 'none',
                            zIndex: 1000,
                            boxShadow: '0 0 15px rgba(251, 191, 36, 0.4)',
                            fontFamily: 'monospace',
                            letterSpacing: '0.05em',
                        }}
                        className="nodrag nopan animate-scale-in"
                    >
                        {data?.sourcePortName} ↔ {data?.targetPortName}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
});

export default SmartEdge;
