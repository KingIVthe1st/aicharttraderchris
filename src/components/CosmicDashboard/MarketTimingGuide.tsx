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
  Leo:         { glyph: '♌', color: '#F6C453', ruler: 'Sun',     sentiment: 'BULLISH',     sentimentColor: 'text-yellow-300', tactics: 'Trend-following, large-cap longs', avoid: 'Short selling into strength', description: 'Confidence surges across the market. Blue chips and market leaders attract capital. Risk-on appetite drives momentum higher. Bold trend trades are rewarded.' },
  Virgo:       { glyph: '♍', color: '#34D399', ruler: 'Mercury', sentiment: 'ANALYTICAL',  sentimentColor: 'text-emerald-300',tactics: 'Earnings plays, sector rotation', avoid: 'Over-analyzing entries', description: 'Precision over conviction. Fundamental data and earnings reports drive price action. Detail-oriented traders and systematic strategies thrive in this environment.' },
  Libra:       { glyph: '♎', color: '#6EE7B7', ruler: 'Venus',   sentiment: 'BALANCED',    sentimentColor: 'text-teal-300',   tactics: 'Mean-reversion, pairs trading', avoid: 'Strong directional bets', description: 'Equilibrium-seeking energy. Markets hover near fair value. M&A activity and corporate events create specific opportunities. Avoid trending strategies.' },
  Scorpio:     { glyph: '♏', color: '#DC2626', ruler: 'Mars',    sentiment: 'INTENSE',     sentimentColor: 'text-red-400',    tactics: 'Options strategies, reversal plays', avoid: 'Complacency', description: 'Deep volatility and sudden reversals. Hidden order flow surfaces unexpectedly. High-risk, high-reward environment that punishes the passive and rewards the vigilant.' },
  Sagittarius: { glyph: '♐', color: '#FB923C', ruler: 'Jupiter', sentiment: 'EXPANSIVE',   sentimentColor: 'text-orange-300', tactics: 'Global exposure, risk assets, growth', avoid: 'Overly cautious positions', description: 'Optimism expands risk appetite broadly. International markets and growth assets attract capital. Jupiter-driven momentum favors aggressive trend-following.' },
  Capricorn:   { glyph: '♑', color: '#94A3B8', ruler: 'Saturn',  sentiment: 'DISCIPLINED', sentimentColor: 'text-slate-300',  tactics: 'Institutional setups, slow trends', avoid: 'Impulse trades', description: 'Institutional discipline takes over. Slow, methodical trend continuation. Quality names attract patient capital. Only high-conviction setups deserve your attention.' },
  Aquarius:    { glyph: '♒', color: '#2EC5FF', ruler: 'Saturn',  sentiment: 'ERRATIC',     sentimentColor: 'text-cyan-300',   tactics: 'Tech sector, gap plays', avoid: 'Crowded trades', description: 'Unexpected gaps and innovation-driven moves emerge. Technology and disruptive assets see unusual activity. Contrarian setups arise from the unpredictable flow.' },
  Pisces:      { glyph: '♓', color: '#818CF8', ruler: 'Jupiter', sentiment: 'FOGGY',       sentimentColor: 'text-indigo-300', tactics: 'Reduce size, sit on hands', avoid: 'New positions in confusion', description: 'Low conviction and sector confusion dominate. Conflicting signals create head-fakes. This is a time to protect capital, reduce position size, and wait for clarity.' },
};

const SIGNS = Object.keys(MOON_SIGN_GUIDE);

function getFitRelationship(moonSign: string, planetaryRuler: string): { label: string; color: string; bg: string } {
  const signRuler = SIGN_RULERS[moonSign];
  if (!signRuler || !planetaryRuler) return { label: 'NEUTRAL', color: 'text-gray-400', bg: 'bg-gray-500/15 border-gray-500/30' };
  if (signRuler === planetaryRuler) return { label: 'RESONANCE', color: 'text-yellow-300', bg: 'bg-yellow-500/15 border-yellow-400/40' };
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

        {/* 12-sign grid */}
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
                      style={{ borderColor: g.color + '40', background: g.color + '10' }}
                      className="rounded-xl border mt-1 p-3 overflow-hidden"
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
