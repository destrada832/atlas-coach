import { NextRequest, NextResponse } from "next/server";

const categoryPrompts: Record<string, string> = {
  "post-work": "You are coaching someone on how to reset and decompress after work. Help them disconnect from work stress and be present at home.",
  "new-parent": "You are coaching a new parent through the early months of parenthood. Give practical, specific daily guidance.",
  "sleep": "You are coaching someone who struggles with sleep. Give them a specific sleep hygiene task to work on today.",
  "cooking": "You are coaching a complete beginner learning to cook for the first time. Start from absolute zero.",
  "memory": "You are coaching someone who wants to retain information better and stop forgetting things.",
  "marriage": "You are coaching someone who wants to be a better partner and keep their relationship strong despite a busy life.",
};

const levelContext: Record<string, string> = {
  "overwhelmed": "This person is overwhelmed and needs very small, achievable tasks — one thing only.",
  "stuck": "This person knows what to do but can't start. Give them a very concrete first step.",
  "building": "This person has some momentum. Give them a slightly more challenging task.",
  "optimizing": "This person is doing well. Push them a little further today.",
};

export async function POST(req: NextRequest) {
  try {
    const { category, name, level, day } = await req.json();

    const categoryContext = categoryPrompts[category] || categoryPrompts["post-work"];
    const levelCtx = levelContext[level] || levelContext["overwhelmed"];

    const prompt = `${categoryContext}

Context: ${levelCtx}

This is Day ${day} of coaching for ${name}.

Generate ONE specific coaching task for today. Requirements:
- It must be something they can do TODAY, within the next few hours
- It must be very specific and actionable — not vague advice
- It should take 5-30 minutes maximum
- End with a brief note that you'll check in tonight
- Write in second person, warm but direct tone
- Maximum 3 sentences
- Do NOT use bullet points or lists
- Make it feel like it comes from a real coach who knows them

Return only the task text. No preamble, no "Day 1:", nothing else.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 200,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const task = data.content?.[0]?.text || "";

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Daily task error:", error);
    return NextResponse.json({ task: "" }, { status: 500 });
  }
}
