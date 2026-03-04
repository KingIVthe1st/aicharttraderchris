# Cosmic Trading Fusion — Design Document

**Date:** 2026-03-04
**Project:** aicharttraderchris
**Summary:** Integrate the NEO 17-Point cosmic timing system into AI Chart Trader, creating a multi-user platform that combines AI chart analysis with personalized cosmic trading intelligence.

---

## Decision Log

- **Target user:** Multi-user platform (any user signs up, gets personalized cosmic intelligence)
- **Onboarding depth:** Full soul blueprint (name, birth date, birth time, birth city/country)
- **Dashboard layout:** Two tabs — "Market Intelligence" (existing) and "Cosmic Timing" (new)
- **NEO score mode:** Fully automated (app calculates all 17 factors, some self-reported)
- **Brand identity:** AI + Cosmic Fusion — both pillars equally prominent
- **Analysis integration:** Optional toggle ("Cosmic Overlay: ON/OFF")
- **MVP scope:** Full integration at once (no phased rollout)
- **Architecture:** Backend-computed (all cosmic logic on Cloudflare Worker, frontend fetches payloads)

---

## Section 1: User Soul Blueprint — Data Model & Onboarding

### Data Collected at Signup

| Field | Required | Used For |
|-------|----------|----------|
| Full legal name | Yes | Gematria/Letterology decoding, numerology |
| Birth date | Yes | Life Path, Chinese Zodiac/Element, Western Sun sign, daily/yearly numerology |
| Birth time (HH:MM) | Yes | Moon sign, Rising sign, Nakshatra, Human Design type |
| Birth city + country | Yes | Rising sign calculation (lat/lon), timezone context |

### Computed Soul Blueprint (stored in D1)

- Life Path Number
- Personal Year/Month/Day Numbers (recalculated daily)
- Name Gematria (Ordinal, Reduction, Reverse — stored as JSON)
- Western Astrology: Sun sign, Moon sign, Rising sign
- Chinese Zodiac: Animal + Element (e.g., Water Pig)
- Chinese Zodiac Allies/Enemies
- Planetary Ruler (from Rising sign)
- Alignment Numbers (resonant single digits)
- Nakshatra
- Human Design type

### Onboarding UX Flow

```
Sign Up (email/password)
    |
    v
"Create Your Soul Blueprint" - 3-step wizard:
    Step 1: Name + Birth Date
    Step 2: Birth Time + Birth Place (city autocomplete)
    Step 3: Confirmation - shows computed blueprint summary
    |
    v
Dashboard
```

### Database Schema

```sql
CREATE TABLE soul_blueprints (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE REFERENCES users(id),
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
    updated_at INTEGER DEFAULT (unixepoch())
);
```

New migration adds `has_soul_blueprint BOOLEAN DEFAULT 0` to `users` table.

---

## Section 2: Cosmic Timing Dashboard

Dashboard gets a tab switcher: **"Market Intelligence"** | **"Cosmic Timing"**

### Row 1: Today's Overview Bar

| Widget | Content |
|--------|---------|
| NEO Score Gauge | 0-17 score, color-classified (Ultra Green 14-17, Green 12-13, Yellow 9-11, Red <=8) |
| Moon Phase Card | Phase icon + name, VOC status (Clear/Void with window), waxing/waning |
| Planetary Day/Hour | Day ruler + current hour ruler + countdown to next hour. Ally/enemy color coding |
| Daily Numerology | Universal Day Number + Personal Day Number. Alignment day indicator |

### Row 2: Hora Grid Map (centerpiece)

Timeline of next 12 hours, each segment showing:
- Vedic planetary ruler + Chinese animal hour + Node classification
- Color coding: Ultra-Aligned (gold), HPN (green), Soul Window (blue), Mixed (amber), Conflict (red), Disruption (purple)
- Current hour highlighted with pulsing border
- Hover reveals full 4-layer breakdown (Vedic + Babylonian + Egyptian + Chinese)
- Portal Patience entry windows (:30-:45) marked within each hour

### Row 3: Signal Cards

| Widget | Content |
|--------|---------|
| Chinese Zodiac Sync | Current hour animal + compatibility with user's birth animal |
| Environmental Energy | K-index + Schumann Resonance + solar flare activity (traffic light) |
| Enemy Hour Alert | Warning when in enemy planetary hour with inversion guidance |
| Trading Windows | Today's recommended entry windows from hora grid + NEO score |

### Row 4: Daily Briefing

AI-generated natural language summary pulling all cosmic data together into actionable trading guidance.

### API Endpoint

```
GET /api/cosmic/daily?timezone=America/New_York
```

Returns full personalized cosmic payload. Cached 15-minute TTL.

---

## Section 3: Analysis Page — Cosmic Overlay

### New Toggle

Next to "Trader / Mentor" mode toggle, add: **"Cosmic Overlay: ON / OFF"**

**When ON:** Analysis request includes user's current cosmic context. AI prompt gets:
- Current NEO score + classification
- Current planetary hour + ally/enemy status
- Moon phase + VOC status
- Hora Grid node classification
- User's alignment numbers + Chinese Zodiac compatibility
- Active Enemy Hour inversion warnings

AI weaves cosmic timing into technical analysis output.

**When OFF:** Pure technical analysis (current behavior).

### Implementation

- Frontend: Toggle state, pass `includeCosmic: boolean` in request
- Backend: When true, fetch cosmic data + append to GPT-4o system prompt
- No changes to streaming or image upload architecture

---

## Section 4: Landing Page Redesign

### Hero
- Headline positions AI + Cosmic fusion
- Subheadline: AI chart analysis + 4-civilization cosmic timing + personalized soul blueprint
- Visual: Trading chart elements + cosmic/planetary elements
- Stats: "17-Point Cosmic Score / 4 Ancient Civilizations / AI Vision Analysis"
- CTA: "Create Your Soul Blueprint"

### How It Works (4 steps)
1. Create Your Soul Blueprint — Enter birth data, get cosmic profile
2. Check Today's Alignment — Personalized Hora Grid, NEO Score, trading windows
3. Upload Your Chart — AI analyzes with optional cosmic overlay
4. Trade With Confidence — Technical + cosmic confluence

### Features (6 pillars)
1. AI Chart Analysis
2. Live Cosmic Dashboard
3. Personalized Soul Blueprint
4. 17-Point NEO Scoring
5. Enemy Hour Alerts
6. Environmental Energy Awareness

### Other Sections
- Pricing: Same model, updated copy emphasizing cosmic features
- FAQ: Add cosmic-specific questions
- Testimonials: Updated copy (placeholders initially)
- Footer: Updated tagline

---

## Section 5: Backend Architecture

### New API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/soul-blueprint` | POST | Create/update soul blueprint |
| `/api/soul-blueprint` | GET | Retrieve user's blueprint |
| `/api/cosmic/daily` | GET | Full personalized cosmic payload |
| `/api/cosmic/neo-score` | GET | Current NEO 17-point score breakdown |
| `/api/cosmic/hora-grid` | GET | Hora Grid timeline (next 12-24 hours) |

### New Backend Modules

| Module | Responsibility |
|--------|---------------|
| `cosmicEngine.ts` | Orchestrator — assembles full payload from sub-modules |
| `numerology.ts` | Life Path, daily numbers, name reduction, Gematria ciphers |
| `astrology.ts` | Sun/Moon/Rising signs, moon phase, VOC detection, aspects |
| `planetaryHours.ts` | Vedic hora (Chaldean sequence from sunrise), ally/enemy matrix |
| `chineseZodiac.ts` | Animal + element, Shi Chen hours, compatibility logic |
| `horaGrid.ts` | 4-layer cross-civilization grid → node classifications |
| `neoScoring.ts` | Automated 17-point scoring engine |
| `environmentalEnergy.ts` | K-index, solar flares, Schumann from public APIs |
| `soulBlueprint.ts` | Computes full blueprint from raw birth data |

### Astronomical Calculations

- Moon phase: Algorithmic (date-based formulas, no external API)
- Planetary hours: Sunrise time (SunCalc algorithm from lat/lon) + Chaldean sequence
- Sun/Moon/Rising signs: Simplified ephemeris lookup table
- VOC Moon: Pre-computed schedule stored in KV (published monthly)

### Environmental Data Sources

| Data | Source | Frequency |
|------|--------|-----------|
| K-index | NOAA Space Weather API | Every 3 hours |
| Solar flares | NOAA DONKI API | Every 6 hours |
| Schumann Resonance | HeartMath / community APIs | Daily |

Fetched by existing cron triggers, cached in KV.

### Caching Strategy

- Soul Blueprint: D1, computed once at onboarding
- Daily cosmic data: KV, key `cosmic:{userId}:{date}`, 15-min TTL
- Environmental data: KV, shared across users, fetched by cron
- Hora Grid: Cached per-timezone per-day

### Modified Endpoints

- `/api/analyze`: When `includeCosmic: true`, injects cosmic context into GPT-4o prompt
- `/api/auth/signup`: After account creation, redirects to onboarding (blueprint is separate step)
