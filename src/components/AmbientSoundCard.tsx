import { CloudRain, Waves, Trees, AudioLines, Volume2, VolumeX, Square } from 'lucide-react';
import { AmbientSound, AMBIENT_OPTIONS } from '@/hooks/useAmbientSound';

interface AmbientSoundCardProps {
  currentSound: AmbientSound | null;
  volume: number;
  onToggle: (sound: AmbientSound) => void;
  onStop: () => void;
  onVolumeChange: (vol: number) => void;
}

const ICONS: Record<AmbientSound, typeof CloudRain> = {
  rain: CloudRain,
  ocean: Waves,
  forest: Trees,
  'white-noise': AudioLines,
};

export function AmbientSoundCard({
  currentSound,
  volume,
  onToggle,
  onStop,
  onVolumeChange,
}: AmbientSoundCardProps) {
  const isPlaying = currentSound !== null;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Rahatlatıcı Sesler</h3>
        </div>
        {isPlaying && (
          <button
            onClick={onStop}
            aria-label="Sesi durdur"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Square className="h-3.5 w-3.5" fill="currentColor" />
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2.5">
        {AMBIENT_OPTIONS.map((opt) => {
          const isActive = currentSound === opt.id;
          const Icon = ICONS[opt.id];
          return (
            <button
              key={opt.id}
              onClick={() => onToggle(opt.id)}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 px-1 py-3 transition-all ${
                isActive
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                  : 'border-transparent bg-gray-50 hover:border-emerald-200 dark:bg-gray-800 dark:hover:border-emerald-700'
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span
                className={`text-[11px] font-medium ${
                  isActive ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Volume slider */}
      {isPlaying && (
        <div className="mt-4 flex items-center gap-3">
          {volume === 0 ? (
            <VolumeX className="h-4 w-4 flex-shrink-0 text-gray-400" />
          ) : (
            <Volume2 className="h-4 w-4 flex-shrink-0 text-gray-400" />
          )}
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-gray-200 accent-emerald-600 dark:bg-gray-700"
          />
        </div>
      )}
    </div>
  );
}
