# Night Shift — Mobile Responsive Pass

**Branch**: `feat/night-shift-2026-04-17-mobile`
**Started**: 2026-04-17 19:00
**Spec**: `NIGHT_SHIFT_MOBILE_SPEC.md`

## Tasks
| ID | Priority | Title | Status |
|----|----------|-------|--------|
| T0 | 0 (CRITICAL) | Plan tab not rendering — regression | pending |
| T1 | 1 | Reorder chapter sections (guide above videos) | pending |
| T2 | 1 | Fix nav overflow < 768px | pending |
| T3 | 2 | Responsive audit on 4 breakpoints | pending (blocked by T0/T1/T2) |

## Architecture
- Static site, no build step, deploy via Vercel
- Strategy for nav: horizontal scroll + snap for chapter tabs, hamburger for secondary controls
- Strategy for chapter reorder: single DOM change per chapter, move 3 containers above .resources-grid

## Decisions
1. Scroll-snap tabs over hamburger-only to preserve chapter discoverability
2. Move whole guide+paper blocks above resources-grid (not interleave with videos)

## Iteration log
(populated by agents)
