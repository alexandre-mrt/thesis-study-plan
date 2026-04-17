# Study Plan — How to Use

15-week master thesis prep plan covering anonymous credentials, confidential transactions, TEE, private payments, ZK proof systems, MPC/FHE, and a Rust PoC.

**Window:** 2026-04-20 (Mon) → 2026-07-31 (Fri). 75 sessions × 120 min = 150 h.
**Gap before thesis:** 2026-08-01 → 2026-09-06 is review + Mysten Labs onboarding.
**Thesis start:** 2026-09-07 at Mysten Labs.

## Files

| File            | Purpose                                                    |
|-----------------|------------------------------------------------------------|
| `sessions.json` | Source of truth. 75 session objects. Rendered by Plan tab. |
| `plan.md`       | Human-readable schedule, one table per phase.              |
| `README.md`     | This file.                                                 |
| `_build_sessions.py` | Regenerates `sessions.json`. Edit here first, then run. |

## What is a session?

A session object (`sessions.json`) looks like:

```json
{
  "id": "S04",
  "date": "2026-04-23",
  "weekday": "Thu",
  "week": 1,
  "phase": "P1",
  "chapter": "ch21",
  "title": "BBS+ signatures: core construction",
  "objectives": ["Understand EUF-CMA security", "..."],
  "materials": [
    {"type": "paper", "ref": "Tessaro-Zhu — Revisiting BBS Signatures", "time_min": 60},
    {"type": "video", "ref": "Dan Boneh pairing lecture", "time_min": 25}
  ],
  "paper_refs": ["tessaro-zhu-bbs-2023"],
  "exercises": ["Derive the verification equation from scratch", "..."],
  "sota_note": "Track draft-irtf-cfrg-bbs-signatures latest rev.",
  "duration_min": 120
}
```

### Fields

- **id** — unique `S01`..`S75`.
- **date** — ISO date, always a weekday between 2026-04-20 and 2026-07-31.
- **weekday** — `Mon..Fri`, denormalised for the UI.
- **week** — 1..15.
- **phase** — `P1..P8` (see `plan.md`).
- **chapter** — one of `ch21`, `ch22`, `ch23`, `ch24`, `ch25`, `ch26`, `rust`, `synthesis`. Controls Plan-tab color.
- **title** — crisp, < 60 chars.
- **objectives** — 3-5 learning goals.
- **materials** — 2-4 items. `type ∈ {paper, video, doc, code, notes, writing, exercise}`. `time_min` sums to ≤ 120.
- **paper_refs** — slugs that map to paper cards in `ch*-papers-guide.js`. May be empty for Rust/synthesis days.
- **exercises** — 2-4 concrete deliverables (proof, code, memo, diagram).
- **sota_note** — one-line pointer to follow for the 20-min SOTA addendum (web-searchable).
- **duration_min** — always 120.

## Weekly rhythm

- **Mon-Fri:** one 2 h block (see session structure below).
- **Fri afternoon:** short review checklist (see spec §2 — UX heuristics #4).
- **Sat-Sun:** off. Let things settle.

### 2 h session structure

```
0:00-0:10  Warm-up     : re-read previous session notes + lexicon entries
0:10-1:10  Primary     : paper reading OR deep dive OR Rust coding
1:10-1:25  Exercises   : proof reconstruction / implementation / design
1:25-1:45  SOTA addon  : follow the `sota_note` for 20 min
1:45-2:00  Logging     : research-log + flashcards + next session prep
```

## Marking sessions done

The Plan tab (site) writes to `localStorage` using keys like `plan:session:S04 = "done"`.
Completion is client-side only; there is no backend. Export via browser dev tools if needed.

For a manual/offline workflow:

```bash
echo 'S04 done' >> study-plan/.done.log
```

(The site does not read `.done.log`; this is just a personal fallback.)

## Regenerating the plan

Edit `_build_sessions.py` (single source of truth for session bodies), then:

```bash
cd study-plan
python3 _build_sessions.py
python3 -m json.tool < sessions.json > /dev/null   # validate
```

The script asserts `len(SESSIONS) == 75` and `len(weekdays) == 75` so a mismatch fails loud.

## Phase overview

| Phase | Weeks   | Sessions | Focus                                                       |
|-------|---------|----------|-------------------------------------------------------------|
| P1    | W01-03  | 15       | Ch 2.1 Anonymous Credentials + BBS+/PS + Rust crypto refresh |
| P2    | W04-05  | 10       | Ch 2.2 Confidential Transactions + Pedersen + Bulletproofs++ |
| P3    | W06-07  | 10       | Ch 2.3 TEE + attestation + side channels                    |
| P4    | W08-09  | 10       | Ch 2.4 Private Payments (Zcash / Monero / Penumbra / Namada) |
| P5    | W10-11  | 10       | Ch 2.5 ZK Proof Systems + folding                           |
| P6    | W12     | 5        | Ch 2.6 MPC / FHE advanced                                   |
| P7    | W13-14  | 10       | Rust impl: utt-rs deep dive + credential-coin PoC           |
| P8    | W15     | 5        | Synthesis + thesis proposal packet                          |

See `plan.md` for the full per-session schedule.

## Output artefacts expected by the end

- `research-log/YYYY-MM-DD.md` for every working day (75 files).
- 8 design memos (one per phase, plus two PoC memos in P7).
- `credential-coin` Rust crate v0.1.0 with CI green.
- Thesis proposal v1 + threat model + experiment plan (P8).
- Slide deck outline + advisor packet (P8 final session).
