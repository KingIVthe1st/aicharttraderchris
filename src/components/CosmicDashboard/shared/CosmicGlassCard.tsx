import { type ReactNode } from 'react';

const ACCENT_COLORS: Record<string, { border: string; glow: string; line: string }> = {
  nebula:  { border: 'border-[#6D5BFF]/15 hover:border-[#6D5BFF]/25', glow: '0 0 30px rgba(109,91,255,0.08)',  line: 'bg-[#6D5BFF]/30' },
  aurora:  { border: 'border-[#2EC5FF]/15 hover:border-[#2EC5FF]/25', glow: '0 0 30px rgba(46,197,255,0.08)',  line: 'bg-[#2EC5FF]/30' },
  solar:   { border: 'border-[#F6C453]/15 hover:border-[#F6C453]/25', glow: '0 0 30px rgba(246,196,83,0.08)',  line: 'bg-[#F6C453]/30' },
  emerald: { border: 'border-emerald-500/15 hover:border-emerald-500/25', glow: '0 0 30px rgba(16,185,129,0.08)', line: 'bg-emerald-500/30' },
  red:     { border: 'border-red-500/15 hover:border-red-500/25',     glow: '0 0 30px rgba(239,68,68,0.08)',   line: 'bg-red-500/30' },
  amber:   { border: 'border-amber-500/15 hover:border-amber-500/25', glow: '0 0 30px rgba(245,158,11,0.08)',  line: 'bg-amber-500/30' },
  indigo:  { border: 'border-indigo-500/15 hover:border-indigo-500/25', glow: '0 0 30px rgba(99,102,241,0.08)', line: 'bg-indigo-500/30' },
};

const VARIANT_STYLES = {
  default: {
    glass: 'bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-transparent backdrop-blur-xl',
    shadow: '0 4px 16px rgba(0,0,0,0.2)',
  },
  elevated: {
    glass: 'bg-gradient-to-br from-white/[0.06] via-white/[0.03] to-transparent backdrop-blur-xl',
    shadow: '0 8px 32px rgba(0,0,0,0.4)',
  },
  sunken: {
    glass: 'bg-gradient-to-br from-white/[0.02] via-white/[0.01] to-transparent backdrop-blur-lg',
    shadow: 'inset 0 2px 8px rgba(0,0,0,0.3)',
  },
};

interface CosmicGlassCardProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'sunken';
  accentColor?: keyof typeof ACCENT_COLORS;
  glowIntensity?: 'none' | 'subtle' | 'medium' | 'strong';
  className?: string;
  noPadding?: boolean;
}

export default function CosmicGlassCard({
  children,
  variant = 'default',
  accentColor = 'nebula',
  glowIntensity = 'subtle',
  className = '',
  noPadding = false,
}: CosmicGlassCardProps) {
  const accent = ACCENT_COLORS[accentColor] ?? ACCENT_COLORS.nebula;
  const v = VARIANT_STYLES[variant];

  const glowMultiplier = { none: 0, subtle: 1, medium: 2, strong: 3 }[glowIntensity];
  const boxShadow = glowMultiplier === 0
    ? v.shadow
    : `${v.shadow}, ${accent.glow.replace('0.08', String(0.08 * glowMultiplier))}`;

  return (
    <div
      className={`relative rounded-2xl ${accent.border} ${v.glass} transition-colors duration-300 ${noPadding ? '' : 'p-5'} ${className}`}
      style={{ boxShadow }}
    >
      <div className={`absolute top-0 left-6 w-10 h-[2px] rounded-full ${accent.line}`} />
      {children}
    </div>
  );
}
