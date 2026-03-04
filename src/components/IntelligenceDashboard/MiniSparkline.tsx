import { useMemo } from "react";

interface MiniSparklineProps {
  data: number[];
  color: string;
  height?: number;
  width?: number;
  showArea?: boolean;
  showEndDot?: boolean;
  strokeWidth?: number;
}

/**
 * Mini Sparkline - Lightweight trend visualization
 * Used across dashboard gauges to show historical context
 */
export function MiniSparkline({
  data,
  color,
  height = 24,
  width = 60,
  showArea = true,
  showEndDot = true,
  strokeWidth = 1.5,
}: MiniSparklineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((value, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 4); // Leave padding
      return `${x},${y}`;
    })
    .join(" ");

  const gradientId = useMemo(
    () => `sparkline-gradient-${Math.random().toString(36).slice(2)}`,
    [],
  );

  const endY = height - ((data[data.length - 1] - min) / range) * (height - 4);

  return (
    <svg
      width={width}
      height={height}
      className="overflow-visible"
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      {showArea && (
        <polygon
          points={`0,${height} ${points} ${width},${height}`}
          fill={`url(#${gradientId})`}
        />
      )}
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End point dot with glow */}
      {showEndDot && (
        <>
          <circle cx={width} cy={endY} r="3" fill={color} opacity="0.3" />
          <circle cx={width} cy={endY} r="2" fill={color} />
        </>
      )}
    </svg>
  );
}

/**
 * Generate simulated historical trend data
 * Creates data that trends toward the current value with realistic noise
 */
export function generateTrendData(
  currentValue: number,
  periods: number = 10,
  volatility: number = 0.15,
  baseValue?: number,
): number[] {
  const start = baseValue ?? currentValue * (1 - volatility * 2);
  return Array.from({ length: periods }, (_, i) => {
    const progress = i / (periods - 1);
    const trendValue = start + (currentValue - start) * progress;
    const noise = (Math.random() - 0.5) * Math.abs(currentValue) * volatility;
    // Last point is always exact current value
    if (i === periods - 1) return currentValue;
    return trendValue + noise;
  });
}
