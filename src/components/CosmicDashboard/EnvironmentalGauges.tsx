import type { EnvironmentalEnergy } from '@/types/cosmic';
import CosmicGlassCard from './shared/CosmicGlassCard';
import CosmicArcGauge from './shared/CosmicArcGauge';
import CosmicStatusOrb from './shared/CosmicStatusOrb';
import CosmicInfoTooltip from './shared/CosmicInfoTooltip';
import { COSMIC_TOOLTIPS } from './config/cosmicTooltips';

interface Props {
  env: EnvironmentalEnergy;
}

/* ── colour helpers ── */
function kColor(k: number): string {
  if (k <= 3) return '#10B981';
  if (k <= 5) return '#F59E0B';
  return '#EF4444';
}

function schumannColor(s: EnvironmentalEnergy['schumannResonance']): string {
  if (s === 'normal') return '#10B981';
  if (s === 'elevated') return '#F59E0B';
  return '#EF4444';
}

function schumannNorm(s: EnvironmentalEnergy['schumannResonance']): number {
  if (s === 'normal') return 0.33;
  if (s === 'elevated') return 0.66;
  return 1.0;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const STATUS_TEXT: Record<EnvironmentalEnergy['overallStatus'], string> = {
  green: 'Favorable Conditions',
  amber: 'Moderate Interference',
  red: 'High Interference',
};

const STATUS_ORB_MAP: Record<EnvironmentalEnergy['overallStatus'], 'positive' | 'neutral' | 'negative'> = {
  green: 'positive',
  amber: 'neutral',
  red: 'negative',
};

const ACCENT_MAP: Record<EnvironmentalEnergy['overallStatus'], 'emerald' | 'amber' | 'red'> = {
  green: 'emerald',
  amber: 'amber',
  red: 'red',
};

const STATUS_BORDER_COLOR: Record<EnvironmentalEnergy['overallStatus'], string> = {
  green: 'rgba(16,185,129,0.25)',
  amber: 'rgba(245,158,11,0.25)',
  red: 'rgba(239,68,68,0.25)',
};

const STATUS_BG_COLOR: Record<EnvironmentalEnergy['overallStatus'], string> = {
  green: 'rgba(16,185,129,0.06)',
  amber: 'rgba(245,158,11,0.06)',
  red: 'rgba(239,68,68,0.06)',
};

export default function EnvironmentalGauges({ env }: Props) {
  const accentColor = ACCENT_MAP[env.overallStatus];
  const showVignette = env.overallStatus === 'amber' || env.overallStatus === 'red';

  return (
    <CosmicGlassCard accentColor={accentColor}>
      <div className="relative">
        {/* Title */}
        <p className="text-[11px] text-white/30 uppercase tracking-[0.2em] font-medium mb-5">
          Earth Sensor Array
        </p>

        {/* 3-column gauge grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center justify-items-center">
          {/* Schumann -- left */}
          <div className="flex flex-col items-center gap-2">
            <CosmicInfoTooltip label="Schumann Resonance">
              <p>{COSMIC_TOOLTIPS.schumann.text}</p>
            </CosmicInfoTooltip>
            <CosmicArcGauge
              value={schumannNorm(env.schumannResonance)}
              size={110}
              color={schumannColor(env.schumannResonance)}
              label={capitalize(env.schumannResonance)}
              sublabel="SCHUMANN"
            />
            <span className="text-[11px] text-white/35">Earth frequency</span>
          </div>

          {/* K-Index -- center */}
          <div className="flex flex-col items-center gap-2">
            <CosmicInfoTooltip label="K-Index">
              <p>{COSMIC_TOOLTIPS.kIndex.text}</p>
            </CosmicInfoTooltip>
            <CosmicArcGauge
              value={env.kIndex / 9}
              size={140}
              color={kColor(env.kIndex)}
              label={String(env.kIndex)}
              sublabel="K-INDEX"
            />
            <span className="text-[11px] text-white/35">Geomagnetic</span>
          </div>

          {/* Solar Flare -- right */}
          <div className="flex flex-col items-center gap-2">
            <CosmicInfoTooltip label="Solar Flare">
              <p>{COSMIC_TOOLTIPS.solarFlare.text}</p>
            </CosmicInfoTooltip>
            <CosmicStatusOrb
              size="lg"
              status={env.solarFlareActive ? 'negative' : 'positive'}
              pulse={env.solarFlareActive}
            />
            <span
              className="font-bold tracking-wider uppercase mt-1"
              style={{
                fontSize: 14,
                color: env.solarFlareActive ? '#EF4444' : '#10B981',
                textShadow: env.solarFlareActive
                  ? '0 0 8px rgba(239,68,68,0.4)'
                  : '0 0 8px rgba(16,185,129,0.3)',
              }}
            >
              {env.solarFlareActive ? 'ACTIVE' : 'QUIET'}
            </span>
            {env.solarFlareActive && env.solarFlareClass && (
              <span className="text-[12px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-full px-2.5 py-0.5">
                {env.solarFlareClass}
              </span>
            )}
            <span className="text-[11px] text-white/35">Solar activity</span>
          </div>
        </div>

        {/* Overall status bar -- glass pill style */}
        <div
          className="rounded-full px-5 py-2.5 flex items-center gap-3 mt-6 backdrop-blur-sm"
          style={{
            background: STATUS_BG_COLOR[env.overallStatus],
            border: `1px solid ${STATUS_BORDER_COLOR[env.overallStatus]}`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 0 12px ${STATUS_BG_COLOR[env.overallStatus]}`,
          }}
        >
          <CosmicStatusOrb status={STATUS_ORB_MAP[env.overallStatus]} size="md" />
          <span className="text-[13px] font-bold uppercase text-white/70 tracking-wide">
            {STATUS_TEXT[env.overallStatus]}
          </span>
          {env.tradingImpact && (
            <span className="text-[12px] text-white/40 ml-auto leading-relaxed">
              {env.tradingImpact}
            </span>
          )}
        </div>

        {/* Warning vignette when amber/red */}
        {showVignette && (
          <div
            className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{
              background:
                env.overallStatus === 'red'
                  ? 'radial-gradient(ellipse at center, transparent 40%, rgba(239,68,68,0.07) 100%)'
                  : 'radial-gradient(ellipse at center, transparent 50%, rgba(245,158,11,0.05) 100%)',
            }}
          />
        )}
      </div>
    </CosmicGlassCard>
  );
}
