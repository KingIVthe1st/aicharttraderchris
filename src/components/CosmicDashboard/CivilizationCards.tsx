import { motion } from 'framer-motion';
import type { HoraGridHour } from '@/types/cosmic';

interface Props { currentHour: HoraGridHour }

const CIVILIZATIONS = [
  {
    key: 'vedic',
    name: 'Vedic',
    subname: 'Jyotish',
    image: '/images/ai-generated/cosmic-vedic-bg.png',
    gradient: 'from-indigo-950/90 to-purple-950/90',
    border: 'border-indigo-500/30',
    accent: '#8B7AFF',
    glyph: '🕉',
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
    image: '/images/ai-generated/cosmic-babylonian-bg.png',
    gradient: 'from-amber-950/90 to-orange-950/90',
    border: 'border-amber-500/30',
    accent: '#F6C453',
    glyph: '𒀭',
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
    image: '/images/ai-generated/cosmic-egyptian-bg.png',
    gradient: 'from-yellow-950/90 to-teal-950/90',
    border: 'border-yellow-500/30',
    accent: '#5DD8FF',
    glyph: '𓂀',
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
    image: '/images/ai-generated/cosmic-chinese-bg.png',
    gradient: 'from-red-950/90 to-emerald-950/90',
    border: 'border-red-500/30',
    accent: '#22C55E',
    glyph: '☯',
    getSignal: (h: HoraGridHour) => h.chinese.animal,
    getStatus: (h: HoraGridHour): 'ALIGNED' | 'MIXED' | 'CONFLICT' => {
      const c = (h.chinese.compatibility ?? '').toLowerCase();
      return c.includes('ally') || c.includes('friend') ? 'ALIGNED' : c.includes('clash') || c.includes('enemy') ? 'CONFLICT' : 'MIXED';
    },
    getReading: (h: HoraGridHour) =>
      `${h.chinese.animal} shi-chen hour: ${h.chinese.compatibility}. Ancient Chinese market wisdom aligned trading with these 2-hour celestial cycles.`,
  },
];

const STATUS_STYLES = {
  ALIGNED:  'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
  MIXED:    'bg-amber-500/20 border-amber-500/40 text-amber-300',
  CONFLICT: 'bg-red-500/20 border-red-500/40 text-red-300',
};
const STATUS_DOTS = {
  ALIGNED: 'bg-emerald-400', MIXED: 'bg-amber-400', CONFLICT: 'bg-red-400',
};

export default function CivilizationCards({ currentHour }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {CIVILIZATIONS.map((civ, i) => {
        const signal = civ.getSignal(currentHour);
        const status = civ.getStatus(currentHour);
        const reading = civ.getReading(currentHour);

        return (
          <motion.div
            key={civ.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className={`relative rounded-2xl overflow-hidden border ${civ.border} group cursor-default`}
            style={{ minHeight: '200px' }}
          >
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url(${civ.image})` }} />
            <div className={`absolute inset-0 bg-gradient-to-b ${civ.gradient}`} />

            <div className="relative z-10 p-4 h-full flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-xl">{civ.glyph}</span>
                  <p className="text-white font-bold text-sm mt-1">{civ.name}</p>
                  <p className="text-gray-400 text-[11px]">{civ.subname}</p>
                </div>
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-bold uppercase ${STATUS_STYLES[status]}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOTS[status]}`} />
                  {status}
                </div>
              </div>

              <p style={{ color: civ.accent }} className="text-lg font-black mb-2">{signal}</p>
              <p className="text-gray-300 text-[11px] leading-relaxed line-clamp-3 flex-1">{reading}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
