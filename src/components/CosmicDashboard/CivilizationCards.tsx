import { motion } from 'framer-motion';
import type { HoraGridHour } from '@/types/cosmic';
import CosmicGlassCard from './shared/CosmicGlassCard';
import CosmicStatusOrb from './shared/CosmicStatusOrb';
import CosmicDataRow from './shared/CosmicDataRow';
import CosmicInfoTooltip from './shared/CosmicInfoTooltip';
import { COSMIC_TOOLTIPS } from './config/cosmicTooltips';

interface Props { currentHour: HoraGridHour }

const STATUS_MAP = {
  ALIGNED: 'positive',
  MIXED: 'neutral',
  CONFLICT: 'negative',
} as const;

const CIVILIZATIONS = [
  {
    key: 'vedic',
    name: 'Vedic',
    subname: 'Jyotish',
    tooltipKey: 'civVedic' as const,
    accentColor: 'nebula' as const,
    accent: '#8B7AFF',
    glyph: '🕉',
    dataLabel: 'Ruling Planet',
    getDataValue: (h: HoraGridHour) => h.vedic.planet,
    getSignal: (h: HoraGridHour) => h.vedic.planet,
    getStatus: (h: HoraGridHour): 'ALIGNED' | 'MIXED' | 'CONFLICT' =>
      h.vedic.isAlly ? 'ALIGNED' : h.vedic.isEnemy ? 'CONFLICT' : 'MIXED',
    getReading: (h: HoraGridHour) =>
      `${h.vedic.planet} hora ${h.vedic.isAlly ? 'harmonizes with your birth ruler, amplifying intuition and trade flow' : h.vedic.isEnemy ? 'creates friction with your natal chart, urging caution' : 'moves in neutral influence — calculated moves favor you'}.`,
  },
  {
    key: 'babylonian',
    name: 'Babylonian',
    subname: 'Chaldean',
    tooltipKey: 'civBabylonian' as const,
    accentColor: 'solar' as const,
    accent: '#F6C453',
    glyph: '𒀭',
    dataLabel: 'Ruling Planet',
    getDataValue: (h: HoraGridHour) => h.babylonian.planet,
    getSignal: (h: HoraGridHour) => h.babylonian.planet,
    getStatus: (h: HoraGridHour): 'ALIGNED' | 'MIXED' | 'CONFLICT' => {
      const e = (h.babylonian.energy ?? '').toLowerCase();
      return e.includes('align') ? 'ALIGNED' : e.includes('conflict') ? 'CONFLICT' : 'MIXED';
    },
    getReading: (h: HoraGridHour) =>
      `Chaldean ${h.babylonian.planet} carries ${h.babylonian.energy ?? 'neutral'} energy today. The ancient star-watchers of Babylon noted this influence on commerce and decision-making.`,
  },
  {
    key: 'egyptian',
    name: 'Egyptian',
    subname: 'Decan System',
    tooltipKey: 'civEgyptian' as const,
    accentColor: 'aurora' as const,
    accent: '#5DD8FF',
    glyph: '𓂀',
    dataLabel: 'Decan Energy',
    getDataValue: (h: HoraGridHour) => (h.egyptian.decanEnergy ?? '').split(' ')[0] || 'Decan',
    getSignal: (h: HoraGridHour) => (h.egyptian.decanEnergy ?? '').split(' ')[0] || 'Decan',
    getStatus: (h: HoraGridHour): 'ALIGNED' | 'MIXED' | 'CONFLICT' => {
      const e = (h.egyptian.decanEnergy ?? '').toLowerCase();
      return e.includes('favorable') || e.includes('strong') ? 'ALIGNED' : e.includes('caution') || e.includes('weak') ? 'CONFLICT' : 'MIXED';
    },
    getReading: (h: HoraGridHour) =>
      `Egyptian Decan Oracle: ${h.egyptian.decanEnergy}. The priests of Heliopolis aligned their temple rituals with this celestial cycle.`,
  },
  {
    key: 'chinese',
    name: 'Chinese',
    subname: 'Shi Chen',
    tooltipKey: 'civChinese' as const,
    accentColor: 'emerald' as const,
    accent: '#22C55E',
    glyph: '☯',
    dataLabel: 'Animal',
    getDataValue: (h: HoraGridHour) => h.chinese.animal,
    getSignal: (h: HoraGridHour) => h.chinese.animal,
    getStatus: (h: HoraGridHour): 'ALIGNED' | 'MIXED' | 'CONFLICT' => {
      const c = (h.chinese.compatibility ?? '').toLowerCase();
      return c.includes('ally') || c.includes('friend') ? 'ALIGNED' : c.includes('clash') || c.includes('enemy') ? 'CONFLICT' : 'MIXED';
    },
    getReading: (h: HoraGridHour) =>
      `${h.chinese.animal} shi-chen hour: ${h.chinese.compatibility}. Ancient Chinese market wisdom aligned trading with these 2-hour celestial cycles.`,
  },
];

export default function CivilizationCards({ currentHour }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {CIVILIZATIONS.map((civ, i) => {
        const signal = civ.getSignal(currentHour);
        const status = civ.getStatus(currentHour);
        const reading = civ.getReading(currentHour);
        const dataValue = civ.getDataValue(currentHour);

        return (
          <motion.div
            key={civ.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <CosmicGlassCard accentColor={civ.accentColor} className="h-full">
              <div className="flex flex-col h-full">
                {/* Header: glyph + name + status orb */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl leading-none">{civ.glyph}</span>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-white font-bold text-sm">{civ.name}</p>
                        <CosmicInfoTooltip label={`About ${civ.name}`}>
                          <p>{COSMIC_TOOLTIPS[civ.tooltipKey].text}</p>
                        </CosmicInfoTooltip>
                      </div>
                      <p className="text-gray-500 text-[10px]">{civ.subname}</p>
                    </div>
                  </div>
                  <CosmicStatusOrb
                    status={STATUS_MAP[status]}
                    size="sm"
                    pulse={status === 'ALIGNED'}
                    label={status}
                  />
                </div>

                {/* Data row: ruling planet / animal */}
                <CosmicDataRow
                  label={civ.dataLabel}
                  value={dataValue}
                  valueColor={civ.accent}
                  noBorder
                />

                {/* Signal */}
                <p
                  className="text-lg font-semibold mt-2 mb-1"
                  style={{ color: civ.accent }}
                >
                  {signal}
                </p>

                {/* Reading */}
                <p className="text-gray-400 text-xs leading-relaxed line-clamp-3 flex-1">
                  {reading}
                </p>
              </div>
            </CosmicGlassCard>
          </motion.div>
        );
      })}
    </div>
  );
}
