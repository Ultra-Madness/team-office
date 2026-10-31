// Small local stand-in for the Grok canvas kit used by the original Page, with light and dark themes.
import { useEffect, useState } from "react";
export { useState, useEffect, useRef } from "react";
const LIGHT = {
  mode: "light",
  bg: { base: "#ffffff", subtle: "#f6f6f7", elevated: "#ffffff" },
  text: { primary: "#111827", secondary: "#4b5563", tertiary: "#6b7280" },
  border: { default: "#d1d5db", subtle: "#e5e7eb" },
};
const DARK = {
  mode: "dark",
  bg: { base: "#0f1115", subtle: "#1a1d24", elevated: "#1f232b" },
  text: { primary: "#f3f4f6", secondary: "#d1d5db", tertiary: "#a1a7b3" },
  border: { default: "#3a3f4b", subtle: "#2a2e37" },
};
const KEY = "team-office-theme";
const sysDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;
export function savedMode(): "light" | "dark" | null { const v = localStorage.getItem(KEY); return v === "light" || v === "dark" ? v : null; }
export function currentMode(): "light" | "dark" { return savedMode() ?? "dark"; }
function apply() { const m = currentMode(); document.documentElement.dataset.theme = m; document.documentElement.style.colorScheme = m; window.dispatchEvent(new Event("of-theme")); }
export function setMode(m: "light" | "dark") { localStorage.setItem(KEY, m); apply(); }
if (typeof window !== "undefined") { apply(); window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", apply); }
export function useGrokTheme(): any {
  const [m, setM] = useState(currentMode());
  useEffect(() => { const f = () => setM(currentMode()); window.addEventListener("of-theme", f); return () => window.removeEventListener("of-theme", f); }, []);
  return m === "dark" ? DARK : LIGHT;
}
