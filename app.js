/**
 * Thesis Study Plan — Interactive App
 * Pure vanilla JS, no dependencies.
 */

/* === Constants === */
const STORAGE_KEYS = {
  CHECKED: 'thesis-study-checked',
  TIMER_STATE: 'thesis-study-timer',
  ACTIVE_DAY: 'thesis-study-active-day',
  STUDY_GUIDE_STATE: 'studyGuideState',
};

const POMODORO = {
  WORK_SECONDS: 25 * 60,
  BREAK_SECONDS: 5 * 60,
};

const PHASE = {
  WORK: 'Work',
  BREAK: 'Break',
};

/* === State === */
let timerState = {
  seconds: POMODORO.WORK_SECONDS,
  phase: PHASE.WORK,
  running: false,
  intervalId: null,
};

/* === DOM References === */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/* === Initialization === */
document.addEventListener('DOMContentLoaded', () => {
  initCheckboxes();
  initDayTabs();
  initPomodoro();
  initYouTubeThumbnails();
  initKeyboardShortcuts();
  initMobileMenu();
  updateProgress();
  restoreActiveDay();
  renderStudyGuides();
});

/* === Checkbox / Progress === */

function initCheckboxes() {
  const saved = loadChecked();
  const checkboxes = $$('.resource-check');

  checkboxes.forEach((cb) => {
    const id = cb.dataset.id;
    if (saved[id]) {
      cb.checked = true;
      markCardCompleted(cb, true);
    }

    cb.addEventListener('change', () => {
      const current = loadChecked();
      const updated = { ...current, [cb.dataset.id]: cb.checked };
      saveChecked(updated);
      markCardCompleted(cb, cb.checked);
      updateProgress();
    });
  });
}

function markCardCompleted(checkbox, isCompleted) {
  const card = checkbox.closest('.resource-card');
  if (!card) return;
  card.classList.toggle('completed', isCompleted);
}

function updateProgress() {
  const total = $$('.resource-check').length;
  if (total === 0) return;

  const checked = $$('.resource-check:checked').length;
  const pct = Math.round((checked / total) * 100);

  const bar = $('#progress-bar');
  const text = $('#progress-text');
  if (bar) bar.style.width = pct + '%';
  if (text) text.textContent = pct + '%';
}

function loadChecked() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHECKED);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveChecked(data) {
  try {
    localStorage.setItem(STORAGE_KEYS.CHECKED, JSON.stringify(data));
  } catch {
    console.error('Failed to save checkbox state to localStorage');
  }
}

/* === Day Tabs === */

function initDayTabs() {
  const tabs = $$('.day-tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      switchDay(Number(tab.dataset.day));
    });
  });
}

function switchDay(dayNum) {
  const tabs = $$('.day-tab');
  const sections = $$('.day-section');

  tabs.forEach((tab) => {
    const isActive = Number(tab.dataset.day) === dayNum;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });

  sections.forEach((sec) => {
    const isActive = Number(sec.dataset.day) === dayNum;
    sec.classList.toggle('active', isActive);
    sec.hidden = !isActive;
  });

  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_DAY, String(dayNum));
  } catch {
    /* non-critical */
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function restoreActiveDay() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_DAY);
    if (saved) {
      const dayNum = Number(saved);
      if (dayNum >= 1 && dayNum <= 3) {
        switchDay(dayNum);
      }
    }
  } catch {
    /* non-critical */
  }
}

/* === Pomodoro Timer === */

function initPomodoro() {
  restoreTimerState();

  const toggle = $('#pomodoro-toggle');
  const panel = $('#pomodoro-panel');
  const startBtn = $('#pomo-start');
  const pauseBtn = $('#pomo-pause');
  const resetBtn = $('#pomo-reset');

  if (toggle && panel) {
    toggle.addEventListener('click', () => {
      panel.hidden = !panel.hidden;
    });
  }

  if (startBtn) startBtn.addEventListener('click', startTimer);
  if (pauseBtn) pauseBtn.addEventListener('click', pauseTimer);
  if (resetBtn) resetBtn.addEventListener('click', resetTimer);

  renderTimer();

  if (timerState.running) {
    resumeTimerInterval();
  }
}

function startTimer() {
  if (timerState.running) return;
  timerState = { ...timerState, running: true };
  resumeTimerInterval();
  updateTimerButtons();
  saveTimerState();
}

function pauseTimer() {
  if (!timerState.running) return;
  clearTimerInterval();
  timerState = { ...timerState, running: false };
  updateTimerButtons();
  saveTimerState();
}

function resetTimer() {
  clearTimerInterval();
  timerState = {
    ...timerState,
    seconds: timerState.phase === PHASE.WORK ? POMODORO.WORK_SECONDS : POMODORO.BREAK_SECONDS,
    running: false,
  };
  renderTimer();
  updateTimerButtons();
  saveTimerState();
}

function toggleTimer() {
  if (timerState.running) {
    pauseTimer();
  } else {
    startTimer();
  }
}

function resumeTimerInterval() {
  clearTimerInterval();
  timerState.intervalId = setInterval(() => {
    timerState = { ...timerState, seconds: timerState.seconds - 1 };

    if (timerState.seconds <= 0) {
      onTimerComplete();
    }

    renderTimer();
    saveTimerState();
  }, 1000);
  updateTimerButtons();
}

function clearTimerInterval() {
  if (timerState.intervalId !== null) {
    clearInterval(timerState.intervalId);
    timerState = { ...timerState, intervalId: null };
  }
}

function onTimerComplete() {
  clearTimerInterval();

  const nextPhase = timerState.phase === PHASE.WORK ? PHASE.BREAK : PHASE.WORK;
  const nextSeconds = nextPhase === PHASE.WORK ? POMODORO.WORK_SECONDS : POMODORO.BREAK_SECONDS;

  timerState = {
    ...timerState,
    phase: nextPhase,
    seconds: nextSeconds,
    running: false,
  };

  renderTimer();
  updateTimerButtons();
  saveTimerState();
  notifyTimerComplete(nextPhase);
}

function notifyTimerComplete(nextPhase) {
  const msg = nextPhase === PHASE.BREAK
    ? 'Work session complete. Time for a break!'
    : 'Break over. Ready to focus!';

  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Pomodoro Timer', { body: msg });
  } else if ('Notification' in window && Notification.permission !== 'denied') {
    Notification.requestPermission();
  }

  document.title = msg;
  setTimeout(() => {
    document.title = 'Thesis Deep Work Plan';
  }, 5000);
}

function renderTimer() {
  const display = formatTime(timerState.seconds);

  const navDisplay = $('#pomodoro-display');
  const panelDisplay = $('#pomodoro-timer');
  const phaseLabel = $('#pomodoro-phase');

  if (navDisplay) {
    navDisplay.textContent = display;
    navDisplay.classList.toggle('running', timerState.running && timerState.phase === PHASE.WORK);
    navDisplay.classList.toggle('break-phase', timerState.phase === PHASE.BREAK);
  }

  if (panelDisplay) panelDisplay.textContent = display;
  if (phaseLabel) phaseLabel.textContent = timerState.phase;
}

function updateTimerButtons() {
  const startBtn = $('#pomo-start');
  const pauseBtn = $('#pomo-pause');

  if (startBtn) startBtn.disabled = timerState.running;
  if (pauseBtn) pauseBtn.disabled = !timerState.running;
}

function formatTime(totalSeconds) {
  const clamped = Math.max(0, totalSeconds);
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
}

function saveTimerState() {
  try {
    const data = {
      seconds: timerState.seconds,
      phase: timerState.phase,
      running: timerState.running,
      savedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEYS.TIMER_STATE, JSON.stringify(data));
  } catch {
    /* non-critical */
  }
}

function restoreTimerState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TIMER_STATE);
    if (!raw) return;

    const data = JSON.parse(raw);
    timerState = {
      ...timerState,
      seconds: data.seconds,
      phase: data.phase,
      running: false,
      intervalId: null,
    };

    if (data.running && data.savedAt) {
      const elapsed = Math.floor((Date.now() - data.savedAt) / 1000);
      const remaining = data.seconds - elapsed;

      if (remaining > 0) {
        timerState = { ...timerState, seconds: remaining, running: true };
      } else {
        const nextPhase = data.phase === PHASE.WORK ? PHASE.BREAK : PHASE.WORK;
        const nextSeconds = nextPhase === PHASE.WORK ? POMODORO.WORK_SECONDS : POMODORO.BREAK_SECONDS;
        timerState = { ...timerState, phase: nextPhase, seconds: nextSeconds, running: false };
      }
    }
  } catch {
    /* fallback to default state */
  }
}

/* === YouTube Lite-Embed === */

function initYouTubeThumbnails() {
  const thumbnails = $$('.yt-thumbnail');
  thumbnails.forEach((thumb) => {
    thumb.addEventListener('click', (e) => {
      e.preventDefault();
      loadYouTubeIframe(thumb);
    });
  });
}

function loadYouTubeIframe(container) {
  const videoId = container.dataset.ytid;
  if (!videoId) return;

  const existingIframe = container.querySelector('iframe');
  if (existingIframe) return;

  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  iframe.allowFullscreen = true;
  iframe.title = 'YouTube video player';

  const img = container.querySelector('img');
  const playBtn = container.querySelector('.yt-play-btn');
  if (img) img.style.display = 'none';
  if (playBtn) playBtn.style.display = 'none';

  container.appendChild(iframe);
}

/* === Keyboard Shortcuts === */

function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (isTyping(e)) return;

    switch (e.key) {
      case '1':
        switchDay(1);
        break;
      case '2':
        switchDay(2);
        break;
      case '3':
        switchDay(3);
        break;
      case ' ':
        e.preventDefault();
        toggleTimer();
        const panel = $('#pomodoro-panel');
        if (panel && panel.hidden) {
          panel.hidden = false;
        }
        break;
    }
  });
}

function isTyping(event) {
  const tag = event.target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || event.target.isContentEditable;
}

/* === Mobile Menu === */

function initMobileMenu() {
  const btn = $('#mobile-menu-btn');
  const nav = $('#nav');
  if (!btn || !nav) return;

  nav.classList.add('collapsed');

  btn.addEventListener('click', () => {
    const isExpanded = nav.classList.contains('expanded');
    nav.classList.toggle('collapsed', !isExpanded);
    nav.classList.toggle('expanded', isExpanded ? false : true);
  });

  const mediaQuery = window.matchMedia('(min-width: 769px)');
  const handleResize = (mq) => {
    if (mq.matches) {
      nav.classList.remove('collapsed', 'expanded');
    } else {
      if (!nav.classList.contains('expanded')) {
        nav.classList.add('collapsed');
      }
    }
  };

  mediaQuery.addEventListener('change', handleResize);
  handleResize(mediaQuery);
}

/* === Study Guides === */

const GUIDE_DATA_MAP = {
  1: () => window.DAY1_GUIDE,
  2: () => window.DAY2_GUIDE,
  3: () => window.DAY3_GUIDE,
};

const BLOCK_KEYS = { 1: 'block1', 2: 'block2' };

function loadGuideState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDY_GUIDE_STATE);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveGuideState(state) {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDY_GUIDE_STATE, JSON.stringify(state));
  } catch {
    console.error('Failed to save study guide state to localStorage');
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function renderStudyGuides() {
  const containers = $$('.study-guide-container[data-day][data-block]');
  const savedState = loadGuideState();

  containers.forEach((container) => {
    const dayNum = Number(container.dataset.day);
    const blockNum = Number(container.dataset.block);
    const guideGetter = GUIDE_DATA_MAP[dayNum];
    if (!guideGetter) return;

    const guide = guideGetter();
    if (!guide) return;

    const blockKey = BLOCK_KEYS[blockNum];
    if (!blockKey || !guide[blockKey]) return;

    const blockData = guide[blockKey];
    const stateKey = 'd' + dayNum + 'b' + blockNum;

    const guideEl = document.createElement('div');
    guideEl.className = 'study-guide';
    guideEl.style.setProperty('--day-color', 'var(--color-day' + dayNum + ')');

    guideEl.appendChild(buildConnectionsSummary(blockData.connectionsSummary, dayNum));

    const concepts = blockData.concepts || [];
    concepts.forEach((concept, idx) => {
      guideEl.appendChild(buildConceptCard(concept, dayNum, stateKey, idx, savedState));
    });

    container.appendChild(guideEl);

    if (savedState[stateKey + '-open']) {
      guideEl.classList.add('open');
      const toggle = container.previousElementSibling;
      if (toggle && toggle.classList.contains('study-guide-toggle')) {
        toggle.classList.add('active');
      }
    }
  });

  initStudyGuideToggles();
}

function buildConnectionsSummary(text, dayNum) {
  const el = document.createElement('div');
  el.className = 'connections-summary';
  el.style.setProperty('--day-color', 'var(--color-day' + dayNum + ')');
  el.innerHTML =
    '<span class="connections-summary-label">Thesis Connections</span>' +
    escapeHtml(text);
  return el;
}

function buildConceptCard(concept, dayNum, stateKey, idx, savedState) {
  const card = document.createElement('div');
  card.className = 'concept-card';
  card.style.setProperty('--day-color', 'var(--color-day' + dayNum + ')');

  const conceptKey = stateKey + '-c' + idx;

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

  if (concept.analogy) {
    const analogy = document.createElement('blockquote');
    analogy.className = 'concept-analogy';
    analogy.textContent = concept.analogy;
    body.appendChild(analogy);
  }

  if (concept.diagram) {
    const diagram = document.createElement('pre');
    diagram.className = 'concept-diagram';
    diagram.textContent = concept.diagram;
    body.appendChild(diagram);
  }

  if (concept.keyPoints && concept.keyPoints.length > 0) {
    const ul = document.createElement('ul');
    ul.className = 'concept-keypoints';
    concept.keyPoints.forEach((point) => {
      const li = document.createElement('li');
      li.textContent = point;
      ul.appendChild(li);
    });
    body.appendChild(ul);
  }

  if (concept.connections) {
    const conn = document.createElement('p');
    conn.className = 'concept-connections';
    conn.innerHTML =
      '<span class="concept-connections-prefix">&#128279; Thesis link: </span>' +
      escapeHtml(concept.connections);
    body.appendChild(conn);
  }

  card.appendChild(body);

  if (savedState[conceptKey]) {
    card.classList.add('open');
  }

  return card;
}

function initStudyGuideToggles() {
  const toggles = $$('.study-guide-toggle');

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
