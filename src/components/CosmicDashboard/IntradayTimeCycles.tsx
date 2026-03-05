import { useState, useMemo, useRef } from 'react';
import type { HoraGrid, PlanetaryHourMap } from '@/types/cosmic';
import CosmicGlassCard from './shared/CosmicGlassCard';
import CosmicStatusOrb from './shared/CosmicStatusOrb';
import CosmicInfoTooltip from './shared/CosmicInfoTooltip';
import { COSMIC_TOOLTIPS } from './config/cosmicTooltips';
import { useInteractiveSelection } from './hooks/useInteractiveSelection';
import { useAnimationFrame } from './hooks/useAnimationFrame';

interface Props {
  horaGrid: HoraGrid;
  planetaryHours: PlanetaryHourMap;
  bestTradingWindows: Array<{ time: string; reason: string; nodeType: string }>;
}

/* ── colour map matching pressure timeline at 60% opacity ── */
const NODE_COLORS: Record<string, string> = {
  ULTRA_ALIGNED: '#F59E0B',
  HIGH_PRESSURE: '#22C55E',
  SOUL_WINDOW:   '#3B82F6',
  MIXED:         '#EAB308',
  CONFLICT:      '#EF4444',
  DISRUPTION:    '#A855F7',
  U_NODE:        '#6B7280',
};

const NODE_BG_60: Record<string, string> = {
  ULTRA_ALIGNED: 'rgba(245,158,11,0.60)',
  HIGH_PRESSURE: 'rgba(34,197,94,0.60)',
  SOUL_WINDOW:   'rgba(59,130,246,0.60)',
  MIXED:         'rgba(234,179,8,0.60)',
  CONFLICT:      'rgba(239,68,68,0.60)',
  DISRUPTION:    'rgba(168,85,247,0.60)',
  U_NODE:        'rgba(107,114,128,0.60)',
};

const NODE_LABELS: Record<string, string> = {
  ULTRA_ALIGNED: 'Ultra Aligned',
  HIGH_PRESSURE: 'High Pressure',
  SOUL_WINDOW:   'Soul Window',
  MIXED:         'Mixed',
  CONFLICT:      'Conflict',
  DISRUPTION:    'Disruption',
};

const PLANET_GLYPHS: Record<string, string> = {
  Sun: '\u2609', Moon: '\u263D', Mars: '\u2642', Mercury: '\u263F',
  Jupiter: '\u2643', Venus: '\u2640', Saturn: '\u2644',
};

const NODE_ORB_STATUS: Record<string, 'positive' | 'neutral' | 'negative' | 'special'> = {
  ULTRA_ALIGNED: 'special',
  HIGH_PRESSURE: 'positive',
  SOUL_WINDOW:   'positive',
  MIXED:         'neutral',
  CONFLICT:      'negative',
  DISRUPTION:    'negative',
  U_NODE:        'neutral',
};

function timeToMinutes(isoString: string): number {
  const d = new Date(isoString);
  return d.getHours() * 60 + d.getMinutes();
}

const MARKET_START = 9 * 60 + 30;
const MARKET_END   = 16 * 60;
const MARKET_DURATION = MARKET_END - MARKET_START;

function pct(minutes: number) {
  return Math.max(0, Math.min(100, ((minutes - MARKET_START) / MARKET_DURATION) * 100));
}

export default function IntradayTimeCycles({ horaGrid, planetaryHours: _planetaryHours, bestTradingWindows }: Props) {
  void _planetaryHours;
  const { active, getHandlers } = useInteractiveSelection<number>();

  /* ── live clock via useAnimationFrame ── */
  const [nowMinutes, setNowMinutes] = useState(() => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  });

  const lastMinuteRef = useRef(nowMinutes);

  useAnimationFrame(() => {
    const n = new Date();
    const m = n.getHours() * 60 + n.getMinutes();
    if (m !== lastMinuteRef.current) {
      lastMinuteRef.current = m;
      setNowMinutes(m);
    }
  }, true);

  const nowPct = pct(nowMinutes);
  const isMarketOpen = nowMinutes >= MARKET_START && nowMinutes < MARKET_END;

  const marketHours = useMemo(() =>
    (horaGrid.hours || []).filter(h => {
      const start = timeToMinutes(h.startTime);
      const end   = timeToMinutes(h.endTime);
      return end > MARKET_START && start < MARKET_END;
    }),
    [horaGrid.hours],
  );

  const remainingWindows = useMemo(() =>
    bestTradingWindows
      .filter(w => timeToMinutes(w.time) > nowMinutes && timeToMinutes(w.time) < MARKET_END)
      .slice(0, 3),
    [bestTradingWindows, nowMinutes],
  );

  /* ── planet transition points for orbit line ── */
  const planetTransitions = useMemo(() => {
    const pts: { left: number; glyph: string; color: string }[] = [];
    for (let i = 0; i < marketHours.length; i++) {
      const h = marketHours[i];
      const vedic = h.vedic?.planet || '';
      const prev = i > 0 ? (marketHours[i - 1].vedic?.planet || '') : '';
      if (vedic && vedic !== prev) {
        const startMin = Math.max(timeToMinutes(h.startTime), MARKET_START);
        const isAlly = h.vedic?.isAlly;
        const isEnemy = h.vedic?.isEnemy;
        pts.push({
          left: pct(startMin),
          glyph: PLANET_GLYPHS[vedic] || vedic.slice(0, 2),
          color: isAlly ? '#5DD8FF' : isEnemy ? '#EF4444' : '#6B7280',
        });
      }
    }
    return pts;
  }, [marketHours]);

  return (
    <CosmicGlassCard accentColor="aurora">
      {/* ── header ── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#9889;</span>
          <h3 className="text-white font-bold text-sm uppercase tracking-widest">
            Power Grid Timeline
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <CosmicStatusOrb
            status={isMarketOpen ? 'positive' : 'neutral'}
            size="sm"
            pulse={isMarketOpen}
            label={isMarketOpen ? 'MARKET OPEN' : 'AFTER HOURS'}
          />
          <CosmicInfoTooltip label="Market status info">
            {COSMIC_TOOLTIPS.marketStatus.text}
          </CosmicInfoTooltip>
        </div>
      </div>

      {/* ── time labels ── */}
      <div className="flex justify-between text-[9px] text-gray-500 font-mono mb-1 px-1">
        {['9:30', '10:30', '11:30', '12:30', '1:30', '2:30', '3:30', '4:00'].map(t => (
          <span key={t}>{t}</span>
        ))}
      </div>

      {/* ── planet orbit line ── */}
      <div className="h-[1px] bg-white/[0.04] relative mb-1">
        {planetTransitions.map((pt, i) => (
          <div
            key={i}
            className="absolute -top-2.5 flex flex-col items-center"
            style={{ left: `${pt.left}%`, transform: 'translateX(-50%)' }}
          >
            <span className="text-[9px] leading-none" style={{ color: pt.color }}>{pt.glyph}</span>
            <div className="w-px h-1 mt-px" style={{ background: pt.color, opacity: 0.3 }} />
          </div>
        ))}
      </div>

      {/* ── timeline band ── */}
      <div className="relative h-12 rounded-full overflow-hidden bg-white/[0.03] border border-white/[0.06]">
        {marketHours.map((h, i) => {
          const startMin = Math.max(timeToMinutes(h.startTime), MARKET_START);
          const endMin   = Math.min(timeToMinutes(h.endTime), MARKET_END);
          const left     = pct(startMin);
          const width    = pct(endMin) - left;
          const bgColor  = NODE_BG_60[h.nodeType] || NODE_BG_60.U_NODE;
          const isUltra  = h.nodeType === 'ULTRA_ALIGNED';

          return (
            <div
              key={i}
              className={`absolute top-0 bottom-0 cursor-pointer border-r border-black/30 transition-all ${
                active === i ? 'ring-1 ring-white/40 z-[5]' : ''
              }`}
              style={{
                left: `${left}%`,
                width: `${Math.max(width, 0.5)}%`,
                background: bgColor,
              }}
              {...getHandlers(i)}
            >
              {/* gold shimmer overlay for ULTRA_ALIGNED */}
              {isUltra && (
                <div
                  className="absolute inset-0 animate-shimmer"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(246,196,83,0.25), transparent)',
                    backgroundSize: '200% 100%',
                  }}
                />
              )}
            </div>
          );
        })}

        {/* ── current time cursor ── */}
        {isMarketOpen && (
          <div
            className="absolute w-[3px] top-[-8px] bottom-[-8px] z-10 pointer-events-none"
            style={{
              left: `${nowPct}%`,
              transform: 'translateX(-50%)',
              background: 'linear-gradient(to bottom, transparent, #2EC5FF, transparent)',
              boxShadow: '0 0 8px rgba(46,197,255,0.6)',
            }}
          />
        )}
      </div>

      {/* ── active segment detail ── */}
      {active !== null && marketHours[active] && (
        <div className="mt-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs">
          <p className="text-white font-bold">
            {new Date(marketHours[active].startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
            {' \u2013 '}
            {new Date(marketHours[active].endTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
          </p>
          <p className="text-gray-400 mt-1">
            {marketHours[active].tradingGuidance || marketHours[active].nodeType}
          </p>
        </div>
      )}

      {/* ── legend ── */}
      <div className="flex flex-wrap items-center gap-2 mt-3">
        {Object.entries(NODE_LABELS).map(([type, label]) => (
          <span
            key={type}
            className="flex items-center gap-1.5 bg-white/[0.03] rounded-full px-2.5 py-1"
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: NODE_COLORS[type] }}
            />
            <span className="text-[9px] text-gray-400">{label}</span>
          </span>
        ))}
        <CosmicInfoTooltip label="Node type color legend">
          {COSMIC_TOOLTIPS.nodeUltraAligned.text}
        </CosmicInfoTooltip>
      </div>

      {/* ── best windows panel ── */}
      {remainingWindows.length > 0 && (
        <div className="mt-4 border-t border-white/[0.06] pt-3">
          <div className="flex items-center gap-1.5 mb-2">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
              Best Windows Remaining
            </p>
            <CosmicInfoTooltip label="Best trading window info">
              {COSMIC_TOOLTIPS.bestWindow.text}
            </CosmicInfoTooltip>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {remainingWindows.map((w, i) => {
              const t = new Date(w.time);
              const timeStr = t.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
              const orbStatus = NODE_ORB_STATUS[w.nodeType] || 'neutral';
              return (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2"
                >
                  <CosmicStatusOrb status={orbStatus} size="sm" />
                  <div className="min-w-0">
                    <span className="text-white text-[11px] font-bold font-mono block">{timeStr}</span>
                    <span className="text-gray-500 text-[9px] truncate block">{w.reason}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </CosmicGlassCard>
  );
}
