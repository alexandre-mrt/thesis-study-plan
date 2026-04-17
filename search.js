/**
 * Concept Search — Global concept search across all 3 days.
 * Builds a flat index of all concepts and provides instant search
 * with keyboard navigation and deep-linking to concept cards.
 */

/* === Constants === */
const SEARCH_MAX_RESULTS = 10;
const HIGHLIGHT_DURATION_MS = 1500;
const SCROLL_DELAY_MS = 150;
const EXPAND_DELAY_MS = 100;

// T14: Year boost thresholds (use current year at init time)
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_BOOST_CURRENT = 10;
const YEAR_BOOST_RECENT = 5; // current year - 1

const MATCH_TYPE = {
  EXACT_NAME: 'exact',
  NAME_CONTAINS: 'name',
  FULL_TEXT: 'text',
};

const DAY_GUIDE_ACCESSORS = {
  1: () => window.DAY1_GUIDE,
  2: () => window.DAY2_GUIDE,
  3: () => window.DAY3_GUIDE,
};

const DAY_TECHNICAL_ACCESSORS = {
  1: () => window.DAY1_TECHNICAL,
  2: () => window.DAY2_TECHNICAL,
  3: () => window.DAY3_TECHNICAL,
};

const BLOCK_KEYS = ['block1', 'block2'];

/* Map old (day, block) pairs to chapter keys for navigation */
const DAY_BLOCK_TO_CHAPTER = {
  '1-1': 'ch25',
  '1-2': 'ch25',
  '2-1': 'ch21',
  '2-2': 'ch23',
  '3-1': 'ch24',
  '3-2': 'ch24',
};

const CHAPTER_LABELS = {
  'ch21': '2.1',
  'ch22': '2.2',
  'ch23': '2.3',
  'ch24': '2.4',
  'ch25': '2.5',
  'ch26': '2.6',
  'rust': 'RS',
};

/* Paper data accessors */
const PAPER_GUIDE_ACCESSORS = {
  'ch21': () => window.CH21_PAPERS,
  'ch22': () => window.CH22_PAPERS,
  'ch23': () => window.CH23_PAPERS,
  'ch24': () => window.CH24_PAPERS,
  'ch25': () => window.CH25_PAPERS,
  'ch26': () => window.CH26_PAPERS,
};

const PAPER_TECH_ACCESSORS = {
  'ch21': () => window.CH21_PAPERS_TECH,
  'ch22': () => window.CH22_PAPERS_TECH,
  'ch23': () => window.CH23_PAPERS_TECH,
  'ch24': () => window.CH24_PAPERS_TECH,
  'ch25': () => window.CH25_PAPERS_TECH,
  'ch26': () => window.CH26_PAPERS_TECH,
};

// T14: Map chapter keys to human-readable labels for result decoration
const CHAPTER_DISPLAY_NAMES = {
  'ch21': 'Ch 2.1 — Anon Credentials',
  'ch22': 'Ch 2.2 — Confidential TX',
  'ch23': 'Ch 2.3 — TEE',
  'ch24': 'Ch 2.4 — Private Payments',
  'ch25': 'Ch 2.5 — ZK Proof Systems',
  'ch26': 'Ch 2.6 — Sui Primitives',
  'rust': 'Rust',
  'zk': 'ZK Deep Dive',
};

/* === State === */
let searchIndex = [];
let selectedResultIndex = -1;

/* === Year Extraction === */

// T14: Parse the most recent 4-digit year found in a venue string.
// Examples: "CRYPTO 2025", "ePrint 2023/275", "2024", "NDSS 2019" → numeric year or null.
function extractYearFromVenue(venue) {
  if (!venue || typeof venue !== 'string') return null;
  const matches = venue.match(/\b(20\d{2}|19\d{2})\b/g);
  if (!matches || matches.length === 0) return null;
  return Math.max(...matches.map(Number));
}

// T14: Compute relevance boost based on year.
function yearBoost(year) {
  if (year === null || year === undefined) return 0;
  if (year >= CURRENT_YEAR) return YEAR_BOOST_CURRENT;
  if (year >= CURRENT_YEAR - 1) return YEAR_BOOST_RECENT;
  return 0;
}

/* === Index Building === */

function buildSearchIndex() {
  const index = [];

  for (let day = 1; day <= 3; day++) {
    const guideGetter = DAY_GUIDE_ACCESSORS[day];
    const techGetter = DAY_TECHNICAL_ACCESSORS[day];
    const guide = guideGetter ? guideGetter() : null;
    const techGuide = techGetter ? techGetter() : null;

    if (!guide) continue;

    BLOCK_KEYS.forEach((blockKey, blockIdx) => {
      const block = guide[blockKey];
      if (!block || !block.concepts) return;

      const blockNum = blockIdx + 1;
      const blockTitle = block.title || ('Block ' + blockNum);
      const techBlock = techGuide && techGuide[blockKey] ? techGuide[blockKey] : null;

      block.concepts.forEach((concept, conceptIdx) => {
        const techConcept = techBlock && techBlock.concepts
          ? techBlock.concepts.find((tc) => tc.name === concept.name) || null
          : null;

        const searchParts = [
          concept.name,
          concept.analogy || '',
          (concept.keyPoints || []).join(' '),
          concept.connections || '',
          concept.thesisExample || '',
        ];
        const searchText = searchParts.join(' ').toLowerCase();

        // T14: concept entries have no year field; timestamp defaults to null (no boost)
        index.push({
          name: concept.name,
          nameLower: concept.name.toLowerCase(),
          day: day,
          block: blockNum,
          blockKey: blockKey,
          blockTitle: blockTitle,
          conceptIdx: conceptIdx,
          searchText: searchText,
          guideData: concept,
          techData: techConcept,
          timestamp: null,
        });
      });
    });
  }

  /* Add ZK Deep Dive entries to the search index */
  if (typeof getZKDeepdiveSearchEntries === 'function') {
    const ddEntries = getZKDeepdiveSearchEntries();
    ddEntries.forEach((entry) => index.push(entry));
  }

  /* Add paper entries to the search index */
  const paperChapterKeys = ['ch21', 'ch22', 'ch23', 'ch24', 'ch25', 'ch26'];
  paperChapterKeys.forEach((chKey) => {
    const guideGetter = PAPER_GUIDE_ACCESSORS[chKey];
    const techGetter = PAPER_TECH_ACCESSORS[chKey];
    const guide = guideGetter ? guideGetter() : null;
    const techGuide = techGetter ? techGetter() : null;

    if (!guide || !guide.papers) return;

    guide.papers.forEach((paper, paperIdx) => {
      const techPaper = techGuide && techGuide.papers
        ? techGuide.papers.find((tp) => tp.name === paper.name) || null
        : null;

      const searchParts = [
        paper.name,
        paper.authors || '',
        paper.venue || '',
        paper.keyTakeaway || '',
        paper.analogy || '',
        (paper.keyPoints || []).join(' '),
        paper.connections || '',
        paper.thesisExample || '',
      ];
      const searchText = searchParts.join(' ').toLowerCase();

      // T14: extract year from venue for recency boost
      const paperYear = extractYearFromVenue(paper.venue);
      index.push({
        name: paper.name,
        nameLower: paper.name.toLowerCase(),
        isPaper: true,
        chapterKey: chKey,
        paperIdx: paperIdx,
        blockTitle: 'Paper \u2014 Ch ' + (CHAPTER_LABELS[chKey] || chKey),
        searchText: searchText,
        guideData: paper,
        techData: techPaper,
        timestamp: paperYear,
      });
    });
  });

  return index;
}

/* === Search Function === */

// T14: Base relevance score by match tier, then add year boost.
// Higher score = higher relevance; we sort descending within each tier.
function computeScore(entry, matchType) {
  const tierBase = matchType === MATCH_TYPE.EXACT_NAME ? 100
    : matchType === MATCH_TYPE.NAME_CONTAINS ? 50
    : 10;
  return tierBase + yearBoost(entry.timestamp);
}

function searchConcepts(query) {
  if (!query || query.trim().length === 0) return [];

  const q = query.trim().toLowerCase();
  const exactMatches = [];
  const nameMatches = [];
  const textMatches = [];

  searchIndex.forEach((entry) => {
    if (entry.nameLower === q) {
      exactMatches.push({ ...entry, matchType: MATCH_TYPE.EXACT_NAME });
    } else if (entry.nameLower.includes(q)) {
      nameMatches.push({ ...entry, matchType: MATCH_TYPE.NAME_CONTAINS });
    } else if (entry.searchText.includes(q)) {
      textMatches.push({ ...entry, matchType: MATCH_TYPE.FULL_TEXT });
    }
  });

  // T14: Sort within each tier by score descending (year boost applies within tier)
  const byScoreDesc = (a, b) =>
    computeScore(b, b.matchType) - computeScore(a, a.matchType);

  exactMatches.sort(byScoreDesc);
  nameMatches.sort(byScoreDesc);
  textMatches.sort(byScoreDesc);

  return [...exactMatches, ...nameMatches, ...textMatches].slice(0, SEARCH_MAX_RESULTS);
}

/* === UI Rendering === */

// T14: Build the secondary chapter/phase label shown on each result row.
// For papers: "Ch 2.1 — Anon Credentials"
// For concepts: "Ch 2.5 — ZK Proof Systems" (derived from day/block)
// For ZK Deep Dive entries: "ZK Deep Dive"
// For Plan sessions: "Session S03 • W1 • Mon" (if the entry carries those fields)
function buildResultChapterLabel(result) {
  if (result.isPlan) {
    const session = result.sessionId || '';
    const week = result.weekId || '';
    const day = result.weekDay || '';
    return 'Session ' + session + ' \u2022 ' + week + ' \u2022 ' + day;
  }
  if (result.isDeepDive) {
    return CHAPTER_DISPLAY_NAMES['zk'] || 'ZK Deep Dive';
  }
  if (result.isPaper) {
    return CHAPTER_DISPLAY_NAMES[result.chapterKey] || ('Ch ' + (CHAPTER_LABELS[result.chapterKey] || result.chapterKey));
  }
  // Concept entry: map via DAY_BLOCK_TO_CHAPTER
  const chKey = DAY_BLOCK_TO_CHAPTER[result.day + '-' + result.block] || null;
  if (chKey) {
    return CHAPTER_DISPLAY_NAMES[chKey] || ('Ch ' + (CHAPTER_LABELS[chKey] || chKey));
  }
  return result.blockTitle || '';
}

function renderSearchResults(results, query) {
  const container = document.getElementById('search-results');
  if (!container) return;

  container.innerHTML = '';
  selectedResultIndex = -1;

  if (results.length === 0 && query.trim().length > 0) {
    const noResults = document.createElement('div');
    noResults.className = 'search-no-results';
    noResults.textContent = 'No concepts found for "' + query + '"';
    container.appendChild(noResults);
    container.classList.add('active');
    return;
  }

  if (results.length === 0) {
    container.classList.remove('active');
    return;
  }

  results.forEach((result, idx) => {
    const item = document.createElement('div');
    item.className = 'search-result-item';
    item.dataset.index = String(idx);

    const dayBadge = document.createElement('span');
    dayBadge.className = 'search-result-day';
    const isPaper = result.isPaper === true;
    const isDeepDive = result.isDeepDive === true;
    const chapterKey = isPaper ? result.chapterKey : (isDeepDive ? 'zk' : (DAY_BLOCK_TO_CHAPTER[result.day + '-' + result.block] || 'ch25'));
    dayBadge.dataset.day = chapterKey;
    dayBadge.textContent = isPaper ? ('\uD83D\uDCC4 ' + (CHAPTER_LABELS[chapterKey] || chapterKey)) : (isDeepDive ? 'ZK' : (CHAPTER_LABELS[chapterKey] || result.day));

    const name = document.createElement('span');
    name.className = 'search-result-name';
    name.innerHTML = highlightMatch(result.name, query);

    const blockLabel = document.createElement('span');
    blockLabel.className = 'search-result-block';
    blockLabel.textContent = result.blockTitle;

    // T14: Chapter/phase decoration tag
    const chapterTag = document.createElement('span');
    chapterTag.className = 'result-chapter';
    chapterTag.textContent = buildResultChapterLabel(result);

    item.appendChild(dayBadge);
    item.appendChild(name);
    item.appendChild(blockLabel);
    item.appendChild(chapterTag);

    item.addEventListener('click', () => {
      navigateToConcept(result);
      closeSearch();
    });

    item.addEventListener('mouseenter', () => {
      setSelectedResult(idx);
    });

    container.appendChild(item);
  });

  container.classList.add('active');
}

function highlightMatch(text, query) {
  if (!query || query.trim().length === 0) return escapeSearchHtml(text);

  const q = query.trim();
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return escapeSearchHtml(text);

  const before = text.substring(0, idx);
  const match = text.substring(idx, idx + q.length);
  const after = text.substring(idx + q.length);

  return escapeSearchHtml(before) +
    '<mark>' + escapeSearchHtml(match) + '</mark>' +
    escapeSearchHtml(after);
}

function escapeSearchHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/* === Keyboard Navigation === */

function setSelectedResult(index) {
  const items = document.querySelectorAll('.search-result-item');
  items.forEach((item) => item.classList.remove('selected'));
  selectedResultIndex = index;

  if (index >= 0 && index < items.length) {
    items[index].classList.add('selected');
    items[index].scrollIntoView({ block: 'nearest' });
  }
}

function handleSearchKeydown(e) {
  const container = document.getElementById('search-results');
  if (!container || !container.classList.contains('active')) return;

  const items = container.querySelectorAll('.search-result-item');
  const itemCount = items.length;

  if (itemCount === 0) return;

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      setSelectedResult(
        selectedResultIndex < itemCount - 1 ? selectedResultIndex + 1 : 0
      );
      break;

    case 'ArrowUp':
      e.preventDefault();
      setSelectedResult(
        selectedResultIndex > 0 ? selectedResultIndex - 1 : itemCount - 1
      );
      break;

    case 'Enter':
      e.preventDefault();
      if (selectedResultIndex >= 0 && selectedResultIndex < itemCount) {
        items[selectedResultIndex].click();
      }
      break;
  }
}

/* === Navigation to Concept === */

function navigateToConcept(result) {
  /* Handle paper results */
  if (result.isPaper) {
    navigateToPaper(result);
    return;
  }

  /* Handle ZK Deep Dive results */
  if (result.isDeepDive) {
    navigateToZKDeepdive(result);
    return;
  }

  /* 1. Switch to the correct chapter tab */
  if (typeof switchDay === 'function') {
    const chKey = DAY_BLOCK_TO_CHAPTER[result.day + '-' + result.block] || 'ch25';
    switchDay(chKey);
  }

  /* 2. Wait for day switch, then find and open the guide + concept */
  setTimeout(() => {
    const container = document.querySelector(
      '.study-guide-container[data-day="' + result.day + '"][data-block="' + result.block + '"]'
    );
    if (!container) return;

    /* Open the study guide section if not already open */
    const guideEl = container.querySelector('.study-guide');
    if (guideEl && !guideEl.classList.contains('open')) {
      const toggleBtn = container.previousElementSibling;
      if (toggleBtn && toggleBtn.classList.contains('study-guide-toggle')) {
        toggleBtn.click();
      }
    }

    /* Find the target concept card by index */
    setTimeout(() => {
      const conceptCards = container.querySelectorAll('.concept-card');
      const targetCard = conceptCards[result.conceptIdx];
      if (!targetCard) return;

      /* Expand the concept card if not already open */
      if (!targetCard.classList.contains('open')) {
        const header = targetCard.querySelector('.concept-header');
        if (header) header.click();
      }

      /* Scroll into view with smooth scrolling */
      setTimeout(() => {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

        /* Flash highlight */
        targetCard.classList.add('highlighted');
        setTimeout(() => {
          targetCard.classList.remove('highlighted');
        }, HIGHLIGHT_DURATION_MS);
      }, SCROLL_DELAY_MS);
    }, EXPAND_DELAY_MS);
  }, EXPAND_DELAY_MS);
}

function navigateToZKDeepdive(result) {
  /* 1. Switch to ZK deep dive tab */
  if (typeof switchToZKDeepdive === 'function') {
    switchToZKDeepdive();
  }

  /* 2. Find and open the target section card */
  setTimeout(() => {
    const targetCard = document.getElementById(result.sectionId);
    if (!targetCard) return;

    if (!targetCard.classList.contains('open')) {
      const header = targetCard.querySelector('.zk-dd-header');
      if (header) header.click();
    }

    setTimeout(() => {
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'start' });

      targetCard.classList.add('highlighted');
      setTimeout(() => {
        targetCard.classList.remove('highlighted');
      }, HIGHLIGHT_DURATION_MS);
    }, SCROLL_DELAY_MS);
  }, EXPAND_DELAY_MS);
}

/* === Navigate to Paper === */

function navigateToPaper(result) {
  /* 1. Switch to the correct chapter tab */
  if (typeof switchDay === 'function') {
    switchDay(result.chapterKey);
  }

  /* 2. Find the paper card and expand it */
  setTimeout(() => {
    const container = document.querySelector(
      '.paper-guide-container[data-chapter="' + result.chapterKey + '"]'
    );
    if (!container) return;

    const paperCards = container.querySelectorAll('.paper-card');
    const targetCard = paperCards[result.paperIdx];
    if (!targetCard) return;

    /* Expand the paper card if not already open */
    if (!targetCard.classList.contains('open')) {
      const header = targetCard.querySelector('.paper-header');
      if (header) header.click();
    }

    /* Scroll into view with highlight */
    setTimeout(() => {
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

      targetCard.classList.add('highlighted');
      setTimeout(() => {
        targetCard.classList.remove('highlighted');
      }, HIGHLIGHT_DURATION_MS);
    }, SCROLL_DELAY_MS);
  }, EXPAND_DELAY_MS);
}

/* === Search Open/Close === */

function closeSearch() {
  const input = document.getElementById('concept-search');
  const container = document.getElementById('search-results');

  if (input) {
    input.value = '';
    input.blur();
  }
  if (container) {
    container.classList.remove('active');
    container.innerHTML = '';
  }
  selectedResultIndex = -1;
}

function focusSearch() {
  const input = document.getElementById('concept-search');
  if (input) input.focus();
}

/* === Initialization === */

function initConceptSearch() {
  searchIndex = buildSearchIndex();

  const input = document.getElementById('concept-search');
  if (!input) return;

  /* Search on input */
  input.addEventListener('input', () => {
    const query = input.value;
    if (query.trim().length === 0) {
      const container = document.getElementById('search-results');
      if (container) {
        container.classList.remove('active');
        container.innerHTML = '';
      }
      selectedResultIndex = -1;
      return;
    }
    const results = searchConcepts(query);
    renderSearchResults(results, query);
  });

  /* Keyboard navigation within search (includes Escape to close) */
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeSearch();
      return;
    }
    handleSearchKeydown(e);
  });

  /* Close dropdown when clicking outside */
  document.addEventListener('click', (e) => {
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer && !searchContainer.contains(e.target)) {
      const container = document.getElementById('search-results');
      if (container) {
        container.classList.remove('active');
      }
    }
  });
}
