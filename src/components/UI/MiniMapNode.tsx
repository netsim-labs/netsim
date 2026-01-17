import type { CSSProperties } from 'react';

type MiniMapNodeProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  id: string;
  data?: any;
  style?: CSSProperties;
  strokeColor: string;
  strokeWidth: number;
  borderRadius: number;
};

// Color palette (replaces MUI theme)
const colors = {
  success: '#22c55e',
  primary: '#6366f1',
  secondary: '#a855f7',
  info: '#06b6d4',
  warning: '#f59e0b',
  grey: '#404040',
  text: '#9ca3af',
};

/**
 * Custom MiniMap Node for React Flow.
 * Rendered within the minimap SVG for optimized performance.
 * Pure implementation - No MUI dependencies.
 */
export default function MiniMapNode({
  x,
  y,
  width,
  height,
  strokeColor,
  strokeWidth,
  borderRadius,
  id,
  data,
}: MiniMapNodeProps) {
  const label = data?.hostname || id;
  const hasOspf = data?.ospfEnabled;
  const anyUp = data?.ports?.some((p: any) => p.status === 'up');
  const isActive = data?.isActive;
  const isNeighbor = data?.isNeighbor && !isActive;

  // Theme-independent color logic
  const fillBase = hasOspf
    ? colors.success
    : anyUp
      ? colors.primary
      : colors.grey;

  const fill = isActive
    ? colors.secondary
    : isNeighbor
      ? colors.info
      : fillBase;

  const stroke = isActive
    ? colors.warning
    : isNeighbor
      ? colors.warning
      : data?.selected ? colors.secondary : strokeColor;

  return (
    <g transform={`translate(${x},${y})`}>
      <rect
        width={width}
        height={height}
        rx={borderRadius}
        ry={borderRadius}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        style={{ transition: 'fill 0.3s, stroke 0.3s' }}
      />
      <text
        x={width / 2}
        y={height + 14}
        textAnchor="middle"
        fontSize={10}
        fill={colors.text}
        style={{
          fontFamily: 'Inter, Roboto, sans-serif',
          fontWeight: 700,
          pointerEvents: 'none',
          textTransform: 'uppercase'
        }}
      >
        {label}
      </text>
    </g>
  );
}
