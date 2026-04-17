# Research Log

Weekly SOTA research loop for the master thesis study plan.

## Purpose

Capture new findings (papers, talks, CVEs, blog posts) encountered during the
150h study plan, so they are not lost and eventually land in the site content.

## Flow

```
 daily study session                                   weekly update (Sunday)
┌──────────────────────┐    ┌───────────────────┐    ┌────────────────────────┐
│ research-log/        │ ─► │ research-queue.md │ ─► │ ch*-papers-*.js        │
│   YYYY-MM-DD.md      │    │ (prioritized)     │    │ sota-*.js              │
│ (what I found today) │    │                   │    │ (site content update)  │
└──────────────────────┘    └───────────────────┘    └────────────────────────┘
```

1. **Daily entry** — at the end of each 2h study session (see plan §1), log
   discoveries in `research-log/YYYY-MM-DD.md` using `TEMPLATE.md`.
2. **Queue promotion** — items flagged `core` or `related` get added to
   `research-queue.md` with a priority tag (P0 / P1 / P2).
3. **Weekly digest** — every Sunday, `scripts/weekly-update.sh` reads the last
   7 days of logs, picks all P0 items, appends them to the relevant
   `ch*-papers-guide.js` / `sota-*.js` data files, regenerates the search
   index, commits, and pushes to main (Vercel redeploys).
4. **Morning briefing** — the Jarvis morning flow pulls the latest 3 items
   from the most recent logs to surface in the thesis digest.

## File layout

```
research-log/
  README.md          ← this file
  TEMPLATE.md        ← scaffold copied for each new day
  YYYY-MM-DD.md      ← daily entries (one per study day)
research-queue.md    ← prioritized backlog, promoted -> site content
```

## Authoring rules

- One daily file per study day (weekdays only — matches the 15-week plan).
- Entries in English, present tense, one bullet per idea.
- Always include a source URL; papers use IACR ePrint or arXiv IDs.
- `Relevance` classifies weight: `core` (directly cited in thesis),
  `related` (background), `context` (nice to know).
- `Target chapter` maps to the site tab: `ch21`, `ch22`, `ch23`, `ch24`,
  `ch25`, `ch26`, or `rust`.
- Mark `[ ]` (unread) / `[x]` (read) next to paper IDs.

## Commands

- `update the site with this content` — appends the current conversation's
  findings to `research-queue.md` (handled by Claude).
- `run weekly thesis update` — executes `scripts/weekly-update.sh`.

## See also

- `NIGHT_SHIFT_THESIS_PREP_SPEC.md` §4 — morning briefing integration spec
- `study-plan/sessions.json` — 75 planned study sessions
- `research-queue.md` — current SOTA backlog
