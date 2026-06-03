'use client';

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AnalysisResult, Domain } from '@/lib/types';
import { getDomainForStrength, DOMAIN_BADGE_COLORS } from '@/lib/strengths';
import { useLang } from '@/lib/LanguageContext';
import { Lang } from '@/lib/i18n';
import { getAnalysisById } from '@/lib/supabase';
import StrengthCard from '@/components/StrengthCard';
import FamousPersonCard from '@/components/FamousPersonCard';
import CareerCard from '@/components/CareerCard';
import IdealPartnerCard from '@/components/IdealPartnerCard';
import CombinationCard from '@/components/CombinationCard';
import LoginModal, { useAuth } from '@/components/LoginModal';


const DOMAIN_ICONS: Record<Domain, string> = {
  Executing: '⚡',
  Influencing: '🔥',
  'Relationship Building': '🌿',
  'Strategic Thinking': '💡',
};

const PAYMENT_LINK = 'https://innervector.co/pay';
const ANALYSIS_PRICE = '$29';

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang, setLang, t } = useLang();
  const { isAuthed, isSuperAdmin, login } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedClient, setCopiedClient] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [pdfLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [agentCount, setAgentCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const agentTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const strengthsRef = useRef<string[]>([]);
  const nameRef = useRef('');
  const initializedRef = useRef(false);
  const skipLangEffectRef = useRef(false);

  const analyze = useCallback(async (strengthList: string[], language: Lang, fullName?: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setElapsed(0);
    setAgentCount(0);
    if (timerRef.current) clearInterval(timerRef.current);
    if (agentTimerRef.current) clearInterval(agentTimerRef.current);
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    // Agents connect one by one: 10 agents over ~20s = every 2s
    let count = 0;
    agentTimerRef.current = setInterval(() => {
      count += 1;
      setAgentCount(count);
      if (count >= 10 && agentTimerRef.current) clearInterval(agentTimerRef.current);
    }, 2000);
    try {
      const gallupFileUrl = sessionStorage.getItem('iv_gallup_file_url') ?? undefined;
      sessionStorage.removeItem('iv_gallup_file_url'); // use once
      // Bottom-5 lesser themes — only if they belong to THIS exact top set (full-34 upload)
      let lesserStrengths: string[] | undefined;
      try {
        const raw = sessionStorage.getItem('iv_lesser_strengths');
        if (raw) {
          const parsed = JSON.parse(raw) as { top: string[]; lesser: string[] };
          if (Array.isArray(parsed.top) && parsed.top.join(',') === strengthList.join(',') && parsed.lesser?.length >= 3) {
            lesserStrengths = parsed.lesser;
          }
        }
      } catch { /* ignore */ }
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strengths: strengthList, lesserStrengths, lang: language, full_name: fullName ?? nameRef.current, gallup_file_url: gallupFileUrl }),
      });
      if (!res.ok) throw new Error('Analysis failed');
      const data: AnalysisResult = await res.json();
      setResult(data);
      if (data.share_token) setShareToken(data.share_token);
    } catch (e) {
      setError(t.errorMessage);
      console.error(e);
    } finally {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      if (agentTimerRef.current) { clearInterval(agentTimerRef.current); agentTimerRef.current = null; }
      setLoading(false);
      // Show confetti only on first creation (flag set by main page before redirect)
      if (sessionStorage.getItem('iv_show_confetti') === '1') {
        sessionStorage.removeItem('iv_show_confetti');
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      }
    }
  }, [t.errorMessage]);

  // Initial load — read strengths + lang from URL
  // Supports two modes:
  //   ?id=uuid          → load saved analysis from Supabase (history view, instant)
  //   ?s=A,B,C&lang=en  → run fresh analysis via API
  useEffect(() => {
    const analysisId = searchParams.get('id');
    const urlLang = searchParams.get('lang') as Lang | null;
    const activeLang: Lang = urlLang === 'ru' ? 'ru' : urlLang === 'ky' ? 'ky' : 'en';

    if (analysisId) {
      // ── History mode: load from Supabase ──
      skipLangEffectRef.current = true;
      setLang(activeLang);
      setLoading(true);
      getAnalysisById(analysisId).then((row) => {
        if (!row) { router.replace('/history'); return; }
        const list: string[] = row.strengths ?? [];
        strengthsRef.current = list;
        setStrengths(list);
        nameRef.current = row.full_name ?? '';
        const rowLang: Lang = row.lang === 'ru' ? 'ru' : row.lang === 'ky' ? 'ky' : 'en';
        skipLangEffectRef.current = true;
        setLang(rowLang);
        try {
          const cleaned = row.analysis.trim()
            .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
          setResult(JSON.parse(cleaned) as AnalysisResult);
          if (row.share_token) setShareToken(row.share_token);
        } catch { setError('Failed to load analysis.'); }
        setLoading(false);
        // No confetti on history view — only on fresh analysis creation
      });
      initializedRef.current = true;
      return;
    }

    // ── Normal mode: fresh analysis ──
    const s = searchParams.get('s');
    if (!s) { router.replace('/'); return; }
    const list = s.split(',').map((x) => x.trim()).filter(Boolean);
    if (list.length < 5 || list.length > 10) { router.replace('/'); return; }
    strengthsRef.current = list;
    setStrengths(list);
    const fullName = searchParams.get('name') ?? '';
    nameRef.current = fullName;
    skipLangEffectRef.current = true; // prevent double-analysis on init lang change
    setLang(activeLang);
    analyze(list, activeLang, fullName);
    initializedRef.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-analyze whenever language is toggled after initial load
  useEffect(() => {
    if (!initializedRef.current) return;
    if (!strengthsRef.current.length) return;
    if (skipLangEffectRef.current) { skipLangEffectRef.current = false; return; }
    analyze(strengthsRef.current, lang);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const handleDownloadPDF = () => {
    if (!result) return;
    const displayName = nameRef.current?.trim() || 'Anonymous';
    const dateStr = new Date().toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

    const isRu = lang === 'ru';
    const isKy = lang === 'ky';

    // ── Translations ──────────────────────────────────────────────────────────
    const STRENGTH_TR: Record<string, { ru: string; ky: string }> = {
      'Achiever':         { ru: 'Достижение',             ky: 'Жетишкендик' },
      'Activator':        { ru: 'Катализатор',             ky: 'Катализатор' },
      'Adaptability':     { ru: 'Приспособляемость',       ky: 'Ийкемдүүлүк' },
      'Analytical':       { ru: 'Аналитик',                ky: 'Аналитик' },
      'Arranger':         { ru: 'Организатор',             ky: 'Уюштуруучу' },
      'Belief':           { ru: 'Убеждение',               ky: 'Ишенимдер' },
      'Command':          { ru: 'Распорядитель',           ky: 'Командалык' },
      'Communication':    { ru: 'Коммуникация',            ky: 'Коммуникация' },
      'Competition':      { ru: 'Конкуренция',             ky: 'Атаандашуу' },
      'Connectedness':    { ru: 'Взаимосвязанность',       ky: 'Байланыштуулук' },
      'Consistency':      { ru: 'Последовательность',      ky: 'Ырааттуулук' },
      'Context':          { ru: 'Контекст',                ky: 'Контекст' },
      'Deliberative':     { ru: 'Осмотрительность',        ky: 'Этияттык' },
      'Developer':        { ru: 'Развитие',                ky: 'Өнүктүрүүчү' },
      'Discipline':       { ru: 'Дисциплинированность',    ky: 'Тартип' },
      'Empathy':          { ru: 'Эмпатия',                 ky: 'Эмпатия' },
      'Focus':            { ru: 'Сосредоточенность',       ky: 'Фокус' },
      'Futuristic':       { ru: 'Будущее',                 ky: 'Келечекчил' },
      'Harmony':          { ru: 'Гармония',                ky: 'Гармония' },
      'Ideation':         { ru: 'Генератор идей',          ky: 'Идея жаратуу' },
      'Includer':         { ru: 'Включенность',            ky: 'Кошумчалоочу' },
      'Individualization':{ ru: 'Индивидуализация',        ky: 'Жеке мүнөздөмө' },
      'Input':            { ru: 'Вклад',                   ky: 'Топтоо' },
      'Intellection':     { ru: 'Мышление',                ky: 'Ой жүгүртүү' },
      'Learner':          { ru: 'Ученик',                  ky: 'Үйрөнүүчү' },
      'Maximizer':        { ru: 'Максимизатор',            ky: 'Максималдаштыруу' },
      'Positivity':       { ru: 'Позитивность',            ky: 'Позитивдүүлүк' },
      'Relator':          { ru: 'Отношения',               ky: 'Мамиле' },
      'Responsibility':   { ru: 'Ответственность',         ky: 'Жоопкерчилик' },
      'Restorative':      { ru: 'Восстановление',          ky: 'Калыбына келтирүү' },
      'Self-Assurance':   { ru: 'Уверенность',             ky: 'Өзүнө ишенүү' },
      'Significance':     { ru: 'Значимость',              ky: 'Маанилүүлүк' },
      'Strategic':        { ru: 'Стратегия',               ky: 'Стратегиялык ой' },
      'Woo':              { ru: 'Обаяние',                 ky: 'Жагымдуулук' },
    };
    const DOMAIN_TR: Record<string, { ru: string; ky: string; color: string }> = {
      'Executing':             { ru: 'Исполнение',              ky: 'Аткаруу',         color: '#3b82f6' },
      'Influencing':           { ru: 'Влияние',                 ky: 'Таасир этүү',     color: '#f97316' },
      'Relationship Building': { ru: 'Построение отношений',    ky: 'Мамиле куруу',    color: '#10b981' },
      'Strategic Thinking':    { ru: 'Стратегическое мышление', ky: 'Стратегиялык ой', color: '#a855f7' },
    };
    const DOMAIN_STRENGTHS: Record<string, string[]> = {
      'Executing':             ['Achiever','Arranger','Belief','Consistency','Deliberative','Discipline','Focus','Responsibility','Restorative'],
      'Influencing':           ['Activator','Command','Communication','Competition','Maximizer','Self-Assurance','Significance','Woo'],
      'Relationship Building': ['Adaptability','Connectedness','Developer','Empathy','Harmony','Includer','Individualization','Positivity','Relator'],
      'Strategic Thinking':    ['Analytical','Context','Futuristic','Ideation','Input','Intellection','Learner','Strategic'],
    };

    const trStr = (name: string) => {
      const t = STRENGTH_TR[name];
      if (!t || lang === 'en') return name;
      return `${name} <span class="tr">(${isRu ? t.ru : t.ky})</span>`;
    };

    const L = {
      report:        isRu ? 'Отчёт об оценке талантов'        : isKy ? 'Таланттарды баалоо отчёту'              : 'Talent Assessment Report',
      domain:        isRu ? 'Доминирующий домен'               : isKy ? 'Үстөмдүк кылган домен'                  : 'Dominant Domain',
      superpower:    isRu ? 'Суперсила'                        : isKy ? 'Суперкүч'                                : 'Superpower',
      interact:      isRu ? 'Взаимодействие сильных сторон'    : isKy ? 'Күчтүү жактардын өз ара аракети'         : 'How Strengths Interact',
      domainReason:  isRu ? 'Почему этот домен?'               : isKy ? 'Эмне үчүн бул домен?'                    : 'Domain Reason',
      strengthsLabel:isRu ? 'Топ сильных сторон'               : isKy ? 'Топ күчтүү жактар'                       : 'Top Strengths',
      blindSpots:    isRu ? 'Слепые зоны'                      : isKy ? 'Байкалбаган жактар'                      : 'Blind Spots',
      combinations:  isRu ? 'Сочетания талантов'               : isKy ? 'Талант айкалыштары'                      : 'Talent Combinations',
      famous:        isRu ? 'Известные люди с похожим профилем': isKy ? 'Окшош профилдеги белгилүү адамдар'       : 'Famous Similar Profiles',
      careers:       isRu ? 'Карьерные направления для исследования' : isKy ? 'Изилдөө үчүн карьералык багыттар'        : 'Career Directions to Explore',
      firstStep:     isRu ? 'Первый шаг'                       : isKy ? 'Биринчи кадам'                           : 'First step',
      partners:      isRu ? 'Кто дополнит тебя'                 : isKy ? 'Сени ким толуктайт'                       : 'Who Complements You',
      footer:        isRu ? 'Создано Inner Vector · innervector.co' : isKy ? 'Inner Vector тарабынан · innervector.co' : 'Generated by Inner Vector · innervector.co',
    };

    const dominantDomain = result.dominantDomain;
    const dColor = DOMAIN_TR[dominantDomain]?.color ?? '#d4a843';
    const dTr = lang !== 'en' && DOMAIN_TR[dominantDomain]
      ? ` <span class="tr-domain">(${isRu ? DOMAIN_TR[dominantDomain].ru : DOMAIN_TR[dominantDomain].ky})</span>`
      : '';

    // ── HTML blocks ──────────────────────────────────────────────────────────
    const strengthsHtml = strengths.map((s, i) => {
      const domEntry = Object.entries(DOMAIN_STRENGTHS).find(([, arr]) => arr.includes(s));
      const sColor = domEntry ? DOMAIN_TR[domEntry[0]]?.color ?? '#d4a843' : '#d4a843';
      return `<div class="strength-row">
        <span class="s-num" style="background:${sColor}20;color:${sColor};border:1px solid ${sColor}40">${i + 1}</span>
        <span class="s-name">${trStr(s)}</span>
        <span class="s-dot" style="background:${sColor}"></span>
      </div>`;
    }).join('');

    const blindSpotsHtml = result.blindSpots?.map((b, i) =>
      `<div class="blind-row"><span class="blind-num">${i + 1}</span><span>${b}</span></div>`
    ).join('') ?? '';

    const combinationsHtml = result.combinations?.map(c =>
      `<div class="combo-card">
        <div class="combo-header"><span class="combo-name">${c.name}</span><span class="combo-meta">${c.type} · ${c.rarity}</span></div>
        <div class="combo-talents">${(c.talents||[]).map(t => `<span class="ctag">${trStr(t)}</span>`).join('')}</div>
        <div class="combo-mech">${c.mechanism}</div>
        <div class="combo-grid">
          <div class="combo-good">✓ ${c.atItsBest}</div>
          <div class="combo-bad">✗ ${c.whenItBackfires}</div>
        </div>
      </div>`
    ).join('') ?? '';

    const famousHtml = result.famousPeople?.map(p =>
      `<div class="person-card">
        <div class="person-header"><span class="person-name">${p.name}</span><span class="person-field">${p.field}</span></div>
        <div class="person-why">${p.whyMatch}</div>
        <div class="person-ach">${p.achievement}</div>
      </div>`
    ).join('') ?? '';

    const careersHtml = result.careers?.map((c, i) =>
      `<div class="career-card">
        <div class="career-num">${i + 1}</div>
        <div class="career-body">
          <div class="career-title">${c.title}</div>
          <div class="career-why">${c.whyFits}</div>
          <div class="career-step"><span class="step-label">${L.firstStep}:</span> ${c.firstStep}</div>
        </div>
      </div>`
    ).join('') ?? '';

    const partnersHtml = result.idealPartners?.map(p =>
      `<div class="partner-card">
        <div class="partner-type">${p.type}</div>
        <div class="partner-tags">${p.topStrengths.map(s => `<span class="ptag">${trStr(s)}</span>`).join('')}</div>
        <div class="partner-why">${p.whyComplement}</div>
        <div class="partner-dyn">${p.dynamicInAction}</div>
      </div>`
    ).join('') ?? '';

    const secHtml = (icon: string, label: string, content: string) =>
      content ? `<div class="section"><div class="sec-head"><span class="sec-icon">${icon}</span><span class="sec-label">${label}</span></div><div class="sec-body">${content}</div></div>` : '';

    const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8"/>
<title>Inner Vector — ${displayName}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Playfair+Display:wght@700&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Inter',sans-serif;color:#1a2332;background:#fff;font-size:10.5pt;line-height:1.65;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .header{background:linear-gradient(135deg,#0d111e 0%,#111827 60%,#0f1829 100%);padding:28px 36px 24px;position:relative;overflow:hidden}
  .header::after{content:'';position:absolute;top:0;right:0;width:220px;height:100%;background:radial-gradient(ellipse at top right,${dColor}18 0%,transparent 70%)}
  .header-top{display:flex;justify-content:space-between;align-items:flex-start;position:relative}
  .brand{display:flex;align-items:center;gap:10px}
  .brand-dot{width:32px;height:32px;border-radius:50%;background:${dColor}25;border:1.5px solid ${dColor}50;display:flex;align-items:center;justify-content:center;font-size:10pt;font-weight:700;color:${dColor}}
  .brand-name{color:#d4a843;font-family:'Playfair Display',serif;font-size:18pt;font-weight:700;letter-spacing:.02em}
  .brand-sub{color:#64748b;font-size:8pt;margin-top:1px;letter-spacing:.06em}
  .header-person{text-align:right}
  .person-name-h{color:#fff;font-size:14pt;font-weight:600;letter-spacing:.01em}
  .person-date{color:#475569;font-size:8pt;margin-top:3px}
  .domain-strip{margin-top:18px;display:flex;align-items:center;gap:10px;position:relative}
  .domain-pill{display:inline-flex;align-items:center;gap:7px;background:${dColor}18;border:1.5px solid ${dColor}40;border-radius:20px;padding:5px 14px}
  .domain-dot{width:8px;height:8px;border-radius:50%;background:${dColor}}
  .domain-text{color:${dColor};font-size:8.5pt;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
  .tr-domain{color:${dColor}90;font-weight:400;font-style:italic}
  .dna-quote{color:#94a3b8;font-size:9pt;font-style:italic;margin-top:10px;padding-left:12px;line-height:1.5;position:relative}
  .dna-quote::before{content:'"';font-size:20pt;color:${dColor}40;position:absolute;left:0;top:-4px;font-family:'Playfair Display',serif;line-height:1}
  .content{padding:20px 36px 10px}
  .section{margin-bottom:18px;break-inside:avoid;page-break-inside:avoid}
  .sec-head{display:flex;align-items:center;gap:8px;margin-bottom:8px;border-bottom:1.5px solid #f1f5f9;padding-bottom:5px}
  .sec-icon{font-size:11pt}
  .sec-label{font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#64748b}
  .sec-body{font-size:10pt;color:#1e2937;line-height:1.7}
  .highlight-box{background:#fafbfc;border-left:3px solid ${dColor};border-radius:0 6px 6px 0;padding:10px 14px;font-size:10.5pt;color:#1e2937;line-height:1.65}
  .highlight-box.gold{border-left-color:#d4a843;background:#fffdf5}
  .strengths-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 16px}
  .strength-row{display:flex;align-items:center;gap:8px;padding:4px 6px;border-radius:6px;background:#fafbfc}
  .s-num{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:7.5pt;font-weight:700;flex-shrink:0}
  .s-name{font-size:10pt;font-weight:500;color:#1e2937;flex:1}
  .s-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0}
  .tr{color:#94a3b8;font-weight:400;font-style:italic;font-size:9pt}
  .blind-row{display:flex;gap:10px;padding:5px 0;border-bottom:1px solid #f8fafc}
  .blind-row:last-child{border-bottom:none}
  .blind-num{width:20px;height:20px;border-radius:50%;background:#fef3c7;color:#b45309;font-size:8pt;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px}
  .combo-card{background:#fafbfc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px;margin-bottom:8px;break-inside:avoid}
  .combo-header{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:5px}
  .combo-name{font-weight:700;font-size:10.5pt;color:#1e2937}
  .combo-meta{font-size:7.5pt;color:#94a3b8;font-style:italic}
  .combo-talents{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:5px}
  .ctag{background:#e0e7ff;color:#3730a3;font-size:7.5pt;padding:2px 8px;border-radius:10px}
  .combo-mech{font-size:9.5pt;color:#475569;margin-bottom:6px;line-height:1.5}
  .combo-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}
  .combo-good{font-size:8.5pt;color:#059669;background:#ecfdf5;padding:4px 8px;border-radius:4px}
  .combo-bad{font-size:8.5pt;color:#dc2626;background:#fef2f2;padding:4px 8px;border-radius:4px}
  .famous-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .person-card{background:#fafbfc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px}
  .person-header{display:flex;align-items:baseline;gap:8px;margin-bottom:4px}
  .person-name{font-weight:700;font-size:10.5pt;color:#1e2937}
  .person-field{font-size:7.5pt;color:#64748b;font-style:italic}
  .person-why{font-size:9pt;color:#475569;line-height:1.5;margin-bottom:3px}
  .person-ach{font-size:8.5pt;color:#94a3b8;font-style:italic}
  .career-card{display:flex;gap:12px;padding:8px 0;border-bottom:1px solid #f1f5f9;align-items:flex-start}
  .career-card:last-child{border-bottom:none}
  .career-num{width:26px;height:26px;border-radius:50%;background:${dColor}15;border:1.5px solid ${dColor}30;color:${dColor};font-size:9pt;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px}
  .career-title{font-weight:700;font-size:10.5pt;color:#1e2937;margin-bottom:3px}
  .career-why{font-size:9pt;color:#475569;line-height:1.5;margin-bottom:3px}
  .career-step{font-size:8.5pt;color:#64748b;font-style:italic}
  .step-label{color:${dColor};font-weight:600;font-style:normal}
  .partner-card{background:#fafbfc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px;margin-bottom:8px}
  .partner-type{font-weight:700;font-size:10.5pt;color:#1e2937;margin-bottom:5px}
  .partner-tags{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:5px}
  .ptag{background:#f0fdf4;color:#166534;font-size:7.5pt;padding:2px 8px;border-radius:10px;border:1px solid #bbf7d0}
  .partner-why{font-size:9pt;color:#475569;line-height:1.5;margin-bottom:3px}
  .partner-dyn{font-size:8.5pt;color:#94a3b8;font-style:italic}
  .footer{background:#0d111e;padding:10px 36px;display:flex;justify-content:space-between;align-items:center;margin-top:16px}
  .footer-left{color:#475569;font-size:7.5pt}
  .footer-brand{color:#d4a843;font-size:8pt;font-weight:600;letter-spacing:.06em}
  @media print{body,html{-webkit-print-color-adjust:exact;print-color-adjust:exact}.section{page-break-inside:avoid}}
</style>
</head>
<body>
<div class="header">
  <div class="header-top">
    <div class="brand">
      <div class="brand-dot">IV</div>
      <div><div class="brand-name">Inner Vector</div><div class="brand-sub">${isRu ? 'ВАШ ВНУТРЕННИЙ ВЕКТОР' : isKy ? 'СИЗДИН ИЧКИ ВЕКТОРУНУЗ' : 'YOUR INNER VECTOR'}</div></div>
    </div>
    <div class="header-person">
      <div class="person-name-h">${displayName}</div>
      <div class="person-date">${dateStr}</div>
    </div>
  </div>
  <div class="domain-strip">
    <div class="domain-pill">
      <span class="domain-dot"></span>
      <span class="domain-text">${L.domain}: ${dominantDomain}${dTr}</span>
    </div>
  </div>
  <div class="dna-quote">${result.talentDNA}</div>
</div>

<div class="content">
  <div class="section">
    <div class="sec-head"><span class="sec-icon">✦</span><span class="sec-label">${L.superpower}</span></div>
    <div class="highlight-box gold">${result.superpower}</div>
  </div>
  <div class="section">
    <div class="sec-head"><span class="sec-icon">◎</span><span class="sec-label">${L.interact}</span></div>
    <div class="highlight-box">${result.strengthsInteraction}</div>
  </div>
  ${secHtml('◆', L.domainReason, result.domainReason)}
  <div class="section">
    <div class="sec-head"><span class="sec-icon">★</span><span class="sec-label">${L.strengthsLabel} (${strengths.length})</span></div>
    <div class="strengths-grid">${strengthsHtml}</div>
  </div>
  ${blindSpotsHtml ? `<div class="section"><div class="sec-head"><span class="sec-icon">⚠</span><span class="sec-label">${L.blindSpots}</span></div><div class="sec-body">${blindSpotsHtml}</div></div>` : ''}
  ${combinationsHtml ? `<div class="section"><div class="sec-head"><span class="sec-icon">⚡</span><span class="sec-label">${L.combinations}</span></div><div class="sec-body">${combinationsHtml}</div></div>` : ''}
  ${famousHtml ? `<div class="section"><div class="sec-head"><span class="sec-icon">👤</span><span class="sec-label">${L.famous}</span></div><div class="famous-grid">${famousHtml}</div></div>` : ''}
  ${careersHtml ? `<div class="section"><div class="sec-head"><span class="sec-icon">💼</span><span class="sec-label">${L.careers}</span></div><div class="sec-body">${careersHtml}</div></div>` : ''}
  ${partnersHtml ? `<div class="section"><div class="sec-head"><span class="sec-icon">🤝</span><span class="sec-label">${L.partners}</span></div><div class="sec-body">${partnersHtml}</div></div>` : ''}
</div>

<div class="footer">
  <span class="footer-left">${L.footer}</span>
  <span class="footer-brand">INNER VECTOR</span>
</div>
</body></html>`;

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    setTimeout(() => { win.print(); }, 900);
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const domainBadge = result ? DOMAIN_BADGE_COLORS[result.dominantDomain] : null;

  return (
    <div className="min-h-screen bg-radial">
      {showLogin && (
        <LoginModal
          onSuccess={(role: 'admin' | 'superadmin' | 'client', meta) => {
            login(role);
            setShowLogin(false);
            // If client has their own profile — redirect to it
            if (role === 'client' && meta?.analysis_id) {
              router.push(`/results?id=${meta.analysis_id}`);
            }
          }}
          onClose={() => setShowLogin(false)}
        />
      )}
      {/* Header nav */}
      <header className="sticky top-0 z-10 border-b border-white/5 bg-navy-900/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-2">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t.newAnalysis}
          </button>

          <div className="text-gold text-xs font-medium tracking-widest uppercase hidden sm:block">
            {t.badge}
          </div>

          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            {/* Client link — copy for sharing with client */}
            {result && shareToken && (
              <button
                onClick={() => {
                  const url = `${window.location.origin}/profile/${shareToken}`;
                  navigator.clipboard.writeText(url).then(() => {
                    setCopiedClient(true);
                    setTimeout(() => setCopiedClient(false), 2000);
                  });
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 transition-all text-xs sm:text-sm"
                title="Copy client link"
              >
                {copiedClient ? (
                  <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span className="hidden sm:inline">{lang === 'ru' ? 'Скопировано!' : lang === 'ky' ? 'Көчүрүлдү!' : 'Copied!'}</span></>
                ) : (
                  <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  <span className="hidden sm:inline">{lang === 'ru' ? 'Ссылка клиента' : lang === 'ky' ? 'Клиент шилтемеси' : 'Client link'}</span></>
                )}
              </button>
            )}

            {/* PDF */}
            {result && (
              <button
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/20 text-gold hover:bg-gold/20 transition-all text-xs sm:text-sm disabled:opacity-50"
              >
                {pdfLoading ? (
                  <span className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                PDF
              </button>
            )}

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/8 transition-all text-xs sm:text-sm"
            >
              {copied ? (
                <><svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span className="text-emerald-400 hidden sm:inline">{t.copied}</span></>
              ) : (
                <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                <span className="hidden sm:inline">{t.share}</span></>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10 pb-20">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-6 animate-fade-in">
            <div className="spinner" />
            <div className="text-center">
              <p className="text-white font-serif text-2xl mb-2">{t.analyzingTitle}</p>
              <p className="text-slate-500 text-sm">
                <span className="text-gold font-bold tabular-nums">{agentCount}</span>{' '}
                {t.analyzingSubtitle}
              </p>
              <div className="mt-4 flex flex-col items-center gap-2 w-full max-w-xs">
                <div className="flex items-center justify-between w-full px-1">
                  <span className="text-slate-500 text-xs">
                    {lang === 'ru' ? 'Анализ' : lang === 'ky' ? 'Талдоо' : 'Analysis'}
                  </span>
                  <span className="text-gold font-bold text-sm tabular-nums">
                    {Math.min(95, Math.round(1 + (elapsed / 38) * 94))}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gold/60 to-gold rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(95, Math.round(1 + (elapsed / 38) * 94))}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4 flex-wrap justify-center max-w-xl">
              {(strengthsRef.current.length ? strengthsRef.current : strengths).map((s, i) => {
                const domain = getDomainForStrength(s);
                const domainColors: Record<string, { rgb: string }> = {
                  'Executing':           { rgb: '59,130,246'  }, // blue
                  'Influencing':         { rgb: '249,115,22'  }, // orange
                  'Relationship Building':{ rgb: '16,185,129' }, // emerald
                  'Strategic Thinking':  { rgb: '168,85,247'  }, // purple
                };
                const color = domain ? domainColors[domain]?.rgb ?? '212,168,67' : '212,168,67';
                return (
                  <span
                    key={s}
                    className="analyzing-chip text-xs px-2.5 py-1 rounded-full"
                    style={{
                      '--chip-color': color,
                      animationDelay: `${i * 403}ms`,
                    } as React.CSSProperties}
                  >
                    <span className="chip-dot" style={{ animationDelay: `${i * 288}ms` }} />
                    {s}
                  </span>
                );
              })}
            </div>
            <style>{`
              .analyzing-chip {
                display: inline-flex;
                align-items: center;
                gap: 5px;
                background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.08);
                color: #64748b;
                animation: chip-scan 4.03s ease-in-out infinite;
              }
              @keyframes chip-scan {
                0%,100% { border-color: rgba(255,255,255,0.08); color: #64748b; background: rgba(255,255,255,0.03); box-shadow: none; }
                20%     { border-color: rgba(var(--chip-color),0.7); color: rgb(var(--chip-color)); background: rgba(var(--chip-color),0.12); box-shadow: 0 0 12px rgba(var(--chip-color),0.3); }
                45%     { border-color: rgba(255,255,255,0.08); color: #94a3b8; background: rgba(255,255,255,0.04); box-shadow: none; }
              }
              .chip-dot {
                width: 5px; height: 5px;
                border-radius: 50%;
                background: currentColor;
                opacity: 0.5;
                flex-shrink: 0;
                animation: dot-pulse 4.03s ease-in-out infinite;
              }
              @keyframes dot-pulse {
                0%,100% { transform: scale(1);   opacity: 0.3; }
                20%     { transform: scale(2);   opacity: 1;   }
                45%     { transform: scale(1);   opacity: 0.3; }
              }
            `}</style>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 text-2xl">!</div>
            <p className="text-white font-serif text-xl text-center px-4">{error}</p>
            <button
              onClick={() => analyze(strengths, lang)}
              className="px-6 py-2.5 rounded-xl bg-gold text-navy-900 font-semibold hover:bg-gold-light transition-colors text-sm"
            >
              {t.tryAgain}
            </button>
          </div>
        )}

        {/* Confetti */}
        {showConfetti && result && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {Array.from({ length: 140 }).map((_, i) => {
              const colors = ['#d4a843','#e8c96a','#f5d878','#b8922a','#ffd700','#c9a227','#ffe066','#a07820','#fff9c4','#ffec6e'];
              const color = colors[i % colors.length];
              const x = Math.random() * 100;
              const delay = Math.random() * 1.2;
              const duration = 2.5 + Math.random() * 1.8;
              const size = 5 + Math.random() * 10;
              const rotate = Math.random() * 900;
              const shape = i % 4 === 0 ? '50%' : i % 4 === 1 ? '2px' : i % 4 === 2 ? '0%' : '30%';
              const drift = (Math.random() - 0.5) * 120;
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: `${x}%`,
                    top: '-24px',
                    width: `${size}px`,
                    height: `${size * (i % 3 === 0 ? 1 : i % 3 === 1 ? 0.35 : 0.65)}px`,
                    background: color,
                    borderRadius: shape,
                    animation: `confetti-fall-${i % 3} ${duration}s ${delay}s ease-in forwards`,
                    transform: `rotate(${rotate}deg)`,
                    opacity: 0.95,
                    filter: 'drop-shadow(0 0 2px rgba(212,168,67,0.4))',
                    '--drift': `${drift}px`,
                  } as React.CSSProperties}
                />
              );
            })}
            <style>{`
              @keyframes confetti-fall-0 {
                0%   { transform: translateY(0) translateX(0) rotate(0deg) scale(1); opacity: 1; }
                70%  { opacity: 1; }
                100% { transform: translateY(105vh) translateX(var(--drift)) rotate(800deg) scale(0.4); opacity: 0; }
              }
              @keyframes confetti-fall-1 {
                0%   { transform: translateY(0) translateX(0) rotate(0deg) scale(1); opacity: 1; }
                60%  { opacity: 0.9; }
                100% { transform: translateY(105vh) translateX(calc(var(--drift) * -1)) rotate(600deg) scale(0.3); opacity: 0; }
              }
              @keyframes confetti-fall-2 {
                0%   { transform: translateY(0) translateX(0) rotate(0deg) scale(1.2); opacity: 1; }
                75%  { opacity: 1; }
                100% { transform: translateY(105vh) translateX(var(--drift)) rotate(1000deg) scale(0.5); opacity: 0; }
              }
            `}</style>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-12 animate-fade-in">

            {/* Hero */}
            <div className="text-center py-4">
              {domainBadge && (
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6 ${domainBadge}`}>
                  <span>{DOMAIN_ICONS[result.dominantDomain]}</span>
                  {result.dominantDomain} {t.dominantSuffix}
                </div>
              )}
              <blockquote className="font-serif text-2xl md:text-3xl text-white leading-relaxed max-w-3xl mx-auto mb-4">
                &ldquo;{result.talentDNA}&rdquo;
              </blockquote>
              <p className="text-slate-400 text-sm max-w-xl mx-auto">{result.domainReason}</p>
            </div>

            {/* Top strengths */}
            <section>
              <h2 className="font-serif text-xl text-white mb-4 flex items-center gap-3">
                <span className="w-6 h-px bg-gold/40" />
                {t.top5Title}
                <span className="text-slate-600 text-sm font-sans font-normal">({strengths.length})</span>
                <span className="flex-1 h-px bg-white/5" />
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {strengths.map((s, i) => {
                  const domain = getDomainForStrength(s);
                  if (!domain) return null;
                  return <StrengthCard key={s} name={s} domain={domain} rank={i + 1} animDelay={Math.min(i * 80, 600)} />;
                })}
              </div>
            </section>

            {/* Superpower + Interaction */}
            <section className="grid md:grid-cols-2 gap-5">
              <div className="card p-6 glow-gold animate-slide-in delay-0 border border-gold/20 bg-gold/5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold text-xs">✦</div>
                  <span className="text-gold text-xs font-semibold tracking-widest uppercase">{t.superpowerLabel}</span>
                </div>
                <p className="font-serif text-lg text-white leading-relaxed">{result.superpower}</p>
              </div>
              <div className="card p-6 animate-slide-in delay-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 text-xs">◎</div>
                  <span className="text-slate-400 text-xs font-semibold tracking-widest uppercase">{t.interactionLabel}</span>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{result.strengthsInteraction}</p>
              </div>
            </section>

            {/* ── PAYWALL WALL — starts at Combinations ── */}
            {(isAuthed || isSuperAdmin) ? (
              <>
                {/* Talent Combinations */}
                {result.combinations?.length > 0 && (
                  <section className="animate-fade-in">
                    <h2 className="font-serif text-xl text-white mb-1 flex items-center gap-3">
                      <span className="w-6 h-px bg-gold/40" />
                      {lang === 'ru' ? 'Сочетания талантов' : lang === 'ky' ? 'Талант айкалыштары' : 'Talent Combinations'}
                      <span className="flex-1 h-px bg-white/5" />
                    </h2>
                    <p className="text-slate-500 text-sm mb-4 ml-9">
                      {lang === 'ru' ? 'Как ваши таланты усиливают и конфликтуют друг с другом' : lang === 'ky' ? 'Таланттарыңыз бири-бирин кантип күчөтөт жана карама-каршы келет' : 'How your talents amplify and conflict with each other'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {result.combinations.map((combo) => (
                        <CombinationCard key={combo.type} combo={combo} lang={lang} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Blind Spots */}
                <section className="animate-slide-in delay-200">
                  <h2 className="font-serif text-xl text-white mb-4 flex items-center gap-3">
                    <span className="w-6 h-px bg-gold/40" />
                    {t.blindSpotsTitle}
                    <span className="flex-1 h-px bg-white/5" />
                  </h2>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {result.blindSpots.map((spot, i) => (
                      <div key={i} className={`card p-4 animate-slide-in delay-${i * 100}`}>
                        <div className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xs flex-shrink-0 mt-0.5">{i + 1}</div>
                          <p className="text-slate-300 text-sm leading-relaxed">{spot}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Lesser Talents — managing zones (only when full-34 report provided bottom themes) */}
                {result.lesserTalents && result.lesserTalents.themes?.length > 0 && (
                  <section className="animate-slide-in">
                    <h2 className="font-serif text-xl text-white mb-4 flex items-center gap-3">
                      <span className="w-6 h-px bg-gold/40" />
                      {lang === 'ru' ? 'Зоны управления (нижние таланты)' : lang === 'ky' ? 'Башкаруу зоналары' : 'Managing Zones (lesser talents)'}
                      <span className="flex-1 h-px bg-white/5" />
                    </h2>
                    <div className="card p-5 mb-3">
                      <p className="text-slate-300 text-sm leading-relaxed">{result.lesserTalents.summary}</p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3 mb-3">
                      {result.lesserTalents.themes.map((lt, i) => (
                        <div key={i} className="card p-4">
                          <div className="font-serif text-white font-semibold text-sm mb-2">{lt.name}</div>
                          <div className="mb-2">
                            <div className="text-[10px] tracking-widest text-red-400/60 uppercase font-medium mb-1">{lang === 'ru' ? 'Риск' : lang === 'ky' ? 'Тобокел' : 'Risk'}</div>
                            <p className="text-slate-400 text-xs leading-relaxed">{lt.risk}</p>
                          </div>
                          <div>
                            <div className="text-[10px] tracking-widest text-emerald-400/60 uppercase font-medium mb-1">{lang === 'ru' ? 'Как управлять' : lang === 'ky' ? 'Кантип башкаруу' : 'How to manage'}</div>
                            <p className="text-slate-400 text-xs leading-relaxed">{lt.manage}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="card p-5 border-gold/15">
                      <div className="text-[10px] tracking-widest text-gold/60 uppercase font-medium mb-2">{lang === 'ru' ? 'Что это даёт твоим топ-талантам' : lang === 'ky' ? 'Топ-таланттарга эмне берет' : 'What this gives your top talents'}</div>
                      <p className="text-slate-300 text-sm leading-relaxed">{result.lesserTalents.forTopTalents}</p>
                    </div>
                  </section>
                )}

                {/* Famous People */}
                <section>
                  <h2 className="font-serif text-xl text-white mb-4 flex items-center gap-3">
                    <span className="w-6 h-px bg-gold/40" />
                    {t.famousTitle}
                    <span className="flex-1 h-px bg-white/5" />
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {result.famousPeople.map((person, i) => (
                      <FamousPersonCard key={person.name} person={person} animDelay={i * 100} />
                    ))}
                  </div>
                </section>

                {/* Careers */}
                <section>
                  <h2 className="font-serif text-xl text-white mb-1 flex items-center gap-3">
                    <span className="w-6 h-px bg-gold/40" />
                    {lang === 'ru' ? 'Карьерные направления для исследования' : lang === 'ky' ? 'Изилдөө үчүн карьералык багыттар' : 'Career Directions to Explore'}
                    <span className="flex-1 h-px bg-white/5" />
                  </h2>
                  <p className="text-slate-500 text-sm mb-4 ml-9">
                    {lang === 'ru'
                      ? 'Таланты не определяют профессию — они показывают, в каких ролях и средах ты будешь в своей стихии. Это направления для исследования, не предписание.'
                      : lang === 'ky'
                      ? 'Таланттар кесипти аныктабайт — алар кайсы ролдордо жана чөйрөлөрдө өзүңдү толук ача аларыңды көрсөтөт. Бул изилдөө үчүн багыттар, буйрук эмес.'
                      : 'Talents don’t determine your profession — they show which roles and environments let you thrive. These are directions to explore, not a prescription.'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {result.careers.map((career, i) => (
                      <CareerCard key={career.title} career={career} rank={i + 1} animDelay={i * 100} />
                    ))}
                  </div>
                </section>

                {/* Ideal Partners */}
                {result.idealPartners?.length > 0 && (
                  <section className="animate-fade-in">
                    <h2 className="font-serif text-xl text-white mb-1 flex items-center gap-3">
                      <span className="w-6 h-px bg-gold/40" />
                      {lang === 'ru' ? 'Кто дополнит тебя' : lang === 'ky' ? 'Сени ким толуктайт' : 'Who Complements You'}
                      <span className="flex-1 h-px bg-white/5" />
                    </h2>
                    <p className="text-slate-500 text-sm mb-4 ml-9">
                      {lang === 'ru'
                        ? 'Типы людей, которые закрывают твои слабые зоны — по принципу Gallup: сильное в тебе + сильное в них. Это описание архетипа, а не конкретного человека.'
                        : lang === 'ky'
                        ? 'Алсыз жактарыңды жабуучу адам типтери — Gallup принциби боюнча: сендеги күч + алардагы күч. Бул архетиптин сүрөттөмөсү, конкреттүү адам эмес.'
                        : 'Types of people who cover your weak zones — Gallup’s principle: your strength + theirs. A description of an archetype, not a specific person.'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {result.idealPartners.map((partner, i) => (
                        <IdealPartnerCard key={partner.type} partner={partner} index={i} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            ) : (
              /* Paywall block — covers combinations + everything below */
              <section className="relative animate-fade-in">
                {/* Real blurred content — actual data rendered but blurred */}
                <div className="relative overflow-hidden rounded-2xl" style={{ background: 'linear-gradient(160deg, #0a1628 0%, #0d1f3c 40%, #0a1a35 70%, #091525 100%)' }}>
                  {/* Real content — blurred so silhouette is visible */}
                  <div className="pointer-events-none select-none space-y-10 p-2" style={{ filter: 'blur(5px)', opacity: 0.6 }}>

                    {/* Combinations silhouette */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="w-6 h-px bg-gold/40 inline-block" />
                        <span className="font-serif text-xl text-white">{lang === 'ru' ? 'Сочетания талантов' : lang === 'ky' ? 'Талант айкалыштары' : 'Talent Combinations'}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { name: lang === 'ru' ? 'Архитектор решений' : 'Solution Architect', tags: ['Ideation', 'Context', 'Analytical'], good: lang === 'ru' ? 'Генерирует нестандартные решения' : 'Generates breakthrough ideas', bad: lang === 'ru' ? 'Может застрять в анализе' : 'Can get stuck in analysis' },
                          { name: lang === 'ru' ? 'Стратег отношений' : 'Relationship Strategist', tags: ['Empathy', 'Individualization', 'Relator'], good: lang === 'ru' ? 'Создаёт глубокие связи' : 'Creates deep connections', bad: lang === 'ru' ? 'Сложно масштабировать' : 'Hard to scale' },
                        ].map((c, i) => (
                          <div key={i} className="rounded-xl border border-white/10 bg-white/4 p-5">
                            <div className="flex justify-between items-start mb-3">
                              <span className="font-bold text-white text-base">{c.name}</span>
                              <span className="text-slate-500 text-xs">1 in 50</span>
                            </div>
                            <div className="flex gap-2 flex-wrap mb-3">
                              {c.tags.map(t => <span key={t} className="px-2.5 py-1 rounded-full bg-white/8 border border-white/10 text-slate-300 text-xs">{t}</span>)}
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed mb-3">
                              {lang === 'ru'
                                ? 'Эта комбинация создаёт редкую способность видеть паттерны там, где другие видят хаос, превращая сложные системы в понятные стратегии.'
                                : 'This combination creates a rare ability to see patterns where others see chaos, turning complex systems into clear strategies.'}
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5">
                                <div className="text-emerald-400 text-xs font-semibold mb-1">● {lang === 'ru' ? 'В лучшем виде' : 'At its best'}</div>
                                <p className="text-emerald-300/80 text-xs">{c.good}</p>
                              </div>
                              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-2.5">
                                <div className="text-red-400 text-xs font-semibold mb-1">● {lang === 'ru' ? 'Риск' : 'Risk'}</div>
                                <p className="text-red-300/80 text-xs">{c.bad}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Blind spots silhouette */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="w-6 h-px bg-gold/40 inline-block" />
                        <span className="font-serif text-xl text-white">{lang === 'ru' ? 'Слепые зоны' : lang === 'ky' ? 'Байкалбаган жактар' : 'Blind Spots'}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          lang === 'ru' ? 'Склонность переусложнять простые задачи из-за стремления к идеальному решению' : 'Tendency to overcomplicate simple tasks',
                          lang === 'ru' ? 'Трудность с быстрыми решениями — потребность в полном контексте замедляет действие' : 'Difficulty with quick decisions',
                          lang === 'ru' ? 'Риск изоляции: глубина мышления создаёт барьер в коммуникации с менее вдумчивыми людьми' : 'Risk of isolation from deeper thinking',
                        ].map((spot, i) => (
                          <div key={i} className="card p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xs flex-shrink-0 mt-0.5">{i + 1}</div>
                              <p className="text-slate-300 text-sm leading-relaxed">{spot}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Famous people silhouette */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="w-6 h-px bg-gold/40 inline-block" />
                        <span className="font-serif text-xl text-white">{lang === 'ru' ? 'Известные люди' : lang === 'ky' ? 'Белгилүү адамдар' : 'Famous People'}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {['Elon Musk', 'Steve Jobs', 'Warren Buffett'].map((name, i) => (
                          <div key={i} className="card p-4">
                            <div className="font-bold text-white mb-1">{name}</div>
                            <div className="text-slate-500 text-xs mb-2">{['Tech / Business', 'Design / Innovation', 'Finance / Strategy'][i]}</div>
                            <p className="text-slate-400 text-xs leading-relaxed">
                              {lang === 'ru' ? 'Схожий профиль талантов позволил создать уникальный стиль лидерства.' : 'Similar talent profile enabled a unique leadership style.'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Careers silhouette */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="w-6 h-px bg-gold/40 inline-block" />
                        <span className="font-serif text-xl text-white">{lang === 'ru' ? 'Карьерные направления' : lang === 'ky' ? 'Карьералык багыттар' : 'Career Directions'}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { title: lang === 'ru' ? 'Стратегический консультант' : 'Strategic Consultant', why: lang === 'ru' ? 'Ваша комбинация Ideation + Context даёт редкую способность видеть системные решения' : 'Your Ideation + Context gives rare systemic thinking' },
                          { title: lang === 'ru' ? 'Коуч руководителей' : 'Executive Coach', why: lang === 'ru' ? 'Empathy + Individualization создают глубокое понимание каждого клиента' : 'Empathy + Individualization enable deep client understanding' },
                        ].map((c, i) => (
                          <div key={i} className="card p-5 flex gap-4">
                            <div className="w-7 h-7 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-bold flex items-center justify-center flex-shrink-0">{i + 1}</div>
                            <div>
                              <div className="font-bold text-white text-base mb-1">{c.title}</div>
                              <p className="text-slate-400 text-sm leading-relaxed">{c.why}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Gradient overlay — transparent top, deep blue at bottom */}
                  <div className="absolute inset-0 pointer-events-none" style={{
                    background: 'linear-gradient(to bottom, transparent 0%, transparent 15%, rgba(10,20,45,0.55) 40%, rgba(8,18,42,0.96) 62%, rgba(7,16,38,1) 100%)'
                  }} />

                  {/* Lock overlay content — pinned to bottom */}
                  <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 px-6"
                    style={{ background: 'linear-gradient(to bottom, transparent 0%, transparent 55%, rgba(7,16,38,0.98) 75%, rgba(7,16,38,1) 100%)' }}
                  >
                    {/* Logo + tagline */}
                    <div className="absolute top-[28%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/logo.png" alt="Inner Vector" width={208} height={208} style={{ objectFit: 'contain' }} />
                      <div className="text-center">
                        <p className="text-white font-serif leading-snug" style={{ fontFamily: 'Georgia, serif', fontSize: '1.43rem', textShadow: '0 2px 20px rgba(7,16,38,0.9)' }}>
                          {lang === 'ru' ? (
                            <><span style={{ color: '#d4a843', fontWeight: 700 }}>Компас</span> — за 30 дней переводим<br />таланты — в действие.</>
                          ) : lang === 'ky' ? (
                            <><span style={{ color: '#d4a843', fontWeight: 700 }}>Компас</span> — 30 күндө таланттарды<br />иш-аракетке которобуз.</>
                          ) : (
                            <><span style={{ color: '#d4a843', fontWeight: 700 }}>Compass</span> — in 30 days we turn<br />talents into action.</>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Lock icon */}
                    <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/25 flex items-center justify-center mb-5"
                      style={{ boxShadow: '0 0 40px rgba(212,168,67,0.2), 0 0 80px rgba(30,80,160,0.15)' }}
                    >
                      <svg className="w-7 h-7 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </div>

                    <h3 className="font-serif text-2xl text-white mb-2 text-center">
                      {lang === 'ru' ? 'В закрытой части:' : lang === 'ky' ? 'Жабык бөлүктө:' : 'In the private part:'}
                    </h3>
                    <ul className="text-slate-400 text-sm mb-7 space-y-1.5 text-center">
                      {lang === 'ru' ? (
                        <>
                          <li>— Сочетания талантов — как они усиливают и конфликтуют</li>
                          <li>— Слепые зоны — что тормозит ваш рост</li>
                          <li>— Известные люди с похожим профилем</li>
                          <li>— Карьерные направления под ваш ДНК талантов</li>
                          <li>— 5 типов идеальных партнёров для работы</li>
                          <li>— 30 дней с ИИ коуч-экспертом в Telegram</li>
                          <li>— Геймификация и задания, развивающие таланты</li>
                        </>
                      ) : lang === 'ky' ? (
                        <>
                          <li>— Талант айкалыштары — алар кантип күчөтөт жана карама-каршы келет</li>
                          <li>— Байкалбаган жактар — өсүүңүзгө тоскоол болгон нерселер</li>
                          <li>— Окшош профилдеги белгилүү адамдар</li>
                          <li>— Талант ДНКыңызга ылайыктуу карьера</li>
                          <li>— 5 тип идеалдуу иш өнөктөш</li>
                          <li>— Telegramда 30 күн ИИ коуч-эксперт менен</li>
                          <li>— Геймификация жана таланттарды өнүктүрүүчү тапшырмалар</li>
                        </>
                      ) : (
                        <>
                          <li>— Talent combinations — how they amplify and conflict</li>
                          <li>— Blind spots — what&apos;s holding your growth back</li>
                          <li>— Famous people with a similar profile</li>
                          <li>— Ideal careers for your talent DNA</li>
                          <li>— 5 types of ideal work partners</li>
                          <li>— 30 days with an AI coach expert in Telegram</li>
                          <li>— Gamification & talent-building daily challenges</li>
                        </>
                      )}
                    </ul>

                    {/* CTA button */}
                    <a
                      href={PAYMENT_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-10 py-4 rounded-xl font-semibold text-base text-navy-900 transition-all duration-200"
                      style={{
                        background: 'linear-gradient(135deg, #d4a843 0%, #e8c96a 100%)',
                        boxShadow: '0 0 32px rgba(212,168,67,0.35)',
                      }}
                    >
                      <span>💎</span>
                      <span>
                        {lang === 'ru' ? `Полный доступ — ${ANALYSIS_PRICE}` : lang === 'ky' ? `Толук жеткиликтүүлүк — ${ANALYSIS_PRICE}` : `Full access — ${ANALYSIS_PRICE}`}
                      </span>
                    </a>

                    {/* Already paid sign-in link */}
                    <p className="mt-5 text-slate-600 text-xs">
                      {lang === 'ru' ? 'Уже оплатили? ' : lang === 'ky' ? 'Жазылдыңызбы? ' : 'Already paid? '}
                      <button
                        onClick={() => setShowLogin(true)}
                        className="text-gold/70 hover:text-gold underline transition-colors"
                      >
                        {lang === 'ru' ? 'Войти' : lang === 'ky' ? 'Кирүү' : 'Sign in'}
                      </button>
                    </p>
                  </div>
                </div>

                {/* New analysis button — always shown below paywall */}
                <div className="text-center mt-6">
                  <button
                    onClick={() => router.push('/')}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/8 transition-all text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {t.analyzeAnother}
                  </button>
                </div>
              </section>
            )}

            {/* Bottom CTA — Telegram button only for authed users */}
            {isAuthed && (
              <div className="text-center pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={shareToken ? `https://t.me/innervector_1bot?start=${shareToken}` : 'https://t.me/innervector_1bot'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-[#229ED9] text-white font-semibold hover:bg-[#1a8bbf] transition-all text-sm shadow-lg shadow-[#229ED9]/20"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.17 14.55l-2.945-.924c-.64-.203-.654-.64.136-.954l11.49-4.43c.538-.194 1.006.131.843.979z"/>
                  </svg>
                  {lang === 'ru' ? 'Начать с Вектор Коучем Данияром' : lang === 'ky' ? 'Данияр менен баштоо' : 'Start with Vector Coach Daniyar'}
                </a>
                <button
                  onClick={() => router.push('/')}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/8 transition-all text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {t.analyzeAnother}
                </button>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}

export default function ResultsPage() {
  const { t } = useLang();
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-radial flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner" />
          <p className="text-slate-400 text-sm">{t.loading}</p>
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
