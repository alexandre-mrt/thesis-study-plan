/**
 * plan.js — 15-week × 5-day session grid for the thesis study plan.
 * Exports window.PLAN = { init, openSession, markComplete }
 * localStorage: `plan:session:<id>` = "1" when completed.
 * Requires plan.css + style.css (design tokens). No external deps.
 */

/* === Constants === */

const PLAN_SESSIONS_URL = 'study-plan/sessions.json';
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const STORAGE_KEY_PREFIX = 'plan:session:';

const CHAPTER_LABELS = {
  ch21: 'Ch 2.1', ch22: 'Ch 2.2', ch23: 'Ch 2.3', ch24: 'Ch 2.4',
  ch25: 'Ch 2.5', ch26: 'Ch 2.6', rust: 'Rust', synthesis: 'Synth',
};

/* NIGHT-SHIFT-REVIEW: `synthesis` has no --chapter-color in plan.css.
 * Using ch26 (purple) as fallback tint. Add .plan-cell[data-chapter="synthesis"] rule if desired. */
const CHAPTER_DATA_ATTR = {
  ch21: 'ch21', ch22: 'ch22', ch23: 'ch23', ch24: 'ch24',
  ch25: 'ch25', ch26: 'ch26', rust: 'rust', synthesis: 'ch26',
};

const PHASE_LABELS = {
  P1: 'P1 — Rust + Anon Creds', P2: 'P2 — Confidential TX',
  P3: 'P3 — TEE',               P4: 'P4 — Private Payments',
  P5: 'P5 — ZK Systems',        P6: 'P6 — Sui Primitives',
  P7: 'P7 — Rust Advanced',     P8: 'P8 — Synthesis',
};

const MATERIAL_ICONS = {
  paper: '📄', doc: '📖', code: '💻', video: '🎬', notes: '📝', exercise: '✏️',
};

/* === State === */
let _sessions = null;
let _openSessionId = null;

/* === localStorage === */

function loadComplete(id) {
  try { return localStorage.getItem(STORAGE_KEY_PREFIX + id) === '1'; } catch { return false; }
}

function saveComplete(id, done) {
  try {
    if (done) localStorage.setItem(STORAGE_KEY_PREFIX + id, '1');
    else localStorage.removeItem(STORAGE_KEY_PREFIX + id);
  } catch { console.error('[plan] localStorage write failed'); }
}

/* === Date helpers === */

function todayLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function computeStreak(sessions) {
  const today = todayLocal();
  const past = sessions.filter((s) => s.date <= today).sort((a, b) => (a.date < b.date ? 1 : -1));
  if (past.length === 0) return 0;

  const dateMap = new Map();
  for (const s of past) {
    const b = dateMap.get(s.date) || [];
    b.push(s);
    dateMap.set(s.date, b);
  }
  const dates = Array.from(dateMap.keys()).sort((a, b) => (a < b ? 1 : -1));
  let streak = 0;
  for (const date of dates) {
    if (dateMap.get(date).some((s) => loadComplete(s.id))) streak++;
    else break;
  }
  return streak;
}

function currentWeek(sessions) {
  const today = todayLocal();
  const hit = sessions.find((s) => s.date === today);
  if (hit) return hit.week;
  const future = sessions.filter((s) => s.date > today);
  if (future.length) return future[0].week;
  const past = sessions.filter((s) => s.date < today);
  return past.length ? past[past.length - 1].week : null;
}

function weekProgress(sessions, week) {
  const ws = sessions.filter((s) => s.week === week);
  return { completed: ws.filter((s) => loadComplete(s.id)).length, total: ws.length };
}

/* === DOM helper === */

function el(tag, cls, attrs, children) {
  const node = document.createElement(tag);
  if (cls) (Array.isArray(cls) ? cls : [cls]).forEach((c) => c && node.classList.add(c));
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'textContent') node.textContent = v;
      else if (k === 'innerHTML') node.innerHTML = v;
      else if (k === 'style') node.style.cssText = v;
      else node.setAttribute(k, v);
    }
  }
  if (children) (Array.isArray(children) ? children : [children]).forEach((c) => c && node.appendChild(c));
  return node;
}

/* === Top bar === */

function renderTopBar(sessions) {
  const total = sessions.length;
  const done = sessions.filter((s) => loadComplete(s.id)).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const wk = currentWeek(sessions);
  const { completed: wkDone, total: wkTotal } = wk ? weekProgress(sessions, wk) : { completed: 0, total: 0 };
  const wkPct = wkTotal ? Math.round((wkDone / wkTotal) * 100) : 0;
  const streak = computeStreak(sessions);

  const topbar = el('div', 'plan-topbar');

  const makeStat = (labelText, valueText, barId, barValId, pctVal) => {
    const stat = el('div', 'plan-stat');
    const lbl = el('div', 'plan-stat-label', { textContent: labelText });
    const row = el('div', 'plan-stat-row');
    const val = el('span', 'plan-stat-value', { id: valueText[0], textContent: valueText[1] });
    const wrap = el('div', 'plan-stat-bar-wrap');
    const bar = el('div', 'plan-stat-bar', { id: barId, style: `width:${pctVal}%` });
    wrap.appendChild(bar);
    row.append(val, wrap);
    stat.append(lbl, row);
    return stat;
  };

  topbar.appendChild(makeStat('Overall Progress', ['plan-overall-value', `${done} / ${total}`], 'plan-overall-bar', null, pct));
  topbar.appendChild(makeStat(wk ? `Week ${wk} Progress` : 'This Week', ['plan-week-value', wk ? `${wkDone} / ${wkTotal}` : '—'], 'plan-week-bar', null, wkPct));

  const badge = el('div', 'plan-streak');
  badge.append(
    el('span', 'plan-streak-icon', { textContent: '🔥' }),
    el('span', 'plan-streak-value', { id: 'plan-streak-value', textContent: String(streak) }),
    el('span', 'plan-streak-label', { textContent: 'day streak' }),
  );
  topbar.appendChild(badge);
  return topbar;
}

function refreshTopBar(sessions) {
  const total = sessions.length;
  const done = sessions.filter((s) => loadComplete(s.id)).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const wk = currentWeek(sessions);
  const { completed: wkDone, total: wkTotal } = wk ? weekProgress(sessions, wk) : { completed: 0, total: 0 };
  const wkPct = wkTotal ? Math.round((wkDone / wkTotal) * 100) : 0;
  const streak = computeStreak(sessions);

  const ov = document.getElementById('plan-overall-value');
  const ob = document.getElementById('plan-overall-bar');
  const wv = document.getElementById('plan-week-value');
  const wb = document.getElementById('plan-week-bar');
  const sv = document.getElementById('plan-streak-value');
  if (ov) ov.textContent = `${done} / ${total}`;
  if (ob) ob.style.width = `${pct}%`;
  if (wv) wv.textContent = wk ? `${wkDone} / ${wkTotal}` : '—';
  if (wb) wb.style.width = `${wkPct}%`;
  if (sv) sv.textContent = String(streak);
}

/* === Legend === */

function renderLegend() {
  const legend = el('div', 'plan-legend');
  for (const [phase, label] of Object.entries(PHASE_LABELS)) {
    const item = el('div', 'plan-legend-item', { 'data-phase': phase.toLowerCase() });
    item.append(el('span', 'plan-legend-dot'), el('span', 'plan-legend-label', { textContent: label }));
    legend.appendChild(item);
  }
  return legend;
}

/* === Phase starts index === */

function phaseStartIds(sessions) {
  const starts = new Set();
  const seen = new Set();
  for (const s of sessions) {
    if (!seen.has(s.phase)) { seen.add(s.phase); starts.add(s.id); }
  }
  return starts;
}

/* === Session cell === */

function renderCell(session, today, phaseStarts) {
  const chAttr = CHAPTER_DATA_ATTR[session.chapter] || 'ch25';
  const cell = el('div', 'plan-cell', {
    'data-session': session.id,
    'data-chapter': chAttr,
    tabindex: '0',
    role: 'button',
    'aria-label': `${session.date} — ${session.title}`,
  });
  if (session.date === today) cell.classList.add('today');
  if (loadComplete(session.id)) cell.classList.add('completed');
  if (phaseStarts.has(session.id)) cell.setAttribute('data-phase-start', 'true');

  cell.appendChild(el('div', 'plan-cell-code', { textContent: CHAPTER_LABELS[session.chapter] || session.chapter }));
  const short = session.title.length > 32 ? session.title.slice(0, 30) + '…' : session.title;
  cell.appendChild(el('div', 'plan-cell-title', { textContent: short }));

  cell.addEventListener('click', () => openSession(session.id));
  cell.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSession(session.id); }
  });
  return cell;
}

/* === Desktop grid === */

function renderDesktopGrid(sessions, container) {
  const today = todayLocal();
  const phaseStarts = phaseStartIds(sessions);

  // week -> weekday -> session
  const index = new Map();
  const weekPhaseStart = new Set();
  for (const s of sessions) {
    if (!index.has(s.week)) index.set(s.week, new Map());
    index.get(s.week).set(s.weekday, s);
    if (phaseStarts.has(s.id)) weekPhaseStart.add(s.week);
  }

  container.appendChild(el('div', 'plan-grid-corner'));

  for (let w = 1; w <= 15; w++) {
    const head = el('div', 'plan-week-head', {
      textContent: `W${w}`,
      style: `grid-column:${w + 1};grid-row:1`,
    });
    if (weekPhaseStart.has(w)) head.setAttribute('data-phase-start', 'true');
    container.appendChild(head);
  }

  WEEKDAYS.forEach((day, dayIdx) => {
    const row = dayIdx + 2;
    container.appendChild(el('div', 'plan-day-label', {
      textContent: day,
      style: `grid-column:1;grid-row:${row}`,
    }));
    for (let w = 1; w <= 15; w++) {
      const session = index.get(w)?.get(day);
      if (session) {
        const cell = renderCell(session, today, phaseStarts);
        cell.style.cssText = `grid-column:${w + 1};grid-row:${row}`;
        container.appendChild(cell);
      } else {
        container.appendChild(el('div', ['plan-cell', 'empty'], {
          style: `grid-column:${w + 1};grid-row:${row}`,
          'aria-hidden': 'true',
        }));
      }
    }
  });
}

/* === Mobile list === */

function renderMobileList(sessions, container) {
  const today = todayLocal();
  const phaseStarts = phaseStartIds(sessions);
  const byWeek = new Map();
  for (const s of sessions) {
    const b = byWeek.get(s.week) || [];
    b.push(s);
    byWeek.set(s.week, b);
  }

  for (let w = 1; w <= 15; w++) {
    const ws = byWeek.get(w);
    if (!ws || ws.length === 0) continue;
    const block = el('div', 'plan-week-block');
    const titleRow = el('div', 'plan-week-title');
    titleRow.append(
      el('span', 'plan-week-title-label', { textContent: `Week ${w}` }),
      el('span', 'plan-week-title-meta', { textContent: PHASE_LABELS[ws[0].phase] || ws[0].phase }),
    );
    const list = el('ul', 'plan-week-list');
    ws.forEach((s) => {
      const li = el('li');
      li.appendChild(renderCell(s, today, phaseStarts));
      list.appendChild(li);
    });
    block.append(titleRow, list);
    container.appendChild(block);
  }
}

/* === Modal === */

function getOrCreateModal() {
  let modal = document.getElementById('plan-modal');
  if (!modal) {
    modal = el('div', 'plan-modal', { id: 'plan-modal', role: 'dialog', 'aria-modal': 'true' });
    const content = el('div', 'plan-modal-content', { id: 'plan-modal-content' });
    const closeBtn = el('button', 'plan-modal-close', {
      id: 'plan-modal-close', 'aria-label': 'Close', textContent: '×',
    });
    closeBtn.addEventListener('click', closeModal);
    content.appendChild(closeBtn);
    modal.appendChild(content);
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
  }
  return { modal, content: document.getElementById('plan-modal-content') };
}

function closeModal() {
  const modal = document.getElementById('plan-modal');
  if (modal) modal.classList.remove('open');
  _openSessionId = null;
}

function renderModalList(sectionTitle, items) {
  if (!items || items.length === 0) return null;
  const section = el('div', 'plan-modal-section');
  section.appendChild(el('div', 'plan-modal-section-title', { textContent: sectionTitle }));
  const list = el('ul', 'plan-modal-list');
  items.forEach((item) => {
    const li = el('li');
    if (typeof item === 'string') {
      li.textContent = item;
    } else if (item && typeof item === 'object') {
      const icon = MATERIAL_ICONS[item.type] || '•';
      li.textContent = `${icon} ${item.ref || ''}`;
      if (item.time_min) {
        li.appendChild(el('span', null, {
          textContent: ` — ${item.time_min} min`,
          style: 'opacity:.55;font-size:11px',
        }));
      }
    }
    list.appendChild(li);
  });
  section.appendChild(list);
  return section;
}

function populateModal(session) {
  const { modal, content } = getOrCreateModal();
  const chAttr = CHAPTER_DATA_ATTR[session.chapter] || 'ch25';
  content.setAttribute('data-chapter', chAttr);

  const closeBtn = document.getElementById('plan-modal-close');
  while (content.lastChild && content.lastChild !== closeBtn) content.removeChild(content.lastChild);

  // Header
  const header = el('div', 'plan-modal-header');
  const eyebrow = el('div', 'plan-modal-eyebrow');
  eyebrow.append(
    el('span', null, { textContent: `${CHAPTER_LABELS[session.chapter] || session.chapter} · ${session.id}` }),
    el('span', 'plan-modal-phase-tag', { textContent: session.phase }),
  );
  header.append(
    eyebrow,
    el('h2', 'plan-modal-title', { textContent: session.title }),
    el('div', 'plan-modal-date', { textContent: `${session.weekday}, ${session.date} · ${session.duration_min} min` }),
  );
  content.appendChild(header);

  // Sections
  const obj = renderModalList('Objectives', session.objectives);
  if (obj) content.appendChild(obj);
  const mat = renderModalList('Materials', session.materials);
  if (mat) content.appendChild(mat);
  const ex = renderModalList('Exercises', session.exercises);
  if (ex) content.appendChild(ex);

  // Paper refs
  if (session.paper_refs && session.paper_refs.length > 0) {
    const refSec = el('div', 'plan-modal-section');
    refSec.appendChild(el('div', 'plan-modal-section-title', { textContent: 'Paper References' }));
    const links = el('div', 'plan-modal-links');
    session.paper_refs.forEach((ref) => links.appendChild(el('span', 'plan-modal-link', { textContent: `→ ${ref}` })));
    refSec.appendChild(links);
    content.appendChild(refSec);
  }

  // SOTA note
  if (session.sota_note) {
    const sotaSec = el('div', 'plan-modal-section');
    sotaSec.append(
      el('div', 'plan-modal-section-title', { textContent: 'SOTA Note' }),
      el('div', 'plan-modal-sota', { textContent: session.sota_note }),
    );
    content.appendChild(sotaSec);
  }

  // Footer
  const footer = el('div', 'plan-modal-footer');
  const label = el('label', 'plan-modal-check');
  const checkbox = el('input', null, { type: 'checkbox', id: 'plan-modal-checkbox' });
  checkbox.checked = loadComplete(session.id);
  const checkmark = el('span', 'checkmark');
  label.append(checkbox, checkmark, document.createTextNode('Mark as complete'));
  checkbox.addEventListener('change', () => {
    markComplete(session.id, checkbox.checked);
    if (_sessions) refreshTopBar(_sessions);
  });
  footer.appendChild(label);

  const allSessions = window.PLAN_SESSIONS || [];
  const idx = allSessions.findIndex((s) => s.id === session.id);
  const next = idx >= 0 && idx < allSessions.length - 1 ? allSessions[idx + 1] : null;
  const nextBtn = el('button', 'plan-modal-next', { textContent: next ? `Next: ${next.id} →` : 'Last session' });
  nextBtn.disabled = !next;
  if (next) nextBtn.addEventListener('click', () => openSession(next.id));
  footer.appendChild(nextBtn);

  content.appendChild(footer);
  modal.classList.add('open');
  _openSessionId = session.id;
  setTimeout(() => { const cb = document.getElementById('plan-modal-checkbox'); if (cb) cb.focus(); }, 50);
}

/* === Cell state update === */

function updateCellState(id, done) {
  document.querySelectorAll(`.plan-cell[data-session="${id}"]`).forEach((c) => c.classList.toggle('completed', done));
}

/* === Public API === */

function openSession(id) {
  const sessions = window.PLAN_SESSIONS;
  if (!Array.isArray(sessions)) { console.error('[plan] PLAN_SESSIONS not loaded'); return; }
  const session = sessions.find((s) => s.id === id);
  if (!session) { console.error(`[plan] Session not found: ${id}`); return; }
  populateModal(session);
}

function markComplete(id, done) {
  saveComplete(id, done);
  updateCellState(id, done);
  if (_sessions) refreshTopBar(_sessions);
}

async function init() {
  const section = document.getElementById('plan-section');
  if (!section) {
    // NIGHT-SHIFT-REVIEW: #plan-section added by T11. init() is safe to call early — returns gracefully.
    console.warn('[plan] #plan-section not in DOM yet — T11 must add it before init() can render');
    return;
  }

  let sessions;
  try {
    const res = await fetch(PLAN_SESSIONS_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    sessions = await res.json();
  } catch (err) {
    console.error('[plan] Failed to load sessions.json:', err);
    section.innerHTML = '<p style="color:var(--text-muted);padding:40px 20px">Failed to load study sessions. Ensure study-plan/sessions.json is accessible.</p>';
    return;
  }

  if (!Array.isArray(sessions) || sessions.length === 0) {
    console.error('[plan] sessions.json is empty or not an array');
    return;
  }

  window.PLAN_SESSIONS = sessions;
  _sessions = sessions;
  section.innerHTML = '';

  // Page header
  const header = el('div', 'plan-page-header');
  header.append(
    el('div', 'plan-page-label', { textContent: 'Master Thesis' }),
    el('h1', 'plan-page-title', { textContent: '15-Week Study Plan' }),
    el('p', 'plan-page-subtitle', {
      textContent: `${sessions.length} sessions across 15 weeks — April 2026 to July 2026. Click any session to view objectives, materials, exercises, and mark it complete.`,
    }),
  );
  section.appendChild(header);
  section.appendChild(renderTopBar(sessions));
  section.appendChild(renderLegend());

  const gridWrap = el('div', 'plan-grid-wrap');
  const grid = el('div', 'plan-grid', { id: 'plan-grid' });
  renderDesktopGrid(sessions, grid);
  gridWrap.appendChild(grid);
  section.appendChild(gridWrap);

  const mobile = el('div', 'plan-mobile');
  renderMobileList(sessions, mobile);
  section.appendChild(mobile);

  // Deep-link: ?session=S01
  const deepId = new URLSearchParams(window.location.search).get('session');
  if (deepId) {
    if (sessions.find((s) => s.id === deepId)) openSession(deepId);
    else console.warn(`[plan] Deep-link session not found: ${deepId}`);
  }
}

function openNextUncompleted() {
  const sessions = window.PLAN_SESSIONS;
  if (!Array.isArray(sessions)) { console.error('[plan] PLAN_SESSIONS not loaded'); return; }
  const next = sessions.find((s) => !loadComplete(s.id));
  if (next) {
    openSession(next.id);
  } else {
    console.info('[plan] All sessions completed — nothing to open');
  }
}

window.PLAN = { init, openSession, markComplete, openNextUncompleted };
