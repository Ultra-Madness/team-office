// Command-center panels above the office scene: goals and progress, team list, "Waiting on Michael" queue, live feed.
// Everything is read from data.json (refreshed from Notion). Buttons only save on this device (localStorage); nothing writes to Notion.
import { useEffect, useState } from "react";
import { useGrokTheme } from "./kit";

const COLOR: Record<string, string> = { pm: "#3B82F6", po: "#F59E0B", sm: "#10B981", ds: "#EC4899", dev: "#8B5CF6", qa: "#06B6D4", gb: "#9CA3AF", team: "#64748B" };
const STATE: Record<string, { label: string; color: string }> = {
  engaged: { label: "Engaged", color: "#22C55E" }, idle: { label: "Idle, waiting", color: "#F59E0B" }, blocked: { label: "Blocked", color: "#EF4444" },
  waiting: { label: "Waiting", color: "#F59E0B" }, paused: { label: "Paused", color: "#A78BFA" }, offline: { label: "Offline", color: "#6B7280" },
};
const DONE = ["Done"], DOING = ["In progress", "In review", "QA"];
const KEY = "team-office-decisions-v1", SND = "team-office-sound";
type Mark = { state: "approved" | "done" | "open"; at: string; choice?: string };
// "…: keep as Warning or mark Danger?" -> ["Keep as Warning", "Mark Danger"]; null when the question isn't a two-way choice.
export function options(title: string): string[] | null {
  const q = title.includes(":") ? title.slice(title.lastIndexOf(":") + 1) : title;
  if (!q.trim().endsWith("?")) return null;
  const parts = q.trim().replace(/\?$/, "").split(/,? or /);
  if (parts.length !== 2 || parts.some((x) => !x.trim() || x.length > 60)) return null;
  const cap = (x: string) => x.trim().charAt(0).toUpperCase() + x.trim().slice(1);
  return parts.map(cap);
}

// Role badges drawn in code (no images).
function Badge({ k, size = 26 }: { k: string; size?: number }) {
  const c = COLOR[k] || "#64748B";
  const g: Record<string, any> = {
    pm: <path d="M8 17V9h3l2 3 2-3h3v8" fill="none" stroke="#fff" strokeWidth={1.8} strokeLinejoin="round" />,
    po: <path d="M13 6l2 4.5 5 .5-3.8 3.3 1.1 4.9L13 16.7 8.7 19.2l1.1-4.9L6 11l5-.5z" fill="#fff" />,
    sm: <><circle cx={13} cy={13} r={5.5} fill="none" stroke="#fff" strokeWidth={1.8} /><path d="M13 9.5V13l2.5 1.5" stroke="#fff" strokeWidth={1.8} fill="none" strokeLinecap="round" /></>,
    ds: <path d="M8 18l2-5 7-7 3 3-7 7zM10 13l3 3" fill="none" stroke="#fff" strokeWidth={1.7} strokeLinejoin="round" />,
    dev: <path d="M10 9l-4 4 4 4M16 9l4 4-4 4" fill="none" stroke="#fff" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />,
    qa: <path d="M8 13.5l3.2 3.2L18.5 9" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />,
  };
  return <svg width={size} height={size} viewBox="0 0 26 26" aria-hidden="true" style={{ flex: "none" }}><circle cx={13} cy={13} r={13} fill={c} />{g[k] || <circle cx={13} cy={13} r={4} fill="#fff" />}</svg>;
}

const fmt = (iso: string) => { const d = new Date(iso); return isNaN(+d) ? iso : d.toLocaleString("en-US", { timeZone: "America/Chicago", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) + " CT"; };
const ago = (iso: string, now: number) => { const m = Math.round((now - +new Date(iso)) / 60000); if (isNaN(m)) return ""; if (m < 2) return "just now"; if (m < 60) return `${m} min ago`; const h = Math.round(m / 60); return h < 24 ? `${h} h ago` : `${Math.round(h / 24)} d ago`; };

function Bar({ label, done, doing, total, th, sub }: any) {
  const p = total ? Math.round((100 * done) / total) : 0, q = total ? Math.round((100 * doing) / total) : 0;
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 13 }}><b style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</b><span style={{ color: th.text.secondary, whiteSpace: "nowrap" }}>{done}/{total} done · {p}%</span></div>
      <div role="progressbar" aria-valuenow={p} aria-valuemin={0} aria-valuemax={100} aria-label={`${label} ${p}% done`} style={{ height: 10, borderRadius: 99, background: th.bg.subtle, border: `1px solid ${th.border.subtle}`, overflow: "hidden", display: "flex", marginTop: 4 }}>
        <div style={{ width: `${p}%`, background: "#22C55E" }} /><div style={{ width: `${q}%`, background: "#3B82F6", opacity: 0.6 }} />
      </div>
      {sub && <div style={{ fontSize: 12, color: th.text.tertiary, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

export function Dashboard({ data }: { data: any }) {
  const th = useGrokTheme();
  const [now, setNow] = useState(Date.now());
  const [sel, setSel] = useState("");
  const [marks, setMarks] = useState<Record<string, Mark>>(() => { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; } });
  const [sound, setSound] = useState(() => localStorage.getItem(SND) === "on");
  const [showDone, setShowDone] = useState(false);
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(id); }, []);
  useEffect(() => { const esc = (e: KeyboardEvent) => e.key === "Escape" && setSel(""); document.addEventListener("keydown", esc); return () => document.removeEventListener("keydown", esc); }, []);

  const cards: any[] = data.BOARD?.cards || [];
  const team: any[] = data.OFFICE?.team || [];
  const msgs: any[] = [...(data.MESSAGES || [])].sort((a, b) => +new Date(b.time) - +new Date(a.time));
  const dec = data.DECISIONS || { open: [], recent: [] };
  const name = (k: string) => k === "gb" ? "Michael / Grok Bot" : k === "team" ? "Whole team" : (team.find((m) => m.key === k)?.name || k);
  const count = (f: (c: any) => boolean) => { const s = cards.filter(f); return { total: s.length, done: s.filter((c) => DONE.includes(c.status)).length, doing: s.filter((c) => DOING.includes(c.status)).length }; };
  const sprintNames = Array.from(new Set(cards.map((c) => c.sprint).filter((s) => /^Sprint \d+$/.test(s)))).sort().reverse();
  const proj = count(() => true);

  const idOf = (d: any) => d.url || d.title;
  const open = (dec.open || []).filter((d: any) => !marks[idOf(d)] || marks[idOf(d)].state === "open");
  const cleared = (dec.open || []).filter((d: any) => marks[idOf(d)] && marks[idOf(d)].state !== "open");
  const xp = Object.values(marks).filter((m) => m.state !== "open").length;
  const beep = () => { if (!sound) return; try { const A = (window as any).AudioContext || (window as any).webkitAudioContext; const a = new A(); const o = a.createOscillator(), g = a.createGain(); o.frequency.value = 880; g.gain.value = 0.05; o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime + 0.12); } catch { /* no sound */ } };
  const mark = (d: any, state: Mark["state"], choice?: string) => { const n = { ...marks, [idOf(d)]: { state, at: new Date().toISOString(), choice } }; setMarks(n); localStorage.setItem(KEY, JSON.stringify(n)); if (state !== "open") beep(); };

  const box = { background: th.bg.elevated, border: `1px solid ${th.border.default}`, borderRadius: 12, padding: 14, minWidth: 0 } as const;
  const btn = (bg: string, fg = "#fff") => ({ minHeight: 40, padding: "8px 14px", borderRadius: 10, border: "none", background: bg, color: fg, fontWeight: 700, fontSize: 14, cursor: "pointer" });
  const person = team.find((m) => m.key === sel);
  const own = msgs.filter((m) => m.from === sel).slice(0, 12);

  return (
    <div className="of-dash" style={{ background: th.bg.base, color: th.text.primary, padding: "56px 20px 0", maxWidth: 1200, margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <style>{`.of-dash .g{display:grid;gap:12px;grid-template-columns:260px 1fr 320px}.of-dash .bars{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}
@media (max-width:900px){.of-dash .g{grid-template-columns:1fr}.of-dash .wom{order:-1}.of-dash{padding:52px 10px 0!important}}`}</style>

      <section style={{ ...box, marginBottom: 12 }} aria-label="Goals and progress">
        <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 0.6, color: th.text.tertiary }}>Goal</div>
        <div style={{ fontSize: 17, fontWeight: 700, margin: "2px 0 2px" }}>{data.PROJECT?.name}</div>
        <div style={{ fontSize: 14, color: th.text.secondary, marginBottom: 10 }}>{data.PROJECT?.sprint}{data.PROJECT?.sprintGoal ? ` · ${data.PROJECT.sprintGoal}` : ""}</div>
        <div className="bars">
          <Bar th={th} label="Project 1 (all board cards)" {...proj} sub={`${proj.doing} in progress or review`} />
          {sprintNames.map((s) => { const c = count((x) => x.sprint === s); return <Bar key={s} th={th} label={s} {...c} sub={`${c.doing} in progress or review`} />; })}
        </div>
        <div style={{ fontSize: 12, color: th.text.tertiary, marginTop: 8 }}>Green = done, blue = in progress. From the Notion Team Board, as of {data.BOARD?.asOf}.</div>
      </section>

      <div className="g">
        <section style={box} aria-label="Team">
          <h2 style={{ fontSize: 15, margin: "0 0 8px" }}>Team</h2>
          {team.map((m) => { const s = STATE[m.status] || STATE.idle; return (
            <button key={m.key} onClick={() => setSel(sel === m.key ? "" : m.key)} aria-expanded={sel === m.key} style={{ display: "flex", gap: 10, alignItems: "flex-start", width: "100%", textAlign: "left", background: sel === m.key ? th.bg.subtle : "transparent", border: `1px solid ${sel === m.key ? th.border.default : "transparent"}`, borderRadius: 10, padding: 8, color: "inherit", cursor: "pointer", marginBottom: 2 }}>
              <Badge k={m.key} />
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: "flex", justifyContent: "space-between", gap: 6 }}><b style={{ fontSize: 14 }}>{m.name} <span style={{ fontWeight: 400, color: th.text.tertiary, fontSize: 12 }}>{m.role}</span></b>
                  <span style={{ fontSize: 12, fontWeight: 700, color: s.color, whiteSpace: "nowrap" }}>● {s.label}</span></span>
                <span style={{ display: "block", fontSize: 12, color: th.text.secondary, overflow: "hidden" }}>{m.now}</span>
                <span style={{ display: "block", fontSize: 11, color: th.text.tertiary }}>Last active {m.last}</span>
              </span>
            </button>); })}
          <div style={{ fontSize: 12, color: th.text.tertiary }}>Tap a person to see only their messages.</div>
        </section>

        <section className="wom" style={{ ...box, borderColor: open.length ? "#F59E0B" : th.border.default }} aria-label="Waiting on Michael">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <h2 style={{ fontSize: 15, margin: 0 }}>Waiting on Michael {open.length > 0 && <span style={{ background: "#F59E0B", color: "#111827", borderRadius: 99, padding: "1px 8px", fontSize: 13 }}>{open.length}</span>}</h2>
            <span style={{ fontSize: 12, color: th.text.tertiary }}><span data-t="cleared">{xp > 0 ? `${xp} cleared · ` : ""}</span><label style={{ cursor: "pointer" }}><input type="checkbox" checked={sound} onChange={(e) => { setSound(e.target.checked); localStorage.setItem(SND, e.target.checked ? "on" : "off"); }} /> sound</label></span>
          </div>
          <div style={{ fontSize: 12, color: th.text.secondary, margin: "6px 0 10px", padding: "6px 8px", background: th.bg.subtle, borderRadius: 8 }}>Buttons are <b>saved on this device only</b>. They don't change Notion or tell the team; Pym still records your answer.</div>
          {open.length === 0 && <div style={{ padding: "18px 4px", fontSize: 15 }}>✓ Nothing is waiting on you right now.</div>}
          {open.map((d: any) => (
            <div key={idOf(d)} style={{ border: `1px solid ${th.border.default}`, borderRadius: 10, padding: 10, marginBottom: 8 }}>
              <a href={d.url} target="_blank" rel="noreferrer" style={{ color: "inherit", fontWeight: 700, fontSize: 15 }}>{d.title}</a>
              <div style={{ fontSize: 12, color: th.text.tertiary, margin: "2px 0 8px" }}>{d.why ? `${d.why} · ` : ""}asked {d.date}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {options(d.title) ? options(d.title)!.map((o, j) => <button key={o} style={btn(j ? "#2563EB" : "#16A34A")} onClick={() => mark(d, "approved", o)}>{o}</button>)
                  : <><button style={btn("#16A34A")} onClick={() => mark(d, "approved")} title="Go ahead with the default">Approve</button>
                <button style={btn("#2563EB")} onClick={() => mark(d, "done")}>Done</button></>}
                <button style={btn(th.bg.subtle, th.text.primary)} onClick={() => mark(d, "open")}>Keep open</button>
              </div>
            </div>))}
          {cleared.length > 0 && <div style={{ fontSize: 13, marginTop: 6 }}>
            <b>Cleared on this device</b>
            {cleared.map((d: any) => <div key={idOf(d)} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "4px 0", color: th.text.secondary }}><span>{marks[idOf(d)].choice ? `✓ ${marks[idOf(d)].choice}` : marks[idOf(d)].state === "approved" ? "✓ Approved" : "✓ Done"}: {d.title}</span><button style={{ ...btn("transparent", th.text.secondary), minHeight: 28, padding: "2px 6px", fontWeight: 400, textDecoration: "underline" }} onClick={() => mark(d, "open")}>Undo</button></div>)}
          </div>}
          <button onClick={() => setShowDone(!showDone)} aria-expanded={showDone} style={{ ...btn("transparent", th.text.secondary), padding: "6px 0", fontWeight: 600, fontSize: 13 }}>{showDone ? "▾" : "▸"} Your recent decisions ({(dec.recent || []).length})</button>
          {showDone && (dec.recent || []).map((d: any) => <div key={idOf(d)} style={{ fontSize: 13, padding: "3px 0" }}><a href={d.url} target="_blank" rel="noreferrer" style={{ color: th.text.secondary }}>{d.title}</a> <span style={{ color: th.text.tertiary }}>· {d.date}</span></div>)}
          <div style={{ fontSize: 11, color: th.text.tertiary, marginTop: 6 }}>From the Notion Decision Log{dec.asOf ? `, as of ${dec.asOf}` : ""}.</div>
        </section>

        <section style={box} aria-label="Live activity">
          <h2 style={{ fontSize: 15, margin: "0 0 8px" }}>Live activity</h2>
          <div style={{ maxHeight: 420, overflow: "auto" }}>
            {msgs.slice(0, 20).map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 8, padding: "6px 0", borderBottom: `1px solid ${th.border.subtle}` }}>
                <Badge k={m.from} size={20} />
                <div style={{ minWidth: 0, fontSize: 13 }}>
                  <div><b>{name(m.from)}</b> <span style={{ color: th.text.tertiary }}>→ {name(m.to)}</span></div>
                  <div style={{ color: th.text.secondary }}>{m.topic}</div>
                  <div style={{ fontSize: 11, color: th.text.tertiary }}>{fmt(m.time)} · {ago(m.time, now)}</div>
                </div>
              </div>))}
          </div>
        </section>
      </div>

      {person && (
        <div role="dialog" aria-label={`${person.name}'s messages`} onClick={() => setSel("")} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 10 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ ...box, width: "min(460px, 100%)", maxHeight: "80vh", overflow: "auto", boxShadow: "0 10px 30px rgba(0,0,0,.4)" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}><Badge k={person.key} size={34} /><div style={{ flex: 1 }}><b style={{ fontSize: 16 }}>{person.name}</b> <span style={{ color: th.text.tertiary }}>{person.role}</span><div style={{ fontSize: 13, color: (STATE[person.status] || STATE.idle).color, fontWeight: 700 }}>● {(STATE[person.status] || STATE.idle).label}</div></div>
              <button aria-label="Close" onClick={() => setSel("")} style={{ ...btn(th.bg.subtle, th.text.primary), minHeight: 36 }}>✕</button></div>
            <div style={{ fontSize: 13, margin: "10px 0", color: th.text.secondary }}><b>Now:</b> {person.now}<br /><b>Next:</b> {person.next}</div>
            <div style={{ fontSize: 12, textTransform: "uppercase", color: th.text.tertiary, marginBottom: 4 }}>{person.name}'s messages</div>
            {own.length === 0 && <div style={{ fontSize: 13 }}>No messages logged yet.</div>}
            {own.map((m, i) => <div key={i} style={{ fontSize: 13, padding: "5px 0", borderTop: `1px solid ${th.border.subtle}` }}>→ {name(m.to)}: {m.topic}<div style={{ fontSize: 11, color: th.text.tertiary }}>{fmt(m.time)}</div></div>)}
          </div>
        </div>)}
    </div>
  );
}
