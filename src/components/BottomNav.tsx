import { Home, GraduationCap, TrendingUp, User } from 'lucide-react';

export type RootTab = 'home' | 'selection' | 'growth' | 'profile';

interface BottomNavProps {
  active: RootTab;
  onChange: (tab: RootTab) => void;
}

const items: { id: RootTab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'selection', label: 'Selection\n(YKS-LGS)', icon: GraduationCap },
  { id: 'growth', label: 'Growth', icon: TrendingUp },
  { id: 'profile', label: 'Profile', icon: User },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="sticky bottom-0 z-20 border-t border-gray-100 bg-gray-50/95 px-3 pb-3 pt-2 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
      <div className="mx-auto flex max-w-md items-start justify-between">
        {items.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="flex flex-1 flex-col items-center gap-1 py-1 transition-colors"
            >
              <span
                className={`flex h-11 w-16 items-center justify-center rounded-full transition-colors ${
                  isActive
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span
                className={`whitespace-pre-line text-center text-[11px] leading-tight ${
                  isActive
                    ? 'font-semibold text-gray-900 dark:text-gray-100'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
