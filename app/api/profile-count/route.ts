import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 60; // cache for 60 seconds

export async function GET() {
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { count, error } = await sb
      .from('analyses')
      .select('*', { count: 'exact', head: true })
      .not('full_name', 'is', null)
      .neq('full_name', '');

    if (error) throw error;
    return NextResponse.json({ count: count ?? 0 });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
