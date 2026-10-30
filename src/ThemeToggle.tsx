import { useGrokTheme, setMode } from "./kit";
export function ThemeToggle() {
  const th = useGrokTheme();
  const dark = th.mode === "dark";
  return (
    <button className="of-theme" aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} title={dark ? "Light mode" : "Dark mode"} onClick={() => setMode(dark ? "light" : "dark")}
      style={{ position: "fixed", top: 10, right: 10, zIndex: 40, padding: "6px 12px", borderRadius: 999, border: `1px solid ${th.border.default}`, background: th.bg.elevated, color: th.text.primary, fontSize: 13, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,.15)" }}>
      {dark ? "☀ Light" : "☾ Dark"}
    </button>
  );
}
