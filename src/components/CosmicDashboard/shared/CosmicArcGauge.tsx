import { useId } from 'react';
import { motion } from 'framer-motion';

interface CosmicArcGaugeProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  label?: string;
  sublabel?: string;
  showGlow?: boolean;
  animate?: boolean;
}

export default function CosmicArcGauge({
  value,
  size = 120,
  strokeWidth = 8,
  color,
  label,
  sublabel,
  showGlow = true,
  animate = true,
}: CosmicArcGaugeProps) {
  const id = useId();
  const center = size / 2;
  const radius = center - strokeWidth - 4;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75;
  const filledLength = arcLength * Math.min(1, Math.max(0, value));
  const startAngle = 135;
  const lighterColor = color + '99';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          {showGlow && (
            <filter id={`glow-${id}`}>
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
          <linearGradient id={`grad-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={lighterColor} />
          </linearGradient>
        </defs>

        {/* Track ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(${startAngle} ${center} ${center})`}
        />

        {/* Tick marks at 25%, 50%, 75% */}
        {[0.25, 0.5, 0.75].map((pct) => {
          const angle = startAngle + 270 * pct;
          const rad = (angle * Math.PI) / 180;
          const outerR = radius + strokeWidth / 2 + 2;
          const innerR = radius - strokeWidth / 2 - 2;
          return (
            <line
              key={pct}
              x1={center + innerR * Math.cos(rad)}
              y1={center + innerR * Math.sin(rad)}
              x2={center + outerR * Math.cos(rad)}
              y2={center + outerR * Math.sin(rad)}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={1}
            />
          );
        })}

        {/* Value ring */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#grad-${id})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          transform={`rotate(${startAngle} ${center} ${center})`}
          filter={showGlow ? `url(#glow-${id})` : undefined}
          initial={animate ? { strokeDashoffset: arcLength } : { strokeDashoffset: arcLength - filledLength }}
          animate={{ strokeDashoffset: arcLength - filledLength }}
          transition={animate ? { duration: 1.2, ease: [0.34, 1.56, 0.64, 1] } : { duration: 0 }}
        />
      </svg>

      {(label || sublabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {label && (
            <span
              className="font-mono font-black tabular-nums tracking-wider text-white"
              style={{ fontSize: size * 0.22, textShadow: `0 0 10px ${color}40` }}
            >
              {label}
            </span>
          )}
          {sublabel && (
            <span className="text-gray-500 uppercase tracking-widest" style={{ fontSize: size * 0.08 }}>
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
