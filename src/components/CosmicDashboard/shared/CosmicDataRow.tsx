import CosmicStatusOrb from './CosmicStatusOrb';

interface CosmicDataRowProps {
  icon?: string;
  label: string;
  value: string | number;
  valueColor?: string;
  sublabel?: string;
  badge?: { text: string; variant: 'positive' | 'neutral' | 'negative' | 'special' };
  noBorder?: boolean;
}

export default function CosmicDataRow({
  icon,
  label,
  value,
  valueColor,
  sublabel,
  badge,
  noBorder = false,
}: CosmicDataRowProps) {
  return (
    <div
      className={`flex items-center gap-3 py-2 ${noBorder ? '' : 'border-b border-white/[0.04]'}`}
    >
      {icon && (
        <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-sm flex-shrink-0">
          {icon}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <span className="text-[10px] uppercase tracking-[0.15em] text-gray-500">{label}</span>
        {sublabel && <span className="text-[9px] text-gray-600 ml-1.5">{sublabel}</span>}
      </div>
      <div className="flex items-center gap-2">
        <span
          className="text-sm font-semibold font-mono tabular-nums"
          style={{ color: valueColor ?? '#fff' }}
        >
          {value}
        </span>
        {badge && (
          <CosmicStatusOrb status={badge.variant} size="sm" label={badge.text} />
        )}
      </div>
    </div>
  );
}
