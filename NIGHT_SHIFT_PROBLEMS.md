# Night Shift Problems — 2026-04-17 Plan + SOTA Mission

User reads this first in the morning. Any ambiguity, blocker, or uncertainty goes here.

Categories: UNCERTAINTY · ASSUMPTION · BLOCKED · UNFIXED · TEST GAP · DEPENDENCY

---

### ASSUMPTION: today CSS class name discrepancy (T9 — plan.js)
- **Iteration**: 1
- **File**: plan.js (renderCell), plan.css:373
- **What I needed**: Task spec says class `plan-session--today`, but plan.css (T10) defines `.plan-cell.today`
- **What I did**: Used `.today` (matches actual plan.css). The spec's `plan-session--today` appears to be a draft name that T10 changed. Current impl is correct against the actual CSS.
- **Confidence**: HIGH
- **User action needed**: None unless T11 changes the CSS class — verify `.plan-cell.today` is still the right selector.

### ASSUMPTION: synthesis chapter CSS tint (T9 — plan.js)
- **Iteration**: 1
- **File**: plan.js:21 (CHAPTER_DATA_ATTR), plan.css:392-398
- **What I needed**: A `data-chapter="synthesis"` CSS rule in plan.css
- **What I did**: plan.css has no rule for synthesis. Mapped `synthesis` -> `ch26` (purple) as fallback.
- **Confidence**: MEDIUM
- **User action needed**: Add `.plan-cell[data-chapter="synthesis"] { --chapter-color: var(--color-ch25); }` (or any color) to plan.css if synthesis sessions need a distinct tint.

### UNCERTAINTY: Sui Confidential Transactions design doc not yet published
- **Iteration**: 1
- **File**: ch26-papers-guide.js, ch26-papers-technical.js
- **What I needed**: The actual Mysten Labs design document for Sui confidential transactions
- **What I did**: Based the technical content on (a) UTT paper which Mysten co-authored,
  (b) Aptos Confidential Asset design (similar architecture), and (c) Mysten Labs
  public communications. Marked with NIGHT-SHIFT-REVIEW in ch26-papers-technical.js
  formalDefinition block for the Sui Confidential Transactions paper.
- **Confidence**: MEDIUM
- **User action needed**: When the Mysten Labs design doc is published, update
  ch26-papers-guide.js (venue field currently "TBD") and ch26-papers-technical.js
  (formalDefinition and mathDetails for Sui Confidential Transactions paper).

## Template for entries
```
### <CATEGORY>: <short title>
- **Iteration**: N
- **File**: <path:line>
- **What I needed**: <missing info>
- **What I did**: <decision or skip>
- **Confidence**: LOW / MEDIUM
- **User action needed**: <specific ask>
```

---

## Open issues

### ASSUMPTION: ch26 color not defined in style.css
- **Iteration**: 1
- **File**: paper-guide.js:19
- **What I needed**: A `--color-ch26` CSS variable for Chapter 2.6 (Sui Primitives)
- **What I did**: Used `#8B5CF6` (purple) as hardcoded fallback in CHAPTER_COLORS. Marked with `NIGHT-SHIFT-REVIEW` comment.
- **Confidence**: MEDIUM
- **User action needed**: Add `--color-ch26` to `:root` in style.css when Ch 2.6 tab is added to index.html, then replace the hardcoded fallback with `var(--color-ch26)`.

### ASSUMPTION: T12 — SOTA render on initial page load (no saved day)
- **Iteration**: 1
- **File**: app.js (DOMContentLoaded handler)
- **What I needed**: Reliable detection of which chapter is initially visible when no localStorage state exists (default is ch21 via `class="day-section active"` in HTML)
- **What I did**: After `restoreActiveDay()`, query `.day-section.active` to find the current active chapter and call `SOTA.renderChapter` for it if not already rendered. This covers both the default-active case and the case where `restoreActiveDay` called `switchDay` (which also triggers SOTA render via the `sotaRendered` cache guard).
- **Confidence**: HIGH
- **User action needed**: None expected; verify first-load behavior in browser.

### ASSUMPTION: T12 — KaTeX math rendering in SOTA cards
- **Iteration**: 1
- **File**: sota-renderer.js (renderSotaCardMath)
- **What I needed**: Confirm `renderMathInElement` is globally available when SOTA cards expand
- **What I did**: Deferred math rendering to card open event. Used `waitForKaTeX` (from study-guide.js) when available, otherwise polled directly. KaTeX is loaded via defer in index.html so it may not be ready at DOMContentLoaded; the on-expand trigger ensures it is loaded.
- **Confidence**: HIGH
- **User action needed**: None; same pattern as paper-guide.js.

### DEPENDENCY: app.js CHAPTER_KEYS not updated for Ch 2.6 keyboard shortcut
- **Iteration**: 1
- **File**: app.js:13 (CHAPTER_KEYS array), app.js:476 (case '6' handler)
- **What I needed**: app.js to include 'ch26' in CHAPTER_KEYS and add a case '7' handler so keyboard shortcut 6 maps to Ch 2.6 and 7 maps to Rust.
- **What I did**: Scope was index.html only. Left app.js untouched. The hint in index.html still shows `1-6` which is accurate for the current app.js behavior (keys 1-6 map to ch21-ch25 + rust, bypassing ch26).
- **Confidence**: HIGH
- **User action needed**: Update app.js — add 'ch26' at index 5 in CHAPTER_KEYS (before 'rust'), add `case '7': switchDay(CHAPTER_KEYS[6]); break;`, and update the shortcuts hint in index.html from `<kbd>1</kbd>-<kbd>6</kbd>` to `<kbd>1</kbd>-<kbd>7</kbd>`.

### UNCERTAINTY: SOTA Ch26 link verification (T7)
- **Iteration**: 1
- **File**: sota-ch26.js
- **What I needed**: Live verification of each link
- **What I did**: Used well-established canonical URLs (openfhe.org, github.com/zama-ai/tfhe-rs, github.com/microsoft/SEAL, github.com/data61/MP-SPDZ, rfc-editor.org/rfc/rfc9591, microsoft.github.io/Picnic, security.apple.com/blog/contact-key-verification, eprint.iacr.org canonical paper IDs). The specific ePrint IDs for Pianissimo (2024/429), Silent-OT update (2024/1079), DKLs (2023/765), Groth DKG (2021/005), PVSS (2021/339) are based on prior knowledge and may need a manual check.
- **Confidence**: MEDIUM
- **User action needed**: Spot-check ePrint IDs before pushing to prod site.

### ASSUMPTION: study plan end date is Fri 2026-07-31 (not Sat 2026-08-01)
- **Iteration**: 1 (T1 plan)
- **File**: study-plan/sessions.json
- **What I needed**: Clarify end date — the spec said "ends Fri 2026-08-01", but 2026-08-01 is a Saturday.
- **What I did**: Stopped at the last weekday before 2026-08-01 inclusive, i.e. Fri 2026-07-31. That yields exactly 75 weekdays starting 2026-04-20 → 15 weeks × 5 weekdays, matching the session count.
- **Confidence**: HIGH
- **User action needed**: Confirm — the 75-session arithmetic only works with 2026-07-31 as the final session; 2026-08-01 would need 76 sessions or a weekend entry.

### ASSUMPTION: Ch 2.4 SOTA date/status claims (T5)
- **Iteration**: 1
- **File**: sota-ch24.js
- **What I needed**: live confirmation of 2025-2026 project statuses
- **What I did**: Wrote 12 entries with architecture/math claims at HIGH confidence; status dates at MEDIUM. All 12 `link:` URLs HTTP-200 verified (curl -L). Dates to spot-check before citing in thesis:
  - Penumbra mainnet 2024-07-30 (used project root link, not specific blog post which 404'd)
  - Namada "shielded rewards" live 2024-12 (used MASP circuits blog post as link)
  - Bitcoin Core PR numbers (#28122, #30108) for BIP 352 scanning — best-effort recall
  - Monero FCMP++ "targeted for 2026 hard fork" — community target, not scheduled
  - Roman Storm conviction/sentencing claims — reflect public reporting
  - Solana Confidential Mint / Balances 2025 dates — based on solana-program.com docs URL
- **Confidence**: MEDIUM on dates, HIGH on architecture/math/links
- **User action needed**: Spot-check the 2-3 most recent dates before citing in thesis chapter

### UNCERTAINTY: Flashproofs — no IACR ePrint version found (T3)
- **Iteration**: 1 (Ch 2.2 SOTA task T3)
- **File**: sota-ch22.js
- **What I needed**: authoritative paper link for Flashproofs
- **What I did**: Cited as "Flashproofs: Efficient Zero-Knowledge Arguments of Range and Polynomial Evaluation" by Nan Wang and Sid Chi-Kin Chau, IEEE S&P 2022. Used IEEE CSDL URL `https://www.computer.org/csdl/proceedings-article/sp/2022/131600b376/1CIO7rGr0nS` (HTTP 200) as link. Also tested IEEE DOI `https://doi.ieeecomputersociety.org/10.1109/SP46214.2022.9833723` which resolves. Could not find an IACR ePrint ID via fuzzy probing (2022/1154, 2022/1251, 2022/1268, 2022/1399, 2022/1593 all unrelated).
- **Confidence**: MEDIUM (venue/authors from prior knowledge; URL resolves but IEEE CSDL is SPA so title not verifiable via curl)
- **User action needed**: If you need strict provenance, manually open the CSDL link and confirm title/authors.

### ASSUMPTION: Seraphis / Jamtis cited as community specs (T3)
- **Iteration**: 1 (Ch 2.2 SOTA task T3)
- **File**: sota-ch22.js
- **What I needed**: stable academic URLs for Seraphis and Jamtis
- **What I did**: Seraphis points to koe's GitHub repo `https://github.com/UkoeHB/Seraphis` (the canonical spec draft). Jamtis points to tevador's gist `https://gist.github.com/tevador/50160d160d24cfc6c52ae02eb3d17024` (canonical proposal). Both HTTP 200 verified. Neither has a formal paper venue — the community specs are the ground truth.
- **Confidence**: HIGH (these ARE the reference documents)
- **User action needed**: None — the spec docs are the citation.

### ASSUMPTION: ePrint IDs used as `paper_refs` slugs (T1 plan)
- **Iteration**: 1 (T1 plan)
- **File**: study-plan/sessions.json
- **What I needed**: A canonical paper ID scheme.
- **What I did**: Used short slugs derived from the `name:` fields in ch*-papers-guide.js (e.g. `tessaro-zhu-bbs-2023`, `utt-2022`, `bulletproofs-plus-plus`). These are internal refs; the site's paper cards use the full `name:` string. No external BibTeX DB is referenced.
- **Confidence**: HIGH
- **User action needed**: If you want these slugs to map to a formal BibTeX db or a paper-refs lookup, extend with a second pass.

### BLOCKED: skill.md write outside worktree sandbox (T17)
- **Iteration**: 1
- **File**: `~/.claude/skills/morning-thesis-addon/skill.md`
- **What I needed**: Write access to `~/.claude/skills/morning-thesis-addon/` (outside the git worktree)
- **What I did**: The agent sandbox denies Write tool calls to paths outside the worktree root. The full skill.md content is included in the T17 task output — copy it manually.
- **Confidence**: HIGH
- **User action needed**: Run the following to install the skill:
  ```
  mkdir -p ~/.claude/skills/morning-thesis-addon
  # Then paste the content from the T17 agent output into:
  # ~/.claude/skills/morning-thesis-addon/skill.md
  ```
  The complete skill.md content is in the T17 night-shift agent final message.
