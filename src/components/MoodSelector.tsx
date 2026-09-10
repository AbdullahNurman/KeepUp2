interface Mood {
  key: string;
  label: string;
  emoji: string;
}

const moods: Mood[] = [
  { key: 'yorgun', label: 'Yorgun', emoji: '😴' },
  { key: 'stresli', label: 'Stresli', emoji: '😣' },
  { key: 'normal', label: 'Normal', emoji: '😐' },
  { key: 'iyi', label: 'İyi', emoji: '😊' },
];

interface MoodSelectorProps {
  selected: string | null;
  onSelect: (mood: string) => void;
}

export function MoodSelector({ selected, onSelect }: MoodSelectorProps) {
  return (
    <div>
      <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-gray-100">Nasıl Hissediyorsun?</h2>
      <div className="grid grid-cols-4 gap-2.5">
        {moods.map((mood) => {
          const isActive = selected === mood.key;
          return (
            <button
              key={mood.key}
              onClick={() => onSelect(mood.key)}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 bg-emerald-50/70 px-2 py-4 transition-all dark:bg-emerald-900/20 ${
                isActive
                  ? 'border-emerald-500 bg-white shadow-sm dark:bg-gray-800'
                  : 'border-transparent hover:border-emerald-200 dark:hover:border-emerald-700'
              }`}
            >
              <span className="text-2xl">{mood.emoji}</span>
              <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{mood.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
