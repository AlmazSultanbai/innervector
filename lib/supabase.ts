import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Analysis {
  id?: string;
  username: string;
  full_name: string;
  strengths: string[];
  lang: string;
  analysis: string;
  created_at?: string;
}

export async function saveAnalysis(data: Analysis) {
  const { error } = await supabase.from('analyses').insert(data);
  if (error) console.error('Supabase save error:', error.message);
}

export async function getAnalyses(): Promise<Analysis[]> {
  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Supabase fetch error:', error.message);
    return [];
  }
  return data ?? [];
}
