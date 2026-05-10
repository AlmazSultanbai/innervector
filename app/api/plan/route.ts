import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { PlanResult } from '@/lib/types';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { strengths, lang = 'en', full_name = '' } = await req.json();
    if (!strengths || !Array.isArray(strengths) || strengths.length < 5) {
      return NextResponse.json({ error: '5+ strengths required' }, { status: 400 });
    }

    const langInstruction = lang === 'ru'
      ? 'IMPORTANT: Respond ENTIRELY in Russian. Every text value must be in Russian except unlockKey (keep as 2-word English SCREAMING_SNAKE_CASE). CRITICAL: Every time you mention a CliftonStrengths theme name, write it as: EnglishName (Русский перевод) — e.g. "Self-Assurance (Самоуверенность)", "Futuristic (Визионерство)", "Strategic (Стратегическое мышление)", "Ideation (Генерация идей)", "Learner (Обучаемость)", "Individualization (Индивидуализация)", "Competition (Соперничество)", "Focus (Концентрация)", "Achiever (Достижение)", "Activator (Активатор)", "Analytical (Аналитика)", "Empathy (Эмпатия)", "Maximizer (Максимизатор)", "Relator (Близость)", "Responsibility (Ответственность)", "Developer (Развитие людей)", "Connectedness (Связанность)", "Communication (Коммуникация)", "Positivity (Позитивность)", "Arranger (Организованность)", "Belief (Убеждения)", "Command (Командование)", "Consistency (Последовательность)", "Context (Контекст)", "Deliberative (Осторожность)", "Discipline (Дисциплина)", "Harmony (Гармония)", "Includer (Инклюзивность)", "Input (Сбор информации)", "Intellection (Интеллект)", "Restorative (Восстановление)", "Significance (Значимость)", "Woo (Завоевание симпатии)", "Adaptability (Адаптивность)".'
      : lang === 'ky'
      ? 'IMPORTANT: Respond ENTIRELY in Kyrgyz. Every text value must be in Kyrgyz except unlockKey (keep as 2-word English SCREAMING_SNAKE_CASE). CRITICAL: Every time you mention a CliftonStrengths theme name, write it as: EnglishName (Кыргызча котормо) — e.g. "Self-Assurance (Өз-өзүнө ишенүү)", "Futuristic (Болочокту көрүү)", "Strategic (Стратегиялык ой жүгүртүү)", "Ideation (Идея жаратуу)", "Learner (Үйрөнүүгө умтулуу)", "Individualization (Жекелештирүү)", "Competition (Атаандашуу)", "Focus (Топтолуу)", "Achiever (Жетишкендик)".'
      : 'Respond entirely in English.';

    const rankedList = strengths.map((s: string, i: number) => `  ${i + 1}. ${s}`).join('\n');

    const prompt = `You are a world-class Gallup CliftonStrengths coach designing a personalized 30-day activation program.

The user's CliftonStrengths profile (ranked strongest to weakest):
${rankedList}
${full_name ? `\nUser's name: ${full_name}` : ''}

${langInstruction}

Design exactly 15 progressive tasks spread over 30 days (each task covers ~2 days):
- Tasks 1–4: Awareness phase (category: "awareness") — understand your talents deeply
- Tasks 5–8: Practice phase (category: "practice") — apply them in small daily ways
- Tasks 9–12: Challenge phase (category: "challenge") — push beyond comfort zones
- Tasks 13–15: Mastery phase (category: "mastery") — integrate and lead others

MANDATORY — every task must fall into one of these 3 human connection themes. Distribute them naturally across the 15 tasks (roughly 5 tasks per theme):

🤝 THEME A — Meeting & Networking: tasks that involve reaching out to NEW people, strangers, colleagues, or acquaintances. Examples: start a conversation with someone new, attend an event, reach out to a professional you admire, introduce yourself in a new context. Make these specific to how the user's strengths make them naturally good at connecting.

❤️ THEME B — Family & Close Bonds: tasks that deepen relationships with family members, close friends, or loved ones. Examples: have a meaningful conversation with a parent/sibling/partner, share something vulnerable, plan quality time together, express appreciation. Tie these to how the user's strengths enrich close relationships.

✨ THEME C — Strength Expression: tasks where the user visibly demonstrates their strengths to others — at work, socially, or in their community. Examples: lead a discussion using their top strength, teach someone a skill, share an insight, take initiative in a group, mentor someone. Show concretely how their strength profile shines in action.

For unlockKey: unique 2-word SCREAMING_SNAKE_CASE phrase e.g. "CURIOUS_BUILDER", "DEEP_FOCUS", "HUMAN_SPARK" — feel like a meaningful reward, relate to the task's human connection theme.

Respond ONLY with valid JSON:
{
  "programTitle": "Personalized title referencing their top strength",
  "programDescription": "2 sentences on what this 30-day journey transforms — mention human connection and strength expression",
  "tasks": [
    {
      "id": 1,
      "dayRange": "Day 1–2",
      "title": "Specific title referencing their strength and who they will connect with",
      "description": "2-3 sentences why this task matters for THIS profile and who it involves",
      "action": "One concrete specific action — name exactly WHO to approach, WHAT to say or do, HOW LONG it takes, WHERE if relevant",
      "strengthsUsed": ["Strength1", "Strength2"],
      "reflection": "One powerful question about what this connection revealed about their strengths",
      "unlockKey": "WORD_WORD",
      "duration": "45 min",
      "category": "awareness"
    }
  ]
}

Rules:
- Exactly 15 tasks, dayRange "Day 1–2" through "Day 29–30"
- All unlockKeys unique, 2 words, SCREAMING_SNAKE_CASE
- strengthsUsed: real names from user's profile, 1–3 per task
- Every task must involve real human interaction (not solo journaling only)
- Actions must name a real type of person to interact with (colleague, family member, friend, stranger, mentor, etc.)
- DURATION: every task must be between 30 minutes and 2 hours. Use realistic values like "30 min", "45 min", "1 hour", "1.5 hours", "2 hours". Never less than 30 min, never more than 2 hours.
- Make it feel like a genuine transformation journey through human connection`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      system: 'You are a Gallup-certified CliftonStrengths Master Coach. Design deeply personalized 30-day programs. Always respond with valid JSON only — no markdown fences.',
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== 'text') return NextResponse.json({ error: 'Unexpected response type' }, { status: 500 });

    const cleaned = content.text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
    const result: PlanResult = JSON.parse(cleaned);
    return NextResponse.json(result);
  } catch (err) {
    console.error('Plan error:', err);
    return NextResponse.json({ error: 'Plan generation failed' }, { status: 500 });
  }
}
