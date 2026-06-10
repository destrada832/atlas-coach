import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    const systemInstruction = `You are Atlas, a personal life coach conducting an intake interview with a new user.

Your job right now is NOT to give advice — it is to deeply understand this person's life through conversation.

Rules:
- Ask ONE follow-up question at a time based on what they just said
- Dig deeper into what they shared — do not jump to a new topic
- Be warm, direct, and human. Sound like a real coach, not a bot
- Keep responses SHORT — 1-3 sentences maximum
- After 5-6 meaningful exchanges, say EXACTLY this at the start: "PLAN_READY:" followed by a brief acknowledgment
- Never give generic advice during the interview — just listen and ask
- No bullet points. Natural conversation only.`;

    // Convert history to Gemini format (role: user | model)
    const contents = history.map((m: {role: string; content: string}) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
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
          generationConfig: { maxOutputTokens: 200, temperature: 0.8 },
        }),
      }
    );

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Tell me more about that.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ reply: "Tell me more about that." }, { status: 500 });
  }
}
