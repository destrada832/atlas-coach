import { NextRequest, NextResponse } from "next/server";

const categoryContext: Record<string, string> = {
  "post-work": "You specialize in helping people decompress after work, disconnect from job stress, and be present at home.",
  "new-parent": "You specialize in new parent survival — baby schedules, sleep, self-care, and the emotional side of early parenthood.",
  "sleep": "You specialize in sleep mastery — wind-down routines, sleep hygiene, and understanding what keeps people awake.",
  "cooking": "You specialize in teaching adults to cook from absolute zero. You start with kitchen setup and basic techniques.",
  "memory": "You specialize in memory training — spaced repetition, anchoring, and daily retention habits.",
  "marriage": "You specialize in helping people be better partners and parents despite busy lives.",
  "general": "You are a daily life coach helping people build better habits and routines.",
};

export async function POST(req: NextRequest) {
  try {
    const { message, category, name, history } = await req.json();

    const ctx = categoryContext[category] || categoryContext["general"];

    const systemInstruction = `You are Atlas, a personal daily life coach. ${ctx}

You are coaching ${name || "this person"}.

Coaching style:
- Warm but direct. Like a great teacher — firm, caring, specific.
- Never give generic advice. Always specific to what they tell you.
- Keep responses concise — 2-4 sentences unless they need more.
- No bullet points. Speak naturally.
- If they say they did something, acknowledge it and build on it.
- If they didn't, don't judge — adjust and try again.
- You remember everything they tell you in this conversation.
- You are their coach, not a chatbot.
- This is NOT therapy. If mental health issues arise, direct them to a professional.`;

    const contents = (history || []).map((m: {role: string; text: string}) => ({
      role: m.role === "coach" ? "model" : "user",
      parts: [{ text: m.text }],
    }));
    contents.push({ role: "user", parts: [{ text: message }] });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents,
          generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
        }),
      }
    );

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Let me think about that. Tell me more.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ reply: "Something went wrong. Try again." }, { status: 500 });
  }
}
