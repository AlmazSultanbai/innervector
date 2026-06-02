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
      ? 'IMPORTANT: Respond ENTIRELY in Russian. Every text value must be in Russian except unlockKey (keep as 2-word English SCREAMING_SNAKE_CASE). CRITICAL: Every time you mention a CliftonStrengths theme name, write it as: EnglishName (Русский перевод) — e.g. "Self-Assurance (Уверенность)", "Futuristic (Будущее)", "Strategic (Стратегия)", "Ideation (Генератор идей)", "Learner (Ученик)", "Individualization (Индивидуализация)", "Competition (Конкуренция)", "Focus (Сосредоточенность)", "Achiever (Достижение)", "Activator (Катализатор)", "Analytical (Аналитик)", "Empathy (Эмпатия)", "Maximizer (Максимизатор)", "Relator (Отношения)", "Responsibility (Ответственность)", "Developer (Развитие)", "Connectedness (Взаимосвязанность)", "Communication (Коммуникация)", "Positivity (Позитивность)", "Arranger (Организатор)", "Belief (Убеждение)", "Command (Распорядитель)", "Consistency (Последовательность)", "Context (Контекст)", "Deliberative (Осторожность)", "Discipline (Дисциплинированность)", "Harmony (Гармония)", "Includer (Включенность)", "Input (Вклад)", "Intellection (Мышление)", "Restorative (Восстановление)", "Significance (Значимость)", "Woo (Обаяние)", "Adaptability (Приспособляемость)".'
      : lang === 'ky'
      ? 'IMPORTANT: Respond ENTIRELY in Kyrgyz. Every text value must be in Kyrgyz except unlockKey (keep as 2-word English SCREAMING_SNAKE_CASE). CRITICAL: Every time you mention a CliftonStrengths theme name, write it as: EnglishName (Кыргызча котормо) — e.g. "Self-Assurance (Өз-өзүнө ишенүү)", "Futuristic (Болочокту көрүү)", "Strategic (Стратегиялык ой жүгүртүү)", "Ideation (Идея жаратуу)", "Learner (Үйрөнүүгө умтулуу)", "Individualization (Жекелештирүү)", "Competition (Атаандашуу)", "Focus (Топтолуу)", "Achiever (Жетишкендик)".'
      : 'Respond entirely in English.';

    const rankedList = strengths.map((s: string, i: number) => `  ${i + 1}. ${s}`).join('\n');

    const prompt = `You are a master transformation coach and storyteller. You design 30-day journeys that feel like novels — each task is a scene in the user's arc of becoming. Your writing is vivid, personal, and moves people to act. You never write generic advice. Every line references this specific person's strengths and the real human situation they are entering.

The user's CliftonStrengths profile (ranked strongest to weakest):
${rankedList}
${full_name ? `\nUser's name: ${full_name}` : ''}

${langInstruction}

Design exactly 15 progressive tasks spread over 30 days (each task covers ~2 days):
- Tasks 1–4: Awareness phase (category: "awareness") — reveal the talent to themselves through a human encounter
- Tasks 5–8: Practice phase (category: "practice") — put the talent to work in a real relationship
- Tasks 9–12: Challenge phase (category: "challenge") — stretch where their strength meets resistance
- Tasks 13–15: Mastery phase (category: "mastery") — lead others by example and leave a mark

MANDATORY — every task must fall into one of these 3 human connection themes. Distribute them naturally across the 15 tasks (roughly 5 tasks per theme):

🤝 THEME A — Meeting & Networking: reaching out to NEW people — strangers, potential allies, admired professionals. Show HOW their strengths make them magnetic in new encounters.

❤️ THEME B — Family & Close Bonds: deepening the nearest relationships — parents, partners, siblings, closest friends. Show how their strengths transform intimacy.

✨ THEME C — Strength Expression: visibly demonstrating strength to others — at work, socially, in community. Show the talent in action in front of people.

For unlockKey: a unique 2-word SCREAMING_SNAKE_CASE phrase that feels like a reward and echoes the task's spirit — e.g. "HUMAN_SPARK", "DEEP_MIRROR", "QUIET_FIRE".

NARRATIVE WRITING RULES — these are non-negotiable:

hook: One arresting opening sentence written like the first line of a short story. Drop the reader into a scene or a truth. No "In this task you will..." — instead: "There is a person in your life who has been waiting years to hear what you truly think of them." or "The room goes quiet when you walk in — you've never noticed, but everyone else has." Specific to their strengths. Unexpected. Compelling.

description: 3 sentences. Write as "you", present tense where possible. Sentence 1: paint the human situation — who is there, what is the unspoken tension or opportunity. Sentence 2: name the exact strength(s) that fire here and WHY this moment is their natural arena. Sentence 3: what shifts inside them — or in the other person — when they show up fully. Make the reader feel something.

action: Write it like a scene direction, not a checklist item. Name the type of person, the setting, the exact words or gesture. "This week, sit across from your [mother / team lead / colleague you've been meaning to thank] and say: 'I want to tell you something I've never said out loud…'" — vivid, specific, and slightly uncomfortable in the best way. One action only. No bullet points.

reflection: One question that cuts below the surface. Not "What did you learn?" — but something that only makes sense given their specific combination of strengths. A question a great mentor would ask at 11pm after a long conversation. Something they won't be able to stop thinking about.

Respond ONLY with valid JSON:
{
  "programTitle": "A poetic title that captures the arc of the 30-day journey",
  "programDescription": "2 sentences — first: the transformation at stake. Second: what kind of person they become by Day 30.",
  "tasks": [
    {
      "id": 1,
      "dayRange": "Day 1–2",
      "title": "Evocative title — strength + human encounter, reads like a chapter heading",
      "hook": "One arresting narrative sentence that drops the reader into a scene or a truth",
      "description": "3 sentences in second person — human situation, which strength fires and why, what shifts",
      "action": "One vivid scene direction — who, where, exactly what to say or do",
      "strengthsUsed": ["Strength1", "Strength2"],
      "reflection": "One deep unexpected question specific to their strength combination",
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
- Every task must involve real human interaction (not solo reflection only)
- DURATION: 30 min–2 hours. Values: "30 min", "45 min", "1 hour", "1.5 hours", "2 hours"
- Never write generic coaching language. Every sentence must feel written for THIS person's exact profile
- The journey should read like a story arc — early tasks feel like discovery, middle like tension, late like earned authority`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      system: 'You are a master transformation coach and storyteller. You write like a novelist who happens to know CliftonStrengths deeply. Every task you design feels personal, vivid, and impossible to ignore. You never write generic advice. Always respond with valid JSON only — no markdown fences, no extra text.',
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
