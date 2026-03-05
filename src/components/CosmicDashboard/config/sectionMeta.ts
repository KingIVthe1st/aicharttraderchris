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
