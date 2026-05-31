'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, Analysis } from '@/lib/supabase';
import { DOMAIN_COLORS, getDomainForStrength } from '@/lib/strengths';
import { useAuth } from '@/components/LoginModal';
import { useLang } from '@/lib/LanguageContext';
import { domainColors } from '@/data/vectorTraits';
import type { Domain } from '@/data/vectorTraits';

interface VectorTestRecord {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  top5: Array<{ name: string; pct: number; d: Domain }> | null;
  scores?: Record<string, { a: number; b: number }> | null;
  completed_at: string | null;
  share_token: string | null;
  test_mode: string | null;
  lang: string | null;
  analysis?: Record<string, unknown> | null;
  paid_at?: string | null;
}


function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ── Strength name translations ──────────────────────────────────────────────
const STRENGTH_TRANSLATIONS: Record<string, { ru: string; ky: string }> = {
  'Achiever':         { ru: 'Достижение',            ky: 'Жетишкендик' },
  'Activator':        { ru: 'Активатор',              ky: 'Активатор' },
  'Adaptability':     { ru: 'Адаптивность',           ky: 'Ийкемдүүлүк' },
  'Analytical':       { ru: 'Аналитика',              ky: 'Аналитика' },
  'Arranger':         { ru: 'Организованность',       ky: 'Уюштуруучу' },
  'Belief':           { ru: 'Убеждения',              ky: 'Ишенимдер' },
  'Command':          { ru: 'Командование',           ky: 'Командалык' },
  'Communication':    { ru: 'Коммуникация',           ky: 'Коммуникация' },
  'Competition':      { ru: 'Соперничество',          ky: 'Атаандашуу' },
  'Connectedness':    { ru: 'Связанность',            ky: 'Байланыштуулук' },
  'Consistency':      { ru: 'Последовательность',     ky: 'Ырааттуулук' },
  'Context':          { ru: 'Контекст',               ky: 'Контекст' },
  'Deliberative':     { ru: 'Осторожность',           ky: 'Этияттык' },
  'Developer':        { ru: 'Развитие людей',         ky: 'Өнүктүрүүчү' },
  'Discipline':       { ru: 'Дисциплина',             ky: 'Тартип' },
  'Empathy':          { ru: 'Эмпатия',                ky: 'Эмпатия' },
  'Focus':            { ru: 'Концентрация',           ky: 'Фокус' },
  'Futuristic':       { ru: 'Визионерство',           ky: 'Келечекчил' },
  'Harmony':          { ru: 'Гармония',               ky: 'Гармония' },
  'Ideation':         { ru: 'Генерация идей',         ky: 'Идея генерациясы' },
  'Includer':         { ru: 'Инклюзивность',          ky: 'Кошумчалоочу' },
  'Individualization':{ ru: 'Индивидуализация',       ky: 'Жекечелештирүү' },
  'Input':            { ru: 'Сбор информации',        ky: 'Маалымат чогултуу' },
  'Intellection':     { ru: 'Интеллект',              ky: 'Интеллект' },
  'Learner':          { ru: 'Обучаемость',            ky: 'Үйрөнүүчү' },
  'Maximizer':        { ru: 'Максимизатор',           ky: 'Максималдаштыруучу' },
  'Positivity':       { ru: 'Позитивность',           ky: 'Позитивдүүлүк' },
  'Relator':          { ru: 'Близость',               ky: 'Жакындык' },
  'Responsibility':   { ru: 'Ответственность',        ky: 'Жоопкерчилик' },
  'Restorative':      { ru: 'Восстановление',         ky: 'Калыбына келтируучу' },
  'Self-Assurance':   { ru: 'Самоуверенность',        ky: 'Өзүнө ишенүү' },
  'Significance':     { ru: 'Значимость',             ky: 'Маанилүүлүк' },
  'Strategic':        { ru: 'Стратегическое мышление',ky: 'Стратегиялык ой' },
  'Woo':              { ru: 'Завоевание симпатии',    ky: 'Жактыруу' },
};

const DOMAIN_TRANSLATIONS: Record<string, { ru: string; ky: string; color: string }> = {
  'Executing':             { ru: 'Исполнение',              ky: 'Аткаруу',             color: '#3b82f6' },
  'Influencing':           { ru: 'Влияние',                 ky: 'Таасир этүү',         color: '#f97316' },
  'Relationship Building': { ru: 'Построение отношений',    ky: 'Мамиле куруу',        color: '#10b981' },
  'Strategic Thinking':    { ru: 'Стратегическое мышление', ky: 'Стратегиялык ой',     color: '#a855f7' },
};

function translateStrength(name: string, lang: string): string {
  const t = STRENGTH_TRANSLATIONS[name];
  if (!t || lang === 'en') return name;
  const tr = lang === 'ru' ? t.ru : t.ky;
  return `${name} <span class="tr">(${tr})</span>`;
}

function domainColor(name: string): string {
  return DOMAIN_TRANSLATIONS[name]?.color ?? '#d4a843';
}

function downloadPDF(analysis: Analysis): Promise<void> {
  return new Promise((resolve) => {
    const lang = analysis.lang ?? 'en';
    const displayName = analysis.full_name?.trim() || 'Anonymous';
    const dateStr = analysis.created_at ? formatDate(analysis.created_at) : '';
    const strengths: string[] = analysis.strengths ?? [];

    let data: Record<string, unknown> = {};
    try {
      const cleaned = analysis.analysis.trim()
        .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
      data = JSON.parse(cleaned);
    } catch { /* fallback */ }

    const isRu = lang === 'ru';
    const isKy = lang === 'ky';
    const L = {
      report:        isRu ? 'Отчёт об оценке талантов'        : isKy ? 'Таланттарды баалоо отчёту'                  : 'Talent Assessment Report',
      domain:        isRu ? 'Доминирующий домен'               : isKy ? 'Үстөмдүк кылган домен'                      : 'Dominant Domain',
      dna:           isRu ? 'ДНК Талантов'                     : isKy ? 'Таланттын ДНК-сы'                            : 'Talent DNA',
      superpower:    isRu ? 'Суперсила'                        : isKy ? 'Суперкүч'                                    : 'Superpower',
      interact:      isRu ? 'Взаимодействие сильных сторон'    : isKy ? 'Күчтүү жактардын өз ара аракети'             : 'How Strengths Interact',
      domainReason:  isRu ? 'Почему этот домен?'               : isKy ? 'Эмне үчүн бул домен?'                        : 'Domain Reason',
      strengthsLabel:isRu ? 'Топ сильных сторон'               : isKy ? 'Топ күчтүү жактар'                           : 'Top Strengths',
      blindSpots:    isRu ? 'Слепые зоны'                      : isKy ? 'Байкалбаган жактар'                          : 'Blind Spots',
      combinations:  isRu ? 'Сочетания талантов'               : isKy ? 'Талант айкалыштары'                          : 'Talent Combinations',
      atBest:        isRu ? 'В лучшем виде'                    : isKy ? 'Эң мыктысы'                                  : 'At its best',
      backfires:     isRu ? 'Риск'                             : isKy ? 'Коркунуч'                                    : 'Backfires when',
      famous:        isRu ? 'Известные люди с похожим профилем': isKy ? 'Окшош профилдеги белгилүү адамдар'           : 'Famous Similar Profiles',
      careers:       isRu ? 'Идеальные карьеры'                : isKy ? 'Идеалдуу карьера'                            : 'Ideal Careers',
      firstStep:     isRu ? 'Первый шаг'                       : isKy ? 'Биринчи кадам'                               : 'First step',
      partners:      isRu ? 'Идеальные партнёры'               : isKy ? 'Идеалдуу иш өнөктөштөр'                     : 'Ideal Work Partners',
      footer:        isRu ? 'Создано Inner Vector · innervector.co' : isKy ? 'Inner Vector тарабынан · innervector.co' : 'Generated by Inner Vector · innervector.co',
    };

    const dominantDomain = (data.dominantDomain as string) || '';
    const dColor = domainColor(dominantDomain);

    // ── Strengths list ──
    const strengthsHtml = strengths.map((s, i) => {
      // find domain color for this strength
      const domEntry = Object.entries(DOMAIN_TRANSLATIONS).find(([dName]) => {
        const found = [
          ['Achiever','Arranger','Belief','Consistency','Deliberative','Discipline','Focus','Responsibility','Restorative'],
          ['Activator','Command','Communication','Competition','Maximizer','Self-Assurance','Significance','Woo'],
          ['Adaptability','Connectedness','Developer','Empathy','Harmony','Includer','Individualization','Positivity','Relator'],
          ['Analytical','Context','Futuristic','Ideation','Input','Intellection','Learner','Strategic'],
        ];
        const idx = ['Executing','Influencing','Relationship Building','Strategic Thinking'].indexOf(dName);
        return idx >= 0 && found[idx]?.includes(s);
      });
      const sColor = domEntry ? domEntry[1].color : '#d4a843';
      return `<div class="strength-row">
        <span class="s-num" style="background:${sColor}20;color:${sColor};border:1px solid ${sColor}40">${i + 1}</span>
        <span class="s-name">${translateStrength(s, lang)}</span>
        <span class="s-dot" style="background:${sColor}"></span>
      </div>`;
    }).join('');

    // ── Blind spots ──
    const blindSpotsHtml = Array.isArray(data.blindSpots)
      ? (data.blindSpots as string[]).map((b, i) =>
          `<div class="blind-row"><span class="blind-num">${i + 1}</span><span>${b}</span></div>`
        ).join('') : '';

    // ── Combinations ──
    const combinationsHtml = Array.isArray(data.combinations)
      ? (data.combinations as {name:string;type:string;rarity:string;talents:string[];mechanism:string;atItsBest:string;whenItBackfires:string}[]).map(c =>
          `<div class="combo-card">
            <div class="combo-header">
              <span class="combo-name">${c.name}</span>
              <span class="combo-meta">${c.type} · ${c.rarity}</span>
            </div>
            <div class="combo-talents">${(c.talents||[]).map(t => `<span class="ctag">${translateStrength(t, lang)}</span>`).join('')}</div>
            <div class="combo-mech">${c.mechanism}</div>
            <div class="combo-grid">
              <div class="combo-good">✓ ${c.atItsBest}</div>
              <div class="combo-bad">✗ ${c.whenItBackfires}</div>
            </div>
          </div>`
        ).join('') : '';

    // ── Famous ──
    const famousHtml = Array.isArray(data.famousPeople)
      ? (data.famousPeople as {name:string;field:string;whyMatch:string;achievement:string}[]).map(p =>
          `<div class="person-card">
            <div class="person-header">
              <span class="person-name">${p.name}</span>
              <span class="person-field">${p.field}</span>
            </div>
            <div class="person-why">${p.whyMatch}</div>
            <div class="person-ach">${p.achievement}</div>
          </div>`
        ).join('') : '';

    // ── Careers ──
    const careersHtml = Array.isArray(data.careers)
      ? (data.careers as {title:string;whyFits:string;firstStep:string}[]).map((c, i) =>
          `<div class="career-card">
            <div class="career-num">${i + 1}</div>
            <div class="career-body">
              <div class="career-title">${c.title}</div>
              <div class="career-why">${c.whyFits}</div>
              <div class="career-step"><span class="step-label">${L.firstStep}:</span> ${c.firstStep}</div>
            </div>
          </div>`
        ).join('') : '';

    // ── Partners ──
    const partnersHtml = Array.isArray(data.idealPartners)
      ? (data.idealPartners as {type:string;topStrengths:string[];whyComplement:string;dynamicInAction:string}[]).map(p =>
          `<div class="partner-card">
            <div class="partner-type">${p.type}</div>
            <div class="partner-tags">${(p.topStrengths||[]).map(s => `<span class="ptag">${translateStrength(s, lang)}</span>`).join('')}</div>
            <div class="partner-why">${p.whyComplement}</div>
            <div class="partner-dyn">${p.dynamicInAction}</div>
          </div>`
        ).join('') : '';

    const secHtml = (icon: string, label: string, content: string) =>
      content ? `<div class="section">
        <div class="sec-head"><span class="sec-icon">${icon}</span><span class="sec-label">${label}</span></div>
        <div class="sec-body">${content}</div>
      </div>` : '';

    const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8"/>
<title>Inner Vector — ${displayName}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Playfair+Display:wght@700&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Inter',sans-serif;color:#1a2332;background:#fff;font-size:10.5pt;line-height:1.65;-webkit-print-color-adjust:exact;print-color-adjust:exact}

  /* ── Header ── */
  .header{background:linear-gradient(135deg,#0d111e 0%,#111827 60%,#0f1829 100%);padding:28px 36px 24px;position:relative;overflow:hidden}
  .header::after{content:'';position:absolute;top:0;right:0;width:220px;height:100%;background:radial-gradient(ellipse at top right,${dColor}18 0%,transparent 70%)}
  .header-top{display:flex;justify-content:space-between;align-items:flex-start;position:relative}
  .brand{display:flex;align-items:center;gap:10px}
  .brand-dot{width:32px;height:32px;border-radius:50%;background:${dColor}25;border:1.5px solid ${dColor}50;display:flex;align-items:center;justify-content:center;font-size:10pt;font-weight:700;color:${dColor}}
  .brand-name{color:#d4a843;font-family:'Playfair Display',serif;font-size:18pt;font-weight:700;letter-spacing:.02em}
  .brand-sub{color:#64748b;font-size:8pt;margin-top:1px;letter-spacing:.06em}
  .header-person{text-align:right}
  .person-display-name{color:#fff;font-size:14pt;font-weight:600;letter-spacing:.01em}
  .person-date{color:#475569;font-size:8pt;margin-top:3px}
  .domain-strip{margin-top:18px;display:flex;align-items:center;gap:10px;position:relative}
  .domain-pill{display:inline-flex;align-items:center;gap:7px;background:${dColor}18;border:1.5px solid ${dColor}40;border-radius:20px;padding:5px 14px}
  .domain-dot{width:8px;height:8px;border-radius:50%;background:${dColor}}
  .domain-text{color:${dColor};font-size:8.5pt;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
  .domain-en{color:${dColor};font-weight:700}
  .tr-domain{color:${dColor}90;font-weight:400;font-style:italic}
  .dna-quote{color:#94a3b8;font-size:9pt;font-style:italic;margin-top:10px;padding-left:4px;line-height:1.5;position:relative}
  .dna-quote::before{content:'"';font-size:20pt;color:${dColor}40;position:absolute;left:-8px;top:-6px;font-family:'Playfair Display',serif;line-height:1}

  /* ── Content ── */
  .content{padding:20px 36px 10px}

  /* ── Sections ── */
  .section{margin-bottom:18px;break-inside:avoid;page-break-inside:avoid}
  .sec-head{display:flex;align-items:center;gap:8px;margin-bottom:8px;border-bottom:1.5px solid #f1f5f9;padding-bottom:5px}
  .sec-icon{font-size:11pt}
  .sec-label{font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#64748b}
  .sec-body{font-size:10pt;color:#1e2937;line-height:1.7}

  /* ── DNA / Superpower / Interact ── */
  .highlight-box{background:#fafbfc;border-left:3px solid ${dColor};border-radius:0 6px 6px 0;padding:10px 14px;font-size:10.5pt;color:#1e2937;line-height:1.65}
  .highlight-box.gold{border-left-color:#d4a843;background:#fffdf5}

  /* ── Strengths ── */
  .strengths-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 16px}
  .strength-row{display:flex;align-items:center;gap:8px;padding:4px 6px;border-radius:6px;background:#fafbfc}
  .s-num{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:7.5pt;font-weight:700;flex-shrink:0}
  .s-name{font-size:10pt;font-weight:500;color:#1e2937;flex:1}
  .s-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0}
  .tr{color:#94a3b8;font-weight:400;font-style:italic;font-size:9pt}

  /* ── Blind Spots ── */
  .blind-row{display:flex;gap:10px;padding:5px 0;border-bottom:1px solid #f8fafc}
  .blind-row:last-child{border-bottom:none}
  .blind-num{width:20px;height:20px;border-radius:50%;background:#fef3c7;color:#b45309;font-size:8pt;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px}

  /* ── Combinations ── */
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

  /* ── Famous ── */
  .famous-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .person-card{background:#fafbfc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px}
  .person-header{display:flex;align-items:baseline;gap:8px;margin-bottom:4px}
  .person-name{font-weight:700;font-size:10.5pt;color:#1e2937}
  .person-field{font-size:7.5pt;color:#64748b;font-style:italic}
  .person-why{font-size:9pt;color:#475569;line-height:1.5;margin-bottom:3px}
  .person-ach{font-size:8.5pt;color:#94a3b8;font-style:italic}

  /* ── Careers ── */
  .career-card{display:flex;gap:12px;padding:8px 0;border-bottom:1px solid #f1f5f9;align-items:flex-start}
  .career-card:last-child{border-bottom:none}
  .career-num{width:26px;height:26px;border-radius:50%;background:${dColor}15;border:1.5px solid ${dColor}30;color:${dColor};font-size:9pt;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px}
  .career-title{font-weight:700;font-size:10.5pt;color:#1e2937;margin-bottom:3px}
  .career-why{font-size:9pt;color:#475569;line-height:1.5;margin-bottom:3px}
  .career-step{font-size:8.5pt;color:#64748b;font-style:italic}
  .step-label{color:${dColor};font-weight:600;font-style:normal}

  /* ── Partners ── */
  .partner-card{background:#fafbfc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px;margin-bottom:8px}
  .partner-type{font-weight:700;font-size:10.5pt;color:#1e2937;margin-bottom:5px}
  .partner-tags{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:5px}
  .ptag{background:#f0fdf4;color:#166534;font-size:7.5pt;padding:2px 8px;border-radius:10px;border:1px solid #bbf7d0}
  .partner-why{font-size:9pt;color:#475569;line-height:1.5;margin-bottom:3px}
  .partner-dyn{font-size:8.5pt;color:#94a3b8;font-style:italic}

  /* ── Footer ── */
  .footer{background:#0d111e;padding:10px 36px;display:flex;justify-content:space-between;align-items:center;margin-top:16px}
  .footer-left{color:#475569;font-size:7.5pt}
  .footer-brand{color:#d4a843;font-size:8pt;font-weight:600;letter-spacing:.06em}

  @media print{
    body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .header,.footer,.domain-pill,.highlight-box{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .section{page-break-inside:avoid}
  }
</style>
</head>
<body>

<!-- ── HEADER ── -->
<div class="header">
  <div class="header-top">
    <div class="brand">
      <div class="brand-dot">IV</div>
      <div>
        <div class="brand-name">Inner Vector</div>
        <div class="brand-sub">${isRu ? 'ВАШ ВНУТРЕННИЙ ВЕКТОР' : isKy ? 'СИЗДИН ИЧКИ ВЕКТОРУНУЗ' : 'YOUR INNER VECTOR'}</div>
      </div>
    </div>
    <div class="header-person">
      <div class="person-display-name">${displayName}</div>
      <div class="person-date">${dateStr}</div>
    </div>
  </div>
  <div class="domain-strip">
    <div class="domain-pill">
      <span class="domain-dot"></span>
      <span class="domain-text">${L.domain}: <span class="domain-en">${dominantDomain}</span>${dominantDomain && lang !== 'en' ? ` <span class="tr-domain">(${isRu ? DOMAIN_TRANSLATIONS[dominantDomain]?.ru : DOMAIN_TRANSLATIONS[dominantDomain]?.ky})</span>` : ''}</span>
    </div>
  </div>
  ${data.talentDNA ? `<div class="dna-quote">${(data.talentDNA as string)}</div>` : ''}
</div>

<!-- ── CONTENT ── -->
<div class="content">

  ${data.superpower ? `<div class="section">
    <div class="sec-head"><span class="sec-icon">✦</span><span class="sec-label">${L.superpower}</span></div>
    <div class="highlight-box gold">${(data.superpower as string)}</div>
  </div>` : ''}

  ${data.strengthsInteraction ? `<div class="section">
    <div class="sec-head"><span class="sec-icon">◎</span><span class="sec-label">${L.interact}</span></div>
    <div class="highlight-box">${(data.strengthsInteraction as string)}</div>
  </div>` : ''}

  ${data.domainReason ? `<div class="section">
    <div class="sec-head"><span class="sec-icon">◆</span><span class="sec-label">${L.domainReason}</span></div>
    <div class="sec-body">${(data.domainReason as string)}</div>
  </div>` : ''}

  <div class="section">
    <div class="sec-head"><span class="sec-icon">★</span><span class="sec-label">${L.strengthsLabel} (${strengths.length})</span></div>
    <div class="strengths-grid">${strengthsHtml}</div>
  </div>

  ${blindSpotsHtml ? secHtml('⚠', L.blindSpots, blindSpotsHtml) : ''}

  ${combinationsHtml ? `<div class="section">
    <div class="sec-head"><span class="sec-icon">⚡</span><span class="sec-label">${L.combinations}</span></div>
    <div class="sec-body">${combinationsHtml}</div>
  </div>` : ''}

  ${famousHtml ? `<div class="section">
    <div class="sec-head"><span class="sec-icon">👤</span><span class="sec-label">${L.famous}</span></div>
    <div class="famous-grid">${famousHtml}</div>
  </div>` : ''}

  ${careersHtml ? `<div class="section">
    <div class="sec-head"><span class="sec-icon">💼</span><span class="sec-label">${L.careers}</span></div>
    <div class="sec-body">${careersHtml}</div>
  </div>` : ''}

  ${partnersHtml ? `<div class="section">
    <div class="sec-head"><span class="sec-icon">🤝</span><span class="sec-label">${L.partners}</span></div>
    <div class="sec-body">${partnersHtml}</div>
  </div>` : ''}

</div>

<!-- ── FOOTER ── -->
<div class="footer">
  <span class="footer-left">${L.footer}</span>
  <span class="footer-brand">INNER VECTOR</span>
</div>

</body></html>`;

    const win = window.open('', '_blank');
    if (!win) { resolve(); return; }
    win.document.write(html);
    win.document.close();
    setTimeout(() => {
      win.print();
      resolve();
    }, 900);
  });
}


export default function HistoryPage() {
  const router = useRouter();
  const { isAuthed, isSuperAdmin, authLoading } = useAuth();
  const { lang } = useLang();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [vectorResults, setVectorResults] = useState<VectorTestRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'gallup' | 'vector'>('gallup');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [vectorSearch, setVectorSearch] = useState('');

  // Delete flow
  const [deleteTarget, setDeleteTarget] = useState<Analysis | null>(null);
  const [vectorDeleteTarget, setVectorDeleteTarget] = useState<VectorTestRecord | null>(null);
  const [deleteStep, setDeleteStep] = useState<'confirm' | 'password'>('confirm');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const openDelete = (a: Analysis) => {
    setDeleteTarget(a);
    setDeleteStep('confirm');
    setDeletePassword('');
    setDeleteError('');
  };
  const openVectorDelete = (r: VectorTestRecord) => {
    setVectorDeleteTarget(r);
    setDeleteStep('confirm');
    setDeletePassword('');
    setDeleteError('');
  };
  const closeDelete = () => {
    setDeleteTarget(null);
    setVectorDeleteTarget(null);
    setDeletePassword('');
    setDeleteError('');
  };

  const handleDeleteConfirm = () => setDeleteStep('password');

  const handleDeleteSubmit = async () => {
    const validPasswords = ['vectorpass312', 'vectorpass88'];
    if (!validPasswords.includes(deletePassword)) {
      setDeleteError(lang === 'ru' ? 'Неверный пароль' : lang === 'ky' ? 'Сырсөз туура эмес' : 'Wrong password');
      return;
    }
    setDeleting(true);
    if (deleteTarget?.id) {
      await supabase.from('analyses').delete().eq('id', deleteTarget.id);
      setAnalyses(prev => prev.filter(a => a.id !== deleteTarget.id));
    } else if (vectorDeleteTarget?.id) {
      await supabase.from('vector_test_results').delete().eq('id', vectorDeleteTarget.id);
      setVectorResults(prev => prev.filter(r => r.id !== vectorDeleteTarget.id));
    }
    setDeleting(false);
    closeDelete();
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthed) { router.replace('/'); return; }

    // Initial load
    Promise.all([
      supabase.from('analyses').select('*').order('created_at', { ascending: false }),
      supabase.from('vector_test_results').select('id, full_name, email, phone, top5, scores, completed_at, share_token, test_mode, lang, analysis, paid_at').order('completed_at', { ascending: false }),
    ]).then(([analysesRes, vectorRes]) => {
      setAnalyses(analysesRes.data ?? []);
      setVectorResults((vectorRes.data ?? []) as VectorTestRecord[]);
      setLoading(false);
    });

    // Realtime — new vector test results appear instantly
    const channel = supabase
      .channel('history-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'vector_test_results' }, (payload) => {
        const row = payload.new as VectorTestRecord;
        setVectorResults(prev => [row, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'vector_test_results' }, (payload) => {
        const row = payload.new as VectorTestRecord;
        setVectorResults(prev => prev.map(r => r.id === row.id ? { ...r, ...row } : r));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'analyses' }, (payload) => {
        const row = payload.new as Analysis;
        setAnalyses(prev => [row, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isAuthed, authLoading, router]);

  if (authLoading || loading) {
    return <div className="min-h-screen bg-radial" />;
  }

  const filtered = analyses.filter((a) =>
    (a.full_name ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredVector = vectorResults.filter((r) =>
    (r.full_name ?? '').toLowerCase().includes(vectorSearch.toLowerCase()) ||
    (r.email ?? '').toLowerCase().includes(vectorSearch.toLowerCase())
  );

  const handleDownload = async (a: Analysis) => {
    setDownloading(a.id ?? '');
    await downloadPDF(a);
    setDownloading(null);
  };

  return (
    <div className="min-h-screen bg-radial flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-4 sm:px-6 pt-5 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {lang === 'ru' ? 'Назад' : lang === 'ky' ? 'Артка' : 'Back'}
          </button>
          <span className="text-white/10">|</span>
          <span className="text-gold/70 text-xs font-medium tracking-widest uppercase">
            {lang === 'ru' ? 'История анализов' : lang === 'ky' ? 'Талдоо тарыхы' : 'Analysis History'}
          </span>
        </div>
        <span className="text-gold/60 text-xs font-medium tracking-widest uppercase hidden sm:block">Inner Vector</span>
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-serif text-3xl font-bold text-white">
              {lang === 'ru' ? 'Все профили' : lang === 'ky' ? 'Бардык профилдер' : 'All Profiles'}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {activeTab === 'gallup' ? filtered.length : filteredVector.length} {lang === 'ru' ? 'записей' : lang === 'ky' ? 'жазуу' : 'records'}
              {activeTab === 'vector' && filteredVector.length > 0 && (
                <span className="text-slate-600 ml-2">
                  · {filteredVector.filter(r => r.test_mode === 'full').length} full · {filteredVector.filter(r => r.test_mode === 'express').length} express
                </span>
              )}
            </p>
          </div>

          {/* Search */}
          {activeTab === 'gallup' && (
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
                placeholder={lang === 'ru' ? 'Поиск по имени...' : lang === 'ky' ? 'Аты боюнча издөө...' : 'Search by name...'}
                className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold/40 transition-all text-sm w-full sm:w-52"
              />
            </div>
          )}
          {activeTab === 'vector' && (
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={vectorSearch}
                onChange={(e) => setVectorSearch(e.target.value)}
                placeholder={lang === 'ru' ? 'Поиск по имени...' : lang === 'ky' ? 'Аты боюнча издөө...' : 'Search by name...'}
                className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold/40 transition-all text-sm w-full sm:w-52"
              />
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white/4 border border-white/8 p-1 rounded-xl w-fit mb-6">
          <button
            onClick={() => setActiveTab('gallup')}
            className={`px-5 py-2 rounded-lg text-xs font-semibold tracking-widest uppercase transition-all duration-200 ${
              activeTab === 'gallup'
                ? 'bg-gold/15 text-gold border border-gold/25'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Gallup
          </button>
          <button
            onClick={() => setActiveTab('vector')}
            className={`px-5 py-2 rounded-lg text-xs font-semibold tracking-widest uppercase transition-all duration-200 ${
              activeTab === 'vector'
                ? 'bg-gold/15 text-gold border border-gold/25'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Inner Vector
          </button>
        </div>

        {/* Gallup Tab */}
        {activeTab === 'gallup' && (filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-600">
            <svg className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {lang === 'ru' ? 'Нет записей' : lang === 'ky' ? 'Жазуулар жок' : 'No records found'}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((a, idx) => {
              const strengths: string[] = a.strengths ?? [];
              const isDownloading = downloading === a.id;

              return (
                <div
                  key={a.id ?? idx}
                  className="group flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 rounded-2xl border border-white/8 bg-white/3 hover:bg-white/5 hover:border-white/12 transition-all duration-200 cursor-pointer"
                  onClick={() => router.push(`/results?id=${a.id}&lang=${a.lang ?? 'en'}`)}
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

                  {/* Actions */}
                  <div className="flex-shrink-0 flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {/* Open profile */}
                    <button
                      onClick={() => router.push(`/results?id=${a.id}&lang=${a.lang ?? 'en'}`)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-medium hover:bg-white/10 hover:text-white transition-all duration-200"
                      title="View full profile"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {lang === 'ru' ? 'Профиль' : lang === 'ky' ? 'Профил' : 'Profile'}
                    </button>

                    {/* Gallup, PDF, Delete — только для superadmin */}
                    {isSuperAdmin && (<>
                      {a.gallup_file_url && (
                        <a
                          href={a.gallup_file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/8 border border-purple-500/20 text-purple-400 text-xs font-medium hover:bg-purple-500/15 hover:border-purple-500/30 transition-all duration-200"
                          title="Gallup original report"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          Gallup
                        </a>
                      )}
                      <button
                        onClick={() => handleDownload(a)}
                        disabled={isDownloading}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gold/10 border border-gold/20 text-gold text-xs font-medium hover:bg-gold/20 transition-all duration-200 disabled:opacity-50"
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
                      <button
                        onClick={() => openDelete(a)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/8 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/15 hover:border-red-500/30 transition-all duration-200"
                        title={lang === 'ru' ? 'Удалить' : 'Delete'}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </>)}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Inner Vector Tab */}
        {activeTab === 'vector' && (
          filteredVector.length === 0 ? (
            <div className="text-center py-20 text-slate-600">
              <svg className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {lang === 'ru' ? 'Нет записей' : lang === 'ky' ? 'Жазуулар жок' : 'No records found'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredVector.map((r, idx) => {
                const top5 = r.top5 ?? [];
                return (
                  <div
                    key={r.id ?? idx}
                    className="flex flex-col gap-3 p-4 rounded-2xl border border-white/8 bg-white/3 hover:bg-white/5 hover:border-white/12 transition-all duration-200"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      {/* Index */}
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 text-xs font-bold">
                        {idx + 1}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="text-white font-semibold text-sm truncate">
                            {r.full_name?.trim() || <span className="text-slate-600 italic">—</span>}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${
                            r.test_mode === 'full' ? 'bg-gold/15 text-gold' : 'bg-blue-400/15 text-blue-400'
                          }`}>{r.test_mode ?? 'full'}</span>
                          {r.paid_at ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                              {lang === 'ru' ? 'Оплачен' : 'Paid'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide bg-red-500/10 text-red-400 border border-red-500/20">
                              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                              {lang === 'ru' ? 'Не оплачен' : 'Unpaid'}
                            </span>
                          )}
                          <span className="text-slate-600 text-xs flex-shrink-0">
                            {r.completed_at ? formatDate(r.completed_at) : ''}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                          {r.email && <span className="text-slate-500 text-xs">{r.email}</span>}
                          {r.phone && <span className="text-slate-500 text-xs">{r.phone}</span>}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 flex items-center gap-2">
                        {r.share_token && (
                          <button
                            onClick={() => router.push(`/vector-profile/${r.share_token}`)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-medium hover:bg-white/10 hover:text-white transition-all duration-200"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {lang === 'ru' ? 'Профиль' : lang === 'ky' ? 'Профил' : 'Profile'}
                          </button>
                        )}
                        {isSuperAdmin && (<>
                          {r.share_token && (
                            <a
                              href={`/vector-profile/${r.share_token}?pdf=1`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gold/10 border border-gold/20 text-gold text-xs font-medium hover:bg-gold/20 transition-all duration-200"
                              title="Download PDF"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              PDF
                            </a>
                          )}
                          <button
                            onClick={() => openVectorDelete(r)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/8 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/15 hover:border-red-500/30 transition-all duration-200"
                            title={lang === 'ru' ? 'Удалить' : 'Delete'}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>)}
                      </div>
                    </div>

                    {/* Top 5 trait pills */}
                    {top5.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pl-11">
                        {top5.map((t, i) => {
                          const color = domainColors[t.d as Domain] ?? '#d4a843';
                          return (
                            <span
                              key={t.name}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs border font-medium"
                              style={{ color, borderColor: color + '55', background: color + '12' }}
                            >
                              <span className="opacity-50 text-[10px] font-bold">{i + 1}</span>
                              {t.name}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}
      </main>

      <footer className="text-center py-6 text-slate-600 text-xs border-t border-white/5">
        Inner Vector · Talent Assessment
      </footer>

      {/* ── Delete Modal ── */}
      {(deleteTarget || vectorDeleteTarget) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeDelete} />

          <div className="relative w-full max-w-sm bg-navy-800 border border-white/10 rounded-2xl shadow-2xl p-6 animate-fade-in">

            {deleteStep === 'confirm' ? (
              <>
                {/* Icon */}
                <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="font-serif text-lg text-white text-center mb-2">
                  {lang === 'ru' ? 'Удалить профиль?' : lang === 'ky' ? 'Профилди өчүрүү?' : 'Delete profile?'}
                </h3>
                <p className="text-slate-400 text-sm text-center mb-1">
                  {(deleteTarget?.full_name ?? vectorDeleteTarget?.full_name)?.trim() || 'Anonymous'}
                </p>
                <p className="text-slate-600 text-xs text-center mb-6">
                  {lang === 'ru' ? 'Это действие нельзя отменить.' : lang === 'ky' ? 'Бул аракетти кайтаруу мүмкүн эмес.' : 'This action cannot be undone.'}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={closeDelete}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm font-medium hover:bg-white/10 transition-all"
                  >
                    {lang === 'ru' ? 'Отмена' : lang === 'ky' ? 'Жок' : 'Cancel'}
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="flex-1 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/25 transition-all"
                  >
                    {lang === 'ru' ? 'Да, удалить' : lang === 'ky' ? 'Ооба, өчүр' : 'Yes, delete'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-10a4 4 0 00-4 4v1H6a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2v-6a2 2 0 00-2-2h-2v-1a4 4 0 00-4-4z" />
                  </svg>
                </div>
                <h3 className="font-serif text-lg text-white text-center mb-2">
                  {lang === 'ru' ? 'Введите пароль' : lang === 'ky' ? 'Сырсөздү киргизиңиз' : 'Enter password'}
                </h3>
                <p className="text-slate-500 text-xs text-center mb-5">
                  {lang === 'ru' ? 'Для подтверждения удаления введите пароль администратора' : lang === 'ky' ? 'Өчүрүүнү ырастоо үчүн администратордун сырсөзүн киргизиңиз' : 'Enter admin password to confirm deletion'}
                </p>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={e => { setDeletePassword(e.target.value); setDeleteError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleDeleteSubmit()}
                  placeholder={lang === 'ru' ? 'Пароль...' : 'Password...'}
                  autoFocus
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-red-500/40 text-sm mb-2"
                />
                {deleteError && (
                  <p className="text-red-400 text-xs text-center mb-3">{deleteError}</p>
                )}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setDeleteStep('confirm')}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm font-medium hover:bg-white/10 transition-all"
                  >
                    {lang === 'ru' ? 'Назад' : lang === 'ky' ? 'Артка' : 'Back'}
                  </button>
                  <button
                    onClick={handleDeleteSubmit}
                    disabled={deleting || !deletePassword}
                    className="flex-1 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/25 transition-all disabled:opacity-40"
                  >
                    {deleting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                        {lang === 'ru' ? 'Удаляем...' : '...'}
                      </span>
                    ) : (
                      lang === 'ru' ? 'Удалить' : lang === 'ky' ? 'Өчүр' : 'Delete'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
