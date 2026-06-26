import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { STRENGTH_NAMES } from '@/lib/strengths';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const client = new Anthropic();

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a PDF or image (PNG, JPG, WebP).' },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10 MB.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    const validStrengths = STRENGTH_NAMES.join(', ');

    const extractPrompt = `This is a Gallup CliftonStrengths (StrengthsFinder) assessment report.

TASK: Extract the following from this document:
1. The full name of the person this report belongs to
2. The TOP 10 CliftonStrengths themes, strictly in rank order from #1 (strongest) to #10
3. The BOTTOM 5 (lesser) themes — ranks #30 to #34 — ONLY if this is a full "CliftonStrengths 34" report that clearly lists all 34 in order. If only a top-5/top-10 report is shown, leave bottom empty.

WHERE TO LOOK FOR THE NAME:
- Top of the page / header area (most common — "Name: John Smith" or just "John Smith")
- Title block, e.g. "John Smith's CliftonStrengths" or "Report for John Smith"
- Any greeting like "Hello, John" or "Dear John Smith"
- Watermark or footer with person's name
- Any text that looks like a personal name (two capitalised words, e.g. "Anna Petrova")
- The name may be in any language (English, Russian, Kyrgyz, etc.)
- Look carefully — even a single first name is better than nothing

The 34 valid CliftonStrengths theme names are:
${validStrengths}

Rules:
- Return EXACTLY the first 10 in ranked order (#1 through #10)
- If the report shows fewer than 10 (e.g. only top 5), return however many are visible, preserving their rank order
- Use EXACT spelling from the list above (e.g. "Self-Assurance" not "Self Assurance")
- Do NOT invent, guess, or add any themes not clearly visible in the document
- The order matters — rank #1 must be first in the array
- For "full_name": search the ENTIRE document thoroughly. Return the name exactly as written. Only return "" if absolutely no name is visible anywhere.

Respond ONLY with a valid JSON object, no markdown fences:
{
  "full_name": "First Last",
  "strengths": ["Rank1Strength", "Rank2Strength", ..., "Rank10Strength"],
  "lesserStrengths": ["Rank30", "Rank31", "Rank32", "Rank33", "Rank34"],
  "count": <number of strengths found>
}
- "lesserStrengths": only fill if all 34 are visible in rank order; otherwise return []. Never invent bottom themes.`;

    let messageContent: Anthropic.MessageParam['content'];
    const isPdf = file.type === 'application/pdf';

    if (isPdf) {
      messageContent = [
        {
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: base64 },
        } as Anthropic.DocumentBlockParam,
        { type: 'text', text: extractPrompt },
      ];
    } else {
      const imageMediaType = file.type as 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif';
      messageContent = [
        {
          type: 'image',
          source: { type: 'base64', media_type: imageMediaType, data: base64 },
        } as Anthropic.ImageBlockParam,
        { type: 'text', text: extractPrompt },
      ];
    }

    const model = 'claude-sonnet-4-6';
    const systemPrompt = 'You are a precise document parser. Extract CliftonStrengths theme names from Gallup reports in strict rank order. Respond with valid JSON only — no markdown, no explanation.';

    const message = isPdf
      ? await client.beta.messages.create({
          betas: ['pdfs-2024-09-25'],
          model,
          max_tokens: 512,
          system: systemPrompt,
          messages: [{ role: 'user', content: messageContent as Anthropic.Beta.BetaContentBlockParam[] }],
        })
      : await client.messages.create({
          model,
          max_tokens: 512,
          system: systemPrompt,
          messages: [{ role: 'user', content: messageContent }],
        });

    const content = message.content[0];
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response from AI' }, { status: 500 });
    }

    const cleaned = content.text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
    const parsed = JSON.parse(cleaned);
    const extracted: string[] = parsed.strengths ?? [];
    const fullName: string = parsed.full_name ?? '';
    const extractedLesser: string[] = parsed.lesserStrengths ?? [];

    // Validate — keep only recognised names, preserve order
    const valid = extracted.filter((s) => STRENGTH_NAMES.includes(s));
    // Lesser themes: valid, not overlapping with top, max 5
    const lesserValid = extractedLesser
      .filter((s) => STRENGTH_NAMES.includes(s) && !valid.includes(s))
      .slice(0, 5);

    if (valid.length < 5) {
      return NextResponse.json(
        { error: `Only found ${valid.length} recognisable strength(s). Please upload a clearer Gallup report image or PDF.` },
        { status: 422 }
      );
    }

    // Upload original file to Supabase Storage
    let gallup_file_url: string | null = null;
    try {
      const ext = file.type === 'application/pdf' ? 'pdf'
        : file.type === 'image/png' ? 'png'
        : file.type === 'image/webp' ? 'webp'
        : 'jpg';
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const fileBuffer = Buffer.from(bytes);

      const supabaseAdmin = getSupabaseAdmin();
      const { error: uploadError } = await supabaseAdmin.storage
        .from('gallup-reports')
        .upload(fileName, fileBuffer, {
          contentType: file.type,
          upsert: false,
        });

      if (!uploadError) {
        const { data: urlData } = supabaseAdmin.storage
          .from('gallup-reports')
          .getPublicUrl(fileName);
        gallup_file_url = urlData.publicUrl;
      } else {
        console.error('Storage upload error:', uploadError.message);
      }
    } catch (storageErr) {
      console.error('Storage error (non-fatal):', storageErr);
    }

    // Always return up to 10, in the ranked order extracted (+ bottom 5 if a full-34 report)
    return NextResponse.json({ strengths: valid.slice(0, 10), lesserStrengths: lesserValid, full_name: fullName, gallup_file_url });
  } catch (err) {
    const e = err as Record<string, unknown>;
    console.error('EXT_STATUS:', e?.status);
    const errBody = e?.error as Record<string, unknown> | undefined;
    console.error('EXT_TYPE:', errBody?.type);
    console.error('EXT_MSG:', errBody?.message);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'Failed to read the file. Please try again.', detail: String(errBody?.message ?? msg) }, { status: 500 });
  }
}
