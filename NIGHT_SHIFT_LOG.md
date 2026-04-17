# Night Shift Log — 2026-04-17 Plan + SOTA Mission

**Branch:** `feat/night-shift-2026-04-17-plan-sota`
**Spec:** `NIGHT_SHIFT_THESIS_PREP_SPEC.md`
**Mission:** 15-week study plan + Plan tab + SOTA content + weekly research loop + morning briefing

---

## Architecture

```
thesis-study-plan/
├── study-plan/               (NEW — session JSON + plan docs)
│   ├── sessions.json         (75 sessions, 2h blocks, weekdays 04-20 → 08-01)
│   ├── plan.md
│   └── README.md
├── plan.js                   (NEW — Plan tab renderer)
├── plan.css                  (NEW — grid + modal styles)
├── print.css                 (NEW — per-session A4 print sheet)
├── sota-ch21.js              (NEW — SOTA anon creds)
├── sota-ch22.js              (NEW — SOTA conf TX)
├── sota-ch23.js              (NEW — SOTA TEE)
├── sota-ch24.js              (NEW — SOTA priv payments)
├── sota-ch25.js              (NEW — SOTA ZK proof systems)
├── sota-ch26.js              (NEW — SOTA MPC/FHE advanced)
├── sota-rust.js              (NEW — SOTA Rust crypto libs)
├── sota-renderer.js          (NEW — renders SOTA cards in chapter tabs)
├── research-log/             (NEW — daily research entries)
│   ├── README.md
│   ├── TEMPLATE.md
│   └── 2026-04-17.md         (seed entry)
├── research-queue.md         (NEW — prioritized SOTA topics)
├── scripts/
│   └── weekly-update.sh      (NEW — weekly integration script)
├── index.html                (EDIT — add Plan nav + section)
├── app.js                    (EDIT — Plan tab + P/N shortcuts + dual Pomodoro)
├── search.js                 (EDIT — index SOTA + sessions)
├── style.css                 (EDIT — readingMinutes badge + What's new badge)
└── paper-guide.js            (EDIT — prerequisite links)

~/.claude/skills/morning-thesis-addon/
└── skill.md                  (NEW — morning briefing addon)
```

## Task dependency graph

```
Group A (parallel, no deps):        T1, T2, T3, T4, T5, T6, T7, T8, T15
Group B (parallel, depends on T1):  T9, T10
Group C (sequential, after B):      T11 (needs T9+T10)
                                    T12 (needs T2-T8)
Group D (parallel, after T11):      T13, T14, T16 (needs T15), T17 (needs T15)
Group E (final):                    T18 (needs all above)
```

## Phase breakdown (study plan)

| Phase | Weeks         | Sessions | Focus                                    |
|-------|---------------|----------|------------------------------------------|
| P1    | W01-03 (1-15) | 15       | Ch 2.1 Anon creds + BBS+/PS + Rust refresh |
| P2    | W04-05 (16-25)| 10       | Ch 2.2 Conf TX + Pedersen + Bulletproofs++ |
| P3    | W06-07 (26-35)| 10       | Ch 2.3 TEE + attestation + side channels |
| P4    | W08-09 (36-45)| 10       | Ch 2.4 Priv payments (Zcash, Penumbra)   |
| P5    | W10-11 (46-55)| 10       | Ch 2.5 ZK proof systems + folding        |
| P6    | W12   (56-60) | 5        | Ch 2.6 MPC/FHE advanced                  |
| P7    | W13-14 (61-70)| 10       | Rust impl (utt-rs deep read + own PoC)   |
| P8    | W15   (71-75) | 5        | Synthesis + thesis proposal prep         |

**Window:** 2026-04-20 (Mon) → 2026-08-01 (Fri), weekdays only, 2h/session.

---

## Decisions

### 2026-04-17 · Phase allocation
- Anon creds gets 3 weeks (core thesis topic)
- Rust implementation as P7 (late), so utt-rs knowledge is fresh for September onboarding
- Synthesis week reserved for thesis-subject proposal drafting

### 2026-04-17 · SOTA separation
- SOTA content in `sota-*.js` rather than merged into existing `ch*-papers-*.js` → allows weekly regeneration without touching stable content
- `sota-renderer.js` centralizes rendering so each chapter tab pulls its SOTA additions

### 2026-04-17 · Research log flow
- Daily entries at `research-log/YYYY-MM-DD.md`
- Weekly digest (Sunday) runs `scripts/weekly-update.sh` → pulls log entries, appends to SOTA files, commits + pushes
- Morning briefing reads last 7 days + today's session + 1 queued SOTA topic

---

## Iteration history

### Iteration 0 — Init (2026-04-17 16:45)
- Archived previous night-shift (paper-cards mission) under `.night-shift-archive/2026-04-14-paper-cards/`
- Branch `feat/night-shift-2026-04-17-plan-sota` created from `main`
- State + error + problems + log files initialized
- 18 tasks planned across 5 dependency groups

### Iteration 7 — T20 diagram upgrade + T18 QA in flight (2026-04-17)
- User clarified: rich diagrams belong in **work product**, not Claude instructions (reverts CLAUDE.md / skill Mermaid changes; memory file `feedback_ascii_diagrams.md` rewritten).
- T20 (new, site work product): Mermaid 10.9 CDN added in `index.html`. `zk-deepdive.js` now detects `{ type: 'mermaid', src }` and renders SVG via `mermaid.render()`, with ASCII `<pre>` fallback on error. First section in `zk-deepdive-data.js` ("Traditional ID vs ZK Proof") converted to `flowchart LR` to showcase. Dark theme aligned with site palette.
- T18 Puppeteer QA still running in background (agent `ae287cad`). Early findings: flashcard counter shows `0/0`, Got it/Retry buttons cut off at viewport bottom. Will address in a follow-up night-fixer pass after T18 report lands.
- Commit: `bb336f3 feat(zk-deepdive): render Mermaid diagrams alongside ASCII fallback`.
