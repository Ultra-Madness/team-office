import { createRoot } from "react-dom/client";
import { useEffect, useMemo, useState } from "react";
import { makeOffice } from "./office";
import { ThemeToggle } from "./ThemeToggle";

const DATA_URL = `${import.meta.env.BASE_URL}data.json`;

function Root() {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch(`${DATA_URL}?t=${Date.now()}`, { cache: "no-store" })
        .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
        .then((d) => { if (alive) { setErr(""); setData((old: any) => (old && JSON.stringify(old) === JSON.stringify(d) ? old : d)); } })
        .catch((e) => alive && setErr(String(e)));
    load();
    const id = setInterval(load, 30000);
    return () => { alive = false; clearInterval(id); };
  }, []);
  const App = useMemo(() => (data ? makeOffice(data) : null), [data]);
  if (!App) return <div style={{ padding: 20, color: "inherit" }}>{err ? `Could not load data.json: ${err}` : "Loading the office…"}</div>;
  return <><ThemeToggle /><App /></>;
}
createRoot(document.getElementById("root")!).render(<Root />);
