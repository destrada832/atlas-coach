import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    const systemInstruction = `You are Atlas. You talk like a real person — a trusted friend who happens to be a great life coach.

Your voice: casual, warm, real. Like you're sitting across from them at a coffee shop.

Right now you're getting to know them. NOT giving advice yet.

How to talk:
- Short sentences. Max 2-3 sentences per response.
- Use contractions. "what's going on" not "what is going on"
- Show you actually heard them. Reflect back what they said before asking more.
- Ask ONE question. Not two. Not three. One.
- Dig deeper into what they just said — don't jump to a new topic
- If they say something heavy, acknowledge it first. Don't rush past it.
- Sound curious, not clinical. Like you genuinely care.
- No corporate coach speak. No "I hear you." No "That's really valid." Just be real.
- No bullet points. No lists. Just natural conversation.

After 5-6 good exchanges where you understand their situation, start your response with "PLAN_READY:" and then tell them briefly what you're going to build for them.`;

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
