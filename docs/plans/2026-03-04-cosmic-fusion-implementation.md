# Cosmic Trading Fusion — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate the NEO 17-Point cosmic timing system into AI Chart Trader, adding personalized soul blueprints, a cosmic timing dashboard, optional cosmic overlay on chart analysis, and a redesigned landing page.

**Architecture:** Backend-computed approach. All cosmic calculations happen on the Cloudflare Worker. New modules in `src/` compute numerology, astrology, planetary hours, Chinese zodiac, hora grid, and NEO scoring. Frontend fetches pre-computed payloads via new API endpoints. Soul blueprints stored in D1.

**Tech Stack:** Hono (backend), React + TypeScript + Tailwind + Framer Motion (frontend), D1 (database), KV (caching), Cloudflare Workers (compute)

**Design Doc:** `docs/plans/2026-03-04-cosmic-trading-fusion-design.md`

---

## Task 1: Database Migration — Soul Blueprints Table

**Files:**
- Create: `aicharttraderchris-backend/migrations/0003_soul_blueprints.sql`

**Step 1: Write the migration**

```sql
-- Soul Blueprints table
CREATE TABLE IF NOT EXISTS soul_blueprints (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    birth_date TEXT NOT NULL,
    birth_time TEXT NOT NULL,
    birth_city TEXT NOT NULL,
    birth_country TEXT NOT NULL,
    birth_lat REAL,
    birth_lon REAL,
    life_path INTEGER,
    sun_sign TEXT,
    moon_sign TEXT,
    rising_sign TEXT,
    chinese_animal TEXT,
    chinese_element TEXT,
    chinese_allies TEXT,
    chinese_enemies TEXT,
    planetary_ruler TEXT,
    alignment_numbers TEXT,
    name_gematria TEXT,
    nakshatra TEXT,
    human_design_type TEXT,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_soul_blueprints_user ON soul_blueprints(user_id);

-- Add flag to users table
ALTER TABLE users ADD COLUMN has_soul_blueprint INTEGER DEFAULT 0;
```

**Step 2: Apply migration locally**

Run: `cd /Users/ivanjackson/Desktop/aicharttraderchris-backend && npx wrangler d1 migrations apply aicharttraderchris-db --local`

**Step 3: Apply migration remotely**

Run: `npx wrangler d1 migrations apply aicharttraderchris-db --remote`

**Step 4: Commit**

```bash
git add migrations/0003_soul_blueprints.sql
git commit -m "feat: add soul_blueprints table migration"
```

---

## Task 2: Backend — Numerology Module

**Files:**
- Create: `aicharttraderchris-backend/src/numerology.ts`

**Step 1: Implement the numerology module**

This module handles:
- Life Path number calculation (reduce birth date digits to single digit, preserving master numbers 11, 22, 33)
- Personal Year/Month/Day number calculations
- Universal Day number
- Name reduction (Pythagorean/Ordinal/Reverse)
- Gematria encoding (English Ordinal, Reduction, Reverse Ordinal, Reverse Reduction)
- Alignment number detection (checks if number is 1, 4, or 8)

```typescript
// Key exports:
export interface NumerologyProfile {
  lifePath: number;
  personalYear: number;
  personalMonth: number;
  personalDay: number;
  universalDay: number;
  isAlignmentDay: boolean;
  alignmentNumbers: number[];
}

export interface GematriaResult {
  ordinal: number;
  reduction: number;
  reverseOrdinal: number;
  reverseReduction: number;
}

export function calculateLifePath(birthDate: string): number
export function calculatePersonalYear(birthMonth: number, birthDay: number, currentYear: number): number
export function calculatePersonalMonth(personalYear: number, currentMonth: number): number
export function calculatePersonalDay(personalMonth: number, currentDay: number): number
export function calculateUniversalDay(date: Date): number
export function calculateGematria(name: string): GematriaResult
export function reduceToSingleDigit(num: number, preserveMaster?: boolean): number
export function getNumerologyProfile(birthDate: string, currentDate: Date): NumerologyProfile
export function isAlignmentNumber(num: number): boolean
```

Implementation details:
- `reduceToSingleDigit`: Sum digits repeatedly until single digit. If `preserveMaster` is true, stop at 11, 22, or 33.
- `calculateLifePath`: Reduce month, day, year separately, then sum and reduce (preserving master numbers).
- `calculateGematria`: A=1..Z=26 for Ordinal. Reduce each letter value to 1-9 for Reduction. A=26..Z=1 for Reverse. Reduce reverse values for Reverse Reduction.
- Alignment numbers: Life Path + always include 1, 4, 8 as prosperity codes.

**Step 2: Commit**

```bash
git add src/numerology.ts
git commit -m "feat: add numerology calculation module"
```

---

## Task 3: Backend — Chinese Zodiac Module

**Files:**
- Create: `aicharttraderchris-backend/src/chineseZodiac.ts`

**Step 1: Implement the Chinese Zodiac module**

This module handles:
- Animal determination from birth year (12-year cycle starting from known reference)
- Element determination (10-year cycle: Wood, Fire, Earth, Metal, Water — each element spans 2 consecutive years)
- Ally/enemy/clash detection
- Shi Chen (double-hour) animal mapping
- Current hour animal identification
- Compatibility scoring between user's animal and current time animal

```typescript
export type ChineseAnimal = 'Rat' | 'Ox' | 'Tiger' | 'Rabbit' | 'Dragon' | 'Snake' | 'Horse' | 'Goat' | 'Monkey' | 'Rooster' | 'Dog' | 'Pig';
export type ChineseElement = 'Wood' | 'Fire' | 'Earth' | 'Metal' | 'Water';

export interface ChineseZodiacProfile {
  animal: ChineseAnimal;
  element: ChineseElement;
  allies: ChineseAnimal[];
  enemies: ChineseAnimal[];
  clashAnimal: ChineseAnimal;
}

export interface ShiChenHour {
  animal: ChineseAnimal;
  startHour: number;
  endHour: number;
  direction: string;
}

// Ally groups (triangles of compatibility):
// Rat, Dragon, Monkey
// Ox, Snake, Rooster
// Tiger, Horse, Dog
// Rabbit, Goat, Pig

// Clash pairs (directly opposite):
// Rat ↔ Horse, Ox ↔ Goat, Tiger ↔ Monkey
// Rabbit ↔ Rooster, Dragon ↔ Dog, Snake ↔ Pig

export function getChineseZodiac(birthYear: number): ChineseZodiacProfile
export function getShiChenAnimal(hour: number): ShiChenHour
export function getAnimalCompatibility(userAnimal: ChineseAnimal, hourAnimal: ChineseAnimal): 'ally' | 'enemy' | 'clash' | 'neutral'
export function getCurrentShiChen(date: Date, timezoneOffset: number): ShiChenHour
```

**Step 2: Commit**

```bash
git add src/chineseZodiac.ts
git commit -m "feat: add Chinese zodiac calculation module"
```

---

## Task 4: Backend — Astrology Module

**Files:**
- Create: `aicharttraderchris-backend/src/astrology.ts`

**Step 1: Implement the astrology module**

This module handles:
- Sun sign from birth date (date ranges for each zodiac sign)
- Moon phase calculation (algorithmic from date — Conway's method or similar)
- Moon phase name and waxing/waning status
- Void of Course moon detection (simplified — pre-loaded schedule from KV, or approximate based on known patterns)
- Planetary day ruler from day of week
- Basic planetary aspect awareness (simplified)

```typescript
export type ZodiacSign = 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio' | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';
export type MoonPhaseName = 'New Moon' | 'Waxing Crescent' | 'First Quarter' | 'Waxing Gibbous' | 'Full Moon' | 'Waning Gibbous' | 'Last Quarter' | 'Waning Crescent';
export type Planet = 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn';

export interface MoonPhase {
  phase: MoonPhaseName;
  illumination: number;        // 0-1
  isWaxing: boolean;
  daysInCycle: number;         // 0-29.5
  isFavorableForEntry: boolean; // Waxing = true
}

export interface VOCStatus {
  isVoid: boolean;
  startTime?: Date;
  endTime?: Date;
}

export interface DayRuler {
  planet: Planet;
  energy: string;
  description: string;
}

export function getSunSign(birthMonth: number, birthDay: number): ZodiacSign
export function getMoonPhase(date: Date): MoonPhase
export function getDayRuler(date: Date): DayRuler
export function getPlanetaryRulerForSign(sign: ZodiacSign): Planet
export function getVOCStatus(date: Date, vocSchedule: any[]): VOCStatus
```

Note: Moon sign and Rising sign require ephemeris data. For MVP, we'll use a simplified approach:
- **Moon sign:** Approximate from moon's ~2.5 day transit per sign. Use known new moon positions as reference and advance ~13 degrees/day.
- **Rising sign:** Approximate from birth time + birth location. The rising sign changes every ~2 hours through the zodiac. Use the sun sign at sunrise and advance by birth hour offset.
- These can be refined later with a proper ephemeris library.

**Step 2: Commit**

```bash
git add src/astrology.ts
git commit -m "feat: add astrology calculation module"
```

---

## Task 5: Backend — Planetary Hours Module

**Files:**
- Create: `aicharttraderchris-backend/src/planetaryHours.ts`

**Step 1: Implement the planetary hours module**

This module handles:
- Sunrise/sunset calculation from lat/lon/date (simplified solar position algorithm)
- Chaldean sequence planetary hour progression
- Current planetary hour identification
- Ally/enemy detection between day ruler and hour ruler
- Inversion rule logic (when enemy hour is active, invert trading bias)

```typescript
export interface PlanetaryHour {
  planet: Planet;
  startTime: Date;
  endTime: Date;
  hourNumber: number;          // 1-24
  isDaytime: boolean;
  isAllyHour: boolean;         // Relative to user's planetary ruler
  isEnemyHour: boolean;        // Relative to user's planetary ruler
  isNeutralHour: boolean;
  portalWindow: { start: Date; end: Date }; // :30-:45 entry window
}

export interface PlanetaryHourMap {
  dayRuler: Planet;
  currentHour: PlanetaryHour;
  nextHours: PlanetaryHour[];  // Next 12-24 hours
  sunrise: Date;
  sunset: Date;
}

// Chaldean sequence: Saturn → Jupiter → Mars → Sun → Venus → Mercury → Moon → repeat
// Day ruler sets first hour at sunrise

// Friend-Enemy Matrix (Vedic):
// Sun friends: Moon, Mars, Jupiter | enemies: Venus, Saturn
// Moon friends: Sun, Mercury | enemies: none
// Mars friends: Sun, Moon, Jupiter | enemies: Venus, Mercury
// Mercury friends: Sun, Venus | enemies: Moon
// Jupiter friends: Sun, Moon, Mars | enemies: Mercury, Venus
// Venus friends: Mercury, Saturn | enemies: Sun, Moon
// Saturn friends: Mercury, Venus | enemies: Sun, Moon, Mars

export function calculateSunrise(lat: number, lon: number, date: Date): Date
export function calculateSunset(lat: number, lon: number, date: Date): Date
export function getChaldeanSequence(): Planet[]
export function getPlanetaryHours(lat: number, lon: number, date: Date, userPlanetaryRuler: Planet): PlanetaryHourMap
export function getCurrentPlanetaryHour(hours: PlanetaryHour[], now: Date): PlanetaryHour
export function isPlanetaryEnemy(planet1: Planet, planet2: Planet): boolean
export function isPlanetaryAlly(planet1: Planet, planet2: Planet): boolean
```

**Step 2: Commit**

```bash
git add src/planetaryHours.ts
git commit -m "feat: add planetary hours calculation module"
```

---

## Task 6: Backend — Hora Grid Module

**Files:**
- Create: `aicharttraderchris-backend/src/horaGrid.ts`

**Step 1: Implement the Hora Grid module**

This module assembles the 4-civilization cross-reference grid and classifies each hour as a node type.

```typescript
export type NodeType = 'ULTRA_ALIGNED' | 'HIGH_PRESSURE' | 'SOUL_WINDOW' | 'MIXED' | 'CONFLICT' | 'DISRUPTION' | 'U_NODE';

export interface HoraGridHour {
  startTime: Date;
  endTime: Date;
  vedic: { planet: Planet; isAlly: boolean; isEnemy: boolean };
  babylonian: { sequencePosition: number; planet: Planet };
  egyptian: { decanNumber: number; energy: 'structure' | 'disruption' | 'flow' };
  chinese: { animal: ChineseAnimal; compatibility: 'ally' | 'enemy' | 'clash' | 'neutral' };
  nodeType: NodeType;
  nodeScore: number;            // 0-100 confidence
  portalWindow: { start: Date; end: Date };
  tradingGuidance: string;      // Brief action text
}

export interface HoraGrid {
  date: string;
  timezone: string;
  hours: HoraGridHour[];
  currentHourIndex: number;
  bestWindows: HoraGridHour[];  // Top 3 trading windows today
  worstWindows: HoraGridHour[]; // Top 3 conflict windows today
}

// Node Classification Logic:
// ULTRA_ALIGNED: All 4 layers in harmony (Vedic ally + Babylonian flow + Egyptian structure + Chinese ally)
// HIGH_PRESSURE: 3 of 4 layers aligned
// SOUL_WINDOW: Vedic + Chinese both ally (personal alignment)
// MIXED: 2 of 4 aligned
// CONFLICT: Vedic enemy + Chinese enemy/clash
// DISRUPTION: Egyptian disruption + any enemy layer
// U_NODE: Multiple civilizations signal major shift simultaneously

export function buildHoraGrid(
  date: Date,
  timezone: string,
  lat: number,
  lon: number,
  userPlanetaryRuler: Planet,
  userChineseAnimal: ChineseAnimal
): HoraGrid

export function classifyNode(
  vedicAlly: boolean,
  vedicEnemy: boolean,
  egyptianEnergy: string,
  chineseCompat: string
): NodeType
```

**Step 2: Commit**

```bash
git add src/horaGrid.ts
git commit -m "feat: add cross-civilization hora grid module"
```

---

## Task 7: Backend — Environmental Energy Module

**Files:**
- Create: `aicharttraderchris-backend/src/environmentalEnergy.ts`

**Step 1: Implement the environmental energy module**

Fetches and interprets space weather data from NOAA public APIs.

```typescript
export interface EnvironmentalEnergy {
  kIndex: number;              // 0-9, geomagnetic activity
  kIndexLevel: 'calm' | 'moderate' | 'high';
  solarFlareActive: boolean;
  solarFlareClass: string | null;  // C, M, X class
  schumannResonance: 'normal' | 'elevated' | 'spike';
  overallStatus: 'green' | 'amber' | 'red';
  tradingImpact: string;       // Brief description
  lastUpdated: string;
}

// K-index interpretation:
// < 3 = calm (green), 3-5 = moderate (amber), 5+ = high (red)
// Solar flare M or X class = amber/red
// Schumann spike = amber

// NOAA APIs (free, no auth):
// K-index: https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json
// Solar flares: https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get/FLR (last 7 days)

export async function fetchEnvironmentalEnergy(kvStore: KVNamespace): Promise<EnvironmentalEnergy>
export async function refreshEnvironmentalData(kvStore: KVNamespace): Promise<void>
```

**Step 2: Commit**

```bash
git add src/environmentalEnergy.ts
git commit -m "feat: add environmental energy module (NOAA space weather)"
```

---

## Task 8: Backend — NEO Scoring Engine

**Files:**
- Create: `aicharttraderchris-backend/src/neoScoring.ts`

**Step 1: Implement the NEO 17-point scoring engine**

Pulls data from all other modules to compute an automated score.

```typescript
export type NEOClassification = 'ULTRA_GREEN' | 'GREEN' | 'YELLOW' | 'RED';

export interface NEOFactor {
  id: number;
  name: string;
  score: number;        // 0 or 1 (pass/fail for automated factors)
  automated: boolean;
  reasoning: string;
}

export interface NEOScore {
  total: number;             // 0-17
  classification: NEOClassification;
  factors: NEOFactor[];
  tradingRecommendation: string;
  timestamp: string;
}

// The 17 factors (automated where possible):
// 1. Numerology Alignment — auto (is today alignment day 1/4/8?)
// 2. Letterology/Ticker — semi-auto (default tickers pre-coded)
// 3. Western Astrology — auto (moon phase, waxing?, no VOC?)
// 4. Chinese Zodiac Harmony — auto (current year/day not clash?)
// 5. Gematria — semi-auto (pre-coded for common instruments)
// 6. Moon Phase & VOC — auto (not VOC, favorable phase?)
// 7. Environmental Energy — auto (K-index < 5, no major flare?)
// 8. Soul Code Sync — auto (personal day aligned with life path?)
// 9. Timing Overlay — auto (current hour ally or neutral?)
// 10. Seasonal Psychology — auto (month aligns with instrument season?)
// 11. News Sentiment — semi-auto (no red folder news in next hour — can check econ calendar API)
// 12. Lunar Hour Micro VOC — auto (moon not void this hour?)
// 13. Mandela Drift — default pass (cannot be automated)
// 14. Emotional Energy — default pass (self-reported, future enhancement)
// 15. Anomaly Index — default pass (future: cross-instrument erratic check)
// 16. Avatar Operating Code — auto (match user's human design type to suggested trade style)
// 17. Karmic Overlay — default pass (cannot be automated)

// Thresholds:
// 14-17 = ULTRA_GREEN
// 12-13 = GREEN
// 9-11 = YELLOW
// <= 8 = RED

export function calculateNEOScore(
  numerology: NumerologyProfile,
  moonPhase: MoonPhase,
  vocStatus: VOCStatus,
  planetaryHour: PlanetaryHour,
  chineseProfile: ChineseZodiacProfile,
  currentShiChen: ShiChenHour,
  environmental: EnvironmentalEnergy,
  currentDate: Date
): NEOScore
```

**Step 2: Commit**

```bash
git add src/neoScoring.ts
git commit -m "feat: add NEO 17-point scoring engine"
```

---

## Task 9: Backend — Soul Blueprint Computation & Storage

**Files:**
- Create: `aicharttraderchris-backend/src/soulBlueprint.ts`

**Step 1: Implement soul blueprint computation**

Orchestrates all modules to compute and store a user's full blueprint.

```typescript
export interface SoulBlueprintInput {
  fullName: string;
  birthDate: string;      // YYYY-MM-DD
  birthTime: string;      // HH:MM
  birthCity: string;
  birthCountry: string;
}

export interface SoulBlueprint {
  id: string;
  userId: string;
  input: SoulBlueprintInput;
  lifePath: number;
  sunSign: ZodiacSign;
  moonSign: ZodiacSign;        // Approximate
  risingSign: ZodiacSign;      // Approximate
  chineseAnimal: ChineseAnimal;
  chineseElement: ChineseElement;
  chineseAllies: ChineseAnimal[];
  chineseEnemies: ChineseAnimal[];
  planetaryRuler: Planet;
  alignmentNumbers: number[];
  nameGematria: GematriaResult;
  nakshatra: string;           // Approximate
  humanDesignType: string;     // Approximate
}

// Uses geocoding to get lat/lon from city/country (OpenStreetMap Nominatim API — free, no auth)

export async function computeSoulBlueprint(input: SoulBlueprintInput): Promise<Omit<SoulBlueprint, 'id' | 'userId'>>
export async function geocodeCity(city: string, country: string): Promise<{ lat: number; lon: number }>
export function saveSoulBlueprint(db: D1Database, userId: string, blueprint: SoulBlueprint): Promise<void>
export function getSoulBlueprint(db: D1Database, userId: string): Promise<SoulBlueprint | null>
```

**Step 2: Commit**

```bash
git add src/soulBlueprint.ts
git commit -m "feat: add soul blueprint computation and storage"
```

---

## Task 10: Backend — Cosmic Engine & API Endpoints

**Files:**
- Create: `aicharttraderchris-backend/src/cosmicEngine.ts`
- Modify: `aicharttraderchris-backend/src/index.ts` (add new routes)

**Step 1: Implement the cosmic engine orchestrator**

```typescript
export interface CosmicIntelligence {
  date: string;
  timezone: string;
  neoScore: NEOScore;
  moonPhase: MoonPhase;
  vocStatus: VOCStatus;
  planetaryHours: PlanetaryHourMap;
  horaGrid: HoraGrid;
  chineseHour: ShiChenHour;
  chineseCompatibility: string;
  environmentalEnergy: EnvironmentalEnergy;
  numerology: NumerologyProfile;
  dailyBriefing: string;       // AI-generated summary
  bestTradingWindows: Array<{ time: string; reason: string }>;
  enemyHourAlert: { active: boolean; message: string } | null;
}

export async function getCosmicIntelligence(
  blueprint: SoulBlueprint,
  timezone: string,
  env: Env
): Promise<CosmicIntelligence>
```

**Step 2: Add API routes to index.ts**

Add these routes after the existing institutional data routes:

```typescript
// POST /api/soul-blueprint — Create or update soul blueprint
app.post("/api/soul-blueprint", authMiddleware, async (c) => { ... });

// GET /api/soul-blueprint — Get user's blueprint
app.get("/api/soul-blueprint", authMiddleware, async (c) => { ... });

// GET /api/cosmic/daily — Full cosmic intelligence payload
app.get("/api/cosmic/daily", authMiddleware, async (c) => { ... });

// GET /api/cosmic/neo-score — Just NEO score
app.get("/api/cosmic/neo-score", authMiddleware, async (c) => { ... });

// GET /api/cosmic/hora-grid — Just Hora Grid
app.get("/api/cosmic/hora-grid", authMiddleware, async (c) => { ... });
```

**Step 3: Modify analyze endpoint for cosmic overlay**

In the existing `/api/analyze` route, check for `includeCosmic` flag and inject cosmic context into the GPT-4o system prompt when true.

**Step 4: Add environmental data to cron handler**

In the existing `handleScheduled` function, add calls to `refreshEnvironmentalData()` alongside the existing FRED/CBOE/COT fetches.

**Step 5: Commit**

```bash
git add src/cosmicEngine.ts src/index.ts
git commit -m "feat: add cosmic engine and API endpoints"
```

---

## Task 11: Backend — Deploy & Test

**Step 1: Deploy to Cloudflare**

Run: `cd /Users/ivanjackson/Desktop/aicharttraderchris-backend && npx wrangler deploy`

**Step 2: Test soul blueprint endpoint**

```bash
# Sign up test user
curl -X POST https://aicharttraderchris-backend.ivanleejackson.workers.dev/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'

# Create soul blueprint (use token from signup response)
curl -X POST https://aicharttraderchris-backend.ivanleejackson.workers.dev/api/soul-blueprint \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"fullName":"Christopher Cole","birthDate":"1983-09-15","birthTime":"14:30","birthCity":"Los Angeles","birthCountry":"US"}'

# Get cosmic daily
curl https://aicharttraderchris-backend.ivanleejackson.workers.dev/api/cosmic/daily?timezone=America/New_York \
  -H "Authorization: Bearer TOKEN"
```

**Step 3: Commit any fixes**

---

## Task 12: Frontend — Soul Blueprint API Client & Types

**Files:**
- Create: `aicharttraderchris/src/types/cosmic.ts`
- Create: `aicharttraderchris/src/lib/api/cosmic.ts`
- Create: `aicharttraderchris/src/lib/api/soulBlueprint.ts`

**Step 1: Define TypeScript types for all cosmic data structures**

Mirror the backend interfaces: `SoulBlueprint`, `CosmicIntelligence`, `NEOScore`, `HoraGrid`, `MoonPhase`, etc.

**Step 2: Create API client modules**

```typescript
// soulBlueprint.ts
export const soulBlueprintApi = {
  create: (data: SoulBlueprintInput) => apiClient.post('/soul-blueprint', data),
  get: () => apiClient.get('/soul-blueprint'),
}

// cosmic.ts
export const cosmicApi = {
  getDaily: (timezone: string) => apiClient.get(`/cosmic/daily?timezone=${timezone}`),
  getNeoScore: (timezone: string) => apiClient.get(`/cosmic/neo-score?timezone=${timezone}`),
  getHoraGrid: (timezone: string) => apiClient.get(`/cosmic/hora-grid?timezone=${timezone}`),
}
```

**Step 3: Commit**

```bash
git add src/types/cosmic.ts src/lib/api/cosmic.ts src/lib/api/soulBlueprint.ts
git commit -m "feat: add cosmic API client and TypeScript types"
```

---

## Task 13: Frontend — Onboarding Flow (Soul Blueprint Wizard)

**Files:**
- Create: `aicharttraderchris/src/pages/SoulBlueprint.tsx`
- Create: `aicharttraderchris/src/components/SoulBlueprint/BlueprintWizard.tsx`
- Create: `aicharttraderchris/src/components/SoulBlueprint/BlueprintSummary.tsx`
- Modify: `aicharttraderchris/src/App.tsx` (add route)
- Modify: `aicharttraderchris/src/contexts/AuthContext.tsx` (add hasSoulBlueprint check)

**Step 1: Create the 3-step wizard component**

- Step 1: Full name + birth date (date picker)
- Step 2: Birth time (time picker) + birth city/country (text input with autocomplete suggestion)
- Step 3: Loading animation → computed blueprint summary card

Design: Dark theme, glass morphism cards, animated transitions between steps. Use Framer Motion for step transitions.

**Step 2: Create the blueprint summary component**

Shows the computed results in a visually appealing card layout:
- Sun sign icon + label
- Moon sign + Rising sign
- Chinese Zodiac animal + element
- Life Path number
- Alignment numbers highlighted
- Planetary ruler

**Step 3: Add route and auth redirect logic**

- Add `/soul-blueprint` route in App.tsx (protected, no subscription required)
- In AuthContext, add `hasSoulBlueprint` to session state
- After signup or login, if `hasSoulBlueprint === false`, redirect to `/soul-blueprint`
- After blueprint completion, redirect to `/dashboard`

**Step 4: Commit**

```bash
git add src/pages/SoulBlueprint.tsx src/components/SoulBlueprint/ src/App.tsx src/contexts/AuthContext.tsx
git commit -m "feat: add soul blueprint onboarding wizard"
```

---

## Task 14: Frontend — Cosmic Timing Dashboard Tab

**Files:**
- Modify: `aicharttraderchris/src/pages/Dashboard.tsx` (add tab switcher)
- Create: `aicharttraderchris/src/components/CosmicDashboard/CosmicDashboard.tsx`
- Create: `aicharttraderchris/src/components/CosmicDashboard/NEOScoreGauge.tsx`
- Create: `aicharttraderchris/src/components/CosmicDashboard/MoonPhaseCard.tsx`
- Create: `aicharttraderchris/src/components/CosmicDashboard/PlanetaryHourCard.tsx`
- Create: `aicharttraderchris/src/components/CosmicDashboard/DailyNumerologyCard.tsx`
- Create: `aicharttraderchris/src/components/CosmicDashboard/HoraGridMap.tsx`
- Create: `aicharttraderchris/src/components/CosmicDashboard/ChineseZodiacSync.tsx`
- Create: `aicharttraderchris/src/components/CosmicDashboard/EnvironmentalEnergyCard.tsx`
- Create: `aicharttraderchris/src/components/CosmicDashboard/EnemyHourAlert.tsx`
- Create: `aicharttraderchris/src/components/CosmicDashboard/TradingWindows.tsx`
- Create: `aicharttraderchris/src/components/CosmicDashboard/DailyBriefing.tsx`

**Step 1: Add tab switcher to Dashboard.tsx**

Two tabs at top: "Market Intelligence" | "Cosmic Timing"
- Tab state managed with useState
- "Market Intelligence" renders existing `IntelligenceDashboard`
- "Cosmic Timing" renders new `CosmicDashboard`

**Step 2: Implement CosmicDashboard.tsx**

- Fetches data via `cosmicApi.getDaily(timezone)` using React Query
- `timezone` from `Intl.DateTimeFormat().resolvedOptions().timeZone`
- Refetch interval: 5 minutes
- Renders all sub-components in the 4-row layout from the design doc

**Step 3: Implement each widget component**

Each component receives its relevant slice of `CosmicIntelligence` as props:

- **NEOScoreGauge**: Circular gauge 0-17, colored by classification. Shows score number prominently. Lists the 17 factors in a collapsible section.
- **MoonPhaseCard**: Moon icon (use SVG/emoji), phase name, illumination %, VOC status badge, waxing/waning label.
- **PlanetaryHourCard**: Current planet name + icon, day ruler, countdown timer to next hour, ally/enemy badge.
- **DailyNumerologyCard**: Universal Day + Personal Day numbers, alignment indicator.
- **HoraGridMap**: Horizontal timeline, 12 hour blocks, color-coded by node type, current hour highlighted, portal windows marked, hover tooltip with 4-layer detail.
- **ChineseZodiacSync**: Current hour animal, user's animal, compatibility label.
- **EnvironmentalEnergyCard**: K-index number + traffic light, solar flare status, Schumann status.
- **EnemyHourAlert**: Prominent red banner when enemy hour active, with inversion guidance text.
- **TradingWindows**: List of top 3 recommended windows with time + reason.
- **DailyBriefing**: AI-generated text block, styled as a quote/card.

Design: Follow existing dashboard aesthetic — dark theme, glass morphism cards, subtle animations. Use the existing color palette from IntelligenceDashboard components.

**Step 4: Commit**

```bash
git add src/pages/Dashboard.tsx src/components/CosmicDashboard/
git commit -m "feat: add cosmic timing dashboard with all widgets"
```

---

## Task 15: Frontend — Analysis Page Cosmic Overlay Toggle

**Files:**
- Modify: `aicharttraderchris/src/pages/Analysis.tsx`
- Modify: `aicharttraderchris/src/lib/api/analyze.ts`

**Step 1: Add cosmic overlay toggle to Analysis.tsx**

- Add toggle next to existing "Trader / Mentor" mode toggle
- Label: "Cosmic Overlay" with ON/OFF states
- Store preference in localStorage (`cosmic-overlay-preference`)
- When ON, pass `includeCosmic: true` in the analysis request

**Step 2: Update analyze API client**

Add `includeCosmic?: boolean` to the request interface. Pass it through to the backend.

**Step 3: Commit**

```bash
git add src/pages/Analysis.tsx src/lib/api/analyze.ts
git commit -m "feat: add cosmic overlay toggle to analysis page"
```

---

## Task 16: Frontend — Landing Page Redesign

**Files:**
- Modify: `aicharttraderchris/src/pages/LandingPage.tsx`
- Modify: `aicharttraderchris/src/components/Hero/Hero.tsx`
- Modify: `aicharttraderchris/src/components/HowItWorks/HowItWorks.tsx`
- Modify: `aicharttraderchris/src/components/Features/Features.tsx`
- Modify: `aicharttraderchris/src/components/FAQ/FAQ.tsx`
- Modify: `aicharttraderchris/src/components/FinalCTA/FinalCTA.tsx`
- Modify: `aicharttraderchris/src/components/Header/Header.tsx`

**Step 1: Update Hero**

- New headline positioning AI + Cosmic fusion
- Updated stats: "17-Point Cosmic Score / 4 Ancient Civilizations / AI Vision Analysis"
- CTA button: "Create Your Soul Blueprint" → links to `/signup`
- Update visual elements — add cosmic/planetary motifs alongside chart imagery

**Step 2: Update How It Works**

4 steps:
1. Create Your Soul Blueprint
2. Check Today's Alignment
3. Upload Your Chart
4. Trade With Confidence

**Step 3: Update Features**

6 feature cards:
1. AI Chart Analysis
2. Live Cosmic Dashboard
3. Personalized Soul Blueprint
4. 17-Point NEO Scoring
5. Enemy Hour Alerts
6. Environmental Energy Awareness

**Step 4: Update FAQ**

Add cosmic-specific FAQs while keeping relevant existing ones.

**Step 5: Update Header**

- Product name badge update
- Ensure CTA links to signup flow

**Step 6: Update FinalCTA**

Updated copy reflecting cosmic + AI fusion messaging.

**Step 7: Commit**

```bash
git add src/pages/LandingPage.tsx src/components/Hero/ src/components/HowItWorks/ src/components/Features/ src/components/FAQ/ src/components/FinalCTA/ src/components/Header/
git commit -m "feat: redesign landing page for cosmic + AI fusion branding"
```

---

## Task 17: Frontend — Build, Deploy & Verify

**Step 1: Build frontend**

Run: `cd /Users/ivanjackson/Desktop/aicharttraderchris && npm run build`

Fix any TypeScript errors.

**Step 2: Deploy to Cloudflare Pages**

Run: `npx wrangler pages deploy dist --project-name aicharttraderchris`

**Step 3: End-to-end verification**

1. Visit https://aicharttraderchris.pages.dev
2. Verify landing page shows new branding
3. Sign up → verify redirect to soul blueprint wizard
4. Complete soul blueprint → verify redirect to dashboard
5. Switch to Cosmic Timing tab → verify widgets render with data
6. Go to Analysis → verify cosmic overlay toggle works
7. Test with toggle ON and OFF

**Step 4: Commit any fixes and redeploy if needed**

---

## Task 18: Push All Changes to GitHub

**Step 1: Push frontend**

```bash
cd /Users/ivanjackson/Desktop/aicharttraderchris
git push origin main
```

**Step 2: Push backend**

```bash
cd /Users/ivanjackson/Desktop/aicharttraderchris-backend
git push origin main
```
