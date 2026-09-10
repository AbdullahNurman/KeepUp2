export type Accent = 'emerald' | 'sky' | 'amber' | 'rose';

interface AccentTheme {
  bgSoft: string;
  bgSolid: string;
  text: string;
  ring: string;
  gradient: string;
}

export const accentThemes: Record<Accent, AccentTheme> = {
  emerald: {
    bgSoft: 'bg-emerald-50',
    bgSolid: 'bg-emerald-600',
    text: 'text-emerald-700',
    ring: 'ring-emerald-200',
    gradient: 'from-emerald-500 to-emerald-700',
  },
  sky: {
    bgSoft: 'bg-sky-50',
    bgSolid: 'bg-sky-600',
    text: 'text-sky-700',
    ring: 'ring-sky-200',
    gradient: 'from-sky-500 to-sky-700',
  },
  amber: {
    bgSoft: 'bg-amber-50',
    bgSolid: 'bg-amber-500',
    text: 'text-amber-700',
    ring: 'ring-amber-200',
    gradient: 'from-amber-400 to-amber-600',
  },
  rose: {
    bgSoft: 'bg-rose-50',
    bgSolid: 'bg-rose-500',
    text: 'text-rose-700',
    ring: 'ring-rose-200',
    gradient: 'from-rose-400 to-rose-600',
  },
};
