# Cosmic Timing UX Overhaul — Design
**Date:** 2026-03-04
**Status:** Approved
**Goal:** Elevate every module in the Cosmic Timing section to agency-quality UX: accessible tooltips on every astrological term, section-level tutorials, progressive disclosure via temporal zones, fix all hover-only interactions for mobile/keyboard, and visual polish.

---

## Architecture: 4 Shared Primitives + 2 Config Files

### Primitive 1: `CosmicInfoTooltip`
**File:** `src/components/CosmicDashboard/shared/CosmicInfoTooltip.tsx`

Reusable accessible tooltip matching Market Intelligence's `InfoTooltip` pattern:
- Trigger: hover + focus + click/tap (mobile-friendly)
- Small `?` icon button (4×4 rounded circle, `bg-gray-700/50`)
- `aria-label` for screen readers
- Fixed-position tooltip panel (centered, `z-[9999]`, max-width 320px)
- Glass morphism styling matching cosmic theme
- Optional "Learn More with AI" button (callback to open AI chat)
- Children content pattern (any JSX)

```typescript
interface CosmicInfoTooltipProps {
  label: string;           // aria-label
  children: React.ReactNode; // tooltip content
  topic?: string;          // AI learning topic key
  onLearn?: (topic: string) => void;
}
```

### Primitive 2: `CosmicSectionShell`
**File:** `src/components/CosmicDashboard/shared/CosmicSectionShell.tsx`

Wraps every section with consistent header + collapse + help:
- Icon (emoji) + Title (uppercase, tracking-widest) + Subtitle (plain English, gray-400)
- `?` help button → opens `SectionTutorialModal`
- Collapse/expand chevron toggle (AnimatePresence)
- Framer Motion staggered entry animation (preserves current behavior)

```typescript
interface CosmicSectionShellProps {
  icon: string;
  title: string;
  subtitle: string;
  tutorialKey: string;
  defaultExpanded?: boolean;  // default true
  index: number;              // for stagger animation
  children: React.ReactNode;
}
```

### Primitive 3: `CosmicZoneAccordion`
**File:** `src/components/CosmicDashboard/shared/CosmicZoneAccordion.tsx`

Groups sections into 3 temporal zones:
- **NOW** (accent: `aurora-500` cyan) — "What should I do right now?"
- **THIS WEEK** (accent: `solar-500` gold) — "What's coming up?"
- **DEEP KNOWLEDGE** (accent: `nebula-500` purple) — "Reference & education"

Each zone has:
- Colored accent bar (left border or top line)
- Zone label + brief description
- Collapse/expand entire zone
- DEEP KNOWLEDGE zone defaults to collapsed

```typescript
interface CosmicZoneAccordionProps {
  zone: 'NOW' | 'THIS_WEEK' | 'DEEP';
  defaultExpanded?: boolean;
  children: React.ReactNode;
}
```

### Primitive 4: `SectionTutorialModal`
**File:** `src/components/CosmicDashboard/shared/SectionTutorialModal.tsx`

Lightweight modal triggered by section `?` button:
- Overlay backdrop (dark, click-outside-to-dismiss)
- Glass panel with 3-4 bullet points:
  - **What it shows** (1 sentence)
  - **How to read it** (1-2 sentences)
  - **Trading tip** (1 sentence)
- Close X button
- Content from `sectionMeta.ts` config

---

## Config Files

### `sectionMeta.ts`
**File:** `src/components/CosmicDashboard/config/sectionMeta.ts`

Metadata for all 11 sections:
```typescript
interface SectionMeta {
  id: string;
  zone: 'NOW' | 'THIS_WEEK' | 'DEEP';
  icon: string;
  title: string;
  subtitle: string;
  tutorial: {
    whatItShows: string;
    howToRead: string;
    tradingTip: string;
  };
  defaultExpanded: boolean;
}
```

**Section assignments:**

| Zone | Section | Icon | Subtitle |
|------|---------|------|----------|
| NOW | Soul Blueprint | 🌟 | Your cosmic identity at a glance |
| NOW | Moon Phase + Market Guide | 🌙 | Today's lunar energy and trading temperament |
| NOW | Intraday Power Windows | ⚡ | Your best and worst trading hours today |
| THIS_WEEK | Macro Time Cycles | 🌌 | Big-picture cosmic rhythms shaping market sentiment |
| THIS_WEEK | Trading Calendar | 📅 | Color-coded cosmic quality score for every trading day |
| THIS_WEEK | Planetary Command Center | 🌐 | Which hours today favor your birth chart? |
| DEEP | NEO + Pressure Timeline | ⚛️ | Your 17-factor cosmic alignment score |
| DEEP | Hora Orbit Wheel | 🔮 | 24-hour planetary clock from four ancient traditions |
| DEEP | Civilization Cards | 🏛️ | Four ancient systems, one modern edge |
| DEEP | Numerology + Environmental | 🔢 | Personal number vibrations and Earth's activity |
| DEEP | Constellation Ring | ✨ | Visual map of all 17 cosmic alignment factors |

### `cosmicTooltips.ts`
**File:** `src/components/CosmicDashboard/config/cosmicTooltips.ts`

All ~40 tooltip entries as a keyed record:
```typescript
const COSMIC_TOOLTIPS: Record<string, { text: string; aiTopic?: string }> = {
  lifePathNumber: {
    text: 'Your life path number reveals your core purpose and natural trading strengths. Calculated from your birth date.',
    aiTopic: 'life_path_number'
  },
  sunSign: {
    text: 'Your Sun sign represents your core identity and conscious personality — how you naturally approach markets.',
    aiTopic: 'sun_sign'
  },
  moonSignBadge: {
    text: 'The zodiac sign the Moon currently occupies. Sets the market\'s emotional tone for today.',
  },
  vocStatus: {
    text: 'Void of Course means the Moon makes no major aspects before changing signs. Traditionally a poor time to start new positions.',
    aiTopic: 'void_of_course'
  },
  illuminationPct: {
    text: 'How much of the moon is lit. Higher illumination = more market energy and conviction. Full moon = peak emotional intensity.',
  },
  waxingWaning: {
    text: 'Waxing (building) = accumulation phase, buy signals stronger. Waning (releasing) = distribution phase, sell signals stronger.',
  },
  mercuryRetrograde: {
    text: 'Mercury rules communication and commerce. When retrograde, expect delays, miscommunications, and tech glitches that affect markets.',
    aiTopic: 'mercury_retrograde'
  },
  preShadow: {
    text: 'The transition period before retrograde begins. Effects start building — slow down on major decisions.',
  },
  postShadow: {
    text: 'The clearing period after retrograde ends. Lingering effects fade out — gradually resume normal trading.',
  },
  dayRuler: {
    text: 'Each day of the week is ruled by a planet. This planet\'s energy dominates today\'s market character.',
  },
  allyHour: {
    text: 'The hour\'s ruling planet is a friend to your birth ruler — trade with confidence. These are your optimal windows.',
    aiTopic: 'ally_enemy_hours'
  },
  enemyHour: {
    text: 'The hour\'s ruling planet creates friction with your chart. Proceed with caution — reduce position sizes.',
  },
  neutralHour: {
    text: 'Neither strongly favorable nor unfavorable. Use normal risk management.',
  },
  nodeUltraAligned: {
    text: 'ULTRA ALIGNED — Multiple cosmic systems agree simultaneously. Strongest possible trading signal.',
  },
  nodeHighPressure: {
    text: 'HIGH PRESSURE — Strong directional cosmic pressure. Good for trend-following strategies.',
  },
  nodeSoulWindow: {
    text: 'SOUL WINDOW — A period uniquely attuned to your personal chart. Trust your intuition.',
  },
  nodeMixed: {
    text: 'MIXED — Competing cosmic signals. Stick to high-conviction trades only.',
  },
  nodeConflict: {
    text: 'CONFLICT — Active cosmic tension. Consider sitting out or reducing position sizes.',
  },
  nodeDisruption: {
    text: 'DISRUPTION — Unexpected cosmic energy. Volatility spikes likely — trade defensively.',
  },
  calendarPrime: {
    text: 'PRIME — Highest cosmic alignment score. Multiple planetary and numerological systems agree.',
  },
  calendarStrong: {
    text: 'STRONG — Above-average cosmic alignment. Good day for trading with normal risk.',
  },
  calendarCaution: {
    text: 'CAUTION — Below-average alignment or active conflicts. Reduce exposure or wait.',
  },
  neoScore: {
    text: 'The NEO (Numerological-Environmental-Orbital) score checks 17 cosmic factors. Higher = more alignment.',
    aiTopic: 'neo_score'
  },
  neoClassification: {
    text: 'Ultra Aligned (14+) = maximum cosmic support. Aligned (10-13) = favorable. Mixed (7-9) = neutral. Conflicted (<7) = competing signals.',
  },
  kIndex: {
    text: 'Measures Earth\'s geomagnetic disturbance (0-9 scale). High K-Index historically correlates with increased market volatility.',
    aiTopic: 'k_index'
  },
  schumannResonance: {
    text: 'Earth\'s electromagnetic pulse (normally 7.83 Hz). Elevated readings have been studied in relation to collective human behavior.',
  },
  solarFlare: {
    text: 'Active solar flares can disrupt communications, satellite systems, and have been correlated with periods of market uncertainty.',
  },
  personalDay: {
    text: 'Your unique daily vibration number, calculated from today\'s date and your birth date.',
  },
  universalDay: {
    text: 'The universal energy vibration for today, based on the calendar date. Same for everyone.',
  },
  alignmentDay: {
    text: 'When your personal day number matches the universal day — a powerful resonance that amplifies your trading instincts.',
    aiTopic: 'alignment_day'
  },
  synergy: {
    text: 'SYNERGY — The Moon sign\'s ruling planet is a friend to your birth ruler. You\'re in harmony with today\'s lunar energy.',
  },
  tension: {
    text: 'TENSION — The Moon sign\'s ruler conflicts with your birth ruler. Stay disciplined and reduce risk.',
  },
  resonance: {
    text: 'RESONANCE — The Moon sign\'s ruler IS your birth ruler. Maximum personal attunement with today\'s energy.',
  },
  nakshatra: {
    text: 'Your Vedic lunar mansion — the specific star pattern present at your birth. One of 27 nakshatras that refine your Moon sign.',
    aiTopic: 'nakshatra'
  },
  planetaryRuler: {
    text: 'The planet that governs your zodiac sign. Determines which planetary hours are allies and enemies for you.',
  },
  risingSign: {
    text: 'Your Rising (Ascendant) sign — how the world sees you and your natural approach to risk and opportunity.',
  },
  horaWheel: {
    text: 'Three rings: Outer = Vedic planetary ruler, Middle = cosmic alignment color, Inner = Chinese zodiac animal for each hour.',
  },
  constellationFactor: {
    text: 'Each star represents one of the 17 cosmic alignment factors. Bright = factor passed. Dim red = factor failed.',
  },
  civilizationVedic: {
    text: 'Vedic (Jyotish) — India\'s 5,000-year-old astrological system. Uses planetary hours (horas) for timing.',
  },
  civilizationBabylonian: {
    text: 'Babylonian (Chaldean) — The origin of Western astrology, 4,000+ years old. Created the 7-planet hour system.',
  },
  civilizationEgyptian: {
    text: 'Egyptian (Decan) — Based on 36 star groups (decans) that rise in sequence. Used for temple ritual timing.',
  },
  civilizationChinese: {
    text: 'Chinese (Shi Chen) — 12 two-hour periods ruled by zodiac animals. Over 3,000 years of market timing tradition.',
  },
  nextAllyHour: {
    text: 'Countdown until the next hour ruled by a planet friendly to your birth chart. Plan your trades around these windows.',
  },
  dayWisdom: {
    text: 'Ancient planetary trading philosophy adapted for modern markets. Based on the day ruler\'s traditional qualities.',
  },
};
```

---

## Per-Module Changes

### Hover-Only Fixes (5 components)

For these components, replace hover-only with a shared `useInteractiveSelection` hook:
- `HoraOrbitWheel.tsx` — click/tap a wedge to pin detail card below wheel
- `ConstellationRing.tsx` — click/tap a node to show factor name + reasoning below ring
- `CosmicPressureTimeline.tsx` — click/tap an hour to show detail card below timeline
- `IntradayTimeCycles.tsx` — click/tap a segment to show detail below bar
- `NEOCoreReactor.tsx` — click/tap a factor row to expand reasoning (accordion)

Hook signature:
```typescript
function useInteractiveSelection<T>(): {
  selected: T | null;
  select: (item: T) => void;  // tap to select, tap again to deselect
  clear: () => void;
  handlers: (item: T) => {
    onClick: () => void;
    onKeyDown: (e: KeyboardEvent) => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    tabIndex: number;
    role: string;
    'aria-label': string;
  };
}
```

### Tooltip Placements (~40 total)

| Component | Tooltip Count | Specific Placements |
|-----------|:---:|-----|
| SoulBlueprintIdentityBar | 6 | life path, sun sign, moon sign, rising sign, planetary ruler, nakshatra |
| MacroTimeCycles | 5 | lunar arc header, mercury status badge, pre/post shadow badges, day card planets |
| IntradayTimeCycles | 3 | node type legend items, best window stars, market status badge |
| TradingDayCalendar | 3 | quality labels, moon icons, planet ruler glyph |
| MoonPhaseHero | 5 | illumination %, phase name, VOC badge, moon sign badge, waxing/waning |
| MarketTimingGuide | 2 | synergy/tension badge, sentiment label |
| PlanetaryCommandCenter | 4 | ally/enemy badge, day ruler badge, next ally countdown, day wisdom |
| NEOCoreReactor | 2 | score classification, factor list header |
| CosmicPressureTimeline | 1 | node type legend (shared with intraday) |
| HoraOrbitWheel | 1 | ring explanation in header |
| CivilizationCards | 5 | 4 civilization names + status badges |
| NumerologyHarmonics | 3 | personal day, universal day, alignment badge |
| EnvironmentalGauges | 3 | K-Index, Schumann, solar flare |
| ConstellationRing | 1 | ring explanation in header |
| NextHoraCountdown | 1 | ally/enemy status badge |

### Visual Polish
- All section headers: consistent emoji icon + uppercase title + gray-400 subtitle
- Past hours: dim to 30% opacity in PlanetaryCommandCenter (already done) and IntradayTimeCycles
- One hero element per section: reduce secondary animations
- Mobile: All grids collapse to single column; wheels get min-width 300px with scroll

---

## New Component Files
```
src/components/CosmicDashboard/
  shared/
    CosmicInfoTooltip.tsx
    CosmicSectionShell.tsx
    CosmicZoneAccordion.tsx
    SectionTutorialModal.tsx
  config/
    cosmicTooltips.ts
    sectionMeta.ts
  hooks/
    useInteractiveSelection.ts
```

## Modified Component Files (15 + orchestrator)
```
CosmicTimingDashboard.tsx         — rewrite with zones + section shells
SoulBlueprintIdentityBar.tsx      — add 6 tooltips
MacroTimeCycles.tsx               — add 5 tooltips
IntradayTimeCycles.tsx            — add 3 tooltips + tap-to-select fix
TradingDayCalendar.tsx            — add 3 tooltips + tap-to-select fix
MoonPhaseHero.tsx                 — add 5 tooltips
MarketTimingGuide.tsx             — add 2 tooltips
PlanetaryCommandCenter.tsx        — add 4 tooltips + tap-to-select fix
NEOCoreReactor.tsx                — add 2 tooltips + tap-to-expand fix
CosmicPressureTimeline.tsx        — add 1 tooltip + tap-to-select fix
HoraOrbitWheel.tsx                — add 1 tooltip + tap-to-select fix
CivilizationCards.tsx             — add 5 tooltips
NumerologyHarmonics.tsx           — add 3 tooltips
EnvironmentalGauges.tsx           — add 3 tooltips
ConstellationRing.tsx             — add 1 tooltip + tap-to-select fix
NextHoraCountdown.tsx             — add 1 tooltip
```

---

## Technical Notes
- CosmicInfoTooltip: Pure React state (no context provider needed)
- SectionTutorialModal: Uses createPortal to document.body for z-index safety
- useInteractiveSelection: Handles click/tap/keyboard (Enter/Space) + maintains hover preview behavior on desktop
- All tooltip text is in cosmicTooltips.ts — single source of truth, easy to update
- No new dependencies required
- Framer Motion AnimatePresence for collapse/expand animations
