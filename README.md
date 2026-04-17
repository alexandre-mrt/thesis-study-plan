# Thesis Study Plan

Interactive single-page study website for master thesis preparation (Mysten Labs, Sep 2026 - Mar 2027).
Organized by thesis chapter: Anonymous Credentials, Confidential TX, TEE, Private Payments, ZK Proof Systems, Rust.

## Stack

- Pure HTML/CSS/JS (no framework, no build step)
- Google Fonts (Inter + JetBrains Mono)
- localStorage for persistence
- Deployed on Vercel (push to main triggers deploy)

## Structure

```
index.html          — Single-page app with 6 chapter tabs + ZK Deep Dive
style.css           — Dark academic design, glass-morphism, responsive
app.js              — Chapter tabs, progress tracking, Pomodoro timer
study-guide.js      — Study guide rendering (intuitive + technical views)
search.js           — Global concept search across all guides
sota-ch21.js        — Ch 2.1 SOTA addendum (auto-updated, see below)
sota-ch22.js        — Ch 2.2 SOTA addendum
sota-ch23.js        — Ch 2.3 SOTA addendum
sota-ch24.js        — Ch 2.4 SOTA addendum
sota-ch25.js        — Ch 2.5 SOTA addendum
sota-ch26.js        — Ch 2.6 SOTA addendum
sota-rust.js        — Rust track SOTA addendum
research-log/       — Daily study session entries (YYYY-MM-DD.md)
research-queue.md   — Prioritized SOTA backlog (P0/P1/P2)
scripts/            — Automation scripts
```

## Dev

- **Run**: open `index.html` in a browser (no server required)
- **Deploy**: push to main, Vercel picks it up automatically
- **No build step, no linter, no test suite**

## Weekly research integration

The script at `scripts/weekly-update.sh` digests recent research-log entries
into the `sota-chXX.js` data files.

### Invocation

```bash
# Dry-run (no side effects) — shows what would be added
./scripts/weekly-update.sh

# Apply: append extracted items to the appropriate sota-*.js files
./scripts/weekly-update.sh --apply

# Apply + commit + push to current branch
./scripts/weekly-update.sh --apply --commit
```

### Cadence

Run on **Sundays** (or whenever the user says "update the site with this content").
The script looks at `research-log/*.md` files modified in the last 7 days.

### How it works

1. Scans `research-log/YYYY-MM-DD.md` files from the last 7 days
2. Extracts `## Discoveries` blocks and reads `- Target chapter: chXX` fields
3. Prints a dry-run summary (chapter mapping, candidate count, queue status)
4. With `--apply`: appends auto-digest entries to the matching `sota-chXX.js`
   using `/* AUTO-APPEND START */` ... `/* AUTO-APPEND END */` markers
5. With `--commit`: stages only the modified `sota-*.js` files, commits
   `chore(sota): weekly research digest integration YYYY-MM-DD`, and pushes

### Manual review required

Auto-digest entries are stubs — they capture the title, source, and one-line
summary from the log. After running `--apply`, open each modified `sota-*.js`
and fill in:

- `authors` — paper authors
- `math_highlight` — key equation or formula
- `why_for_thesis` — relevance to the thesis argument
- `tags` — replace `['auto-digest']` with meaningful tags

**P0 items (security-critical) must be manually reviewed before pushing to
production.** Do not rely on auto-generated text for thesis citations.
