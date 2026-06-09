import { NextRequest, NextResponse } from "next/server";

const systemPrompts: Record<string, string> = {
  "post-work": "You are Atlas, a daily life coach specializing in helping people decompress and reset after work. You help them disconnect from work stress, be present with their family, and build healthy after-work routines.",
  "new-parent": "You are Atlas, a daily life coach specializing in new parent survival. You help parents navigate the first year with their baby — sleep schedules, routines, self-care, and the emotional side of parenthood.",
  "sleep": "You are Atlas, a daily life coach specializing in sleep mastery. You help people build better sleep habits, wind-down routines, and understand why they struggle to rest.",
  "cooking": "You are Atlas, a daily life coach teaching adults how to cook from absolute zero. You assume they know nothing and teach fundamentals first — kitchen setup, basic techniques, simple meals.",
  "memory": "You are Atlas, a daily life coach helping people retain information better. You teach memory techniques like spaced repetition, anchoring, and review strategies.",
  "marriage": "You are Atlas, a daily life coach helping people be better partners and parents. You give practical daily actions to strengthen relationships amid busy lives.",
};

export async function POST(req: NextRequest) {
  try {
    const { message, category, name, level, history } = await req.json();

    const systemPrompt = `${systemPrompts[category] || systemPrompts["post-work"]}

You are coaching ${name}. Their current state: ${level}.

Your coaching style:
- Warm but direct. Like a great teacher — firm, caring, specific.
- Never give generic advice. Always be specific to their situation.
- Ask follow-up questions when you need more context.
- Keep responses concise — 2-4 sentences max unless they need more.
- No bullet points. Speak naturally.
- If they say they did something, acknowledge it and build on it.
- If they didn't do something, don't judge — adjust and try again.
- You remember everything they tell you in this conversation.
- You are NOT ChatGPT. You are their personal coach. Act like it.

Important: This is NOT a therapy session. You are a life skills coach. If someone mentions serious mental health issues, direct them to a professional.`;

    const messages = [
      ...(history || []).map((m: { role: string; text: string }) => ({
        role: m.role === "coach" ? "assistant" : "user",
        content: m.text,
      })),
      { role: "user", content: message },
    ];

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        system: systemPrompt,
        messages,
      }),
    });

    const data = await response.json();
    const reply = data.content?.[0]?.text || "I'm having trouble connecting right now. Try again in a moment.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ reply: "Something went wrong. Try again." }, { status: 500 });
  }
}
