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
