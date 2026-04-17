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

/* SOTA data accessors (matches SOTA_DATA_ACCESSORS in sota-renderer.js) */
const SOTA_SEARCH_ACCESSORS = {
  'ch21': () => window.SOTA_CH21,
  'ch22': () => window.SOTA_CH22,
  'ch23': () => window.SOTA_CH23,
  'ch24': () => window.SOTA_CH24,
  'ch25': () => window.SOTA_CH25,
  'ch26': () => window.SOTA_CH26,
  'rust': () => window.SOTA_RUST,
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

/* === State === */
let searchIndex = [];
let selectedResultIndex = -1;

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
      });
    });
  });

  /* Add SOTA entries to the search index */
  const sotaChapterKeys = Object.keys(SOTA_SEARCH_ACCESSORS);
  sotaChapterKeys.forEach((chKey) => {
    const getter = SOTA_SEARCH_ACCESSORS[chKey];
    const data = getter ? getter() : null;
    if (!data || !data.items) return;

    data.items.forEach((item, itemIdx) => {
      const searchParts = [
        item.name || '',
        item.authors || '',
        item.venue || '',
        item.recap_short || '',
        item.recap_long || '',
        item.why_for_thesis || '',
        (item.tags || []).join(' '),
      ];
      const searchText = searchParts.join(' ').toLowerCase();

      index.push({
        name: item.name || '',
        nameLower: (item.name || '').toLowerCase(),
        isSota: true,
        kind: 'sota',
        chapterKey: chKey,
        sotaIdx: itemIdx,
        blockTitle: 'SOTA \u2014 Ch ' + (CHAPTER_LABELS[chKey] || chKey),
        searchText: searchText,
        link: item.link || '',
        year: item.year || null,
      });
    });
  });

  return index;
}

/* === Search Function === */

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

  return [...exactMatches, ...nameMatches, ...textMatches].slice(0, SEARCH_MAX_RESULTS);
}

/* === UI Rendering === */

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
    const isSota = result.isSota === true;
    const isDeepDive = result.isDeepDive === true;
    const chapterKey = (isPaper || isSota) ? result.chapterKey : (isDeepDive ? 'zk' : (DAY_BLOCK_TO_CHAPTER[result.day + '-' + result.block] || 'ch25'));
    dayBadge.dataset.day = chapterKey;
    if (isSota) {
      dayBadge.textContent = '\u2728 ' + (CHAPTER_LABELS[chapterKey] || chapterKey);
    } else if (isPaper) {
      dayBadge.textContent = '\uD83D\uDCC4 ' + (CHAPTER_LABELS[chapterKey] || chapterKey);
    } else if (isDeepDive) {
      dayBadge.textContent = 'ZK';
    } else {
      dayBadge.textContent = CHAPTER_LABELS[chapterKey] || result.day;
    }

    const name = document.createElement('span');
    name.className = 'search-result-name';
    name.innerHTML = highlightMatch(result.name, query);

    const blockLabel = document.createElement('span');
    blockLabel.className = 'search-result-block';
    blockLabel.textContent = result.blockTitle;

    /* Kind tag chip for SOTA results */
    const kindChip = isSota ? (() => {
      const chip = document.createElement('span');
      chip.className = 'search-result-kind-chip';
      chip.textContent = 'SOTA';
      chip.style.cssText = 'font-size:0.65rem;font-weight:700;padding:1px 6px;border-radius:999px;background:#10B981;color:#000;margin-left:6px;vertical-align:middle;text-transform:uppercase;letter-spacing:0.04em;';
      return chip;
    })() : null;

    item.appendChild(dayBadge);
    item.appendChild(name);
    if (kindChip) item.appendChild(kindChip);
    item.appendChild(blockLabel);

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
  /* Handle SOTA results */
  if (result.isSota) {
    navigateToSota(result);
    return;
  }

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

/* === Navigate to SOTA item === */

function navigateToSota(result) {
  /* 1. Switch to the correct chapter tab (triggers lazy SOTA render if needed) */
  if (typeof switchDay === 'function') {
    switchDay(result.chapterKey);
  }

  /* 2. Find the SOTA card by index and expand it */
  setTimeout(() => {
    const containerSelector = '#' + result.chapterKey + '-sota-container';
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const sotaCards = container.querySelectorAll('.sota-card');
    const targetCard = sotaCards[result.sotaIdx];
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
