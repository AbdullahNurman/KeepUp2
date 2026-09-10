import { useEffect, useState } from 'react';
import { BreathingPhase } from '@/types/session';

interface BreathingAnimationProps {
  phase: BreathingPhase;
  phaseIndex: number;
  cycle: number;
  totalCycles: number;
}

export function BreathingAnimation({ phase, phaseIndex, cycle, totalCycles }: BreathingAnimationProps) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (phase.label === 'Nefes Al') {
      setScale(1.35);
    } else if (phase.label === 'Nefes Ver') {
      setScale(0.85);
    } else {
      setScale(1.1);
    }
  }, [phase.label, phaseIndex]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative flex h-64 w-64 items-center justify-center">
        <div
          className="absolute h-48 w-48 rounded-full bg-emerald-200/40 transition-transform ease-in-out"
          style={{
            transform: `scale(${scale})`,
            transitionDuration: `${phase.duration}s`,
          }}
        />
        <div
          className="absolute h-40 w-40 rounded-full bg-emerald-300/50 transition-transform ease-in-out"
          style={{
            transform: `scale(${scale})`,
            transitionDuration: `${phase.duration}s`,
          }}
        />
        <div
          className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg transition-transform ease-in-out"
          style={{
            transform: `scale(${scale})`,
            transitionDuration: `${phase.duration}s`,
          }}
        >
          <span className="text-lg font-bold drop-shadow">{phase.label}</span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">{phase.instruction}</p>
        <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          Döngü {cycle + 1} / {totalCycles}
        </p>
      </div>
    </div>
  );
}
