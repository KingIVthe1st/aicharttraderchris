# Cosmic Timing Premium Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild every Cosmic Timing module with a "Deep Space Observatory" premium aesthetic using shared glass-card primitives, premium SVG gauges, status orbs, and constellation backgrounds.

**Architecture:** 6 new shared primitives (CosmicGlassCard, CosmicArcGauge, CosmicStatusOrb, CosmicDataRow, CosmicConstellationBg, useAnimationFrame), then 14 component full-restructures that compose from these primitives. Each component gets multi-layer frosted glass panels, SVG glow filters, breathing animations, and premium typography.

**Tech Stack:** React 18, TypeScript, Tailwind CSS (with existing cosmic/nebula/aurora/solar color tokens), Framer Motion v12, inline SVG with `<defs>` filters.

**Design doc:** `docs/plans/2026-03-04-cosmic-premium-redesign-design.md`

---

## Task Dependencies

```
Tasks 1-6: Foundation primitives (all independent, can run in parallel)
Tasks 7-20: Component rewrites (all depend on Tasks 1-6 being complete, but are independent of each other)
```

**Parallel batches:**
- Batch 1: Tasks 1, 2, 3, 4, 5, 6 (all primitives)
- Batch 2: Tasks 7, 8, 9, 10 (first 4 component rewrites)
- Batch 3: Tasks 11, 12, 13, 14 (next 4 component rewrites)
- Batch 4: Tasks 15, 16, 17, 18 (next 4 component rewrites)
- Batch 5: Task 19 (orchestrator update), Task 20 (build + deploy)

---

### Task 1: CosmicGlassCard Primitive

**Files:**
- Create: `src/components/CosmicDashboard/shared/CosmicGlassCard.tsx`

**Context:** This is THE foundational primitive. Every component in the dashboard will wrap its content in this. It replaces all flat `bg-gray-900 border-gray-700/50 rounded-2xl` cards with multi-layer frosted glass panels.

**Existing patterns to follow:**
- Look at `src/components/CosmicDashboard/shared/CosmicSectionShell.tsx` for component structure conventions
- The project uses Tailwind CSS utility classes (no CSS modules)
- Import convention: `import CosmicGlassCard from './shared/CosmicGlassCard'`

**Step 1: Create the component**

```tsx
// src/components/CosmicDashboard/shared/CosmicGlassCard.tsx
import { type ReactNode } from 'react';

const ACCENT_COLORS: Record<string, { border: string; glow: string; line: string }> = {
  nebula:  { border: 'border-[#6D5BFF]/15 hover:border-[#6D5BFF]/25', glow: '0 0 30px rgba(109,91,255,0.08)',  line: 'bg-[#6D5BFF]/30' },
  aurora:  { border: 'border-[#2EC5FF]/15 hover:border-[#2EC5FF]/25', glow: '0 0 30px rgba(46,197,255,0.08)',  line: 'bg-[#2EC5FF]/30' },
  solar:   { border: 'border-[#F6C453]/15 hover:border-[#F6C453]/25', glow: '0 0 30px rgba(246,196,83,0.08)',  line: 'bg-[#F6C453]/30' },
  emerald: { border: 'border-emerald-500/15 hover:border-emerald-500/25', glow: '0 0 30px rgba(16,185,129,0.08)', line: 'bg-emerald-500/30' },
  red:     { border: 'border-red-500/15 hover:border-red-500/25',     glow: '0 0 30px rgba(239,68,68,0.08)',   line: 'bg-red-500/30' },
  amber:   { border: 'border-amber-500/15 hover:border-amber-500/25', glow: '0 0 30px rgba(245,158,11,0.08)',  line: 'bg-amber-500/30' },
  indigo:  { border: 'border-indigo-500/15 hover:border-indigo-500/25', glow: '0 0 30px rgba(99,102,241,0.08)', line: 'bg-indigo-500/30' },
};

const VARIANT_STYLES = {
  default: {
    glass: 'bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-transparent backdrop-blur-xl',
    shadow: '0 4px 16px rgba(0,0,0,0.2)',
  },
  elevated: {
    glass: 'bg-gradient-to-br from-white/[0.06] via-white/[0.03] to-transparent backdrop-blur-xl',
    shadow: '0 8px 32px rgba(0,0,0,0.4)',
  },
  sunken: {
    glass: 'bg-gradient-to-br from-white/[0.02] via-white/[0.01] to-transparent backdrop-blur-lg',
    shadow: 'inset 0 2px 8px rgba(0,0,0,0.3)',
  },
};

interface CosmicGlassCardProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'sunken';
  accentColor?: keyof typeof ACCENT_COLORS;
  glowIntensity?: 'none' | 'subtle' | 'medium' | 'strong';
  className?: string;
  noPadding?: boolean;
}

export default function CosmicGlassCard({
  children,
  variant = 'default',
  accentColor = 'nebula',
  glowIntensity = 'subtle',
  className = '',
  noPadding = false,
}: CosmicGlassCardProps) {
  const accent = ACCENT_COLORS[accentColor] ?? ACCENT_COLORS.nebula;
  const v = VARIANT_STYLES[variant];

  const glowMultiplier = { none: 0, subtle: 1, medium: 2, strong: 3 }[glowIntensity];
  const boxShadow = glowMultiplier === 0
    ? v.shadow
    : `${v.shadow}, ${accent.glow.replace('0.08', String(0.08 * glowMultiplier))}`;

  return (
    <div
      className={`relative rounded-2xl ${accent.border} ${v.glass} transition-colors duration-300 ${noPadding ? '' : 'p-5'} ${className}`}
      style={{ boxShadow }}
    >
      {/* Top-left accent line */}
      <div className={`absolute top-0 left-6 w-10 h-[2px] rounded-full ${accent.line}`} />
      {children}
    </div>
  );
}
```

**Step 2: Verify build**

Run: `cd /Users/ivanjackson/Desktop/aicharttraderchris && npx tsc --noEmit 2>&1 | head -20`
Expected: No errors related to CosmicGlassCard

**Step 3: Commit**

```bash
git add src/components/CosmicDashboard/shared/CosmicGlassCard.tsx
git commit -m "feat: add CosmicGlassCard premium glass panel primitive"
```

---

### Task 2: CosmicArcGauge Primitive

**Files:**
- Create: `src/components/CosmicDashboard/shared/CosmicArcGauge.tsx`

**Context:** Reusable arc/ring gauge with SVG glow effects. Used by EnvironmentalGauges (3 gauges), NumerologyHarmonics (4 gauges), ConstellationRing (center mini gauge), and NEOCoreReactor (could reuse ring logic). This replaces all ad-hoc SVG arc implementations.

**Step 1: Create the component**

```tsx
// src/components/CosmicDashboard/shared/CosmicArcGauge.tsx
import { useId } from 'react';
import { motion } from 'framer-motion';

interface CosmicArcGaugeProps {
  value: number;          // 0-1 normalized
  size?: number;          // px, default 120
  strokeWidth?: number;   // default 8
  color: string;          // hex color for fill arc
  label?: string;         // center text (the big number/value)
  sublabel?: string;      // below center
  showGlow?: boolean;     // default true
  animate?: boolean;      // default true
}

export default function CosmicArcGauge({
  value,
  size = 120,
  strokeWidth = 8,
  color,
  label,
  sublabel,
  showGlow = true,
  animate = true,
}: CosmicArcGaugeProps) {
  const id = useId();
  const center = size / 2;
  const radius = center - strokeWidth - 4; // leave room for glow
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75; // 270° arc
  const filledLength = arcLength * Math.min(1, Math.max(0, value));

  // Arc starts at 135° (bottom-left) and sweeps 270° clockwise
  const startAngle = 135;

  // Lighter variant of color for gradient end
  const lighterColor = color + '99'; // 60% opacity version

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-[0deg]"
      >
        <defs>
          {showGlow && (
            <filter id={`glow-${id}`}>
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
          <linearGradient id={`grad-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={lighterColor} />
          </linearGradient>
        </defs>

        {/* Track ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(${startAngle} ${center} ${center})`}
        />

        {/* Tick marks at 25%, 50%, 75% */}
        {[0.25, 0.5, 0.75].map((pct) => {
          const angle = startAngle + 270 * pct;
          const rad = (angle * Math.PI) / 180;
          const outerR = radius + strokeWidth / 2 + 2;
          const innerR = radius - strokeWidth / 2 - 2;
          return (
            <line
              key={pct}
              x1={center + innerR * Math.cos(rad)}
              y1={center + innerR * Math.sin(rad)}
              x2={center + outerR * Math.cos(rad)}
              y2={center + outerR * Math.sin(rad)}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={1}
            />
          );
        })}

        {/* Value ring */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#grad-${id})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          transform={`rotate(${startAngle} ${center} ${center})`}
          filter={showGlow ? `url(#glow-${id})` : undefined}
          initial={animate ? { strokeDashoffset: arcLength } : { strokeDashoffset: arcLength - filledLength }}
          animate={{ strokeDashoffset: arcLength - filledLength }}
          transition={animate ? { duration: 1.2, ease: [0.34, 1.56, 0.64, 1] } : { duration: 0 }}
        />
      </svg>

      {/* Center text */}
      {(label || sublabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {label && (
            <span
              className="font-mono font-black tabular-nums tracking-wider text-white"
              style={{ fontSize: size * 0.22, textShadow: `0 0 10px ${color}40` }}
            >
              {label}
            </span>
          )}
          {sublabel && (
            <span className="text-gray-500 uppercase tracking-widest" style={{ fontSize: size * 0.08 }}>
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Verify build**

Run: `cd /Users/ivanjackson/Desktop/aicharttraderchris && npx tsc --noEmit 2>&1 | head -20`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/CosmicDashboard/shared/CosmicArcGauge.tsx
git commit -m "feat: add CosmicArcGauge premium SVG gauge primitive"
```

---

### Task 3: CosmicStatusOrb Primitive

**Files:**
- Create: `src/components/CosmicDashboard/shared/CosmicStatusOrb.tsx`

**Context:** Premium status indicator replacing all flat colored dots and basic status badges throughout the dashboard. Used extensively in NEOCoreReactor factor list, CivilizationCards status, EnvironmentalGauges status, PlanetaryCommandCenter status, and NumerologyHarmonics alignment badge.

**Step 1: Create the component**

```tsx
// src/components/CosmicDashboard/shared/CosmicStatusOrb.tsx
const STATUS_COLORS = {
  positive: { core: '#10B981', glow: 'rgba(16,185,129,0.5)', ring: 'rgba(16,185,129,0.2)' },
  neutral:  { core: '#94A3B8', glow: 'rgba(148,163,184,0.3)', ring: 'rgba(148,163,184,0.1)' },
  negative: { core: '#EF4444', glow: 'rgba(239,68,68,0.5)',  ring: 'rgba(239,68,68,0.2)' },
  special:  { core: '#F6C453', glow: 'rgba(246,196,83,0.5)',  ring: 'rgba(246,196,83,0.2)' },
};

const SIZES = { sm: 8, md: 12, lg: 16 };

interface CosmicStatusOrbProps {
  status: 'positive' | 'neutral' | 'negative' | 'special';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  label?: string;
}

export default function CosmicStatusOrb({
  status,
  size = 'md',
  pulse = false,
  label,
}: CosmicStatusOrbProps) {
  const s = SIZES[size];
  const c = STATUS_COLORS[status];

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="relative inline-block rounded-full flex-shrink-0"
        style={{ width: s, height: s }}
      >
        {/* Outer glow ring */}
        <span
          className={`absolute inset-[-3px] rounded-full ${pulse ? 'animate-pulse' : ''}`}
          style={{ background: `radial-gradient(circle, ${c.ring} 0%, transparent 70%)` }}
        />
        {/* Core dot */}
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at 40% 35%, ${c.core}, ${c.core}90)`,
            boxShadow: `0 0 ${s}px ${c.glow}`,
          }}
        />
      </span>
      {label && (
        <span className="text-xs font-medium text-gray-300">{label}</span>
      )}
    </span>
  );
}
```

**Step 2: Verify build**

Run: `cd /Users/ivanjackson/Desktop/aicharttraderchris && npx tsc --noEmit 2>&1 | head -20`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/CosmicDashboard/shared/CosmicStatusOrb.tsx
git commit -m "feat: add CosmicStatusOrb premium status indicator primitive"
```

---

### Task 4: CosmicDataRow Primitive

**Files:**
- Create: `src/components/CosmicDashboard/shared/CosmicDataRow.tsx`

**Context:** Premium key-value data display row. Used in SoulBlueprintIdentityBar (Chinese zodiac, planetary ruler, nakshatra), PlanetaryCommandCenter (ally/neutral/enemy counts), NEOCoreReactor (factor items), and other components that display labeled data pairs.

**Step 1: Create the component**

```tsx
// src/components/CosmicDashboard/shared/CosmicDataRow.tsx
import CosmicStatusOrb from './CosmicStatusOrb';

interface CosmicDataRowProps {
  icon?: string;
  label: string;
  value: string | number;
  valueColor?: string;
  sublabel?: string;
  badge?: { text: string; variant: 'positive' | 'neutral' | 'negative' | 'special' };
  noBorder?: boolean;
}

export default function CosmicDataRow({
  icon,
  label,
  value,
  valueColor,
  sublabel,
  badge,
  noBorder = false,
}: CosmicDataRowProps) {
  return (
    <div
      className={`flex items-center gap-3 py-2 ${noBorder ? '' : 'border-b border-white/[0.04]'}`}
    >
      {icon && (
        <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-sm flex-shrink-0">
          {icon}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <span className="text-[10px] uppercase tracking-[0.15em] text-gray-500">{label}</span>
        {sublabel && <span className="text-[9px] text-gray-600 ml-1.5">{sublabel}</span>}
      </div>
      <div className="flex items-center gap-2">
        <span
          className="text-sm font-semibold font-mono tabular-nums"
          style={{ color: valueColor ?? '#fff' }}
        >
          {value}
        </span>
        {badge && (
          <CosmicStatusOrb status={badge.variant} size="sm" label={badge.text} />
        )}
      </div>
    </div>
  );
}
```

**Step 2: Verify build**

Run: `cd /Users/ivanjackson/Desktop/aicharttraderchris && npx tsc --noEmit 2>&1 | head -20`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/CosmicDashboard/shared/CosmicDataRow.tsx
git commit -m "feat: add CosmicDataRow premium data display primitive"
```

---

### Task 5: CosmicConstellationBg Primitive

**Files:**
- Create: `src/components/CosmicDashboard/shared/CosmicConstellationBg.tsx`

**Context:** Decorative background layer with randomized star dots and connecting constellation lines. Used behind the main dashboard container and individual components like SoulBlueprintIdentityBar. Must be `pointer-events-none` and `position: absolute` so it doesn't interfere with interactive content.

**Step 1: Create the component**

```tsx
// src/components/CosmicDashboard/shared/CosmicConstellationBg.tsx
import { useMemo } from 'react';

interface CosmicConstellationBgProps {
  density?: 'sparse' | 'medium' | 'dense';
  color?: string;
  animated?: boolean;
}

// Seeded pseudo-random for consistent star positions across renders
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export default function CosmicConstellationBg({
  density = 'sparse',
  color = 'rgba(255,255,255,0.08)',
  animated = false,
}: CosmicConstellationBgProps) {
  const count = { sparse: 20, medium: 40, dense: 60 }[density];

  const { stars, lines } = useMemo(() => {
    const rng = seededRandom(42);
    const s = Array.from({ length: count }, () => ({
      x: rng() * 100,
      y: rng() * 100,
      r: 0.5 + rng() * 1.5,
    }));

    // Connect stars that are within 25% distance of each other
    const l: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i < s.length; i++) {
      for (let j = i + 1; j < s.length; j++) {
        const dx = s[i].x - s[j].x;
        const dy = s[i].y - s[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 25 && l.length < count * 0.6) {
          l.push({ x1: s[i].x, y1: s[i].y, x2: s[j].x, y2: s[j].y });
        }
      }
    }
    return { stars: s, lines: l };
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className={`w-full h-full ${animated ? 'animate-constellation-drift' : ''}`}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Constellation lines */}
        {lines.map((ln, i) => (
          <line
            key={`l-${i}`}
            x1={ln.x1}
            y1={ln.y1}
            x2={ln.x2}
            y2={ln.y2}
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="0.15"
          />
        ))}
        {/* Star dots */}
        {stars.map((star, i) => (
          <circle
            key={`s-${i}`}
            cx={star.x}
            cy={star.y}
            r={star.r * 0.3}
            fill={color}
          />
        ))}
      </svg>
    </div>
  );
}
```

**Step 2: Verify build**

Run: `cd /Users/ivanjackson/Desktop/aicharttraderchris && npx tsc --noEmit 2>&1 | head -20`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/CosmicDashboard/shared/CosmicConstellationBg.tsx
git commit -m "feat: add CosmicConstellationBg decorative star field primitive"
```

---

### Task 6: useAnimationFrame Hook

**Files:**
- Create: `src/components/CosmicDashboard/hooks/useAnimationFrame.ts`

**Context:** Performance hook to replace all `setInterval` based animations (rotating halos in MoonPhaseHero, time cursors in IntradayTimeCycles, countdowns in PlanetaryCommandCenter). Uses `requestAnimationFrame` with automatic pause when tab is hidden.

**Step 1: Create the hook**

```ts
// src/components/CosmicDashboard/hooks/useAnimationFrame.ts
import { useEffect, useRef, useCallback } from 'react';

/**
 * Runs a callback on every animation frame. Automatically pauses when
 * the browser tab is hidden. Returns elapsed time in ms to callback.
 */
export function useAnimationFrame(
  callback: (elapsed: number) => void,
  enabled: boolean = true,
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const startRef = useRef<number | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    startRef.current = null;

    const tick = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      callbackRef.current(timestamp - startRef.current);
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [enabled]);
}

/**
 * Returns a value that updates every second (for countdowns).
 * More efficient than setInterval — only re-renders when the
 * derived value actually changes.
 */
export function useCountdown(targetTime: number | null): string {
  const ref = useRef<HTMLSpanElement>(null);

  const format = useCallback((ms: number) => {
    if (ms <= 0) return '00:00';
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, []);

  useAnimationFrame(() => {
    if (!targetTime || !ref.current) return;
    const remaining = targetTime - Date.now();
    ref.current.textContent = format(remaining);
  }, targetTime !== null);

  // Return initial value for SSR/first render
  return targetTime ? format(targetTime - Date.now()) : '00:00';
}
```

**Step 2: Verify build**

Run: `cd /Users/ivanjackson/Desktop/aicharttraderchris && npx tsc --noEmit 2>&1 | head -20`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/CosmicDashboard/hooks/useAnimationFrame.ts
git commit -m "feat: add useAnimationFrame performance hook"
```

---

### Task 7: SoulBlueprintIdentityBar — Premium Redesign

**Files:**
- Modify: `src/components/CosmicDashboard/SoulBlueprintIdentityBar.tsx`

**Context:** Currently a 163-line component with flat gradient bar, text badges for zodiac signs, and basic alignment chips. Redesign as "Cosmic Identity Beacon" with CosmicGlassCard elevated variant, triangular zodiac constellation, CosmicDataRow for metadata, and premium life path glow.

**Design reference:** Section 1 of design doc — "Cosmic Identity Beacon"

**Step 1: Rewrite the component**

Replace the entire file content. The new component should:

1. Import `CosmicGlassCard`, `CosmicDataRow`, `CosmicConstellationBg`, `CosmicInfoTooltip`, and `COSMIC_TOOLTIPS`
2. Wrap everything in `<CosmicGlassCard variant="elevated" accentColor="nebula" glowIntensity="medium">`
3. Add `<CosmicConstellationBg density="sparse" />` as first child (relative container needed)
4. Layout: `flex flex-col lg:flex-row gap-6 items-center`
5. **Life Path Hero (left section):**
   - SVG glow filter behind the large number
   - `text-7xl lg:text-8xl font-black font-mono` with gradient text `bg-gradient-to-r from-[#6D5BFF] to-[#2EC5FF] bg-clip-text text-transparent`
   - Archetype label below in uppercase tracking-widest
   - Full name below that in gray-400
6. **Identity Constellation (center):**
   - 3 glass circles (80×80) arranged in triangle: Sun top, Moon bottom-left, Rising bottom-right
   - Each circle: `bg-white/5 border border-white/10 rounded-full` with sign glyph + sign name
   - Thin SVG lines connecting the three circles (constellation effect)
   - Each has `CosmicInfoTooltip` wrapping
7. **Cosmic Metadata (right):**
   - Stack of `CosmicDataRow` entries for Chinese zodiac, planetary ruler, nakshatra
   - Each with appropriate emoji icon
8. **Alignment Strip (bottom, full-width):**
   - 9 number circles (1-9) in a row
   - Personal day number gets: `bg-[#F6C453]/20 border-[#F6C453]/50 text-[#F6C453]` + `animate-pulse`
   - Alignment day: entire strip gets a `border-t border-[#F6C453]/20` golden shimmer

Keep all existing tooltip placements from the UX overhaul (life path, sun sign, moon sign, rising sign, planetary ruler, nakshatra).

**Step 2: Verify build**

Run: `cd /Users/ivanjackson/Desktop/aicharttraderchris && npx tsc --noEmit 2>&1 | head -20`
Expected: No errors

**Step 3: Visual smoke test**

Run: `cd /Users/ivanjackson/Desktop/aicharttraderchris && npm run build 2>&1 | tail -5`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/CosmicDashboard/SoulBlueprintIdentityBar.tsx
git commit -m "feat: redesign SoulBlueprintIdentityBar with premium glass + constellation layout"
```

---

### Task 8: MoonPhaseHero — Premium Redesign

**Files:**
- Modify: `src/components/CosmicDashboard/MoonPhaseHero.tsx`

**Context:** Currently 192 lines. Already the strongest component (8.5/10). Enhancement focuses on multi-layer atmosphere effect on the moon SVG, better illumination display, and wrapping in CosmicGlassCard.

**Design reference:** Section 2 of design doc — "Lunar Observatory"

**Step 1: Rewrite the component**

Key changes to the existing component:

1. Wrap in `<CosmicGlassCard variant="elevated" accentColor="indigo" glowIntensity="medium">`
2. **Moon SVG enhancements (scale to 280×280):**
   - Add outer glow: `<circle>` with `radialGradient` halo extending 40px beyond moon radius, fill at 10% opacity of indigo
   - Replace hard clip-path terminator with soft gradient: Use `<linearGradient>` on the shadow overlay so the light/dark boundary is feathered (not a hard edge)
   - Add `<filter>` with `feTurbulence` + `feDisplacementMap` at very low scale for subtle surface texture on lit portion
3. **Illumination display:** Scale to `text-5xl font-mono font-black tabular-nums` with `%` as `text-2xl` superscript
4. **Moon sign badge:** Replace basic badge with glass pill: `bg-white/5 border border-white/10 rounded-full px-4 py-1.5` with zodiac glyph + sign name + colored dot
5. **VOC indicator enhancement:** When void, add `<circle>` with `radialGradient` from `rgba(239,68,68,0.15)` edge creating red vignette
6. **Phase name:** `bg-gradient-to-r from-[#2EC5FF] to-[#6D5BFF] bg-clip-text text-transparent font-bold`
7. Replace `setInterval` halo rotation with `useAnimationFrame` hook
8. Keep all existing tooltips

**Step 2: Verify build**

Run: `cd /Users/ivanjackson/Desktop/aicharttraderchris && npm run build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/CosmicDashboard/MoonPhaseHero.tsx
git commit -m "feat: redesign MoonPhaseHero with premium atmosphere layers + glass card"
```

---

### Task 9: EnvironmentalGauges — Premium Redesign

**Files:**
- Modify: `src/components/CosmicDashboard/EnvironmentalGauges.tsx`

**Context:** Currently 99 lines and the weakest component (6/10). Basic arc meter with flat data rows. Complete restructure into "Earth Sensor Array" with 3 premium gauges.

**Design reference:** Section 12 of design doc — "Earth Sensor Array"

**Step 1: Rewrite the component**

Replace the entire file. New structure:

1. Import `CosmicGlassCard`, `CosmicArcGauge`, `CosmicStatusOrb`, `CosmicInfoTooltip`, `COSMIC_TOOLTIPS`
2. Dynamic accent: `accentColor` based on `env.overallStatus` — 'emerald' for green, 'amber' for amber, 'red' for red
3. Layout: `grid grid-cols-1 md:grid-cols-3 gap-4` for the 3 gauges
4. **K-Index gauge:**
   - `<CosmicArcGauge value={env.kIndex / 9} size={140} color={kColor} label={String(env.kIndex)} sublabel="K-INDEX" />`
   - `kColor`: emerald for 0-3, amber for 4-5, red for 6+
   - `CosmicInfoTooltip` for K-Index explanation
5. **Schumann gauge:**
   - `<CosmicArcGauge value={schumannNorm} size={100} color={schumannColor} label={schumannLabel} sublabel="SCHUMANN" />`
   - schumannNorm: 0.33 for normal, 0.66 for elevated, 1.0 for disrupted
   - Wrapped in CosmicInfoTooltip
6. **Solar flare indicator:**
   - `<CosmicStatusOrb size="lg" status={env.solarFlareActive ? 'negative' : 'positive'} pulse={env.solarFlareActive} />`
   - Label: "ACTIVE" or "QUIET", with flare class badge if active
   - Wrapped in CosmicInfoTooltip
7. **Overall status bar (bottom):**
   - Full-width glass pill: `bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2`
   - `CosmicStatusOrb` + status text + trading impact text
8. **Warning vignette (when amber/red):**
   - Absolute overlay with `radial-gradient(ellipse at center, transparent 50%, rgba(239,68,68,0.05) 100%)`

**Step 2: Verify build**

Run: `cd /Users/ivanjackson/Desktop/aicharttraderchris && npm run build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/CosmicDashboard/EnvironmentalGauges.tsx
git commit -m "feat: redesign EnvironmentalGauges with premium 3-gauge sensor array"
```

---

### Task 10: NumerologyHarmonics — Premium Redesign

**Files:**
- Modify: `src/components/CosmicDashboard/NumerologyHarmonics.tsx`

**Context:** Currently 85 lines, rated 6.5/10. Tiny micro-dials with minimal visual impact. Redesign as "Number Resonance" with 2×2 premium gauge grid.

**Design reference:** Section 11 of design doc — "Number Resonance"

**Step 1: Rewrite the component**

Replace the entire file. New structure:

1. Import `CosmicGlassCard`, `CosmicArcGauge`, `CosmicStatusOrb`, `CosmicDataRow`, `CosmicInfoTooltip`, `COSMIC_TOOLTIPS`
2. Container: `CosmicGlassCard accentColor={isAlignmentDay ? 'solar' : 'nebula'} glowIntensity={isAlignmentDay ? 'strong' : 'subtle'}`
3. **Header:** Title + alignment badge when `isAlignmentDay`
   - Badge: `CosmicStatusOrb status="special" pulse label="ALIGNMENT DAY"`
4. **Gauge grid:** `grid grid-cols-2 gap-4 justify-items-center`
   - Personal Day: `CosmicArcGauge size={120} value={numerology.personalDay/9} color={isAlignmentDay ? '#F6C453' : '#8B7AFF'} label={String(numerology.personalDay)} sublabel="PERSONAL DAY"`
   - Universal Day: `CosmicArcGauge size={100} value={numerology.universalDay/9} color="#5DD8FF" label={String(numerology.universalDay)} sublabel="UNIVERSAL DAY"`
   - Personal Year: `CosmicArcGauge size={100} value={numerology.personalYear/9} color="#A855F7" label={String(numerology.personalYear)} sublabel="PERSONAL YEAR"`
   - Personal Month: `CosmicArcGauge size={100} value={numerology.personalMonth/9} color="#22C55E" label={String(numerology.personalMonth)} sublabel="PERSONAL MONTH"`
5. **Alignment golden line:** When `isAlignmentDay`, draw a thin SVG line connecting Personal Day and Universal Day gauges (positioned absolutely)
6. **Number meaning row:** `CosmicDataRow icon="✨" label="Today's Vibration" value={DAY_MEANINGS[numerology.personalDay]}`
   - Add a `DAY_MEANINGS` constant: `{1:'Leadership & Initiative', 2:'Cooperation & Patience', 3:'Expression & Creativity', 4:'Foundation & Discipline', 5:'Change & Freedom', 6:'Harmony & Responsibility', 7:'Analysis & Reflection', 8:'Power & Abundance', 9:'Completion & Wisdom'}`
7. Keep all existing tooltips

**Step 2: Verify build**

Run: `cd /Users/ivanjackson/Desktop/aicharttraderchris && npm run build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/CosmicDashboard/NumerologyHarmonics.tsx
git commit -m "feat: redesign NumerologyHarmonics with premium 2x2 gauge grid"
```

---

### Task 11: CosmicPressureTimeline — Premium Redesign

**Files:**
- Modify: `src/components/CosmicDashboard/CosmicPressureTimeline.tsx`

**Context:** Currently 107 lines, rated 6.5/10. Flat colored blocks with hard edges. Redesign as "Pressure Spectrum" with smooth gradient transitions and premium depth.

**Design reference:** Section 8 of design doc — "Pressure Spectrum"

**Step 1: Rewrite the component**

Key changes:

1. Import `CosmicGlassCard`, `CosmicInfoTooltip`, `COSMIC_TOOLTIPS`, `useInteractiveSelection`
2. **Timeline band:** Replace `h-14 flex` with a premium capsule shape:
   - Container: `relative h-14 rounded-full overflow-hidden bg-white/[0.03] border border-white/[0.06]`
   - Each segment: `absolute top-0 bottom-0` positioned by percentage of total hours, with `background: linear-gradient(to right, fromColor, toColor)` where `toColor` blends with the next segment's color
   - No hard borders between segments — use overlapping semi-transparent gradients
3. **Current time beam:** Vertical line positioned absolutely at current time percentage:
   - `w-[3px] bg-gradient-to-b from-transparent via-[#2EC5FF] to-transparent`
   - Glow: `box-shadow: 0 0 8px rgba(46,197,255,0.6)`
   - Extends 8px above and below the band
4. **Hour labels:** Only at key times (every 4th hour + current), monospace `text-[9px] text-gray-500`
5. **Detail popup:** When hour is tapped, show `CosmicGlassCard variant="sunken"` below with planet, node type, trading guidance
6. Keep existing `useInteractiveSelection` pattern
7. Keep existing tooltip

**Step 2: Verify build**

Run: `cd /Users/ivanjackson/Desktop/aicharttraderchris && npm run build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/CosmicDashboard/CosmicPressureTimeline.tsx
git commit -m "feat: redesign CosmicPressureTimeline with smooth gradient spectrum"
```

---

### Task 12: NEOCoreReactor — Premium Redesign

**Files:**
- Modify: `src/components/CosmicDashboard/NEOCoreReactor.tsx`

**Context:** Currently 139 lines, rated 7/10. Basic donut chart with scrollable factor list. Redesign as "Alignment Reactor" with inner energy field, containment rings, and 2-column factor grid.

**Design reference:** Section 7 of design doc — "Alignment Reactor"

**Step 1: Rewrite the component**

Key changes:

1. Import `CosmicGlassCard`, `CosmicStatusOrb`, `CosmicInfoTooltip`, `COSMIC_TOOLTIPS`, `useInteractiveSelection`
2. Dynamic accent: `accentColor` based on classification — 'emerald' for ULTRA_GREEN/GREEN, 'amber' for YELLOW, 'red' for RED
3. **Reactor SVG (scale to 280×280):**
   - Keep 17 arc segments with 2° gaps
   - Passed segments: Add `filter` with `feGaussianBlur stdDeviation=3` for glow
   - Failed segments: `rgba(255,255,255,0.05)` fill (dimmer than current)
   - **NEW inner energy field:** `<circle>` with `radialGradient`:
     - ULTRA_GREEN: `rgba(16,185,129,0.2)` → `transparent` with `animate-pulse` (4s)
     - GREEN: `rgba(34,197,94,0.1)` → `transparent`
     - YELLOW: `rgba(245,158,11,0.08)` → `transparent`
     - RED: no gradient (just dark center)
   - **Containment rings:** Two dashed `<circle>` at radius 100 and 120, `stroke: rgba(255,255,255,0.06)`, `strokeDasharray: "3 6"`
   - Center: Glass effect `<circle>` with `rgba(4,5,13,0.95)` fill, score in `font-mono text-4xl font-black`, classification label below
4. **Factor grid:** Replace `max-h-48 overflow-y-auto` with `grid grid-cols-2 gap-2`:
   - Each factor: `bg-white/[0.03] border border-white/[0.04] rounded-lg px-3 py-2`
   - `CosmicStatusOrb` (positive for passed, negative for failed) + factor name
   - Click to expand: `AnimatePresence` for reasoning text in `CosmicGlassCard variant="sunken"`
5. Keep existing tooltips and `useInteractiveSelection`

**Step 2: Verify build**

Run: `cd /Users/ivanjackson/Desktop/aicharttraderchris && npm run build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/CosmicDashboard/NEOCoreReactor.tsx
git commit -m "feat: redesign NEOCoreReactor with premium reactor visualization + energy field"
```

---

### Task 13: IntradayTimeCycles — Premium Redesign

**Files:**
- Modify: `src/components/CosmicDashboard/IntradayTimeCycles.tsx`

**Context:** Currently 236 lines, rated 7.5/10. Basic colored bar segments. Redesign as "Power Grid Timeline" with depth band, glowing time cursor, and glass best-windows cards.

**Design reference:** Section 3 of design doc — "Power Grid Timeline"

**Step 1: Rewrite the component**

Key changes:

1. Import `CosmicGlassCard`, `CosmicStatusOrb`, `CosmicInfoTooltip`, `COSMIC_TOOLTIPS`, `useInteractiveSelection`, `useAnimationFrame`
2. Wrap in `<CosmicGlassCard accentColor="aurora">`
3. **Market status badge:** Replace basic badge with `CosmicStatusOrb` + glass pill
4. **Timeline band:** Replace `h-16 flex` with premium depth band:
   - Container: `relative h-12 rounded-full overflow-hidden bg-white/[0.03] border border-white/[0.06]`
   - Segments positioned absolutely by percentage, with gradient fills
   - ULTRA_ALIGNED: Add shimmer overlay `background-size: 200% 100%` with animated `backgroundPosition`
   - 1px dark separators between segments (not borders)
5. **Current time cursor:** Use `useAnimationFrame` instead of `setInterval`:
   - Vertical beam: `w-[3px] h-[calc(100%+16px)] -top-2` positioned at current time %
   - `bg-gradient-to-b from-transparent via-[#2EC5FF] to-transparent`
   - Glow shadow: `box-shadow: 0 0 8px rgba(46,197,255,0.6)`
6. **Planet orbit line:** Thin `h-[1px] bg-white/[0.04]` line above timeline with planet glyphs at transition points
7. **Best windows panel:** Right side (or below on mobile):
   - Max 3 `CosmicGlassCard variant="sunken"` cards with:
   - Time range in monospace, node type badge with `CosmicStatusOrb`, countdown
8. **Legend:** Horizontal flex of glass pills with `CosmicStatusOrb` + label
9. Keep existing tooltips and `useInteractiveSelection`

**Step 2: Verify build**

Run: `cd /Users/ivanjackson/Desktop/aicharttraderchris && npm run build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/CosmicDashboard/IntradayTimeCycles.tsx
git commit -m "feat: redesign IntradayTimeCycles with premium depth band timeline"
```

---

### Task 14: MacroTimeCycles — Premium Redesign

**Files:**
- Modify: `src/components/CosmicDashboard/MacroTimeCycles.tsx`

**Context:** Currently 232 lines, rated 8/10. Good 3-panel layout. Upgrade each panel with CosmicGlassCard and premium SVG treatments.

**Design reference:** Section 4 of design doc — "Cosmic Orrery"

**Step 1: Rewrite the component**

Key changes for each of the 3 panels:

1. Each panel wraps in its own `CosmicGlassCard` (indigo, amber, purple accents respectively)
2. **Lunar Arc panel:**
   - SVG arc: Increase width to 200px. Replace flat stroke with gradient:
     - `<linearGradient>` from indigo → nebula → solar gold → dark slate (matching moon phase position)
   - Current position dot: 12px with glow filter (`feGaussianBlur stdDeviation=4`) + `radialGradient` halo
   - Phase milestones: 4 small `bg-white/5 border border-white/10 rounded-full` circles at cardinal points with moon emoji + tiny label
   - Center display: `font-mono text-2xl font-black tabular-nums text-white` for "Day 14 / 29"
3. **Mercury Cycle panel:**
   - Orbital ellipse: Gradient stroke (silver for most, amber near shadow, red near retrograde zone)
   - Mercury marker: Glow dot (`feGaussianBlur`) moving along path
   - Status badge: Glass pill with `CosmicStatusOrb` — positive for Direct, neutral for Shadow, negative+pulse for Retrograde
   - Countdown in monospace below orbit
4. **Weekly Rhythm panel:**
   - Replace rectangular day cells with `w-10 h-10 rounded-full bg-white/5 border border-white/10` circles
   - Planet glyph centered in each circle
   - Today's circle: `border-[#F6C453]/50 shadow-[0_0_12px_rgba(246,196,83,0.3)]` + subtle breathing animation
   - Thin connecting line between circles: `h-[1px] bg-white/[0.06]`
5. Keep all existing tooltips

**Step 2: Verify build**

Run: `cd /Users/ivanjackson/Desktop/aicharttraderchris && npm run build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/CosmicDashboard/MacroTimeCycles.tsx
git commit -m "feat: redesign MacroTimeCycles with premium orrery instruments"
```

---

### Task 15: TradingDayCalendar — Premium Redesign

**Files:**
- Modify: `src/components/CosmicDashboard/TradingDayCalendar.tsx`

**Context:** Currently 194 lines, rated 7.5/10. Functional calendar but generic styling. Redesign with glass cell cards and premium visual hierarchy.

**Design reference:** Section 5 of design doc — "Cosmic Calendar"

**Step 1: Rewrite the component**

Key changes:

1. Import `CosmicGlassCard`, `CosmicStatusOrb`, `CosmicInfoTooltip`, `COSMIC_TOOLTIPS`, `useInteractiveSelection`
2. Wrap in `<CosmicGlassCard accentColor="emerald">`
3. **Week strip cells:** Replace colored backgrounds with glass treatment:
   - Each cell: `bg-white/[0.03] border border-white/[0.06] rounded-xl p-3`
   - Very subtle gradient wash based on nodeType (e.g., `background: linear-gradient(135deg, rgba(16,185,129,0.06), transparent)` for aligned)
   - Top: Day abbreviation `text-[10px] uppercase tracking-widest text-gray-500`
   - Center: Date number `text-lg font-mono font-bold text-white`
   - Bottom: Planet glyph in accent color
   - Today: `ring-2 ring-[#F6C453]/50 shadow-[0_0_12px_rgba(246,196,83,0.2)]` + "TODAY" chip above
   - Best day: Star ⭐ badge with `shadow-[0_0_8px_rgba(246,196,83,0.4)]`
4. **Month grid cells:** Same glass treatment but smaller:
   - Opacity based on quality (brighter cells = better alignment): `opacity: ${0.4 + score * 0.6}`
   - Moon phase emoji overlay on key days
   - Current day: bright ring with radial glow
5. **Toggle button:** Glass pill: `bg-white/[0.05] border border-white/[0.08] rounded-full px-4 py-1.5 text-xs text-gray-400 hover:text-white transition`
6. Keep existing tooltips and `useInteractiveSelection`

**Step 2: Verify build**

Run: `cd /Users/ivanjackson/Desktop/aicharttraderchris && npm run build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/CosmicDashboard/TradingDayCalendar.tsx
git commit -m "feat: redesign TradingDayCalendar with premium glass cell calendar"
```

---

### Task 16: PlanetaryCommandCenter — Premium Redesign

**Files:**
- Modify: `src/components/CosmicDashboard/PlanetaryCommandCenter.tsx`

**Context:** Currently 350 lines, rated 8.5/10. Already strong. Upgrade to 10/10 "Day Ruler Command Deck" — the crown jewel.

**Design reference:** Section 6 of design doc — "Day Ruler Command Deck"

**Step 1: Rewrite the component**

Key changes:

1. Import `CosmicGlassCard`, `CosmicStatusOrb`, `CosmicDataRow`, `CosmicInfoTooltip`, `COSMIC_TOOLTIPS`, `useInteractiveSelection`, `useAnimationFrame`
2. Wrap in `<CosmicGlassCard variant="elevated" accentColor="amber" glowIntensity="medium">`
3. **Command Wheel (left side):**
   - Scale SVG to 480×480 viewBox
   - Wedge multi-layer depth:
     - Base layer: Each wedge gets `fill: rgba(255,255,255,0.02)` with subtle `radialGradient`
     - Color layer: Ally = `rgba(46,197,255,0.25)`, Enemy = `rgba(220,38,38,0.2)`, Neutral = `rgba(100,116,139,0.15)`, Self = `rgba(246,196,83,0.3)`
     - Current hour: beam line from center to outer edge with `filter: url(#beam-glow)`, define glow filter in `<defs>`
   - Outer rim: `<circle>` with `stroke: rgba(255,255,255,0.08)` and 24 tick marks at each hour
   - Center: `<circle>` with glass fill + large planet sigil (28px) + day name + two small orbital `<circle>` with slow CSS `animate-spin` (60s, 80s)
   - Past hours: `opacity: 0.3` + apply `filter: saturate(0.5)`
   - Upcoming ally: subtle `opacity` breathing via CSS animation
4. **Tactical Panel (right side):**
   - Current status: Large `CosmicStatusOrb size="lg"` + "ALLY HOUR" / "ENEMY HOUR" / "NEUTRAL" in uppercase
   - Countdown: `text-3xl font-mono font-black tabular-nums` with aurora glow text-shadow when ally
   - Hour breakdown: 3 `CosmicDataRow` entries — ally count (aurora color), neutral (gray), enemy (red)
   - Best windows: Up to 5 stacked glass chips: `bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-1.5` with time range and planet glyph
   - Day wisdom: `CosmicGlassCard variant="sunken"` with italic text and planet glyph
5. Replace `setInterval` countdowns with `useAnimationFrame`
6. Keep all existing tooltips and `useInteractiveSelection`

**Step 2: Verify build**

Run: `cd /Users/ivanjackson/Desktop/aicharttraderchris && npm run build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/CosmicDashboard/PlanetaryCommandCenter.tsx
git commit -m "feat: redesign PlanetaryCommandCenter as premium Day Ruler Command Deck"
```

---

### Task 17: HoraOrbitWheel — Premium Redesign

**Files:**
- Modify: `src/components/CosmicDashboard/HoraOrbitWheel.tsx`

**Context:** Currently 182 lines, rated 8/10. Good concentric rings. Upgrade with premium gradient fills, ring separators, glass center orb, and triangular pointer beam.

**Design reference:** Section 9 of design doc — "Temporal Orbit Wheel"

**Step 1: Rewrite the component**

Key changes:

1. Import `CosmicGlassCard`, `CosmicInfoTooltip`, `COSMIC_TOOLTIPS`, `useInteractiveSelection`
2. Wrap in `<CosmicGlassCard accentColor="nebula">`
3. **Wheel SVG (scale to 460×460):**
   - Outer ring (Vedic, 24 wedges): Premium gradient fills per wedge using `<linearGradient>` elements. Planet glyphs at outer edge in `fill: #F6C453` (gold)
   - Middle ring (alignment): Smooth color transition band — instead of 24 discrete colored blocks, use one continuous `<path>` with a multi-stop `<linearGradient>` that transitions between node type colors
   - Inner ring (Chinese, 12 segments): Animal emoji labels centered
   - Ring separators: Dashed `<circle>` at each boundary radius, `stroke: rgba(255,255,255,0.06)`, `strokeDasharray: "2 6"`
   - Center orb: Dark glass `<circle>` with `rgba(4,5,13,0.95)` fill and `rgba(109,91,255,0.15)` stroke. Shows: planet name (large), animal emoji, node type badge as colored dot, `radialGradient` inner glow matching current node type color
   - Current hour beam: Triangular `<path>` (narrow at center, wider at rim) with glow filter. Replace simple line with tapered pointer
   - Past hours: `opacity: 0.25`, add CSS filter `blur(0.3px)` for slight defocus
4. **Legend below wheel:** Horizontal flex of glass pills: `bg-white/[0.03] border border-white/[0.06] rounded-full px-3 py-1` with ring layer names (Vedic | Alignment | Chinese)
5. Keep existing tooltip and `useInteractiveSelection`

**Step 2: Verify build**

Run: `cd /Users/ivanjackson/Desktop/aicharttraderchris && npm run build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/CosmicDashboard/HoraOrbitWheel.tsx
git commit -m "feat: redesign HoraOrbitWheel with premium multi-ring observatory"
```

---

### Task 18: CivilizationCards + ConstellationRing — Premium Redesign

**Files:**
- Modify: `src/components/CosmicDashboard/CivilizationCards.tsx`
- Modify: `src/components/CosmicDashboard/ConstellationRing.tsx`

**Context:** CivilizationCards (143 lines, 7.5/10) and ConstellationRing (137 lines, 7/10). Both need CosmicGlassCard wrapping and premium visual treatments.

**Step 1: Rewrite CivilizationCards**

Key changes:
1. Each card: Wrap in `<CosmicGlassCard accentColor={civAccent}>` (nebula for Vedic, solar for Babylonian, aurora for Egyptian, emerald for Chinese)
2. Remove background images — use solid glass treatment instead
3. Header row: Large glyph (text-2xl) + name + `CosmicStatusOrb` for status (positive/neutral/negative for ALIGNED/MIXED/CONFLICT)
4. Planet/Animal info: `CosmicDataRow` with emoji icon
5. Signal text: Large `text-lg font-semibold` in civilization accent color
6. Reading: `text-gray-400 text-xs leading-relaxed line-clamp-3`
7. Keep all existing tooltips

**Step 2: Rewrite ConstellationRing**

Key changes:
1. Wrap in `<CosmicGlassCard accentColor="nebula">`
2. Scale SVG to 480×480
3. Star nodes: Replace `<circle>` with 6-point star `<path>`:
   - Passed: Multi-layer — inner bright core (`fill: white`) at r=3 + outer halo `<circle>` at r=8 with `fill: rgba(109,91,255,0.15)` + glow `filter`
   - Failed: Simple dim dot `fill: rgba(239,68,68,0.3)` at r=3
4. Constellation lines: `stroke: rgba(109,91,255,0.2)` at `strokeWidth: 1.2` (thicker)
5. Background coordinate grid: Two dashed `<circle>` + 4 faint radial `<line>` creating star chart crosshairs
6. Center: Glass `<circle>` with score as large monospace number + mini `CosmicArcGauge`-style fill ring (use `<circle>` with strokeDasharray for fill percentage) + classification label
7. Factor name labels: `<text>` elements curved along outer edge, `fontSize: 7`, `fill: rgba(255,255,255,0.3)`
8. Keep existing tooltip and `useInteractiveSelection`

**Step 3: Verify build**

Run: `cd /Users/ivanjackson/Desktop/aicharttraderchris && npm run build 2>&1 | tail -5`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/CosmicDashboard/CivilizationCards.tsx src/components/CosmicDashboard/ConstellationRing.tsx
git commit -m "feat: redesign CivilizationCards + ConstellationRing with premium glass treatment"
```

---

### Task 19: Dashboard Orchestrator + Background Update

**Files:**
- Modify: `src/components/CosmicDashboard/CosmicTimingDashboard.tsx`

**Context:** The main orchestrator was rewritten in the UX overhaul to use CosmicZoneAccordion + CosmicSectionShell. Now we need to add the CosmicConstellationBg behind all zones and ensure the container has relative positioning for the background layer.

**Step 1: Update the orchestrator**

Add `CosmicConstellationBg` as the first child of the main container:

In `CosmicTimingDashboard.tsx`, change the main return:
```tsx
// Change the outer div from:
<div className="space-y-6 pb-10">
// To:
<div className="relative space-y-6 pb-10">
  <CosmicConstellationBg density="sparse" animated />
```

Import at top:
```tsx
import CosmicConstellationBg from './shared/CosmicConstellationBg';
```

**Step 2: Verify build**

Run: `cd /Users/ivanjackson/Desktop/aicharttraderchris && npm run build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/CosmicDashboard/CosmicTimingDashboard.tsx
git commit -m "feat: add constellation background to dashboard orchestrator"
```

---

### Task 20: Full Build, Deploy & Push

**Files:** None (verification task)

**Step 1: Full build verification**

Run: `cd /Users/ivanjackson/Desktop/aicharttraderchris && npm run build 2>&1`
Expected: Build succeeds with no TypeScript errors

**Step 2: Deploy to Cloudflare Pages**

Run: `cd /Users/ivanjackson/Desktop/aicharttraderchris && npx wrangler pages deploy dist --project-name=aicharttraderchris`
Expected: Deployment succeeds

**Step 3: Push to GitHub**

Run: `cd /Users/ivanjackson/Desktop/aicharttraderchris && git push origin main`
Expected: Push succeeds

**Step 4: Verify deployment**

Confirm the Cloudflare Pages URL loads successfully.
