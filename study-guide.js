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
  'ch22': () => window.CH22_GUIDE,
  'rust': () => window.RUST_GUIDE,
};

const TECHNICAL_DATA = {
  1: () => window.DAY1_TECHNICAL,
  2: () => window.DAY2_TECHNICAL,
  3: () => window.DAY3_TECHNICAL,
  'ch22': () => null,
  'rust': () => null,
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

  const historySection = buildHistorySection(concept.history);
  if (historySection) {
    container.appendChild(historySection);
  }

  const limitationsSection = buildLimitationsSection(concept.limitations);
  if (limitationsSection) {
    container.appendChild(limitationsSection);
  }

  const exercisesSection = buildExercisesSection(concept.exercises);
  if (exercisesSection) {
    container.appendChild(exercisesSection);
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

  const techExercises = techConcept ? techConcept.exercises : null;
  const exercisesSection = buildExercisesSection(techExercises);
  if (exercisesSection) {
    container.appendChild(exercisesSection);
  }

  return container;
}

/* === Build History Section === */

function buildHistorySection(history) {
  if (!history) return null;

  const section = document.createElement('div');
  section.className = 'concept-history';

  const header = document.createElement('h4');
  header.className = 'concept-history-header';
  header.innerHTML = '\uD83D\uDCDC History';
  section.appendChild(header);

  if (history.inventor || history.year) {
    const inventor = document.createElement('p');
    inventor.className = 'concept-history-inventor';
    const parts = [];
    if (history.inventor) parts.push(escapeHtml(history.inventor));
    if (history.year) parts.push(String(history.year));
    inventor.innerHTML = '<strong>' + parts.join(', ') + '</strong>';
    section.appendChild(inventor);
  }

  if (history.context) {
    const context = document.createElement('p');
    context.className = 'concept-history-context';
    context.textContent = history.context;
    section.appendChild(context);
  }

  if (history.funFact) {
    const funFact = document.createElement('p');
    funFact.className = 'concept-history-funfact';
    funFact.textContent = history.funFact;
    section.appendChild(funFact);
  }

  return section;
}

/* === Build Limitations Section === */

function buildLimitationsSection(limitations) {
  if (!limitations || limitations.length === 0) return null;

  const section = document.createElement('div');
  section.className = 'concept-limitations';

  const header = document.createElement('h4');
  header.className = 'concept-limitations-header';
  header.innerHTML = '\u26A0\uFE0F Known Limitations';
  section.appendChild(header);

  const list = document.createElement('ul');
  list.className = 'concept-limitations-list';

  limitations.forEach(function (text) {
    const li = document.createElement('li');
    li.className = 'concept-limitation-item';
    li.textContent = text;
    list.appendChild(li);
  });

  section.appendChild(list);
  return section;
}

/* === Build Exercises Section === */

const EXERCISE_TYPE_COLORS = {
  conceptual: '#6366F1',
  calculation: '#F59E0B',
  comparison: '#06B6D4',
  design: '#10B981',
};

function buildExercisesSection(exercises) {
  if (!exercises || exercises.length === 0) return null;

  const section = document.createElement('div');
  section.className = 'concept-exercises';

  const header = document.createElement('h4');
  header.className = 'concept-exercises-header';
  header.innerHTML = '\u270F\uFE0F Exercises';
  section.appendChild(header);

  exercises.forEach(function (exercise, idx) {
    const card = document.createElement('div');
    card.className = 'exercise-card';

    const typeColor = EXERCISE_TYPE_COLORS[exercise.type] || '#6366F1';

    const badge = document.createElement('span');
    badge.className = 'exercise-type-badge';
    badge.style.color = typeColor;
    badge.textContent = exercise.type || 'exercise';
    card.appendChild(badge);

    if (exercise.question) {
      const question = document.createElement('p');
      question.className = 'exercise-question';
      question.textContent = exercise.question;
      card.appendChild(question);
    }

    if (exercise.hint) {
      const hintId = 'exercise-hint-' + Date.now() + '-' + idx;
      const hintBtn = document.createElement('button');
      hintBtn.className = 'exercise-toggle';
      hintBtn.textContent = 'Show hint';
      hintBtn.setAttribute('aria-expanded', 'false');

      const hintContent = document.createElement('div');
      hintContent.className = 'exercise-hint';
      hintContent.id = hintId;
      hintContent.textContent = exercise.hint;

      hintBtn.addEventListener('click', function () {
        const isVisible = hintContent.classList.toggle('visible');
        hintBtn.textContent = isVisible ? 'Hide hint' : 'Show hint';
        hintBtn.setAttribute('aria-expanded', String(isVisible));
      });

      card.appendChild(hintBtn);
      card.appendChild(hintContent);
    }

    if (exercise.answer) {
      const answerId = 'exercise-answer-' + Date.now() + '-' + idx;
      const answerBtn = document.createElement('button');
      answerBtn.className = 'exercise-toggle';
      answerBtn.textContent = 'Show answer';
      answerBtn.setAttribute('aria-expanded', 'false');

      const answerContent = document.createElement('div');
      answerContent.className = 'exercise-answer';
      answerContent.id = answerId;
      answerContent.textContent = exercise.answer;

      answerBtn.addEventListener('click', function () {
        const isVisible = answerContent.classList.toggle('visible');
        answerBtn.textContent = isVisible ? 'Hide answer' : 'Show answer';
        answerBtn.setAttribute('aria-expanded', String(isVisible));
      });

      card.appendChild(answerBtn);
      card.appendChild(answerContent);
    }

    section.appendChild(card);
  });

  return section;
}

/* === Build Concept Card (both views) === */

function buildConceptCard(concept, techConcept, dayNum, conceptKey, savedState, viewState) {
  const card = document.createElement('div');
  card.className = 'concept-card';
  const colorMap = { 1: 'day1', 2: 'day2', 3: 'day3', 'ch21': 'ch21', 'ch22': 'ch22', 'ch23': 'ch23', 'ch24': 'ch24', 'ch25': 'ch25', 'rust': 'rust' };
  const colorKey = colorMap[dayNum] || ('day' + dayNum);
  card.style.setProperty('--day-color', 'var(--color-' + colorKey + ')');

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

  /* Annotate acronyms in both views (first occurrence per card) */
  annotateAcronyms(intuitiveContent);
  annotateAcronyms(technicalContent);

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
  const connColorMap = { 1: 'day1', 2: 'day2', 3: 'day3', 'ch21': 'ch21', 'ch22': 'ch22', 'ch23': 'ch23', 'ch24': 'ch24', 'ch25': 'ch25', 'rust': 'rust' };
  const connColorKey = connColorMap[dayNum] || ('day' + dayNum);
  el.style.setProperty('--day-color', 'var(--color-' + connColorKey + ')');
  el.innerHTML =
    '<span class="connections-summary-label">Thesis Connections</span>' +
    escapeHtml(text);
  return el;
}

/* === Acronym Annotation === */

const SKIP_ACRONYM_TAGS = new Set(['PRE', 'CODE', 'A', 'ABBR', 'KBD', 'SCRIPT', 'STYLE']);

function annotateAcronyms(element) {
  const lexicon = window.LEXICON;
  if (!lexicon) return;

  const annotated = new Set();

  function walkTextNodes(node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      if (SKIP_ACRONYM_TAGS.has(node.tagName)) return;
      const children = Array.from(node.childNodes);
      children.forEach(walkTextNodes);
      return;
    }

    if (node.nodeType !== Node.TEXT_NODE) return;

    const text = node.textContent;
    if (!text || text.trim().length === 0) return;

    const keys = Object.keys(lexicon).sort((a, b) => b.length - a.length);
    const unannotated = keys.filter((k) => !annotated.has(k));
    if (unannotated.length === 0) return;

    const escaped = unannotated.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const pattern = escaped.join('|');
    /* Use lookbehind/lookahead for boundary detection — supports keys with special chars like BBS+ */
    const regex = new RegExp('(?<![\\w])(' + pattern + ')(?![\\w])');

    const match = regex.exec(text);
    if (!match) return;

    const acronym = match[1];
    const entry = lexicon[acronym];
    if (!entry) return;

    annotated.add(acronym);

    const before = text.substring(0, match.index);
    const after = text.substring(match.index + acronym.length);

    const abbr = document.createElement('abbr');
    abbr.className = 'acronym-tooltip';
    abbr.setAttribute('data-acronym', acronym);
    abbr.setAttribute('data-tooltip', entry.full + ' \u2014 ' + entry.desc);
    abbr.textContent = acronym;

    const parent = node.parentNode;
    if (before) {
      parent.insertBefore(document.createTextNode(before), node);
    }
    parent.insertBefore(abbr, node);
    if (after) {
      const afterNode = document.createTextNode(after);
      parent.insertBefore(afterNode, node);
      walkTextNodes(afterNode);
    }
    parent.removeChild(node);
  }

  walkTextNodes(element);
}

/* === Lexicon Panel === */

function buildLexiconPanel() {
  const lexicon = window.LEXICON;
  if (!lexicon) return;

  const panel = document.createElement('div');
  panel.className = 'lexicon-panel';
  panel.id = 'lexicon-panel';

  const header = document.createElement('div');
  header.className = 'lexicon-header';

  const title = document.createElement('h3');
  title.textContent = 'Lexicon';

  const search = document.createElement('input');
  search.type = 'text';
  search.className = 'lexicon-search';
  search.placeholder = 'Search acronyms...';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'lexicon-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.setAttribute('aria-label', 'Close lexicon');

  header.appendChild(title);
  header.appendChild(search);
  header.appendChild(closeBtn);
  panel.appendChild(header);

  const list = document.createElement('div');
  list.className = 'lexicon-list';

  const sortedKeys = Object.keys(lexicon).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );

  sortedKeys.forEach((key) => {
    const entry = lexicon[key];
    const item = document.createElement('div');
    item.className = 'lexicon-entry';
    item.dataset.key = key.toLowerCase();
    item.dataset.full = entry.full.toLowerCase();

    const acronymEl = document.createElement('span');
    acronymEl.className = 'lexicon-acronym';
    acronymEl.textContent = key;

    const fullEl = document.createElement('span');
    fullEl.className = 'lexicon-full';
    fullEl.textContent = ' \u2014 ' + entry.full;

    const descEl = document.createElement('div');
    descEl.className = 'lexicon-desc';
    descEl.textContent = entry.desc;

    item.appendChild(acronymEl);
    item.appendChild(fullEl);
    item.appendChild(descEl);
    list.appendChild(item);
  });

  panel.appendChild(list);

  search.addEventListener('input', () => {
    const query = search.value.toLowerCase().trim();
    const entries = list.querySelectorAll('.lexicon-entry');
    entries.forEach((entry) => {
      const matchesKey = entry.dataset.key.includes(query);
      const matchesFull = entry.dataset.full.includes(query);
      entry.style.display = (matchesKey || matchesFull) ? '' : 'none';
    });
  });

  closeBtn.addEventListener('click', toggleLexiconPanel);

  document.body.appendChild(panel);
}

function toggleLexiconPanel() {
  const panel = document.getElementById('lexicon-panel');
  if (!panel) return;
  panel.classList.toggle('open');

  if (panel.classList.contains('open')) {
    const search = panel.querySelector('.lexicon-search');
    if (search) search.focus();
  }
}

/* === Main Render === */

function renderStudyGuides() {
  const containers = document.querySelectorAll('.study-guide-container[data-day][data-block]');
  const savedState = loadGuideState();
  const viewState = loadViewToggleState();

  containers.forEach((container) => {
    const dayKey = container.dataset.day;
    const dayNum = isNaN(dayKey) ? dayKey : Number(dayKey);
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
    const guideColorMap = { 1: 'day1', 2: 'day2', 3: 'day3', 'ch21': 'ch21', 'ch22': 'ch22', 'ch23': 'ch23', 'ch24': 'ch24', 'ch25': 'ch25', 'rust': 'rust' };
    const guideColorKey = guideColorMap[dayNum] || ('day' + dayNum);
    guideEl.style.setProperty('--day-color', 'var(--color-' + guideColorKey + ')');

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
  buildLexiconPanel();
  initLexiconToggle();

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

  const dayKey = activeSection.dataset.day;
  const colors = {
    1: 'var(--color-day1)', 2: 'var(--color-day2)', 3: 'var(--color-day3)',
    ch21: 'var(--color-ch21)', ch22: 'var(--color-ch22)', ch23: 'var(--color-ch23)',
    ch24: 'var(--color-ch24)', ch25: 'var(--color-ch25)', rust: 'var(--color-rust)',
  };
  activeBtn.style.background = colors[dayKey] || 'var(--color-ch25)';
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

/* === Lexicon Toggle Button === */

function initLexiconToggle() {
  const btn = document.getElementById('lexicon-toggle-btn');
  if (!btn) return;
  btn.addEventListener('click', toggleLexiconPanel);
}
