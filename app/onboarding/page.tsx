"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type Msg = { role: "atlas" | "user"; content: string };

export default function Onboarding() {
  const router = useRouter();
  const [mode, setMode] = useState<"choose" | "voice" | "text">("choose");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [atlasSpeaking, setAtlasSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("Tap the mic and speak freely");
  const [phase, setPhase] = useState<"interview" | "generating" | "done">("interview");
  const [exchangeCount, setExchangeCount] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recRef = useRef<any>(null);
  const msgsEndRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<{role: string; content: string}[]>([]);

  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const openingMsg = "Hey — glad you're here. Before I put anything together for you, I just want to actually hear what's going on. Not a form, not checkboxes. Just tell me — what's been weighing on you lately?";

  function startMode(m: "voice" | "text") {
    setMode(m);
    if (m === "voice") initRecognition();
    setTimeout(() => {
      atlasSpeak(openingMsg, m);
    }, 600);
  }

  function initRecognition() { /* no-op */ }

  async function startListening() {
    if (atlasSpeaking) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: BlobPart[] = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const recorder = new MediaRecorder(stream, { mimeType });
      (window as any)._atlasRecorder = recorder;

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        setListening(false);
        setStatus("Transcribing...");
        const blob = new Blob(chunks, { type: mimeType });
        if (blob.size < 1000) { setStatus("Tap the mic and speak freely"); return; }
        try {
          const fd = new FormData();
          fd.append("audio", blob, "recording.webm");
          const res = await fetch("/api/transcribe", { method: "POST", body: fd });
          const data = await res.json();
          const text = (data.text || "").trim();
          if (text) { setTranscript(text); handleUser(text); }
          else setStatus("Couldn't hear that — try again");
        } catch { setStatus("Transcription failed — try again"); }
      };

      recorder.start(250);
      setListening(true);
      setStatus("Listening… speak freely");
      setTranscript("");

      // Web Audio API — detect silence, auto-send after 2s
      const audioCtx = new AudioContext();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      audioCtx.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);

      let silenceStart = 0;
      let secs = 0;
      let hasSpeech = false;
      const SILENCE_MS = 2000;
      const THRESHOLD = 12; // volume 0-255

      (window as any)._atlasAudioCtx = audioCtx;

      function tick() {
        if ((window as any)._atlasRecorder?.state !== "recording") return;
        analyser.getByteFrequencyData(data);
        const vol = data.reduce((a: number, b: number) => a + b, 0) / data.length;
        const now = Date.now();

        if (vol > THRESHOLD) {
          // Speaking
          hasSpeech = true;
          silenceStart = 0;
          secs = Math.round((now - (window as any)._atlasStart) / 1000);
          const m = Math.floor(secs / 60), s = String(secs % 60).padStart(2, "0");
          setStatus(`Recording ${m}:${s} — pause to send`);
        } else if (hasSpeech) {
          // Silence after speaking
          if (!silenceStart) silenceStart = now;
          const silent = now - silenceStart;
          const countdown = Math.ceil((SILENCE_MS - silent) / 1000);
          if (silent >= SILENCE_MS) {
            audioCtx.close();
            stopAndSend();
            return;
          }
          setStatus(countdown <= 1 ? "Sending…" : `Sending in ${countdown}s`);
        }
        requestAnimationFrame(tick);
      }

      (window as any)._atlasStart = Date.now();
      requestAnimationFrame(tick);

    } catch { setStatus("Microphone access denied"); }
  }

  function stopAndSend() {
    try { (window as any)._atlasAudioCtx?.close(); } catch { /* ok */ }
    const recorder = (window as any)._atlasRecorder as MediaRecorder;
    if (recorder && recorder.state === "recording") recorder.stop();
  }

  function toggleMic() {
    if (atlasSpeaking) return;
    if (listening) {
      stopAndSend();
    } else {
      startListening();
    }
  }

  async function atlasSpeak(text: string, currentMode?: string) {
    const m = currentMode || mode;
    addMsg("atlas", text);
    historyRef.current.push({ role: "assistant", content: text });

    if (m === "voice") {
      setAtlasSpeaking(true);
      setStatus("Atlas is speaking...");
      try {
        const res = await fetch("/api/speak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (!res.ok) throw new Error("speak failed");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.onended = () => {
          URL.revokeObjectURL(url);
          setAtlasSpeaking(false);
          setStatus("Tap the mic and speak freely");
        };
        audio.onerror = () => {
          setAtlasSpeaking(false);
          setStatus("Tap the mic and speak freely");
        };
        await audio.play();
      } catch {
        setAtlasSpeaking(false);
        setStatus("Tap the mic and speak freely");
      }
    }
  }

  function addMsg(role: "atlas" | "user", content: string) {
    setMsgs(prev => [...prev, { role, content }]);
  }

  async function handleUser(text: string) {
    if (!text.trim() || loading) return;
    addMsg("user", text);
    historyRef.current.push({ role: "user", content: text });
    setTranscript("");
    setInput("");
    setLoading(true);
    setStatus("Atlas is thinking...");

    const newCount = exchangeCount + 1;
    setExchangeCount(newCount);

    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historyRef.current.slice(0, -1),
        }),
      });
      const { reply } = await res.json();

      if (reply.startsWith("PLAN_READY:") || newCount >= 6) {
        const cleanReply = reply.replace("PLAN_READY:", "").trim();
        if (cleanReply) atlasSpeak(cleanReply || "I have everything I need. Building your plan now...");
        else atlasSpeak("I have heard enough. Let me build your personalized plan now.");
        setTimeout(() => generatePlan(), 2500);
      } else {
        atlasSpeak(reply);
      }
    } catch {
      atlasSpeak("Tell me more about that.");
    }
    setLoading(false);
    setStatus("Tap the mic and speak freely");
  }

  async function generatePlan() {
    setPhase("generating");
    const transcript = historyRef.current
      .map(m => `${m.role === "user" ? "User" : "Atlas"}: ${m.content}`)
      .join("\n");

    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      const { plan } = await res.json();
      localStorage.setItem("atlas_plan", JSON.stringify(plan));
      localStorage.setItem("atlas_transcript", transcript);
    } catch {
      localStorage.setItem("atlas_plan", JSON.stringify({ category: "post-work", name: "" }));
    }

    setPhase("done");
    setTimeout(() => router.push("/dashboard"), 800);
  }

  function sendText() {
    if (!input.trim() || loading) return;
    handleUser(input.trim());
  }

  // ─── CHOOSE SCREEN ───
  if (mode === "choose") {
    return (
      <div style={{ minHeight: "100vh", background: "#fff", display: "flex", flexDirection: "column" }}>
        {/* Green top bar */}
        <div style={{ background: "#1E5C40", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: "#D95F2B", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia,serif", fontSize: 15, color: "#fff", fontWeight: 900 }}>A</div>
            <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>Atlas</span>
          </div>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>Your daily life coach</span>
        </div>

        {/* Hero */}
        <div style={{ padding: "48px 28px 32px", maxWidth: 480, margin: "0 auto", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#2A7A56", marginBottom: 20 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#D95F2B" }} />
            Start your coaching today
          </div>
          <h1 style={{ fontFamily: "Georgia,serif", fontSize: "clamp(34px,8vw,48px)", fontWeight: 900, lineHeight: 1.1, color: "#1A1714", marginBottom: 16, letterSpacing: "-0.02em" }}>
            The coach who shows up<br />
            for you <em style={{ fontStyle: "italic", color: "#1E5C40" }}>every day.</em>
          </h1>
          <p style={{ fontSize: 16, color: "#6B6560", lineHeight: 1.75, marginBottom: 36, fontWeight: 300, maxWidth: 360 }}>
            Tell Atlas what&apos;s going on. It listens, asks the right questions, and builds a plan around your actual life — not a template.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
            <button onClick={() => startMode("voice")} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: "#1E5C40", color: "#fff", border: "none", borderRadius: 14, padding: "17px 24px", fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "system-ui,sans-serif", boxShadow: "0 4px 16px rgba(30,92,64,0.20)", width: "100%" }}>
              🎙&nbsp;&nbsp;Speak to Atlas
            </button>
            <button onClick={() => startMode("text")} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#F8F6F2", color: "#6B6560", border: "1.5px solid #E8E2DA", borderRadius: 14, padding: "15px 24px", fontSize: 15, cursor: "pointer", fontFamily: "system-ui,sans-serif", width: "100%" }}>
              ✏️&nbsp;&nbsp;I prefer to type
            </button>
          </div>
        </div>

        {/* Features */}
        <div style={{ padding: "0 28px", maxWidth: 480, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
          {[
            { icon: "🎙", title: "Real interview, not a form", desc: "Atlas asks follow-up questions based on what you actually say." },
            { icon: "📅", title: "One task, every morning", desc: "Clear and specific. Not a list. One thing you can actually do today." },
            { icon: "🌙", title: "Atlas checks in every night", desc: "Did you do it? Tomorrow adjusts based on your honest answer." },
          ].map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#FDF3EE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 16 }}>{f.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1714", marginBottom: 2 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: "#6B6560", lineHeight: 1.5, fontWeight: 300 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Proof */}
        <div style={{ padding: "0 28px 0", maxWidth: 480, margin: "0 auto", width: "100%" }}>
          <div style={{ background: "#EEF6F1", border: "1px solid rgba(30,92,64,0.12)", borderRadius: 16, padding: 20 }}>
            <div style={{ fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: 14, color: "#1A1714", lineHeight: 1.7, marginBottom: 12 }}>
              &ldquo;I didn&apos;t expect it to actually listen. It asked me a follow-up I wasn&apos;t ready for. That&apos;s when I knew this was different.&rdquo;
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "#D95F2B", fontSize: 13, letterSpacing: 1 }}>★★★★★</span>
              <span style={{ fontSize: 12, color: "#6B6560", fontWeight: 500 }}>Marco R. &nbsp;·&nbsp; Day 23 &nbsp;·&nbsp; Post-Work Reset</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "auto", background: "#F8F6F2", borderTop: "1px solid #E8E2DA", padding: "16px 28px", textAlign: "center", fontSize: 12, color: "#A09890", lineHeight: 1.65 }}>
          7-day free trial &nbsp;·&nbsp; $14.99/month &nbsp;·&nbsp; Cancel anytime<br />
          Works on iPhone, Android, and browser
        </div>
      </div>
    );
  }

  // ─── GENERATING SCREEN ───
  if (phase === "generating" || phase === "done") {
    return (
      <div style={{ minHeight: "100vh", background: "#1E5C40", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: "#D95F2B", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia,serif", fontSize: 30, color: "#fff", fontWeight: 900, marginBottom: 28, animation: "pulse 2s infinite" }}>A</div>
        <p style={{ fontFamily: "Georgia,serif", fontSize: 24, color: "#fff", fontWeight: 700, marginBottom: 12 }}>Building your plan...</p>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, maxWidth: 280 }}>Atlas is personalizing everything based on what you shared.</p>
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.7}}`}</style>
      </div>
    );
  }

  // ─── INTERVIEW SCREEN ───
  return (
    <div style={{ minHeight: "100vh", background: "#18171A", display: "flex", flexDirection: "column" }}>
      {/* Bar */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 12, background: "#211F24", flexShrink: 0 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: "#1E5C40", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia,serif", fontSize: 16, color: "#fff", fontWeight: 900, flexShrink: 0 }}>A</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#F0EDE8" }}>Atlas</div>
          <div style={{ fontSize: 12, color: "#7A7680" }}>{loading ? "Thinking..." : "Your coach · Listening"}</div>
        </div>
        {/* Mode toggle */}
        <div style={{ display: "flex", background: "#2C2A30", borderRadius: 8, padding: 3 }}>
          {(["voice", "text"] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); if (m === "voice") initRecognition(); }} style={{ padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontFamily: "system-ui,sans-serif", transition: "all 0.2s", background: mode === m ? "#1E5C40" : "transparent", color: mode === m ? "#fff" : "#7A7680", fontWeight: mode === m ? 600 : 400 }}>
              {m === "voice" ? "🎙 Voice" : "✏️ Text"}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "22px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        {msgs.map((msg, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-end", flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
            {msg.role === "atlas" && (
              <div style={{ width: 28, height: 28, borderRadius: 7, background: "#1E5C40", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia,serif", fontSize: 12, color: "#fff", fontWeight: 900, flexShrink: 0 }}>A</div>
            )}
            <div style={{ maxWidth: "83%", padding: "13px 17px", borderRadius: 18, fontSize: 15, lineHeight: 1.68, ...(msg.role === "atlas" ? { background: "#2C2A30", border: "1px solid rgba(255,255,255,0.07)", color: "#F0EDE8", borderBottomLeftRadius: 4, fontFamily: "Georgia,serif", fontStyle: "italic" } : { background: "#D95F2B", color: "#fff", borderBottomRightRadius: 4, fontFamily: "system-ui,sans-serif", fontSize: 14, fontStyle: "normal", fontWeight: 500 }) }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: "#1E5C40", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia,serif", fontSize: 12, color: "#fff", fontWeight: 900 }}>A</div>
            <div style={{ background: "#2C2A30", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, borderBottomLeftRadius: 4, padding: "14px 17px", display: "flex", gap: 5 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#7A7680", animation: `bounce 1.2s ${i * 0.15}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={msgsEndRef} />
      </div>

      {/* Input area */}
      <div style={{ flexShrink: 0, padding: "18px 20px 28px", borderTop: "1px solid rgba(255,255,255,0.07)", background: "#211F24" }}>

        {/* Voice UI */}
        {mode === "voice" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 13, color: "#7A7680", textAlign: "center" }}>{status}</div>
            <div style={{ fontSize: 14, color: "#F0EDE8", fontFamily: "Georgia,serif", fontStyle: "italic", minHeight: 20, textAlign: "center", maxWidth: 280, lineHeight: 1.5, opacity: 0.8 }}>{transcript}</div>
            <button onClick={toggleMic} style={{ width: 64, height: 64, borderRadius: "50%", background: listening ? "#C0392B" : atlasSpeaking ? "#2C2A30" : "#1E5C40", border: atlasSpeaking ? "2px solid #1E5C40" : "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: atlasSpeaking ? "not-allowed" : "pointer", fontSize: 24, transition: "all 0.2s", boxShadow: listening ? "0 0 0 0 rgba(192,57,43,0.5)" : "0 4px 18px rgba(30,92,64,0.30)", animation: listening ? "micRing 1s infinite" : "none" }}>
              {atlasSpeaking ? "🔊" : listening ? "🎙" : "🎙"}
            </button>
            {listening ? (
              <button onClick={stopAndSend} style={{ background: "transparent", color: "#9A8C7A", border: "1px solid rgba(154,140,122,0.3)", borderRadius: 24, padding: "8px 20px", fontSize: 13, cursor: "pointer" }}>
                Send now
              </button>
            ) : (
              <div style={{ fontSize: 11, color: "rgba(122,118,128,0.55)", letterSpacing: "0.04em" }}>Tap mic · speak · tap Done when finished</div>
            )}
          </div>
        )}

        {/* Text UI */}
        {mode === "text" && (
          <div style={{ display: "flex", gap: 10 }}>
            <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendText(); } }} placeholder="Type freely here..." rows={2} style={{ flex: 1, background: "#2C2A30", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "12px 15px", fontSize: 15, color: "#F0EDE8", fontFamily: "system-ui,sans-serif", outline: "none", resize: "none", lineHeight: 1.5 }} />
            <button onClick={sendText} disabled={loading || !input.trim()} style={{ width: 44, height: 44, background: "#1E5C40", border: "none", borderRadius: 12, cursor: "pointer", fontSize: 16, color: "#fff", flexShrink: 0, alignSelf: "flex-end", fontWeight: 700, opacity: loading || !input.trim() ? 0.4 : 1 }}>↑</button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce {
          0%,80%,100% { transform: scale(0.6); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes micRing {
          0% { box-shadow: 0 0 0 0 rgba(192,57,43,0.5); }
          70% { box-shadow: 0 0 0 14px rgba(192,57,43,0); }
          100% { box-shadow: 0 0 0 0 rgba(192,57,43,0); }
        }
      `}</style>
    </div>
  );
}
