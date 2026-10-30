# Team Office

Animated cartoon office showing Michael's six-agent team (Pym, Roma, Anj, Bruce, Dez, Kourt): who is working, real agent-to-agent messages, and the Team Board.

Live: https://ultra-madness.github.io/team-office/

Features: dark mode toggle (remembers your choice, defaults to the system setting), hover/tap message cards, a clickable Team Board overlay, and a phone layout that fits 390px wide. Post-sync patches live in `scripts/phone-patch.mjs` (run automatically by `npm run sync`).

It is a static Vite + React app. All live data (PROJECT, BOARD, OFFICE, MESSAGES, lastUpdated, links) lives in **`public/data.json`**. The app fetches it at load and again every 60 seconds, so a commit that only changes `data.json` updates the live site after the Pages workflow finishes (about 1 minute).

The data is **not live**. It is only as fresh as the last refresh. The header shows "Last updated HH:MM CT".

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173/team-office/
```

## Refresh the data (one step)

The source of truth is the Team Office Page in Grok Bot (canvas `11d32928-8e3f-454c-8255-f879e376ff9d`). Grok Bot refreshes that Page first (see `REFRESH.md` on its box: read the six transcripts, query the Team Board view, one EditCanvas, then ReadCanvas to `/workspace/team-office/canvas.tsx`). Then:

```bash
npm run sync -- /workspace/team-office/canvas.tsx   # regenerates public/data.json and src/office.tsx
git add public/data.json src/office.tsx
git commit -m "Refresh office data $(date '+%Y-%m-%d %H:%M %Z')"
git push
```

`scripts/sync-from-canvas.mjs` extracts the data constants into `public/data.json` and wraps the drawing code in `src/office.tsx`, so the Page and this app stay in sync. Do not hand-edit `src/office.tsx`.

## Deploy

`.github/workflows/pages.yml` builds and deploys to GitHub Pages on every push to `main`. No secrets are stored in this repo.
