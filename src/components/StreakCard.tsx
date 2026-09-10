import { Flame, Leaf } from 'lucide-react';
import { ForestScene } from '@/components/ForestScene';

interface StreakCardProps {
  streak: number;
}

interface ForestStage {
  label: string;
  detail: string;
  nextMilestone: number;
}

function getForestStage(streak: number): ForestStage {
  if (streak >= 30) {
    return { label: 'Canlanan koru', detail: 'Ormanın kalbi yeniden yeşeriyor.', nextMilestone: 30 };
  }
  if (streak >= 14) {
    return { label: 'Genç orman', detail: 'Fidanların artık kendi gölgelerini oluşturuyor.', nextMilestone: 30 };
  }
  if (streak >= 7) {
    return { label: 'Filizlenen alan', detail: 'İlk fidanlar küllerin arasından yükseliyor.', nextMilestone: 14 };
  }
  return { label: 'Küller arasında ilk filiz', detail: 'Her gün ormana yeni bir hayat katıyor.', nextMilestone: 7 };
}

export function StreakCard({ streak }: StreakCardProps) {
  const stage = getForestStage(streak);
  const previousMilestone =
    stage.nextMilestone === 7 ? 0 : stage.nextMilestone === 14 ? 7 : stage.nextMilestone === 30 ? 14 : 30;
  const progress =
    stage.nextMilestone === 30 && streak >= 30
      ? 100
      : Math.min(100, ((streak - previousMilestone) / (stage.nextMilestone - previousMilestone)) * 100);

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
      {/* Cartoon forest scene window */}
      <div className="relative h-44 w-full overflow-hidden">
        <ForestScene streak={streak} className="h-full w-full" />

        {/* Level badge overlay */}
        <div className="absolute right-3 top-3 rounded-full bg-black/35 px-3 py-1.5 text-right backdrop-blur-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-100">Orman seviyesi</p>
          <p className="text-sm font-bold text-white">{stage.label}</p>
        </div>

        {/* Flame badge */}
        <div className="absolute left-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
          <Flame className="h-5 w-5 text-orange-400" fill="currentColor" />
        </div>
      </div>

      {/* Info panel */}
      <div className="p-5">
        <div className="flex items-end gap-2">
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{streak}</p>
          <p className="pb-1 text-base font-semibold text-gray-600 dark:text-gray-400">günlük seri</p>
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{stage.detail}</p>
        <div className="mt-3 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <Leaf className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
        </div>
        <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
          {streak >= 30
            ? 'Ormanın büyümeye devam ediyor.'
            : `${Math.max(0, stage.nextMilestone - streak)} gün sonra yeni fidanlar`}
        </p>
      </div>
    </div>
  );
}
