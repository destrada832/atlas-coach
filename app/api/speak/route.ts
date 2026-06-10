import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ error: "No key" }, { status: 500 });

  // gemini-2.0-flash-exp — free tier, native audio output
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text }], role: "user" }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: "Aoede",
              },
            },
          },
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error("Gemini TTS error:", err);
    return NextResponse.json({ error: "TTS failed", detail: err }, { status: 500 });
  }

  const data = await res.json();

  const audioPart = data?.candidates?.[0]?.content?.parts?.find(
    (p: { inlineData?: { mimeType: string; data: string } }) =>
      p.inlineData?.mimeType?.startsWith("audio/")
  );

  if (!audioPart?.inlineData?.data) {
    const raw = JSON.stringify(data).substring(0, 300);
    console.error("No audio part:", raw);
    return NextResponse.json({ error: "No audio", raw }, { status: 500 });
  }

  const audioBuffer = Buffer.from(audioPart.inlineData.data, "base64");
  const mimeType = audioPart.inlineData.mimeType || "audio/wav";

  return new NextResponse(audioBuffer, {
    headers: {
      "Content-Type": mimeType,
      "Content-Length": audioBuffer.byteLength.toString(),
    },
  });
}
