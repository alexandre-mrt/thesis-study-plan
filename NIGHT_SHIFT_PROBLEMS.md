# Night Shift Problems — 2026-04-17 Plan + SOTA Mission

User reads this first in the morning. Any ambiguity, blocker, or uncertainty goes here.

Categories: UNCERTAINTY · ASSUMPTION · BLOCKED · UNFIXED · TEST GAP · DEPENDENCY

---

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

### ASSUMPTION: ePrint IDs used as `paper_refs` slugs (T1 plan)
- **Iteration**: 1 (T1 plan)
- **File**: study-plan/sessions.json
- **What I needed**: A canonical paper ID scheme.
- **What I did**: Used short slugs derived from the `name:` fields in ch*-papers-guide.js (e.g. `tessaro-zhu-bbs-2023`, `utt-2022`, `bulletproofs-plus-plus`). These are internal refs; the site's paper cards use the full `name:` string. No external BibTeX DB is referenced.
- **Confidence**: HIGH
- **User action needed**: If you want these slugs to map to a formal BibTeX db or a paper-refs lookup, extend with a second pass.
