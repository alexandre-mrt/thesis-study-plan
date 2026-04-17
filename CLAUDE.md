# Thesis Study Plan

## Overview
Interactive single-page study website for master thesis preparation.
Organized by thesis chapter: Anonymous Credentials, Confidential TX, TEE, Private Payments, ZK Proof Systems, Rust.

## Stack
- Pure HTML/CSS/JS (no framework, no build step)
- Google Fonts (Inter + JetBrains Mono)
- localStorage for persistence
- Deploy-ready for Vercel

## Structure
```
index.html   — Complete HTML with resources across 6 chapter tabs + ZK Deep Dive
style.css    — Dark academic design, glass-morphism, responsive, print styles
app.js       — Chapter tabs, progress tracking, Pomodoro timer, YouTube lite-embed, keyboard shortcuts
study-guide.js — Study guide rendering (intuitive + technical views)
search.js    — Global concept search across all guides
```

## Dev Commands
- **Run**: Open `index.html` in browser (no server needed)
- **Deploy**: Push to GitHub, connect to Vercel
- **No build step, no linter, no test suite**

## Design
- Background: #0f0f0f, Text: #e5e5e5
- Ch 2.1: #06B6D4 (cyan), Ch 2.2: #F59E0B (yellow), Ch 2.3: #10B981 (green)
- Ch 2.4: #EC4899 (pink), Ch 2.5: #6366F1 (indigo), Rust: #F97316 (orange)
- Glass-morphism cards with backdrop-blur

## Features
- Sticky nav with chapter tabs + progress bar + Pomodoro timer
- Checkbox progress tracking (localStorage)
- YouTube lite-embed (thumbnail -> iframe on click)
- Keyboard shortcuts: 1-6 switch chapters, Z for ZK deep dive, Space toggles timer
- Study guides with intuitive/technical view toggle
- Global concept search with deep-linking
- Print CSS: clean resource list, no interactive elements
- Mobile responsive
