"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const steps = [
  {
    id: "category",
    question: "What's your biggest challenge right now?",
    subtitle: "We'll start your daily coaching here. You can add more later.",
    type: "cards",
    options: [
      { value: "post-work", emoji: "🌇", label: "Coming home exhausted", desc: "I don't know how to reset after work" },
      { value: "new-parent", emoji: "👶", label: "New parent survival", desc: "I need daily guidance with my baby" },
      { value: "sleep", emoji: "😴", label: "I can't sleep well", desc: "I need someone to coach me to rest" },
      { value: "cooking", emoji: "🍳", label: "Learning to cook", desc: "Nobody ever taught me the basics" },
      { value: "memory", emoji: "🧠", label: "I forget everything", desc: "Things pass by and I can't retain them" },
      { value: "marriage", emoji: "💑", label: "Family & relationship", desc: "Work is affecting my family life" },
    ],
  },
  {
    id: "level",
    question: "How would you describe yourself right now?",
    subtitle: "Be honest. Atlas adjusts to where you are, not where you think you should be.",
    type: "cards",
    options: [
      { value: "overwhelmed", emoji: "😮‍💨", label: "Overwhelmed", desc: "I have too much going on and feel lost" },
      { value: "stuck", emoji: "🧱", label: "Stuck", desc: "I know what to do but can't start" },
      { value: "building", emoji: "🏗️", label: "Building momentum", desc: "I'm making progress but need structure" },
      { value: "optimizing", emoji: "🎯", label: "Ready to optimize", desc: "Things are good, I want to level up" },
    ],
  },
  {
    id: "time",
    question: "When do you want Atlas to check in with you?",
    subtitle: "Atlas will reach out at these times. You can change this anytime.",
    type: "cards",
    options: [
      { value: "morning", emoji: "☀️", label: "Morning only", desc: "Start my day with clear instruction" },
      { value: "evening", emoji: "🌙", label: "Evening only", desc: "Reflect and plan for tomorrow" },
      { value: "both", emoji: "🔄", label: "Morning + Evening", desc: "Full coaching cycle — recommended" },
    ],
  },
  {
    id: "name",
    question: "What should Atlas call you?",
    subtitle: "This makes your coaching feel like it's actually for you.",
    type: "text",
    placeholder: "Your first name",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [textValue, setTextValue] = useState("");
  const [loading, setLoading] = useState(false);

  const current = steps[step];
  const progress = ((step) / steps.length) * 100;

  const handleSelect = (value: string) => {
    const updated = { ...answers, [current.id]: value };
    setAnswers(updated);
    setTimeout(() => {
      if (step < steps.length - 1) {
        setStep(step + 1);
      } else {
        handleComplete(updated);
      }
    }, 200);
  };

  const handleTextNext = () => {
    if (!textValue.trim()) return;
    const updated = { ...answers, [current.id]: textValue.trim() };
    setAnswers(updated);
    handleComplete(updated);
  };

  const handleComplete = (finalAnswers: Record<string, string>) => {
    setLoading(true);
    // Store in localStorage for now
    localStorage.setItem("atlas_onboarding", JSON.stringify(finalAnswers));
    setTimeout(() => {
      router.push("/dashboard");
    }, 1200);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0F] flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="text-[#E8A34A] text-4xl mb-6">◈</div>
          <p className="font-display text-2xl text-[#F5F5FA] mb-3">Setting up your coach...</p>
          <p className="text-[#6B6B7B] text-sm">Personalizing your daily plan</p>
          <div className="mt-8 flex gap-1.5 justify-center">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-[#E8A34A]"
                style={{ animation: `pulse 1s ${i * 0.2}s infinite` }}
              />
            ))}
          </div>
        </div>
        <style jsx>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.3; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0F] flex flex-col">
      {/* Top bar */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[#E8A34A]">◈</span>
            <span className="text-sm text-[#6B6B7B]">Atlas</span>
          </div>
          <span className="text-xs text-[#6B6B7B]">{step + 1} of {steps.length}</span>
        </div>
        {/* Progress bar */}
        <div className="h-0.5 bg-[#1E1E24] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#E8A34A] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6 pb-12 max-w-lg mx-auto w-full">
        <h2 className="font-display text-2xl md:text-3xl text-[#F5F5FA] mb-2 leading-snug">
          {current.question}
        </h2>
        <p className="text-sm text-[#6B6B7B] mb-8">{current.subtitle}</p>

        {current.type === "cards" && (
          <div className="grid gap-3">
            {current.options?.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition-all hover:border-[#E8A34A] ${
                  answers[current.id] === opt.value
                    ? "bg-[rgba(232,163,74,0.1)] border-[#E8A34A]"
                    : "bg-[#141417] border-[#2A2A33]"
                }`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <div>
                  <div className="text-sm font-medium text-[#F5F5FA]">{opt.label}</div>
                  <div className="text-xs text-[#6B6B7B] mt-0.5">{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {current.type === "text" && (
          <div className="space-y-4">
            <input
              type="text"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTextNext()}
              placeholder={current.placeholder}
              autoFocus
              className="w-full bg-[#141417] border border-[#2A2A33] rounded-2xl px-5 py-4 text-lg text-[#F5F5FA] placeholder-[#6B6B7B] focus:outline-none focus:border-[#E8A34A] transition-colors"
            />
            <button
              onClick={handleTextNext}
              disabled={!textValue.trim()}
              className="w-full bg-[#E8A34A] text-[#0D0D0F] font-semibold py-4 rounded-2xl hover:bg-[#C4862C] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Start my coaching →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
