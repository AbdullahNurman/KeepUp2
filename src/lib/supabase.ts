import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ActivityType = 'mood' | 'meditation' | 'exercise';

export interface ActivityLogRow {
  id: string;
  activity_type: ActivityType;
  activity_value: string;
  created_at: string;
}
