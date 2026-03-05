import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cosmicApi } from '@/lib/api/cosmic';
import type { CosmicIntelligence, SoulBlueprint } from '@/types/cosmic';

import SoulBlueprintIdentityBar from './SoulBlueprintIdentityBar';
import NEOCoreReactor from './NEOCoreReactor';
import CosmicPressureTimeline from './CosmicPressureTimeline';
import HoraOrbitWheel from './HoraOrbitWheel';
import CivilizationCards from './CivilizationCards';
import MoonPhaseCard from './MoonPhaseCard';
import PlanetaryHourCompass from './PlanetaryHourCompass';
import NextHoraCountdown from './NextHoraCountdown';
import NumerologyHarmonics from './NumerologyHarmonics';
import EnvironmentalGauges from './EnvironmentalGauges';
import ConstellationRing from './ConstellationRing';

function isCurrentHour(start: string, end: string): boolean {
  const now = Date.now();
  return now >= new Date(start).getTime() && now < new Date(end).getTime();
}

function SkeletonBlock({ h = 'h-48' }: { h?: string }) {
  return (
    <div className={`${h} rounded-2xl border border-gray-800/50 bg-gray-900/50 animate-pulse flex items-center justify-center`}>
      <div className="w-8 h-8 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
    </div>
  );
}

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: 'easeOut' as const },
  }),
};

export default function CosmicTimingDashboard() {
  const [data, setData] = useState<CosmicIntelligence | null>(null);
  const [blueprint, setBlueprint] = useState<SoulBlueprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsBlueprint, setNeedsBlueprint] = useState(false);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setNeedsBlueprint(false);
      const [cosmicResult, blueprintResult] = await Promise.all([
        cosmicApi.getDaily(),
        cosmicApi.getSoulBlueprint(),
      ]);
      setData(cosmicResult);
      setBlueprint(blueprintResult);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { error?: string } }; message?: string };
      const backendMsg = axiosErr?.response?.data?.error;
      const status = axiosErr?.response?.status;

      if (status === 400 && backendMsg?.toLowerCase().includes('soul blueprint')) {
        setNeedsBlueprint(true);
      } else {
        setError(backendMsg || (err instanceof Error ? err.message : 'Failed to load cosmic data'));
      }
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
      <div className="space-y-6 p-1">
        <SkeletonBlock h="h-24" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <SkeletonBlock h="h-80" />
          <div className="lg:col-span-3"><SkeletonBlock h="h-80" /></div>
        </div>
        <SkeletonBlock h="h-96" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SkeletonBlock h="h-64" />
          <SkeletonBlock h="h-64" />
          <SkeletonBlock h="h-64" />
        </div>
      </div>
    );
  }

  if (needsBlueprint) {
    return (
      <div className="flex items-center justify-center py-20">
        <div
          className="rounded-2xl border border-purple-500/30 bg-gradient-to-b from-gray-900 to-gray-950 p-10 text-center max-w-md"
          style={{ boxShadow: '0 0 60px rgba(109,91,255,0.1)' }}
        >
          <div className="text-6xl mb-4">🌌</div>
          <h3 className="text-2xl font-bold text-white mb-3">Soul Blueprint Required</h3>
          <p className="text-gray-400 mb-6 leading-relaxed">
            The Cosmic Observatory is personalized to your birth data. Create your Soul Blueprint to unlock your NEO Score, planetary hours, and cosmic trading windows.
          </p>
          <button
            onClick={() => navigate('/soul-blueprint')}
            className="px-8 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-colors"
            style={{ boxShadow: '0 0 20px rgba(109,91,255,0.3)' }}
          >
            Create My Soul Blueprint →
          </button>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-8 text-center max-w-sm">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={fetchData} className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const currentHora = data.horaGrid.hours.find(h => isCurrentHour(h.startTime, h.endTime)) ?? data.horaGrid.hours[0];
  const nextHour = data.planetaryHours.nextHours[0] ?? data.planetaryHours.currentHour;

  return (
    <div className="space-y-8 pb-8">

      {/* Section 1: Soul Blueprint Identity Bar */}
      {blueprint && (
        <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible">
          <SoulBlueprintIdentityBar
            blueprint={blueprint}
            personalDay={data.numerology.personalDay}
            isAlignmentDay={data.numerology.isAlignmentDay}
          />
        </motion.div>
      )}

      {/* Section 2: NEO Core Reactor + Cosmic Pressure Timeline */}
      <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible">
        <div
          className="rounded-2xl border border-gray-800/50 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 p-6"
          style={{ boxShadow: '0 0 40px rgba(4,5,13,0.5)' }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-4 font-medium">NEO Core Reactor</p>
              <NEOCoreReactor neoScore={data.neoScore} />
            </div>
            <div className="lg:col-span-3">
              <CosmicPressureTimeline hours={data.horaGrid.hours} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Section 3: Hora Orbit Wheel */}
      <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible">
        <div className="rounded-2xl border border-gray-800/50 bg-gradient-to-b from-gray-900 to-gray-950 p-6">
          <p className="text-sm text-gray-400 font-semibold mb-1">Hora Orbit Wheel</p>
          <p className="text-xs text-gray-600 mb-4">24-hora celestial clock · hover segments for trading guidance</p>
          <HoraOrbitWheel hours={data.horaGrid.hours} />
        </div>
      </motion.div>

      {/* Section 4: Four-Civilization Daily Reading */}
      <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-4 font-medium">Four-Civilization Daily Reading</p>
          <CivilizationCards currentHour={currentHora} />
        </div>
      </motion.div>

      {/* Section 5: Moon + Planetary Compass + Next Hora */}
      <motion.div custom={4} variants={sectionVariants} initial="hidden" animate="visible">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MoonPhaseCard moonPhase={data.moonPhase} vocStatus={data.vocStatus} />
          <PlanetaryHourCompass planetaryHours={data.planetaryHours} />
          <NextHoraCountdown nextHour={nextHour} />
        </div>
      </motion.div>

      {/* Section 6: Numerology + Environmental */}
      <motion.div custom={5} variants={sectionVariants} initial="hidden" animate="visible">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumerologyHarmonics numerology={data.numerology} />
          <EnvironmentalGauges env={data.environmentalEnergy} />
        </div>
      </motion.div>

      {/* Section 7: 17-Factor Constellation Ring */}
      <motion.div custom={6} variants={sectionVariants} initial="hidden" animate="visible">
        <div className="rounded-2xl border border-gray-800/50 bg-gradient-to-b from-gray-900 to-gray-950 p-6">
          <ConstellationRing factors={data.neoScore.factors} total={data.neoScore.total} />
        </div>
      </motion.div>

    </div>
  );
}
