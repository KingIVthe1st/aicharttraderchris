# Cosmic Timing Dashboard v2 — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 6 priority new sections (Macro Time Cycles, Intraday Time Cycles, Trading Calendar, Moon Phase Hero, Market Timing Guide, Planetary Command Center) to the Cosmic Timing tab, reorder all sections by priority, and elevate visual design to agency quality.

**Architecture:** Two small backend changes (add moonSign field + new weekly calendar endpoint), then 6 new frontend components + updated orchestrator. All new components derive data from the existing CosmicIntelligence payload where possible; only the calendar requires a new API call.

**Tech Stack:** React 18, TypeScript, Framer Motion v12, Tailwind CSS, pure SVG (no chart libs), Hono/Cloudflare Workers backend, D1 database

---

## BACKEND TASKS

### Task 1: Add moonSign to CosmicIntelligence

**Files:**
- Modify: `aicharttraderchris-backend/src/cosmicEngine.ts` (return statement)
- Modify: `aicharttraderchris/src/types/cosmic.ts` (CosmicIntelligence interface)

**Step 1: Add moonSign to cosmicEngine.ts**

Open `aicharttraderchris-backend/src/cosmicEngine.ts`. Find the import at the top for astrology functions and add `getApproximateMoonSign` to the import:

```typescript
// Find the existing import line that imports from './astrology' and add getApproximateMoonSign
// Example: if it says:
import { getMoonPhase, getVOCStatus, getDayRuler } from './astrology';
// Change to:
import { getMoonPhase, getVOCStatus, getDayRuler, getApproximateMoonSign } from './astrology';
```

Then find the return statement of `getCosmicIntelligence` (the large object at the end of the function) and add `moonSign`:

```typescript
return {
  date: now.toISOString().split('T')[0],
  timezone,
  neoScore,
  moonPhase,
  vocStatus,
  moonSign: getApproximateMoonSign(now),   // ADD THIS LINE
  planetaryHours: planetaryHourMap,
  horaGrid,
  chineseHour: shiChenHour,
  chineseCompatibility,
  environmentalEnergy: environmental,
  numerology,
  bestTradingWindows,
  enemyHourAlert,
};
```

**Step 2: Add moonSign to CosmicIntelligence type**

Open `aicharttraderchris/src/types/cosmic.ts`. Find the `CosmicIntelligence` interface and add `moonSign`:

```typescript
export interface CosmicIntelligence {
  date: string;
  timezone: string;
  neoScore: NEOScore;
  moonPhase: MoonPhase;
  vocStatus: VOCStatus;
  moonSign: string;  // ADD THIS LINE — e.g. "Taurus", "Aries"
  planetaryHours: PlanetaryHourMap;
  horaGrid: HoraGrid;
  chineseHour: ShiChenHour;
  chineseCompatibility: string;
  environmentalEnergy: EnvironmentalEnergy;
  numerology: NumerologyProfile;
  bestTradingWindows: Array<{ time: string; reason: string; nodeType: string }>;
  enemyHourAlert: { active: boolean; message: string } | null;
}
```

**Step 3: Verify build**
```bash
cd /Users/ivanjackson/Desktop/aicharttraderchris-backend && npx tsc --noEmit
```
Expected: no errors.

**Step 4: Commit backend change**
```bash
cd /Users/ivanjackson/Desktop/aicharttraderchris-backend
git add src/cosmicEngine.ts
git commit -m "feat: expose moonSign in CosmicIntelligence daily response"
```

---

### Task 2: Add /api/cosmic/weekly endpoint

**Files:**
- Modify: `aicharttraderchris-backend/src/index.ts` (add endpoint after /api/cosmic/hora-grid)

**Step 1: Add the endpoint**

In `index.ts`, find the `/api/cosmic/hora-grid` endpoint and add this NEW endpoint right after it:

```typescript
// Weekly calendar endpoint — returns N days of lightweight day summaries
app.get('/api/cosmic/weekly', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const timezone = c.req.query('timezone') || 'America/New_York';
    const days = Math.min(parseInt(c.req.query('days') || '35', 10), 60);

    // Get user's soul blueprint for personalization
    const blueprintRow = await c.env.DB.prepare(
      'SELECT * FROM soul_blueprints WHERE user_id = ? ORDER BY created_at DESC LIMIT 1'
    ).bind(user.id).first() as Record<string, unknown> | null;

    if (!blueprintRow) {
      return c.json({ error: 'Soul Blueprint required' }, 400);
    }

    const { getMoonPhase, getApproximateMoonSign, getDayRuler } = await import('./astrology');

    const calendar: Array<{
      date: string;
      dayRuler: string;
      moonPhaseName: string;
      moonIllumination: number;
      moonSign: string;
      nodeType: string;
      score: number;
    }> = [];

    const now = new Date();

    for (let i = 0; i < days; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      d.setHours(12, 0, 0, 0); // Use noon for daily calculation

      const moonPhase = getMoonPhase(d);
      const moonSign = getApproximateMoonSign(d);
      const dayRuler = getDayRuler(d);

      // Simple node type from moon phase + day ruler
      const illum = moonPhase.illumination ?? (moonPhase as Record<string, number>).illumination ?? 0;
      const isFullMoon = illum > 0.95;
      const isNewMoon = illum < 0.05;
      const score = Math.round(50 + illum * 30 + (isFullMoon ? -15 : isNewMoon ? -10 : 10));
      const nodeType = score >= 75 ? 'ULTRA_ALIGNED' : score >= 60 ? 'HIGH_PRESSURE' : score >= 45 ? 'MIXED' : 'CONFLICT';

      calendar.push({
        date: d.toISOString().split('T')[0],
        dayRuler: typeof dayRuler === 'string' ? dayRuler : String(dayRuler),
        moonPhaseName: (moonPhase.name ?? (moonPhase as Record<string, string>).phase ?? 'Unknown') as string,
        moonIllumination: typeof illum === 'number' ? illum : 0,
        moonSign: String(moonSign),
        nodeType,
        score,
      });
    }

    return c.json({ calendar });
  } catch (err) {
    console.error('[Weekly Calendar] Error:', err);
    return c.json({ error: 'Failed to generate weekly calendar' }, 500);
  }
});
```

**Step 2: Verify build**
```bash
cd /Users/ivanjackson/Desktop/aicharttraderchris-backend && npx tsc --noEmit
```

**Step 3: Commit**
```bash
git add src/index.ts
git commit -m "feat: add /api/cosmic/weekly calendar endpoint"
```

---

### Task 3: Deploy backend + update frontend API client

**Step 1: Deploy backend**
```bash
cd /Users/ivanjackson/Desktop/aicharttraderchris-backend
npx wrangler deploy 2>&1 | tail -10
```
Expected: "Deployed aicharttraderchris-backend"

**Step 2: Add WeeklyCalendarDay type to frontend types**

In `aicharttraderchris/src/types/cosmic.ts`, add at the end of the file:

```typescript
export interface WeeklyCalendarDay {
  date: string;           // "2026-03-04"
  dayRuler: string;       // "Moon", "Mars", etc.
  moonPhaseName: string;  // "Waxing Gibbous"
  moonIllumination: number; // 0-1
  moonSign: string;       // "Taurus"
  nodeType: string;       // "ULTRA_ALIGNED", "MIXED", etc.
  score: number;          // 0-100
}
```

**Step 3: Add getWeeklyCalendar to API client**

In `aicharttraderchris/src/lib/api/cosmic.ts`, add method to the cosmicApi object:

```typescript
async getWeeklyCalendar(days = 35, timezone = 'America/New_York'): Promise<WeeklyCalendarDay[]> {
  try {
    const response = await apiClient.get(`/cosmic/weekly?days=${days}&timezone=${encodeURIComponent(timezone)}`);
    return response.data.calendar ?? [];
  } catch {
    return [];
  }
},
```

Also add `WeeklyCalendarDay` to the import from `@/types/cosmic` at the top of api/cosmic.ts.

**Step 4: Commit frontend type + API changes**
```bash
cd /Users/ivanjackson/Desktop/aicharttraderchris
git add src/types/cosmic.ts src/lib/api/cosmic.ts
git commit -m "feat: add WeeklyCalendarDay type and getWeeklyCalendar API method"
```

---

## IMAGE GENERATION

### Task 4: Generate 3 AI cosmic background images

Run each curl command from the backend directory. These take ~30 seconds each. Decode each to PNG.

```bash
cd /Users/ivanjackson/Desktop/aicharttraderchris/public/images/ai-generated

# Image 1: Macro Time Cycles background
curl -s https://api.openai.com/v1/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-image-1",
    "prompt": "Deep space orrery with concentric planetary rings, lunar cycle arc track showing moon phases, Mercury retrograde orbital loop glowing amber, outer planet tracks in gold and deep navy, sacred geometry overlay, dark cosmic background, cinematic wide format",
    "size": "1536x1024",
    "quality": "standard",
    "n": 1
  }' | python3 -c "
import sys, json, base64
d = json.load(sys.stdin)
data = d['data'][0].get('b64_json') or d['data'][0].get('url', '')
if data.startswith('http'):
    import urllib.request
    urllib.request.urlretrieve(data, 'cosmic-macro-cycles-bg.png')
else:
    open('cosmic-macro-cycles-bg.png', 'wb').write(base64.b64decode(data))
print('cosmic-macro-cycles-bg.png saved')
"

# Image 2: Trading Calendar background
curl -s https://api.openai.com/v1/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-image-1",
    "prompt": "Holographic cosmic calendar grid floating in deep space, moon phase symbols at corners, constellation grid overlay, color-coded days glowing green and red, dark navy background, nebula clouds, premium financial terminal aesthetic",
    "size": "1536x1024",
    "quality": "standard",
    "n": 1
  }' | python3 -c "
import sys, json, base64
d = json.load(sys.stdin)
data = d['data'][0].get('b64_json') or d['data'][0].get('url', '')
if data.startswith('http'):
    import urllib.request
    urllib.request.urlretrieve(data, 'cosmic-trading-calendar-bg.png')
else:
    open('cosmic-trading-calendar-bg.png', 'wb').write(base64.b64decode(data))
print('cosmic-trading-calendar-bg.png saved')
"

# Image 3: Planetary Day Ruler / Command Center background
curl -s https://api.openai.com/v1/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-image-1",
    "prompt": "Ancient cosmic clock face with seven planetary sigils arranged in a circle, radial glow beams from center, dark obsidian glass background, gold and cyan energy lines, celestial mechanism with gears, premium observatory instrument aesthetic",
    "size": "1536x1024",
    "quality": "standard",
    "n": 1
  }' | python3 -c "
import sys, json, base64
d = json.load(sys.stdin)
data = d['data'][0].get('b64_json') or d['data'][0].get('url', '')
if data.startswith('http'):
    import urllib.request
    urllib.request.urlretrieve(data, 'cosmic-day-ruler-bg.png')
else:
    open('cosmic-day-ruler-bg.png', 'wb').write(base64.b64decode(data))
print('cosmic-day-ruler-bg.png saved')
"
```

**Verify:** `ls -lh cosmic-macro-cycles-bg.png cosmic-trading-calendar-bg.png cosmic-day-ruler-bg.png`
Expected: 3 PNG files each 1-3MB.

**Commit:**
```bash
cd /Users/ivanjackson/Desktop/aicharttraderchris
git add public/images/ai-generated/cosmic-macro-cycles-bg.png public/images/ai-generated/cosmic-trading-calendar-bg.png public/images/ai-generated/cosmic-day-ruler-bg.png
git commit -m "assets: add 3 AI-generated cosmic background images for v2 sections"
```

---

## FRONTEND COMPONENTS

### Task 5: Create MacroTimeCycles.tsx

**File:** Create `aicharttraderchris/src/components/CosmicDashboard/MacroTimeCycles.tsx`

```tsx
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { MoonPhase } from '@/types/cosmic';

interface Props {
  moonPhase: MoonPhase;
  className?: string;
}

// ─── Mercury Retrograde Lookup Table 2024–2027 ───────────────────────────────
const MERCURY_RETROGRADES = [
  { pre: '2024-03-18', retro: '2024-04-01', post: '2024-04-25', end: '2024-05-13' },
  { pre: '2024-07-17', retro: '2024-08-05', post: '2024-08-28', end: '2024-09-11' },
  { pre: '2024-11-07', retro: '2024-11-26', post: '2024-12-15', end: '2025-01-02' },
  { pre: '2025-02-28', retro: '2025-03-15', post: '2025-04-07', end: '2025-04-26' },
  { pre: '2025-07-01', retro: '2025-07-18', post: '2025-08-11', end: '2025-08-24' },
  { pre: '2025-10-21', retro: '2025-11-09', post: '2025-11-29', end: '2025-12-15' },
  { pre: '2026-02-07', retro: '2026-02-25', post: '2026-03-20', end: '2026-04-07' },
  { pre: '2026-06-12', retro: '2026-06-29', post: '2026-07-23', end: '2026-08-04' },
  { pre: '2026-10-06', retro: '2026-10-24', post: '2026-11-13', end: '2026-11-28' },
  { pre: '2027-01-23', retro: '2027-02-09', post: '2027-03-03', end: '2027-03-18' },
  { pre: '2027-06-01', retro: '2027-06-10', post: '2027-07-04', end: '2027-07-15' },
  { pre: '2027-09-21', retro: '2027-10-08', post: '2027-10-28', end: '2027-11-11' },
];

const PLANET_GLYPHS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿', Jupiter: '♃', Venus: '♀', Saturn: '♄',
};
// Day index: 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
const DAY_RULERS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
const DAY_NAMES_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const DAY_COLORS: Record<string, string> = {
  Sun: '#F6C453', Moon: '#5DD8FF', Mars: '#EF4444',
  Mercury: '#A78BFA', Jupiter: '#FB923C', Venus: '#34D399', Saturn: '#94A3B8',
};

function getMercuryStatus(now: Date) {
  const d = now.getTime();
  for (const r of MERCURY_RETROGRADES) {
    const pre = new Date(r.pre).getTime();
    const retro = new Date(r.retro).getTime();
    const post = new Date(r.post).getTime();
    const end = new Date(r.end).getTime();
    if (d >= pre && d < retro) return { status: 'pre-shadow' as const, daysToNext: Math.ceil((retro - d) / 86400000), nextPhase: 'Retrograde' };
    if (d >= retro && d < post) return { status: 'retrograde' as const, daysToNext: Math.ceil((post - d) / 86400000), nextPhase: 'Direct' };
    if (d >= post && d < end) return { status: 'post-shadow' as const, daysToNext: Math.ceil((end - d) / 86400000), nextPhase: 'Clear' };
  }
  const next = MERCURY_RETROGRADES.find(r => new Date(r.pre).getTime() > d);
  return { status: 'direct' as const, daysToNext: next ? Math.ceil((new Date(next.pre).getTime() - d) / 86400000) : 999, nextPhase: 'Pre-Shadow' };
}

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const s = polarToXY(cx, cy, r, startDeg);
  const e = polarToXY(cx, cy, r, endDeg);
  const large = (endDeg - startDeg) % 360 > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

const MERCURY_STATUS_STYLES = {
  direct: { color: '#94A3B8', label: 'DIRECT', bg: 'bg-slate-500/20 border-slate-500/40 text-slate-300' },
  'pre-shadow': { color: '#F59E0B', label: 'PRE-SHADOW', bg: 'bg-amber-500/20 border-amber-500/40 text-amber-300' },
  retrograde: { color: '#EF4444', label: 'RETROGRADE', bg: 'bg-red-500/20 border-red-500/40 text-red-300' },
  'post-shadow': { color: '#F59E0B', label: 'POST-SHADOW', bg: 'bg-amber-500/20 border-amber-500/40 text-amber-300' },
};

const PHASE_MILESTONES = [
  { day: 0, label: '🌑', angle: -135 },
  { day: 7.4, label: '🌓', angle: -45 },
  { day: 14.75, label: '🌕', angle: 45 },
  { day: 22.1, label: '🌗', angle: 135 },
];

export default function MacroTimeCycles({ moonPhase, className = '' }: Props) {
  const now = useMemo(() => new Date(), []);
  const mercury = useMemo(() => getMercuryStatus(now), [now]);
  const todayDow = now.getDay();

  // Lunar arc math (270-degree arc, starts at 225°, ends at 135°)
  const ARC_START = 225;
  const ARC_SPAN = 270;
  const CYCLE = 29.5;
  const days = moonPhase.daysIntoCycle ?? 0;
  const progressDeg = (days / CYCLE) * ARC_SPAN;
  const currentAngle = ARC_START + progressDeg;
  const dotPos = polarToXY(80, 80, 55, currentAngle);

  // Lunar arc gradient color based on phase
  const arcColor = days < 7.4 ? '#6D5BFF' : days < 14.75 ? '#8B7AFF' : days < 22.1 ? '#F6C453' : '#4B5563';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`rounded-2xl border border-indigo-500/20 overflow-hidden ${className}`}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage: 'url(/images/ai-generated/cosmic-macro-cycles-bg.png)' }} />
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/95 via-cosmic-900/95 to-purple-950/95" />

      <div className="relative z-10 p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🌌</span>
          <h3 className="text-white font-bold text-sm uppercase tracking-widest">Macro Time Cycles</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* A: Lunar Month Orrery Arc */}
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/40 p-4 flex flex-col items-center">
            <p className="text-indigo-300 text-[10px] uppercase tracking-widest mb-3 font-bold">Lunar Month</p>
            <svg viewBox="0 0 160 160" className="w-40 h-40">
              {/* Track arc */}
              <path
                d={arcPath(80, 80, 55, ARC_START, ARC_START + ARC_SPAN)}
                fill="none" stroke="#1e1b4b" strokeWidth="8" strokeLinecap="round"
              />
              {/* Progress arc */}
              <motion.path
                d={arcPath(80, 80, 55, ARC_START, currentAngle)}
                fill="none" stroke={arcColor} strokeWidth="8" strokeLinecap="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
              {/* Milestone dots */}
              {PHASE_MILESTONES.map(m => {
                const mAngle = ARC_START + (m.day / CYCLE) * ARC_SPAN;
                const mPos = polarToXY(80, 80, 55, mAngle);
                return (
                  <g key={m.day}>
                    <circle cx={mPos.x} cy={mPos.y} r="3" fill="#374151" />
                    <text x={polarToXY(80, 80, 68, mAngle).x} y={polarToXY(80, 80, 68, mAngle).y}
                      textAnchor="middle" dominantBaseline="middle" fontSize="10">{m.label}</text>
                  </g>
                );
              })}
              {/* Current position dot */}
              <motion.circle
                cx={dotPos.x} cy={dotPos.y} r="6"
                fill={arcColor}
                animate={{ r: [5, 7, 5], opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              {/* Glow filter */}
              <defs>
                <filter id="arcGlow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              </defs>
              {/* Center text */}
              <text x="80" y="76" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontFamily="monospace">{Math.round(days)}</text>
              <text x="80" y="92" textAnchor="middle" fill="#6B7280" fontSize="9">of 29 days</text>
            </svg>
            <p className="text-white font-bold text-xs mt-1">{moonPhase.name}</p>
            <p className="text-gray-400 text-[10px] mt-0.5">{moonPhase.isWaxing ? '↑ Waxing' : '↓ Waning'}</p>
          </div>

          {/* B: Mercury Cycle Radar */}
          <div className="rounded-xl border border-slate-500/20 bg-slate-950/40 p-4 flex flex-col items-center">
            <p className="text-slate-300 text-[10px] uppercase tracking-widest mb-3 font-bold">Mercury Cycle</p>
            <svg viewBox="0 0 160 100" className="w-44 h-28">
              {/* Orbital ellipse */}
              <ellipse cx="80" cy="55" rx="60" ry="30" fill="none" stroke="#1e293b" strokeWidth="2" />
              {/* Status-colored orbital fill arc */}
              <ellipse cx="80" cy="55" rx="60" ry="30" fill="none"
                stroke={MERCURY_STATUS_STYLES[mercury.status].color}
                strokeWidth={mercury.status === 'retrograde' ? 3 : 1.5}
                strokeDasharray={mercury.status === 'retrograde' ? '6 3' : 'none'}
                opacity="0.7"
              />
              {/* Mercury glyph at top of orbit */}
              <text x="80" y="22" textAnchor="middle" fontSize="18" fill={MERCURY_STATUS_STYLES[mercury.status].color}>☿</text>
              {/* Sun at center */}
              <text x="80" y="59" textAnchor="middle" fontSize="14" fill="#F6C453">☉</text>
            </svg>
            {/* Status badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase mt-1 ${MERCURY_STATUS_STYLES[mercury.status].bg}`}>
              {mercury.status === 'retrograde' && (
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block"
                  animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }}
                />
              )}
              ☿ {MERCURY_STATUS_STYLES[mercury.status].label}
            </div>
            <p className="text-gray-400 text-[10px] mt-2">
              <span className="text-white font-mono font-bold">{mercury.daysToNext}d</span> until {mercury.nextPhase}
            </p>
          </div>

          {/* C: Weekly Planetary Rhythm */}
          <div className="rounded-xl border border-purple-500/20 bg-purple-950/40 p-4">
            <p className="text-purple-300 text-[10px] uppercase tracking-widest mb-3 font-bold text-center">Weekly Rhythm</p>
            <div className="grid grid-cols-7 gap-1">
              {DAY_NAMES_SHORT.map((day, i) => {
                const ruler = DAY_RULERS[i];
                const isToday = i === todayDow;
                const color = DAY_COLORS[ruler];
                return (
                  <motion.div
                    key={day}
                    className={`flex flex-col items-center p-1.5 rounded-lg border transition-all ${
                      isToday
                        ? 'border-solar-400/60 bg-solar-500/20'
                        : 'border-white/5 bg-white/5'
                    }`}
                    animate={isToday ? { boxShadow: ['0 0 8px #F6C45340', '0 0 16px #F6C45380', '0 0 8px #F6C45340'] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="text-[14px]" style={{ color }}>{PLANET_GLYPHS[ruler]}</span>
                    <span className={`text-[8px] font-bold mt-0.5 ${isToday ? 'text-solar-300' : 'text-gray-500'}`}>{day}</span>
                  </motion.div>
                );
              })}
            </div>
            <div className="mt-3 text-center">
              <p className="text-gray-400 text-[10px]">Today</p>
              <p className="text-white font-bold text-sm" style={{ color: DAY_COLORS[DAY_RULERS[todayDow]] }}>
                {PLANET_GLYPHS[DAY_RULERS[todayDow]]} {DAY_RULERS[todayDow]} Day
              </p>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
```

**Verify:**
```bash
cd /Users/ivanjackson/Desktop/aicharttraderchris && npm run build 2>&1 | grep -E "error|warning" | head -20
```

**Commit:**
```bash
git add src/components/CosmicDashboard/MacroTimeCycles.tsx
git commit -m "feat: add MacroTimeCycles component — lunar arc, Mercury radar, weekly rhythm"
```

---

### Task 6: Create IntradayTimeCycles.tsx

**File:** Create `aicharttraderchris/src/components/CosmicDashboard/IntradayTimeCycles.tsx`

```tsx
import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { HoraGrid, PlanetaryHourMap } from '@/types/cosmic';

interface Props {
  horaGrid: HoraGrid;
  planetaryHours: PlanetaryHourMap;
  bestTradingWindows: Array<{ time: string; reason: string; nodeType: string }>;
}

const NODE_COLORS: Record<string, string> = {
  ULTRA_ALIGNED: '#F6C453',
  HIGH_PRESSURE: '#22C55E',
  SOUL_WINDOW: '#3B82F6',
  MIXED: '#EAB308',
  CONFLICT: '#EF4444',
  DISRUPTION: '#A855F7',
  U_NODE: '#374151',
};

const NODE_BG: Record<string, string> = {
  ULTRA_ALIGNED: 'rgba(246,196,83,0.18)',
  HIGH_PRESSURE: 'rgba(34,197,94,0.15)',
  SOUL_WINDOW: 'rgba(59,130,246,0.15)',
  MIXED: 'rgba(234,179,8,0.12)',
  CONFLICT: 'rgba(239,68,68,0.12)',
  DISRUPTION: 'rgba(168,85,247,0.12)',
  U_NODE: 'rgba(55,65,81,0.12)',
};

const PLANET_GLYPHS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿', Jupiter: '♃', Venus: '♀', Saturn: '♄',
};

function timeToMinutes(isoString: string): number {
  const d = new Date(isoString);
  return d.getHours() * 60 + d.getMinutes();
}

export default function IntradayTimeCycles({ horaGrid, planetaryHours, bestTradingWindows }: Props) {
  const [nowMinutes, setNowMinutes] = useState(() => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  });

  useEffect(() => {
    const id = setInterval(() => {
      const n = new Date();
      setNowMinutes(n.getHours() * 60 + n.getMinutes());
    }, 30000);
    return () => clearInterval(id);
  }, []);

  // Market hours: 9:30 AM to 4:00 PM = 570 to 960 minutes
  const MARKET_START = 9 * 60 + 30;
  const MARKET_END = 16 * 60;
  const MARKET_DURATION = MARKET_END - MARKET_START;

  const pct = (minutes: number) => Math.max(0, Math.min(100, ((minutes - MARKET_START) / MARKET_DURATION) * 100));
  const nowPct = pct(nowMinutes);
  const isMarketOpen = nowMinutes >= MARKET_START && nowMinutes < MARKET_END;

  // Filter hora hours overlapping market session
  const marketHours = useMemo(() =>
    (horaGrid.hours || []).filter(h => {
      const start = timeToMinutes(h.startTime);
      const end = timeToMinutes(h.endTime);
      return end > MARKET_START && start < MARKET_END;
    }),
    [horaGrid.hours]
  );

  // Best windows remaining
  const remainingWindows = useMemo(() =>
    bestTradingWindows
      .filter(w => {
        const wMin = timeToMinutes(w.time);
        return wMin > nowMinutes && wMin < MARKET_END;
      })
      .slice(0, 3),
    [bestTradingWindows, nowMinutes]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/80 via-cosmic-900/90 to-indigo-950/80 overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest">Intraday Power Windows</h3>
          </div>
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border ${
            isMarketOpen
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-gray-500/20 border-gray-500/40 text-gray-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isMarketOpen ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
            {isMarketOpen ? 'MARKET OPEN' : 'AFTER HOURS'}
          </div>
        </div>

        {/* Time axis labels */}
        <div className="flex justify-between text-[9px] text-gray-500 font-mono mb-1 px-1">
          {['9:30', '10:30', '11:30', '12:30', '1:30', '2:30', '3:30', '4:00'].map(t => (
            <span key={t}>{t}</span>
          ))}
        </div>

        {/* Main timeline bar */}
        <div className="relative h-16 rounded-xl overflow-hidden bg-cosmic-950/60 border border-white/5">
          {/* Hora segments */}
          {marketHours.map((h, i) => {
            const startMin = Math.max(timeToMinutes(h.startTime), MARKET_START);
            const endMin = Math.min(timeToMinutes(h.endTime), MARKET_END);
            const left = pct(startMin);
            const width = pct(endMin) - left;
            const color = NODE_BG[h.nodeType];
            const borderColor = NODE_COLORS[h.nodeType];
            const vedic = h.vedic?.planet || '';

            return (
              <div
                key={i}
                className="absolute top-0 bottom-0 group cursor-default transition-all"
                style={{ left: `${left}%`, width: `${width}%`, background: color, borderRight: `1px solid ${borderColor}30` }}
                title={h.tradingGuidance}
              >
                {/* Planet glyph */}
                {width > 5 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[11px] opacity-60" style={{ color: borderColor }}>
                      {PLANET_GLYPHS[vedic] || vedic.slice(0, 2)}
                    </span>
                  </div>
                )}
                {/* ULTRA_ALIGNED shimmer overlay */}
                {h.nodeType === 'ULTRA_ALIGNED' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-solar-400/20 to-transparent animate-shimmer" />
                )}
                {/* Bottom color strip */}
                <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b" style={{ background: borderColor }} />
              </div>
            );
          })}

          {/* Best windows gold overlay */}
          {bestTradingWindows.map((w, i) => {
            const wMin = timeToMinutes(w.time);
            if (wMin < MARKET_START || wMin > MARKET_END) return null;
            const left = pct(wMin);
            return (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-6 -translate-x-3 pointer-events-none"
                style={{ left: `${left}%` }}
              >
                <div className="absolute inset-0 bg-solar-400/30 rounded" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[8px] text-solar-300 font-bold">⭐</div>
              </div>
            );
          })}

          {/* Current time cursor */}
          {isMarketOpen && (
            <motion.div
              className="absolute top-0 bottom-0 w-0.5 bg-white z-10"
              style={{ left: `${nowPct}%` }}
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="absolute -top-1 -translate-x-1/2 w-2 h-2 rounded-full bg-white" />
              <div className="absolute -bottom-1 -translate-x-1/2 text-[8px] text-white font-mono whitespace-nowrap">
                NOW
              </div>
            </motion.div>
          )}
        </div>

        {/* Planetary transition ticks below bar */}
        <div className="relative h-5 mt-1">
          {planetaryHours.nextHours.slice(0, 8).map((ph, i) => {
            const startMin = timeToMinutes(ph.startTime);
            if (startMin < MARKET_START || startMin > MARKET_END) return null;
            const left = pct(startMin);
            const glyph = PLANET_GLYPHS[ph.planet] || ph.planet.slice(0, 2);
            const color = ph.isAllyHour ? '#5DD8FF' : ph.isEnemyHour ? '#EF4444' : '#6B7280';
            return (
              <div key={i} className="absolute flex flex-col items-center" style={{ left: `${left}%`, transform: 'translateX(-50%)' }}>
                <div className="w-px h-2 bg-white/20" />
                <span className="text-[9px]" style={{ color }}>{glyph}</span>
              </div>
            );
          })}
        </div>

        {/* Node type legend */}
        <div className="flex flex-wrap gap-2 mt-3">
          {Object.entries(NODE_COLORS).filter(([k]) => k !== 'U_NODE').map(([type, color]) => (
            <div key={type} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-sm" style={{ background: color }} />
              <span className="text-[9px] text-gray-400">{type.replace('_', ' ')}</span>
            </div>
          ))}
        </div>

        {/* Best remaining windows */}
        {remainingWindows.length > 0 && (
          <div className="mt-3 border-t border-white/10 pt-3">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Best Windows Remaining</p>
            <div className="flex gap-2 flex-wrap">
              {remainingWindows.map((w, i) => {
                const t = new Date(w.time);
                const timeStr = t.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                return (
                  <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-solar-500/15 border border-solar-400/30">
                    <span className="text-solar-300 text-[10px]">⭐</span>
                    <span className="text-white text-[10px] font-bold font-mono">{timeStr}</span>
                    <span className="text-gray-400 text-[9px] hidden sm:block">{w.reason.slice(0, 20)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
```

**Verify build, commit:**
```bash
npm run build 2>&1 | grep "error" | head -10
git add src/components/CosmicDashboard/IntradayTimeCycles.tsx
git commit -m "feat: add IntradayTimeCycles component — power windows timeline"
```

---

### Task 7: Create TradingDayCalendar.tsx

**File:** Create `aicharttraderchris/src/components/CosmicDashboard/TradingDayCalendar.tsx`

```tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WeeklyCalendarDay } from '@/types/cosmic';

interface Props {
  calendar: WeeklyCalendarDay[];
  isLoading?: boolean;
}

const PLANET_GLYPHS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿', Jupiter: '♃', Venus: '♀', Saturn: '♄',
};

const DAY_COLORS: Record<string, string> = {
  Sun: '#F6C453', Moon: '#5DD8FF', Mars: '#EF4444',
  Mercury: '#A78BFA', Jupiter: '#FB923C', Venus: '#34D399', Saturn: '#94A3B8',
};

const NODE_GRADIENT: Record<string, { bg: string; border: string; text: string; label: string }> = {
  ULTRA_ALIGNED: { bg: 'from-emerald-900/60 to-emerald-950/80', border: 'border-emerald-500/40', text: 'text-emerald-300', label: 'Prime' },
  HIGH_PRESSURE: { bg: 'from-green-900/50 to-green-950/70', border: 'border-green-500/30', text: 'text-green-300', label: 'Strong' },
  SOUL_WINDOW: { bg: 'from-blue-900/50 to-blue-950/70', border: 'border-blue-500/30', text: 'text-blue-300', label: 'Soul' },
  MIXED: { bg: 'from-amber-900/40 to-amber-950/60', border: 'border-amber-500/30', text: 'text-amber-300', label: 'Mixed' },
  CONFLICT: { bg: 'from-red-900/40 to-red-950/60', border: 'border-red-500/30', text: 'text-red-300', label: 'Caution' },
  DISRUPTION: { bg: 'from-purple-900/40 to-purple-950/60', border: 'border-purple-500/30', text: 'text-purple-300', label: 'Disruption' },
  U_NODE: { bg: 'from-gray-900/40 to-gray-950/60', border: 'border-gray-600/30', text: 'text-gray-400', label: 'Neutral' },
};

const MOON_PHASE_ICONS: Record<string, string> = {
  'New Moon': '🌑', 'Waxing Crescent': '🌒', 'First Quarter': '🌓', 'Waxing Gibbous': '🌔',
  'Full Moon': '🌕', 'Waning Gibbous': '🌖', 'Last Quarter': '🌗', 'Waning Crescent': '🌘',
};

const DAY_ABBREVS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function TradingDayCalendar({ calendar, isLoading }: Props) {
  const [showFullMonth, setShowFullMonth] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  // Best day in the next 7 days
  const week = calendar.slice(0, 7);
  const bestDayInWeek = week.reduce<WeeklyCalendarDay | null>((best, d) =>
    !best || d.score > best.score ? d : best, null);

  // For month calendar, build a grid with day-of-week alignment
  const firstDay = calendar[0] ? new Date(calendar[0].date + 'T12:00:00') : new Date();
  const startDow = firstDay.getDay();
  const calendarGrid: (WeeklyCalendarDay | null)[] = [
    ...Array(startDow).fill(null),
    ...calendar.slice(0, 35),
  ];

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-cosmic-900/90 to-emerald-950/50 p-5 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-40 mb-4" />
        <div className="grid grid-cols-7 gap-2">
          {Array(7).fill(0).map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="rounded-2xl border border-emerald-500/20 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: 'url(/images/ai-generated/cosmic-trading-calendar-bg.png)' }} />
      <div className="absolute inset-0 bg-gradient-to-br from-cosmic-950/95 via-cosmic-900/95 to-emerald-950/90" />

      <div className="relative z-10 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">📅</span>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest">Optimum Trading Calendar</h3>
          </div>
          <button
            onClick={() => setShowFullMonth(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white text-[11px] font-medium transition-all"
          >
            {showFullMonth ? '↑ Week View' : '↓ Month View'}
          </button>
        </div>

        {/* Week strip */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {week.map((day, i) => {
            const d = new Date(day.date + 'T12:00:00');
            const dow = DAY_ABBREVS[d.getDay()];
            const dayNum = d.getDate();
            const isToday = day.date === today;
            const isBest = day.date === bestDayInWeek?.date;
            const style = NODE_GRADIENT[day.nodeType] || NODE_GRADIENT.U_NODE;
            const rulerColor = DAY_COLORS[day.dayRuler] || '#fff';

            return (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`relative rounded-xl border p-2 flex flex-col items-center bg-gradient-to-b ${style.bg} ${style.border} ${
                  isToday ? 'ring-2 ring-solar-400/60 ring-offset-1 ring-offset-transparent' : ''
                }`}
              >
                {isBest && <span className="absolute -top-1 -right-1 text-[10px]">⭐</span>}
                <span className="text-[9px] text-gray-400 font-bold">{dow}</span>
                <span className={`text-lg font-black ${isToday ? 'text-solar-300' : 'text-white'}`}>{dayNum}</span>
                <span className="text-[14px]" style={{ color: rulerColor }}>{PLANET_GLYPHS[day.dayRuler]}</span>
                <span className={`text-[8px] font-bold uppercase ${style.text}`}>{style.label}</span>
                <span className="text-[10px] mt-0.5">{MOON_PHASE_ICONS[day.moonPhaseName] || ''}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Month calendar (expandable) */}
        <AnimatePresence>
          {showFullMonth && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="border-t border-white/10 pt-4">
                {/* Day of week headers */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {DAY_ABBREVS.map(d => (
                    <div key={d} className="text-center text-[9px] text-gray-500 font-bold uppercase">{d}</div>
                  ))}
                </div>
                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarGrid.map((day, i) => {
                    if (!day) return <div key={`empty-${i}`} className="h-10" />;
                    const isToday = day.date === today;
                    const d = new Date(day.date + 'T12:00:00');
                    const dayNum = d.getDate();
                    const style = NODE_GRADIENT[day.nodeType] || NODE_GRADIENT.U_NODE;
                    const rulerColor = DAY_COLORS[day.dayRuler] || '#fff';
                    const phaseIcon = MOON_PHASE_ICONS[day.moonPhaseName];
                    const isKeyPhase = ['New Moon', 'Full Moon', 'First Quarter', 'Last Quarter'].includes(day.moonPhaseName);

                    return (
                      <motion.div
                        key={day.date}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.008 }}
                        className={`relative h-10 rounded-lg border flex flex-col items-center justify-center cursor-default bg-gradient-to-b ${style.bg} ${style.border} ${
                          isToday ? 'ring-1 ring-solar-400/80' : ''
                        }`}
                        title={`${day.date} | ${day.dayRuler} Day | Moon in ${day.moonSign} | ${day.nodeType}`}
                      >
                        {isKeyPhase && (
                          <span className="absolute -top-0.5 -right-0.5 text-[8px]">{phaseIcon}</span>
                        )}
                        <span className={`text-[10px] font-bold ${isToday ? 'text-solar-300' : 'text-white'}`}>{dayNum}</span>
                        <span className="text-[8px]" style={{ color: rulerColor }}>{PLANET_GLYPHS[day.dayRuler]}</span>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-white/5">
                  {Object.entries(NODE_GRADIENT).filter(([k]) => k !== 'U_NODE').map(([type, s]) => (
                    <div key={type} className="flex items-center gap-1">
                      <div className={`w-2.5 h-2.5 rounded border ${s.border} bg-gradient-to-b ${s.bg}`} />
                      <span className={`text-[9px] ${s.text}`}>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
```

**Verify + commit:**
```bash
npm run build 2>&1 | grep "error" | head -10
git add src/components/CosmicDashboard/TradingDayCalendar.tsx
git commit -m "feat: add TradingDayCalendar — week strip + expandable month calendar"
```

---

### Task 8: Create MoonPhaseHero.tsx

**File:** Create `aicharttraderchris/src/components/CosmicDashboard/MoonPhaseHero.tsx`

```tsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { MoonPhase, VOCStatus } from '@/types/cosmic';

interface Props {
  moonPhase: MoonPhase;
  vocStatus: VOCStatus;
  moonSign: string;
}

const SIGN_COLORS: Record<string, string> = {
  Aries: '#EF4444', Taurus: '#22C55E', Gemini: '#A78BFA', Cancer: '#60A5FA',
  Leo: '#F6C453', Virgo: '#34D399', Libra: '#6EE7B7', Scorpio: '#DC2626',
  Sagittarius: '#FB923C', Capricorn: '#94A3B8', Aquarius: '#2EC5FF', Pisces: '#818CF8',
};

const SIGN_GLYPHS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

const SIGN_TRADING_HINT: Record<string, string> = {
  Aries: 'Volatile momentum — breakouts favor the bold',
  Taurus: 'Stable accumulation — value entries shine',
  Gemini: 'Whipsaw likely — stay nimble, honor stops',
  Cancer: 'Emotional sentiment — defensive plays lead',
  Leo: 'Confidence surges — trend-following rewards',
  Virgo: 'Analytical edge — data and earnings matter',
  Libra: 'Equilibrium — mean-reversion opportunities',
  Scorpio: 'High intensity — sudden reversals possible',
  Sagittarius: 'Optimism expands — risk assets rise',
  Capricorn: 'Institutional flow — disciplined entries',
  Aquarius: 'Erratic gaps — tech/innovation leads',
  Pisces: 'Foggy conviction — reduce size, wait',
};

export default function MoonPhaseHero({ moonPhase, vocStatus, moonSign }: Props) {
  const [haloAngle, setHaloAngle] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setHaloAngle(a => (a + 0.3) % 360), 50);
    return () => clearInterval(id);
  }, []);

  const illum = moonPhase.illumination ?? 0;
  const signColor = SIGN_COLORS[moonSign] || '#8B7AFF';
  const signGlyph = SIGN_GLYPHS[moonSign] || '☽';

  // SVG moon disc geometry (240×240 viewBox, radius 90)
  const cx = 120, cy = 120, r = 90;
  const angle = Math.acos(Math.abs(2 * illum - 1));
  const rx = r * Math.abs(Math.cos(angle));
  const leftX = cx - r;
  const rightX = cx + r;

  // Illuminate: right half + ellipse (waxing) or left half + ellipse (waning)
  const clipId = 'moonHeroClip';
  const termX = illum > 0.5 ? rightX - (rightX - leftX) * (1 - illum) * 2 : leftX + (rightX - leftX) * illum * 2;

  // Illumination arc (outer ring)
  const arcR = 108;
  const arcCircumference = 2 * Math.PI * arcR;
  const arcFill = illum * arcCircumference;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7 }}
      className="rounded-2xl border border-indigo-500/25 bg-gradient-to-br from-indigo-950/90 via-cosmic-900/95 to-slate-950/90 overflow-hidden"
    >
      <div className="p-5 flex flex-col items-center">
        <p className="text-indigo-300 text-[10px] uppercase tracking-widest mb-3 font-bold">Moon Phase</p>

        {/* Large moon SVG */}
        <div className="relative">
          <svg viewBox="0 0 240 240" className="w-52 h-52">
            <defs>
              <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#e2e8f0" stopOpacity="1" />
                <stop offset="70%" stopColor="#94a3b8" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#334155" stopOpacity="0.5" />
              </radialGradient>
              <clipPath id={clipId}>
                {illum >= 0.5 ? (
                  <path d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} A ${rx} ${r} 0 0 ${illum > 0.5 ? 0 : 1} ${cx} ${cy - r}`} />
                ) : (
                  <path d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} A ${rx} ${r} 0 0 ${illum > 0.5 ? 0 : 1} ${cx} ${cy - r}`} />
                )}
              </clipPath>
              <filter id="moonGlowFilter">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Outer glow halo — rotating */}
            <motion.circle cx={cx} cy={cy} r="108" fill="none" stroke={signColor} strokeWidth="1" strokeOpacity="0.25"
              strokeDasharray="4 8"
              style={{ transformOrigin: `${cx}px ${cy}px`, rotate: haloAngle }}
            />

            {/* Illumination arc ring */}
            <circle cx={cx} cy={cy} r={arcR} fill="none" stroke="#1e293b" strokeWidth="6" />
            <circle cx={cx} cy={cy} r={arcR} fill="none" stroke={signColor} strokeWidth="4"
              strokeDasharray={`${arcFill} ${arcCircumference}`}
              strokeLinecap="round"
              style={{ transformOrigin: `${cx}px ${cy}px`, rotate: '-90deg' }}
              strokeOpacity="0.8"
            />

            {/* Dark moon base */}
            <circle cx={cx} cy={cy} r={r} fill="#0f172a" />

            {/* Illuminated portion */}
            <g clipPath={`url(#${clipId})`}>
              <circle cx={cx} cy={cy} r={r} fill="url(#moonGlow)" filter="url(#moonGlowFilter)" />
            </g>

            {/* Moon emoji center */}
            <text x={cx} y={cy + 8} textAnchor="middle" fontSize="32">{moonPhase.emoji}</text>

            {/* Illumination % */}
            <text x={cx} y={cy + 34} textAnchor="middle" fill={signColor} fontSize="11" fontWeight="bold" fontFamily="monospace">
              {Math.round(illum * 100)}%
            </text>
          </svg>

          {/* Moon sign badge */}
          <motion.div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-bold"
            style={{ borderColor: signColor + '60', background: signColor + '20', color: signColor }}
            animate={{ boxShadow: [`0 0 8px ${signColor}40`, `0 0 16px ${signColor}60`, `0 0 8px ${signColor}40`] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span>{signGlyph}</span>
            <span>Moon in {moonSign}</span>
          </motion.div>
        </div>

        {/* Phase info */}
        <div className="mt-6 text-center space-y-1">
          <p className="text-white font-bold text-base">{moonPhase.name}</p>
          <p className="text-gray-400 text-[11px]">{moonPhase.isWaxing ? '↑ Waxing' : '↓ Waning'} · Day {Math.round(moonPhase.daysIntoCycle || 0)}</p>
          <p className="text-gray-300 text-[11px] italic mt-2 px-2">{SIGN_TRADING_HINT[moonSign]}</p>
        </div>

        {/* VOC Status */}
        {vocStatus.isVoid ? (
          <motion.div
            className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/40 bg-red-500/15"
            animate={{ opacity: [1, 0.7, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
          >
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-red-300 text-[10px] font-bold uppercase">Void of Course</span>
          </motion.div>
        ) : (
          <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-emerald-300 text-[10px]">Moon Clear</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
```

**Verify + commit:**
```bash
npm run build 2>&1 | grep "error" | head -10
git add src/components/CosmicDashboard/MoonPhaseHero.tsx
git commit -m "feat: add MoonPhaseHero — large moon disc with zodiac sign badge"
```

---

### Task 9: Create MarketTimingGuide.tsx

**File:** Create `aicharttraderchris/src/components/CosmicDashboard/MarketTimingGuide.tsx`

```tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  moonSign: string;
  planetaryRuler: string;
}

// ─── Planetary Ruler Relationships ─────────────────────────────────────────
const PLANET_RELATIONSHIPS: Record<string, { friends: string[]; enemies: string[] }> = {
  Sun:     { friends: ['Moon', 'Mars', 'Jupiter'],    enemies: ['Venus', 'Saturn'] },
  Moon:    { friends: ['Sun', 'Mercury'],              enemies: [] },
  Mars:    { friends: ['Sun', 'Moon', 'Jupiter'],      enemies: ['Mercury'] },
  Mercury: { friends: ['Sun', 'Venus'],                enemies: ['Moon'] },
  Jupiter: { friends: ['Sun', 'Moon', 'Mars'],         enemies: ['Mercury', 'Venus'] },
  Venus:   { friends: ['Mercury', 'Saturn'],           enemies: ['Sun', 'Moon'] },
  Saturn:  { friends: ['Mercury', 'Venus'],            enemies: ['Sun', 'Moon', 'Mars'] },
};

// ─── 12-Sign Market Guide ───────────────────────────────────────────────────
const SIGN_RULERS: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter',
};

const MOON_SIGN_GUIDE: Record<string, {
  glyph: string; color: string; ruler: string;
  sentiment: string; sentimentColor: string;
  tactics: string; avoid: string; description: string;
}> = {
  Aries:       { glyph: '♈', color: '#EF4444', ruler: 'Mars',    sentiment: 'VOLATILE',    sentimentColor: 'text-red-300',    tactics: 'Momentum breakouts, fast scalps', avoid: 'Overtrading FOMO', description: 'Impulsive energy drives sharp breakouts. Markets reward the fast and punish the hesitant. Volatility spikes on news events. Best for quick-fire entries with tight stops.' },
  Taurus:      { glyph: '♉', color: '#22C55E', ruler: 'Venus',   sentiment: 'STABLE',      sentimentColor: 'text-emerald-300',tactics: 'Accumulation zones, value entries', avoid: 'Chasing fast moves', description: 'Steady, patient accumulation energy. Markets consolidate near value areas. Longer-timeframe entries set up cleanly. Excellent for buy-and-hold positioning.' },
  Gemini:      { glyph: '♊', color: '#A78BFA', ruler: 'Mercury', sentiment: 'WHIPSAW',     sentimentColor: 'text-purple-300', tactics: 'Range-bound scalps, news catalysts', avoid: 'Holding through indecision', description: 'Two competing narratives create whipsaw conditions. News-driven gaps create short-term opportunities. Stay nimble and reduce position size.' },
  Cancer:      { glyph: '♋', color: '#60A5FA', ruler: 'Moon',    sentiment: 'DEFENSIVE',   sentimentColor: 'text-blue-300',   tactics: 'Defensive sectors, safety plays', avoid: 'Aggressive positions', description: 'Emotional market reactions dominate. Sentiment shifts quickly. Defensive sectors and safe-haven assets outperform. Follow the institutional order flow, not retail emotion.' },
  Leo:         { glyph: '♌', color: '#F6C453', ruler: 'Sun',     sentiment: 'BULLISH',     sentimentColor: 'text-solar-300',  tactics: 'Trend-following, large-cap longs', avoid: 'Short selling into strength', description: 'Confidence surges across the market. Blue chips and market leaders attract capital. Risk-on appetite drives momentum higher. Bold trend trades are rewarded.' },
  Virgo:       { glyph: '♍', color: '#34D399', ruler: 'Mercury', sentiment: 'ANALYTICAL',  sentimentColor: 'text-emerald-300',tactics: 'Earnings plays, sector rotation', avoid: 'Over-analyzing entries', description: 'Precision over conviction. Fundamental data and earnings reports drive price action. Detail-oriented traders and systematic strategies thrive in this environment.' },
  Libra:       { glyph: '♎', color: '#6EE7B7', ruler: 'Venus',   sentiment: 'BALANCED',    sentimentColor: 'text-teal-300',   tactics: 'Mean-reversion, pairs trading', avoid: 'Strong directional bets', description: 'Equilibrium-seeking energy. Markets hover near fair value. M&A activity and corporate events create specific opportunities. Avoid trending strategies.' },
  Scorpio:     { glyph: '♏', color: '#DC2626', ruler: 'Mars',    sentiment: 'INTENSE',     sentimentColor: 'text-red-400',    tactics: 'Options strategies, reversal plays', avoid: 'Complacency', description: 'Deep volatility and sudden reversals. Hidden order flow surfaces unexpectedly. High-risk, high-reward environment that punishes the passive and rewards the vigilant.' },
  Sagittarius: { glyph: '♐', color: '#FB923C', ruler: 'Jupiter', sentiment: 'EXPANSIVE',   sentimentColor: 'text-orange-300', tactics: 'Global exposure, risk assets, growth', avoid: 'Overly cautious positions', description: 'Optimism expands risk appetite broadly. International markets and growth assets attract capital. Jupiter-driven momentum favors aggressive trend-following.' },
  Capricorn:   { glyph: '♑', color: '#94A3B8', ruler: 'Saturn',  sentiment: 'DISCIPLINED', sentimentColor: 'text-slate-300',  tactics: 'Institutional setups, slow trends', avoid: 'Impulse trades', description: 'Institutional discipline takes over. Slow, methodical trend continuation. Quality names attract patient capital. Only high-conviction setups deserve your attention.' },
  Aquarius:    { glyph: '♒', color: '#2EC5FF', ruler: 'Saturn',  sentiment: 'ERRATIC',     sentimentColor: 'text-aurora-400', tactics: 'Tech sector, gap plays', avoid: 'Crowded trades', description: 'Unexpected gaps and innovation-driven moves emerge. Technology and disruptive assets see unusual activity. Contrarian setups arise from the unpredictable flow.' },
  Pisces:      { glyph: '♓', color: '#818CF8', ruler: 'Jupiter', sentiment: 'FOGGY',       sentimentColor: 'text-indigo-300', tactics: 'Reduce size, sit on hands', avoid: 'New positions in confusion', description: 'Low conviction and sector confusion dominate. Conflicting signals create head-fakes. This is a time to protect capital, reduce position size, and wait for clarity.' },
};

const SIGNS = Object.keys(MOON_SIGN_GUIDE);

function getFitRelationship(moonSign: string, planetaryRuler: string): { label: string; color: string; bg: string } {
  const signRuler = SIGN_RULERS[moonSign];
  if (!signRuler || !planetaryRuler) return { label: 'NEUTRAL', color: 'text-gray-400', bg: 'bg-gray-500/15 border-gray-500/30' };
  if (signRuler === planetaryRuler) return { label: 'RESONANCE', color: 'text-solar-300', bg: 'bg-solar-500/15 border-solar-400/40' };
  const rel = PLANET_RELATIONSHIPS[planetaryRuler];
  if (!rel) return { label: 'NEUTRAL', color: 'text-gray-400', bg: 'bg-gray-500/15 border-gray-500/30' };
  if (rel.friends.includes(signRuler)) return { label: 'SYNERGY', color: 'text-emerald-300', bg: 'bg-emerald-500/15 border-emerald-400/40' };
  if (rel.enemies.includes(signRuler)) return { label: 'TENSION', color: 'text-red-300', bg: 'bg-red-500/15 border-red-400/40' };
  return { label: 'NEUTRAL', color: 'text-gray-400', bg: 'bg-gray-500/15 border-gray-500/30' };
}

export default function MarketTimingGuide({ moonSign, planetaryRuler }: Props) {
  const [expandedSign, setExpandedSign] = useState<string | null>(null);
  const current = MOON_SIGN_GUIDE[moonSign];
  const fit = getFitRelationship(moonSign, planetaryRuler);

  if (!current) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.1 }}
      className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/80 via-cosmic-900/95 to-purple-950/80 overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">📖</span>
          <h3 className="text-white font-bold text-sm uppercase tracking-widest">Market Timing Guide</h3>
        </div>

        {/* Current moon sign — hero card */}
        <div
          className="rounded-xl border p-4 mb-4 cursor-pointer"
          style={{ borderColor: current.color + '50', background: current.color + '12' }}
          onClick={() => setExpandedSign(expandedSign === moonSign ? null : moonSign)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{current.glyph}</span>
              <div>
                <p className="text-white font-bold text-sm">Moon in {moonSign}</p>
                <p className={`text-[10px] font-black uppercase tracking-wider ${current.sentimentColor}`}>{current.sentiment}</p>
              </div>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full border text-[9px] font-bold ${fit.bg} ${fit.color}`}>
              {fit.label}
            </div>
          </div>
          <p className="text-gray-300 text-[11px] leading-relaxed mt-3">{current.description}</p>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2 py-1.5">
              <p className="text-emerald-400 text-[9px] uppercase font-bold mb-0.5">Tactics</p>
              <p className="text-gray-300 text-[10px]">{current.tactics}</p>
            </div>
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-2 py-1.5">
              <p className="text-red-400 text-[9px] uppercase font-bold mb-0.5">Avoid</p>
              <p className="text-gray-300 text-[10px]">{current.avoid}</p>
            </div>
          </div>
        </div>

        {/* 12-sign accordion */}
        <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-2">All Moon Signs</p>
        <div className="grid grid-cols-4 gap-1.5">
          {SIGNS.filter(s => s !== moonSign).map(sign => {
            const g = MOON_SIGN_GUIDE[sign];
            const isExpanded = expandedSign === sign;
            const signFit = getFitRelationship(sign, planetaryRuler);
            return (
              <div key={sign}>
                <button
                  className="w-full rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 p-2 flex flex-col items-center gap-0.5 transition-all"
                  style={{ borderColor: isExpanded ? g.color + '50' : undefined, background: isExpanded ? g.color + '15' : undefined }}
                  onClick={() => setExpandedSign(isExpanded ? null : sign)}
                >
                  <span className="text-lg">{g.glyph}</span>
                  <span className="text-[9px] text-gray-300 font-bold">{sign}</span>
                  <span className={`text-[8px] ${g.sentimentColor}`}>{g.sentiment}</span>
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="col-span-4 rounded-xl border mt-1 p-3"
                      style={{ borderColor: g.color + '40', background: g.color + '10' }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white font-bold text-xs">{g.glyph} Moon in {sign}</p>
                        <span className={`text-[9px] font-bold ${signFit.color}`}>{signFit.label}</span>
                      </div>
                      <p className="text-gray-300 text-[10px] leading-relaxed">{g.description}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
```

**Verify + commit:**
```bash
npm run build 2>&1 | grep "error" | head -10
git add src/components/CosmicDashboard/MarketTimingGuide.tsx
git commit -m "feat: add MarketTimingGuide — 12-sign moon trading atlas with personalized fit"
```

---

### Task 10: Create PlanetaryCommandCenter.tsx

**File:** Create `aicharttraderchris/src/components/CosmicDashboard/PlanetaryCommandCenter.tsx`

```tsx
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { PlanetaryHourMap, Planet } from '@/types/cosmic';

interface Props {
  planetaryHours: PlanetaryHourMap;
  planetaryRuler: Planet;
}

// ─── Chaldean Planetary Hour System ──────────────────────────────────────────
const CHALDEAN: Planet[] = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];
const DAY_START_IDX: Record<string, number> = {
  Sun: 3, Moon: 6, Mars: 2, Mercury: 5, Jupiter: 1, Venus: 4, Saturn: 0,
};

const PLANET_GLYPHS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿', Jupiter: '♃', Venus: '♀', Saturn: '♄',
};
const PLANET_COLORS: Record<string, string> = {
  Sun: '#F6C453', Moon: '#5DD8FF', Mars: '#EF4444',
  Mercury: '#A78BFA', Jupiter: '#FB923C', Venus: '#34D399', Saturn: '#94A3B8',
};

const PLANET_RELATIONSHIPS: Record<string, { friends: string[]; enemies: string[] }> = {
  Sun:     { friends: ['Moon', 'Mars', 'Jupiter'],    enemies: ['Venus', 'Saturn'] },
  Moon:    { friends: ['Sun', 'Mercury'],              enemies: [] },
  Mars:    { friends: ['Sun', 'Moon', 'Jupiter'],      enemies: ['Mercury'] },
  Mercury: { friends: ['Sun', 'Venus'],                enemies: ['Moon'] },
  Jupiter: { friends: ['Sun', 'Moon', 'Mars'],         enemies: ['Mercury', 'Venus'] },
  Venus:   { friends: ['Mercury', 'Saturn'],           enemies: ['Sun', 'Moon'] },
  Saturn:  { friends: ['Mercury', 'Venus'],            enemies: ['Sun', 'Moon', 'Mars'] },
};

const DAY_WISDOM: Record<string, string> = {
  Sun:     'Solar confidence amplifies bold moves. Quality over quantity — favor market leaders.',
  Moon:    'Sentiment rules today. Follow institutional order flow, not crowd emotion.',
  Mars:    'Energy is high but patience is thin. Set tight stops. Fast entries, faster exits.',
  Mercury: 'News and data dominate price action. Trade the catalyst, not the narrative.',
  Jupiter: 'Risk appetite expands midday. Trend-following strategies outperform.',
  Venus:   'Profit-taking pressure builds into close. Lighter positions favor you.',
  Saturn:  'Discipline over intuition. Only high-conviction setups. Honor every stop.',
};

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function wedgePath(cx: number, cy: number, rIn: number, rOut: number, startDeg: number, endDeg: number): string {
  const gap = 0.5;
  const s1 = polarToXY(cx, cy, rIn, startDeg + gap);
  const s2 = polarToXY(cx, cy, rOut, startDeg + gap);
  const e1 = polarToXY(cx, cy, rOut, endDeg - gap);
  const e2 = polarToXY(cx, cy, rIn, endDeg - gap);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s1.x} ${s1.y} L ${s2.x} ${s2.y} A ${rOut} ${rOut} 0 ${large} 1 ${e1.x} ${e1.y} L ${e2.x} ${e2.y} A ${rIn} ${rIn} 0 ${large} 0 ${s1.x} ${s1.y} Z`;
}

function getHourRelationship(hourPlanet: Planet, rulerPlanet: string): 'ally' | 'enemy' | 'neutral' | 'self' {
  if (hourPlanet === rulerPlanet) return 'self';
  const rel = PLANET_RELATIONSHIPS[rulerPlanet];
  if (!rel) return 'neutral';
  if (rel.friends.includes(hourPlanet)) return 'ally';
  if (rel.enemies.includes(hourPlanet)) return 'enemy';
  return 'neutral';
}

export default function PlanetaryCommandCenter({ planetaryHours, planetaryRuler }: Props) {
  const [nowMinutes, setNowMinutes] = useState(() => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  });

  useEffect(() => {
    const id = setInterval(() => {
      const n = new Date();
      setNowMinutes(n.getHours() * 60 + n.getMinutes());
    }, 60000);
    return () => clearInterval(id);
  }, []);

  // Compute all 24 planetary hours from dayRuler + sunrise/sunset
  const allHours = useMemo(() => {
    const sunrise = new Date(planetaryHours.sunrise);
    const sunset = new Date(planetaryHours.sunset);
    const nextSunrise = new Date(sunrise.getTime() + 24 * 60 * 60 * 1000);

    const dayDuration = sunset.getTime() - sunrise.getTime();
    const nightDuration = nextSunrise.getTime() - sunset.getTime();
    const dayHourMs = dayDuration / 12;
    const nightHourMs = nightDuration / 12;

    const startIdx = DAY_START_IDX[planetaryHours.dayRuler] ?? 0;
    const hours: Array<{ planet: Planet; startMs: number; endMs: number; isDaytime: boolean }> = [];

    for (let i = 0; i < 12; i++) {
      const planetIdx = (startIdx + i) % 7;
      hours.push({
        planet: CHALDEAN[planetIdx],
        startMs: sunrise.getTime() + i * dayHourMs,
        endMs: sunrise.getTime() + (i + 1) * dayHourMs,
        isDaytime: true,
      });
    }
    for (let i = 0; i < 12; i++) {
      const planetIdx = (startIdx + 12 + i) % 7;
      hours.push({
        planet: CHALDEAN[planetIdx],
        startMs: sunset.getTime() + i * nightHourMs,
        endMs: sunset.getTime() + (i + 1) * nightHourMs,
        isDaytime: false,
      });
    }
    return hours;
  }, [planetaryHours]);

  // Find current hour index
  const nowMs = useMemo(() => {
    const n = new Date();
    return n.getTime();
  }, [nowMinutes]);

  const currentIdx = allHours.findIndex(h => nowMs >= h.startMs && nowMs < h.endMs);
  const currentPlanet = currentIdx >= 0 ? allHours[currentIdx].planet : planetaryHours.currentHour.planet;

  // Ally/enemy/neutral counts
  const counts = allHours.reduce(
    (acc, h) => { acc[getHourRelationship(h.planet, planetaryRuler)]++; return acc; },
    { ally: 0, enemy: 0, neutral: 0, self: 0 }
  );

  // Next ally hour
  const nextAllyHour = allHours.find((h, i) => i > currentIdx && getHourRelationship(h.planet, planetaryRuler) === 'ally');
  const msToNextAlly = nextAllyHour ? nextAllyHour.startMs - nowMs : null;
  const nextAllyStr = msToNextAlly
    ? `${Math.floor(msToNextAlly / 3600000)}h ${Math.floor((msToNextAlly % 3600000) / 60000)}m`
    : '—';

  // Best upcoming hours (top 5 ally + self)
  const upcomingBest = allHours
    .filter((h, i) => i >= currentIdx && ['ally', 'self'].includes(getHourRelationship(h.planet, planetaryRuler)))
    .slice(0, 5);

  const currentRel = getHourRelationship(currentPlanet, planetaryRuler);

  const WEDGE_COLORS = { ally: '#2EC5FF', enemy: '#EF4444', neutral: '#374151', self: '#F6C453' };
  const WEDGE_BG = { ally: 'rgba(46,197,255,0.25)', enemy: 'rgba(239,68,68,0.2)', neutral: 'rgba(55,65,81,0.3)', self: 'rgba(246,196,83,0.3)' };

  const cx = 200, cy = 200;
  const outerR = 175, midR = 140, innerR = 60;
  const wedgeDeg = 360 / 24;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.15 }}
      className="rounded-2xl border border-amber-500/20 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-cover bg-center opacity-12" style={{ backgroundImage: 'url(/images/ai-generated/cosmic-day-ruler-bg.png)' }} />
      <div className="absolute inset-0 bg-gradient-to-br from-amber-950/95 via-cosmic-900/95 to-indigo-950/95" />

      <div className="relative z-10 p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🌐</span>
          <h3 className="text-white font-bold text-sm uppercase tracking-widest">Planetary Command Center</h3>
          <div className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-full border border-amber-500/40 bg-amber-500/15 text-amber-300 text-[10px] font-bold">
            {PLANET_GLYPHS[planetaryHours.dayRuler]} {planetaryHours.dayRuler} Day
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">
          {/* ── Left: 24-Hour Command Wheel ── */}
          <div className="flex-1 flex justify-center">
            <svg viewBox="0 0 400 400" className="w-full max-w-xs sm:max-w-sm">
              <defs>
                <filter id="allyGlow">
                  <feGaussianBlur stdDeviation="3" result="b"/>
                  <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <filter id="enemyGlow">
                  <feGaussianBlur stdDeviation="2" result="b"/>
                  <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>

              {/* Wedges */}
              {allHours.map((h, i) => {
                const startDeg = i * wedgeDeg - 90;
                const endDeg = startDeg + wedgeDeg;
                const midDeg = startDeg + wedgeDeg / 2 + 90;
                const rel = getHourRelationship(h.planet, planetaryRuler);
                const isCurrent = i === currentIdx;
                const isPast = i < currentIdx;
                const color = WEDGE_COLORS[rel];
                const bg = WEDGE_BG[rel];
                const labelPos = polarToXY(cx, cy, (outerR + midR) / 2, midDeg);

                return (
                  <g key={i}>
                    <motion.path
                      d={wedgePath(cx, cy, midR, outerR, startDeg + 90, endDeg + 90)}
                      fill={isCurrent ? color : bg}
                      stroke={color}
                      strokeWidth={isCurrent ? 2 : 0.5}
                      opacity={isPast ? 0.3 : 1}
                      filter={rel === 'ally' && !isPast ? 'url(#allyGlow)' : rel === 'enemy' && !isPast ? 'url(#enemyGlow)' : undefined}
                      animate={isCurrent ? { opacity: [1, 0.7, 1] } : undefined}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    {/* Planet glyph label */}
                    <text
                      x={labelPos.x} y={labelPos.y}
                      textAnchor="middle" dominantBaseline="middle"
                      fontSize="9"
                      fill={isPast ? '#374151' : color}
                      opacity={isPast ? 0.5 : 0.85}
                    >
                      {PLANET_GLYPHS[h.planet]}
                    </text>
                  </g>
                );
              })}

              {/* Inner ring */}
              <circle cx={cx} cy={cy} r={midR} fill="none" stroke="#1e293b" strokeWidth="1" />
              <circle cx={cx} cy={cy} r={innerR} fill="#0a0f1e" stroke="#1e293b" strokeWidth="1" />

              {/* Current hour beam */}
              {currentIdx >= 0 && (() => {
                const beamDeg = currentIdx * wedgeDeg + wedgeDeg / 2;
                const beamEnd = polarToXY(cx, cy, outerR - 5, beamDeg - 90);
                return (
                  <motion.line
                    x1={cx} y1={cy} x2={beamEnd.x} y2={beamEnd.y}
                    stroke="white" strokeWidth="1.5" strokeOpacity="0.6"
                    animate={{ strokeOpacity: [0.6, 0.2, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                );
              })()}

              {/* Center: day ruler */}
              <text x={cx} y={cy - 12} textAnchor="middle" fontSize="28" fill={PLANET_COLORS[planetaryHours.dayRuler]}>
                {PLANET_GLYPHS[planetaryHours.dayRuler]}
              </text>
              <text x={cx} y={cy + 10} textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">
                {planetaryHours.dayRuler.toUpperCase()}
              </text>
              <text x={cx} y={cy + 22} textAnchor="middle" fill="#6b7280" fontSize="8">DAY</text>
            </svg>
          </div>

          {/* ── Right: Tactical Panel ── */}
          <div className="w-full lg:w-56 flex flex-col gap-3">
            {/* Current hour status */}
            <div className={`rounded-xl border p-3 text-center ${
              currentRel === 'ally' ? 'border-aurora-500/40 bg-aurora-500/10' :
              currentRel === 'enemy' ? 'border-red-500/40 bg-red-500/10' :
              currentRel === 'self' ? 'border-solar-500/40 bg-solar-500/10' :
              'border-gray-500/30 bg-gray-500/10'
            }`}>
              <p className="text-gray-400 text-[9px] uppercase mb-1">Current Hour</p>
              <p className="text-2xl">{PLANET_GLYPHS[currentPlanet]}</p>
              <p className="text-white font-bold text-xs">{currentPlanet}</p>
              <p className={`text-[10px] font-black uppercase mt-1 ${
                currentRel === 'ally' ? 'text-aurora-400' :
                currentRel === 'enemy' ? 'text-red-400' :
                currentRel === 'self' ? 'text-solar-400' :
                'text-gray-400'
              }`}>
                {currentRel === 'self' ? '★ YOUR RULER' : currentRel.toUpperCase()}
              </p>
            </div>

            {/* Next ally countdown */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3">
              <p className="text-gray-400 text-[9px] uppercase mb-1">Next Ally Hour</p>
              <p className="text-emerald-300 font-mono font-bold text-xl">{nextAllyStr}</p>
              {nextAllyHour && (
                <p className="text-gray-400 text-[10px] mt-0.5">
                  {PLANET_GLYPHS[nextAllyHour.planet]} {new Date(nextAllyHour.startMs).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </p>
              )}
            </div>

            {/* Day summary */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-gray-400 text-[9px] uppercase mb-2">Today's Breakdown</p>
              <div className="flex gap-3 text-center">
                <div><p className="text-aurora-300 font-bold text-sm">{counts.ally + counts.self}</p><p className="text-[9px] text-gray-500">Ally</p></div>
                <div><p className="text-gray-400 font-bold text-sm">{counts.neutral}</p><p className="text-[9px] text-gray-500">Neutral</p></div>
                <div><p className="text-red-400 font-bold text-sm">{counts.enemy}</p><p className="text-[9px] text-gray-500">Enemy</p></div>
              </div>
            </div>

            {/* Best upcoming hours */}
            {upcomingBest.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-gray-400 text-[9px] uppercase mb-2">Best Hours Today</p>
                <div className="space-y-1.5">
                  {upcomingBest.slice(0, 4).map((h, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px]" style={{ color: PLANET_COLORS[h.planet] }}>{PLANET_GLYPHS[h.planet]}</span>
                        <span className="text-white text-[10px] font-medium">{h.planet}</span>
                      </div>
                      <span className="text-gray-400 text-[9px] font-mono">
                        {new Date(h.startMs).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Day wisdom */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-950/30 p-3">
              <p className="text-amber-400 text-[9px] uppercase mb-1 font-bold">Day Wisdom</p>
              <p className="text-gray-300 text-[10px] leading-relaxed italic">
                {DAY_WISDOM[planetaryHours.dayRuler] || ''}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
```

**Verify + commit:**
```bash
npm run build 2>&1 | grep "error" | head -10
git add src/components/CosmicDashboard/PlanetaryCommandCenter.tsx
git commit -m "feat: add PlanetaryCommandCenter — 24-hour command wheel + tactical panel"
```

---

### Task 11: Update CosmicTimingDashboard.tsx

**File:** Modify `aicharttraderchris/src/components/CosmicDashboard/CosmicTimingDashboard.tsx`

This is a full rewrite of the orchestrator. Replace the entire file content with the following:

```tsx
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
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.08, ease: 'easeOut' } }),
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

  const currentHora = data.horaGrid.hours?.[data.horaGrid.currentHourIndex ?? 0];

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
            <CosmicPressureTimeline hours={data.horaGrid.hours} currentHourIndex={data.horaGrid.currentHourIndex ?? 0} />
          </div>
        </div>
      </Section>

      {/* ── 7. Hora Orbit Wheel ── */}
      <Section index={7}>
        <HoraOrbitWheel hours={data.horaGrid.hours} currentHourIndex={data.horaGrid.currentHourIndex ?? 0} />
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
          <EnvironmentalGauges energy={data.environmentalEnergy} />
        </div>
      </Section>

      {/* ── 10. Constellation Ring ── */}
      <Section index={10}>
        <ConstellationRing factors={data.neoScore.factors} total={data.neoScore.total} />
      </Section>

    </div>
  );
}
```

**Step 2: Verify full build**
```bash
cd /Users/ivanjackson/Desktop/aicharttraderchris && npm run build 2>&1 | tail -20
```
Expected: "built in X.XXs" with 0 errors. If there are TypeScript errors, fix them before committing.

**Step 3: Commit**
```bash
git add src/components/CosmicDashboard/CosmicTimingDashboard.tsx
git commit -m "feat: rewrite CosmicTimingDashboard with all 6 priority sections in order"
```

---

### Task 12: Build, Deploy & Push

**Step 1: Final build verification**
```bash
cd /Users/ivanjackson/Desktop/aicharttraderchris && npm run build 2>&1 | tail -5
```
Expected: "built in Xs" with 0 errors.

**Step 2: Deploy to Cloudflare Pages**
```bash
npx wrangler pages deploy dist --project-name aicharttraderchris --commit-dirty=true 2>&1 | tail -8
```
Expected: "✨ Deployment complete!"

**Step 3: Push to GitHub**
```bash
git push origin main
```

**Step 4: Smoke test checklist**
- Open the deployed URL
- Navigate to the Cosmic Timing tab
- Verify Soul Blueprint bar loads at top
- Verify Macro Time Cycles shows lunar arc, Mercury badge, weekly rhythm
- Verify Intraday timeline shows color-coded hora bands
- Verify Trading Calendar shows 7-day week strip
- Click "↓ Month View" and verify 35-day calendar appears
- Verify Moon Phase Hero shows large moon + zodiac sign badge
- Verify Market Timing Guide shows current sign expanded
- Verify Planetary Command Center shows 24-wedge wheel
- Verify existing sections (NEO, Hora Wheel, etc.) still render below
