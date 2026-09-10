import { Play } from 'lucide-react';
import { GuidedSession } from '@/types/session';
import { accentThemes } from '@/lib/accentTheme';

interface SessionListItemProps {
  session: GuidedSession;
  onSelect: (session: GuidedSession) => void;
}

export function SessionListItem({ session, onSelect }: SessionListItemProps) {
  const theme = accentThemes[session.accent];

  return (
    <button
      onClick={() => onSelect(session)}
      className="flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-gray-100 transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-900 dark:ring-gray-800"
    >
      <span
        className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${theme.gradient} text-white shadow-sm`}
      >
        <Play className="h-6 w-6" fill="currentColor" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold text-gray-900 dark:text-gray-100">{session.title}</p>
        <p className="truncate text-xs leading-relaxed text-gray-500 dark:text-gray-400">{session.subtitle}</p>
      </div>
      <span className={`flex-shrink-0 rounded-full ${theme.bgSoft} px-3 py-1 text-xs font-semibold ${theme.text}`}>
        {session.durationLabel}
      </span>
    </button>
  );
}
