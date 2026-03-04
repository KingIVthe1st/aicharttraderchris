// NEO Scoring
export type NEOClassification = 'ULTRA_GREEN' | 'GREEN' | 'YELLOW' | 'RED';

export interface NEOFactor {
  id: number;
  name: string;
  score: number;
  automated: boolean;
  reasoning: string;
}

export interface NEOScore {
  total: number;
  classification: NEOClassification;
  factors: NEOFactor[];
}

// Moon Phase
export type MoonPhaseName = 'New Moon' | 'Waxing Crescent' | 'First Quarter' | 'Waxing Gibbous' | 'Full Moon' | 'Waning Gibbous' | 'Last Quarter' | 'Waning Crescent';

export interface MoonPhase {
  name: MoonPhaseName;
  illumination: number;
  daysIntoCycle: number;
  isWaxing: boolean;
  emoji: string;
}

// VOC Status
export interface VOCStatus {
  isVoid: boolean;
  message: string;
}

// Planetary Hours
export type Planet = 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn';

export interface PlanetaryHour {
  planet: Planet;
  startTime: string;
  endTime: string;
  hourNumber: number;
  isDaytime: boolean;
  isAllyHour: boolean;
  isEnemyHour: boolean;
  isNeutralHour: boolean;
  portalWindow: { start: string; end: string };
}

export interface PlanetaryHourMap {
  dayRuler: Planet;
  currentHour: PlanetaryHour;
  nextHours: PlanetaryHour[];
  sunrise: string;
  sunset: string;
}

// Hora Grid
export type NodeType = 'ULTRA_ALIGNED' | 'HIGH_PRESSURE' | 'SOUL_WINDOW' | 'MIXED' | 'CONFLICT' | 'DISRUPTION' | 'U_NODE';

export interface HoraGridHour {
  startTime: string;
  endTime: string;
  vedic: { planet: string; isAlly: boolean; isEnemy: boolean };
  babylonian: { planet: string; energy: string };
  egyptian: { decanEnergy: string };
  chinese: { animal: string; compatibility: string };
  nodeType: NodeType;
  nodeScore: number;
  tradingGuidance: string;
}

export interface HoraGrid {
  hours: HoraGridHour[];
  timezone: string;
  date: string;
}

// Chinese Zodiac
export type ChineseAnimal = 'Rat' | 'Ox' | 'Tiger' | 'Rabbit' | 'Dragon' | 'Snake' | 'Horse' | 'Goat' | 'Monkey' | 'Rooster' | 'Dog' | 'Pig';
export type ChineseElement = 'Wood' | 'Fire' | 'Earth' | 'Metal' | 'Water';

export interface ShiChenHour {
  animal: ChineseAnimal;
  startHour: number;
  endHour: number;
  direction: string;
}

// Environmental Energy
export interface EnvironmentalEnergy {
  kIndex: number;
  kIndexLevel: 'calm' | 'moderate' | 'high';
  solarFlareActive: boolean;
  solarFlareClass: string | null;
  schumannResonance: 'normal' | 'elevated' | 'spike';
  overallStatus: 'green' | 'amber' | 'red';
  tradingImpact: string;
  lastUpdated: string;
}

// Numerology
export interface NumerologyProfile {
  lifePath: number;
  personalYear: number;
  personalMonth: number;
  personalDay: number;
  universalDay: number;
  isAlignmentDay: boolean;
  alignmentNumbers: number[];
}

// Soul Blueprint
export interface SoulBlueprintInput {
  fullName: string;
  birthDate: string;
  birthTime: string;
  birthCity: string;
  birthCountry: string;
}

export interface SoulBlueprint {
  id: string;
  userId: string;
  fullName: string;
  birthDate: string;
  birthTime: string;
  birthCity: string;
  birthCountry: string;
  birthLat: number;
  birthLon: number;
  lifePath: number;
  sunSign: string;
  moonSign: string;
  risingSign: string;
  chineseAnimal: string;
  chineseElement: string;
  chineseAllies: string;
  chineseEnemies: string;
  planetaryRuler: string;
  alignmentNumbers: string;
  nameGematria: string;
  nakshatra: string;
  humanDesignType: string;
  createdAt: number;
  updatedAt: number;
}

// Full Cosmic Intelligence (daily payload)
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
  bestTradingWindows: Array<{ time: string; reason: string; nodeType: string }>;
  enemyHourAlert: { active: boolean; message: string } | null;
}

// Helper: NEO color classes
export function getNEOColorClass(classification: NEOClassification): string {
  switch (classification) {
    case 'ULTRA_GREEN': return 'text-emerald-400';
    case 'GREEN': return 'text-green-400';
    case 'YELLOW': return 'text-yellow-400';
    case 'RED': return 'text-red-400';
  }
}

export function getNEOBgClass(classification: NEOClassification): string {
  switch (classification) {
    case 'ULTRA_GREEN': return 'bg-emerald-500/20 border-emerald-500/30';
    case 'GREEN': return 'bg-green-500/20 border-green-500/30';
    case 'YELLOW': return 'bg-yellow-500/20 border-yellow-500/30';
    case 'RED': return 'bg-red-500/20 border-red-500/30';
  }
}

export function getNodeColorClass(nodeType: NodeType): string {
  switch (nodeType) {
    case 'ULTRA_ALIGNED': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    case 'HIGH_PRESSURE': return 'bg-green-500/20 text-green-300 border-green-500/40';
    case 'SOUL_WINDOW': return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    case 'MIXED': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
    case 'CONFLICT': return 'bg-red-500/20 text-red-300 border-red-500/40';
    case 'DISRUPTION': return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    case 'U_NODE': return 'bg-gray-500/20 text-gray-300 border-gray-500/40';
  }
}
