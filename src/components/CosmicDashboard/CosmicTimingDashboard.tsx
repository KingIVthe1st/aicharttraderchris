import { useCallback, useEffect, useState } from 'react';
import { cosmicApi } from '@/lib/api/cosmic';
import type { CosmicIntelligence, SoulBlueprint, WeeklyCalendarDay } from '@/types/cosmic';

// Existing components
import SoulBlueprintIdentityBar from './SoulBlueprintIdentityBar';
import NEOCoreReactor from './NEOCoreReactor';
import CosmicPressureTimeline from './CosmicPressureTimeline';
import HoraOrbitWheel from './HoraOrbitWheel';
import CivilizationCards from './CivilizationCards';
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

// UX overhaul primitives
import CosmicZoneAccordion from './shared/CosmicZoneAccordion';
import CosmicSectionShell from './shared/CosmicSectionShell';
import CosmicConstellationBg from './shared/CosmicConstellationBg';
import { SECTION_META } from './config/sectionMeta';

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

  return (
    <div className="relative space-y-6 pb-10">
      <CosmicConstellationBg density="sparse" animated />

      {/* ═══════════════ NOW ZONE ═══════════════ */}
      <CosmicZoneAccordion zone="NOW">

        <CosmicSectionShell meta={SECTION_META.soulBlueprint} index={0}>
          <SoulBlueprintIdentityBar
            blueprint={blueprint}
            personalDay={data.numerology.personalDay}
            isAlignmentDay={data.numerology.isAlignmentDay}
          />
        </CosmicSectionShell>

        <CosmicSectionShell meta={SECTION_META.moonPhase} index={1}>
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
        </CosmicSectionShell>

        <CosmicSectionShell meta={SECTION_META.intradayWindows} index={2}>
          <IntradayTimeCycles
            horaGrid={data.horaGrid}
            planetaryHours={data.planetaryHours}
            bestTradingWindows={data.bestTradingWindows}
          />
        </CosmicSectionShell>

      </CosmicZoneAccordion>

      {/* ═══════════════ THIS WEEK ZONE ═══════════════ */}
      <CosmicZoneAccordion zone="THIS_WEEK">

        <CosmicSectionShell meta={SECTION_META.macroCycles} index={3}>
          <MacroTimeCycles moonPhase={data.moonPhase} />
        </CosmicSectionShell>

        <CosmicSectionShell meta={SECTION_META.tradingCalendar} index={4}>
          <TradingDayCalendar calendar={calendar} isLoading={calendarLoading} />
        </CosmicSectionShell>

        <CosmicSectionShell meta={SECTION_META.planetaryCommand} index={5}>
          <PlanetaryCommandCenter
            planetaryHours={data.planetaryHours}
            planetaryRuler={blueprint.planetaryRuler as import('@/types/cosmic').Planet}
          />
        </CosmicSectionShell>

      </CosmicZoneAccordion>

      {/* ═══════════════ DEEP KNOWLEDGE ZONE ═══════════════ */}
      <CosmicZoneAccordion zone="DEEP">

        <CosmicSectionShell meta={SECTION_META.neoReactor} index={6}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <NEOCoreReactor neoScore={data.neoScore} />
            </div>
            <div className="lg:col-span-3">
              <CosmicPressureTimeline hours={data.horaGrid.hours} />
            </div>
          </div>
        </CosmicSectionShell>

        <CosmicSectionShell meta={SECTION_META.horaWheel} index={7}>
          <HoraOrbitWheel hours={data.horaGrid.hours} />
        </CosmicSectionShell>

        {currentHora && (
          <CosmicSectionShell meta={SECTION_META.civilizations} index={8}>
            <CivilizationCards currentHour={currentHora} />
          </CosmicSectionShell>
        )}

        <CosmicSectionShell meta={SECTION_META.numerologyEnv} index={9}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NumerologyHarmonics numerology={data.numerology} />
            <EnvironmentalGauges env={data.environmentalEnergy} />
          </div>
        </CosmicSectionShell>

        <CosmicSectionShell meta={SECTION_META.constellation} index={10}>
          <ConstellationRing factors={data.neoScore.factors} total={data.neoScore.total} />
        </CosmicSectionShell>

      </CosmicZoneAccordion>

    </div>
  );
}
