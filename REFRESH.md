# Team Office refresh recipe
Canvas: "Team Office", canvas_id 11d32928-8e3f-454c-8255-f879e376ff9d
URL: https://cursor.com/canvas/store-3218dd69-9ea5-42a1-9bc3-5006f5ba3f44/11d32928-8e3f-454c-8255-f879e376ff9d

## 1. Gather status, one agent at a time
For each agent, call cursor ReadTranscript with in=<id> and limit=8:
- Product Manager c2951cd9-e19a-4fcc-9ec3-965afac3d372 (key pm)
- Product Owner   cad5070a-b6bf-4fa9-8f26-e1aef9bd6db9 (key po)
- Scrum Master    f09b65ae-75bf-4aa0-ac17-5a1cc59aa845 (key sm)
- Designer        5de0b84f-2dcd-4099-bb24-e3546ff927ef (key ds)
- Developer       0aa6a7a2-8911-42ec-8546-21effaf754db (key dev)
- QA              c44e1431-74d5-44a5-83fe-948d93b6788f (key qa)
Optionally also check the Notion "Stories and Tasks" DB in Agile Release Train HQ
(https://app.notion.com/p/40820ecf0b0f8109b788e730ef8ef99a) for stories owned by each role.

## 2. Derive the fields
- last: the newest `<timestamp>` in the transcript (the turn start). Mark it "about" if the
  agent's last action came after that turn start. Use CT.
- doing: one plain line paraphrasing the agent's last SendToUser/assistant text or its
  In Progress Notion story. Never invent work. With nothing yet: "No activity yet".
- status:
  - blocked: the agent's latest message reports an impediment or says it can't proceed
    without something it asked for (a repo, access, an answer).
  - engaged: active in the last ~30 min AND did real work in that turn (not just "on hold").
  - idle: otherwise, including recent turns that only said it is waiting.
  - offline: agent deleted/paused or transcript unreadable.

## 2b. Derive conversations
In each transcript, find SendToAgent calls to another team member (agent_id -> key above).
Add one CONVERSATIONS line per real message: { from, to, topic (<=26 chars, paraphrase), time: "h:mm PM" CT }.
Keep the newest ~12, oldest first. Never invent conversations; Grok Bot briefings are not shown.

## 3. Update the canvas
Edit only the OFFICE and CONVERSATIONS objects at the top of the source (replace the whole CONVERSATIONS array as one edit when it changes). Team lines also carry look fields (color, skin, hair, style); leave those. ReadCanvas once, then ONE EditCanvas
call with an edit per changed line (each team entry is one line, unique by its `key:`),
plus `asOf`, `sprintLine`, `sprintGoal` when a sprint starts.
Names: fill `name: ""` on each entry when Michael assigns them.
Do not post the URL as "new" unless something changed.

## 4. Project at a glance (added Oct 29, 4:12 PM CT)
- PROJECT object: name, sprint, sprintGoal ("" shows "not set yet"), phase (index into
  PHASES: Kickoff, Charter, Backlog, Design, Build, QA, Demo and Accept), stepsDone/stepsTotal for
  the current phase, stepNote (one short line), waitingOnMichael (true when the current step needs
  his approval; the badge text says "approve the charter", edit it when the step changes).
- Sources: agent transcripts plus Notion HQ (charter page status, Program Backlog P1 items,
  Sprints and PIs, Deliverables Register). Advance phase only on evidence (e.g. Michael approved).
- Each team line: received / now / next, max 8 words each, from the transcript
  (received = last inbound task message; now = last thing it did/sent; next = what it said it does next,
  or "Waiting on ..." when blocked by an approval). `doing` is gone.
- inbox: count of tasks the agent acknowledged it owes and has not delivered; 0 hides the badge.
  Only count clearly stated owed items (Oct 29: PM owes WSJF scoring = 1).

## Names (set by Michael, Oct 29 4:24 PM CT)
Pym = Product Manager, Roma = Product Owner, Anj = Scrum Master, Bruce = Designer, Dez = Developer, Kourt = QA.
Keep these `name:` values on refresh. In received/now/next text, refer to teammates by name (e.g. "kickoff from Pym").
Plates, cards, the replay line and the conversation log render names via `who()` as "Name (Role)".

## Oct 29 4:31 PM CT update: MESSAGES list and hover cards
- `CONVERSATIONS` and the big log are gone. One `MESSAGES` list ({time: ISO with -05:00/-06:00 CT offset, from, to, topic of 8 words or fewer}) drives both the walks and the hover cards. Append each new real message from SendToAgent calls/receipts in the transcripts; never invent any.
- Use from/to "gb" for Grok Bot. It is shown as "Grok Bot (on Michael's behalf)", has no desk, never walks, and appears only in hover cards.
- Walks replay the newest `REPLAY_LAST` (12) desk-to-desk messages. The bubble shows "Oct 29, 4:25 PM CT · just now/earlier". "Just now" means within 5 min of the viewer's clock.
- A hover or tap card shows that person's newest 6 messages (← from / → to).
- Messages that SendToAgent "held without waking" are not yet opened by the recipient. Say "(not yet opened)" in Received until their transcript shows they read it.
- The Grok Bot "TEAM CHARTER" and early PM intro messages have no reliable send time (held delivery), so they're left out.
- Local preview: `cp ../canvas.tsx app.tsx`, apply the t/paused patches, then use `?h=<key>` to pin a hover card.

## Team Board whiteboard (BOARD object)
1. Query Notion "Stories and Tasks (Team Board)" (https://app.notion.com/p/13b13bc6fb1047138c3aa9781ad083df).
   Use notion-query-data-sources mode "view" with view_url
   https://www.notion.so/13b13bc6fb1047138c3aa9781ad083df?v=d9555fd5abad49d1aff3695cd51d0b2b, page_size 100.
   (rows/sql modes can hit the Notion usage limit; view mode worked.)
2. For each row: title = Name, short = a 2-4 word label (max 22 chars), status = Status,
   role from "Assignee role" (Product Manager=pm, Product Owner=po, RTE/Scrum Master=sm, Designer=ds, Developer=dev, QA=qa),
   sprint = "Sprint 0" etc. if the Sprint relation is set, else "".
3. Sprint goal: fetch the active sprint page in the Sprints DB (collection://bd9ce5fe-0a03-42d2-98da-f7cc08c96e69),
   Sprint 0 = https://app.notion.com/p/40820ecf0b0f81979e7ccc2f528d916e; use its Goal, or "Sprint 0: set up team and charter".
4. Update BOARD.asOf, BOARD.sprintGoal, BOARD.waitingOnMichael (set to "" when nothing is waiting), BOARD.cards. Never invent cards.
   Columns: To do = Ready+Backlog, Doing = In progress+In review+QA, Done = Done. Cap 8 per column, then "+N more".
5. One EditCanvas call replacing the BOARD block; render and check the whiteboard.

## One-step refresh (Page + GitHub site)
1. Read the six transcripts (full ids) and query the Team Board view. Make one EditCanvas to Page 11d32928-8e3f-454c-8255-f879e376ff9d (update the updated/asOf time).
2. ReadCanvas, then save the result to /workspace/team-office/canvas.tsx.
3. cd /workspace/team-office-repo && npm run sync -- /workspace/team-office/canvas.tsx && git add -A && git commit -m "Refresh office data" && git push
4. Watch the run with `gh run watch`, then screenshot https://ultra-madness.github.io/team-office/ to verify.

---

## Grok Bot routine recipe: refresh every 15 minutes (cron `*/15 * * * *`, America/Chicago)

Paste the block below as the routine's instructions. It does NOT use ReadTranscript (routines can't). Teammates log to the Notion "Office Activity Log"; the routine only reads Notion. Its only writes are the Grok Bot Page, the repo on the box, and a git push to ultra-madness/team-office. No secrets are stored in the repo (git push uses the box's existing `gh auth setup-git` credential helper).

```
Refresh the Team Office (Page canvas 11d32928-8e3f-454c-8255-f879e376ff9d and https://ultra-madness.github.io/team-office/).
Read only in Notion: never create, edit or delete Notion rows. Do not message teammates.
1. Activity log (Office Activity Log, https://app.notion.com/p/72b19dec8076412faa7b58ef97b4e6e6,
   data source collection://8f08c8f3-1377-46ff-841d-ad9e607b3f4d): CallDynamicTool user-Notion notion-query-data-sources,
   write_to_file true, arguments
   {"data":{"mode":"view","view_url":"view://40920ecf-0b0f-8137-b99a-000c631a55ad","page_size":100}}
   Rows come newest first. "When" is returned in UTC (…Z): convert to America/Chicago ISO with -05:00 (CDT -05:00 / CST -06:00).
2. Team Board: same tool, write_to_file true,
   {"data":{"mode":"view","view_url":"view://d9555fd5-abad-49d1-aff3-695cd51d0b2b","page_size":100}}
   Map rows to BOARD.cards (title, status, role).
2b. Decision Log (https://app.notion.com/p/ce1dfdaa5b8142d98112cfc1a16a7c52): same tool, write_to_file true,
   {"data":{"mode":"view","view_url":"view://caa9c993-974a-44d7-b867-bfdf20f7ef5f","page_size":100}}
   DECISIONS.open = rows with Decider "Stakeholder/Sponsor" AND Status "Proposed" -> { title: Decision, date: Date start, url, why: Rationale (<=80 chars) }.
   DECISIONS.recent = newest 5 rows with Decider "Stakeholder/Sponsor" AND Status "Decided" -> { title, date, url }.
   Never invent rows. If this query fails, leave DECISIONS unchanged except asOf.
3. Merge. Names to keys: Pym=pm Roma=po Anj=sm Bruce=ds Dez=dev Kourt=qa Michael=gb Team=team.
   - Message rows newer than the newest `time:` already in MESSAGES (skip any with same time+from+to+topic):
     append { time, from, to, topic: Title } (To blank -> "team").
   - Status rows: for each person take only their newest Status row; set OFFICE.team[key].status from Status
     (Working=engaged, Idle=idle, Blocked=blocked, Paused=paused, Waiting=waiting), "now" = Detail,
     "last active" = its When in CT.
4. One EditCanvas on canvas 11d32928-8e3f-454c-8255-f879e376ff9d: the new MESSAGES, statuses, BOARD.cards, the whole
   DECISIONS block (replace from `const DECISIONS = {` through its closing `};`, set DECISIONS.asOf), and
   BOARD.asOf + OFFICE.asOf = "Thu Mon D, YYYY, H:MM PM CT", OFFICE.updated = "H:MM PM CT", OFFICE.asOfIso = ISO with CT offset.
   FALLBACK: if the log has no new rows, still apply the Team Board and these four time fields.
5. ReadCanvas (write_to_file true) and save the source (from the `import` line through the last line before the closing fence)
   to /workspace/team-office/canvas.tsx
6. Shell:
   cd /workspace/team-office-repo && npm run sync -- /workspace/team-office/canvas.tsx && npm run build \
     && git add public/data.json src/office.tsx && git commit -m "Refresh $(date '+%Y-%m-%d %H:%M %Z')" && git push
   (if push fails with auth: gh auth setup-git, then push once more; if nothing changed, skip commit)
7. Verify: gh run list -R ultra-madness/team-office -L 1, then gh run watch <id> --exit-status;
   curl -s "https://ultra-madness.github.io/team-office/data.json?t=$(date +%s)" | grep -o '"updated": *"[^"]*"'
   must show the new time. Report only what you saw; if any step fails, retry once, then stop and report.
```

The site refetches data.json every 30 s (src/main.tsx) and shows "Last updated H:MM PM CT · N min ago", so a pushed refresh appears without reloading.

## Oct 30, 11 PM CT: command-center panels (src/Dashboard.tsx, repo only)
- The site now shows, above the office scene: goal + progress bars (Project 1 and each "Sprint N" from BOARD.cards), a Team list
  (status from OFFICE.team, tap = popup with only that person's sent messages), a "Waiting on Michael" queue from DECISIONS.open,
  and a Live activity feed (newest 20 MESSAGES). Dashboard.tsx is hand-written and NOT generated by sync; sync only rewrites
  src/office.tsx and public/data.json, so refreshes never overwrite it.
- data.json gains a DECISIONS key (sync exports it; if the canvas has no DECISIONS block it exports {open:[],recent:[]}).
- Approve / Done / Keep open buttons save only in the viewer's browser (localStorage key team-office-decisions-v1). Nothing writes to Notion.
- Convention for teammates: to put something in Michael's queue, add a Decision Log row with Decider = Stakeholder/Sponsor,
  Status = Proposed, Date, a one-line Decision (the question) and Rationale (why it is needed / the default if no answer).
  When Michael answers, Pym sets Status = Decided (it then drops out of the queue and shows under recent decisions).
- PROJECT.sprint / sprintGoal / phase / stepNote / waitingOnMichael still need a manual edit when a sprint changes (not in the routine).

## Oct 30, late: visual command center
- src/Command.tsx (hand-written, repo-only) now renders the page: code-drawn SVG animal/robot office, gauges, decision cards, quest, live log. It reads only data.json, so the refresh recipe is unchanged.
- The old generated office (src/office.tsx from the canvas) is still built and sits behind "Show full details". Do not edit Command.tsx from sync.

## Oct 31, 12 AM CT: dashboard cleanup
- Command.tsx layout: header (rings, quest/XP/updated chips, switches, ☰), office scene (characters now walk to a teammate's desk carrying an envelope, replaying recent messages), Waiting on Michael cards + team roster, Live feed. The old full/classic view moved into the ☰ drawer. Build/deploy steps unchanged.
