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

/* ── time labels every 2 hours (plus open/close) ── */
const TIME_LABELS = [
  { label: '9:30',  min: MARKET_START },
  { label: '11:30', min: 11 * 60 + 30 },
  { label: '1:30',  min: 13 * 60 + 30 },
  { label: '3:30',  min: 15 * 60 + 30 },
  { label: '4:00',  min: MARKET_END },
];

export default function IntradayTimeCycles({ horaGrid, planetaryHours: _planetaryHours, bestTradingWindows }: Props) {
  void _planetaryHours;
  const { active, getHandlers } = useInteractiveSelection<number>();
  const timelineRef = useRef<HTMLDivElement>(null);

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

  /* ── compute selected segment position for connecting arrow ── */
  const activeSegmentPct = useMemo(() => {
    if (active === null || !marketHours[active]) return null;
    const h = marketHours[active];
    const startMin = Math.max(timeToMinutes(h.startTime), MARKET_START);
    const endMin = Math.min(timeToMinutes(h.endTime), MARKET_END);
    return (pct(startMin) + pct(endMin)) / 2;
  }, [active, marketHours]);

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

      {/* ── time labels with tick marks ── */}
      <div className="relative mb-1 px-1" style={{ height: 24 }}>
        {TIME_LABELS.map(({ label, min }) => {
          const left = pct(min);
          return (
            <div
              key={label}
              className="absolute flex flex-col items-center"
              style={{ left: `${left}%`, transform: 'translateX(-50%)' }}
            >
              <span className="text-[11px] text-gray-400 font-mono leading-none">{label}</span>
              {/* tick mark connecting label to timeline */}
              <div className="w-px h-[6px] mt-[2px] bg-white/[0.12]" />
            </div>
          );
        })}
      </div>

      {/* ── planet orbit line ── */}
      <div className="h-[1px] bg-white/[0.04] relative mb-1">
        {planetTransitions.map((pt, i) => (
          <div
            key={i}
            className="absolute -top-2.5 flex flex-col items-center"
            style={{ left: `${pt.left}%`, transform: 'translateX(-50%)' }}
          >
            <span className="text-[10px] leading-none" style={{ color: pt.color }}>{pt.glyph}</span>
            <div className="w-px h-1 mt-px" style={{ background: pt.color, opacity: 0.3 }} />
          </div>
        ))}
      </div>

      {/* ── timeline band (sunken track with segmented pills) ── */}
      <div
        ref={timelineRef}
        className="relative h-14 rounded-full bg-black/30 p-[3px]"
        style={{ boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4)' }}
      >
        {/* inner track container with gaps between segments */}
        <div className="relative h-full w-full flex gap-[2px] rounded-full overflow-hidden">
          {marketHours.map((h, i) => {
            const startMin = Math.max(timeToMinutes(h.startTime), MARKET_START);
            const endMin   = Math.min(timeToMinutes(h.endTime), MARKET_END);
            const width    = ((endMin - startMin) / MARKET_DURATION) * 100;
            const bgColor  = NODE_BG_60[h.nodeType] || NODE_BG_60.U_NODE;
            const isUltra  = h.nodeType === 'ULTRA_ALIGNED';
            const isActive = active === i;

            return (
              <div
                key={i}
                className={`relative h-full cursor-pointer transition-all rounded-[3px] ${
                  isActive ? 'ring-2 ring-white/50 z-[5] brightness-125' : 'ring-1 ring-white/[0.06]'
                }`}
                style={{
                  flex: `0 0 calc(${Math.max(width, 0.5)}% - 2px)`,
                  background: bgColor,
                }}
                {...getHandlers(i)}
              >
                {/* gold shimmer overlay for ULTRA_ALIGNED */}
                {isUltra && (
                  <div
                    className="absolute inset-0 animate-shimmer rounded-[3px]"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(246,196,83,0.25), transparent)',
                      backgroundSize: '200% 100%',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* ── current time cursor (dramatic glow) ── */}
        {isMarketOpen && (
          <div
            className="absolute z-10 pointer-events-none"
            style={{
              left: `${nowPct}%`,
              top: '-10px',
              bottom: '-10px',
              transform: 'translateX(-50%)',
            }}
          >
            {/* diamond pointer at top */}
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                top: 0,
                width: 0,
                height: 0,
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderTop: '6px solid #2EC5FF',
                filter: 'drop-shadow(0 0 4px rgba(46,197,255,0.8))',
              }}
            />
            {/* main cursor line */}
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                top: '6px',
                bottom: 0,
                width: '4px',
                borderRadius: '2px',
                background: 'linear-gradient(to bottom, #2EC5FF, rgba(46,197,255,0.7), transparent)',
                boxShadow: '0 0 10px 3px rgba(46,197,255,0.5), 0 0 20px 6px rgba(46,197,255,0.2)',
              }}
            />
          </div>
        )}
      </div>

      {/* ── active segment detail popup ── */}
      {active !== null && marketHours[active] && (
        <div className="relative mt-3">
          {/* connecting arrow pointing up to the selected segment */}
          {activeSegmentPct !== null && (
            <div
              className="absolute -top-[7px] z-10"
              style={{
                left: `${activeSegmentPct}%`,
                transform: 'translateX(-50%)',
              }}
            >
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderBottom: '7px solid rgba(255,255,255,0.06)',
                }}
              />
            </div>
          )}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-white font-bold text-[13px]">
              {new Date(marketHours[active].startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
              {' \u2013 '}
              {new Date(marketHours[active].endTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
            </p>
            <p className="text-gray-400 mt-1 text-[12px] leading-relaxed">
              {marketHours[active].tradingGuidance || marketHours[active].nodeType}
            </p>
          </div>
        </div>
      )}

      {/* ── legend (glass pills) ── */}
      <div className="flex flex-wrap items-center gap-2 mt-3">
        {Object.entries(NODE_LABELS).map(([type, label]) => (
          <span
            key={type}
            className="flex items-center gap-1.5 rounded-full px-3 py-1 bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm"
          >
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: NODE_COLORS[type] }}
            />
            <span className="text-[11px] text-gray-400">{label}</span>
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
            <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
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
                    <span className="text-white text-[12px] font-bold font-mono block">{timeStr}</span>
                    <span className="text-gray-500 text-[10px] truncate block">{w.reason}</span>
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
