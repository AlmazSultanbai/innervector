import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('Supabase env vars missing');
    _supabase = createClient(url, key);
  }
  return _supabase;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export interface Analysis {
  id?: string;
  username: string;
  full_name: string;
  strengths: string[];
  lang: string;
  analysis: string;
  created_at?: string;
  share_token?: string;
  gallup_file_url?: string;
}

/** Save analysis.
 *  Returns { error, share_token, duplicate }.
 *  If an identical record (same full_name + same strengths) exists → skips insert,
 *  returns the existing share_token with duplicate:true.
 *  If same name but different strengths → saves new record (person retook the test).
 */
export async function saveAnalysis(data: Analysis): Promise<{ error: string | null; share_token: string | null; duplicate: boolean }> {
  const name = (data.full_name ?? '').trim().toLowerCase();

  // Check for existing record with same name
  const { data: existing } = await supabase
    .from('analyses')
    .select('id, share_token, strengths')
    .ilike('full_name', name)
    .order('created_at', { ascending: false })
    .limit(5);

  if (existing && existing.length > 0) {
    // Compare strengths arrays — same order, same values → duplicate
    const incomingKey = [...(data.strengths ?? [])].join(',');
    const isDuplicate = existing.some((row) => {
      const rowKey = [...(row.strengths ?? [])].join(',');
      return rowKey === incomingKey;
    });

    if (isDuplicate) {
      const existingToken = existing.find((row) => [...(row.strengths ?? [])].join(',') === incomingKey)?.share_token ?? null;
      return { error: null, share_token: existingToken, duplicate: true };
    }
  }

  // New record (first time or different strengths)
  const { error } = await supabase.from('analyses').insert({
    ...data,
    created_at: data.created_at ?? new Date().toISOString(),
  });
  if (error) {
    console.error('Supabase saveAnalysis error:', error.message);
    return { error: error.message, share_token: null, duplicate: false };
  }
  return { error: null, share_token: data.share_token ?? null, duplicate: false };
}

/** Get analysis by share_token (client public link) */
export async function getAnalysisByToken(token: string): Promise<Analysis | null> {
  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('share_token', token)
    .maybeSingle();
  if (error) { console.error('getAnalysisByToken error:', error.message); return null; }
  return data ?? null;
}

export async function getAnalysisById(id: string): Promise<Analysis | null> {
  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) { console.error('getAnalysisById error:', error.message); return null; }
  return data ?? null;
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

// ─── User settings ────────────────────────────────────────────────────────────

/** Read a single setting value (returns null if not found) */
export async function getSetting(key: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();
  if (error) { console.error('getSetting error:', error.message); return null; }
  return data?.value ?? null;
}

/** Upsert a setting (insert or update) */
export async function setSetting(key: string, value: string): Promise<void> {
  const { error } = await supabase
    .from('user_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) console.error('setSetting error:', error.message);
}

// ─── Plans ────────────────────────────────────────────────────────────────────

export interface PlanRecord {
  id: string;
  session_id: string;
  strengths: string[];
  lang: string;
  full_name: string;
  plan: object;
  completed: number[];
  unlocked: number[];
  created_at?: string;
  updated_at?: string;
}

/** Find an existing plan by strengths (device-independent — works from any browser) */
export async function getPlan(
  _session_id: string,
  strengths: string[],
): Promise<PlanRecord | null> {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('strengths', JSON.stringify(strengths))
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) { console.error('getPlan error:', error.message); return null; }
  return data ?? null;
}

/** Insert a new plan row, return its id */
export async function insertPlan(data: Omit<PlanRecord, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
  const { data: row, error } = await supabase
    .from('plans')
    .insert({ ...data, strengths: JSON.stringify(data.strengths) })
    .select('id')
    .single();
  if (error) { console.error('insertPlan error:', error.message); return null; }
  return row?.id ?? null;
}

/** Update completed + unlocked arrays for an existing plan */
export async function updatePlanProgress(
  plan_id: string,
  completed: number[],
  unlocked: number[],
): Promise<void> {
  const { error } = await supabase
    .from('plans')
    .update({ completed: JSON.stringify(completed), unlocked: JSON.stringify(unlocked) })
    .eq('id', plan_id);
  if (error) console.error('updatePlanProgress error:', error.message);
}

// ─── Vector Test Results ──────────────────────────────────────────────────────

export interface VectorAnalysis {
  essence: string
  dominantTheme: string
  whereYouShine: { summary: string; contexts: string[] }
  business: {
    whatYouBring: string
    contributions: Array<{ vector: string; insight: string }>
    whoYouNeed: string
    partners: Array<{ type: string; vectors: string[]; why: string; dynamic: string }>
  }
  love: {
    summary: string
    dynamics: Array<{ vector: string; strength: string; shadow: string }>
    partnerNeeds: string
  }
  blindSpots: string[]
  combinations: Array<{ name: string; vectors: string[]; how: string; atBest: string; risk: string }>
}

export interface VectorTestResult {
  session_id: string
  scores: Record<string, { a: number; b: number }>
  top5: Array<{ name: string; pct: number; d: string }>
  domain_averages: Record<string, number>
  lang?: string
  full_name?: string
  email?: string
  phone?: string
  test_mode?: string
  analysis?: VectorAnalysis | null
}

/** Save vector test result to Supabase. Returns { id, share_token } or null on error. */
export async function saveVectorTestResult(data: VectorTestResult): Promise<{ id: string; share_token: string } | null> {
  const { count } = await supabase
    .from('vector_test_results')
    .select('id', { count: 'exact', head: true })
    .eq('session_id', data.session_id)

  const { data: row, error } = await supabase
    .from('vector_test_results')
    .insert({
      session_id: data.session_id,
      scores: data.scores,
      top5: data.top5,
      domain_averages: data.domain_averages,
      lang: data.lang ?? 'ru',
      retake_count: count ?? 0,
      completed_at: new Date().toISOString(),
      full_name: data.full_name ?? null,
      email: data.email ?? null,
      phone: data.phone ?? null,
      test_mode: data.test_mode ?? 'full',
    })
    .select('id, share_token')
    .single()

  if (error) {
    console.error('saveVectorTestResult error:', error.message)
    return null
  }
  return row ? { id: row.id, share_token: row.share_token } : null
}

/** Fetch a vector test result by share_token (public profile page) */
export async function getVectorResultByToken(token: string): Promise<(VectorTestResult & { id: string; share_token: string; completed_at: string; test_mode: string }) | null> {
  const { data, error } = await supabase
    .from('vector_test_results')
    .select('*')
    .eq('share_token', token)
    .maybeSingle()
  if (error) { console.error('getVectorResultByToken error:', error.message); return null }
  return data ?? null
}
