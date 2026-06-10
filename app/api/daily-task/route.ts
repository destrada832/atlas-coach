import { NextRequest, NextResponse } from "next/server";

const categoryContext: Record<string, string> = {
  "post-work": "helping someone decompress after work and be present at home",
  "new-parent": "coaching a new parent through the early months of parenthood",
  "sleep": "coaching someone who struggles to wind down and sleep",
  "cooking": "teaching a complete beginner to cook, starting from absolute zero",
  "memory": "coaching someone who wants to retain information and stop forgetting things",
  "marriage": "coaching someone to be a better partner and stay present with family",
  "general": "daily life coaching for someone building better habits",
};

const levelContext: Record<string, string> = {
  "overwhelmed": "This person is overwhelmed. Give a very small, achievable single task.",
  "stuck": "This person knows what to do but cannot start. Give a very concrete first step.",
  "building": "This person has some momentum. Give a slightly more challenging task.",
  "optimizing": "This person is doing well. Push them a little further today.",
};

export async function POST(req: NextRequest) {
  try {
    const { category, name, level, day } = await req.json();

    const ctx = categoryContext[category] || categoryContext["general"];
    const lvl = levelContext[level] || levelContext["building"];

    const systemInstruction = `You are Atlas, a daily life coach focused on ${ctx}.

${lvl}

Generate ONE specific coaching task for Day ${day} for ${name || "this person"}.

Requirements:
- Something they can do TODAY in the next few hours
- Very specific and actionable — not vague advice
- Takes 5-30 minutes maximum
- End with a brief note that you will check in tonight
- Warm but direct tone, second person
- Maximum 3 sentences, no bullet points
- Make it feel personal, not generic

Return only the task text. Nothing else.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: "user", parts: [{ text: "Generate today's coaching task." }] }],
          generationConfig: { maxOutputTokens: 150, temperature: 0.9 },
        }),
      }
    );

    const data = await response.json();
    const task = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return NextResponse.json({ task });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ task: "" }, { status: 500 });
  }
}
