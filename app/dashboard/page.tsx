"use client";
import { useState, useEffect, useRef } from "react";

const categoryMap: Record<string, { emoji: string; label: string }> = {
  "post-work": { emoji: "🌇", label: "Post-Work Reset" },
  "new-parent": { emoji: "👶", label: "New Parent Survival" },
  "sleep": { emoji: "😴", label: "Sleep Mastery" },
  "cooking": { emoji: "🍳", label: "Cooking From Zero" },
  "memory": { emoji: "🧠", label: "Memory Training" },
  "marriage": { emoji: "💑", label: "Marriage & Family" },
};

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

type Message = { role: "coach" | "user"; text: string };

export default function Dashboard() {
  const [onboarding, setOnboarding] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<"today" | "chat" | "streak">("today");
  const [checkedIn, setCheckedIn] = useState(false);
  const [taskDone, setTaskDone] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [dayTask, setDayTask] = useState("");
  const [taskLoading, setTaskLoading] = useState(true);
  const [streak] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const now = new Date();

  useEffect(() => {
    const stored = localStorage.getItem("atlas_onboarding");
    if (stored) {
      const data = JSON.parse(stored);
      setOnboarding(data);
      generateDailyTask(data);
    } else {
      setOnboarding({ category: "post-work", name: "there", time: "both", level: "overwhelmed" });
      generateDailyTask({ category: "post-work", name: "there", time: "both", level: "overwhelmed" });
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateDailyTask = async (data: Record<string, string>) => {
    setTaskLoading(true);
    try {
      const res = await fetch("/api/daily-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: data.category || "post-work",
          name: data.name || "there",
          level: data.level || "overwhelmed",
          day: streak,
        }),
      });
      const json = await res.json();
      setDayTask(json.task || fallbackTask(data.category));
    } catch {
      setDayTask(fallbackTask(data.category));
    }
    setTaskLoading(false);
  };

  const fallbackTask = (category: string) => {
    const tasks: Record<string, string> = {
      "post-work": "Before you open your phone or turn on the TV — take 10 minutes for yourself. Sit somewhere quiet. No screens. Just breathe and let the day decompress. Tell me tonight how it felt.",
      "new-parent": "Track your baby's wake windows today. Every time they wake up, note the time. By tonight you'll have a pattern — and that pattern is your first coaching data.",
      "sleep": "Tonight, no screens 30 minutes before bed. Replace it with something analog — a book, a notebook, even just sitting. Report back in the morning.",
      "cooking": "Today's task: learn to boil water properly. Yes, really. Fill a pot 2/3 full. High heat. Watch it. Don't leave it. This is Day 1.",
      "memory": "Write down 3 things you want to remember from today — before you go to sleep. Keep it next to your bed. Tomorrow I'll ask you what they were.",
      "marriage": "One question for your partner tonight: 'What's one thing I can do for you this week?' Listen. Don't solve. Just hear them.",
    };
    return tasks[category] || tasks["post-work"];
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          category: onboarding.category || "post-work",
          name: onboarding.name || "there",
          level: onboarding.level || "overwhelmed",
          history: messages,
        }),
      });
      const json = await res.json();
      setMessages((prev) => [...prev, { role: "coach", text: json.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "coach", text: "I'm having trouble connecting right now. Try again in a moment." }]);
    }
    setLoading(false);
  };

  const handleCheckIn = (done: boolean) => {
    setTaskDone(done);
    setCheckedIn(true);
    const response = done
      ? `That's real progress. Day ${streak} done. Tomorrow I'll build on what you started.`
      : `That's okay. Life happens. Tomorrow we try again — and I'll adjust the task based on what got in the way.`;
    setMessages([{ role: "coach", text: response }]);
    setTab("chat");
  };

  const cat = categoryMap[onboarding.category] || categoryMap["post-work"];
  const name = onboarding.name || "there";
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-[#F5F5FA] flex flex-col max-w-lg mx-auto">

      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[#E8A34A] text-sm">◈ Atlas</span>
          <span className="text-xs text-[#6B6B7B]">
            {dayNames[now.getDay()]}, {monthNames[now.getMonth()]} {now.getDate()}
          </span>
        </div>
        <h1 className="font-display text-2xl">
          {greeting}, {name}.
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm">{cat.emoji}</span>
          <span className="text-xs text-[#6B6B7B]">{cat.label}</span>
          <span className="mx-1 text-[#2A2A33]">·</span>
          <span className="text-xs text-[#E8A34A]">Day {streak}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 flex gap-1 border-b border-[#1E1E24] mb-0">
        {(["today", "chat", "streak"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm capitalize transition-colors relative ${
              tab === t ? "text-[#F5F5FA]" : "text-[#6B6B7B] hover:text-[#9B9BAA]"
            }`}
          >
            {t}
            {tab === t && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E8A34A] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">

        {/* TODAY TAB */}
        {tab === "today" && (
          <div className="px-5 py-6 space-y-4">

            {/* Task card */}
            <div className="bg-[#141417] border border-[#2A2A33] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-[#E8A34A]" />
                <span className="text-xs text-[#E8A34A] uppercase tracking-widest">Today&apos;s task</span>
              </div>

              {taskLoading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-[#2A2A33] rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-[#2A2A33] rounded animate-pulse w-full" />
                  <div className="h-4 bg-[#2A2A33] rounded animate-pulse w-2/3" />
                </div>
              ) : (
                <p className="text-[#F5F5FA] leading-relaxed text-sm">{dayTask}</p>
              )}
            </div>

            {/* Evening check-in */}
            {!checkedIn ? (
              <div className="bg-[#141417] border border-[#2A2A33] rounded-2xl p-5">
                <p className="text-xs text-[#6B6B7B] uppercase tracking-widest mb-3">Evening check-in</p>
                <p className="text-sm text-[#9B9BAA] mb-4">Did you complete today&apos;s task?</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleCheckIn(true)}
                    className="flex-1 bg-[rgba(232,163,74,0.12)] border border-[#E8A34A]/30 text-[#E8A34A] py-3 rounded-xl text-sm font-medium hover:bg-[rgba(232,163,74,0.2)] transition-colors"
                  >
                    ✓ Yes, I did it
                  </button>
                  <button
                    onClick={() => handleCheckIn(false)}
                    className="flex-1 bg-[#1E1E24] border border-[#2A2A33] text-[#9B9BAA] py-3 rounded-xl text-sm hover:border-[#6B6B7B] transition-colors"
                  >
                    Not today
                  </button>
                </div>
              </div>
            ) : (
              <div className={`rounded-2xl p-4 border ${
                taskDone
                  ? "bg-[rgba(232,163,74,0.08)] border-[#E8A34A]/30"
                  : "bg-[#141417] border-[#2A2A33]"
              }`}>
                <p className="text-sm text-[#9B9BAA]">
                  {taskDone
                    ? "✓ Day complete. See you tomorrow."
                    : "Tomorrow is a new day. Your coach will adjust."}
                </p>
              </div>
            )}

            {/* Tomorrow preview */}
            <div className="bg-[#141417] border border-[#1E1E24] rounded-2xl p-5 opacity-60">
              <p className="text-xs text-[#6B6B7B] uppercase tracking-widest mb-2">Tomorrow</p>
              <p className="text-sm text-[#6B6B7B]">
                {checkedIn
                  ? "Your next task will be ready in the morning."
                  : "Complete today's task to unlock tomorrow's coaching."}
              </p>
            </div>
          </div>
        )}

        {/* CHAT TAB */}
        {tab === "chat" && (
          <div className="flex flex-col h-full">
            <div className="flex-1 px-5 py-4 space-y-3 overflow-y-auto min-h-[400px]">
              {messages.length === 0 && (
                <div className="text-center pt-12">
                  <div className="text-3xl mb-4">◈</div>
                  <p className="text-sm text-[#6B6B7B] max-w-xs mx-auto">
                    Ask your coach anything. How to do today&apos;s task, what you&apos;re struggling with, or just check in.
                  </p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "coach" && (
                    <span className="text-[#E8A34A] text-sm mr-2 mt-1 shrink-0">◈</span>
                  )}
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#E8A34A] text-[#0D0D0F] font-medium rounded-br-sm"
                        : "bg-[#141417] border border-[#2A2A33] text-[#F5F5FA] rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <span className="text-[#E8A34A] text-sm mr-2 mt-1">◈</span>
                  <div className="bg-[#141417] border border-[#2A2A33] px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-[#6B6B7B]"
                        style={{ animation: `pulse 1s ${i * 0.15}s infinite` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-5 py-4 border-t border-[#1E1E24]">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Talk to your coach..."
                  className="flex-1 bg-[#141417] border border-[#2A2A33] rounded-xl px-4 py-3 text-sm text-[#F5F5FA] placeholder-[#6B6B7B] focus:outline-none focus:border-[#E8A34A] transition-colors"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="bg-[#E8A34A] text-[#0D0D0F] px-4 py-3 rounded-xl font-medium text-sm hover:bg-[#C4862C] transition-colors disabled:opacity-30"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STREAK TAB */}
        {tab === "streak" && (
          <div className="px-5 py-6">
            <div className="text-center mb-8">
              <div className="text-6xl font-display text-[#E8A34A] mb-2">{streak}</div>
              <p className="text-[#6B6B7B] text-sm">day streak</p>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-8">
              {Array.from({ length: 28 }).map((_, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-lg ${
                    i < streak
                      ? "bg-[#E8A34A]"
                      : i === streak
                      ? "bg-[rgba(232,163,74,0.2)] border border-[#E8A34A]/30"
                      : "bg-[#1E1E24]"
                  }`}
                />
              ))}
            </div>

            <div className="space-y-3">
              <div className="bg-[#141417] border border-[#2A2A33] rounded-2xl p-4">
                <p className="text-xs text-[#6B6B7B] mb-1">Current category</p>
                <p className="text-sm text-[#F5F5FA]">{cat.emoji} {cat.label}</p>
              </div>
              <div className="bg-[#141417] border border-[#2A2A33] rounded-2xl p-4">
                <p className="text-xs text-[#6B6B7B] mb-1">Coaching style</p>
                <p className="text-sm text-[#F5F5FA] capitalize">{onboarding.level || "Building momentum"}</p>
              </div>
              <div className="bg-[#141417] border border-[#2A2A33] rounded-2xl p-4">
                <p className="text-xs text-[#6B6B7B] mb-1">Check-in schedule</p>
                <p className="text-sm text-[#F5F5FA] capitalize">{onboarding.time || "Morning + Evening"}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="border-t border-[#1E1E24] px-5 py-3 flex justify-around">
        {[
          { id: "today", icon: "☀️", label: "Today" },
          { id: "chat", icon: "◈", label: "Coach" },
          { id: "streak", icon: "📈", label: "Progress" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id as typeof tab)}
            className={`flex flex-col items-center gap-1 px-4 ${
              tab === item.id ? "text-[#E8A34A]" : "text-[#6B6B7B]"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
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
