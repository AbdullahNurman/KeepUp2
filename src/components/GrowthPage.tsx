import { Flame, Brain, Dumbbell, Calendar } from 'lucide-react';
import { ActivityLogRow } from '@/lib/supabase';

interface GrowthPageProps {
  rows: ActivityLogRow[];
}

function toDayKey(iso: string): string {
  return new Date(iso).toDateString();
}

export function GrowthPage({ rows }: GrowthPageProps) {
  const meditationCount = rows.filter((r) => r.activity_type === 'meditation').length;
  const exerciseCount = rows.filter((r) => r.activity_type === 'exercise').length;
  const moodCount = rows.filter((r) => r.activity_type === 'mood').length;

  const activeDays = new Set(rows.map((r) => toDayKey(r.created_at)));
  const streak = computeStreak(rows);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const dayLabels = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Gelişimin</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">İlerlemeni takip et, motivasyonunu koru.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Flame} label="Günlük Seri" value={`${streak} gün`} accent="orange" />
        <StatCard icon={Calendar} label="Aktif Gün" value={`${activeDays.size} gün`} accent="emerald" />
        <StatCard icon={Brain} label="Meditasyon" value={`${meditationCount} kez`} accent="sky" />
        <StatCard icon={Dumbbell} label="Egzersiz" value={`${exerciseCount} kez`} accent="amber" />
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
        <h3 className="mb-4 text-sm font-bold text-gray-900 dark:text-gray-100">Son 7 Gün</h3>
        <div className="flex items-end justify-between gap-2">
          {last7Days.map((d) => {
            const isToday = d.toDateString() === new Date().toDateString();
            const hasActivity = activeDays.has(d.toDateString());
            return (
              <div key={d.toISOString()} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className={`flex h-20 w-full items-end justify-center rounded-lg ${
                    hasActivity ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  {hasActivity && <div className="h-12 w-full rounded-lg bg-gradient-to-t from-emerald-500 to-emerald-400" />}
                </div>
                <span className={`text-[11px] ${isToday ? 'font-bold text-emerald-700 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {dayLabels[d.getDay()]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
        <h3 className="mb-3 text-sm font-bold text-gray-900 dark:text-gray-100">Ruh Hali Kayıtları</h3>
        {moodCount === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">Henüz ruh hali kaydı yok. Ana sayfadan bugün nasıl hissettiğini seç!</p>
        ) : (
          <div className="space-y-2">
            {rows
              .filter((r) => r.activity_type === 'mood')
              .slice(0, 5)
              .map((r) => (
                <div key={r.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">{moodLabel(r.activity_value)}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(r.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function computeStreak(rows: ActivityLogRow[]): number {
  if (rows.length === 0) return 0;
  const activeDays = new Set(rows.map((row) => toDayKey(row.created_at)));
  let streak = 0;
  const cursor = new Date();
  if (!activeDays.has(cursor.toDateString())) {
    cursor.setDate(cursor.getDate() - 1);
    if (!activeDays.has(cursor.toDateString())) return 0;
  }
  while (activeDays.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function moodLabel(key: string): string {
  const labels: Record<string, string> = {
    yorgun: '😴 Yorgun',
    stresli: '😣 Stresli',
    normal: '😐 Normal',
    iyi: '😊 İyi',
  };
  return labels[key] ?? key;
}

interface StatCardProps {
  icon: typeof Flame;
  label: string;
  value: string;
  accent: 'orange' | 'emerald' | 'sky' | 'amber';
}

function StatCard({ icon: Icon, label, value, accent }: StatCardProps) {
  const colors = {
    orange: { bg: 'bg-orange-50 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' },
    sky: { bg: 'bg-sky-50 dark:bg-sky-900/30', text: 'text-sky-600 dark:text-sky-400' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' },
  };
  const c = colors[accent];
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
      <span className={`flex h-10 w-10 items-center justify-center rounded-full ${c.bg}`}>
        <Icon className={`h-5 w-5 ${c.text}`} />
      </span>
      <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}
