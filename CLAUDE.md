# Thesis Study Plan

## Overview
Interactive single-page study website for a 3-day master thesis deep work plan.
Topics: Anonymous Credentials, ZKP, TEE, Blockchain Privacy.

## Stack
- Pure HTML/CSS/JS (no framework, no build step)
- Google Fonts (Inter + JetBrains Mono)
- localStorage for persistence
- Deploy-ready for Vercel

## Structure
```
index.html   — Complete HTML with all 29 resources across 3 days / 6 blocks
style.css    — Dark academic design, glass-morphism, responsive, print styles
app.js       — Day tabs, progress tracking, Pomodoro timer, YouTube lite-embed, keyboard shortcuts
```

## Dev Commands
- **Run**: Open `index.html` in browser (no server needed)
- **Deploy**: Push to GitHub, connect to Vercel
- **No build step, no linter, no test suite**

## Design
- Background: #0f0f0f, Text: #e5e5e5
- Day 1: #6366F1 (indigo), Day 2: #06B6D4 (cyan), Day 3: #10B981 (emerald)
- Glass-morphism cards with backdrop-blur

## Features
- Sticky nav with day tabs + progress bar + Pomodoro timer
- Checkbox progress tracking (localStorage)
- YouTube lite-embed (thumbnail -> iframe on click)
- Keyboard shortcuts: 1/2/3 switch days, Space toggles timer
- Print CSS: clean resource list, no interactive elements
- Mobile responsive
