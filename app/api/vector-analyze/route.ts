import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 300;

const client = new Anthropic();

// English names for the 34 talents
const VECTOR_EN: Record<string, string> = {
  // РЕАЛИЗАЦИЯ / Execution
  'Достиженец': 'Achiever', 'Организатор': 'Arranger', 'Убеждения': 'Belief',
  'Последовательность': 'Consistency', 'Осторожность': 'Deliberative', 'Дисциплина': 'Discipline',
  'Фокус': 'Focus', 'Ответственность': 'Responsibility', 'Решатель': 'Restorative',
  // ВЛИЯНИЕ / Influence
  'Катализатор': 'Activator', 'Командность': 'Command', 'Коммуникация': 'Communication',
  'Соперничество': 'Competition', 'Максимизатор': 'Maximizer', 'Уверенность': 'Self-Assurance',
  'Значимость': 'Significance', 'Обаяние': 'Woo',
  // ОТНОШЕНИЯ / Relationship Building
  'Гибкость': 'Adaptability', 'Взаимосвязь': 'Connectedness', 'Развитие': 'Developer',
  'Эмпатия': 'Empathy', 'Гармония': 'Harmony', 'Принятие': 'Includer',
  'Индивидуальность': 'Individualization', 'Позитивность': 'Positivity', 'Близость': 'Relator',
  // МЫШЛЕНИЕ / Strategic Thinking
  'Аналитик': 'Analytical', 'Контекст': 'Context', 'Будущее': 'Futuristic',
  'Генератор': 'Ideation', 'Накопитель': 'Input', 'Размышление': 'Intellection',
  'Ученик': 'Learner', 'Стратег': 'Strategic',
}

const DOMAIN_EN: Record<string, string> = {
  'vliyanie': 'Influence', 'realizacia': 'Execution',
  'otnosenia': 'Relationships', 'myshlenie': 'Thinking',
}

export async function POST(req: NextRequest) {
  try {
    const { top5, top10, bottom5, lang = 'ru', full_name = '', result_id } = await req.json();

    if (!top5 || !Array.isArray(top5) || top5.length < 5) {
      return NextResponse.json({ error: '5 vectors required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    // Analysis already generated for this result (page refresh, duplicate
    // request, race between report and profile pages) — return it instead of
    // paying for a second generation.
    if (result_id) {
      const { data: existing } = await supabase
        .from('vector_test_results')
        .select('analysis')
        .eq('id', result_id)
        .maybeSingle()
      if (existing?.analysis) {
        return NextResponse.json(existing.analysis)
      }
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

    const prompt = `You are a master Inner Vector coach. Inner Vector is a talent-based personality model with 4 domains — Influence (8 talents), Execution (9 talents), Relationships (9 talents), Strategic Thinking (8 talents) — 34 talents total. The model is inspired by the CliftonStrengths structure but uses original Russian talent names.

${full_name ? `Person's name: ${full_name}` : ''}
Language: ${lang}

TOP 5 DOMINANT TALENTS (most defining, in order):
${top5List}
${top10List ? `\nTALENTS 6–10 (supporting):\n${top10List}` : ''}
${bottom5List ? `\nWEAKEST TALENTS (genuine gaps, NOT strengths):\n${bottom5List}` : ''}

${langInstruction}

CRITICAL HONESTY & CONSISTENCY RULES (the #1 priority — violating these destroys trust):
1. The BOTTOM 5 talents are real weak zones. They may appear ONLY in "blindSpots" and in "business.whoYouNeed"/"partners" (as gaps a partner fills). They must NEVER appear as a strength, a contribution, a sleeper, a hidden power, or in essence/career/love/whereYouShine.
2. Every POSITIVE section — essence, dominantTheme, whereYouShine, career, business.contributions, love.dynamics, and ALL combinations (signature/hidden/tension/sleeper) — may reference ONLY talents from the TOP 10. Never frame a low/weak talent as something the person is good at.
3. NO INTERNAL CONTRADICTIONS: do not call the same talent both a strength and a weakness. Do not say a person "brings X to completion / is reliable / follows through" if completion-type talents are NOT in their top 10. If their execution/follow-through talents are weak, say so honestly.
4. Before finalizing, mentally check: does any praise in the text contradict the talent data? If yes, rewrite it honestly. Accuracy beats flattery every time.

Analyze this specific combination deeply. Be personal, concrete, and rich — avoid generic platitudes. Reference actual talent names throughout.

Respond ONLY with a valid JSON object (no markdown, no code fences):
{
  "essence": "A vivid, literary 3–4 sentence portrait of this person. Write it as if you've known them for years — describe WHAT they are, HOW their mind works, WHAT people feel around them, and what makes them unmistakably themselves. Reference specific talent names. Make it so accurate it gives them chills.",
  "dominantTheme": "A short evocative label for their overall character (e.g. 'The Trusted Architect', 'The Quiet Catalyst'). 3-5 words max.",
  "whereYouShine": {
    "summary": "3-4 rich sentences describing the environments and contexts where this combination of talents fires on all cylinders. Be specific about WHY these talents create advantage in these contexts.",
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
    "summary": "3–4 sentences painting the picture of where this person will feel most alive professionally. Reference their specific talents. Explain WHY certain environments suit them and why others will drain them.",
    "roles": [
      { "title": "Specific job title or role archetype", "why": "2 sentences: exactly why this person's talent combination creates a natural fit for this role" },
      { "title": "Specific job title or role archetype", "why": "2 sentences" },
      { "title": "Specific job title or role archetype", "why": "2 sentences" },
      { "title": "Specific job title or role archetype", "why": "2 sentences" },
      { "title": "Specific job title or role archetype", "why": "2 sentences" }
    ],
    "environments": [
      "Environment type 1 where they thrive",
      "Environment type 2",
      "Environment type 3",
      "Environment type 4"
    ],
    "avoid": "2 sentences: the specific work environment or role type that will systematically drain and frustrate this profile — and why."
  },
  "business": {
    "whatYouBring": "3-4 concrete sentences about what this person brings to any team or business. Reference specific talents and how they create measurable value.",
    "contributions": [
      { "vector": "Talent name", "insight": "2-sentence specific business insight for this talent in this combination" },
      { "vector": "Talent name", "insight": "2-sentence specific business insight" },
      { "vector": "Talent name", "insight": "2-sentence specific business insight" }
    ],
    "whoYouNeed": "2-3 sentences about what types of people complement this profile and why — reference specific talent gaps",
    "partners": [
      {
        "type": "Short evocative archetype label",
        "vectors": ["Talent1", "Talent2"],
        "why": "2 sentences explaining precisely why this person fills the gaps in this profile",
        "dynamic": "One concrete scenario showing how this duo operates together at work"
      },
      {
        "type": "Short evocative archetype label",
        "vectors": ["Talent1", "Talent2"],
        "why": "2 sentences",
        "dynamic": "One concrete scenario"
      }
    ]
  },
  "love": {
    "summary": "3-4 sentences about how this person loves — what they naturally give, what they need, and what the core pattern of their intimacy looks like",
    "dynamics": [
      {
        "vector": "Talent name",
        "strength": "2 sentences: how this talent shows up as a gift in intimate relationships",
        "shadow": "1-2 sentences: the shadow side or challenge this talent creates in love"
      },
      {
        "vector": "Talent name",
        "strength": "2 sentences",
        "shadow": "1-2 sentences"
      },
      {
        "vector": "Talent name",
        "strength": "2 sentences",
        "shadow": "1-2 sentences"
      }
    ],
    "partnerNeeds": "2 sentences about what kind of partner brings out the best in this profile"
  },
  "blindSpots": [
    "Specific blind spot 1 — how their top talents create this particular gap or risk",
    "Specific blind spot 2",
    "Specific blind spot 3"
  ],
  "combinations": [
    {
      "type": "signature",
      "name": "A memorable label for this person's defining talent interaction",
      "vectors": ["Talent1", "Talent2", "Talent3"],
      "how": "2 sentences: exactly how these talents amplify each other into something unique",
      "atBest": "One sharp sentence: what this looks like at peak performance",
      "risk": "One sharp sentence: the failure mode when these talents misfire",
      "intensity": "Short qualitative label — one of: \"Ярко выражено\", \"Заметно\", \"Тонко\" (or EN: \"Strong\", \"Moderate\", \"Subtle\")"
    },
    {
      "type": "hidden",
      "name": "A label for a surprising hidden power in the profile",
      "vectors": ["Talent1", "Talent2"],
      "how": "2 sentences: why two of their TOP-10 talents combine into something more powerful than either alone. Both MUST be from the top 10.",
      "atBest": "One sharp sentence",
      "risk": "One sharp sentence",
      "intensity": "qualitative: Ярко выражено / Заметно / Тонко"
    },
    {
      "type": "tension",
      "name": "A label for two talents that create productive tension",
      "vectors": ["Talent1", "Talent2"],
      "how": "2 sentences: how two of their TOP-10 talents pull in opposite directions yet create something valuable. Both MUST be from the top 10.",
      "atBest": "One sharp sentence",
      "risk": "One sharp sentence",
      "intensity": "qualitative: Ярко выражено / Заметно / Тонко"
    },
    {
      "type": "sleeper",
      "name": "A label for a top-10 talent overshadowed by the top 5",
      "vectors": ["Talent1", "Talent2"],
      "how": "2 sentences: pick talents ranked roughly 6–10 and explain what unlocks them. NEVER use a bottom-ranked talent here.",
      "atBest": "One sharp sentence",
      "risk": "One sharp sentence",
      "intensity": "qualitative: Ярко выражено / Заметно / Тонко"
    }
  ],
  "famousPeople": [
    {
      "name": "Full name of a real well-known person",
      "field": "Their profession / domain (2–4 words)",
      "whyMatch": "3 sentences: explain specifically which of this person's talents show up in this famous person's work and life — be concrete",
      "achievement": "One sentence: their most iconic specific achievement that reflects this talent profile"
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
- Be specific — mention actual talent names from the profile throughout
- "essence" must be written like a masterful character study — literary, warm, precise. No generic phrases.
- "whereYouShine.contexts" must have exactly 6 items
- "career.roles" must have exactly 5 items — real specific roles coherent with this profile. Never mix radically different fields.
- "career.environments" must have exactly 4 items
- "business.contributions" must have exactly 3 items (use top 3 talents)
- "love.dynamics" must have exactly 3 items (use top 3 talents)
- "blindSpots" must have exactly 3 items
- "combinations" must have exactly 4 items with types: signature, hidden, tension, sleeper (in that order)
- "famousPeople" must have exactly 3 real well-known people. Avoid the most obvious picks (Steve Jobs, Elon Musk, Oprah Winfrey, Bill Gates, Jeff Bezos) — pick unexpected but precise matches.
- "intensity" must be a qualitative label only. NEVER invent population statistics — fabricated stats destroy credibility.
- "career.roles": frame every role as a DIRECTION TO EXPLORE, not a prescription.
- Every insight must feel personal and non-generic`

    const message = await client.messages.create({
      model: 'claude-sonnet-5',
      // Sonnet 5 runs adaptive thinking by default; thinking tokens count
      // toward max_tokens, so leave headroom above the ~6K JSON payload.
      max_tokens: 16000,
      system: 'You are a master Inner Vector coach. You give deeply personalized, rich analysis based on the Inner Vector model: 4 talent domains (Influence, Execution, Relationships, Thinking) with 34 talents total. Always respond with valid JSON only — no markdown fences, no text before or after.',
      messages: [{ role: 'user', content: prompt }],
    })

    // Adaptive thinking may prepend a thinking block — take the text block
    const content = message.content.find(b => b.type === 'text')
    if (!content || content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response type' }, { status: 500 })
    }

    const cleaned = content.text.trim()
      .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '')
    let analysis
    try {
      analysis = JSON.parse(cleaned)
    } catch {
      // Model occasionally wraps JSON in prose — extract the outermost object
      const start = cleaned.indexOf('{')
      const end = cleaned.lastIndexOf('}')
      if (start === -1 || end <= start) throw new Error('No JSON object in model response')
      analysis = JSON.parse(cleaned.slice(start, end + 1))
    }

    // Save analysis to vector_test_results row
    if (result_id) {
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
