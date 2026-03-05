# Cosmic Timing UX Overhaul — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add accessible InfoTooltips to every cosmic module (~40 placements), wrap all sections in progressive-disclosure zone groups with plain-English subtitles and tutorial modals, and fix hover-only interactions for mobile/keyboard.

**Architecture:** 4 shared primitives (CosmicInfoTooltip, CosmicSectionShell, CosmicZoneAccordion, SectionTutorialModal) + 2 config files (tooltip text registry, section metadata). Then targeted edits to 15 existing components to add tooltip anchors and fix hover-only patterns. The orchestrator (CosmicTimingDashboard.tsx) gets rewritten to use zones + shells.

**Tech Stack:** React 18, TypeScript, Framer Motion v12, Tailwind CSS

---

## Task 1: Create CosmicInfoTooltip shared component

**File:** Create `src/components/CosmicDashboard/shared/CosmicInfoTooltip.tsx`

```tsx
import { useState, useRef, useEffect } from 'react';

interface Props {
  label: string;
  children: React.ReactNode;
  topic?: string;
  onLearn?: (topic: string) => void;
}

export default function CosmicInfoTooltip({ label, children, topic, onLearn }: Props) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click (mobile support)
  useEffect(() => {
    if (!show) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShow(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [show]);

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        aria-label={label}
        onClick={() => setShow(s => !s)}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        className="w-4 h-4 rounded-full bg-gray-700/50 hover:bg-gray-600/50 focus:ring-2 focus:ring-purple-500/50 focus:outline-none flex items-center justify-center transition-colors flex-shrink-0"
      >
        <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
      </button>

      {show && (
        <div
          className="fixed left-1/2 -translate-x-1/2 w-80 z-[9999] pointer-events-auto"
          style={{ top: '20%' }}
        >
          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4 shadow-2xl">
            <div className="text-gray-300 text-xs leading-relaxed">
              {children}
            </div>
            {onLearn && topic && (
              <button
                onClick={(e) => { e.stopPropagation(); onLearn(topic); setShow(false); }}
                className="mt-3 w-full py-1.5 px-3 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 text-purple-300 text-[11px] font-medium transition-all flex items-center justify-center gap-1.5"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M9.663 17h4.674M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Learn More with AI
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

**Verify + commit:**
```bash
cd /Users/ivanjackson/Desktop/aicharttraderchris && npm run build 2>&1 | grep "error" | head -10
git add src/components/CosmicDashboard/shared/CosmicInfoTooltip.tsx
git commit -m "feat: add CosmicInfoTooltip shared component — accessible tooltips for cosmic section"
```

---

## Task 2: Create cosmicTooltips.ts config

**File:** Create `src/components/CosmicDashboard/config/cosmicTooltips.ts`

```typescript
export const COSMIC_TOOLTIPS: Record<string, { text: string; topic?: string }> = {
  // ── Soul Blueprint ──
  lifePathNumber: {
    text: 'Your life path number reveals your core purpose and natural trading strengths. Calculated from your full birth date by reducing it to a single digit (or master number).',
    topic: 'life_path_number',
  },
  sunSign: {
    text: 'Your Sun sign represents your core identity and conscious personality — how you naturally approach risk and opportunity in markets.',
    topic: 'sun_sign',
  },
  moonSign: {
    text: 'Your Moon sign governs your emotional instincts and gut reactions — critical for understanding your trading psychology under pressure.',
  },
  risingSign: {
    text: 'Your Rising (Ascendant) sign — how the world perceives you and your natural first response to market opportunities.',
  },
  planetaryRuler: {
    text: 'The planet that governs your zodiac sign. Determines which planetary hours are allies and enemies — personalizing your entire cosmic timing.',
    topic: 'planetary_ruler',
  },
  nakshatra: {
    text: 'Your Vedic lunar mansion — one of 27 star patterns that refine your Moon sign with deeper specificity about your intuitive trading style.',
    topic: 'nakshatra',
  },
  alignmentChips: {
    text: 'When today\'s numerological vibration matches your personal birth numbers, creating a powerful resonance that amplifies your trading instincts.',
    topic: 'alignment_day',
  },

  // ── Moon Phase Hero ──
  illumination: {
    text: 'How much of the Moon is lit. Higher illumination = more market energy and conviction. Full Moon = peak emotional intensity in markets.',
  },
  phaseName: {
    text: 'There are 8 lunar phases in a 29.5-day cycle. Each creates a distinct market mood — from the quiet of New Moon to the intensity of Full Moon.',
  },
  vocStatus: {
    text: 'Void of Course means the Moon makes no major aspects before changing signs. Traditionally a poor time to initiate new positions — wait for the Moon to enter its next sign.',
    topic: 'void_of_course',
  },
  moonSignBadge: {
    text: 'The zodiac sign the Moon currently occupies. This sets the market\'s emotional tone — shifting every 2-3 days as the Moon moves through the zodiac.',
  },
  waxingWaning: {
    text: 'Waxing (building toward Full) = accumulation phase, buy signals tend to be stronger. Waning (fading from Full) = distribution phase, sell/exit signals tend to be stronger.',
  },

  // ── Market Timing Guide ──
  fitBadge: {
    text: 'How the Moon sign\'s ruling planet relates to YOUR birth chart ruler. SYNERGY = friendly planets, trade with confidence. TENSION = conflicting planets, extra caution.',
  },
  sentimentLabel: {
    text: 'The overall market character when the Moon is in this zodiac sign — based on centuries of astrological observation adapted for modern trading.',
  },

  // ── Intraday Power Windows ──
  nodeUltraAligned: {
    text: 'ULTRA ALIGNED — Multiple cosmic systems (Vedic, Chinese, Numerological) agree simultaneously. This is the strongest possible trading signal.',
  },
  nodeHighPressure: {
    text: 'HIGH PRESSURE — Strong directional cosmic pressure from planetary alignments. Good for trend-following and momentum strategies.',
  },
  nodeSoulWindow: {
    text: 'SOUL WINDOW — A period uniquely attuned to your personal birth chart. Trust your intuition during these windows.',
  },
  nodeMixed: {
    text: 'MIXED — Competing cosmic signals from different systems. Stick to high-conviction setups only and use tighter risk management.',
  },
  nodeConflict: {
    text: 'CONFLICT — Active cosmic tension between planetary energies. Consider sitting out or significantly reducing position sizes.',
  },
  nodeDisruption: {
    text: 'DISRUPTION — Unexpected cosmic energy creating volatility. Trade defensively with protective stops.',
  },
  bestWindow: {
    text: 'Multiple favorable cosmic factors stack here — planetary allies, numerological alignment, and civilization agreement create a high-conviction window.',
  },
  marketStatus: {
    text: 'US stock market regular trading hours: 9:30 AM – 4:00 PM Eastern Time. Pre-market begins 4:00 AM, after-hours ends 8:00 PM.',
  },

  // ── Macro Time Cycles ──
  lunarArc: {
    text: 'The Moon completes a full cycle every 29.5 days. New Moon = quiet beginnings. Waxing = building momentum. Full Moon = peak energy. Waning = releasing and reflecting.',
    topic: 'lunar_cycle',
  },
  mercuryStatus: {
    text: 'Mercury rules communication, commerce, and contracts. When retrograde (appearing to move backward), expect delays, miscommunications, tech glitches, and market confusion.',
    topic: 'mercury_retrograde',
  },
  preShadow: {
    text: 'The pre-shadow period before retrograde. Effects start building gradually — begin slowing down on major financial decisions.',
  },
  postShadow: {
    text: 'The post-shadow period after retrograde ends. Lingering effects fade out over 2-3 weeks — gradually resume normal trading activity.',
  },
  weeklyRhythm: {
    text: 'Each day of the week is ruled by a specific planet: Mon=Moon, Tue=Mars, Wed=Mercury, Thu=Jupiter, Fri=Venus, Sat=Saturn, Sun=Sun. The ruler sets the day\'s energetic tone.',
  },

  // ── Trading Calendar ──
  calendarPrime: {
    text: 'PRIME — Highest cosmic alignment score. Multiple planetary, numerological, and lunar systems agree. Best days for trading.',
  },
  calendarStrong: {
    text: 'STRONG — Above-average cosmic alignment. Good day for trading with standard risk management.',
  },
  calendarSoul: {
    text: 'SOUL — Uniquely attuned to your personal birth chart. Your intuition is amplified on these days.',
  },
  calendarMixed: {
    text: 'MIXED — Average alignment with some competing signals. Trade selectively with careful analysis.',
  },
  calendarCaution: {
    text: 'CAUTION — Below-average alignment or active planetary conflicts. Consider reducing exposure.',
  },
  calendarMoonIcon: {
    text: 'Key lunar transitions — markets often shift energy around New and Full Moons. Watch for reversals near these dates.',
  },

  // ── Planetary Command Center ──
  allyHour: {
    text: 'ALLY — The hour\'s ruling planet is a friend to your birth ruler. These are your optimal trading windows — trade with confidence.',
    topic: 'ally_enemy_hours',
  },
  enemyHour: {
    text: 'ENEMY — The hour\'s ruling planet creates friction with your birth chart. Proceed with caution — reduce position sizes and tighten stops.',
  },
  neutralHour: {
    text: 'NEUTRAL — Neither strongly favorable nor unfavorable. Use standard risk management and analysis.',
  },
  selfHour: {
    text: 'YOUR RULER — This hour is governed by your own birth ruler planet. Maximum personal attunement — your strongest possible window.',
  },
  dayRuler: {
    text: 'Each day of the week is ruled by a planet. This planet\'s energy dominates today\'s market character and influences all 24 planetary hours.',
  },
  nextAllyCountdown: {
    text: 'Countdown until the next hour ruled by a planet friendly to your birth chart. Plan your trades around these upcoming windows.',
  },
  dayWisdom: {
    text: 'Ancient planetary trading philosophy adapted for modern markets. Wisdom based on the day ruler\'s traditional qualities and market observations.',
  },

  // ── NEO Core Reactor ──
  neoScore: {
    text: 'The NEO (Numerological-Environmental-Orbital) score checks 17 cosmic factors simultaneously. Higher score = more cosmic systems in agreement.',
    topic: 'neo_score',
  },
  neoClassification: {
    text: 'Ultra Aligned (14+/17) = maximum cosmic support. Aligned (10-13) = favorable. Mixed (7-9) = neutral. Conflicted (<7) = competing signals.',
  },

  // ── Hora Orbit Wheel ──
  horaRings: {
    text: 'Three concentric rings: Outer = Vedic planetary ruler for each hour. Middle = cosmic alignment color (green=aligned, red=conflict). Inner = Chinese zodiac animal.',
  },

  // ── Civilization Cards ──
  civVedic: {
    text: 'Vedic astrology (Jyotish) — India\'s 5,000-year-old system of celestial timing. Uses planetary hours (horas) to determine optimal action windows.',
  },
  civBabylonian: {
    text: 'Babylonian astrology (Chaldean) — the origin of Western astrology, dating back 4,000+ years. Created the 7-planet planetary hour system we use today.',
  },
  civEgyptian: {
    text: 'Egyptian astrology (Decan system) — based on 36 star groups (decans) that rise in 10-day sequences. Used for temple ritual and agricultural timing.',
  },
  civChinese: {
    text: 'Chinese astrology (Shi Chen) — 12 two-hour periods ruled by zodiac animals. Over 3,000 years of timing tradition adapted for market cycles.',
  },
  civStatusBadge: {
    text: 'ALIGNED = this ancient tradition\'s reading harmonizes with your birth chart. MIXED = neutral influence. CONFLICT = this system warns of friction — exercise caution.',
  },

  // ── Numerology Harmonics ──
  personalDay: {
    text: 'Your unique daily vibration number, calculated by combining today\'s date with your birth date. Cycles through 1-9, each with different energy.',
  },
  universalDay: {
    text: 'The universal energy vibration for today, based on the calendar date alone. This is the same for everyone — the collective energy field.',
  },
  personalYear: {
    text: 'Your personal year cycle (1-9), calculated from your birthday and the current year. Indicates the overall theme of this year for you.',
  },
  personalMonth: {
    text: 'Your personal month vibration, combining your personal year with the current month. Gives context to daily numbers within the monthly cycle.',
  },
  alignmentDay: {
    text: 'When your personal day number matches the universal day — a powerful numerological resonance that amplifies intuition and timing accuracy.',
    topic: 'alignment_day',
  },

  // ── Environmental Gauges ──
  kIndex: {
    text: 'The K-Index measures geomagnetic disturbance on a 0-9 scale. Values above 4 historically correlate with increased market volatility and emotional trading.',
    topic: 'k_index',
  },
  schumann: {
    text: 'Earth\'s electromagnetic pulse (normally 7.83 Hz). Elevated Schumann readings have been studied in relation to collective human behavior and decision-making.',
  },
  solarFlare: {
    text: 'Active solar flares can disrupt communications, satellite systems, and GPS — and have been correlated with periods of heightened market uncertainty.',
  },

  // ── Constellation Ring ──
  constellationFactor: {
    text: 'Each star represents one of the 17 cosmic alignment factors. Bright connected stars = passed factors. Dim red stars = factors that didn\'t pass today.',
  },

  // ── Next Hora Countdown ──
  nextHoraStatus: {
    text: 'The incoming planetary hour and whether its ruler is an ally or enemy to your birth chart. Ally = green (favorable), Enemy = red (cautious).',
  },
};
```

**Verify + commit:**
```bash
npm run build 2>&1 | grep "error" | head -10
git add src/components/CosmicDashboard/config/cosmicTooltips.ts
git commit -m "feat: add cosmicTooltips config — 40+ tooltip text entries for all cosmic modules"
```

---

## Task 3: Create sectionMeta.ts config

**File:** Create `src/components/CosmicDashboard/config/sectionMeta.ts`

```typescript
export interface SectionTutorial {
  whatItShows: string;
  howToRead: string;
  tradingTip: string;
}

export interface SectionMeta {
  id: string;
  zone: 'NOW' | 'THIS_WEEK' | 'DEEP';
  icon: string;
  title: string;
  subtitle: string;
  tutorial: SectionTutorial;
}

export const SECTION_META: Record<string, SectionMeta> = {
  soulBlueprint: {
    id: 'soulBlueprint',
    zone: 'NOW',
    icon: '🌟',
    title: 'Soul Blueprint',
    subtitle: 'Your cosmic identity at a glance',
    tutorial: {
      whatItShows: 'Your personal cosmic profile — life path number, zodiac signs, planetary ruler, and numerological alignments derived from your birth data.',
      howToRead: 'The large number is your Life Path — your core archetype. The zodiac badges show your Sun (identity), Moon (emotions), and Rising (outward approach). The right side shows your planetary ruler and Vedic nakshatra.',
      tradingTip: 'Watch the alignment chips at the bottom — when they glow gold, today\'s universal numbers match your personal numbers, amplifying your intuition.',
    },
  },
  moonPhase: {
    id: 'moonPhase',
    zone: 'NOW',
    icon: '🌙',
    title: 'Moon Phase & Market Guide',
    subtitle: 'Today\'s lunar energy and trading temperament',
    tutorial: {
      whatItShows: 'The current Moon phase, zodiac sign, illumination level, and what each Moon sign means for your trading decisions.',
      howToRead: 'Left side: the large moon disc shows today\'s phase visually. The colored badge below shows which zodiac sign the Moon is in. Right side: detailed trading guidance for the current Moon sign, with tactics and things to avoid.',
      tradingTip: 'Check the SYNERGY/TENSION badge — it shows how today\'s Moon energy aligns with YOUR specific birth chart. Synergy days are your edge.',
    },
  },
  intradayWindows: {
    id: 'intradayWindows',
    zone: 'NOW',
    icon: '⚡',
    title: 'Intraday Power Windows',
    subtitle: 'Your best and worst trading hours today, mapped to the market session',
    tutorial: {
      whatItShows: 'The full market day (9:30 AM – 4:00 PM) broken into color-coded planetary hour segments showing when cosmic energy favors or opposes trading.',
      howToRead: 'Gold shimmer = ultra-aligned (best). Green = strong. Blue = soul window (personalized). Yellow = mixed. Red = conflict (avoid). The white cursor shows current time. Star markers show best stacking windows.',
      tradingTip: 'Focus on the "Best Windows Remaining" list below the timeline — these are times where multiple favorable factors stack up.',
    },
  },
  macroCycles: {
    id: 'macroCycles',
    zone: 'THIS_WEEK',
    icon: '🌌',
    title: 'Macro Time Cycles',
    subtitle: 'Big-picture cosmic rhythms shaping market sentiment this month',
    tutorial: {
      whatItShows: 'Three macro-level cycles: the 29.5-day Lunar Month, Mercury\'s retrograde/direct cycle, and the weekly planetary rhythm.',
      howToRead: 'Left: the arc shows how far into the lunar month we are. Center: Mercury\'s current status (direct=green, retrograde=red). Right: each day of the week with its ruling planet — today\'s card has the gold border.',
      tradingTip: 'Mercury retrograde periods (shown in red) historically correlate with market confusion and reversals — reduce position sizes and avoid signing contracts.',
    },
  },
  tradingCalendar: {
    id: 'tradingCalendar',
    zone: 'THIS_WEEK',
    icon: '📅',
    title: 'Trading Calendar',
    subtitle: 'Color-coded cosmic quality score for every trading day',
    tutorial: {
      whatItShows: 'A week-at-a-glance (always visible) plus an expandable month view showing cosmic alignment quality for each day.',
      howToRead: 'Green days = strong alignment (trade actively). Amber = mixed (be selective). Red = conflict (reduce exposure). The star icon marks the best day of the week. Moon icons show key lunar transitions.',
      tradingTip: 'Use this to plan your week — stack your biggest trades on Prime/Strong days and sit out on Caution days.',
    },
  },
  planetaryCommand: {
    id: 'planetaryCommand',
    zone: 'THIS_WEEK',
    icon: '🌐',
    title: 'Planetary Command Center',
    subtitle: 'Which hours today favor your birth chart?',
    tutorial: {
      whatItShows: 'All 24 planetary hours of today displayed as a radial wheel, color-coded by their relationship to YOUR birth chart ruler.',
      howToRead: 'Cyan wedges = ally hours (favorable). Red = enemy hours (cautious). Gray = neutral. Gold = your own ruler\'s hour (best). The white beam points to the current hour. The tactical panel on the right shows countdowns and best windows.',
      tradingTip: 'The "Next Ally Hour" countdown tells you exactly when your next favorable window opens — plan your entries around these times.',
    },
  },
  neoReactor: {
    id: 'neoReactor',
    zone: 'DEEP',
    icon: '⚛️',
    title: 'NEO Score & Pressure Timeline',
    subtitle: 'Your 17-factor cosmic alignment score',
    tutorial: {
      whatItShows: 'Left: the NEO score checks 17 different cosmic factors (numerological, environmental, and orbital) and shows how many are currently aligned. Right: a 24-hour timeline showing cosmic pressure intensity throughout the day.',
      howToRead: 'The ring fills up green as more factors pass. Center shows the score (e.g., 12/17) and classification. Below, each factor is listed with its reasoning. On the timeline, brighter colors = stronger alignment.',
      tradingTip: 'Scores above 10/17 indicate strong multi-system agreement — your highest-conviction trading opportunities.',
    },
  },
  horaWheel: {
    id: 'horaWheel',
    zone: 'DEEP',
    icon: '🔮',
    title: 'Hora Orbit Wheel',
    subtitle: '24-hour planetary clock from four ancient traditions',
    tutorial: {
      whatItShows: 'A unified view of all 24 hours through three ancient lenses — Vedic planetary rulers (outer ring), cosmic alignment colors (middle), and Chinese zodiac animals (inner ring).',
      howToRead: 'Click any wedge to see its full reading including all four civilization interpretations, trading guidance, and the hour\'s overall node type. The glowing wedge is the current hour.',
      tradingTip: 'When multiple civilizations agree (all show "aligned"), you have the strongest cross-cultural confirmation for that hour.',
    },
  },
  civilizations: {
    id: 'civilizations',
    zone: 'DEEP',
    icon: '🏛️',
    title: 'Civilization Readings',
    subtitle: 'Four ancient systems, one modern edge',
    tutorial: {
      whatItShows: 'What four independent ancient astrological traditions say about this exact moment — Vedic (India), Babylonian (Mesopotamia), Egyptian (Decan), and Chinese (Shi Chen).',
      howToRead: 'Each card shows the tradition\'s current energy signal and an ALIGNED/MIXED/CONFLICT badge. The reading below explains the influence in trading terms.',
      tradingTip: 'When 3 or more civilizations show ALIGNED, you have rare cross-cultural consensus — a historically powerful signal.',
    },
  },
  numerologyEnv: {
    id: 'numerologyEnv',
    zone: 'DEEP',
    icon: '🔢',
    title: 'Numerology & Environment',
    subtitle: 'Personal number vibrations and Earth\'s geomagnetic activity',
    tutorial: {
      whatItShows: 'Left: four numerological cycles (personal day, universal day, year, month) showing your number vibrations. Right: real-time Earth environmental data including geomagnetic K-Index, Schumann resonance, and solar flare status.',
      howToRead: 'Numerology dials show values 1-9, with gold glow on alignment days. Environmental gauges use green/amber/red for calm/moderate/active. The trading impact line synthesizes both.',
      tradingTip: 'Alignment days (when personal = universal numbers) combined with calm environmental readings create the ideal conditions for high-conviction trades.',
    },
  },
  constellation: {
    id: 'constellation',
    zone: 'DEEP',
    icon: '✨',
    title: 'Constellation Ring',
    subtitle: 'Visual map of all 17 cosmic alignment factors',
    tutorial: {
      whatItShows: 'A star map where each of the 17 NEO factors is represented as a star point. Bright stars = passed factors. Dim red stars = failed factors. Lines connect the passed factors into a constellation pattern.',
      howToRead: 'More bright stars and more connecting lines = stronger overall alignment. Click any star to see which factor it represents and why it passed or failed today.',
      tradingTip: 'The constellation pattern is unique each day. Dense clusters of bright stars indicate areas of strong cosmic agreement.',
    },
  },
};

export const ZONE_META = {
  NOW: {
    label: '⚡ Right Now',
    description: 'What should I do right now?',
    accent: 'border-cyan-500/30',
    accentBg: 'bg-cyan-500/10',
    accentText: 'text-cyan-400',
    defaultExpanded: true,
  },
  THIS_WEEK: {
    label: '📅 This Week',
    description: 'What\'s coming up?',
    accent: 'border-amber-500/30',
    accentBg: 'bg-amber-500/10',
    accentText: 'text-amber-400',
    defaultExpanded: true,
  },
  DEEP: {
    label: '📚 Deep Knowledge',
    description: 'Reference & education',
    accent: 'border-purple-500/30',
    accentBg: 'bg-purple-500/10',
    accentText: 'text-purple-400',
    defaultExpanded: false,
  },
};
```

**Verify + commit:**
```bash
npm run build 2>&1 | grep "error" | head -10
git add src/components/CosmicDashboard/config/sectionMeta.ts
git commit -m "feat: add sectionMeta config — zone assignments, subtitles, tutorials for all 11 sections"
```

---

## Task 4: Create SectionTutorialModal

**File:** Create `src/components/CosmicDashboard/shared/SectionTutorialModal.tsx`

```tsx
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SectionTutorial } from '../config/sectionMeta';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  icon: string;
  title: string;
  tutorial: SectionTutorial;
}

export default function SectionTutorialModal({ isOpen, onClose, icon, title, tutorial }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700/30">
              <div className="flex items-center gap-2">
                <span className="text-xl">{icon}</span>
                <h3 className="text-white font-bold text-sm">{title}</h3>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-gray-700/50 hover:bg-gray-600/50 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                aria-label="Close tutorial"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <div>
                <p className="text-[10px] text-cyan-400 uppercase tracking-wider font-bold mb-1">What it shows</p>
                <p className="text-gray-300 text-xs leading-relaxed">{tutorial.whatItShows}</p>
              </div>
              <div>
                <p className="text-[10px] text-amber-400 uppercase tracking-wider font-bold mb-1">How to read it</p>
                <p className="text-gray-300 text-xs leading-relaxed">{tutorial.howToRead}</p>
              </div>
              <div>
                <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold mb-1">Trading tip</p>
                <p className="text-gray-300 text-xs leading-relaxed">{tutorial.tradingTip}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

**Verify + commit:**
```bash
npm run build 2>&1 | grep "error" | head -10
git add src/components/CosmicDashboard/shared/SectionTutorialModal.tsx
git commit -m "feat: add SectionTutorialModal — per-section help modals with 3-part tutorial"
```

---

## Task 5: Create CosmicSectionShell

**File:** Create `src/components/CosmicDashboard/shared/CosmicSectionShell.tsx`

```tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionTutorialModal from './SectionTutorialModal';
import type { SectionMeta } from '../config/sectionMeta';

interface Props {
  meta: SectionMeta;
  index: number;
  children: React.ReactNode;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: 'easeOut' as const },
  }),
};

export default function CosmicSectionShell({ meta, index, children }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);

  return (
    <>
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        custom={index}
      >
        {/* Section header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">{meta.icon}</span>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-xs uppercase tracking-widest">{meta.title}</h3>
            <p className="text-gray-500 text-[10px] truncate">{meta.subtitle}</p>
          </div>

          {/* Help button */}
          <button
            onClick={() => setShowTutorial(true)}
            className="w-6 h-6 rounded-full bg-gray-700/40 hover:bg-gray-600/50 flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
            aria-label={`Learn about ${meta.title}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
            </svg>
          </button>

          {/* Collapse toggle */}
          <button
            onClick={() => setExpanded(e => !e)}
            className="w-6 h-6 rounded-full bg-gray-700/40 hover:bg-gray-600/50 flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
            aria-label={expanded ? 'Collapse section' : 'Expand section'}
          >
            <motion.svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              animate={{ rotate: expanded ? 0 : -90 }}
              transition={{ duration: 0.2 }}
            >
              <path d="M19 9l-7 7-7-7" />
            </motion.svg>
          </button>
        </div>

        {/* Section content */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <SectionTutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        icon={meta.icon}
        title={meta.title}
        tutorial={meta.tutorial}
      />
    </>
  );
}
```

**Verify + commit:**
```bash
npm run build 2>&1 | grep "error" | head -10
git add src/components/CosmicDashboard/shared/CosmicSectionShell.tsx
git commit -m "feat: add CosmicSectionShell — section wrapper with title, subtitle, help, collapse"
```

---

## Task 6: Create CosmicZoneAccordion

**File:** Create `src/components/CosmicDashboard/shared/CosmicZoneAccordion.tsx`

```tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZONE_META } from '../config/sectionMeta';

interface Props {
  zone: 'NOW' | 'THIS_WEEK' | 'DEEP';
  children: React.ReactNode;
}

export default function CosmicZoneAccordion({ zone, children }: Props) {
  const meta = ZONE_META[zone];
  const [expanded, setExpanded] = useState(meta.defaultExpanded);

  return (
    <div className="space-y-5">
      {/* Zone header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border ${meta.accent} ${meta.accentBg} transition-all hover:opacity-90`}
      >
        <span className={`text-sm font-bold uppercase tracking-wider ${meta.accentText}`}>
          {meta.label}
        </span>
        <span className="text-gray-500 text-[10px] hidden sm:block">— {meta.description}</span>
        <motion.svg
          className={`w-4 h-4 ml-auto ${meta.accentText}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          animate={{ rotate: expanded ? 0 : -90 }}
          transition={{ duration: 0.2 }}
        >
          <path d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      {/* Zone content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-5 overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

**Verify + commit:**
```bash
npm run build 2>&1 | grep "error" | head -10
git add src/components/CosmicDashboard/shared/CosmicZoneAccordion.tsx
git commit -m "feat: add CosmicZoneAccordion — NOW/THIS_WEEK/DEEP temporal zone groups"
```

---

## Task 7: Create useInteractiveSelection hook

**File:** Create `src/components/CosmicDashboard/hooks/useInteractiveSelection.ts`

```typescript
import { useState, useCallback } from 'react';

export function useInteractiveSelection<T>() {
  const [selected, setSelected] = useState<T | null>(null);
  const [hovered, setHovered] = useState<T | null>(null);

  const select = useCallback((item: T) => {
    setSelected(prev => (prev === item ? null : item));
  }, []);

  const clear = useCallback(() => {
    setSelected(null);
    setHovered(null);
  }, []);

  // The "active" item is selected (pinned) or hovered (preview)
  const active = selected ?? hovered;

  const getHandlers = useCallback((item: T) => ({
    onClick: () => select(item),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(item); }
    },
    onMouseEnter: () => setHovered(item),
    onMouseLeave: () => setHovered(null),
    tabIndex: 0,
    role: 'button' as const,
  }), [select]);

  return { selected, hovered, active, select, clear, getHandlers };
}
```

**Verify + commit:**
```bash
npm run build 2>&1 | grep "error" | head -10
git add src/components/CosmicDashboard/hooks/useInteractiveSelection.ts
git commit -m "feat: add useInteractiveSelection hook — click/tap/keyboard selection for hover-only components"
```

---

## Task 8: Add tooltips to SoulBlueprintIdentityBar

**File:** Modify `src/components/CosmicDashboard/SoulBlueprintIdentityBar.tsx`

Add import at top:
```tsx
import CosmicInfoTooltip from './shared/CosmicInfoTooltip';
import { COSMIC_TOOLTIPS } from './config/cosmicTooltips';
```

Then add `<CosmicInfoTooltip>` next to these elements (adjacent to the label text, inline):
1. Life path number label → `COSMIC_TOOLTIPS.lifePathNumber`
2. Sun sign badge → `COSMIC_TOOLTIPS.sunSign`
3. Moon sign badge → `COSMIC_TOOLTIPS.moonSign`
4. Rising sign badge → `COSMIC_TOOLTIPS.risingSign`
5. Planetary ruler label → `COSMIC_TOOLTIPS.planetaryRuler`
6. Nakshatra label → `COSMIC_TOOLTIPS.nakshatra`

Pattern for each placement:
```tsx
<div className="flex items-center gap-1">
  <span className="text-gray-400 text-[10px]">Planetary Ruler</span>
  <CosmicInfoTooltip label="About planetary ruler">
    <p>{COSMIC_TOOLTIPS.planetaryRuler.text}</p>
  </CosmicInfoTooltip>
</div>
```

**Important:** Read the file first, find the exact labels, and add the tooltip inline next to each one. Keep the existing layout intact.

**Verify + commit:**
```bash
npm run build 2>&1 | grep "error" | head -10
git add src/components/CosmicDashboard/SoulBlueprintIdentityBar.tsx
git commit -m "feat: add 6 InfoTooltips to SoulBlueprintIdentityBar"
```

---

## Task 9: Add tooltips to MoonPhaseHero + MarketTimingGuide

**File:** Modify `src/components/CosmicDashboard/MoonPhaseHero.tsx`

Add import and 5 tooltips:
1. Next to "Moon Phase" header label → `COSMIC_TOOLTIPS.phaseName`
2. Next to illumination % text → `COSMIC_TOOLTIPS.illumination`
3. Next to "Waxing/Waning" text → `COSMIC_TOOLTIPS.waxingWaning`
4. Next to VOC badge → `COSMIC_TOOLTIPS.vocStatus`
5. Next to moon sign badge → `COSMIC_TOOLTIPS.moonSignBadge`

**File:** Modify `src/components/CosmicDashboard/MarketTimingGuide.tsx`

Add import and 2 tooltips:
1. Next to the SYNERGY/TENSION/NEUTRAL badge in the hero card → `COSMIC_TOOLTIPS.fitBadge`
2. Next to the sentiment label (VOLATILE, STABLE, etc.) → `COSMIC_TOOLTIPS.sentimentLabel`

**Verify + commit:**
```bash
npm run build 2>&1 | grep "error" | head -10
git add src/components/CosmicDashboard/MoonPhaseHero.tsx src/components/CosmicDashboard/MarketTimingGuide.tsx
git commit -m "feat: add 7 InfoTooltips to MoonPhaseHero and MarketTimingGuide"
```

---

## Task 10: Add tooltips + fix hover on IntradayTimeCycles

**File:** Modify `src/components/CosmicDashboard/IntradayTimeCycles.tsx`

**Tooltips (3):**
1. Add import of `CosmicInfoTooltip` + `COSMIC_TOOLTIPS`
2. In the legend section, add a tooltip next to each node type label (use the corresponding `nodeUltraAligned`, `nodeHighPressure`, etc. tooltips)
3. Next to best window star icons → `COSMIC_TOOLTIPS.bestWindow`
4. Next to MARKET OPEN/AFTER HOURS badge → `COSMIC_TOOLTIPS.marketStatus`

**Hover fix:**
1. Add import of `useInteractiveSelection`
2. Replace `title={h.tradingGuidance}` on segments with `{...getHandlers(i)}`
3. Show a detail card below the timeline when a segment is selected (similar to the existing title, but as a visible div)

**Verify + commit:**
```bash
npm run build 2>&1 | grep "error" | head -10
git add src/components/CosmicDashboard/IntradayTimeCycles.tsx
git commit -m "feat: add tooltips + tap-to-select to IntradayTimeCycles"
```

---

## Task 11: Add tooltips to MacroTimeCycles

**File:** Modify `src/components/CosmicDashboard/MacroTimeCycles.tsx`

Add import and 5 tooltips:
1. Next to "Lunar Month" sub-header → `COSMIC_TOOLTIPS.lunarArc`
2. Next to Mercury status badge (DIRECT/RETROGRADE) → `COSMIC_TOOLTIPS.mercuryStatus`
3. Next to PRE-SHADOW badge → `COSMIC_TOOLTIPS.preShadow`
4. Next to POST-SHADOW badge → `COSMIC_TOOLTIPS.postShadow`
5. Next to "Weekly Planetary Rhythm" label or first day card → `COSMIC_TOOLTIPS.weeklyRhythm`

**Verify + commit:**
```bash
npm run build 2>&1 | grep "error" | head -10
git add src/components/CosmicDashboard/MacroTimeCycles.tsx
git commit -m "feat: add 5 InfoTooltips to MacroTimeCycles"
```

---

## Task 12: Add tooltips + fix hover on TradingDayCalendar

**File:** Modify `src/components/CosmicDashboard/TradingDayCalendar.tsx`

**Tooltips (3):**
1. In the week strip header area, add tooltip for the quality labels → use `COSMIC_TOOLTIPS.calendarPrime` etc. (add a single tooltip near the week strip header explaining the color coding system)
2. Next to moon phase icons → `COSMIC_TOOLTIPS.calendarMoonIcon`
3. Next to the "Month View" toggle button → brief tooltip about what the expanded view shows

**Hover fix for month grid:**
1. Add `useInteractiveSelection`
2. Month grid day cells: replace `title` attribute with `{...getHandlers(dayIndex)}`
3. Show selected day's detail below the month grid (date, ruler, moon phase, score, node type)

**Verify + commit:**
```bash
npm run build 2>&1 | grep "error" | head -10
git add src/components/CosmicDashboard/TradingDayCalendar.tsx
git commit -m "feat: add tooltips + tap-to-select to TradingDayCalendar"
```

---

## Task 13: Add tooltips + fix hover on PlanetaryCommandCenter

**File:** Modify `src/components/CosmicDashboard/PlanetaryCommandCenter.tsx`

**Tooltips (4):**
1. Next to current hour ALLY/ENEMY/NEUTRAL label → `COSMIC_TOOLTIPS.allyHour` / `enemyHour` / `neutralHour` / `selfHour` (conditional)
2. Next to day ruler badge → `COSMIC_TOOLTIPS.dayRuler`
3. Next to "Next Ally Hour" label → `COSMIC_TOOLTIPS.nextAllyCountdown`
4. Next to "Day Wisdom" label → `COSMIC_TOOLTIPS.dayWisdom`

**Hover fix on wheel:**
1. Add `useInteractiveSelection`
2. SVG wedges: add `{...getHandlers(i)}` — click/tap to select a wedge
3. Show selected wedge detail in the tactical panel (planet name, time, ally/enemy status)

**Verify + commit:**
```bash
npm run build 2>&1 | grep "error" | head -10
git add src/components/CosmicDashboard/PlanetaryCommandCenter.tsx
git commit -m "feat: add 4 tooltips + tap-to-select wheel to PlanetaryCommandCenter"
```

---

## Task 14: Add tooltips + fix hover on NEOCoreReactor + CosmicPressureTimeline

**File:** Modify `src/components/CosmicDashboard/NEOCoreReactor.tsx`

**Tooltips (2):**
1. Next to classification label (in SVG center or near header) → `COSMIC_TOOLTIPS.neoClassification`
2. Near the factor list header → `COSMIC_TOOLTIPS.neoScore`

**Hover fix on factor list:**
1. Replace `hidden group-hover:block` pattern with click-to-expand accordion:
   - Each factor row becomes clickable
   - Click to expand/collapse reasoning text
   - Add `role="button"` and `tabIndex={0}` for keyboard access

**File:** Modify `src/components/CosmicDashboard/CosmicPressureTimeline.tsx`

**Tooltip (1):**
1. Near the legend area → tooltip explaining node type color coding

**Hover fix:**
1. Add `useInteractiveSelection`
2. Replace `onMouseEnter/Leave` with `{...getHandlers(i)}`
3. Selected hour shows detail card below timeline (persistent until deselected)

**Verify + commit:**
```bash
npm run build 2>&1 | grep "error" | head -10
git add src/components/CosmicDashboard/NEOCoreReactor.tsx src/components/CosmicDashboard/CosmicPressureTimeline.tsx
git commit -m "feat: add tooltips + tap-to-select to NEOCoreReactor and CosmicPressureTimeline"
```

---

## Task 15: Add tooltips + fix hover on HoraOrbitWheel + ConstellationRing

**File:** Modify `src/components/CosmicDashboard/HoraOrbitWheel.tsx`

**Tooltip (1):**
1. Near the wheel header or center default text → `COSMIC_TOOLTIPS.horaRings`

**Hover fix:**
1. Add `useInteractiveSelection`
2. Replace `setHoveredIdx` pattern:
   - `onMouseEnter` still previews on desktop
   - Add `onClick` to pin selection
   - Selected wedge stays highlighted and shows detail card below wheel
   - Tap again or tap another to change selection

**File:** Modify `src/components/CosmicDashboard/ConstellationRing.tsx`

**Tooltip (1):**
1. Near the header label → `COSMIC_TOOLTIPS.constellationFactor`

**Hover fix:**
1. Add `useInteractiveSelection`
2. Same pattern: click/tap to pin a factor node, show its name + reasoning below the ring
3. Add `tabIndex={0}` and `role="button"` on SVG nodes

**Verify + commit:**
```bash
npm run build 2>&1 | grep "error" | head -10
git add src/components/CosmicDashboard/HoraOrbitWheel.tsx src/components/CosmicDashboard/ConstellationRing.tsx
git commit -m "feat: add tooltips + tap-to-select to HoraOrbitWheel and ConstellationRing"
```

---

## Task 16: Add tooltips to remaining components

**File:** Modify `src/components/CosmicDashboard/CivilizationCards.tsx`

Add import and 5 tooltips:
1. Next to "Vedic" / "Jyotish" → `COSMIC_TOOLTIPS.civVedic`
2. Next to "Babylonian" / "Chaldean" → `COSMIC_TOOLTIPS.civBabylonian`
3. Next to "Egyptian" / "Decan System" → `COSMIC_TOOLTIPS.civEgyptian`
4. Next to "Chinese" / "Shi Chen" → `COSMIC_TOOLTIPS.civChinese`
5. Next to status badges → `COSMIC_TOOLTIPS.civStatusBadge` (one shared tooltip next to the header)

**File:** Modify `src/components/CosmicDashboard/NumerologyHarmonics.tsx`

Add import and 3 tooltips:
1. Next to "Personal" dial label → `COSMIC_TOOLTIPS.personalDay`
2. Next to "Universal" dial label → `COSMIC_TOOLTIPS.universalDay`
3. Next to alignment day badge → `COSMIC_TOOLTIPS.alignmentDay`

**File:** Modify `src/components/CosmicDashboard/EnvironmentalGauges.tsx`

Add import and 3 tooltips:
1. Next to K-Index label → `COSMIC_TOOLTIPS.kIndex`
2. Next to Schumann label → `COSMIC_TOOLTIPS.schumann`
3. Next to Solar Flare label → `COSMIC_TOOLTIPS.solarFlare`

**File:** Modify `src/components/CosmicDashboard/NextHoraCountdown.tsx`

Add import and 1 tooltip:
1. Next to ally/enemy badge → `COSMIC_TOOLTIPS.nextHoraStatus`

**Verify + commit:**
```bash
npm run build 2>&1 | grep "error" | head -10
git add src/components/CosmicDashboard/CivilizationCards.tsx src/components/CosmicDashboard/NumerologyHarmonics.tsx src/components/CosmicDashboard/EnvironmentalGauges.tsx src/components/CosmicDashboard/NextHoraCountdown.tsx
git commit -m "feat: add 12 InfoTooltips to CivilizationCards, NumerologyHarmonics, EnvironmentalGauges, NextHoraCountdown"
```

---

## Task 17: Rewrite CosmicTimingDashboard.tsx with zones + shells

**File:** Modify `src/components/CosmicDashboard/CosmicTimingDashboard.tsx`

This is a full rewrite. Replace the inline `Section` pattern with `CosmicZoneAccordion` + `CosmicSectionShell`.

Key changes:
1. Remove the `Section` component and `sectionVariants`
2. Import `CosmicZoneAccordion`, `CosmicSectionShell`, `SECTION_META`
3. Group sections into 3 zones: NOW, THIS_WEEK, DEEP
4. Each section gets `<CosmicSectionShell meta={SECTION_META.xxx} index={n}>`

The data fetching logic stays exactly the same. Only the render section changes.

Read the current file first, keep ALL state/fetch logic, and only replace the return JSX.

**Verify + commit:**
```bash
npm run build 2>&1 | tail -20
git add src/components/CosmicDashboard/CosmicTimingDashboard.tsx
git commit -m "feat: rewrite CosmicTimingDashboard with zone groups + section shells + tutorials"
```

---

## Task 18: Build, deploy & push

**Step 1: Full build verification**
```bash
cd /Users/ivanjackson/Desktop/aicharttraderchris && npm run build 2>&1 | tail -5
```
Expected: "built in Xs" with 0 errors.

**Step 2: Deploy to Cloudflare Pages**
```bash
npx wrangler pages deploy dist --project-name aicharttraderchris --commit-dirty=true 2>&1 | tail -8
```

**Step 3: Push to GitHub**
```bash
git push origin main
```

**Step 4: Verify live**
- Navigate to Cosmic Timing tab
- Verify zone headers (NOW / THIS WEEK / DEEP KNOWLEDGE)
- Verify DEEP zone is collapsed by default
- Click `?` on any section → tutorial modal appears
- Click collapse chevron → section collapses
- Hover/tap a `?` tooltip icon → tooltip appears with educational text
- On mobile: tap tooltips work, tap-to-select works on wheel/timeline
- Verify all existing visualizations still render correctly
