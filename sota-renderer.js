/**
 * SOTA Renderer — State of the Art section for each chapter tab.
 * Renders expandable cards for SOTA items (2024-2026) from window.SOTA_CHxx data.
 * Mirrors paper-cards.css glass-morphism style with sota-card modifier.
 * KaTeX used for math_highlight when defined (renderMathInElement is global).
 * Depends on: paper-cards.css, style.css, KaTeX (optional), study-guide.js (escapeHtml,
 *   renderMathIn, waitForKaTeX)
 */

/* === Constants === */
const SOTA_STORAGE_KEY = 'thesis-sota-state';

/* Maps chapter keys to window data accessors */
const SOTA_DATA_ACCESSORS = {
  ch21: () => window.SOTA_CH21,
  ch22: () => window.SOTA_CH22,
  ch23: () => window.SOTA_CH23,
  ch24: () => window.SOTA_CH24,
  ch25: () => window.SOTA_CH25,
  ch26: () => window.SOTA_CH26,
  rust: () => window.SOTA_RUST,
};

/* Chapter colors (mirrors CHAPTER_COLORS in paper-guide.js) */
const SOTA_CHAPTER_COLORS = {
  ch21: '#06B6D4',
  ch22: '#F59E0B',
  ch23: '#10B981',
  ch24: '#EC4899',
  ch25: '#6366F1',
  ch26: '#8B5CF6',
  rust: '#F97316',
};

/* === State Persistence === */

function loadSotaState() {
  try {
    const raw = localStorage.getItem(SOTA_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveSotaState(state) {
  try {
    localStorage.setItem(SOTA_STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.error('Failed to save SOTA state');
  }
}

/* === Helpers === */

function sotaEscapeHtml(text) {
  /* Reuse global escapeHtml from study-guide.js if available, else inline */
  if (typeof escapeHtml === 'function') return escapeHtml(text);
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function isNewItem(item) {
  return item.year >= 2025 || (Array.isArray(item.tags) && item.tags.includes('draft'));
}

/* === Build Badge (What's new) === */

function buildSotaNewBadge() {
  const badge = document.createElement('span');
  badge.className = 'sota-card__badge sota-card__badge--new';
  badge.textContent = "What's new";
  return badge;
}

/* === Build Individual SOTA Card === */

function buildSotaCard(item, cardKey, chapterKey, savedState) {
  const dayColor = SOTA_CHAPTER_COLORS[chapterKey] || SOTA_CHAPTER_COLORS.ch21;

  const card = document.createElement('div');
  card.className = 'paper-card sota-card';
  card.style.setProperty('--day-color', dayColor);

  /* --- Header --- */
  const header = document.createElement('div');
  header.className = 'paper-header';
  header.style.cursor = 'pointer';

  const title = document.createElement('div');
  title.className = 'paper-header-title';
  title.textContent = item.name;

  const meta = document.createElement('div');
  meta.className = 'paper-meta';
  const authors = sotaEscapeHtml(item.authors || '');
  const venue = sotaEscapeHtml(item.venue || '');
  meta.innerHTML = authors + (venue ? ' &mdash; <em>' + venue + '</em>' : '');

  const badges = document.createElement('div');
  badges.className = 'paper-badges';

  if (isNewItem(item)) {
    badges.appendChild(buildSotaNewBadge());
  }

  const yearBadge = document.createElement('span');
  yearBadge.className = 'paper-status-badge';
  yearBadge.style.background = 'rgba(255,255,255,0.06)';
  yearBadge.style.color = '#9ca3af';
  yearBadge.textContent = String(item.year || '');
  badges.appendChild(yearBadge);

  const chevron = document.createElement('span');
  chevron.className = 'paper-chevron';
  chevron.innerHTML = '&#9660;';

  header.appendChild(title);
  header.appendChild(meta);
  header.appendChild(badges);
  header.appendChild(chevron);

  /* Toggle expand/collapse on header click */
  header.addEventListener('click', () => {
    card.classList.toggle('open');
    const state = loadSotaState();
    const updated = { ...state, [cardKey]: card.classList.contains('open') };
    saveSotaState(updated);
    if (card.classList.contains('open')) {
      renderSotaCardMath(card);
    }
  });

  card.appendChild(header);

  /* --- Body --- */
  const body = document.createElement('div');
  body.className = 'paper-body';

  /* Short recap always visible at top of body */
  if (item.recap_short) {
    const shortRecap = document.createElement('p');
    shortRecap.className = 'paper-key-takeaway';
    shortRecap.textContent = item.recap_short;
    body.appendChild(shortRecap);
  }

  /* Long recap */
  if (item.recap_long) {
    const longLabel = document.createElement('div');
    longLabel.className = 'sota-card__section-label';
    longLabel.textContent = 'Full recap';
    body.appendChild(longLabel);

    const longRecap = document.createElement('p');
    longRecap.className = 'sota-card__recap-long';
    longRecap.textContent = item.recap_long;
    body.appendChild(longRecap);
  }

  /* Math highlight rendered via KaTeX */
  if (item.math_highlight) {
    const mathLabel = document.createElement('div');
    mathLabel.className = 'sota-card__section-label';
    mathLabel.textContent = 'Key formula';
    body.appendChild(mathLabel);

    const mathBox = document.createElement('div');
    mathBox.className = 'sota-card__math';
    /* Store raw math text as data attribute so we can render it after expand */
    mathBox.dataset.math = item.math_highlight;
    mathBox.textContent = item.math_highlight;
    body.appendChild(mathBox);
  }

  /* Why for thesis */
  if (item.why_for_thesis) {
    const thesisLabel = document.createElement('div');
    thesisLabel.className = 'sota-card__section-label';
    thesisLabel.textContent = 'Why for thesis';
    body.appendChild(thesisLabel);

    const thesisBox = document.createElement('div');
    thesisBox.className = 'sota-card__why-thesis';
    thesisBox.textContent = item.why_for_thesis;
    body.appendChild(thesisBox);
  }

  /* External link */
  if (item.link) {
    const linkRow = document.createElement('div');
    linkRow.className = 'sota-card__link-row';

    const link = document.createElement('a');
    link.href = item.link;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'resource-link';
    link.textContent = 'Open source \u2192';
    linkRow.appendChild(link);
    body.appendChild(linkRow);
  }

  card.appendChild(body);

  /* Restore open state */
  if (savedState[cardKey]) {
    card.classList.add('open');
  }

  return card;
}

/* === Render KaTeX inside an open SOTA card === */

function renderSotaCardMath(card) {
  const mathBoxes = card.querySelectorAll('.sota-card__math[data-math]');
  if (mathBoxes.length === 0) return;

  const doRender = () => {
    mathBoxes.forEach((box) => {
      const mathText = box.dataset.math;
      if (!mathText || box.dataset.mathRendered === '1') return;
      box.dataset.mathRendered = '1';
      /* Use renderMathIn from study-guide.js if available */
      if (typeof renderMathIn === 'function') {
        box.innerHTML = mathText;
        renderMathIn(box);
      } else if (typeof renderMathInElement === 'function') {
        box.innerHTML = mathText;
        renderMathInElement(box, {
          delimiters: [
            { left: '\\[', right: '\\]', display: true },
            { left: '\\(', right: '\\)', display: false },
            { left: '$', right: '$', display: false },
          ],
          throwOnError: false,
        });
      }
    });
  };

  if (typeof waitForKaTeX === 'function') {
    waitForKaTeX(doRender);
  } else {
    doRender();
  }
}

/* === Main: renderChapter === */

function sotaRenderChapter(chapterKey, containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error('SOTA: container not found:', containerSelector);
    return;
  }

  /* Guard: already rendered */
  if (container.dataset.sotaRendered === '1') return;
  container.dataset.sotaRendered = '1';

  const getter = SOTA_DATA_ACCESSORS[chapterKey];
  if (!getter) {
    console.error('SOTA: no data accessor for chapter:', chapterKey);
    return;
  }

  const data = getter();
  if (!data || !data.items || data.items.length === 0) {
    console.error('SOTA: no items for chapter:', chapterKey);
    return;
  }

  const dayColor = SOTA_CHAPTER_COLORS[chapterKey] || SOTA_CHAPTER_COLORS.ch21;
  const savedState = loadSotaState();

  /* Section wrapper */
  const section = document.createElement('div');
  section.className = 'paper-section sota-section';

  /* Section header */
  const sectionHeader = document.createElement('div');
  sectionHeader.className = 'paper-section-header';
  sectionHeader.style.setProperty('--day-color', dayColor);
  sectionHeader.textContent = 'State of the Art (2024\u20132026)';
  section.appendChild(sectionHeader);

  /* Updated timestamp */
  if (data.last_updated || data.updated) {
    const ts = document.createElement('div');
    ts.className = 'sota-card__updated';
    ts.textContent = 'Last curated: ' + (data.last_updated || data.updated);
    section.appendChild(ts);
  }

  /* Cards */
  data.items.forEach((item, idx) => {
    const cardKey = chapterKey + '-sota-' + idx;
    const card = buildSotaCard(item, cardKey, chapterKey, savedState);
    section.appendChild(card);
    /* If card was open on restore, render math immediately */
    if (savedState[cardKey]) {
      renderSotaCardMath(card);
    }
  });

  container.appendChild(section);
}

/* === getAll: returns all SOTA items for external indexers === */

function sotaGetAll() {
  const allItems = [];
  const chapterKeys = Object.keys(SOTA_DATA_ACCESSORS);
  chapterKeys.forEach((chKey) => {
    const getter = SOTA_DATA_ACCESSORS[chKey];
    const data = getter ? getter() : null;
    if (!data || !data.items) return;
    data.items.forEach((item) => {
      allItems.push({ ...item, chapter: chKey });
    });
  });
  return allItems;
}

/* === Public API === */

window.SOTA = {
  renderChapter: sotaRenderChapter,
  getAll: sotaGetAll,
};
