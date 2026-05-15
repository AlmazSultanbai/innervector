import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { verifyValue } from '@/lib/session';

export const maxDuration = 30;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function GET() {
  // Only admin and superadmin may access this endpoint
  const cookieStore = await cookies();
  const signed = cookieStore.get('iv_role')?.value ?? '';
  const role = verifyValue(signed);
  if (role !== 'admin' && role !== 'superadmin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sb = getSupabase();

    // ── Analyses ─────────────────────────────────────────────────────────────
    const { data: analyses } = await sb
      .from('analyses')
      .select('id, full_name, lang, strengths, created_at, share_token, gallup_file_url')
      .order('created_at', { ascending: false });

    const realAnalyses = (analyses ?? []).filter(
      (a) => a.full_name?.trim() && a.full_name.trim() !== '',
    );

    // By language
    const langCount = realAnalyses.reduce<Record<string, number>>((acc, a) => {
      const l = a.lang ?? 'en';
      acc[l] = (acc[l] ?? 0) + 1;
      return acc;
    }, {});

    // Top strengths in top-3 positions
    const strengthFreq: Record<string, number> = {};
    realAnalyses.forEach((a) => {
      const arr: string[] = a.strengths ?? [];
      arr.slice(0, 3).forEach((s) => {
        strengthFreq[s] = (strengthFreq[s] ?? 0) + 1;
      });
    });
    const topStrengths = Object.entries(strengthFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Activity last 14 days
    const now = new Date();
    const activity: { date: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const count = realAnalyses.filter(
        (a) => a.created_at?.slice(0, 10) === dateStr,
      ).length;
      activity.push({ date: dateStr, count });
    }

    // Today & this week
    const todayStr = now.toISOString().slice(0, 10);
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const todayCount = realAnalyses.filter((a) => a.created_at?.slice(0, 10) === todayStr).length;
    const weekCount = realAnalyses.filter((a) => new Date(a.created_at) >= weekAgo).length;

    // With Gallup PDF
    const withPdf = realAnalyses.filter((a) => a.gallup_file_url).length;

    // ── Bot users ─────────────────────────────────────────────────────────────
    const { data: botUsers } = await sb
      .from('bot_users')
      .select('tg_id, share_token, streak, lang, last_report_date, created_at');

    const { data: botReports } = await sb
      .from('bot_reports')
      .select('id, tg_id, task_id, created_at');

    const { data: botTasks } = await sb
      .from('bot_tasks')
      .select('id, tg_id, day_number, is_completed, completed_at');

    const reportsPerUser: Record<string, number> = {};
    (botReports ?? []).forEach((r) => {
      reportsPerUser[r.tg_id] = (reportsPerUser[r.tg_id] ?? 0) + 1;
    });

    const completedPerUser: Record<string, number> = {};
    (botTasks ?? []).filter((t) => t.is_completed).forEach((t) => {
      completedPerUser[t.tg_id] = (completedPerUser[t.tg_id] ?? 0) + 1;
    });

    // Join bot users with their analysis name
    const tokenToName: Record<string, string> = {};
    realAnalyses.forEach((a) => {
      if (a.share_token) tokenToName[String(a.share_token)] = a.full_name;
    });

    const botUserRows = (botUsers ?? []).map((bu) => ({
      tg_id: bu.tg_id,
      full_name: tokenToName[bu.share_token] ?? null,
      streak: bu.streak ?? 0,
      lang: bu.lang,
      last_report_date: bu.last_report_date,
      joined_at: bu.created_at,
      reports_count: reportsPerUser[bu.tg_id] ?? 0,
      tasks_completed: completedPerUser[bu.tg_id] ?? 0,
    }));

    const totalBotUsers = botUserRows.length;
    const activeToday = botUserRows.filter(
      (u) => u.last_report_date === todayStr,
    ).length;
    const activeThisWeek = botUserRows.filter(
      (u) => u.last_report_date && new Date(u.last_report_date) >= weekAgo,
    ).length;
    const maxStreak = Math.max(0, ...botUserRows.map((u) => u.streak));
    const avgStreak =
      totalBotUsers > 0
        ? botUserRows.reduce((s, u) => s + u.streak, 0) / totalBotUsers
        : 0;
    const totalReports = (botReports ?? []).length;

    // Bot activity last 14 days
    const botActivity: { date: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const count = (botReports ?? []).filter(
        (r) => r.created_at?.slice(0, 10) === dateStr,
      ).length;
      botActivity.push({ date: dateStr, count });
    }

    return NextResponse.json({
      profiles: {
        total: realAnalyses.length,
        todayCount,
        weekCount,
        withPdf,
        langCount,
        topStrengths,
        activity,
        recent: realAnalyses.slice(0, 8).map((a) => ({
          id: a.id,
          full_name: a.full_name,
          lang: a.lang,
          created_at: a.created_at,
          share_token: a.share_token,
          strengths_preview: (a.strengths ?? []).slice(0, 3),
        })),
      },
      bot: {
        totalUsers: totalBotUsers,
        activeToday,
        activeThisWeek,
        totalReports,
        maxStreak,
        avgStreak: Math.round(avgStreak * 10) / 10,
        activity: botActivity,
        users: botUserRows.sort((a, b) => b.reports_count - a.reports_count),
      },
    });
  } catch (err) {
    console.error('Stats error:', err);
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}
