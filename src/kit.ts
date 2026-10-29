// Small local stand-in for the Grok canvas kit used by the original Page.
export { useState, useEffect, useRef } from "react";
const THEME = {
  bg: { base: "#ffffff", subtle: "#f6f6f7", elevated: "#ffffff" },
  text: { primary: "#111827", secondary: "#4b5563", tertiary: "#6b7280" },
  border: { default: "#d1d5db", subtle: "#e5e7eb" },
};
export function useGrokTheme(): any { return THEME; }
