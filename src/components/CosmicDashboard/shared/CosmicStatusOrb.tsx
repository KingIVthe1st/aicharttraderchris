const STATUS_COLORS = {
  positive: { core: '#10B981', glow: 'rgba(16,185,129,0.5)', ring: 'rgba(16,185,129,0.2)' },
  neutral:  { core: '#94A3B8', glow: 'rgba(148,163,184,0.3)', ring: 'rgba(148,163,184,0.1)' },
  negative: { core: '#EF4444', glow: 'rgba(239,68,68,0.5)',  ring: 'rgba(239,68,68,0.2)' },
  special:  { core: '#F6C453', glow: 'rgba(246,196,83,0.5)',  ring: 'rgba(246,196,83,0.2)' },
};

const SIZES = { sm: 8, md: 12, lg: 16 };

interface CosmicStatusOrbProps {
  status: 'positive' | 'neutral' | 'negative' | 'special';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  label?: string;
}

export default function CosmicStatusOrb({
  status,
  size = 'md',
  pulse = false,
  label,
}: CosmicStatusOrbProps) {
  const s = SIZES[size];
  const c = STATUS_COLORS[status];

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="relative inline-block rounded-full flex-shrink-0"
        style={{ width: s, height: s }}
      >
        <span
          className={`absolute inset-[-3px] rounded-full ${pulse ? 'animate-pulse' : ''}`}
          style={{ background: `radial-gradient(circle, ${c.ring} 0%, transparent 70%)` }}
        />
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at 40% 35%, ${c.core}, ${c.core}90)`,
            boxShadow: `0 0 ${s}px ${c.glow}`,
          }}
        />
      </span>
      {label && (
        <span className="text-xs font-medium text-gray-300">{label}</span>
      )}
    </span>
  );
}
