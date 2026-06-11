import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { message, history } = await req.json();

  const systemInstruction = `You are Atlas — a warm, direct life coach having a real conversation.

Rules:
- 2-3 short sentences max. Talk like a real person, not a bot.
- ALWAYS mention something specific from what they just said.
- NEVER say "tell me more about that" — that's lazy. Pick something specific and ask about THAT.
- One question only. Never two.
- If they share something painful, acknowledge it first.
- No jargon. No "I hear you." No "That's valid." Just be real.

Example: they say "I'm exhausted, the baby won't sleep and work is brutal" → you say "The baby plus a rough job — that's a lot to carry at once. How long has the no-sleep thing been going on?"

After 5-6 exchanges, start your response with exactly "PLAN_READY:" then summarize what you'll build.`;

  const contents = [
    ...history.map((m: {role: string; content: string}) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    { role: "user", parts: [{ text: message }] }
  ];

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: { maxOutputTokens: 150, temperature: 0.9 },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error("Gemini error:", res.status, err);
    return NextResponse.json({ reply: "Something went wrong on my end. Can you say that again?" }, { status: 500 });
  }

  const data = await res.json();
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!reply) {
    console.error("No reply from Gemini:", JSON.stringify(data));
    return NextResponse.json({ reply: "I missed that — can you say it again?" });
  }

  return NextResponse.json({ reply });
}
