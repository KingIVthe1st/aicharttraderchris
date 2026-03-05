# Cosmic Timing Dashboard v2 — Design
**Date:** 2026-03-04
**Status:** Approved
**Goal:** Elevate the Cosmic Timing tab to match the quality of the Market Intelligence tab — adding 5 priority new sections, reordering by priority, and enhancing all existing components to multi-million-dollar agency quality.

---

## Priority Layout (Top to Bottom)

### 0. Soul Blueprint Identity Bar *(existing — stays at top)*
No changes. Remains the sticky identity anchor.

---

### 1. MACRO TIME CYCLES *(new — full width)*
Three instruments in a horizontal glass panel row:

**A) Lunar Month Orrery Arc** (left third)
- SVG arc spanning the 29.5-day lunar cycle
- Arc fills as days progress: deep indigo (New) → nebula purple (Waxing) → solar gold (Full) → dark (Waning)
- Glowing dot at today's position on the arc
- Four milestone labels: 🌑 New · 🌓 First Quarter · 🌕 Full · 🌗 Last Quarter
- Large "Day 14 of 29" display in monospace font
- Data source: `moonPhase.daysIntoCycle` (already in `/api/cosmic/daily`)

**B) Mercury Cycle Radar** (center third)
- Oval orbital path SVG with Mercury position marker
- Color states: silver (Direct), amber (Pre/Post Shadow), red + pulse (Retrograde)
- Countdown badge: "Next phase in 12d 4h"
- Frontend-computed from known Mercury retrograde dates hardcoded in a lookup table
- Framer Motion breathing pulse when in retrograde state

**C) Weekly Planetary Rhythm** (right third)
- 7 compact day cards Mon–Sun in horizontal strip
- Each card: planet ruling glyph (☽ ☉ ♂ ☿ ♃ ♀ ♄), day abbreviation, soft colored background
- Today's card: solar gold pulsing border
- Hover tooltip: shows ally/enemy planets for that day
- Data: hardcoded planetary day rulers (Mon=Moon, Tue=Mars, Wed=Mercury, Thu=Jupiter, Fri=Venus, Sat=Saturn, Sun=Sun)

---

### 2. INTRADAY TIME CYCLES *(new — full width)*
"Power Windows Timeline" — horizontal instrument showing the trading day.

- Horizontal axis: 9:30 AM → 4:00 PM ET
- Colored bands from `horaGrid.hours`: ULTRA_ALIGNED=gold shimmer, HIGH_PRESSURE=green, CONFLICT=red wash, SOUL_WINDOW=blue glow
- Real-time animated cursor beam at current time (CSS/setInterval)
- Planetary transition tick marks at each hora change with planet glyph labels
- Gold highlighted zones where 2+ favorable factors stack (bestTradingWindows)
- Right panel: "Best 3 windows remaining today" ranked list with countdowns
- Data sources: `horaGrid.hours`, `bestTradingWindows`, `planetaryHours` (all already available)

---

### 3. OPTIMUM TRADING CALENDAR *(new)*

**Week Strip** (always visible — full width)
- 7 day cards horizontal row (Mon–Sun)
- Each card: day name, planet ruler glyph, color-coded bg (emerald/amber/red), descriptor text
- Today: bright glowing border + "TODAY" chip
- Best day: ⭐ corner icon
- Data: frontend-computed from day-of-week rulers + existing horaGrid nodeType logic

**Month Calendar** (expandable via toggle button)
- 5×7 grid standard calendar layout
- Day cells: color-coded by alignment score (gradient intensity)
- Moon phase icons on key days (🌑🌓🌕🌗)
- Current day: glowing ring
- Hover tooltip: day ruler, alignment preview, moon phase
- **Requires new backend endpoint:** `GET /api/cosmic/weekly?days=30` returning array of:
  `{ date, dayRuler, moonPhaseName, moonIllumination, nodeType, score, moonSign }`

---

### 4. MOON PHASE HERO + MARKET TIMING GUIDE *(side by side, 45/55)*

**Moon Phase Hero Card** (left, 45%)
- Existing SVG moon disc scaled 3× larger, centered
- Large zodiac sign badge: "Moon in ♉ Taurus" with sign-specific accent color
- Illumination % as large glowing number
- Phase name in gradient text
- Waxing/waning animated arrow indicator
- VOC alert badge (red if void)
- "Ingress in 18h" countdown chip
- **Requires backend:** Add `moonSign: string` to `CosmicIntelligence` (expose existing `getApproximateMoonSign()` in cosmicEngine.ts)

**Market Timing Guide** (right, 55%)
- Header: "Moon in [Sign] Trading Sentiment"
- Current sign card (expanded, gold border): sign glyph, sentiment label (BULLISH MOMENTUM / STABLE / VOLATILE / CAUTIOUS), 3-sentence guidance, personalized fit chip
- 12 sign mini-accordion below (collapsed by default, expandable)
- Personalization: compare moon sign's ruling planet to user's `blueprint.planetaryRuler` → show SYNERGY / NEUTRAL / TENSION badge
- All 12 sign guides: hardcoded frontend content (no backend needed beyond `moonSign`)

**12-Sign Trading Guide (hardcoded content):**
| Sign | Ruling Planet | Market Bias | Trading Character |
|------|--------------|-------------|-------------------|
| Aries ♈ | Mars | VOLATILE | Impulsive momentum, breakouts, fast reversals |
| Taurus ♉ | Venus | STABLE | Accumulation, value focus, slow methodical trends |
| Gemini ♊ | Mercury | MIXED | News-driven, indecisive whipsaw, high volume |
| Cancer ♋ | Moon | SENSITIVE | Defensive, sector rotation, emotional reactions |
| Leo ♌ | Sun | BULLISH | Confidence surge, large-cap strength, risk-on |
| Virgo ♍ | Mercury | ANALYTICAL | Earnings focus, detail-driven, modest trends |
| Libra ♎ | Venus | BALANCED | Sideways price discovery, M&A activity |
| Scorpio ♏ | Mars/Pluto | INTENSE | High volatility, sudden reversals, dark pools |
| Sagittarius ♐ | Jupiter | EXPANSIVE | Risk appetite, global markets, optimism |
| Capricorn ♑ | Saturn | DISCIPLINED | Institutional buying, slow steady climbs |
| Aquarius ♒ | Saturn/Uranus | ERRATIC | Tech sector, unexpected gaps, innovation themes |
| Pisces ♓ | Jupiter/Neptune | FOGGY | Low conviction, sector confusion, defensive |

---

### 5. PLANETARY DAY RULER — COMMAND CENTER *(new, full width)*

**Left 65%: 24-Hour Command Wheel**
- 24-wedge SVG radial wheel (same structure as HoraOrbitWheel)
- Wedge colors by relationship to user's natal `blueprint.planetaryRuler`:
  - Ally hours: aurora cyan fill + outer glow ring
  - Enemy hours: deep red fill + pulsing red border
  - Neutral hours: dark slate + silver stroke
  - Current hour: white beam from center + breathing glow
- Center circle: Today's ruling planet sigil (large), day name
- Outer ring: planet glyph + abbreviated time
- Passed hours: dimmed (50% opacity)
- Upcoming ally hours: subtle shimmer animation
- Data: `planetaryHours.nextHours` (all 24 hours with `isAllyHour`/`isEnemyHour` flags already available)

**Right 35%: Tactical Panel**
- Current hour status chip: ALLY / NEUTRAL / ENEMY with colored glow
- "Next Ally Hour in: 1h 23m" live countdown
- Top 5 ally windows ranked with times
- Day summary: "X ally · Y neutral · Z enemy"
- "Day Ruler Wisdom" — 2-line hardcoded blurb per day ruler
- Friend/enemy planet glyphs listed
- Data: same `planetaryHours` data already available

---

### 6–12. Existing Sections (reordered below new content)
1. NEO Core Reactor + Cosmic Pressure Timeline (side by side)
2. Hora Orbit Wheel
3. Civilization Cards
4. Numerology Harmonics + Environmental Gauges
5. Constellation Ring

---

## AI-Generated Images Required
| File | Prompt | Used In |
|------|--------|---------|
| `cosmic-macro-cycles-bg.png` | Deep space orrery with concentric planetary rings, Mercury retrograde arc, lunar cycle track, gold/navy/indigo | Macro Time Cycles panel |
| `cosmic-trading-calendar-bg.png` | Holographic cosmic calendar with moon phase icons, constellation grid overlay, deep navy | Trading Calendar panel |
| `cosmic-day-ruler-bg.png` | Ancient celestial clock face with seven planetary sigils, radial glow, dark glass | Planetary Day Ruler panel |

---

## Backend Changes Required

### Change 1: Add `moonSign` to CosmicIntelligence
**File:** `aicharttraderchris-backend/src/cosmicEngine.ts`
- Call `getApproximateMoonSign(date)` from `astrology.ts` (already exists)
- Add `moonSign: string` to the returned object
**File:** `aicharttraderchris-backend/src/index.ts`
- Update CosmicIntelligence type/interface

### Change 2: New `/api/cosmic/weekly` endpoint
**File:** `aicharttraderchris-backend/src/index.ts`
- `GET /api/cosmic/weekly?days=30&timezone=...`
- Auth required (authMiddleware)
- Loop through next N days, compute for each: `{ date, dayRuler, moonPhaseName, moonIllumination, nodeType, score, moonSign }`
- Use existing `getDayRuler(date)`, `getMoonPhase(date)`, `getApproximateMoonSign(date)`, basic NEO approximation
- Cache in KV for 6 hours

---

## New Component Files
```
src/components/CosmicDashboard/
  MacroTimeCycles.tsx          (Section 1 — orrery arc, Mercury radar, weekly rhythm)
  IntradayTimeCycles.tsx       (Section 2 — power windows timeline)
  TradingDayCalendar.tsx       (Section 3 — week strip + month calendar)
  MoonPhaseHero.tsx            (Section 4 left — enhanced moon + zodiac)
  MarketTimingGuide.tsx        (Section 4 right — moon sign trading atlas)
  PlanetaryCommandCenter.tsx   (Section 5 — day ruler command wheel + tactical panel)
```

---

## Frontend Type Additions
```typescript
// Add to CosmicIntelligence:
moonSign: string; // e.g., "Taurus", "Aries"

// New type for weekly calendar:
interface WeeklyCalendarDay {
  date: string;
  dayRuler: string;
  moonPhaseName: string;
  moonIllumination: number;
  nodeType: string;
  score: number;
  moonSign: string;
}
```

---

## Technical Implementation Notes
- All new SVG components: pure SVG + Tailwind, no chart libraries
- Framer Motion for all entry animations (staggered spring physics)
- CSS `setInterval` for real-time cursors and countdowns
- Mercury retrograde dates: hardcoded lookup table for 2024–2027
- Planetary day rulers: hardcoded array indexed by `date.getDay()`
- 12-sign market guide: hardcoded constant object
- Day ruler friend/enemy relationships: hardcoded lookup table
