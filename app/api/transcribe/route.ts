import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ error: "No key" }, { status: 500 });

  const formData = await req.formData();
  const audioFile = formData.get("audio") as Blob;
  if (!audioFile) return NextResponse.json({ error: "No audio" }, { status: 400 });

  const arrayBuffer = await audioFile.arrayBuffer();
  const base64Audio = Buffer.from(arrayBuffer).toString("base64");
  const mimeType = audioFile.type || "audio/webm";

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "Transcribe exactly what is spoken in this audio. Return only the spoken words, nothing else. No timestamps, no labels, no explanation." },
            { inlineData: { mimeType, data: base64Audio } }
          ]
        }]
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: "Transcription failed", detail: err }, { status: 500 });
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
  return NextResponse.json({ text });
}
