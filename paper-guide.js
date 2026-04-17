/**
 * Paper Guide Rendering — Academic paper recap cards with intuitive/technical toggle.
 * Mirrors study-guide.js patterns for concept cards but targets academic papers.
 * Depends on: ch{21-26}-papers-guide.js, ch{21-26}-papers-technical.js, KaTeX, study-guide.js
 */

/* === Constants === */
const PAPER_GUIDE_STORAGE_KEY = 'paperGuideState';
const PAPER_CHECKED_STORAGE_KEY = 'thesis-paper-checked';

/* NIGHT-SHIFT-REVIEW: ch26 has no --color-ch26 CSS variable defined in style.css.
   Using #8B5CF6 (purple) as fallback. Confirm with user when ch26 CSS is added. */
const CHAPTER_COLORS = {
  ch21: '#06B6D4',
  ch22: '#F59E0B',
  ch23: '#10B981',
  ch24: '#EC4899',
  ch25: '#6366F1',
  ch26: '#8B5CF6',
};

const STATUS_LABELS = {
  read: 'Read',
  skimmed: 'Skimmed',
  queued: 'Queued',
};

const RELEVANCE_LABELS = {
  core: 'Core',
  related: 'Related',
  context: 'Context',
};

/* === Data Accessors (exposed on window for search.js) === */

const PAPER_GUIDE_DATA = {
  ch21: () => window.CH21_PAPERS,
  ch22: () => window.CH22_PAPERS,
  ch23: () => window.CH23_PAPERS,
  ch24: () => window.CH24_PAPERS,
  ch25: () => window.CH25_PAPERS,
  ch26: () => window.CH26_PAPERS,
};

const PAPER_TECH_DATA = {
  ch21: () => window.CH21_PAPERS_TECH,
  ch22: () => window.CH22_PAPERS_TECH,
  ch23: () => window.CH23_PAPERS_TECH,
  ch24: () => window.CH24_PAPERS_TECH,
  ch25: () => window.CH25_PAPERS_TECH,
  ch26: () => window.CH26_PAPERS_TECH,
};

window.PAPER_GUIDE_DATA = PAPER_GUIDE_DATA;
window.PAPER_TECH_DATA = PAPER_TECH_DATA;

/* === Mermaid rendering (scoped to paper cards) === */

let __paperMermaidConfigured = false;
let __paperMermaidSeq = 0;

function ensurePaperMermaidConfigured() {
  if (__paperMermaidConfigured || typeof mermaid === 'undefined') return;
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'strict',
    fontFamily: 'Inter, system-ui, sans-serif',
    themeVariables: {
      primaryColor: '#1a1a1a',
      primaryTextColor: '#e5e5e5',
      primaryBorderColor: '#06B6D4',
      lineColor: '#94a3b8',
      secondaryColor: '#1f2937',
      tertiaryColor: '#111827',
      background: '#0f0f0f',
      mainBkg: '#1a1a1a',
      nodeBorder: '#06B6D4',
      clusterBkg: '#111827',
      clusterBorder: '#334155',
    },
  });
  __paperMermaidConfigured = true;
}

function renderPaperMermaid(host, src) {
  ensurePaperMermaidConfigured();
  if (typeof mermaid === 'undefined') return;
  const id = 'paper-mmd-' + (++__paperMermaidSeq);
  mermaid
    .render(id, src)
    .then(({ svg }) => {
      host.innerHTML = svg;
    })
    .catch((err) => {
      console.error('[paper-guide] Mermaid render failed', err);
      const fallback = document.createElement('pre');
      fallback.className = 'concept-diagram';
      fallback.textContent = src;
      host.replaceWith(fallback);
    });
}

/* === Slugify paper name/title for anchor IDs === */

function slugifyPaperName(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/* === Find Paper by ID (cross-chapter lookup for prereq links) === */

function findPaperById(paperId) {
  const chapterKeys = Object.keys(PAPER_GUIDE_DATA);
  for (let i = 0; i < chapterKeys.length; i++) {
    const getter = PAPER_GUIDE_DATA[chapterKeys[i]];
    const guide = getter ? getter() : null;
    if (!guide || !guide.papers) continue;
    const found = guide.papers.find((p) => p.id === paperId);
    if (found) return found;
  }
  return null;
}

/* === State Persistence === */

function loadPaperGuideState() {
  try {
    const raw = localStorage.getItem(PAPER_GUIDE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePaperGuideState(state) {
  try {
    localStorage.setItem(PAPER_GUIDE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.error('Failed to save paper guide state');
  }
}

function loadPaperCheckedState() {
  try {
    const raw = localStorage.getItem(PAPER_CHECKED_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePaperCheckedState(state) {
  try {
    localStorage.setItem(PAPER_CHECKED_STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.error('Failed to save paper checked state');
  }
}

/* === Find Technical Paper by Name === */

function findTechPaper(techData, paperName) {
  if (!techData || !techData.papers) return null;
  return techData.papers.find((p) => p.name === paperName) || null;
}

/* === Build Intuitive Paper Content === */

function buildPaperIntuitiveContent(paper) {
  const container = document.createElement('div');
  container.className = 'intuitive-content';

  if (paper.analogy) {
    const analogy = document.createElement('blockquote');
    analogy.className = 'concept-analogy';
    analogy.textContent = paper.analogy;
    container.appendChild(analogy);
  }

  if (paper.diagram) {
    const diagram = document.createElement('pre');
    diagram.className = 'concept-diagram';
    diagram.textContent = paper.diagram;
    container.appendChild(diagram);
  }

  if (paper.keyPoints && paper.keyPoints.length > 0) {
    const ul = document.createElement('ul');
    ul.className = 'concept-keypoints';
    paper.keyPoints.forEach((point) => {
      const li = document.createElement('li');
      li.textContent = point;
      ul.appendChild(li);
    });
    container.appendChild(ul);
  }

  if (paper.connections) {
    const conn = document.createElement('p');
    conn.className = 'concept-connections';
    conn.innerHTML =
      '<span class="concept-connections-prefix">&#128279; Thesis link: </span>' +
      escapeHtml(paper.connections);
    container.appendChild(conn);
  }

  if (paper.thesisExample) {
    const example = document.createElement('div');
    example.className = 'thesis-example';
    example.innerHTML =
      '<span class="thesis-example-label">Applied to your thesis</span>' +
      '<p>' + escapeHtml(paper.thesisExample) + '</p>';
    container.appendChild(example);
  }

  /* Prerequisites block — only rendered when prerequisites array is non-empty */
  if (paper.prerequisites && paper.prerequisites.length > 0) {
    const prereqDiv = document.createElement('div');
    prereqDiv.className = 'prereqs';

    const label = document.createElement('span');
    label.className = 'prereqs-label';
    label.textContent = 'Prerequisites:';
    prereqDiv.appendChild(label);

    paper.prerequisites.forEach((prereqId) => {
      /* Look up a known paper by id across all loaded chapter guides */
      const resolved = findPaperById(prereqId);
      const link = document.createElement('a');
      link.href = '#paper-' + prereqId;
      link.textContent = resolved ? resolved.name : prereqId;
      link.className = 'prereq-link';
      if (resolved) {
        link.title = 'Jump to: ' + resolved.name;
      }
      prereqDiv.appendChild(link);
    });

    container.appendChild(prereqDiv);
  }

  return container;
}

/* === Build Technical Paper Content === */

function buildPaperTechnicalContent(techPaper) {
  const container = document.createElement('div');
  container.className = 'technical-content';

  if (!techPaper) {
    const empty = document.createElement('p');
    empty.className = 'concept-connections';
    empty.textContent = 'Technical content not yet available for this paper.';
    container.appendChild(empty);
    return container;
  }

  if (techPaper.formalDefinition) {
    const def = document.createElement('div');
    def.className = 'formal-definition';
    def.innerHTML = techPaper.formalDefinition;
    container.appendChild(def);
  }

  if (techPaper.mathDetails && techPaper.mathDetails.length > 0) {
    const details = document.createElement('div');
    details.className = 'math-details';

    techPaper.mathDetails.forEach((detail) => {
      const section = document.createElement('div');
      section.className = 'math-detail-section';

      const subtitle = document.createElement('div');
      subtitle.className = 'math-detail-subtitle';
      subtitle.innerHTML =
        escapeHtml(detail.subtitle) + ' <span class="chevron">&#9660;</span>';

      subtitle.addEventListener('click', () => {
        section.classList.toggle('open');
      });

      const content = document.createElement('div');
      content.className = 'math-detail-content';
      content.innerHTML = detail.content;

      section.appendChild(subtitle);
      section.appendChild(content);
      details.appendChild(section);
    });

    container.appendChild(details);
  }

  return container;
}

/* === Build Paper Header (badges + meta) === */

function buildPaperHeader(paper, cardKey, card, savedState) {
  const header = document.createElement('div');
  header.className = 'paper-header';

  const titleRow = document.createElement('div');
  titleRow.className = 'paper-header-title';
  titleRow.textContent = paper.name;

  const meta = document.createElement('div');
  meta.className = 'paper-meta';
  const authors = escapeHtml(paper.authors || '');
  const venue = escapeHtml(paper.venue || '');
  meta.innerHTML = authors + (venue ? ' &mdash; <em>' + venue + '</em>' : '');

  const badges = document.createElement('div');
  badges.className = 'paper-badges';

  /* Reading-time pill — only rendered when readingMinutes is present */
  if (typeof paper.readingMinutes === 'number') {
    const readingPill = document.createElement('span');
    readingPill.className = 'reading-time';
    readingPill.textContent = paper.readingMinutes + ' min read';
    badges.appendChild(readingPill);
  }

  const statusBadge = document.createElement('span');
  statusBadge.className = 'paper-status-badge status-' + (paper.status || 'queued');
  statusBadge.textContent = STATUS_LABELS[paper.status] || paper.status || 'Queued';
  badges.appendChild(statusBadge);

  const relevanceBadge = document.createElement('span');
  relevanceBadge.className = 'paper-relevance-badge relevance-' + (paper.relevance || 'related');
  relevanceBadge.textContent = RELEVANCE_LABELS[paper.relevance] || paper.relevance || 'Related';
  badges.appendChild(relevanceBadge);

  const chevron = document.createElement('span');
  chevron.className = 'paper-chevron';
  chevron.innerHTML = '&#9660;';

  header.appendChild(titleRow);
  header.appendChild(meta);
  header.appendChild(badges);
  header.appendChild(chevron);

  header.addEventListener('click', () => {
    card.classList.toggle('open');
    const state = loadPaperGuideState();
    const updated = { ...state, [cardKey]: card.classList.contains('open') };
    savePaperGuideState(updated);
  });

  return header;
}

/* === Build Paper Card === */

function buildPaperCard(paper, techPaper, chapterKey, paperIdx, savedState, viewState, checkedState, recentLogIds) {
  const cardKey = chapterKey + '-p' + paperIdx;
  const dayColor = CHAPTER_COLORS[chapterKey] || CHAPTER_COLORS.ch21;

  const card = document.createElement('div');
  card.className = 'paper-card';
  card.style.setProperty('--day-color', dayColor);
  card.dataset.chapterKey = chapterKey;
  card.dataset.paperIdx = String(paperIdx);
  /* Set paper id as anchor target. Fallback to slugified name/title so every card is reachable. */
  const anchorSlug = paper.id || slugifyPaperName(paper.name || paper.title || '');
  if (anchorSlug) {
    card.id = 'paper-' + anchorSlug;
    card.dataset.slug = anchorSlug;
  }

  /* "What's New" badge — shown when paper id appears in recent research logs */
  if (paper.id && Array.isArray(recentLogIds) && recentLogIds.indexOf(paper.id) !== -1) {
    const newBadge = document.createElement('span');
    newBadge.className = 'whats-new-badge';
    newBadge.textContent = 'NEW';
    card.appendChild(newBadge);
  }

  const header = buildPaperHeader(paper, cardKey, card, savedState);
  card.appendChild(header);

  const body = document.createElement('div');
  body.className = 'paper-body';

  /* Checkbox for read tracking */
  const checkRow = document.createElement('div');
  checkRow.className = 'paper-check-row';
  const checkLabel = document.createElement('label');
  checkLabel.className = 'paper-check-label';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'paper-check';
  checkbox.dataset.id = cardKey;
  checkbox.checked = Boolean(checkedState[cardKey]);
  if (checkbox.checked) {
    card.classList.add('paper-read');
  }
  checkbox.addEventListener('change', () => {
    const current = loadPaperCheckedState();
    const updated = { ...current, [cardKey]: checkbox.checked };
    savePaperCheckedState(updated);
    card.classList.toggle('paper-read', checkbox.checked);
  });
  checkLabel.appendChild(checkbox);
  checkLabel.appendChild(document.createTextNode(' Mark as read'));
  checkRow.appendChild(checkLabel);
  body.appendChild(checkRow);

  /* View toggle */
  const currentView = viewState[cardKey] || 'intuitive';
  const toggle = document.createElement('div');
  toggle.className = 'view-toggle';

  const intuitiveBtn = document.createElement('button');
  intuitiveBtn.className = 'view-btn' + (currentView === 'intuitive' ? ' active' : '');
  intuitiveBtn.dataset.view = 'intuitive';
  intuitiveBtn.textContent = 'Intuitive';

  const technicalBtn = document.createElement('button');
  technicalBtn.className = 'view-btn' + (currentView === 'technical' ? ' active' : '');
  technicalBtn.dataset.view = 'technical';
  technicalBtn.textContent = 'Technical';

  toggle.appendChild(intuitiveBtn);
  toggle.appendChild(technicalBtn);
  body.appendChild(toggle);

  /* Build both view panels */
  const intuitiveContent = buildPaperIntuitiveContent(paper);
  const technicalContent = buildPaperTechnicalContent(techPaper);

  if (currentView === 'technical') {
    intuitiveContent.classList.add('hidden');
    technicalContent.classList.add('active');
  }

  body.appendChild(intuitiveContent);
  body.appendChild(technicalContent);

  /* View switch logic */
  const switchView = (view) => {
    const isIntuitive = view === 'intuitive';
    intuitiveContent.classList.toggle('hidden', !isIntuitive);
    technicalContent.classList.toggle('active', !isIntuitive);
    intuitiveBtn.classList.toggle('active', isIntuitive);
    technicalBtn.classList.toggle('active', !isIntuitive);

    const vs = loadViewToggleState();
    const updatedVs = { ...vs, [cardKey]: view };
    saveViewToggleState(updatedVs);

    if (isIntuitive) {
      renderMathIn(intuitiveContent);
    } else {
      renderMathIn(technicalContent);
    }
  };

  intuitiveBtn.addEventListener('click', () => switchView('intuitive'));
  technicalBtn.addEventListener('click', () => switchView('technical'));

  /* Keypoint takeaway footer */
  if (paper.keyTakeaway) {
    const takeaway = document.createElement('div');
    takeaway.className = 'paper-takeaway';
    takeaway.innerHTML =
      '<span class="paper-takeaway-label">Key Takeaway</span> ' +
      escapeHtml(paper.keyTakeaway);
    body.appendChild(takeaway);
  }

  card.appendChild(body);

  if (savedState[cardKey]) {
    card.classList.add('open');
  }

  return card;
}

/* === Navigate to Paper (exposed for search.js) === */

window.navigateToPaper = function navigateToPaper(chapterKey, paperIdx) {
  /* 1. Switch to chapter tab */
  const tab = document.querySelector('.day-tab[data-day="' + chapterKey + '"]');
  if (tab) tab.click();

  const EXPAND_DELAY_MS = 100;
  const SCROLL_DELAY_MS = 150;
  const HIGHLIGHT_DURATION_MS = 1500;

  /* 2. Find paper container and expand card */
  setTimeout(() => {
    const container = document.querySelector(
      '.paper-guide-container[data-chapter="' + chapterKey + '"]'
    );
    if (!container) return;

    const paperCards = container.querySelectorAll('.paper-card');
    const targetCard = paperCards[paperIdx];
    if (!targetCard) return;

    if (!targetCard.classList.contains('open')) {
      const header = targetCard.querySelector('.paper-header');
      if (header) header.click();
    }

    setTimeout(() => {
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetCard.classList.add('highlighted');
      setTimeout(() => {
        targetCard.classList.remove('highlighted');
      }, HIGHLIGHT_DURATION_MS);
    }, SCROLL_DELAY_MS);
  }, EXPAND_DELAY_MS);
};

/* === Main Render Entry Point === */

function renderPaperGuides(recentLogIds) {
  const containers = document.querySelectorAll('.paper-guide-container[data-chapter]');
  if (containers.length === 0) return;

  const savedState = loadPaperGuideState();
  const viewState = loadViewToggleState();
  const checkedState = loadPaperCheckedState();

  /* Default to empty array when caller does not supply recent IDs */
  const logIds = Array.isArray(recentLogIds) ? recentLogIds : [];

  containers.forEach((container) => {
    const chapterKey = container.dataset.chapter;
    const guideGetter = PAPER_GUIDE_DATA[chapterKey];
    const techGetter = PAPER_TECH_DATA[chapterKey];

    if (!guideGetter) return;
    const guide = guideGetter();
    if (!guide || !guide.papers || guide.papers.length === 0) return;

    const techData = techGetter ? techGetter() : null;

    const section = document.createElement('div');
    section.className = 'paper-section';

    const sectionHeader = document.createElement('div');
    sectionHeader.className = 'paper-section-header';
    sectionHeader.textContent = 'Related Papers';
    section.appendChild(sectionHeader);

    guide.papers.forEach((paper, idx) => {
      const techPaper = findTechPaper(techData, paper.name);
      const card = buildPaperCard(
        paper, techPaper, chapterKey, idx, savedState, viewState, checkedState, logIds
      );
      section.appendChild(card);
    });

    container.appendChild(section);
  });

  /* Render KaTeX across every paper card (both intuitive + technical). */
  waitForKaTeX(() => {
    document.querySelectorAll('.paper-card').forEach(renderMathIn);
  });
}
