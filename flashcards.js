/**
 * Flashcards UI — Mobile spaced-repetition deck
 * Session-based: failed cards re-queue 3-5 positions ahead.
 * No external dependencies.
 */

/* === Constants === */
const FC_KEYS = {
  DECK_STATE: 'flashcards:deck:state',
  CHAPTER_FILTER: 'flashcards:chapter:filter',
  CARD_STATS: 'flashcards:stats:',
};

const FC_SESSION_SIZE = 20;
const FC_RETRY_OFFSET_MIN = 3;
const FC_RETRY_OFFSET_MAX = 5;

const FC_CHAPTER_LABELS = {
  all: 'All',
  ch21: 'Ch 2.1',
  ch22: 'Ch 2.2',
  ch23: 'Ch 2.3',
  ch24: 'Ch 2.4',
  ch25: 'Ch 2.5',
  ch26: 'Ch 2.6',
  rust: 'Rust',
};

/* === State === */
let fcState = {
  allCards: [],
  queue: [],
  currentIdx: 0,
  flipped: false,
  correctCount: 0,
  wrongIds: [],
  startedAt: null,
  chapterFilter: 'all',
  initialized: false,
  sessionDone: false,
};

/* === Public API === */
window.FLASHCARDS_UI = {
  init,
  startSession,
  flipCard,
  markCorrect,
  markWrong,
  nextCard,
  resetDeck,
};

/* === Initialization === */

function init() {
  if (fcState.initialized) return;

  if (!window.FLASHCARDS || window.FLASHCARDS.length === 0) {
    console.error('FLASHCARDS data not loaded');
    return;
  }

  fcState = {
    ...fcState,
    allCards: window.FLASHCARDS,
    chapterFilter: loadChapterFilter(),
    initialized: true,
  };

  render();
  startSession();
}

/* === Session Management === */

function startSession() {
  const filtered = filterCards(fcState.chapterFilter);
  const sorted = sortByMostWrong(filtered);
  const shuffled = shuffleArray(sorted);
  const queue = shuffled.slice(0, FC_SESSION_SIZE).map((c) => ({ ...c }));

  fcState = {
    ...fcState,
    queue,
    currentIdx: 0,
    flipped: false,
    correctCount: 0,
    wrongIds: [],
    startedAt: Date.now(),
    sessionDone: false,
  };

  saveDeckState();
  renderCard();
  updateProgress();
}

function filterCards(chapter) {
  if (chapter === 'all') return fcState.allCards;
  return fcState.allCards.filter((c) => c.chapter === chapter);
}

function sortByMostWrong(cards) {
  return [...cards].sort((a, b) => {
    const statsA = loadCardStats(a.id);
    const statsB = loadCardStats(b.id);
    const ratioA = statsA.seen > 0 ? statsA.correct / statsA.seen : 0.5;
    const ratioB = statsB.seen > 0 ? statsB.correct / statsB.seen : 0.5;
    return ratioA - ratioB;
  });
}

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

/* === Card Actions === */

function flipCard() {
  if (fcState.sessionDone) return;

  fcState = { ...fcState, flipped: !fcState.flipped };
  const cardEl = document.getElementById('fc-card');
  if (!cardEl) return;

  cardEl.classList.toggle('fc-flipped', fcState.flipped);

  const actionBar = document.getElementById('fc-actions');
  if (actionBar) {
    actionBar.classList.toggle('fc-actions-visible', fcState.flipped);
  }
}

function markCorrect() {
  const card = currentCard();
  if (!card) return;

  updateCardStats(card.id, true);

  fcState = {
    ...fcState,
    correctCount: fcState.correctCount + 1,
    flipped: false,
  };

  advanceQueue();
}

function markWrong() {
  const card = currentCard();
  if (!card) return;

  updateCardStats(card.id, false);

  const offset = FC_RETRY_OFFSET_MIN +
    Math.floor(Math.random() * (FC_RETRY_OFFSET_MAX - FC_RETRY_OFFSET_MIN + 1));
  const insertAt = Math.min(fcState.currentIdx + 1 + offset, fcState.queue.length);

  const newQueue = [
    ...fcState.queue.slice(0, insertAt),
    { ...card },
    ...fcState.queue.slice(insertAt),
  ];

  fcState = {
    ...fcState,
    queue: newQueue,
    wrongIds: [...fcState.wrongIds, card.id],
    flipped: false,
  };

  advanceQueue();
}

function advanceQueue() {
  const nextIdx = fcState.currentIdx + 1;

  if (nextIdx >= fcState.queue.length) {
    fcState = { ...fcState, sessionDone: true };
    saveDeckState();
    renderSessionEnd();
    return;
  }

  fcState = { ...fcState, currentIdx: nextIdx };
  saveDeckState();
  renderCard();
  updateProgress();
}

function nextCard() {
  advanceQueue();
}

function resetDeck() {
  fcState = {
    ...fcState,
    sessionDone: false,
    flipped: false,
  };
  startSession();
}

function currentCard() {
  return fcState.queue[fcState.currentIdx] || null;
}

/* === Chapter Filter === */

function setChapterFilter(chapter) {
  fcState = { ...fcState, chapterFilter: chapter };
  saveChapterFilter(chapter);

  const chips = document.querySelectorAll('.fc-chip');
  chips.forEach((chip) => {
    chip.classList.toggle('fc-chip-active', chip.dataset.chapter === chapter);
  });

  startSession();
}

/* === Rendering === */

function render() {
  const container = document.getElementById('flashcards-section');
  if (!container) return;

  container.innerHTML = buildHTML();
  attachEventListeners();
}

function buildHTML() {
  const chapterKeys = Object.keys(FC_CHAPTER_LABELS);
  const chips = chapterKeys.map((ch) => {
    const active = ch === fcState.chapterFilter ? ' fc-chip-active' : '';
    return `<button class="fc-chip${active}" data-chapter="${ch}" aria-pressed="${ch === fcState.chapterFilter}">${FC_CHAPTER_LABELS[ch]}</button>`;
  }).join('');

  return `
    <div class="fc-wrapper">
      <div class="fc-top-bar">
        <div class="fc-chips" role="group" aria-label="Chapter filter">
          ${chips}
        </div>
        <div class="fc-top-actions">
          <button class="fc-btn-secondary" id="fc-shuffle-btn" title="New shuffled session">Shuffle</button>
          <span class="fc-progress-label" id="fc-progress-label">0 / 0</span>
        </div>
      </div>

      <div class="fc-progress-bar-wrap">
        <div class="fc-progress-bar" id="fc-progress-bar" style="width: 0%"></div>
      </div>

      <div class="fc-scene" id="fc-scene">
        <div class="fc-card" id="fc-card" role="button" tabindex="0" aria-label="Flashcard — tap to flip">
          <div class="fc-front" id="fc-front">
            <div class="fc-chapter-tag" id="fc-chapter-tag"></div>
            <div class="fc-question" id="fc-question"></div>
            <div class="fc-flip-hint">Tap to reveal</div>
          </div>
          <div class="fc-back" id="fc-back">
            <div class="fc-answer" id="fc-answer"></div>
            <div class="fc-category-tag" id="fc-category-tag"></div>
          </div>
        </div>
      </div>

      <div class="fc-actions" id="fc-actions" aria-hidden="true">
        <button class="fc-btn fc-btn-wrong" id="fc-wrong-btn" aria-label="Retry this card">
          Retry &#x1F501;
        </button>
        <button class="fc-btn fc-btn-correct" id="fc-correct-btn" aria-label="Mark as correct">
          Got it &#x2713;
        </button>
      </div>

      <div class="fc-session-end" id="fc-session-end" hidden>
        <div class="fc-summary">
          <div class="fc-summary-title" id="fc-summary-title">Session Complete</div>
          <div class="fc-summary-score" id="fc-summary-score"></div>
          <div class="fc-summary-time" id="fc-summary-time"></div>
          <button class="fc-btn-restart" id="fc-restart-btn">Restart Session</button>
        </div>
      </div>
    </div>
  `;
}

function attachEventListeners() {
  const card = document.getElementById('fc-card');
  if (card) {
    card.addEventListener('click', () => flipCard());
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        flipCard();
      }
    });
  }

  const correctBtn = document.getElementById('fc-correct-btn');
  if (correctBtn) {
    correctBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      markCorrect();
    });
  }

  const wrongBtn = document.getElementById('fc-wrong-btn');
  if (wrongBtn) {
    wrongBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      markWrong();
    });
  }

  const shuffleBtn = document.getElementById('fc-shuffle-btn');
  if (shuffleBtn) {
    shuffleBtn.addEventListener('click', () => startSession());
  }

  const restartBtn = document.getElementById('fc-restart-btn');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => resetDeck());
  }

  const chips = document.querySelectorAll('.fc-chip');
  chips.forEach((chip) => {
    chip.addEventListener('click', () => setChapterFilter(chip.dataset.chapter));
  });

  document.addEventListener('keydown', handleGlobalKeydown);
}

function handleGlobalKeydown(e) {
  if (isTypingField(e.target)) return;

  const activeSection = document.getElementById('flashcards');
  if (!activeSection || activeSection.hidden) return;

  switch (e.key) {
    case ' ':
      e.preventDefault();
      flipCard();
      break;
    case 'ArrowLeft':
      if (fcState.flipped) {
        e.preventDefault();
        markCorrect();
      }
      break;
    case 'ArrowRight':
      if (fcState.flipped) {
        e.preventDefault();
        markWrong();
      }
      break;
  }
}

function isTypingField(target) {
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

function renderCard() {
  const card = currentCard();

  const sceneEl = document.getElementById('fc-scene');
  const sessionEndEl = document.getElementById('fc-session-end');
  const cardEl = document.getElementById('fc-card');
  const questionEl = document.getElementById('fc-question');
  const answerEl = document.getElementById('fc-answer');
  const chapterTagEl = document.getElementById('fc-chapter-tag');
  const categoryTagEl = document.getElementById('fc-category-tag');
  const actionsEl = document.getElementById('fc-actions');

  if (!card || !sceneEl || !sessionEndEl || !cardEl) return;

  sessionEndEl.hidden = true;
  sceneEl.hidden = false;

  if (questionEl) questionEl.textContent = card.front;
  if (answerEl) answerEl.textContent = card.back;
  if (chapterTagEl) chapterTagEl.textContent = FC_CHAPTER_LABELS[card.chapter] || card.chapter;

  const categoryLabels = { definition: 'Definition', fact: 'Key Fact', acronym: 'Acronym', concept: 'Concept' };
  if (categoryTagEl) categoryTagEl.textContent = categoryLabels[card.category] || card.category;

  cardEl.classList.remove('fc-flipped');
  if (actionsEl) actionsEl.classList.remove('fc-actions-visible');

  // NIGHT-SHIFT-REVIEW: ch26 color hardcoded — no --color-ch26 CSS var in style.css yet
  const chapterColors = {
    ch21: '#06B6D4',
    ch22: '#F59E0B',
    ch23: '#10B981',
    ch24: '#EC4899',
    ch25: '#6366F1',
    ch26: '#8B5CF6',
    rust: '#F97316',
  };
  const color = chapterColors[card.chapter] || '#6366F1';
  cardEl.style.setProperty('--fc-accent', color);
}

function renderSessionEnd() {
  const sceneEl = document.getElementById('fc-scene');
  const sessionEndEl = document.getElementById('fc-session-end');
  const actionsEl = document.getElementById('fc-actions');
  const scoreEl = document.getElementById('fc-summary-score');
  const timeEl = document.getElementById('fc-summary-time');
  const titleEl = document.getElementById('fc-summary-title');

  if (!sessionEndEl) return;

  if (sceneEl) sceneEl.hidden = true;
  if (actionsEl) actionsEl.classList.remove('fc-actions-visible');
  sessionEndEl.hidden = false;

  const total = fcState.queue.length;
  const correct = fcState.correctCount;
  const elapsed = fcState.startedAt ? Math.floor((Date.now() - fcState.startedAt) / 1000) : 0;
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  if (scoreEl) {
    scoreEl.textContent = `${correct} / ${total} correct`;
  }

  if (timeEl) {
    timeEl.textContent = `Time: ${mins}m ${String(secs).padStart(2, '0')}s`;
  }

  const isPerfect = correct === total && total > 0;
  if (titleEl) {
    titleEl.textContent = isPerfect ? 'Perfect Session!' : 'Session Complete';
    titleEl.classList.toggle('fc-summary-perfect', isPerfect);
  }
}

function updateProgress() {
  const total = fcState.queue.length;
  const done = fcState.currentIdx;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const label = document.getElementById('fc-progress-label');
  const bar = document.getElementById('fc-progress-bar');

  if (label) label.textContent = `${done} / ${total}`;
  if (bar) bar.style.width = pct + '%';
}

/* === localStorage === */

function saveDeckState() {
  try {
    const data = {
      currentIdx: fcState.currentIdx,
      correctCount: fcState.correctCount,
      wrongIds: fcState.wrongIds,
      startedAt: fcState.startedAt,
    };
    localStorage.setItem(FC_KEYS.DECK_STATE, JSON.stringify(data));
  } catch {
    /* non-critical */
  }
}

function saveChapterFilter(chapter) {
  try {
    localStorage.setItem(FC_KEYS.CHAPTER_FILTER, chapter);
  } catch {
    /* non-critical */
  }
}

function loadChapterFilter() {
  try {
    const val = localStorage.getItem(FC_KEYS.CHAPTER_FILTER);
    return val && FC_CHAPTER_LABELS[val] ? val : 'all';
  } catch {
    return 'all';
  }
}

function loadCardStats(cardId) {
  try {
    const raw = localStorage.getItem(FC_KEYS.CARD_STATS + cardId);
    if (!raw) return { seen: 0, correct: 0, lastSeen: null };
    return JSON.parse(raw);
  } catch {
    return { seen: 0, correct: 0, lastSeen: null };
  }
}

function updateCardStats(cardId, wasCorrect) {
  try {
    const stats = loadCardStats(cardId);
    const updated = {
      seen: stats.seen + 1,
      correct: wasCorrect ? stats.correct + 1 : stats.correct,
      lastSeen: Date.now(),
    };
    localStorage.setItem(FC_KEYS.CARD_STATS + cardId, JSON.stringify(updated));
  } catch {
    /* non-critical */
  }
}
