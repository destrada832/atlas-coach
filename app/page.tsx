"use client";
import { useState } from "react";

const categories = [
  {
    icon: "🌇",
    title: "Post-Work Reset",
    desc: "Come home. Decompress. Be present.",
    tag: "Available now",
  },
  {
    icon: "👶",
    title: "New Parent Survival",
    desc: "Daily guidance for the first year.",
    tag: "Coming soon",
  },
  {
    icon: "💑",
    title: "Marriage & Family",
    desc: "Keep your relationship alive while life is full.",
    tag: "Coming soon",
  },
  {
    icon: "😴",
    title: "Sleep Mastery",
    desc: "A coach that walks you to sleep.",
    tag: "Coming soon",
  },
  {
    icon: "🍳",
    title: "Cooking From Zero",
    desc: "Learn to cook like nobody's watching.",
    tag: "Coming soon",
  },
  {
    icon: "🧠",
    title: "Memory Training",
    desc: "Stop letting things pass by on your phone.",
    tag: "Coming soon",
  },
];

const comparisons = [
  { thing: "YouTube", problem: "10,000 videos. No starting point. No follow-up." },
  { thing: "ChatGPT", problem: "Answers your question. Then forgets you exist." },
  { thing: "Headspace", problem: "Meditation only. Not your actual life." },
  { thing: "Google", problem: "Same overwhelm. Different interface." },
  { thing: "Human coach", problem: "$150/hour. Most people can't afford that." },
];

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-[#0D0D0F] text-[#F5F5FA]">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-[#1E1E24] bg-[#0D0D0F]/90 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-[#E8A34A] text-xl">◈</span>
          <span className="font-display text-lg tracking-wide">Atlas</span>
        </div>
        <a
          href="/onboarding"
          className="bg-[#E8A34A] text-[#0D0D0F] text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#C4862C] transition-colors"
        >
          Start free →
        </a>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-6 pt-20">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#E8A34A]/5 blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#1E1E24] border border-[#2A2A33] rounded-full px-4 py-1.5 text-xs text-[#E8A34A] mb-8 animate-fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E8A34A] animate-pulse" />
            Daily coaching. Real follow-up. Not a chatbot.
          </div>

          <h1 className="font-display text-5xl md:text-7xl leading-tight mb-6 animate-fade-up-delay-1">
            The coach nobody{" "}
            <br />
            <span className="text-[#E8A34A]">ever gave you.</span>
          </h1>

          <p className="text-[#9B9BAA] text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed animate-fade-up-delay-2">
            Atlas shows up every day. Gives you clear instruction. Checks if you did it.
            Then adjusts tomorrow based on what actually happened. Like a teacher — not a search engine.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto animate-fade-up-delay-3">
            {!submitted ? (
              <>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  required
                  className="flex-1 bg-[#1E1E24] border border-[#2A2A33] rounded-full px-5 py-3 text-sm text-[#F5F5FA] placeholder-[#6B6B7B] focus:outline-none focus:border-[#E8A34A] transition-colors"
                />
                <button
                  type="submit"
                  className="bg-[#E8A34A] text-[#0D0D0F] font-semibold px-6 py-3 rounded-full hover:bg-[#C4862C] transition-colors whitespace-nowrap"
                >
                  Get early access
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 text-[#E8A34A] font-medium">
                <span>✓</span>
                <span>You&apos;re on the list. We&apos;ll reach out soon.</span>
              </div>
            )}
          </form>

          <p className="text-[#6B6B7B] text-xs mt-4 animate-fade-up-delay-4">
            Free to start · $14.99/month after · Cancel anytime
          </p>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#2A2A33]">
          <span className="text-xs">scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-[#2A2A33] to-transparent" />
        </div>
      </section>

      {/* The Problem */}
      <section className="px-6 py-24 max-w-4xl mx-auto">
        <p className="text-[#6B6B7B] text-xs uppercase tracking-widest mb-6">The problem</p>
        <h2 className="font-display text-3xl md:text-4xl mb-12 leading-snug">
          You ask. You get an answer. <br />
          <span className="text-[#6B6B7B]">Then nothing. No follow-up. No teacher.</span>
        </h2>

        <div className="space-y-3">
          {comparisons.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-4 rounded-xl bg-[#141417] border border-[#1E1E24]"
            >
              <div className="w-24 shrink-0 text-sm font-medium text-[#F5F5FA]">{item.thing}</div>
              <div className="text-sm text-[#6B6B7B]">{item.problem}</div>
            </div>
          ))}

          {/* Atlas row */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-[rgba(232,163,74,0.08)] border border-[#E8A34A]/30 mt-6">
            <div className="w-24 shrink-0 text-sm font-medium text-[#E8A34A]">◈ Atlas</div>
            <div className="text-sm text-[#F5F5FA]">
              Shows up every morning. Gives you one clear task. Checks in at night. Adjusts tomorrow. Every day.
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-24 bg-[#141417]">
        <div className="max-w-4xl mx-auto">
          <p className="text-[#6B6B7B] text-xs uppercase tracking-widest mb-6">How it works</p>
          <h2 className="font-display text-3xl md:text-4xl mb-16 leading-snug">
            Three moments. Every day.
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                time: "Morning",
                emoji: "☀️",
                title: "Your daily instruction",
                desc: "Atlas knows your situation. It gives you one specific thing to do today. Not a list. One thing.",
                example: '"You came home exhausted yesterday. Today: 15-minute reset before you open your phone. Here\'s exactly how."',
              },
              {
                time: "Evening",
                emoji: "🌙",
                title: "Did you do it?",
                desc: "Atlas checks in. You tell it what happened. No judgment — just data for tomorrow.",
                example: '"Did you do the reset? What got in the way? Tell me in one sentence."',
              },
              {
                time: "Tomorrow",
                emoji: "📈",
                title: "It adjusts",
                desc: "Based on what you told it, Atlas changes your next instruction. It learns you. It doesn't repeat what didn't work.",
                example: '"You said noise was the issue. Tomorrow\'s reset uses headphones. Try this instead."',
              },
            ].map((step, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[#0D0D0F] border border-[#2A2A33]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl">{step.emoji}</span>
                  <span className="text-xs text-[#6B6B7B] bg-[#1E1E24] px-3 py-1 rounded-full">{step.time}</span>
                </div>
                <h3 className="font-display text-lg mb-2 text-[#F5F5FA]">{step.title}</h3>
                <p className="text-sm text-[#6B6B7B] mb-4 leading-relaxed">{step.desc}</p>
                <div className="p-3 rounded-lg bg-[#1E1E24] border border-[#2A2A33]">
                  <p className="text-xs text-[#9B9BAA] italic leading-relaxed">{step.example}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-6 py-24 max-w-4xl mx-auto">
        <p className="text-[#6B6B7B] text-xs uppercase tracking-widest mb-6">What Atlas coaches</p>
        <h2 className="font-display text-3xl md:text-4xl mb-4 leading-snug">
          One subscription.<br />Every area of life.
        </h2>
        <p className="text-[#6B6B7B] text-sm mb-12">
          Start with one category. Add others as you grow. All under one coach.
        </p>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <div
              key={i}
              className={`p-5 rounded-2xl border transition-all ${
                i === 0
                  ? "bg-[rgba(232,163,74,0.08)] border-[#E8A34A]/40 cursor-pointer hover:border-[#E8A34A]"
                  : "bg-[#141417] border-[#1E1E24] opacity-60"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{cat.icon}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  i === 0
                    ? "bg-[#E8A34A]/20 text-[#E8A34A]"
                    : "bg-[#1E1E24] text-[#6B6B7B]"
                }`}>
                  {cat.tag}
                </span>
              </div>
              <h3 className="font-medium text-sm text-[#F5F5FA] mb-1">{cat.title}</h3>
              <p className="text-xs text-[#6B6B7B]">{cat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-24 bg-[#141417]">
        <div className="max-w-md mx-auto text-center">
          <p className="text-[#6B6B7B] text-xs uppercase tracking-widest mb-6">Pricing</p>
          <div className="p-8 rounded-3xl bg-[#0D0D0F] border border-[#2A2A33]">
            <div className="w-12 h-12 rounded-full bg-[rgba(232,163,74,0.12)] flex items-center justify-center mx-auto mb-6">
              <span className="text-[#E8A34A] text-xl">◈</span>
            </div>
            <div className="font-display text-6xl mb-1">$14.99</div>
            <div className="text-[#6B6B7B] text-sm mb-8">per month · cancel anytime</div>
            <ul className="text-sm text-[#9B9BAA] space-y-3 text-left mb-8">
              {[
                "Daily personalized coaching",
                "Morning instruction + evening check-in",
                "AI remembers and adjusts every day",
                "All coaching categories included",
                "Calendar and reminder integration",
                "Available on phone, tablet, desktop",
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="text-[#E8A34A]">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="/onboarding"
              className="block w-full bg-[#E8A34A] text-[#0D0D0F] font-semibold py-3.5 rounded-full hover:bg-[#C4862C] transition-colors text-center"
            >
              Start free today →
            </a>
            <p className="text-xs text-[#6B6B7B] mt-4">
              First 7 days free. No credit card required to start.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-32 text-center max-w-2xl mx-auto">
        <h2 className="font-display text-4xl md:text-5xl mb-6 leading-tight">
          You didn&apos;t get here by accident. <br />
          <span className="text-[#E8A34A]">Keep going.</span>
        </h2>
        <p className="text-[#6B6B7B] mb-10">
          Atlas is your daily guide. Not a chatbot. Not a YouTube channel. <br />A coach that shows up, every single day.
        </p>
        <a
          href="/onboarding"
          className="inline-flex items-center gap-2 bg-[#E8A34A] text-[#0D0D0F] font-semibold px-8 py-4 rounded-full hover:bg-[#C4862C] transition-colors text-lg"
        >
          Start your first day →
        </a>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-[#1E1E24] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[#E8A34A]">◈</span>
          <span className="text-sm text-[#6B6B7B]">Atlas · Your daily coach</span>
        </div>
        <p className="text-xs text-[#2A2A33]">© 2026 Atlas</p>
      </footer>

    </main>
  );
}
