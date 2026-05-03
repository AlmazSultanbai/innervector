'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase, Analysis } from '@/lib/supabase';
import { getDomainForStrength, DOMAIN_COLORS } from '@/lib/strengths';
import { Domain } from '@/lib/types';
import { useAuth } from '@/components/LoginModal';
import LangToggle from '@/components/LangToggle';
import { useLang } from '@/lib/LanguageContext';

function domainColor(d: Domain | null) {
  if (!d) return '#94a3b8';
  const map: Record<Domain, string> = {
    Executing: '#60a5fa',
    Influencing: '#fb923c',
    'Relationship Building': '#34d399',
    'Strategic Thinking': '#a78bfa',
  };
  return map[d];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

async function downloadPDF(analysis: Analysis) {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageW = 210;
  const margin = 18;
  const contentW = pageW - margin * 2;
  let y = 20;

  // --- Header bar ---
  doc.setFillColor(13, 17, 30);
  doc.rect(0, 0, pageW, 40, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(212, 168, 67);
  doc.text('CliftonStrengths', margin, 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text('Gallup CliftonStrengths® Analysis Report', margin, 25);

  // Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  const displayName = analysis.full_name?.trim() || 'Anonymous';
  doc.text(displayName, margin, 35);

  // Date (right)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  const dateStr = analysis.created_at ? formatDate(analysis.created_at) : '';
  doc.text(dateStr, pageW - margin, 35, { align: 'right' });

  y = 52;

  // --- Strengths section ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(212, 168, 67);
  doc.text('TOP STRENGTHS', margin, y);
  y += 6;

  const strengths: string[] = analysis.strengths;
  const cols = 2;
  const colW = contentW / cols;

  strengths.forEach((s, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = margin + col * colW;
    const rowY = y + row * 9;

    const domain = getDomainForStrength(s);
    const [r, g, b] = hexToRgb(domainColor(domain));
    doc.setFillColor(r, g, b);
    doc.circle(x + 2.5, rowY - 1.5, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(60, 70, 90);
    doc.text(`${i + 1}.`, x + 5.5, rowY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 40, 60);
    doc.text(s, x + 10, rowY);
  });

  y += Math.ceil(strengths.length / cols) * 9 + 8;

  // --- Analysis section ---
  let analysisData: Record<string, unknown> = {};
  try {
    const cleaned = analysis.analysis.trim()
      .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
    analysisData = JSON.parse(cleaned);
  } catch { /* raw text fallback */ }

  const sections: { label: string; value: string | string[] }[] = [];

  if (analysisData.talentDNA)
    sections.push({ label: 'Talent DNA', value: analysisData.talentDNA as string });
  if (analysisData.superpower)
    sections.push({ label: 'Superpower', value: analysisData.superpower as string });
  if (analysisData.strengthsInteraction)
    sections.push({ label: 'How Strengths Interact', value: analysisData.strengthsInteraction as string });
  if (Array.isArray(analysisData.blindSpots) && analysisData.blindSpots.length)
    sections.push({ label: 'Blind Spots', value: (analysisData.blindSpots as string[]) });

  // Famous people
  if (Array.isArray(analysisData.famousPeople) && analysisData.famousPeople.length) {
    const names = (analysisData.famousPeople as { name: string }[]).map(p => p.name).join(', ');
    sections.push({ label: 'Similar Profiles', value: names });
  }

  // Career titles
  if (Array.isArray(analysisData.careers) && analysisData.careers.length) {
    const careers = (analysisData.careers as { title: string }[]).map(c => c.title).join(', ');
    sections.push({ label: 'Best Career Paths', value: careers });
  }

  for (const section of sections) {
    if (y > 265) {
      doc.addPage();
      y = 20;
    }

    // Section label
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(margin, y - 4, contentW, 6, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(section.label.toUpperCase(), margin + 3, y);
    y += 5;

    // Value
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);

    if (Array.isArray(section.value)) {
      for (const item of section.value) {
        const lines = doc.splitTextToSize(`• ${item}`, contentW - 4);
        if (y + lines.length * 5 > 270) { doc.addPage(); y = 20; }
        doc.text(lines, margin + 2, y);
        y += lines.length * 5 + 1;
      }
    } else {
      const lines = doc.splitTextToSize(section.value, contentW - 2);
      if (y + lines.length * 5 > 270) { doc.addPage(); y = 20; }
      doc.text(lines, margin + 2, y);
      y += lines.length * 5;
    }
    y += 7;
  }

  // Footer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalPages = (doc as any).internal.getNumberOfPages() as number;
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('Generated by MindVector · Gallup CliftonStrengths®', margin, 292);
    doc.text(`${p} / ${totalPages}`, pageW - margin, 292, { align: 'right' });
  }

  const safeName = displayName.replace(/\s+/g, '_');
  doc.save(`CliftonStrengths_${safeName}.pdf`);
}

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

export default function HistoryPage() {
  const router = useRouter();
  const { authed } = useAuth();
  const { lang } = useLang();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (authed === false) { router.replace('/'); return; }
    if (authed === null) return;

    supabase
      .from('analyses')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setAnalyses(data ?? []);
        setLoading(false);
      });
  }, [authed, router]);

  if (authed === null || loading) {
    return <div className="min-h-screen bg-radial" />;
  }

  const filtered = analyses.filter((a) =>
    (a.full_name ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const handleDownload = async (a: Analysis) => {
    setDownloading(a.id ?? '');
    await downloadPDF(a);
    setDownloading(null);
  };

  return (
    <div className="min-h-screen bg-radial flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {lang === 'ru' ? 'Назад' : 'Back'}
          </button>
          <span className="text-white/10">|</span>
          <span className="text-gold/70 text-xs font-medium tracking-widest uppercase">
            {lang === 'ru' ? 'История анализов' : 'Analysis History'}
          </span>
        </div>
        <LangToggle />
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-serif text-3xl font-bold text-white">
              {lang === 'ru' ? 'Все профили' : 'All Profiles'}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {filtered.length} {lang === 'ru' ? 'записей' : 'records'}
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === 'ru' ? 'Поиск по имени...' : 'Search by name...'}
              className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold/40 transition-all text-sm w-52"
            />
          </div>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-600">
            <svg className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {lang === 'ru' ? 'Нет записей' : 'No records found'}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((a, idx) => {
              const strengths: string[] = a.strengths ?? [];
              const isDownloading = downloading === a.id;

              return (
                <div
                  key={a.id ?? idx}
                  className="group flex items-center gap-4 p-4 rounded-2xl border border-white/8 bg-white/3 hover:bg-white/5 hover:border-white/12 transition-all duration-200"
                >
                  {/* Index */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 text-xs font-bold">
                    {idx + 1}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-white font-semibold text-sm truncate">
                        {a.full_name?.trim() || <span className="text-slate-600 italic">Anonymous</span>}
                      </span>
                      <span className="text-slate-600 text-xs flex-shrink-0">
                        {a.created_at ? formatDate(a.created_at) : ''}
                      </span>
                    </div>

                    {/* Strength dots */}
                    <div className="flex flex-wrap gap-1">
                      {strengths.slice(0, 10).map((s, i) => {
                        const domain = getDomainForStrength(s);
                        const colors = domain ? DOMAIN_COLORS[domain] : null;
                        return (
                          <span
                            key={s}
                            title={`${i + 1}. ${s}`}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${colors ? `${colors.bg} ${colors.text} ${colors.border}` : 'bg-white/5 text-slate-400 border-white/10'}`}
                          >
                            <span className="opacity-50 text-[10px] font-bold">{i + 1}</span>
                            {s}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Download PDF */}
                  <button
                    onClick={() => handleDownload(a)}
                    disabled={isDownloading}
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-gold/10 border border-gold/20 text-gold text-xs font-medium hover:bg-gold/20 transition-all duration-200 disabled:opacity-50"
                    title="Download PDF"
                  >
                    {isDownloading ? (
                      <span className="w-3.5 h-3.5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                    PDF
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="text-center py-6 text-slate-600 text-xs border-t border-white/5">
        MindVector · Gallup CliftonStrengths®
      </footer>
    </div>
  );
}
