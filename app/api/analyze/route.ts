import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AnalysisResult } from '@/lib/types';
import { saveAnalysis } from '@/lib/supabase';

export const maxDuration = 120; // Vercel Pro: up to 300s

const client = new Anthropic();

// Simple in-memory rate limiter: max 5 requests per IP per 10 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

/** Check for existing identical profile before running Claude */
async function findExistingAnalysis(full_name: string, strengths: string[]): Promise<{ share_token: string; analysis: string } | null> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const name = full_name.trim().toLowerCase();
    const { data } = await supabase
      .from('analyses')
      .select('share_token, analysis, strengths')
      .ilike('full_name', name)
      .order('created_at', { ascending: false })
      .limit(5);
    if (!data) return null;
    const incomingKey = strengths.join(',');
    const match = data.find((row) => (row.strengths ?? []).join(',') === incomingKey);
    return match ? { share_token: match.share_token, analysis: match.analysis } : null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  // Rate limit: 5 analyses per IP per 10 minutes
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please wait a few minutes.' }, { status: 429 });
  }

  try {
    const { strengths, lang = 'en', full_name = '', gallup_file_url } = await req.json();

    if (!strengths || !Array.isArray(strengths) || strengths.length < 5 || strengths.length > 10) {
      return NextResponse.json({ error: '5 to 10 strengths required' }, { status: 400 });
    }

    const langInstruction =
      lang === 'ru'
        ? 'IMPORTANT: Respond ENTIRELY in Russian. Every single text value in the JSON must be written in Russian. Do not use any English words except for proper names of people and the dominantDomain field. CRITICAL: Every time you mention a CliftonStrengths theme name in the text, write it as: EnglishName (Русский перевод) — for example: "Self-Assurance (Самоуверенность)", "Futuristic (Визионерство)", "Individualization (Индивидуализация)", "Strategic (Стратегическое мышление)", "Ideation (Генерация идей)", "Learner (Обучаемость)", "Deliberative (Осторожность)", "Competition (Соперничество)", "Focus (Концентрация)", "Achiever (Достижение)", "Activator (Активатор)", "Adaptability (Адаптивность)", "Analytical (Аналитика)", "Arranger (Организованность)", "Belief (Убеждения)", "Command (Командование)", "Communication (Коммуникация)", "Connectedness (Связанность)", "Consistency (Последовательность)", "Context (Контекст)", "Developer (Развитие людей)", "Discipline (Дисциплина)", "Empathy (Эмпатия)", "Harmony (Гармония)", "Includer (Инклюзивность)", "Input (Сбор информации)", "Intellection (Интеллект)", "Maximizer (Максимизатор)", "Positivity (Позитивность)", "Relator (Близость)", "Responsibility (Ответственность)", "Restorative (Восстановление)", "Self-Assurance (Самоуверенность)", "Significance (Значимость)", "Woo (Завоевание симпатии)". Always show both: the English name first, then the Russian translation in parentheses.'
        : lang === 'ky'
        ? 'IMPORTANT: Respond ENTIRELY in Kyrgyz. Every single text value in the JSON must be written in Kyrgyz. Do not use any English words except for proper names of people and the dominantDomain field. CRITICAL: Every time you mention a CliftonStrengths theme name in the text, write it as: EnglishName (Кыргызча котормо) — for example: "Self-Assurance (Өз-өзүнө ишенүү)", "Futuristic (Болочокту көрүү)", "Individualization (Жекелештирүү)", "Strategic (Стратегиялык ой)", "Ideation (Идея жаратуу)", "Learner (Үйрөнүүчү)", "Deliberative (Этияттык)", "Competition (Атаандашуу)", "Focus (Топтолуу)", "Achiever (Жетишкендик)". Always show both: the English name first, then the Kyrgyz translation in parentheses.'
        : 'Respond entirely in English.';

    // ── Duplicate check before calling Claude ──────────────────────────────
    const existing = await findExistingAnalysis(full_name, strengths);
    if (existing) {
      console.info(`ℹ Duplicate profile for "${full_name}" — returning cached analysis`);
      try {
        const cleaned = existing.analysis.trim()
          .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
        const cached: AnalysisResult = JSON.parse(cleaned);
        return NextResponse.json({ ...cached, share_token: existing.share_token });
      } catch {
        // If cached JSON is broken, fall through to re-generate
      }
    }

    const rankedList = strengths.map((s: string, i: number) => `  ${i + 1}. ${s}`).join('\n');

    const prompt = `You are a world-class Gallup CliftonStrengths coach and organizational psychologist with 20+ years of experience. You give profound, highly specific, non-generic insights.

The user's CliftonStrengths profile (ranked from strongest to weakest):
${rankedList}

${langInstruction}

Analyze this specific combination deeply. Be concrete, personal, and insightful — avoid generic platitudes. Reference the actual strengths by name in your analysis.

Respond ONLY with a valid JSON object using this exact structure (no markdown, no code fences, no explanation outside the JSON):
{
  "talentDNA": "A vivid, specific one-sentence description of this person's unique talent fingerprint that references their actual top strengths",
  "dominantDomain": "Executing|Influencing|Relationship Building|Strategic Thinking",
  "domainReason": "A specific explanation of why this domain dominates given their exact combination — mention strength names",
  "strengthsInteraction": "2-3 rich sentences explaining how these specific strengths amplify, tension-balance, and complement each other in practice. Be concrete.",
  "superpower": "Their single most distinctive edge — a sharp one-sentence statement that would resonate deeply with this person",
  "blindSpots": [
    "A specific blind spot that emerges from their top strengths — concrete and actionable",
    "A second distinct blind spot with a practical implication",
    "A third blind spot, ideally showing an internal tension between two of their strengths"
  ],
  "famousPeople": [
    {
      "name": "Full Name",
      "field": "Their primary field or role",
      "whyMatch": "2 sentences specifically connecting their known behaviors/style to this strengths profile",
      "achievement": "One concrete achievement that clearly reflects the shared strengths pattern"
    }
  ],
  "careers": [
    {
      "title": "Specific Career or Role Title",
      "whyFits": "2 sentences connecting specific strengths from their profile to why this career is a natural fit",
      "firstStep": "A single concrete, actionable first step they can take this week"
    }
  ],
  "idealPartners": [
    {
      "type": "A short evocative label for this partner archetype, e.g. 'The Analytical Challenger'",
      "topStrengths": ["Strength1", "Strength2", "Strength3"],
      "whyComplement": "2 sentences explaining precisely why this person's strengths fill the gaps or amplify this profile — be specific about which strengths interact",
      "dynamicInAction": "One vivid, concrete real-work scenario showing how this duo operates together"
    }
  ],
  "combinations": [
    {
      "type": "signature",
      "name": "A memorable label for the top-3 combination",
      "talents": ["Talent1", "Talent2", "Talent3"],
      "mechanism": "Exactly how these 3 amplify each other — 2 sentences, name the talents explicitly",
      "atItsBest": "One sharp sentence: what this looks like when firing perfectly",
      "whenItBackfires": "One sharp sentence: the specific failure mode",
      "rarity": "1 in 10 / 1 in 50 / 1 in 100 people"
    },
    {
      "type": "hidden",
      "name": "A memorable label for a talent #4-7 paired with a top-3",
      "talents": ["TopTalent", "Mid-rangeTalent"],
      "mechanism": "How this specific pair amplifies each other — 2 sentences",
      "atItsBest": "One sharp sentence",
      "whenItBackfires": "One sharp sentence",
      "rarity": "1 in 10 / 1 in 50 / 1 in 100 people"
    },
    {
      "type": "tension",
      "name": "A memorable label for the conflicting pair",
      "talents": ["Talent1", "Talent2"],
      "mechanism": "Exactly how these two create internal tension — 2 sentences",
      "atItsBest": "One sharp sentence: when the tension becomes productive",
      "whenItBackfires": "One sharp sentence: when it causes paralysis or conflict",
      "rarity": "1 in 10 / 1 in 50 / 1 in 100 people"
    },
    {
      "type": "sleeper",
      "name": "A memorable label for the unexpected pair most people miss",
      "talents": ["Talent1", "Talent2"],
      "mechanism": "Why this surprising pair is actually powerful — 2 sentences",
      "atItsBest": "One sharp sentence",
      "whenItBackfires": "One sharp sentence",
      "rarity": "1 in 10 / 1 in 50 / 1 in 100 people"
    }
  ]
}

Rules:
- "dominantDomain" must be exactly one of: Executing, Influencing, Relationship Building, Strategic Thinking
- Return exactly 5 famous people, exactly 5 careers, and exactly 5 idealPartners
- Famous people must be real, well-known figures (not obscure)
- Careers should span different industries/contexts
- idealPartners must be distinct archetypes covering different domains — no two should be from the same CliftonStrengths domain
- idealPartners topStrengths must be valid CliftonStrengths names from the 34 themes
- combinations must have exactly 4 items: one of each type (signature, hidden, tension, sleeper)
- combinations talents must be valid CliftonStrengths names actually present in the user's profile
- Every insight must reference the actual strength names provided`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      system: 'You are a Gallup-certified CliftonStrengths Master Coach. You give deeply personalized, non-generic strength analysis. Always respond with valid JSON only — no markdown fences, no text before or after the JSON object.',
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response type' }, { status: 500 });
    }

    // Strip any accidental markdown fences before parsing
    const cleaned = content.text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
    const result: AnalysisResult = JSON.parse(cleaned);

    // Generate unique share token for client link
    const share_token = crypto.randomUUID();

    // Save to Supabase — skips insert if identical record already exists
    const { error: saveError, share_token: finalToken, duplicate } = await saveAnalysis({
      username: 'vector',
      full_name,
      strengths,
      lang,
      analysis: cleaned,
      created_at: new Date().toISOString(),
      share_token,
      ...(gallup_file_url ? { gallup_file_url } : {}),
    });
    if (saveError) {
      console.error('⚠ Analysis completed but failed to save to history:', saveError);
    }
    if (duplicate) {
      console.info(`ℹ Duplicate analysis skipped for "${full_name}" — returning existing record`);
    }

    return NextResponse.json({ ...result, share_token: finalToken ?? share_token });
  } catch (err) {
    console.error('Analyze error:', err);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
