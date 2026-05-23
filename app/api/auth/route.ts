import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { signValue } from '@/lib/session';

export const maxDuration = 30;

const adminLogin = process.env.ADMIN_LOGIN;
const adminPassword = process.env.ADMIN_PASSWORD;
const superadminPassword = process.env.SUPERADMIN_PASSWORD;

if (!adminLogin || !adminPassword || !superadminPassword) {
  console.error('CRITICAL: ADMIN_LOGIN, ADMIN_PASSWORD, or SUPERADMIN_PASSWORD env vars are not set. Admin login is disabled.');
}

const ADMIN_CREDENTIALS = (adminLogin && adminPassword && superadminPassword)
  ? [
      { login: adminLogin, password: adminPassword, role: 'admin' },
      { login: adminLogin, password: superadminPassword, role: 'superadmin' },
    ]
  : [];

export async function POST(req: NextRequest) {
  const { login, password } = await req.json();
  if (!login || !password) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
  }

  const u = login.trim().toLowerCase();
  const p = password.trim();

  // 1. Check hardcoded admin credentials
  const admin = ADMIN_CREDENTIALS.find(c => c.login === u && c.password === p);
  if (admin) {
    const cookieStore = await cookies();
    cookieStore.set('iv_role', signValue(admin.role), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8, // 8 hours
    });
    return NextResponse.json({ role: admin.role });
  }

  // 2. Check clients table (credentials sent via Telegram bot)
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data: client, error } = await supabase
      .from('clients')
      .select('login, password, telegram_id')
      .eq('login', u)
      .limit(1)
      .single();

    if (error || !client) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (client.password !== p) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Get share_token from bot_users
    const { data: botUser } = await supabase
      .from('bot_users')
      .select('share_token')
      .eq('tg_id', client.telegram_id)
      .limit(1)
      .single();

    const shareToken = botUser?.share_token ?? null;

    // Get analysis id from analyses table
    let analysisId: string | null = null;
    if (shareToken) {
      const { data: analysis } = await supabase
        .from('analyses')
        .select('id')
        .eq('share_token', shareToken)
        .limit(1)
        .single();
      analysisId = analysis?.id ?? null;
    }

    return NextResponse.json({
      role: 'client',
      telegram_id: client.telegram_id,
      share_token: shareToken,
      analysis_id: analysisId,
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
