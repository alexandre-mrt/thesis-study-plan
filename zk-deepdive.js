/**
 * ZK Deep Dive — Rendering Logic
 * Reads ZK_DEEPDIVE_SECTIONS_1 and ZK_DEEPDIVE_SECTIONS_2 and renders
 * the deep dive section as collapsible cards with diagrams and tables.
 * Depends on: zk-deepdive-data.js, zk-deepdive-data2.js, study-guide.js (escapeHtml, KaTeX)
 */

/* === Constants === */
const ZK_DEEPDIVE_STORAGE_KEY = 'zkDeepdiveState';

/* === Mermaid integration === */
let __mermaidConfigured = false;
let __mermaidSeq = 0;

function ensureMermaidConfigured() {
  if (__mermaidConfigured || typeof mermaid === 'undefined') return;
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
  __mermaidConfigured = true;
}

function renderMermaidWhenVisible(host, src) {
  ensureMermaidConfigured();
  if (typeof mermaid === 'undefined') return;
  const id = 'zk-dd-mmd-' + (++__mermaidSeq);
  mermaid
    .render(id, src)
    .then(({ svg }) => {
      host.innerHTML = svg;
    })
    .catch((err) => {
      console.error('[zk-deepdive] Mermaid render failed', err);
      const fallback = document.createElement('pre');
      fallback.className = 'zk-dd-diagram';
      fallback.textContent = src;
      host.replaceWith(fallback);
    });
}

/* === State Persistence === */

function loadDeepdiveState() {
  try {
    const raw = localStorage.getItem(ZK_DEEPDIVE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveDeepdiveState(state) {
  try {
    localStorage.setItem(ZK_DEEPDIVE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.error('Failed to save ZK deep dive state');
  }
}

/* === Utility: escape HTML (local copy to avoid dependency order) === */

function escapeHtmlDD(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/* === Build Public/Private Table === */

function buildDeepdivePPTable(entries) {
  if (!entries || entries.length === 0) return null;

  const section = document.createElement('div');
  section.className = 'zk-pp-section';

  const title = document.createElement('h4');
  title.className = 'zk-pp-title';
  title.textContent = 'Who Knows What';
  section.appendChild(title);

  const table = document.createElement('table');
  table.className = 'zk-comparison-table';

  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>Item</th><th>Status</th><th>Holder</th><th>When</th></tr>';
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  entries.forEach((entry) => {
    const tr = document.createElement('tr');
    const statusClass = entry.status === 'public' ? 'zk-status-public'
      : entry.status === 'destroyed' ? 'zk-status-destroyed'
      : 'zk-status-private';
    tr.innerHTML =
      '<td>' + escapeHtmlDD(entry.item) + '</td>' +
      '<td><span class="zk-status-badge ' + statusClass + '">' + escapeHtmlDD(entry.status) + '</span></td>' +
      '<td>' + escapeHtmlDD(entry.holder) + '</td>' +
      '<td>' + escapeHtmlDD(entry.when) + '</td>';
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  section.appendChild(table);

  return section;
}

/* === Build Section Card === */

function buildDeepdiveSectionCard(sectionData, index, savedState) {
  const card = document.createElement('div');
  card.className = 'zk-dd-card';
  card.id = sectionData.id;

  /* Header */
  const header = document.createElement('div');
  header.className = 'zk-dd-header';

  const numberBadge = document.createElement('span');
  numberBadge.className = 'zk-dd-number';
  numberBadge.textContent = String(index + 1);

  const icon = document.createElement('span');
  icon.className = 'zk-dd-icon';
  icon.textContent = sectionData.icon;

  const titleEl = document.createElement('h3');
  titleEl.className = 'zk-dd-title';
  titleEl.textContent = sectionData.title;

  const chevron = document.createElement('span');
  chevron.className = 'zk-dd-chevron';
  chevron.innerHTML = '&#9660;';

  header.appendChild(numberBadge);
  header.appendChild(icon);
  header.appendChild(titleEl);
  header.appendChild(chevron);

  header.addEventListener('click', () => {
    card.classList.toggle('open');
    const state = loadDeepdiveState();
    const updated = { ...state, [sectionData.id]: card.classList.contains('open') };
    saveDeepdiveState(updated);
  });

  card.appendChild(header);

  /* Body */
  const body = document.createElement('div');
  body.className = 'zk-dd-body';

  /* Main content */
  const contentDiv = document.createElement('div');
  contentDiv.className = 'zk-dd-content';
  contentDiv.innerHTML = sectionData.content;
  body.appendChild(contentDiv);

  /* Diagram (ASCII fallback or Mermaid) */
  if (sectionData.diagram) {
    const diagramWrap = document.createElement('div');
    diagramWrap.className = 'zk-dd-diagram-wrap';

    const diagramLabel = document.createElement('span');
    diagramLabel.className = 'zk-dd-diagram-label';
    diagramLabel.textContent = 'Diagram';
    diagramWrap.appendChild(diagramLabel);

    const raw = sectionData.diagram;
    const diagram = document.createElement('pre');
    diagram.className = 'zk-dd-diagram';
    diagram.textContent = typeof raw === 'string' ? raw : (raw && raw.src) || '';
    diagramWrap.appendChild(diagram);

    body.appendChild(diagramWrap);
  }

  /* Public/Private table */
  const ppTable = buildDeepdivePPTable(sectionData.publicPrivate);
  if (ppTable) {
    body.appendChild(ppTable);
  }

  /* Thesis example callout */
  if (sectionData.thesisExample) {
    const thesis = document.createElement('div');
    thesis.className = 'zk-dd-thesis';
    thesis.innerHTML =
      '<span class="zk-dd-thesis-label">Applied to your thesis</span>' +
      '<p>' + escapeHtmlDD(sectionData.thesisExample) + '</p>';
    body.appendChild(thesis);
  }

  card.appendChild(body);

  /* Restore open state */
  if (savedState[sectionData.id]) {
    card.classList.add('open');
  }

  return card;
}

/* === Main Render Function === */

function renderZKDeepdive() {
  const container = document.getElementById('zk-deepdive-content');
  if (!container) return;

  const sections1 = window.ZK_DEEPDIVE_SECTIONS_1 || [];
  const sections2 = window.ZK_DEEPDIVE_SECTIONS_2 || [];
  const allSections = [...sections1, ...sections2];

  if (allSections.length === 0) return;

  const savedState = loadDeepdiveState();

  /* Section header */
  const headerEl = document.createElement('div');
  headerEl.className = 'zk-dd-page-header';
  headerEl.innerHTML =
    '<div class="zk-dd-page-label">DEEP DIVE</div>' +
    '<h1 class="zk-dd-page-title">Zero-Knowledge Proofs</h1>' +
    '<p class="zk-dd-page-subtitle">From real-world intuition to concrete implementation. ' +
    'An end-to-end walkthrough of how ZK proofs work in practice, ' +
    'applied to anonymous credentials and private payments on Sui.</p>';
  container.appendChild(headerEl);

  /* Table of contents */
  const toc = document.createElement('nav');
  toc.className = 'zk-dd-toc';
  toc.innerHTML = '<h4 class="zk-dd-toc-title">Table of Contents</h4>';

  const tocList = document.createElement('ol');
  tocList.className = 'zk-dd-toc-list';
  allSections.forEach((sec) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#' + sec.id;
    a.textContent = sec.title;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(sec.id);
      if (target) {
        if (!target.classList.contains('open')) {
          target.querySelector('.zk-dd-header').click();
        }
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    });
    li.appendChild(a);
    tocList.appendChild(li);
  });
  toc.appendChild(tocList);
  container.appendChild(toc);

  /* Expand/Collapse all controls */
  const controls = document.createElement('div');
  controls.className = 'zk-dd-controls';

  const expandBtn = document.createElement('button');
  expandBtn.className = 'zk-dd-control-btn';
  expandBtn.textContent = 'Expand All';
  expandBtn.addEventListener('click', () => {
    const cards = container.querySelectorAll('.zk-dd-card');
    const state = loadDeepdiveState();
    cards.forEach((card) => {
      card.classList.add('open');
      state[card.id] = true;
    });
    saveDeepdiveState(state);
    renderMathInDeepdive();
  });

  const collapseBtn = document.createElement('button');
  collapseBtn.className = 'zk-dd-control-btn';
  collapseBtn.textContent = 'Collapse All';
  collapseBtn.addEventListener('click', () => {
    const cards = container.querySelectorAll('.zk-dd-card');
    const state = loadDeepdiveState();
    cards.forEach((card) => {
      card.classList.remove('open');
      state[card.id] = false;
    });
    saveDeepdiveState(state);
  });

  controls.appendChild(expandBtn);
  controls.appendChild(collapseBtn);
  container.appendChild(controls);

  /* Render each section */
  allSections.forEach((sec, idx) => {
    container.appendChild(buildDeepdiveSectionCard(sec, idx, savedState));
  });

  /* Render KaTeX after content is in DOM */
  renderMathInDeepdive();
}

/* === KaTeX for Deep Dive === */

function renderMathInDeepdive() {
  if (typeof renderMathInElement !== 'function') return;

  const container = document.getElementById('zk-deepdive-content');
  if (!container) return;

  try {
    renderMathInElement(container, {
      delimiters: [
        { left: '\\[', right: '\\]', display: true },
        { left: '\\(', right: '\\)', display: false },
      ],
      throwOnError: false,
    });
  } catch (err) {
    console.error('KaTeX render error in ZK deep dive:', err);
  }
}

/* === Register Deep Dive Concepts in Search Index === */

function getZKDeepdiveSearchEntries() {
  const sections1 = window.ZK_DEEPDIVE_SECTIONS_1 || [];
  const sections2 = window.ZK_DEEPDIVE_SECTIONS_2 || [];
  const allSections = [...sections1, ...sections2];

  return allSections.map((sec, idx) => ({
    name: sec.title,
    nameLower: sec.title.toLowerCase(),
    day: 0,
    block: 0,
    blockKey: 'zk-deepdive',
    blockTitle: 'ZK Deep Dive',
    conceptIdx: idx,
    searchText: (sec.title + ' ' + (sec.thesisExample || '')).toLowerCase(),
    guideData: sec,
    techData: null,
    isDeepDive: true,
    sectionId: sec.id,
  }));
}
