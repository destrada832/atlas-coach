import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  const key = process.env.GOOGLE_TTS_KEY;
  if (!key) return NextResponse.json({ error: "No key" }, { status: 500 });

  // Google Cloud TTS — Neural2-F: warm, natural female voice
  const res = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: "en-US",
          name: "en-US-Neural2-F",
        },
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate: 0.95,
          pitch: 0.0,
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error("Google TTS error:", err);
    return NextResponse.json({ error: "TTS failed", detail: err }, { status: 500 });
  }

  const data = await res.json();

  if (!data.audioContent) {
    return NextResponse.json({ error: "No audio returned" }, { status: 500 });
  }

  const audioBuffer = Buffer.from(data.audioContent, "base64");

  return new NextResponse(audioBuffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": audioBuffer.byteLength.toString(),
    },
  });
}
