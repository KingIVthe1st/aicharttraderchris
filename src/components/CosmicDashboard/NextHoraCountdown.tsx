import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { PlanetaryHour } from '@/types/cosmic';

interface Props { nextHour: PlanetaryHour }

const PLANET_GLYPHS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿', Jupiter: '♃', Venus: '♀', Saturn: '♄',
};
const CHINESE_FOR_HOUR: Record<number, string> = {
  0: 'Rat', 2: 'Ox', 4: 'Tiger', 6: 'Rabbit', 8: 'Dragon', 10: 'Snake',
  12: 'Horse', 14: 'Goat', 16: 'Monkey', 18: 'Rooster', 20: 'Dog', 22: 'Pig',
};
const CHINESE_EMOJIS: Record<string, string> = {
  Rat: '🐀', Ox: '🐂', Tiger: '🐅', Rabbit: '🐇', Dragon: '🐉', Snake: '🐍',
  Horse: '🐎', Goat: '🐐', Monkey: '🐒', Rooster: '🐓', Dog: '🐕', Pig: '🐖',
};

function getChineseAnimal(isoTime: string): string {
  const h = new Date(isoTime).getHours();
  const base = Math.floor(h / 2) * 2;
  return CHINESE_FOR_HOUR[base] ?? 'Dragon';
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00';
  const totalSecs = Math.floor(ms / 1000);
  const m = Math.floor(totalSecs / 60).toString().padStart(2, '0');
  const s = (totalSecs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function NextHoraCountdown({ nextHour }: Props) {
  const [msLeft, setMsLeft] = useState(0);

  useEffect(() => {
    const update = () => setMsLeft(Math.max(0, new Date(nextHour.startTime).getTime() - Date.now()));
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [nextHour.startTime]);

  const chineseAnimal = getChineseAnimal(nextHour.startTime);
  const chineseEmoji = CHINESE_EMOJIS[chineseAnimal] ?? '🐉';
  const isAlly = nextHour.isAllyHour;
  const isEnemy = nextHour.isEnemyHour;

  return (
    <div className="rounded-2xl border border-gray-700/50 bg-gradient-to-b from-gray-900 to-gray-950 p-5 flex flex-col items-center text-center">
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-medium">Next Hora</p>

      <div
        className="font-mono text-5xl font-black mb-1 tabular-nums"
        style={{
          color: isAlly ? '#5DD8FF' : isEnemy ? '#FCA5A5' : 'white',
          textShadow: isAlly ? '0 0 20px rgba(46,197,255,0.6)' : isEnemy ? '0 0 20px rgba(239,68,68,0.6)' : '0 0 10px rgba(255,255,255,0.2)',
        }}
      >
        {formatCountdown(msLeft)}
      </div>
      <p className="text-gray-500 text-xs mb-4">minutes : seconds</p>

      <div className="flex items-center gap-3">
        <span className="text-3xl">{PLANET_GLYPHS[nextHour.planet]}</span>
        <div className="text-left">
          <p className="text-white font-bold">{nextHour.planet}</p>
          <p className="text-gray-400 text-xs">incoming hora</p>
        </div>
      </div>

      {(isAlly || isEnemy) && (
        <motion.div
          className={`mt-3 px-3 py-1 rounded-full border text-xs font-bold uppercase ${
            isAlly ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400' : 'border-red-500/40 bg-red-500/10 text-red-400'
          }`}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {isAlly ? '✦ Ally Hour Incoming' : '⚠ Enemy Hour Incoming'}
        </motion.div>
      )}

      <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
        <span className="text-xl">{chineseEmoji}</span>
        <span>{chineseAnimal} hour</span>
      </div>
    </div>
  );
}
