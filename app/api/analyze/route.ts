import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { AnalysisResult } from '@/lib/types';
import { saveAnalysis } from '@/lib/supabase';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { strengths, lang = 'en' } = await req.json();

    if (!strengths || !Array.isArray(strengths) || strengths.length < 5 || strengths.length > 10) {
      return NextResponse.json({ error: '5 to 10 strengths required' }, { status: 400 });
    }

    const langInstruction =
      lang === 'ru'
        ? 'IMPORTANT: Respond ENTIRELY in Russian. Every single text value in the JSON must be written in Russian. Do not use any English words except for proper names of people and the dominantDomain field.'
        : 'Respond entirely in English.';

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
  ]
}

Rules:
- "dominantDomain" must be exactly one of: Executing, Influencing, Relationship Building, Strategic Thinking
- Return exactly 5 famous people and exactly 5 careers
- Famous people must be real, well-known figures (not obscure)
- Careers should span different industries/contexts
- Every insight must reference the actual strength names provided`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
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

    // Save to Supabase (fire-and-forget, don't block the response)
    saveAnalysis({
      username: 'mindvector',
      strengths,
      lang,
      analysis: cleaned,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('Analyze error:', err);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
