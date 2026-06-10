import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json();

    const systemInstruction = `You are Atlas, a personal life coach. Based on an intake interview transcript, generate a personalized coaching plan.

Return ONLY valid JSON — no markdown, no backticks, no explanation. Just the raw JSON object.

JSON format:
{
  "name": "their first name or empty string",
  "category": "post-work | new-parent | sleep | cooking | memory | marriage | general",
  "title": "short personalized plan title (8 words max)",
  "summary": "2-3 sentences written directly to them. Warm, direct, personal. Use you and your.",
  "focus": ["focus area 1", "focus area 2", "focus area 3"],
  "day1": "Very first instruction. One specific thing to do TODAY. Concrete, takes 5-30 minutes. Second person.",
  "spotifyId": "playlist ID: post-work=37i9dQZF1DX3rxVfibe1L0, sleep=37i9dQZF1DWZd79rJ6a7lp, cooking=37i9dQZF1DXaXB8fQg7xRL, memory=37i9dQZF1DWZeKCadgRdKQ, marriage=37i9dQZF1DXbvABJXBIyiY, new-parent=37i9dQZF1DX0UrRvztWcAU, general=37i9dQZF1DX3rxVfibe1L0",
  "spotifyName": "playlist name"
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [{
            role: "user",
            parts: [{ text: `Interview transcript:\n\n${transcript}\n\nGenerate the personalized coaching plan as JSON.` }],
          }],
          generationConfig: { maxOutputTokens: 800, temperature: 0.4 },
        }),
      }
    );

    const data = await response.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    let plan;
    try {
      const cleaned = raw.replace(/```json|```/g, "").trim();
      plan = JSON.parse(cleaned);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      plan = match ? JSON.parse(match[0]) : {};
    }

    return NextResponse.json({ plan });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ plan: {} }, { status: 500 });
  }
}
