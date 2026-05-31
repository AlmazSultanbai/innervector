import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 300;

const client = new Anthropic();

// English names for the 36 vectors
const VECTOR_EN: Record<string, string> = {
  'Убеждение': 'Persuasion', 'Вдохновение': 'Inspiration', 'Катализатор': 'Catalyst',
  'Репутация': 'Reputation', 'Инициатива': 'Initiative', 'Магнетизм': 'Magnetism',
  'Дисциплина': 'Discipline', 'Завершение': 'Completion', 'Системность': 'Systems',
  'Качество': 'Quality', 'Скорость': 'Speed', 'Ответственность': 'Responsibility',
  'Эмпатия': 'Empathy', 'Забота': 'Care', 'Глубина': 'Depth',
  'Партнёрство': 'Partnership', 'Честность': 'Honesty', 'Границы': 'Boundaries',
  'Анализ': 'Analysis', 'Стратегия': 'Strategy', 'Интуиция': 'Intuition',
  'Синтез': 'Synthesis', 'Осмотрительность': 'Deliberation', 'Любознательность': 'Curiosity',
  'Смысл': 'Meaning', 'Автономия': 'Autonomy', 'Вызов': 'Challenge',
  'Ритм': 'Rhythm', 'Новизна': 'Novelty', 'Тишина': 'Silence',
  'Мастерство': 'Mastery', 'Рефлексия': 'Reflection', 'Передача': 'Transfer',
  'Эксперимент': 'Experiment', 'Адаптация': 'Adaptation', 'Долгосрочный след': 'Legacy',
}

const DOMAIN_EN: Record<string, string> = {
  'vliyanie': 'Influence', 'realizacia': 'Execution', 'otnosenia': 'Relationships',
  'myshlenie': 'Thinking', 'energia': 'Energy', 'rost': 'Growth',
}

export async function POST(req: NextRequest) {
  try {
    const { top5, top10, bottom5, lang = 'ru', full_name = '', result_id } = await req.json();

    if (!top5 || !Array.isArray(top5) || top5.length < 5) {
      return NextResponse.json({ error: '5 vectors required' }, { status: 400 });
    }

    const vectors10 = top10 ?? top5;

    // Build vector list for prompt (use English names in prompt for better Claude output)
    const makeVectorName = (ruName: string) =>
      lang === 'ru' ? ruName : (VECTOR_EN[ruName] ?? ruName)

    const top5List = top5.map((v: {name:string;d:string}, i: number) =>
      `  ${i + 1}. ${makeVectorName(v.name)} (${DOMAIN_EN[v.d] ?? v.d})`
    ).join('\n')

    const top10List = vectors10.slice(5).length > 0
      ? vectors10.slice(5).map((v: {name:string;d:string}, i: number) =>
          `  ${i + 6}. ${makeVectorName(v.name)} (${DOMAIN_EN[v.d] ?? v.d})`
        ).join('\n')
      : null

    const bottom5List = bottom5?.length > 0
      ? bottom5.map((v: {name:string;d:string}) =>
          `  - ${makeVectorName(v.name)} (${DOMAIN_EN[v.d] ?? v.d})`
        ).join('\n')
      : null

    const langInstruction = lang === 'ru'
      ? 'ВАЖНО: Отвечай ПОЛНОСТЬЮ на русском языке. Каждое текстовое значение в JSON должно быть на русском. Обращайся к пользователю на "ты". Пиши живо, конкретно, без клише. Называй векторы по-русски.'
      : lang === 'ky'
      ? 'МААНИЛҮҮ: Бардык жооптор кыргызча болуш керек. JSON ичиндеги бардык текст кыргыз тилинде. Векторлорду кыргызча жаз.'
      : 'Respond entirely in English. Be direct, concrete, non-generic. Reference vector names in English.'

    // firstName reserved for future personalization
    // const firstName = full_name.trim().split(' ')[0] || ...

    const prompt = `You are a master Inner Vector coach with deep expertise in the proprietary 36-vector methodology. Inner Vector is a personality system based on 6 domains: Influence, Execution, Relationships, Thinking, Energy, Growth — each with 6 vectors. You give profound, specific, non-generic insights about a person's nature based on their vector profile.

${full_name ? `Person's name: ${full_name}` : ''}
Language: ${lang}

TOP 5 DOMINANT VECTORS (most defining, in order):
${top5List}
${top10List ? `\nVECTORS 6–10 (supporting profile):\n${top10List}` : ''}
${bottom5List ? `\nBOTTOM 5 VECTORS (weakest — these are genuine gaps, not strengths):\n${bottom5List}` : ''}

${langInstruction}

CRITICAL HONESTY RULE: The bottom 5 vectors listed above are real weak zones for this person — do NOT describe them as strengths anywhere in the analysis. If a bottom vector appears in the narrative, it must be framed as a gap, blind spot, or "you need a partner for this." The analysis loses all credibility when it praises someone for qualities their data says are their weakest. Smart readers will notice the contradiction. Be honest — it builds more trust than flattery.

Analyze this specific combination deeply. Be personal, concrete, and rich — avoid generic platitudes. Reference actual vector names throughout.

Respond ONLY with a valid JSON object (no markdown, no code fences):
{
  "essence": "A vivid, literary 3–4 sentence portrait of this person. Write it as if you've known them for years — describe WHAT they are, HOW their mind works, WHAT people feel around them, and what makes them unmistakably themselves. Reference specific vectors by name. Make it so accurate it gives them chills.",
  "dominantTheme": "A short evocative label for their overall character (e.g. 'The Trusted Architect', 'The Quiet Catalyst'). 3-5 words max.",
  "whereYouShine": {
    "summary": "3-4 rich sentences describing the environments and contexts where this combination of vectors fires on all cylinders. Be specific about WHY these vectors create advantage in these contexts.",
    "contexts": [
      "Context 1 — specific situation where this profile thrives",
      "Context 2",
      "Context 3",
      "Context 4",
      "Context 5",
      "Context 6"
    ]
  },
  "career": {
    "summary": "3–4 sentences painting the picture of where this person will feel most alive professionally. Reference their specific vectors. Explain WHY certain environments suit them and why others will drain them.",
    "roles": [
      { "title": "Specific job title or role archetype", "why": "2 sentences: exactly why this person's vector combination creates a natural fit for this role" },
      { "title": "Specific job title or role archetype", "why": "2 sentences" },
      { "title": "Specific job title or role archetype", "why": "2 sentences" },
      { "title": "Specific job title or role archetype", "why": "2 sentences" },
      { "title": "Specific job title or role archetype", "why": "2 sentences" }
    ],
    "environments": [
      "Environment type 1 where they thrive (e.g. 'Early-stage startups where structure is yet to be built')",
      "Environment type 2",
      "Environment type 3",
      "Environment type 4"
    ],
    "avoid": "2 sentences: the specific work environment or role type that will systematically drain and frustrate this profile — and why."
  },
  "business": {
    "whatYouBring": "3-4 concrete sentences about what this person brings to any team or business. Reference specific vectors and how they create measurable value.",
    "contributions": [
      { "vector": "Vector name", "insight": "2-sentence specific business insight for this vector in this combination" },
      { "vector": "Vector name", "insight": "2-sentence specific business insight" },
      { "vector": "Vector name", "insight": "2-sentence specific business insight" }
    ],
    "whoYouNeed": "2-3 sentences about what types of people complement this profile and why — reference specific vector gaps",
    "partners": [
      {
        "type": "Short evocative archetype label",
        "vectors": ["Vector1", "Vector2"],
        "why": "2 sentences explaining precisely why this person fills the gaps in this profile",
        "dynamic": "One concrete scenario showing how this duo operates together at work"
      },
      {
        "type": "Short evocative archetype label",
        "vectors": ["Vector1", "Vector2"],
        "why": "2 sentences",
        "dynamic": "One concrete scenario"
      }
    ]
  },
  "love": {
    "summary": "3-4 sentences about how this person loves — what they naturally give, what they need, and what the core pattern of their intimacy looks like",
    "dynamics": [
      {
        "vector": "Vector name",
        "strength": "2 sentences: how this vector shows up as a gift in intimate relationships",
        "shadow": "1-2 sentences: the shadow side or challenge this vector creates in love"
      },
      {
        "vector": "Vector name",
        "strength": "2 sentences",
        "shadow": "1-2 sentences"
      },
      {
        "vector": "Vector name",
        "strength": "2 sentences",
        "shadow": "1-2 sentences"
      }
    ],
    "partnerNeeds": "2 sentences about what kind of partner brings out the best in this profile"
  },
  "blindSpots": [
    "Specific blind spot 1 — how their top vectors create this particular gap or risk",
    "Specific blind spot 2",
    "Specific blind spot 3"
  ],
  "combinations": [
    {
      "type": "signature",
      "name": "A memorable label for this person's defining vector interaction",
      "vectors": ["Vector1", "Vector2", "Vector3"],
      "how": "2 sentences: exactly how these vectors amplify each other into something unique",
      "atBest": "One sharp sentence: what this looks like at peak performance",
      "risk": "One sharp sentence: the failure mode when these vectors misfire",
      "rarity": "1 in 50 people"
    },
    {
      "type": "hidden",
      "name": "A label for a surprising hidden power in the profile",
      "vectors": ["Vector1", "Vector2"],
      "how": "2 sentences: why this combination is more powerful than it appears",
      "atBest": "One sharp sentence",
      "risk": "One sharp sentence",
      "rarity": "1 in 100 people"
    },
    {
      "type": "tension",
      "name": "A label for two vectors that create productive tension",
      "vectors": ["Vector1", "Vector2"],
      "how": "2 sentences: how these vectors pull in opposite directions yet create something valuable",
      "atBest": "One sharp sentence",
      "risk": "One sharp sentence",
      "rarity": "1 in 30 people"
    },
    {
      "type": "sleeper",
      "name": "A label for a combination that is dormant but powerful when activated",
      "vectors": ["Vector1", "Vector2"],
      "how": "2 sentences: why this combination is underused and what unlocks it",
      "atBest": "One sharp sentence",
      "risk": "One sharp sentence",
      "rarity": "1 in 200 people"
    }
  ],
  "famousPeople": [
    {
      "name": "Full name of a real well-known person",
      "field": "Their profession / domain (2–4 words)",
      "whyMatch": "3 sentences: explain specifically which of this person's vectors show up in this famous person's work and life — be concrete, reference real things they did or said",
      "achievement": "One sentence: their most iconic specific achievement that reflects this vector profile"
    },
    {
      "name": "Full name of a real well-known person",
      "field": "Their profession / domain",
      "whyMatch": "3 sentences",
      "achievement": "One sentence"
    },
    {
      "name": "Full name of a real well-known person",
      "field": "Their profession / domain",
      "whyMatch": "3 sentences",
      "achievement": "One sentence"
    }
  ]
}

Rules:
- All text values must be in ${lang === 'ru' ? 'Russian' : lang === 'ky' ? 'Kyrgyz' : 'English'}
- Be specific — mention actual vector names from the profile throughout
- "essence" must be written like a masterful character study — literary, warm, precise. No generic phrases.
- "whereYouShine.contexts" must have exactly 6 items
- "career.roles" must have exactly 5 items — real specific roles that are COHERENT with each other and with this specific profile. All 5 roles must make sense together as a cluster (e.g. for an Influence-dominant profile: founder, strategist, advisor, keynote speaker, coach — NOT nursing or unrelated fields). Never mix radically different fields.
- "career.environments" must have exactly 4 items
- "business.contributions" must have exactly 3 items (use top 3 vectors)
- "love.dynamics" must have exactly 3 items (use top 3 vectors)
- "blindSpots" must have exactly 3 items
- "combinations" must have exactly 4 items with types: signature, hidden, tension, sleeper (in that order)
- "famousPeople" must have exactly 3 real well-known people. IMPORTANT: avoid the most obvious default picks (Steve Jobs, Elon Musk, Oprah Winfrey, Bill Gates, Jeff Bezos) — they appear in every AI-generated profile and feel generic. Instead pick unexpected but precise matches: people who are genuinely less obvious but whose work and character clearly reflect this specific vector combination. The surprise of recognition ("I wouldn't have thought of them but it's exactly right") is more valuable than a famous name.
- rarity values must be one of: "1 in 10 people", "1 in 30 people", "1 in 50 people", "1 in 100 people", "1 in 200 people"
- Every insight must feel personal and non-generic`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      system: 'You are a master Inner Vector coach. You give deeply personalized, rich analysis based on the 36-vector Inner Vector methodology. Always respond with valid JSON only — no markdown fences, no text before or after.',
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response type' }, { status: 500 })
    }

    const cleaned = content.text.trim()
      .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '')
    const analysis = JSON.parse(cleaned)

    // Save analysis to vector_test_results row
    if (result_id) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      )
      await supabase
        .from('vector_test_results')
        .update({ analysis })
        .eq('id', result_id)
    }

    return NextResponse.json(analysis)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Vector analyze error:', msg)
    return NextResponse.json({ error: 'Analysis failed', detail: msg }, { status: 500 })
  }
}
