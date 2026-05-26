import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 60; // cache for 60 seconds

export async function GET() {
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Count Gallup analyses (with a name)
    const { count: analysesCount, error: e1 } = await sb
      .from('analyses')
      .select('*', { count: 'exact', head: true })
      .not('full_name', 'is', null)
      .neq('full_name', '');

    // Count unique vector test sessions (deduplicate by session_id)
    const { data: sessions, error: e2 } = await sb
      .from('vector_test_results')
      .select('session_id');

    if (e1 || e2) throw e1 ?? e2;

    const uniqueSessions = new Set((sessions ?? []).map((r: { session_id: string }) => r.session_id)).size;
    const total = (analysesCount ?? 0) + uniqueSessions;

    return NextResponse.json({ count: total });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
