"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type Msg = { role: "coach" | "user"; text: string };

export default function Dashboard() {
  const router = useRouter();
  const [plan, setPlan] = useState<Record<string, unknown>>({});
  const [tab, setTab] = useState<"today" | "chat" | "progress">("today");
  const [dayTask, setDayTask] = useState("");
  const [taskLoading, setTaskLoading] = useState(true);
  const [checkedIn, setCheckedIn] = useState(false);
  const [done, setDone] = useState<boolean | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [streak] = useState(1);
  const endRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    const stored = localStorage.getItem("atlas_plan");
    if (!stored) { router.push("/onboarding"); return; }
    const p = JSON.parse(stored);
    setPlan(p);
    generateTask(p);
  }, [router]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  async function generateTask(p: Record<string, unknown>) {
    setTaskLoading(true);
    try {
      const res = await fetch("/api/daily-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: p.category, name: p.name, level: "building", day: streak }),
      });
      const { task } = await res.json();
      setDayTask(task || String(p.day1 || ""));
    } catch {
      setDayTask(String(p.day1 || "Take 10 minutes for yourself tonight. No screens. Let the day decompress."));
    }
    setTaskLoading(false);
  }

  function handleCheckIn(d: boolean) {
    setDone(d);
    setCheckedIn(true);
    const reply = d
      ? "That is real progress. Day 1 done. Tomorrow I build on exactly what you started. How did it actually feel?"
      : "That is okay. Life happens. Tell me what got in the way — one sentence is enough. I will adjust tomorrow.";
    setMsgs([{ role: "coach", text: reply }]);
    setTab("chat");
  }

  async function sendMsg() {
    if (!input.trim() || chatLoading) return;
    const text = input.trim();
    setInput("");
    setMsgs(prev => [...prev, { role: "user", text }]);
    setChatLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, category: plan.category, name: plan.name, level: "building", history: msgs }),
      });
      const { reply } = await res.json();
      setMsgs(prev => [...prev, { role: "coach", text: reply }]);
    } catch {
      setMsgs(prev => [...prev, { role: "coach", text: "Let me think about that. Try again in a moment." }]);
    }
    setChatLoading(false);
  }

  const catLabels: Record<string, string> = {
    "post-work": "Post-Work Reset", "new-parent": "New Parent Survival",
    "sleep": "Sleep Mastery", "cooking": "Cooking From Zero",
    "memory": "Memory Training", "marriage": "Family & Presence",
    "general": "Daily Coaching",
  };
  const catLabel = catLabels[String(plan.category || "general")] || "Daily Coaching";
  const name = String(plan.name || "");

  const S = {
    shell: { maxWidth: 420, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column" as const, background: "#fff", borderLeft: "1px solid #E8E2DA", borderRight: "1px solid #E8E2DA" },
    header: { padding: "22px 20px 16px", background: "#1E5C40", flexShrink: 0 as const },
    headerTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
    logo: { display: "flex", alignItems: "center", gap: 8 },
    logoMark: { width: 26, height: 26, borderRadius: 6, background: "#D95F2B", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia,serif", fontSize: 13, color: "#fff", fontWeight: 900 },
    logoName: { fontSize: 13, color: "rgba(255,255,255,0.6)" },
    headerDate: { fontSize: 12, color: "rgba(255,255,255,0.4)" },
    greeting: { fontFamily: "Georgia,serif", fontSize: 22, color: "#fff", fontWeight: 700, marginBottom: 6 },
    catPill: { display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(217,95,43,0.20)", borderRadius: 20, padding: "3px 10px 3px 8px" },
    catDot: { width: 6, height: 6, borderRadius: 2, background: "#D95F2B" },
    catText: { fontSize: 12, color: "#D95F2B", fontWeight: 500 },
    dayBadge: { fontSize: 12, color: "rgba(255,255,255,0.4)", marginLeft: 8 },
    tabs: { display: "flex", background: "#1E5C40", borderBottom: "1px solid rgba(255,255,255,0.1)", padding: "0 20px", flexShrink: 0 as const },
    tab: (active: boolean) => ({ padding: "12px 16px", fontSize: 13, cursor: "pointer", border: "none", background: "transparent", fontFamily: "system-ui,sans-serif", transition: "color 0.2s", position: "relative" as const, color: active ? "#fff" : "rgba(255,255,255,0.4)" }),
    tabLine: { position: "absolute" as const, bottom: 0, left: 0, right: 0, height: 2, background: "#D95F2B", borderRadius: 2 },
    content: { flex: 1, overflowY: "auto" as const },
    pad: { padding: 20, display: "flex", flexDirection: "column" as const, gap: 14 },
    taskCard: { background: "#EEF6F1", borderRadius: 16, padding: 20, border: "1px solid rgba(30,92,64,0.12)" },
    taskHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
    taskLabel: { fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#1E5C40" },
    dayTag: { fontSize: 11, background: "#1E5C40", color: "#fff", padding: "3px 10px", borderRadius: 20, fontWeight: 600 },
    taskText: { fontFamily: "Georgia,serif", fontStyle: "italic" as const, fontSize: 16, lineHeight: 1.65, color: "#1A1714", marginBottom: 14, borderLeft: "3px solid #D95F2B", paddingLeft: 14 },
    taskCoach: { display: "flex", alignItems: "center", gap: 8 },
    taskAv: { width: 24, height: 24, borderRadius: "50%", background: "#1E5C40", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia,serif", fontSize: 10, color: "#fff", fontWeight: 700, flexShrink: 0 },
    taskCoachText: { fontSize: 12, color: "#6B6560" },
    shimmer: { height: 16, background: "#D4EDE1", borderRadius: 6, marginBottom: 8, animation: "shimmer 1.5s infinite" },
    checkCard: { background: "#fff", borderRadius: 16, padding: 18, border: "1px solid #E8E2DA" },
    checkLabel: { fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#A09890", marginBottom: 10 },
    checkQ: { fontFamily: "Georgia,serif", fontSize: 16, color: "#1A1714", fontWeight: 700, marginBottom: 14 },
    checkBtns: { display: "flex", gap: 10 },
    btnYes: { flex: 1, background: "#1E5C40", color: "#fff", border: "none", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "system-ui,sans-serif" },
    btnNo: { flex: 1, background: "#F8F6F2", color: "#6B6560", border: "none", borderRadius: 10, padding: 12, fontSize: 14, cursor: "pointer", fontFamily: "system-ui,sans-serif" },
    tmrCard: { background: "#F8F6F2", borderRadius: 16, padding: 18, border: "1px solid #E8E2DA", opacity: 0.6 },
    chatWrap: { display: "flex", flexDirection: "column" as const, height: 500 },
    chatMsgs: { flex: 1, padding: 20, overflowY: "auto" as const, display: "flex", flexDirection: "column" as const, gap: 14 },
    chatEmpty: { display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center" as const, padding: 20 },
    chatEmptyMark: { width: 52, height: 52, borderRadius: 14, background: "#1E5C40", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia,serif", fontSize: 22, color: "#fff", fontWeight: 900, marginBottom: 16 },
    chatInputBar: { padding: "14px 16px", borderTop: "1px solid #E8E2DA", display: "flex", gap: 10 },
    chatInput: { flex: 1, background: "#F8F6F2", border: "1.5px solid #E8E2DA", borderRadius: 10, padding: "11px 16px", fontSize: 15, color: "#1A1714", fontFamily: "system-ui,sans-serif", outline: "none", transition: "border-color 0.2s" },
    chatSend: { width: 44, height: 44, background: "#1E5C40", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 15, color: "#fff", fontWeight: 700 },
    progWrap: { padding: 20, display: "flex", flexDirection: "column" as const, gap: 14 },
    streakHero: { background: "#1E5C40", borderRadius: 16, padding: 24, textAlign: "center" as const },
    streakNum: { fontFamily: "Georgia,serif", fontSize: 72, color: "#fff", fontWeight: 900, lineHeight: 1 },
    streakSub: { fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 },
    streakQ: { fontFamily: "Georgia,serif", fontStyle: "italic" as const, fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 12 },
    grid: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 },
    statCards: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
    statCard: { background: "#EEF6F1", borderRadius: 14, padding: 16, border: "1px solid rgba(30,92,64,0.10)" },
    statLabel: { fontSize: 11, color: "#A09890", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 6, fontWeight: 600 },
    statVal: { fontSize: 14, color: "#1A1714", fontWeight: 600 },
    bnav: { borderTop: "1px solid #E8E2DA", display: "flex", padding: "10px 0 20px", background: "#fff", position: "sticky" as const, bottom: 0 },
    bnavItem: (active: boolean) => ({ flex: 1, display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4, color: active ? "#1E5C40" : "#BFB09A", border: "none", background: "none", cursor: "pointer", padding: "6px 0" }),
  };

  return (
    <div style={{ background: "#F0ECE4", minHeight: "100vh" }}>
      <div style={S.shell}>
        {/* Header */}
        <div style={S.header}>
          <div style={S.headerTop}>
            <div style={S.logo}>
              <div style={S.logoMark}>A</div>
              <span style={S.logoName}>Atlas</span>
            </div>
            <span style={S.headerDate}>{days[now.getDay()]}, {months[now.getMonth()]} {now.getDate()}</span>
          </div>
          <div style={S.greeting}>{greeting}{name ? `, ${name}` : ""}.</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={S.catPill}>
              <div style={S.catDot} />
              <span style={S.catText}>{catLabel}</span>
            </div>
            <span style={S.dayBadge}>Day {streak}</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={S.tabs}>
          {(["today","chat","progress"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={S.tab(tab === t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {tab === t && <div style={S.tabLine} />}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={S.content}>

          {/* TODAY */}
          {tab === "today" && (
            <div style={S.pad}>
              <div style={S.taskCard}>
                <div style={S.taskHeader}>
                  <div style={S.taskLabel}>Today&apos;s instruction</div>
                  <div style={S.dayTag}>Day {streak}</div>
                </div>
                {taskLoading ? (
                  <div>
                    <div style={{ ...S.shimmer, width: "80%" }} />
                    <div style={{ ...S.shimmer, width: "100%" }} />
                    <div style={{ ...S.shimmer, width: "65%" }} />
                  </div>
                ) : (
                  <div style={S.taskText}>{dayTask}</div>
                )}
                <div style={S.taskCoach}>
                  <div style={S.taskAv}>A</div>
                  <div style={S.taskCoachText}>Tell me tonight how it went. I&apos;ll adjust tomorrow based on what you find.</div>
                </div>
              </div>

              {!checkedIn ? (
                <div style={S.checkCard}>
                  <div style={S.checkLabel}>Evening check-in</div>
                  <div style={S.checkQ}>Did you complete today&apos;s task?</div>
                  <div style={S.checkBtns}>
                    <button onClick={() => handleCheckIn(true)} style={S.btnYes}>✓ Yes, I did it</button>
                    <button onClick={() => handleCheckIn(false)} style={S.btnNo}>Not today</button>
                  </div>
                </div>
              ) : (
                <div style={{ ...S.checkCard, background: done ? "#EEF6F1" : "#F8F6F2", borderColor: done ? "rgba(30,92,64,0.15)" : "#E8E2DA" }}>
                  <div style={S.taskCoach}>
                    <div style={S.taskAv}>A</div>
                    <div style={{ fontSize: 14, color: "#1A1714" }}>{done ? "Day 1 complete. See you tomorrow." : "Tomorrow we adjust. Talk to your coach below."}</div>
                  </div>
                </div>
              )}

              <div style={S.tmrCard}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#A09890", marginBottom: 6 }}>Tomorrow</div>
                <div style={{ fontSize: 13, color: "#A09890" }}>Check in tonight to unlock tomorrow&apos;s coaching.</div>
              </div>
            </div>
          )}

          {/* CHAT */}
          {tab === "chat" && (
            <div style={S.chatWrap}>
              <div style={S.chatMsgs}>
                {msgs.length === 0 ? (
                  <div style={S.chatEmpty}>
                    <div style={S.chatEmptyMark}>A</div>
                    <div style={{ fontFamily: "Georgia,serif", fontSize: 18, color: "#1A1714", fontWeight: 700, marginBottom: 8 }}>Your coach is here.</div>
                    <div style={{ fontSize: 13, color: "#6B6560", lineHeight: 1.6, maxWidth: 220 }}>Ask anything about today&apos;s task or what you&apos;re going through.</div>
                  </div>
                ) : msgs.map((m, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-end", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
                    {m.role === "coach" && <div style={{ width: 28, height: 28, borderRadius: 8, background: "#1E5C40", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia,serif", fontSize: 12, color: "#fff", fontWeight: 900, flexShrink: 0 }}>A</div>}
                    <div style={{ maxWidth: "78%", padding: "12px 16px", borderRadius: 18, fontSize: 14, lineHeight: 1.65, ...(m.role === "coach" ? { background: "#EEF6F1", border: "1px solid #E8E2DA", color: "#1A1714", borderBottomLeftRadius: 4 } : { background: "#1E5C40", color: "#fff", borderBottomRightRadius: 4, fontWeight: 500 }) }}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "#1E5C40", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia,serif", fontSize: 12, color: "#fff", fontWeight: 900 }}>A</div>
                    <div style={{ background: "#EEF6F1", border: "1px solid #E8E2DA", borderRadius: 18, borderBottomLeftRadius: 4, padding: "14px 17px", display: "flex", gap: 5 }}>
                      {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#A09890", animation: `bounce 1.2s ${i*0.15}s infinite` }} />)}
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>
              <div style={S.chatInputBar}>
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} placeholder="Talk to your coach..." style={S.chatInput} />
                <button onClick={sendMsg} disabled={chatLoading || !input.trim()} style={{ ...S.chatSend, opacity: chatLoading || !input.trim() ? 0.4 : 1 }}>→</button>
              </div>
            </div>
          )}

          {/* PROGRESS */}
          {tab === "progress" && (
            <div style={S.progWrap}>
              <div style={S.streakHero}>
                <div style={S.streakNum}>{streak}</div>
                <div style={S.streakSub}>day streak</div>
                <div style={S.streakQ}>&ldquo;Every coach you&apos;ll ever have started with Day 1.&rdquo;</div>
              </div>
              <div style={S.grid}>
                {Array.from({ length: 28 }).map((_, i) => (
                  <div key={i} style={{ aspectRatio: "1", borderRadius: 6, background: i < streak ? "#1E5C40" : i === streak ? "rgba(30,92,64,0.20)" : "#E8E2DA", border: i === streak ? "1.5px solid #1E5C40" : "none" }} />
                ))}
              </div>
              <div style={S.statCards}>
                <div style={S.statCard}>
                  <div style={S.statLabel}>Category</div>
                  <div style={{ ...S.statVal, color: "#1E5C40" }}>{catLabel}</div>
                </div>
                <div style={S.statCard}>
                  <div style={S.statLabel}>Check-ins</div>
                  <div style={S.statVal}>Morning + Evening</div>
                </div>
                <div style={S.statCard}>
                  <div style={S.statLabel}>Tasks done</div>
                  <div style={S.statVal}>{done ? "1" : "0"} / 1 this week</div>
                </div>
                <div style={S.statCard}>
                  <div style={S.statLabel}>Plan built</div>
                  <div style={{ ...S.statVal, color: "#1E5C40" }}>✓ Active</div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Bottom nav */}
        <div style={S.bnav}>
          {[{ id: "today", icon: "☀️", label: "Today" }, { id: "chat", icon: "A", label: "Coach", isText: true }, { id: "progress", icon: "▦", label: "Progress" }].map(item => (
            <button key={item.id} onClick={() => setTab(item.id as typeof tab)} style={S.bnavItem(tab === item.id)}>
              {item.isText ? <div style={{ width: 22, height: 22, borderRadius: 6, background: tab === item.id ? "#1E5C40" : "#E8E2DA", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia,serif", fontSize: 11, color: tab === item.id ? "#fff" : "#A09890", fontWeight: 900 }}>A</div> : <span style={{ fontSize: 20 }}>{item.icon}</span>}
              <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>{item.label}</span>
            </button>
          ))}
        </div>

        <style>{`
          @keyframes bounce { 0%,80%,100%{transform:scale(0.6);opacity:0.3} 40%{transform:scale(1);opacity:1} }
          @keyframes shimmer { 0%,100%{opacity:0.5} 50%{opacity:1} }
        `}</style>
      </div>
    </div>
  );
}
