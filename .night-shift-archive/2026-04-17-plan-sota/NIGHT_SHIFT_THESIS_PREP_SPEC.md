# Night Shift Mission — Thesis Prep Study Plan + Site Upgrades

**Created:** 2026-04-17
**Target completion:** overnight run; deliverables pushed to `main` and deployed on Vercel
**Mission:** Turn `thesis-study-plan` into a full 15-week study program with SOTA content and a weekly research loop.

---

## 1 · Study Plan (15 weeks × 5 weekdays × 2h = 75 sessions, 150h)

**Window:** 2026-04-20 (Mon) → 2026-08-01 (Fri). Master thesis starts 2026-09-07 at Mysten Labs — the 5-week gap between Aug 1 and Sept 7 is review + Mysten onboarding.

**Cadence:** weekdays only, 2h blocks, Sat/Sun off. User already did EPFL semester — this is *consolidation and depth*, not first-contact learning.

### Phase breakdown

| Phase | Weeks | Sessions | Hours | Focus                                                              |
|-------|-------|----------|-------|--------------------------------------------------------------------|
| P1    | 1-3   | 15       | 30    | Ch 2.1 Anonymous Credentials + BBS+/PS sigs + Rust crypto refresher |
| P2    | 4-5   | 10       | 20    | Ch 2.2 Confidential Transactions + Pedersen + Bulletproofs++       |
| P3    | 6-7   | 10       | 20    | Ch 2.3 TEE (SGX/TDX/Nitro) + attestation + side channels           |
| P4    | 8-9   | 10       | 20    | Ch 2.4 Private Payments (Zcash, Monero, Penumbra, Mimblewimble)    |
| P5    | 10-11 | 10       | 20    | Ch 2.5 ZK Proof Systems (Groth16, Plonk, Nova/folding, STARK)      |
| P6    | 12    | 5        | 10    | Ch 2.6 Advanced (MPC, FHE, threshold crypto)                       |
| P7    | 13-14 | 10       | 20    | Rust implementation track (utt-rs read + own PoC)                  |
| P8    | 15    | 5        | 10    | Synthesis + thesis subject proposal prep                           |

### Per-session structure (2h block)
- **0:00–0:10** — Warm-up: re-read previous session notes, check lexicon entries
- **0:10–1:10** — Primary learning: paper reading OR deep dive OR Rust coding
- **1:10–1:25** — Exercises/problems (proof reconstruction, implementation, design questions)
- **1:25–1:45** — Deep dive on 1 specific sub-topic (SOTA addendum)
- **1:45–2:00** — Log to `research-log.md` + flashcard/summary + next session prep

### Deliverable
- `study-plan/sessions.json` — 75 session objects: `{id, date, phase, chapter, title, objectives[], materials[], paper_refs[], exercises[], sota_notes, duration_min}`
- `study-plan/plan.md` — human-readable overview with week-by-week schedule
- `study-plan/README.md` — how to use the plan

---

## 2 · Site Upgrades (add a "Plan" tab + UX heuristics)

### New Plan tab
- Nav button `Plan` between `Method` and search
- Renders `study-plan/sessions.json`
- Week grid: 15 columns × 5 rows, each cell = 1 session, color-coded by chapter
- Click cell → detail modal: objectives, materials, paper links, exercises
- Session completion checkbox (localStorage: `plan:session:<id>`)
- Top bar: overall progress %, this-week progress %, streak counter
- Deep-link: `?session=<id>` opens directly to a session detail

### UX heuristics to implement across the site
1. **Prerequisite graph** — when opening a paper/concept, show "you should already know: [links]"
2. **Estimated time per topic** — add `readingMinutes` to every study card
3. **Smart search** — boost recent results, show chapter and phase alongside
4. **Weekly review modal** — Fridays auto-open a 10-min review checklist
5. **Print stylesheet** — `?print=session-<id>` renders a clean A4 sheet for offline study
6. **Keyboard shortcuts** extension — `P` opens Plan tab, `N` jumps to next uncompleted session
7. **"What's new" badge** — highlights content added in the last 7 days (from weekly research log)
8. **Daily 2h timer** — dedicated Plan-tab Pomodoro preset (50/10/50/10) vs existing 25/5

### Files to modify
- `index.html` — new Plan section + nav button
- `app.js` — Plan rendering, localStorage keys, completion tracking, shortcuts
- `plan.js` (new) — loads `sessions.json`, renders grid, handles modals
- `plan.css` (new) — grid layout, color coding, modal styling
- `search.js` — index sessions for search

---

## 3 · SOTA Technical Content Injection

Research and add missing up-to-date content (2024–2026) to each chapter. For each topic below, add a new `sota-<chapter>.js` data file with: paper list (BibTeX-ready), 2-paragraph recap, math highlight, "why it matters for thesis" note.

### Ch 2.1 Anonymous Credentials / BBS+
- BBS+ (RFC draft `draft-irtf-cfrg-bbs-signatures`) — current state
- PS rerandomizable signatures refinements (2024-2025 IACR papers)
- zk-creds, Microsoft's PrivacyPass latest
- Threshold BBS+ (IACR 2023/602 and follow-ups)

### Ch 2.2 Confidential Transactions
- Bulletproofs++ (latest IACR version)
- Flashproofs (IEEE S&P 2022 → 2024 refinements)
- Binius / small-field proofs for range proofs
- ElGamal-based veiled transactions (Aptos, 2024 update)

### Ch 2.3 TEE
- Intel TDX production deployments 2025
- NVIDIA H100/H200 confidential computing + remote attestation
- AWS Nitro Enclaves v2 + KMS integration
- Mysten Seal architecture (Sui-native TEE)
- Recent side-channel attacks (Downfall, Inception, 2024 CVEs)

### Ch 2.4 Private Payments
- Penumbra mainnet analysis (2024-2025 updates)
- Aztec Connect sunset + Aztec 3.0 (Noir + client-side proving)
- Namada multichain private transfers
- Railway / Silent Payments for Bitcoin

### Ch 2.5 ZK Proof Systems
- Nova + SuperNova + HyperNova + ProtoStar (folding schemes landscape)
- Plonky3 production release
- Binius (binary field arithmetization)
- Halo2 vs PSE fork divergence
- Ligero/Brakedown in 2025
- GKR revival (Sumcheck-based systems)

### Ch 2.6 Advanced
- Threshold FHE (OpenFHE 2025, Zama Concrete)
- Silent MPC protocols (Pianissimo, 2024)
- PSI latest (Apple's PSI, 2024 improvements)

### Rust track additions
- `arkworks` 2025 major version changes
- `halo2_proofs` and `plonky3` idioms
- `nova-snark` + `Sonobe` integration patterns
- Async crypto patterns for Sui Move FFI

---

## 4 · Morning Briefing Integration

### New daily flow
Add to `~/.claude/skills/` or similar: when user says "good morning"/"jarvis", after the existing briefing include a **"Thesis Research Digest"** section:
- Pull latest 3 items from `research-log/YYYY-MM-DD.md` files (last 7 days)
- Show today's planned session from `study-plan/sessions.json`
- One SOTA paper recommendation (rotating from `research-queue.md`)

### Files to create
- `~/projects/thesis/thesis-study-plan/research-log/` — directory
- `~/projects/thesis/thesis-study-plan/research-log/YYYY-MM-DD.md` — daily auto-generated log (stub template)
- `~/projects/thesis/thesis-study-plan/research-queue.md` — prioritized list of SOTA topics not yet integrated
- `~/.claude/skills/morning-briefing/` — update to include thesis digest (OR a new `morning-thesis-addon.md` loaded by existing briefing)

### Weekly update loop (every Sunday)
- Script: `scripts/weekly-update.sh`
- Steps:
  1. Read `research-log/` entries from the last 7 days
  2. Extract new findings, paper links, SOTA updates
  3. Append to relevant `ch*-papers-guide.js` / `sota-*.js` files
  4. Regenerate search index
  5. Auto-commit: `chore(weekly): integrate research log 2026-MM-DD`
  6. Push to main → Vercel redeploys
- Trigger: manual (user runs it) OR cron via `/schedule` skill (Sunday 20:00)

### User-facing commands
- When user says **"update the site with this content"**, read current conversation for research findings, append to `research-queue.md` with timestamp, commit.
- When user says **"run weekly thesis update"**, execute `scripts/weekly-update.sh`.

---

## 5 · Acceptance Criteria

Work is done when:
- [ ] `study-plan/sessions.json` contains 75 valid session objects covering 2026-04-20 → 2026-08-01
- [ ] `study-plan/plan.md` + `study-plan/README.md` exist and are readable
- [ ] Plan tab is live at `https://thesis-study-plan.vercel.app` with working grid, modals, completion tracking
- [ ] At least 8 SOTA data files exist (`sota-ch21.js` through `sota-advanced.js`) with 2024-2026 references
- [ ] `research-log/` directory exists with at least a template and today's entry
- [ ] `research-queue.md` exists with seeded SOTA topics
- [ ] `scripts/weekly-update.sh` is executable and documented in `README.md`
- [ ] Morning briefing integration: either new skill or addon file in `~/.claude/skills/`
- [ ] All 8 UX heuristics from §2 are either implemented or stubbed with clear TODOs
- [ ] Vercel prod deployment shows the new Plan tab and new content
- [ ] No regressions: existing chapter tabs, search, Pomodoro, progress all still work
- [ ] Commit history is clean: conventional commits, no `Claude`/`AI` mentions
- [ ] PR-per-phase workflow OK (may need 2-4 PRs to stay reviewable)

---

## 6 · Execution guidance for agents

- **Isolation:** each `night-coder` agent works in a separate worktree under `.claude/worktrees/`
- **Parallelism:** content files (sessions.json, SOTA data files) can be generated in parallel; site upgrades must be integrated sequentially to avoid merge conflicts in `index.html` / `app.js`
- **Thinking mode:** high for SOTA research and session planning; moderate for implementation
- **Models:** Opus for content/research, Haiku for mechanical file edits
- **Web research:** allowed and expected for SOTA papers — use WebSearch / Context7 / arxiv MCP tools
- **Testing:** open `index.html` in Puppeteer, verify Plan tab renders, modals open, completion persists. No unit tests needed for data files.
- **Commit rules:** conventional commits, scope by feature, no `Co-Authored-By: Claude`
- **Safe to push to main** if CI green and site loads; otherwise open a PR

**QA loop:** after each major milestone, spawn `night-qa` to navigate the deployed preview URL and verify Plan tab UX.
