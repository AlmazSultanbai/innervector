import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Analysis {
  id?: string;
  username: string;
  strengths: string[];
  lang: string;
  analysis: string;
  created_at?: string;
}

export async function saveAnalysis(data: Analysis) {
  const { error } = await supabase.from('analyses').insert(data);
  if (error) console.error('Supabase save error:', error.message);
}
