/**
 * Study Guide Rendering — Intuitive + Technical Views
 * Extracted from app.js to keep files under 800 lines.
 * Depends on: day{1,2,3}-guide.js, day{1,2,3}-technical.js, KaTeX
 */

/* === Constants === */
const STUDY_GUIDE_STORAGE_KEY = 'studyGuideState';
const VIEW_TOGGLE_STORAGE_KEY = 'viewToggleState';

const GUIDE_DATA = {
  1: () => window.DAY1_GUIDE,
  2: () => window.DAY2_GUIDE,
  3: () => window.DAY3_GUIDE,
};

const TECHNICAL_DATA = {
  1: () => window.DAY1_TECHNICAL,
  2: () => window.DAY2_TECHNICAL,
  3: () => window.DAY3_TECHNICAL,
};

const BLOCK_KEY_MAP = { 1: 'block1', 2: 'block2' };

/* === State Persistence === */

function loadGuideState() {
  try {
    const raw = localStorage.getItem(STUDY_GUIDE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveGuideState(state) {
  try {
    localStorage.setItem(STUDY_GUIDE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.error('Failed to save study guide state');
  }
}

function loadViewToggleState() {
  try {
    const raw = localStorage.getItem(VIEW_TOGGLE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveViewToggleState(state) {
  try {
    localStorage.setItem(VIEW_TOGGLE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.error('Failed to save view toggle state');
  }
}

/* === Utility === */

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function findTechnicalConcept(techBlock, conceptName) {
  if (!techBlock || !techBlock.concepts) return null;
  return techBlock.concepts.find((c) => c.name === conceptName) || null;
}

/* === Build Public/Private Table (shared by both views) === */

function buildPublicPrivateTable(entries) {
  if (!entries || entries.length === 0) return null;

  const section = document.createElement('div');
  section.className = 'public-private-section';

  const title = document.createElement('h4');
  title.className = 'pp-title';
  title.textContent = 'Who Knows What';
  section.appendChild(title);

  const table = document.createElement('table');
  table.className = 'pp-table';

  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>Item</th><th>Status</th><th>Holder</th><th>When</th></tr>';
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  entries.forEach((entry) => {
    const tr = document.createElement('tr');
    tr.className = 'pp-status-' + entry.status;
    tr.innerHTML =
      '<td>' + escapeHtml(entry.item) + '</td>' +
      '<td><span class="pp-badge pp-' + entry.status + '">' + entry.status + '</span></td>' +
      '<td>' + escapeHtml(entry.holder) + '</td>' +
      '<td>' + escapeHtml(entry.when) + '</td>';
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  section.appendChild(table);
  return section;
}

/* === KaTeX Rendering === */

const KATEX_DELIMITERS = [
  { left: '\\[', right: '\\]', display: true },
  { left: '\\(', right: '\\)', display: false },
];

function renderMathIn(element) {
  if (typeof renderMathInElement !== 'function') return;
  try {
    renderMathInElement(element, {
      delimiters: KATEX_DELIMITERS,
      throwOnError: false,
    });
  } catch (err) {
    console.error('KaTeX render error:', err);
  }
}

function renderAllMath() {
  document.querySelectorAll('.technical-content').forEach(renderMathIn);
}

function waitForKaTeX(callback) {
  if (typeof renderMathInElement === 'function') {
    callback();
    return;
  }
  let attempts = 0;
  const MAX_ATTEMPTS = 50;
  const INTERVAL_MS = 100;
  const timer = setInterval(() => {
    attempts++;
    if (typeof renderMathInElement === 'function') {
      clearInterval(timer);
      callback();
    } else if (attempts >= MAX_ATTEMPTS) {
      clearInterval(timer);
      console.error('KaTeX auto-render did not load within timeout');
    }
  }, INTERVAL_MS);
}

/* === Build Intuitive Content === */

function buildIntuitiveContent(concept, dayNum) {
  const container = document.createElement('div');
  container.className = 'intuitive-content';

  if (concept.analogy) {
    const analogy = document.createElement('blockquote');
    analogy.className = 'concept-analogy';
    analogy.textContent = concept.analogy;
    container.appendChild(analogy);
  }

  if (concept.diagram) {
    const diagram = document.createElement('pre');
    diagram.className = 'concept-diagram';
    diagram.textContent = concept.diagram;
    container.appendChild(diagram);
  }

  const ppTable = buildPublicPrivateTable(concept.publicPrivate);
  if (ppTable) {
    container.appendChild(ppTable);
  }

  if (concept.keyPoints && concept.keyPoints.length > 0) {
    const ul = document.createElement('ul');
    ul.className = 'concept-keypoints';
    concept.keyPoints.forEach((point) => {
      const li = document.createElement('li');
      li.textContent = point;
      ul.appendChild(li);
    });
    container.appendChild(ul);
  }

  if (concept.connections) {
    const conn = document.createElement('p');
    conn.className = 'concept-connections';
    conn.innerHTML =
      '<span class="concept-connections-prefix">&#128279; Thesis link: </span>' +
      escapeHtml(concept.connections);
    container.appendChild(conn);
  }

  if (concept.thesisExample) {
    const example = document.createElement('div');
    example.className = 'thesis-example';
    example.innerHTML = '<span class="thesis-example-label">Applied to your thesis</span>' +
      '<p>' + escapeHtml(concept.thesisExample) + '</p>';
    container.appendChild(example);
  }

  return container;
}

/* === Build Technical Content === */

function buildTechnicalContent(techConcept, dayNum, publicPrivateData, thesisExample) {
  const container = document.createElement('div');
  container.className = 'technical-content';

  if (!techConcept) {
    const empty = document.createElement('p');
    empty.className = 'concept-connections';
    empty.textContent = 'Technical content not available for this concept.';
    container.appendChild(empty);
    return container;
  }

  if (techConcept.formalDefinition) {
    const def = document.createElement('div');
    def.className = 'formal-definition';
    def.innerHTML = techConcept.formalDefinition;
    container.appendChild(def);
  }

  if (techConcept.mathDetails && techConcept.mathDetails.length > 0) {
    const details = document.createElement('div');
    details.className = 'math-details';

    techConcept.mathDetails.forEach((detail) => {
      const section = document.createElement('div');
      section.className = 'math-detail-section';

      const subtitle = document.createElement('div');
      subtitle.className = 'math-detail-subtitle';
      subtitle.innerHTML =
        escapeHtml(detail.subtitle) +
        ' <span class="chevron">&#9660;</span>';

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

  if (techConcept.securityAnalysis) {
    const sec = document.createElement('div');
    sec.className = 'security-analysis';
    sec.innerHTML =
      '<h4>Security Analysis</h4>' +
      '<div>' + techConcept.securityAnalysis + '</div>';
    container.appendChild(sec);
  }

  if (techConcept.practicalNotes) {
    const notes = document.createElement('div');
    notes.className = 'practical-notes';
    notes.innerHTML =
      '<h4>Practical Notes</h4>' +
      '<div>' + techConcept.practicalNotes + '</div>';
    container.appendChild(notes);
  }

  if (techConcept.keyFormulas && techConcept.keyFormulas.length > 0) {
    const formulas = document.createElement('div');
    formulas.className = 'key-formulas';
    formulas.innerHTML = '<h4>Key Formulas</h4>';

    const grid = document.createElement('div');
    grid.className = 'formula-grid';

    techConcept.keyFormulas.forEach((f) => {
      const card = document.createElement('div');
      card.className = 'formula-card';
      card.innerHTML =
        '<span class="formula-name">' + escapeHtml(f.name) + '</span>' +
        '<div class="formula-content">' + f.formula + '</div>';
      grid.appendChild(card);
    });

    formulas.appendChild(grid);
    container.appendChild(formulas);
  }

  const ppTable = buildPublicPrivateTable(publicPrivateData);
  if (ppTable) {
    container.appendChild(ppTable);
  }

  if (thesisExample) {
    const example = document.createElement('div');
    example.className = 'thesis-example';
    example.innerHTML = '<span class="thesis-example-label">Applied to your thesis</span>' +
      '<p>' + escapeHtml(thesisExample) + '</p>';
    container.appendChild(example);
  }

  return container;
}

/* === Build Concept Card (both views) === */

function buildConceptCard(concept, techConcept, dayNum, conceptKey, savedState, viewState) {
  const card = document.createElement('div');
  card.className = 'concept-card';
  card.style.setProperty('--day-color', 'var(--color-day' + dayNum + ')');

  const header = document.createElement('div');
  header.className = 'concept-header';
  header.innerHTML =
    '<span class="concept-header-title">' + escapeHtml(concept.name) + '</span>' +
    '<span class="concept-chevron">&#9660;</span>';

  header.addEventListener('click', () => {
    card.classList.toggle('open');
    const state = loadGuideState();
    const updated = { ...state, [conceptKey]: card.classList.contains('open') };
    saveGuideState(updated);
  });

  card.appendChild(header);

  const body = document.createElement('div');
  body.className = 'concept-body';

  /* View toggle */
  const currentView = viewState[conceptKey] || 'intuitive';
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

  /* Build both views */
  const intuitiveContent = buildIntuitiveContent(concept, dayNum);
  const technicalContent = buildTechnicalContent(techConcept, dayNum, concept.publicPrivate, concept.thesisExample);

  if (currentView === 'technical') {
    intuitiveContent.classList.add('hidden');
    technicalContent.classList.add('active');
  }

  body.appendChild(intuitiveContent);
  body.appendChild(technicalContent);

  /* Toggle logic */
  const switchView = (view) => {
    const isIntuitive = view === 'intuitive';
    intuitiveContent.classList.toggle('hidden', !isIntuitive);
    technicalContent.classList.toggle('active', !isIntuitive);
    intuitiveBtn.classList.toggle('active', isIntuitive);
    technicalBtn.classList.toggle('active', !isIntuitive);

    const vs = loadViewToggleState();
    const updatedVs = { ...vs, [conceptKey]: view };
    saveViewToggleState(updatedVs);

    if (!isIntuitive) {
      renderMathIn(technicalContent);
    }
  };

  intuitiveBtn.addEventListener('click', () => switchView('intuitive'));
  technicalBtn.addEventListener('click', () => switchView('technical'));

  card.appendChild(body);

  if (savedState[conceptKey]) {
    card.classList.add('open');
  }

  return card;
}

/* === Build Connections Summary === */

function buildConnectionsSummary(text, dayNum) {
  const el = document.createElement('div');
  el.className = 'connections-summary';
  el.style.setProperty('--day-color', 'var(--color-day' + dayNum + ')');
  el.innerHTML =
    '<span class="connections-summary-label">Thesis Connections</span>' +
    escapeHtml(text);
  return el;
}

/* === Main Render === */

function renderStudyGuides() {
  const containers = document.querySelectorAll('.study-guide-container[data-day][data-block]');
  const savedState = loadGuideState();
  const viewState = loadViewToggleState();

  containers.forEach((container) => {
    const dayNum = Number(container.dataset.day);
    const blockNum = Number(container.dataset.block);

    const guideGetter = GUIDE_DATA[dayNum];
    if (!guideGetter) return;
    const guide = guideGetter();
    if (!guide) return;

    const blockKey = BLOCK_KEY_MAP[blockNum];
    if (!blockKey || !guide[blockKey]) return;

    const blockData = guide[blockKey];
    const stateKey = 'd' + dayNum + 'b' + blockNum;

    /* Get matching technical data */
    const techGetter = TECHNICAL_DATA[dayNum];
    const techGuide = techGetter ? techGetter() : null;
    const techBlock = techGuide && techGuide[blockKey] ? techGuide[blockKey] : null;

    const guideEl = document.createElement('div');
    guideEl.className = 'study-guide';
    guideEl.style.setProperty('--day-color', 'var(--color-day' + dayNum + ')');

    guideEl.appendChild(buildConnectionsSummary(blockData.connectionsSummary, dayNum));

    const concepts = blockData.concepts || [];
    concepts.forEach((concept, idx) => {
      const conceptKey = stateKey + '-c' + idx;
      const techConcept = findTechnicalConcept(techBlock, concept.name);
      guideEl.appendChild(
        buildConceptCard(concept, techConcept, dayNum, conceptKey, savedState, viewState)
      );
    });

    container.appendChild(guideEl);

    if (savedState[stateKey + '-open']) {
      guideEl.classList.add('open');
      const toggleBtn = container.previousElementSibling;
      if (toggleBtn && toggleBtn.classList.contains('study-guide-toggle')) {
        toggleBtn.classList.add('active');
      }
    }
  });

  initStudyGuideToggles();
  initGlobalViewToggle();

  /* Render KaTeX for any technical views that are already active */
  waitForKaTeX(() => {
    renderAllMath();
  });
}

/* === Study Guide Section Toggles === */

function initStudyGuideToggles() {
  const toggles = document.querySelectorAll('.study-guide-toggle');

  toggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const container = toggle.nextElementSibling;
      if (!container) return;

      const guideEl = container.querySelector('.study-guide');
      if (!guideEl) return;

      const isOpen = guideEl.classList.toggle('open');
      toggle.classList.toggle('active', isOpen);

      const dayNum = container.dataset.day;
      const blockNum = container.dataset.block;
      const stateKey = 'd' + dayNum + 'b' + blockNum + '-open';

      const state = loadGuideState();
      const updated = { ...state, [stateKey]: isOpen };
      saveGuideState(updated);
    });
  });
}

/* === Global View Toggle === */

function initGlobalViewToggle() {
  const globalToggle = document.getElementById('global-view-toggle');
  if (!globalToggle) return;

  const buttons = globalToggle.querySelectorAll('.global-view-btn');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetView = btn.dataset.view;

      /* Update global toggle active state */
      buttons.forEach((b) => b.classList.toggle('active', b === btn));

      /* Update global button color to match active day */
      updateGlobalToggleColor();

      /* Switch all visible concept cards on the active day */
      const activeSection = document.querySelector('.day-section.active');
      if (!activeSection) return;

      const viewBtns = activeSection.querySelectorAll('.view-btn[data-view="' + targetView + '"]');
      viewBtns.forEach((vb) => {
        if (!vb.classList.contains('active')) {
          vb.click();
        }
      });
    });
  });

  updateGlobalToggleColor();
}

function updateGlobalToggleColor() {
  const activeBtn = document.querySelector('.global-view-btn.active');
  if (!activeBtn) return;

  const activeSection = document.querySelector('.day-section.active');
  if (!activeSection) {
    activeBtn.style.background = '';
    return;
  }

  const dayNum = activeSection.dataset.day;
  const colors = { 1: 'var(--color-day1)', 2: 'var(--color-day2)', 3: 'var(--color-day3)' };
  activeBtn.style.background = colors[dayNum] || 'var(--color-day1)';
}

/* === Switch All Views (called by global toggle) === */

function switchAllViewsOnDay(view) {
  const activeSection = document.querySelector('.day-section.active');
  if (!activeSection) return;

  activeSection.querySelectorAll('.view-btn[data-view="' + view + '"]').forEach((btn) => {
    if (!btn.classList.contains('active')) {
      btn.click();
    }
  });
}
