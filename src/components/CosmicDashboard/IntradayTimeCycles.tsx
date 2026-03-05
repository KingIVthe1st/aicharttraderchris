import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { HoraGrid, PlanetaryHourMap } from '@/types/cosmic';

interface Props {
  horaGrid: HoraGrid;
  planetaryHours: PlanetaryHourMap;
  bestTradingWindows: Array<{ time: string; reason: string; nodeType: string }>;
}

const NODE_COLORS: Record<string, string> = {
  ULTRA_ALIGNED: '#F6C453',
  HIGH_PRESSURE: '#22C55E',
  SOUL_WINDOW: '#3B82F6',
  MIXED: '#EAB308',
  CONFLICT: '#EF4444',
  DISRUPTION: '#A855F7',
  U_NODE: '#374151',
};

const NODE_BG: Record<string, string> = {
  ULTRA_ALIGNED: 'rgba(246,196,83,0.18)',
  HIGH_PRESSURE: 'rgba(34,197,94,0.15)',
  SOUL_WINDOW: 'rgba(59,130,246,0.15)',
  MIXED: 'rgba(234,179,8,0.12)',
  CONFLICT: 'rgba(239,68,68,0.12)',
  DISRUPTION: 'rgba(168,85,247,0.12)',
  U_NODE: 'rgba(55,65,81,0.12)',
};

const PLANET_GLYPHS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿', Jupiter: '♃', Venus: '♀', Saturn: '♄',
};

function timeToMinutes(isoString: string): number {
  const d = new Date(isoString);
  return d.getHours() * 60 + d.getMinutes();
}

export default function IntradayTimeCycles({ horaGrid, planetaryHours, bestTradingWindows }: Props) {
  const [nowMinutes, setNowMinutes] = useState(() => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  });

  useEffect(() => {
    const id = setInterval(() => {
      const n = new Date();
      setNowMinutes(n.getHours() * 60 + n.getMinutes());
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const MARKET_START = 9 * 60 + 30;
  const MARKET_END = 16 * 60;
  const MARKET_DURATION = MARKET_END - MARKET_START;

  const pct = (minutes: number) => Math.max(0, Math.min(100, ((minutes - MARKET_START) / MARKET_DURATION) * 100));
  const nowPct = pct(nowMinutes);
  const isMarketOpen = nowMinutes >= MARKET_START && nowMinutes < MARKET_END;

  const marketHours = useMemo(() =>
    (horaGrid.hours || []).filter(h => {
      const start = timeToMinutes(h.startTime);
      const end = timeToMinutes(h.endTime);
      return end > MARKET_START && start < MARKET_END;
    }),
    [horaGrid.hours]
  );

  const remainingWindows = useMemo(() =>
    bestTradingWindows
      .filter(w => timeToMinutes(w.time) > nowMinutes && timeToMinutes(w.time) < MARKET_END)
      .slice(0, 3),
    [bestTradingWindows, nowMinutes]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/80 via-slate-900/90 to-indigo-950/80 overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest">Intraday Power Windows</h3>
          </div>
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border ${
            isMarketOpen
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-gray-500/20 border-gray-500/40 text-gray-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isMarketOpen ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
            {isMarketOpen ? 'MARKET OPEN' : 'AFTER HOURS'}
          </div>
        </div>

        <div className="flex justify-between text-[9px] text-gray-500 font-mono mb-1 px-1">
          {['9:30', '10:30', '11:30', '12:30', '1:30', '2:30', '3:30', '4:00'].map(t => (
            <span key={t}>{t}</span>
          ))}
        </div>

        <div className="relative h-16 rounded-xl overflow-hidden bg-slate-950/60 border border-white/5">
          {marketHours.map((h, i) => {
            const startMin = Math.max(timeToMinutes(h.startTime), MARKET_START);
            const endMin = Math.min(timeToMinutes(h.endTime), MARKET_END);
            const left = pct(startMin);
            const width = pct(endMin) - left;
            const color = NODE_BG[h.nodeType] || NODE_BG.U_NODE;
            const borderColor = NODE_COLORS[h.nodeType] || NODE_COLORS.U_NODE;
            const vedic = h.vedic?.planet || '';

            return (
              <div
                key={i}
                className="absolute top-0 bottom-0 group cursor-default"
                style={{ left: `${left}%`, width: `${Math.max(width, 0.5)}%`, background: color, borderRight: `1px solid ${borderColor}30` }}
                title={h.tradingGuidance}
              >
                {width > 5 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[11px] opacity-60" style={{ color: borderColor }}>
                      {PLANET_GLYPHS[vedic] || vedic.slice(0, 2)}
                    </span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b" style={{ background: borderColor }} />
              </div>
            );
          })}

          {bestTradingWindows.map((w, i) => {
            const wMin = timeToMinutes(w.time);
            if (wMin < MARKET_START || wMin > MARKET_END) return null;
            const left = pct(wMin);
            return (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-6 -translate-x-3 pointer-events-none"
                style={{ left: `${left}%` }}
              >
                <div className="absolute inset-0 bg-yellow-400/30 rounded" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[8px] text-yellow-300 font-bold">⭐</div>
              </div>
            );
          })}

          {isMarketOpen && (
            <motion.div
              className="absolute top-0 bottom-0 w-0.5 bg-white z-10"
              style={{ left: `${nowPct}%` }}
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="absolute -top-1 -translate-x-1/2 w-2 h-2 rounded-full bg-white" />
            </motion.div>
          )}
        </div>

        <div className="relative h-5 mt-1">
          {planetaryHours.nextHours.slice(0, 8).map((ph, i) => {
            const startMin = timeToMinutes(ph.startTime);
            if (startMin < MARKET_START || startMin > MARKET_END) return null;
            const left = pct(startMin);
            const glyph = PLANET_GLYPHS[ph.planet] || ph.planet.slice(0, 2);
            const color = ph.isAllyHour ? '#5DD8FF' : ph.isEnemyHour ? '#EF4444' : '#6B7280';
            return (
              <div key={i} className="absolute flex flex-col items-center" style={{ left: `${left}%`, transform: 'translateX(-50%)' }}>
                <div className="w-px h-2 bg-white/20" />
                <span className="text-[9px]" style={{ color }}>{glyph}</span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {Object.entries(NODE_COLORS).filter(([k]) => k !== 'U_NODE').map(([type, color]) => (
            <div key={type} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-sm" style={{ background: color }} />
              <span className="text-[9px] text-gray-400">{type.replace('_', ' ')}</span>
            </div>
          ))}
        </div>

        {remainingWindows.length > 0 && (
          <div className="mt-3 border-t border-white/10 pt-3">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Best Windows Remaining</p>
            <div className="flex gap-2 flex-wrap">
              {remainingWindows.map((w, i) => {
                const t = new Date(w.time);
                const timeStr = t.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                return (
                  <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-yellow-500/15 border border-yellow-400/30">
                    <span className="text-yellow-300 text-[10px]">⭐</span>
                    <span className="text-white text-[10px] font-bold font-mono">{timeStr}</span>
                    <span className="text-gray-400 text-[9px] hidden sm:block">{w.reason.slice(0, 20)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
