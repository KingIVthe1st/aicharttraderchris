# Cosmic Timing Premium Redesign — Design
**Date:** 2026-03-04
**Status:** Draft
**Goal:** Elevate every Cosmic Timing module to multi-million-dollar agency quality using a "Deep Space Observatory" aesthetic — frosted glass panels floating in deep space with nebula gradients, orbital animations, constellation overlays, and premium depth.

---

## Design Language: Deep Space Observatory

### Color System
- **Deep backgrounds:** `cosmic-950` (#04050D) → `cosmic-900` (#090B1A) base
- **Glass panels:** `rgba(255,255,255,0.03)` → `rgba(255,255,255,0.06)` layered
- **Nebula accents:** `nebula-500` (#6D5BFF) for primary purple glow
- **Aurora accents:** `aurora-500` (#2EC5FF) for cyan highlights
- **Solar accents:** `solar-500` (#F6C453) for gold/energy states
- **Danger/conflict:** Deep crimson `#DC2626` with `rgba(220,38,38,0.15)` washes

### Visual Principles
1. **Depth through layers** — Every panel has 3+ translucent layers (background gradient, frosted glass, content, glow border)
2. **Soft radial glows** — No hard edges. All highlights use `feGaussianBlur` SVG filters or `box-shadow` with 20-40px spread
3. **Breathing animations** — Subtle 4-8s opacity/scale cycles on key elements. Nothing aggressive.
4. **Constellation wire art** — Thin `rgba(255,255,255,0.04)` connecting lines as decorative backgrounds
5. **Typography hierarchy** — Large monospace numbers for data, uppercase tracking-widest for labels, gray-400 for explanatory text
6. **Semantic color meaning** — Green/cyan = favorable, gold = special/aligned, red = caution, purple = mystical/deep

---

## Part 1: Shared Premium Primitives

### Primitive 1: `CosmicGlassCard`
**File:** `src/components/CosmicDashboard/shared/CosmicGlassCard.tsx`

Multi-layer frosted glass panel replacing all flat `bg-gray-900` cards:

```typescript
interface CosmicGlassCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'sunken';
  accentColor?: string;        // e.g., 'nebula' | 'aurora' | 'solar' | 'emerald' | 'red'
  glowIntensity?: 'none' | 'subtle' | 'medium' | 'strong';
  className?: string;
  noPadding?: boolean;
}
```

**Visual layers (outside-in):**
1. Outer glow: `box-shadow: 0 0 30px rgba(accent, 0.08)`
2. Border: `1px solid rgba(accent, 0.15)` with hover → `rgba(accent, 0.25)`
3. Background: `backdrop-filter: blur(12px)` + `bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-transparent`
4. Inner content area with padding
5. Optional top-left corner accent line (2px, 40px wide, accent color at 30%)

**Variants:**
- `default`: Standard glass with subtle border glow
- `elevated`: Stronger shadow (`0 8px 32px rgba(0,0,0,0.4)`) + slightly brighter glass
- `sunken`: Inset shadow effect, slightly darker glass, used for nested panels

---

### Primitive 2: `CosmicArcGauge`
**File:** `src/components/CosmicDashboard/shared/CosmicArcGauge.tsx`

Premium arc/ring gauge with glow effects, replacing basic SVG arcs:

```typescript
interface CosmicArcGaugeProps {
  value: number;          // 0-1 normalized
  size?: number;          // px, default 120
  strokeWidth?: number;   // default 8
  color: string;          // hex color for fill
  label?: string;         // center text
  sublabel?: string;      // below center
  showGlow?: boolean;     // default true
  animate?: boolean;      // default true
}
```

**Visual treatment:**
- Track ring: `rgba(255,255,255,0.06)` with thin stroke
- Value ring: Gradient from `color` to lighter variant, with `feGaussianBlur` glow filter (stdDeviation=4)
- Rounded stroke-linecap for smooth ends
- Animated fill on mount (0 → value over 1.2s with spring easing)
- Center: Large monospace value + small label below
- Optional tick marks at 25%, 50%, 75%

---

### Primitive 3: `CosmicStatusOrb`
**File:** `src/components/CosmicDashboard/shared/CosmicStatusOrb.tsx`

Premium status indicator replacing flat colored dots/badges:

```typescript
interface CosmicStatusOrbProps {
  status: 'positive' | 'neutral' | 'negative' | 'special';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  label?: string;
}
```

**Visual treatment:**
- Radial gradient fill (bright center → transparent edge)
- Outer glow ring (`box-shadow: 0 0 12px color`)
- Inner bright core dot
- Optional breathing pulse animation (4s)
- `sm`: 8px, `md`: 12px, `lg`: 16px

---

### Primitive 4: `CosmicDataRow`
**File:** `src/components/CosmicDashboard/shared/CosmicDataRow.tsx`

Premium data display row for key-value pairs:

```typescript
interface CosmicDataRowProps {
  icon?: string;          // emoji or glyph
  label: string;
  value: string | number;
  valueColor?: string;
  sublabel?: string;
  badge?: { text: string; variant: 'positive' | 'neutral' | 'negative' };
}
```

**Visual treatment:**
- Flex row with `gap-3 items-center`
- Icon in `24x24` circle with `bg-white/5`
- Label: `text-xs uppercase tracking-widest text-gray-500`
- Value: `text-sm font-semibold text-white` (or valueColor)
- Optional badge with `CosmicStatusOrb` + text
- Bottom border: `1px solid rgba(255,255,255,0.04)`

---

### Primitive 5: `CosmicConstellationBg`
**File:** `src/components/CosmicDashboard/shared/CosmicConstellationBg.tsx`

Decorative background layer with constellation wire art:

```typescript
interface CosmicConstellationBgProps {
  density?: 'sparse' | 'medium' | 'dense';
  color?: string;
  animated?: boolean;
}
```

**Visual treatment:**
- Absolute-positioned SVG layer with `pointer-events-none`
- Random dots (stars) at `rgba(255,255,255,0.08)` with varying sizes (1-2px)
- Thin connecting lines between nearby stars at `rgba(255,255,255,0.03)`
- Optional slow drift animation (120s cycle, translateX ±10px)
- `sparse`: ~20 stars, `medium`: ~40, `dense`: ~60

---

## Part 2: Component Redesigns

### 1. SoulBlueprintIdentityBar — "Cosmic Identity Beacon"

**Current:** 7/10 — Flat gradient bar with text badges
**Target:** 9.5/10 — Floating identity card with holographic depth

**Redesign:**
- **Container:** `CosmicGlassCard variant="elevated"` with nebula accent glow
- **Layout:** Centered column on mobile, flex row on desktop
- **Life Path Hero:** Left section — enormous gradient number (text-7xl → text-8xl) with SVG glow filter behind it, creating a luminous beacon effect. Gradient: nebula-500 → aurora-500.
- **Identity Constellation:** Center — 3 zodiac badges arranged in a triangular constellation pattern with thin connecting lines (Sun at top, Moon bottom-left, Rising bottom-right). Each badge is a glass circle with the sign glyph + name.
- **Cosmic Metadata:** Right — Stacked data rows using `CosmicDataRow` for Chinese zodiac, planetary ruler, nakshatra
- **Alignment Strip:** Bottom — Horizontal number sequence (1-9) with the current personal day number having a pulsing solar-gold halo. Alignment day triggers a full-width subtle golden shimmer across the entire bar.
- **Background:** `CosmicConstellationBg density="sparse"` behind everything

---

### 2. MoonPhaseHero — "Lunar Observatory"

**Current:** 8.5/10 — Already strong SVG moon
**Target:** 9.5/10 — Observatory-grade moon visualization

**Redesign:**
- **Container:** `CosmicGlassCard variant="elevated"` with indigo accent
- **Moon disc:** Scale up to 280×280 SVG. Add multi-layer atmosphere effect:
  - Outer glow ring: radial gradient halo extending 40px beyond moon edge
  - Surface texture: subtle noise overlay on the lit portion
  - Terminator line: soft gradient at the light/dark boundary (not a hard clip)
  - Phase shadow: deep navy with slight transparency showing "dark side" detail
- **Illumination display:** Large monospace number (text-5xl) floating beside moon with `%` superscript
- **Moon sign badge:** Premium glass pill with zodiac glyph + sign name + accent color dot
- **VOC indicator:** When void, overlay a subtle red-to-transparent vignette around the moon edge
- **Phase name:** Gradient text below moon (e.g., "Waxing Gibbous" in aurora-to-nebula gradient)
- **Ingress countdown:** Small monospace countdown chip below phase name

---

### 3. IntradayTimeCycles — "Power Grid Timeline"

**Current:** 7.5/10 — Basic colored bar segments
**Target:** 9.5/10 — Premium animated timeline with depth

**Redesign:**
- **Container:** `CosmicGlassCard` with aurora accent
- **Timeline reimagined:** Replace flat bar with a **depth band** visualization:
  - Main band: 48px tall with rounded ends
  - Each hour segment: gradient fill with soft glow at edges
  - Segment gaps: 1px dark separators (not borders)
  - ULTRA_ALIGNED segments: Animated subtle gold shimmer overlay
  - CONFLICT segments: Subtle red pulse overlay (very subdued)
  - Current time: Vertical glowing beam (aurora-500 glow, 3px wide, extends above and below band)
- **Planet orbit line:** Above the timeline, a thin line showing planetary rulers with glyphs at transition points
- **Best windows panel:** Right side — stacked glass cards (max 3) showing remaining best windows with countdown timers in monospace
- **Time labels:** Below band, monospace text at key hours (9:30, 11:00, 12:00, 1:00, 2:30, 4:00)
- **Legend:** Inline below timeline — horizontal pills with status orbs + label

---

### 4. MacroTimeCycles — "Cosmic Orrery"

**Current:** 8/10 — Good 3-panel layout
**Target:** 9.5/10 — Premium observatory instruments

**Redesign — 3 panels:**

**A) Lunar Arc — "Moon Cycle Tracker"**
- `CosmicGlassCard` with indigo accent
- SVG arc: Increase to 200px wide. Arc track in `rgba(255,255,255,0.06)`. Fill gradient: deep indigo (New) → nebula purple (Waxing) → solar gold (Full) → dark slate (Waning)
- Current position: Glowing dot (12px) with `CosmicArcGauge`-style glow filter + radial halo
- Phase milestones: 4 small glass circles at 0%, 25%, 50%, 75% with moon emoji + phase name
- Center display: "Day 14 / 29" in large monospace with subtle glow

**B) Mercury Cycle — "Retrograde Radar"**
- `CosmicGlassCard` with amber accent
- Orbital ellipse: Premium SVG with gradient stroke (silver → amber → red based on proximity to retrograde)
- Mercury marker: Animated along orbit path with trailing glow
- Status badge: Glass pill with `CosmicStatusOrb` — green for Direct, amber for Shadow, pulsing red for Retrograde
- Countdown: "Next phase in 12d" in monospace below orbit

**C) Weekly Rhythm — "Planetary Week"**
- `CosmicGlassCard` with purple accent
- 7 day cells: Glass circles (not rectangles) with planet glyph inside
- Today: Solar-gold ring glow with breathing animation
- Hover/tap: Shows ally/enemy relationship popup
- Connecting line: Thin line between days showing the "flow" of planetary energy

---

### 5. TradingDayCalendar — "Cosmic Calendar"

**Current:** 7.5/10 — Functional but generic
**Target:** 9.5/10 — Premium observatory calendar

**Redesign:**
- **Container:** `CosmicGlassCard` with emerald accent
- **Week strip:** 7 glass card cells in a row. Each cell:
  - Top: Day abbreviation (Mon, Tue...) in uppercase tracking-widest
  - Center: Date number (large, monospace)
  - Bottom: Planet glyph in accent color
  - Background: Very subtle gradient based on nodeType (emerald wash for aligned, red wash for conflict)
  - Today: Bright ring + "TODAY" chip above
  - Best day: Star badge with solar glow
- **Month grid:** Premium glass cells with:
  - Opacity-based quality visualization (brighter = better alignment)
  - Moon phase emoji overlays on key days
  - Subtle connecting lines showing "energy flow" between high-quality days
  - Current day: Bright ring with subtle radial glow
- **Toggle button:** Glass pill button "Show Month" ↔ "Show Week"

---

### 6. PlanetaryCommandCenter — "Day Ruler Command Deck"

**Current:** 8.5/10 — Strong wheel + tactical panel
**Target:** 10/10 — The crown jewel

**Redesign:**
- **Container:** `CosmicGlassCard variant="elevated"` with amber accent, full-width
- **Command Wheel (left 60%):**
  - Scale SVG to 480×480
  - Wedges: Multi-layer depth treatment:
    - Base layer: Dark fill with subtle radial gradient
    - Color layer: Ally=aurora glow, Enemy=deep red, Neutral=slate, Self=solar gold
    - Highlight layer: Current hour gets animated beam from center with particle trail
  - Center: Large planet sigil (32px) with orbital rings animation around it + day name
  - Outer rim: Thin glowing ring with tick marks at each hour
  - Past hours: 30% opacity + slight desaturation
  - Ally hours (upcoming): Subtle shimmer pulse
- **Tactical Panel (right 40%):**
  - Current status: Large `CosmicStatusOrb` + "ALLY HOUR" / "ENEMY HOUR" text
  - Countdown: "Next Ally in 1h 23m" — large monospace with aurora glow
  - Hour breakdown: 3 `CosmicDataRow` entries (X ally, Y neutral, Z enemy) with orbs
  - Best windows: Top 5 ally hours as stacked glass chips with time ranges
  - Day wisdom: Glass quote card with italic text and planet glyph

---

### 7. NEOCoreReactor — "Alignment Reactor"

**Current:** 7/10 — Basic donut chart
**Target:** 9.5/10 — Premium nuclear reactor visualization

**Redesign:**
- **Container:** `CosmicGlassCard` with emerald/red dynamic accent (based on classification)
- **Reactor SVG (280×280):**
  - Outer ring: 17 arc segments with 2° gaps. Passed = bright color with glow filter. Failed = dark with `rgba(255,255,255,0.05)`
  - **NEW: Inner energy field** — Radial gradient from center that pulses based on score:
    - ULTRA_GREEN: Bright aurora-green emanating from center
    - GREEN: Subtle emerald glow
    - YELLOW: Warm amber inner light
    - RED: No inner glow (dark center)
  - Center circle: Glass effect background. Large score number (text-4xl monospace) + "/17" + classification label
  - Ring decorations: Thin dashed circles at 2 radii creating "containment ring" aesthetic
- **Factor list below:** Replace scrollable list with a premium 2-column grid:
  - Each factor: Glass pill with `CosmicStatusOrb` + factor name
  - Click to expand: Reasoning text slides down in a sunken glass panel
  - Passed factors: White text, bright orb
  - Failed factors: Gray-500 text, dim red orb

---

### 8. CosmicPressureTimeline — "Pressure Spectrum"

**Current:** 6.5/10 — Flat colored blocks
**Target:** 9/10 — Premium depth visualization

**Redesign:**
- **Container:** No separate card — sits alongside NEOCoreReactor
- **Timeline band (full width, 56px tall):**
  - Rounded capsule shape with glass border
  - Hour segments: Gradient fills with soft transitions between adjacent segments (no hard edges)
  - Color blending: Overlapping semi-transparent gradient at segment boundaries
  - Current hour: Glowing vertical beam (like IntradayTimeCycles) with time label
  - Best windows: Subtle gold shimmer overlay
- **Hour labels:** Monospace below, only at key times + current
- **Detail popup:** `CosmicGlassCard variant="sunken"` appearing below when hour is tapped
  - Shows: Planet, Node Type, Trading Guidance, Chinese animal
  - Animated slide-down entry

---

### 9. HoraOrbitWheel — "Temporal Orbit Wheel"

**Current:** 8/10 — Good concentric rings
**Target:** 9.5/10 — Premium multi-ring observatory

**Redesign:**
- **Container:** `CosmicGlassCard` with nebula accent
- **Wheel SVG (460×460):**
  - **Outer ring (Vedic):** 24 wedges with premium gradient fills. Planet glyphs at outer edge in gold text
  - **Middle ring (alignment):** Continuous gradient band showing node types flowing around the wheel (no hard segments — smooth color transitions using SVG linearGradient per arc)
  - **Inner ring (Chinese):** 12 double-width segments with animal emoji labels
  - **Ring separators:** Thin dashed circles with `rgba(255,255,255,0.06)`
  - **Center orb:** Dark glass circle with current hour info:
    - Planet name (large)
    - Animal emoji
    - Node type badge
    - Subtle inner radial glow matching current node type color
  - **Current hour beam:** Triangular pointer from center to outer rim with glow trail
  - **Past hours:** 25% opacity + blur(0.5px) effect
- **Legend:** Below wheel, horizontal pills showing ring layer names

---

### 10. CivilizationCards — "Ancient Wisdom Panels"

**Current:** 7.5/10 — Good themed cards but basic gradients
**Target:** 9/10 — Premium floating panels with depth

**Redesign:**
- **Layout:** Keep 2×2 on mobile, 4×1 on desktop
- **Each card:** `CosmicGlassCard` with civilization-specific accent:
  - Vedic (nebula purple), Babylonian (solar gold), Egyptian (aurora cyan), Chinese (emerald)
- **Card structure:**
  - **Header row:** Large civilization glyph (🕉 𒀭 𓂀 ☯) at 28px + name + `CosmicStatusOrb` for status
  - **Planet/Animal info:** `CosmicDataRow` showing ruling planet/animal
  - **Signal:** Large colored text showing the current signal (planet name, animal, etc.)
  - **Reading:** Gray-400 text with `line-clamp-3`
  - **Background decoration:** Faint civilization-specific SVG pattern at very low opacity (e.g., mandala for Vedic, zigzag for Babylonian, eye of Horus for Egyptian, yin-yang for Chinese) — purely decorative at 3-5% opacity

---

### 11. NumerologyHarmonics — "Number Resonance"

**Current:** 6.5/10 — Tiny dials, minimal visual impact
**Target:** 9/10 — Premium resonance visualization

**Redesign:**
- **Container:** `CosmicGlassCard` with nebula accent
- **Layout:** Replace 4-column micro-dials with a **2×2 premium gauge grid**:
  - Each gauge: `CosmicArcGauge` at 100px size with full premium treatment
  - Personal Day (center position, 20% larger): The hero number with glow
  - Universal Day, Personal Year, Personal Month: Supporting gauges
- **Alignment Day Hero:** When `isAlignmentDay`:
  - Golden border glow on entire card
  - "ALIGNMENT DAY" badge with `CosmicStatusOrb status="special"` + pulse animation
  - Connecting golden line between Personal Day and Universal Day gauges
  - Background shifts to subtle gold-tinted glass
- **Number meaning:** Below gauges, a `CosmicDataRow` showing the current day's numerological meaning (e.g., "Day 7 — Analysis & Reflection")

---

### 12. EnvironmentalGauges — "Earth Sensor Array"

**Current:** 6/10 — Basic arc meter with flat rows
**Target:** 9/10 — Premium sensor dashboard

**Redesign:**
- **Container:** `CosmicGlassCard` with dynamic accent (emerald/amber/red based on overallStatus)
- **Layout:** Replace simple flex with a **3-gauge array**:
  - **K-Index gauge:** `CosmicArcGauge` (140px) — 0-9 scale, color shifts from emerald through amber to red
  - **Schumann gauge:** `CosmicArcGauge` (100px) — normalized display with 3 states (normal=emerald, elevated=amber, disrupted=red)
  - **Solar flare indicator:** `CosmicStatusOrb size="lg"` — emerald for quiet, pulsing red for active with flare class badge
- **Overall status bar:** Bottom row — glass pill spanning full width with `CosmicStatusOrb` + status text + trading impact
- **Premium detail:** Each gauge has a subtle label below + small value readout
- **Active state (amber/red):** Entire card gets a subtle warning vignette — radial gradient from transparent center to `rgba(red, 0.05)` edge

---

### 13. ConstellationRing — "Star Map"

**Current:** 7/10 — Good SVG ring
**Target:** 9.5/10 — Premium constellation visualization

**Redesign:**
- **Container:** `CosmicGlassCard` with nebula accent
- **Ring SVG (480×480):**
  - **Star nodes:** Replace circles with actual 4-point or 6-point star shapes
    - Passed: Bright white/nebula with multi-layer glow (inner bright core + outer soft halo)
    - Failed: Dim red dot with no glow
  - **Constellation lines:** Gradient lines connecting passed factors (nebula-500 at 20% opacity, thicker 1.2px)
  - **Name labels:** Curved text along the outer edge for each factor name (subtle, gray-500, 8px)
  - **Background rings:** Two concentric dashed circles + faint radial grid lines creating a "star chart" coordinate system
  - **Center display:** Glass circle with:
    - Score: Large monospace number
    - Ring: Mini arc gauge showing fill percentage
    - Classification label
- **Factor detail:** Click a star → Detail slides up below ring showing name + reasoning in a `CosmicGlassCard variant="sunken"`

---

### 14. NextHoraCountdown — "Hora Beacon" (if rendered)

**Current:** 8/10 — Clean countdown
**Target:** 9/10 — Premium beacon

**Note:** Currently not rendered in main orchestrator (removed in Task 17). If re-added:
- **Container:** `CosmicGlassCard` with dynamic accent (aurora for ally, red for enemy)
- **Countdown display:** Extra-large monospace (text-6xl) with animated glow matching status
- **Planet info:** Glass pill with planet glyph + name
- **Orbital decoration:** Small rotating ring around the countdown number
- **Status orb:** Large `CosmicStatusOrb` next to countdown

---

## Part 3: Cross-Cutting Enhancements

### Background Treatment
- Add `CosmicConstellationBg density="sparse"` to the overall dashboard container (behind all zones)
- Each zone gets a subtle radial gradient vignette at the top matching its accent color

### Animation Performance
- Replace all `setInterval` animations with `requestAnimationFrame` via a shared `useAnimationFrame` hook
- Use CSS `will-change: transform, opacity` on animated elements
- Prefer CSS animations over JS for simple opacity/scale cycles
- Framer Motion: Use `layout` prop for smooth reflows

### Typography Upgrade
- Numbers: `font-mono tabular-nums` with `letter-spacing: 0.05em`
- Labels: `text-xs uppercase tracking-[0.15em] text-gray-500`
- Values: `text-sm font-semibold text-white`
- Headers: Already handled by CosmicSectionShell

### Mobile Responsiveness
- All glass cards: Full-width on mobile with reduced padding (p-3 vs p-5)
- SVG wheels: `max-w-[320px] mx-auto` on mobile with touch-friendly tap targets (min 44px)
- Grid layouts: Single column on mobile, 2 cols on tablet, full on desktop
- Gauges: Scale down 20% on mobile

### Accessibility
- All interactive elements: `focus-visible:ring-2 ring-aurora-500/50 ring-offset-2 ring-offset-cosmic-950`
- Color-coded info always has text/icon accompaniment (never color-only)
- Reduced motion: `@media (prefers-reduced-motion: reduce)` disables all breathing/pulse animations

---

## New Files
```
src/components/CosmicDashboard/
  shared/
    CosmicGlassCard.tsx           (Primitive 1)
    CosmicArcGauge.tsx            (Primitive 2)
    CosmicStatusOrb.tsx           (Primitive 3)
    CosmicDataRow.tsx             (Primitive 4)
    CosmicConstellationBg.tsx     (Primitive 5)
  hooks/
    useAnimationFrame.ts          (Performance hook)
```

## Modified Files (14 components)
```
SoulBlueprintIdentityBar.tsx     — Full restructure with constellation layout
MoonPhaseHero.tsx                — Enhanced moon SVG + atmosphere layers
IntradayTimeCycles.tsx           — Depth band timeline + glass best-windows
MacroTimeCycles.tsx              — Premium orrery instruments
TradingDayCalendar.tsx           — Glass cell calendar
PlanetaryCommandCenter.tsx       — Premium command wheel + tactical panel
NEOCoreReactor.tsx               — Reactor visualization + energy field
CosmicPressureTimeline.tsx       — Smooth gradient spectrum
HoraOrbitWheel.tsx               — Multi-ring observatory
CivilizationCards.tsx            — Ancient wisdom glass panels
NumerologyHarmonics.tsx          — Number resonance gauges
EnvironmentalGauges.tsx          — Earth sensor array
ConstellationRing.tsx            — Star map visualization
NextHoraCountdown.tsx            — Hora beacon (if used)
```

## MarketTimingGuide — No Changes
Per user direction, this component is fine as-is.

---

## Technical Notes
- All new primitives: Pure React + Tailwind + inline SVG. No new dependencies.
- CosmicGlassCard uses `backdrop-filter: blur()` — well-supported in modern browsers
- SVG glow filters: Defined once in a shared `<defs>` and referenced by URL
- `useAnimationFrame` hook: Wraps `requestAnimationFrame` with cleanup and pause-on-hidden-tab
- All constellation backgrounds: Pre-computed random positions (seeded for consistency)
- Estimated component count: ~6 new files, ~14 modified files
