import { supabase, ActivityLogRow, ActivityType } from '@/lib/supabase';

export async function logActivity(activityType: ActivityType, activityValue: string) {
  const { error } = await supabase
    .from('activity_log')
    .insert({ activity_type: activityType, activity_value: activityValue });
  if (error) throw error;
}

export async function fetchRecentActivity(days: number): Promise<ActivityLogRow[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data, error } = await supabase
    .from('activity_log')
    .select('id, activity_type, activity_value, created_at')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

function toDayKey(iso: string): string {
  return new Date(iso).toDateString();
}

export function computeStreak(rows: ActivityLogRow[]): number {
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

export function todaysMood(rows: ActivityLogRow[]): string | null {
  const today = new Date().toDateString();
  const todaysMoodRow = rows.find(
    (row) => row.activity_type === 'mood' && toDayKey(row.created_at) === today,
  );
  return todaysMoodRow?.activity_value ?? null;
}
