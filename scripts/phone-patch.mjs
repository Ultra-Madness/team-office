// Post-processes src/office.tsx after sync-from-canvas.mjs (npm run sync runs this as postsync):
// phone desk labels, popup open/close rules, dark-mode-safe colours and the Team Board overlay.
import fs from "node:fs";
const root = new URL("..", import.meta.url).pathname;
const f = root + "src/office.tsx";
let code = fs.readFileSync(f, "utf8");
if (code.includes("of-plbl")) { console.log("phone patch already applied"); process.exit(0); }
const rep = (a, b) => { if (!code.includes(a)) throw new Error("phone patch marker missing: " + a.slice(0, 70)); code = code.split(a).join(b); };
const snip = (n) => fs.readFileSync(root + "scripts/" + n, "utf8");

// Phone: HTML desk labels replace the tiny SVG ones under 700px.
for (const n of ["46", "60", "82"]) rep("<text x={d.x} y={d.y + " + n + "}", "<text className=\"of-lbl\" x={d.x} y={d.y + " + n + "}");
rep("<div onClick={() => { setPinned(\"\"); setHover(\"\"); }}", "<div className=\"of-card\" data-of-hit=\"1\" onClick={() => { setPinned(\"\"); setHover(\"\"); }}");

// Popup rules: desktop shows on hover and hides on unhover; click/tap toggles; click/tap away or Escape closes.
rep("  const focus = hover || pinned;\n", `  const focus = hover || pinned;
  const [boardOpen, setBoardOpen] = useState<boolean>(false);
  const tapPerson = (k: string) => { if (focus === k) { setPinned(""); setHover(""); } else { setHover(""); setPinned(k); } };
  useEffect(() => {
    const away = (e: any) => { const t = e.target as Element; if (t && t.closest && t.closest("[data-of-hit]")) return; setPinned(""); setHover(""); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { setBoardOpen(false); setPinned(""); setHover(""); } };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", away); document.removeEventListener("keydown", esc); };
  }, []);
`);
rep("const on = () => setHover(m.key);", "const on = () => setHover(m.key); const isMouse = (e: any) => e.pointerType === \"mouse\";");
rep("const tap = () => setPinned(pinned === m.key ? \"\" : m.key);", "const tap = () => tapPerson(m.key);");
rep("style={{ cursor: \"pointer\" }} onMouseEnter={on} onClick={tap} role=\"button\" tabIndex={0} aria-label={`Show messages for ${who(m.key)}`} onFocus={on}", "data-of-hit=\"1\" style={{ cursor: \"pointer\" }} onPointerEnter={(e: any) => { if (isMouse(e)) on(); }} onPointerLeave={(e: any) => { if (isMouse(e)) { setHover(\"\"); setPinned(\"\"); } }} onClick={tap} role=\"button\" tabIndex={0} aria-label={`Show messages for ${who(m.key)}`} onFocus={(e: any) => { if (e.target.matches(\":focus-visible\")) on(); }}");

// Team Board: click the whiteboard to open a readable overlay.
rep("        {OFFICE.team.map((m) => { const s = seat(m.key); return <rect", "        <rect className=\"of-board-hit\" data-of-hit=\"1\" x={726} y={18} width={258} height={158} rx={6} fill=\"transparent\" style={{ cursor: \"zoom-in\" }} onClick={() => setBoardOpen(true)} onMouseEnter={() => setStick(-1)}><title>Open the Team Board</title></rect>\n        {OFFICE.team.map((m) => { const s = seat(m.key); return <rect");
rep("      </svg>\n", "      </svg>\n" + snip("phone-labels.tsx") + snip("board-overlay.tsx"));
rep("Hover or tap a person to see their messages.", "Hover or tap a person to see their messages; click the Team Board to enlarge it.");

fs.writeFileSync(f, code);
console.log("phone patch applied");
