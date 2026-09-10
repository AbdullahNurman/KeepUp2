import { Leaf, Bell, ChevronLeft, Moon, Sun } from 'lucide-react';

interface AppHeaderProps {
  title?: string;
  onBack?: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function AppHeader({ title = 'Keep Up', onBack, isDark, onToggleTheme }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-100 bg-white/95 px-5 py-4 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
      {onBack ? (
        <button
          onClick={onBack}
          aria-label="Geri"
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      ) : (
        <Leaf className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
      )}

      <h1 className="text-xl font-bold tracking-tight text-emerald-900 dark:text-emerald-300">{title}</h1>

      <div className="flex items-center gap-1">
        <button
          onClick={onToggleTheme}
          aria-label={isDark ? 'Açık temaya geç' : 'Koyu temaya geç'}
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        {onBack ? (
          <div className="h-9 w-9" />
        ) : (
          <button
            aria-label="Bildirimler"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-800 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
          </button>
        )}
      </div>
    </header>
  );
}
