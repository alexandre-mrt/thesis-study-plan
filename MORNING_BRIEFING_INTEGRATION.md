# Morning Briefing — Thesis Addon Integration

This document explains how the `morning-thesis-addon` skill plugs into the
existing morning briefing triggered by "morning" or "jarvis".

## 1. Addon location

```
~/.claude/skills/morning-thesis-addon/skill.md
```

The skill lives outside the repo so it is available globally across all Claude
Code sessions, not just when you are inside this project.

## 2. How it integrates

When you say "morning" or "jarvis", the existing morning briefing runs.
Because the skill file declares `triggers: [morning, jarvis, thesis briefing]`,
Claude Code auto-invokes this addon as part of that flow whenever a thesis
project is active (i.e., any session where this repo or the Master Thesis repo
is in scope).

The addon appends three sections to the standard briefing output:

```
### Thesis — today
### Thesis — this week's research digest
### Next SOTA to integrate
```

No changes to your existing morning briefing skill are needed.

## 3. Files it reads (all local, no web requests)

| File | What is extracted |
|------|-------------------|
| `~/projects/thesis/thesis-study-plan/research-log/YYYY-MM-DD.md` (last 7 days) | `## Discoveries` bullet summaries |
| `~/projects/thesis/thesis-study-plan/study-plan/sessions.json` | Session matching today's date: `id`, `phase`, `chapter`, `title`, `objectives[0]`, `materials[0..1]`, `duration_min` |
| `~/projects/thesis/thesis-study-plan/research-queue.md` | First unchecked `[P0]` entry |

Missing files are skipped silently — the briefing never fails because of an
absent log entry.

## 4. How to disable

Delete the skill file:

```
rm ~/.claude/skills/morning-thesis-addon/skill.md
```

The morning briefing will revert to its original behavior immediately. No other
files need to be touched.

## 5. How to customize the digest format

Edit `~/.claude/skills/morning-thesis-addon/skill.md` directly. Key sections:

- **"When to run"** — change the date window or weekday filter.
- **"Output format"** — reorder or rename the three output blocks, or add a
  fourth block (e.g. open questions from the last log entry).
- **Digest bullet count** — the default is 3-5 bullets from the last 7 days.
  Change "Maximum 5 bullets" to your preferred cap.
- **Post-hook actions** — add or remove the "Open plan" / "Log research" quick
  actions at the bottom of the skill file.

To test a change without waiting for morning:

```
# In any Claude Code session:
thesis briefing
```

This triggers the addon directly and shows the formatted output.
