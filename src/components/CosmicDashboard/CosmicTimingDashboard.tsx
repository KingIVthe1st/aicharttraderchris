import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cosmicApi } from '@/lib/api/cosmic';
import type { CosmicIntelligence, SoulBlueprint, WeeklyCalendarDay } from '@/types/cosmic';

// Existing components
import SoulBlueprintIdentityBar from './SoulBlueprintIdentityBar';
import NEOCoreReactor from './NEOCoreReactor';
import CosmicPressureTimeline from './CosmicPressureTimeline';
import HoraOrbitWheel from './HoraOrbitWheel';
import CivilizationCards from './CivilizationCards';
import NextHoraCountdown from './NextHoraCountdown';
import NumerologyHarmonics from './NumerologyHarmonics';
import EnvironmentalGauges from './EnvironmentalGauges';
import ConstellationRing from './ConstellationRing';

// New v2 components
import MacroTimeCycles from './MacroTimeCycles';
import IntradayTimeCycles from './IntradayTimeCycles';
import TradingDayCalendar from './TradingDayCalendar';
import MoonPhaseHero from './MoonPhaseHero';
import MarketTimingGuide from './MarketTimingGuide';
import PlanetaryCommandCenter from './PlanetaryCommandCenter';

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.08, ease: 'easeOut' as const } }),
};

function Section({ children, index }: { children: React.ReactNode; index: number }) {
  return (
    <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={index}>
      {children}
    </motion.div>
  );
}

export default function CosmicTimingDashboard() {
  const [data, setData] = useState<CosmicIntelligence | null>(null);
  const [blueprint, setBlueprint] = useState<SoulBlueprint | null>(null);
  const [calendar, setCalendar] = useState<WeeklyCalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsBlueprint, setNeedsBlueprint] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const [cosmicResult, blueprintResult] = await Promise.all([
        cosmicApi.getDaily(tz),
        cosmicApi.getSoulBlueprint(),
      ]);

      if (!blueprintResult) { setNeedsBlueprint(true); setLoading(false); return; }

      setData(cosmicResult);
      setBlueprint(blueprintResult);

      // Fetch calendar separately (non-blocking)
      setCalendarLoading(true);
      cosmicApi.getWeeklyCalendar(35, tz)
        .then(cal => setCalendar(cal))
        .finally(() => setCalendarLoading(false));

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load cosmic data';
      if (msg.includes('blueprint') || msg.includes('Blueprint') || msg.includes('401')) {
        setNeedsBlueprint(true);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    const id = setInterval(fetchData, 15 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchData]);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-white/5 border border-white/10" />
        ))}
      </div>
    );
  }

  // ── Blueprint required ──
  if (needsBlueprint) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mb-6">
          <span className="text-4xl">🌟</span>
        </div>
        <h3 className="text-white text-xl font-bold mb-2">Soul Blueprint Required</h3>
        <p className="text-gray-400 max-w-sm mb-6">Your cosmic timing data is personalized to your birth chart. Please create your Soul Blueprint first.</p>
        <a href="/soul-blueprint" className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
          Create Soul Blueprint →
        </a>
      </div>
    );
  }

  // ── Error state ──
  if (error || !data || !blueprint) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-4xl mb-4">⚠️</span>
        <h3 className="text-white text-lg font-bold mb-2">Something went wrong</h3>
        <p className="text-gray-400 text-sm mb-4">{error || 'Failed to load cosmic data'}</p>
        <button onClick={fetchData} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors">
          Try Again
        </button>
      </div>
    );
  }

  const currentHoraIndex = data.horaGrid.hours.findIndex(
    h => Date.now() >= new Date(h.startTime).getTime() && Date.now() < new Date(h.endTime).getTime()
  );
  const currentHora = data.horaGrid.hours[currentHoraIndex >= 0 ? currentHoraIndex : 0];
  const nextHour = data.planetaryHours.nextHours[0] ?? data.planetaryHours.currentHour;

  return (
    <div className="space-y-5 pb-10">

      {/* ── 0. Soul Blueprint Identity Bar ── */}
      <Section index={0}>
        <SoulBlueprintIdentityBar
          blueprint={blueprint}
          personalDay={data.numerology.personalDay}
          isAlignmentDay={data.numerology.isAlignmentDay}
        />
      </Section>

      {/* ── 1. Macro Time Cycles ── */}
      <Section index={1}>
        <MacroTimeCycles moonPhase={data.moonPhase} />
      </Section>

      {/* ── 2. Intraday Time Cycles ── */}
      <Section index={2}>
        <IntradayTimeCycles
          horaGrid={data.horaGrid}
          planetaryHours={data.planetaryHours}
          bestTradingWindows={data.bestTradingWindows}
        />
      </Section>

      {/* ── 3. Optimum Trading Calendar ── */}
      <Section index={3}>
        <TradingDayCalendar calendar={calendar} isLoading={calendarLoading} />
      </Section>

      {/* ── 4. Moon Phase Hero + Market Timing Guide ── */}
      <Section index={4}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MoonPhaseHero
            moonPhase={data.moonPhase}
            vocStatus={data.vocStatus}
            moonSign={data.moonSign ?? 'Unknown'}
          />
          <MarketTimingGuide
            moonSign={data.moonSign ?? 'Unknown'}
            planetaryRuler={blueprint.planetaryRuler}
          />
        </div>
      </Section>

      {/* ── 5. Planetary Command Center ── */}
      <Section index={5}>
        <PlanetaryCommandCenter
          planetaryHours={data.planetaryHours}
          planetaryRuler={blueprint.planetaryRuler as import('@/types/cosmic').Planet}
        />
      </Section>

      {/* ── 6. NEO Core Reactor + Cosmic Pressure Timeline ── */}
      <Section index={6}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <NEOCoreReactor neoScore={data.neoScore} />
          </div>
          <div className="lg:col-span-3">
            <CosmicPressureTimeline hours={data.horaGrid.hours} />
          </div>
        </div>
      </Section>

      {/* ── 7. Hora Orbit Wheel ── */}
      <Section index={7}>
        <HoraOrbitWheel hours={data.horaGrid.hours} />
      </Section>

      {/* ── 8. Civilization Cards ── */}
      {currentHora && (
        <Section index={8}>
          <CivilizationCards currentHour={currentHora} />
        </Section>
      )}

      {/* ── 9. Numerology + Environmental ── */}
      <Section index={9}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NumerologyHarmonics numerology={data.numerology} />
          <EnvironmentalGauges env={data.environmentalEnergy} />
        </div>
      </Section>

      {/* ── 10. Next Hora Countdown ── */}
      <Section index={10}>
        <NextHoraCountdown nextHour={nextHour} />
      </Section>

      {/* ── 11. Constellation Ring ── */}
      <Section index={11}>
        <ConstellationRing factors={data.neoScore.factors} total={data.neoScore.total} />
      </Section>

    </div>
  );
}
