import { useMemo } from 'react';

interface ForestSceneProps {
  streak: number;
  className?: string;
}

interface TreeConfig {
  x: number;
  baseScale: number;
  variant: number;
}

const TREE_SLOTS: TreeConfig[] = [
  { x: 22, baseScale: 0.85, variant: 0 },
  { x: 44, baseScale: 1.15, variant: 1 },
  { x: 66, baseScale: 0.95, variant: 2 },
  { x: 88, baseScale: 1.05, variant: 0 },
  { x: 108, baseScale: 0.8, variant: 1 },
  { x: 128, baseScale: 1.0, variant: 2 },
  { x: 150, baseScale: 0.9, variant: 0 },
  { x: 172, baseScale: 1.1, variant: 1 },
  { x: 196, baseScale: 0.95, variant: 2 },
  { x: 218, baseScale: 1.0, variant: 0 },
  { x: 240, baseScale: 0.85, variant: 1 },
  { x: 262, baseScale: 1.05, variant: 2 },
  { x: 284, baseScale: 0.9, variant: 0 },
  { x: 306, baseScale: 1.0, variant: 1 },
];

function growthForStreak(streak: number, index: number): number {
  // Each tree unlocks at a different streak threshold and grows gradually.
  const unlockAt = index * 2;
  if (streak <= unlockAt) return 0;
  const growthSpan = 4;
  return Math.min(1, (streak - unlockAt) / growthSpan);
}

function CartoonTree({ x, scale, growth, variant }: { x: number; scale: number; growth: number; variant: number }) {
  if (growth <= 0) return null;

  const trunkH = 14 * scale * growth;
  const crownR = 16 * scale * (0.4 + growth * 0.6);
  const baseY = 150;

  const crownColor = variant === 0 ? '#34a853' : variant === 1 ? '#2e8b4e' : '#3ba864';
  const crownDark = variant === 0 ? '#1e7a3a' : variant === 1 ? '#1a6a30' : '#228a45';

  return (
    <g transform={`translate(${x}, ${baseY})`} style={{ transition: 'all 0.8s ease-out' }}>
      {/* Trunk */}
      <rect
        x={-3 * scale}
        y={-trunkH}
        width={6 * scale}
        height={trunkH}
        rx={2}
        fill="#6b4423"
      />
      {/* Crown layers */}
      <circle cx={0} cy={-trunkH - crownR * 0.55} r={crownR} fill={crownColor} />
      <circle cx={-crownR * 0.55} cy={-trunkH - crownR * 0.25} r={crownR * 0.7} fill={crownColor} />
      <circle cx={crownR * 0.55} cy={-trunkH - crownR * 0.25} r={crownR * 0.7} fill={crownColor} />
      <circle cx={0} cy={-trunkH - crownR * 0.85} r={crownR * 0.6} fill={crownDark} opacity={0.35} />
    </g>
  );
}

function Sapling({ x, growth }: { x: number; growth: number }) {
  if (growth <= 0) return null;
  const h = 10 * growth;
  return (
    <g transform={`translate(${x}, 150)`} style={{ transition: 'all 0.6s ease-out' }}>
      <rect x={-1} y={-h} width={2} height={h} rx={1} fill="#7a5230" />
      <ellipse cx={0} cy={-h - 3} rx={5 * growth} ry={4 * growth} fill="#5cb85c" />
      <ellipse cx={-3 * growth} cy={-h - 1} rx={3 * growth} ry={2.5 * growth} fill="#4aa84a" />
    </g>
  );
}

function GrassTuft({ x, growth }: { x: number; growth: number }) {
  if (growth <= 0) return null;
  return (
    <g transform={`translate(${x}, 150)`} style={{ transition: 'all 0.5s ease-out' }}>
      <path
        d={`M0 0 Q -2 ${-6 * growth} -3 ${-8 * growth} M0 0 Q 0 ${-7 * growth} 0 ${-9 * growth} M0 0 Q 2 ${-6 * growth} 3 ${-8 * growth}`}
        stroke="#5cb85c"
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
}

function Cloud({ x, y, scale, delay }: { x: number; y: number; scale: number; delay: number }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`} style={{ animation: `cloudDrift ${30 + delay}s linear infinite` }}>
      <ellipse cx={0} cy={0} rx={18} ry={9} fill="white" opacity={0.92} />
      <ellipse cx={-12} cy={2} rx={11} ry={7} fill="white" opacity={0.92} />
      <ellipse cx={12} cy={2} rx={11} ry={7} fill="white" opacity={0.92} />
      <ellipse cx={0} cy={-4} rx={10} ry={6} fill="white" opacity={0.92} />
    </g>
  );
}

export function ForestScene({ streak, className }: ForestSceneProps) {
  const isCharred = streak === 0;

  const trees = useMemo(
    () =>
      TREE_SLOTS.map((slot, i) => ({
        ...slot,
        growth: growthForStreak(streak, i),
      })),
    [streak],
  );

  const saplingPositions = useMemo(
    () => [12, 34, 56, 78, 100, 122, 144, 166, 188, 210, 232, 254, 276, 298, 320],
    [],
  );

  const grassPositions = useMemo(
    () => [18, 30, 52, 74, 96, 118, 140, 162, 184, 206, 228, 250, 272, 294, 316],
    [],
  );

  // Ground color shifts from charred to green
  const groundTop = isCharred ? '#3a2a22' : streak >= 7 ? '#3d8a3d' : streak >= 3 ? '#5a6e3a' : '#4a4a2a';
  const groundBottom = isCharred ? '#2a1c16' : streak >= 7 ? '#2d6e2d' : streak >= 3 ? '#3a4e2a' : '#2a2a1a';
  const hillColor = isCharred ? '#4a3a30' : streak >= 14 ? '#4ea65a' : streak >= 7 ? '#5a8a4a' : '#5a5a3a';

  return (
    <div className={className}>
      <svg viewBox="0 0 340 160" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isCharred ? '#8a7a6e' : '#aee0f5'} />
            <stop offset="100%" stopColor={isCharred ? '#6a5a4e' : '#d4eef9'} />
          </linearGradient>
          <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={groundTop} />
            <stop offset="100%" stopColor={groundBottom} />
          </linearGradient>
          <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={isCharred ? '#c9a050' : '#fff5c8'} />
            <stop offset="70%" stopColor={isCharred ? '#a07840' : '#ffd966'} />
            <stop offset="100%" stopColor={isCharred ? '#806030' : '#ffb84d'} stopOpacity="0.6" />
          </radialGradient>
        </defs>

        {/* Sky */}
        <rect x={0} y={0} width={340} height={160} fill="url(#skyGrad)" />

        {/* Sun */}
        <circle cx={290} cy={32} r={20} fill="url(#sunGrad)" />
        {streak >= 3 && (
          <circle cx={290} cy={32} r={26} fill="url(#sunGrad)" opacity={0.25} />
        )}

        {/* Clouds */}
        <Cloud x={60} y={28} scale={0.9} delay={0} />
        <Cloud x={200} y={20} scale={0.7} delay={8} />

        {/* Distant hills */}
        <ellipse cx={80} cy={150} rx={90} ry={32} fill={hillColor} opacity={0.55} />
        <ellipse cx={260} cy={150} rx={100} ry={36} fill={hillColor} opacity={0.45} />

        {/* Ground */}
        <rect x={0} y={150} width={340} height={10} fill="url(#groundGrad)" />

        {/* Grass tufts */}
        {!isCharred &&
          grassPositions.map((x, i) => (
            <GrassTuft key={`grass-${i}`} x={x} growth={growthForStreak(streak, i + 2)} />
          ))}

        {/* Saplings (smaller, appear first) */}
        {!isCharred &&
          saplingPositions.map((x, i) => {
            const g = growthForStreak(streak, i + 1);
            // Only show saplings where there's no full tree yet
            const hasTree = trees.some((t) => Math.abs(t.x - x) < 14 && t.growth > 0.3);
            if (hasTree) return null;
            return <Sapling key={`sap-${i}`} x={x} growth={g * 0.7} />;
          })}

        {/* Trees */}
        {trees.map((t, i) => (
          <CartoonTree key={`tree-${i}`} x={t.x} scale={t.baseScale} growth={t.growth} variant={t.variant} />
        ))}

        {/* Ash/soot particles when charred */}
        {isCharred && (
          <>
            <circle cx={50} cy={40} r={2} fill="#333" opacity={0.4} />
            <circle cx={120} cy={60} r={1.5} fill="#333" opacity={0.3} />
            <circle cx={220} cy={45} r={2} fill="#333" opacity={0.35} />
            <circle cx={280} cy={70} r={1.5} fill="#333" opacity={0.3} />
            <circle cx={160} cy={55} r={1} fill="#333" opacity={0.25} />
          </>
        )}

        {/* Flowers at high streak */}
        {streak >= 14 &&
          [40, 90, 140, 190, 240, 290].map((x, i) => (
            <g key={`flower-${i}`} transform={`translate(${x}, 150)`}>
              <rect x={-0.5} y={-5} width={1} height={5} fill="#4a8a3a" />
              <circle cx={0} cy={-6} r={2.5} fill={i % 2 === 0 ? '#f06292' : '#ffd54f'} />
              <circle cx={0} cy={-6} r={1} fill="#fff5c8" />
            </g>
          ))}
      </svg>
    </div>
  );
}
