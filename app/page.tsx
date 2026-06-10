"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div style={{ fontFamily: "'Playfair Display', Georgia, serif", minHeight: "100vh", background: "#F6F0E4" }}>
      {/* Nav */}
      <nav style={{ background: "#1E5C40", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <span style={{ color: "#fff", fontWeight: 800, fontSize: 22, letterSpacing: "-0.5px" }}>Atlas</span>
        <button onClick={() => router.push("/onboarding")} style={{ background: "#D95F2B", color: "#fff", border: "none", borderRadius: 24, padding: "8px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          Start free →
        </button>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "80px 24px 60px", textAlign: "center" }}>
        <p style={{ color: "#D95F2B", fontWeight: 700, fontSize: 13, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 16 }}>
          • Daily coaching. Real follow-up. Not a chatbot.
        </p>
        <h1 style={{ fontSize: "clamp(42px, 8vw, 68px)", fontWeight: 900, lineHeight: 1.08, color: "#1A1208", margin: "0 0 8px" }}>
          The coach nobody
        </h1>
        <h1 style={{ fontSize: "clamp(42px, 8vw, 68px)", fontWeight: 900, lineHeight: 1.08, color: "#1E5C40", fontStyle: "italic", margin: "0 0 28px" }}>
          ever gave you.
        </h1>
        <p style={{ color: "#4A4030", fontSize: 18, lineHeight: 1.7, marginBottom: 48, maxWidth: 520, margin: "0 auto 48px" }}>
          Atlas shows up every day. Gives you clear instruction. Checks if you did it.
          Then adjusts based on what actually happened — like a teacher, not a search engine.
        </p>
        <button onClick={() => router.push("/onboarding")} style={{ background: "#1E5C40", color: "#fff", border: "none", borderRadius: 32, padding: "18px 48px", fontSize: 18, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 10 }}>
          🎤 Speak to Atlas
        </button>
        <p style={{ color: "#9A8C7A", fontSize: 13, marginTop: 16 }}>Free to start · $14.99/month after · Cancel anytime</p>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px 80px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24 }}>
        {[
          { icon: "🎤", title: "Real interview", desc: "Atlas asks follow-up questions based on what you actually say — not a dropdown form." },
          { icon: "📋", title: "Your plan", desc: "Day 1 instruction built around your actual life, not a generic template." },
          { icon: "✅", title: "Daily check-in", desc: "Did you do it? Atlas adjusts tomorrow based on the truth, not what you planned." },
        ].map((f, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 16, padding: 28, border: "1px solid #E8DFD0" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
            <h3 style={{ color: "#1A1208", fontSize: 17, fontWeight: 800, marginBottom: 8 }}>{f.title}</h3>
            <p style={{ color: "#6B5F52", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ background: "#1E5C40", padding: "60px 24px", textAlign: "center" }}>
        <h2 style={{ color: "#fff", fontSize: 36, fontWeight: 900, marginBottom: 24 }}>Ready to start?</h2>
        <button onClick={() => router.push("/onboarding")} style={{ background: "#D95F2B", color: "#fff", border: "none", borderRadius: 32, padding: "18px 48px", fontSize: 18, fontWeight: 700, cursor: "pointer" }}>
          Talk to Atlas now →
        </button>
      </div>
    </div>
  );
}
