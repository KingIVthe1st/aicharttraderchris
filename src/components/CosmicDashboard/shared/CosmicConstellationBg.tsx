import { useMemo } from 'react';

interface CosmicConstellationBgProps {
  density?: 'sparse' | 'medium' | 'dense';
  color?: string;
  animated?: boolean;
}

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
