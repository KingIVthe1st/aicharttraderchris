import { useState, useEffect, useCallback } from 'react';
import { cosmicApi } from '@/lib/api/cosmic';
import type { CosmicIntelligence, NEOFactor, HoraGridHour } from '@/types/cosmic';
import { getNEOColorClass, getNEOBgClass, getNodeColorClass } from '@/types/cosmic';

// ── Helpers ────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

function isCurrentHour(start: string, end: string): boolean {
  const now = Date.now();
  return now >= new Date(start).getTime() && now < new Date(end).getTime();
}

function classificationLabel(c: string): string {
  return c.replace('_', ' ');
}

function envStatusColor(status: string): string {
  switch (status) {
    case 'green': return 'text-emerald-400';
    case 'amber': return 'text-yellow-400';
    case 'red': return 'text-red-400';
    default: return 'text-gray-400';
  }
}

function envStatusDot(status: string): string {
  switch (status) {
    case 'green': return 'bg-emerald-400';
    case 'amber': return 'bg-yellow-400';
    case 'red': return 'bg-red-400';
    default: return 'bg-gray-400';
  }
}

// ── Sub-components ────────────────────────────────────────────────

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-gray-800 bg-gray-900/50 p-6 ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold text-white mb-3">{children}</h3>;
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 animate-pulse">
      <div className="h-5 bg-gray-700/50 rounded w-1/3 mb-4" />
      <div className="h-8 bg-gray-700/50 rounded w-1/2 mb-2" />
      <div className="h-4 bg-gray-700/50 rounded w-2/3" />
    </div>
  );
}

// ── Row 1: Overview Cards ──────────────────────────────────────────

function NEOScoreGauge({ data }: { data: CosmicIntelligence }) {
  const { total, classification } = data.neoScore;
  const colorClass = getNEOColorClass(classification);
  const bgClass = getNEOBgClass(classification);

  return (
    <Card>
      <CardHeader>NEO Score</CardHeader>
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${bgClass} mb-3`}>
        <span className={`text-3xl font-bold ${colorClass}`}>{total}</span>
        <span className="text-gray-400 text-lg">/17</span>
      </div>
      <p className={`text-sm font-medium ${colorClass}`}>
        {classificationLabel(classification)}
      </p>
    </Card>
  );
}

function MoonPhaseCard({ data }: { data: CosmicIntelligence }) {
  const { moonPhase, vocStatus } = data;
  return (
    <Card>
      <CardHeader>Moon Phase</CardHeader>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{moonPhase.emoji}</span>
        <div>
          <p className="text-white font-medium">{moonPhase.name}</p>
          <p className="text-gray-400 text-sm">
            {Math.round(moonPhase.illumination * 100)}% illuminated
            {' '}
            <span className="text-gray-500">
              {moonPhase.isWaxing ? 'Waxing' : 'Waning'}
            </span>
          </p>
        </div>
      </div>
      <div className={`text-xs px-2 py-1 rounded inline-block ${vocStatus.isVoid ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
        {vocStatus.isVoid ? 'VOC Active' : 'VOC Clear'}
      </div>
    </Card>
  );
}

function PlanetaryDayHourCard({ data }: { data: CosmicIntelligence }) {
  const { dayRuler, currentHour } = data.planetaryHours;
  let statusLabel = 'Neutral';
  let statusColor = 'text-gray-400';
  if (currentHour.isAllyHour) { statusLabel = 'Ally Hour'; statusColor = 'text-emerald-400'; }
  if (currentHour.isEnemyHour) { statusLabel = 'Enemy Hour'; statusColor = 'text-red-400'; }

  return (
    <Card>
      <CardHeader>Planetary Day / Hour</CardHeader>
      <p className="text-white mb-1">
        Day Ruler: <span className="font-semibold text-purple-300">{dayRuler}</span>
      </p>
      <p className="text-white mb-2">
        Current Hour: <span className="font-semibold text-indigo-300">{currentHour.planet}</span>
      </p>
      <span className={`text-sm font-medium ${statusColor}`}>{statusLabel}</span>
    </Card>
  );
}

function NumerologyCard({ data }: { data: CosmicIntelligence }) {
  const { universalDay, personalDay, isAlignmentDay } = data.numerology;
  return (
    <Card className={isAlignmentDay ? 'ring-1 ring-amber-500/40 shadow-lg shadow-amber-500/10' : ''}>
      <CardHeader>Daily Numerology</CardHeader>
      <div className="flex gap-6 mb-2">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider">Universal</p>
          <p className="text-2xl font-bold text-white">{universalDay}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider">Personal</p>
          <p className="text-2xl font-bold text-white">{personalDay}</p>
        </div>
      </div>
      {isAlignmentDay && (
        <span className="text-xs px-2 py-1 rounded bg-amber-500/20 text-amber-300 font-medium">
          Alignment Day
        </span>
      )}
    </Card>
  );
}

// ── Row 2: Hora Grid ────────────────────────────────────────────

function HoraGridMap({ data }: { data: CosmicIntelligence }) {
  const hours = data.horaGrid.hours.slice(0, 12);

  return (
    <Card>
      <CardHeader>Hora Grid Timeline</CardHeader>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {hours.map((h: HoraGridHour, i: number) => {
          const current = isCurrentHour(h.startTime, h.endTime);
          const nodeClass = getNodeColorClass(h.nodeType);
          return (
            <div
              key={i}
              className={`rounded-lg border p-3 text-sm ${nodeClass} ${current ? 'ring-2 ring-white/60 shadow-lg' : ''}`}
            >
              <p className="font-semibold text-xs mb-1">
                {formatTime(h.startTime)} - {formatTime(h.endTime)}
              </p>
              <p className="font-medium">{h.vedic.planet}</p>
              <p className="text-xs opacity-75">{h.chinese.animal}</p>
              <p className="text-[10px] uppercase tracking-wider opacity-60 mt-1">
                {h.nodeType.replace('_', ' ')}
              </p>
              <p className="text-xs mt-1.5 opacity-80 line-clamp-2">{h.tradingGuidance}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ── Row 3: Signal Cards ──────────────────────────────────────────

function ChineseZodiacCard({ data }: { data: CosmicIntelligence }) {
  return (
    <Card>
      <CardHeader>Chinese Zodiac Hour</CardHeader>
      <p className="text-white text-lg font-semibold mb-1">{data.chineseHour.animal}</p>
      <p className="text-gray-400 text-sm">{data.chineseCompatibility}</p>
    </Card>
  );
}

function EnvironmentalEnergyCard({ data }: { data: CosmicIntelligence }) {
  const env = data.environmentalEnergy;
  return (
    <Card>
      <CardHeader>Environmental Energy</CardHeader>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">K-Index</span>
          <span className="text-white font-medium">{env.kIndex} ({env.kIndexLevel})</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Solar Flare</span>
          <span className={env.solarFlareActive ? 'text-red-400' : 'text-emerald-400'}>
            {env.solarFlareActive ? `Active (${env.solarFlareClass})` : 'Quiet'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Schumann</span>
          <span className="text-white">{env.schumannResonance}</span>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <span className={`w-2.5 h-2.5 rounded-full ${envStatusDot(env.overallStatus)}`} />
          <span className={`font-medium ${envStatusColor(env.overallStatus)}`}>
            {env.overallStatus.toUpperCase()}
          </span>
        </div>
      </div>
    </Card>
  );
}

function EnemyHourAlertCard({ data }: { data: CosmicIntelligence }) {
  const alert = data.enemyHourAlert;
  const active = alert?.active ?? false;

  return (
    <Card className={active ? 'ring-1 ring-red-500/40 shadow-lg shadow-red-500/10' : ''}>
      <CardHeader>Enemy Hour Alert</CardHeader>
      {active ? (
        <>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 font-semibold">WARNING</span>
          </div>
          <p className="text-gray-300 text-sm">{alert?.message}</p>
        </>
      ) : (
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-emerald-400 font-medium">All Clear</span>
        </div>
      )}
    </Card>
  );
}

function TradingWindowsCard({ data }: { data: CosmicIntelligence }) {
  const windows = data.bestTradingWindows.slice(0, 3);
  return (
    <Card>
      <CardHeader>Best Trading Windows</CardHeader>
      <div className="space-y-2">
        {windows.map((w, i) => (
          <div key={i} className="flex gap-3 text-sm">
            <span className="text-purple-300 font-mono whitespace-nowrap">{w.time}</span>
            <span className="text-gray-400">{w.reason}</span>
          </div>
        ))}
        {windows.length === 0 && (
          <p className="text-gray-500 text-sm">No optimal windows found today.</p>
        )}
      </div>
    </Card>
  );
}

// ── Row 4: NEO Factor Breakdown ────────────────────────────────

function NEOFactorBreakdown({ data }: { data: CosmicIntelligence }) {
  const [expanded, setExpanded] = useState(false);
  const factors = data.neoScore.factors;
  const shown = expanded ? factors : factors.slice(0, 5);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <CardHeader>NEO Factor Breakdown</CardHeader>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          {expanded ? 'Collapse' : `Show all ${factors.length}`}
        </button>
      </div>
      <div className="space-y-2">
        {shown.map((f: NEOFactor) => (
          <div key={f.id} className="flex items-start gap-3 text-sm">
            <span className={`mt-0.5 flex-shrink-0 ${f.score === 1 ? 'text-emerald-400' : 'text-red-400'}`}>
              {f.score === 1 ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </span>
            <div>
              <span className="text-white font-medium">{f.name}</span>
              <p className="text-gray-500 text-xs">{f.reasoning}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Main Dashboard ──────────────────────────────────────────────

export default function CosmicTimingDashboard() {
  const [data, setData] = useState<CosmicIntelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await cosmicApi.getDaily();
      setData(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load cosmic data';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <SkeletonCard />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <Card className="text-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors"
        >
          Retry
        </button>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Row 1: Today's Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <NEOScoreGauge data={data} />
        <MoonPhaseCard data={data} />
        <PlanetaryDayHourCard data={data} />
        <NumerologyCard data={data} />
      </div>

      {/* Row 2: Hora Grid Map */}
      <HoraGridMap data={data} />

      {/* Row 3: Signal Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ChineseZodiacCard data={data} />
        <EnvironmentalEnergyCard data={data} />
        <EnemyHourAlertCard data={data} />
        <TradingWindowsCard data={data} />
      </div>

      {/* Row 4: NEO Factor Breakdown */}
      <NEOFactorBreakdown data={data} />
    </div>
  );
}
