/**
 * Thesis Study Plan — Interactive App
 * Pure vanilla JS, no dependencies.
 */

/* === Constants === */
const STORAGE_KEYS = {
  CHECKED: 'thesis-study-checked',
  TIMER_STATE: 'thesis-study-timer',
  ACTIVE_DAY: 'thesis-study-active-day',
};

const CHAPTER_KEYS = ['ch21', 'ch22', 'ch23', 'ch24', 'ch25', 'ch26', 'rust', 'method', 'flashcards'];

/*
 * RECENT_LOG_IDS — paper ids that appear in research-log entries from the last 7 days.
 * Seeded manually; regenerate via scripts/weekly-update.sh or fetch research-log/index.json
 * when that file exists.
 * Last updated: 2026-04-17
 */
const RECENT_LOG_IDS = [
  'tessaro-zhu-bbs-2023',
  'saac-2025',
  'zk-creds-2022',
];

const POMODORO = {
  WORK_SECONDS: 25 * 60,
  BREAK_SECONDS: 5 * 60,
};

// T14: Dual Pomodoro presets — chapters mode (25/5) vs Plan mode (50/10)
const POMODORO_PRESETS = {
  chapters: { work: 25, break: 5 },
  plan: { work: 50, break: 10 },
};

// T14: Weekly review localStorage keys
const WEEKLY_REVIEW_KEY = 'weeklyReviewSeen';
const WEEKLY_REVIEW_NOTES_PREFIX = 'weeklyReview:';

const PHASE = {
  WORK: 'Work',
  BREAK: 'Break',
};

/* === Plan state === */
let planInitialized = false;

/* === State === */
let timerState = {
  seconds: POMODORO.WORK_SECONDS,
  phase: PHASE.WORK,
  running: false,
  intervalId: null,
};

// T14: Active Pomodoro preset key ('chapters' or 'plan')
let activePomodoroPreset = 'chapters';

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

  /* Handle ?session=<id> deep-link: switch to Plan tab (plan.js init handles modal) */
  const sessionParam = new URLSearchParams(window.location.search).get('session');
  if (sessionParam) {
    switchPlan();
  } else {
    restoreActiveDay();
  }

  renderStudyGuides();
  if (typeof renderPaperGuides === 'function') {
    renderPaperGuides(RECENT_LOG_IDS);
  }
  if (typeof initConceptSearch === 'function') {
    initConceptSearch();
  }
  /* Render SOTA for the initially active chapter (may be set by restoreActiveDay or default to ch21) */
  if (typeof window.SOTA !== 'undefined') {
    const activeSection = document.querySelector('.day-section.active');
    if (activeSection) {
      const activeKey = activeSection.dataset.day;
      if (activeKey && !sotaRendered[activeKey]) {
        sotaRendered[activeKey] = true;
        window.SOTA.renderChapter(activeKey, '#' + activeKey + '-sota-container');
      }
    }
  }

  // T14: Weekly review modal — shown on Fridays after 3 s if not dismissed today
  initWeeklyReview();
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

/* === SOTA Lazy Render Cache === */
/* Tracks which chapter SOTA sections have already been rendered (first-activation only) */
const sotaRendered = {};

/* === Chapter Tabs === */

function initDayTabs() {
  const tabs = $$('.day-tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const day = tab.dataset.day;
      if (day === 'zk') {
        switchToZKDeepdive();
      } else if (day === 'plan') {
        // T14: Plan tab handled by switchPlan
        switchPlan();
      } else {
        switchDay(day);
      }
    });
  });
}

function switchPlan() {
  const tabs = $$('.day-tab');
  const sections = $$('.day-section');
  const zkSection = $('#zk-deepdive');

  tabs.forEach((tab) => {
    const isActive = tab.dataset.day === 'plan';
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });

  sections.forEach((sec) => {
    const isActive = sec.dataset.day === 'plan';
    sec.classList.toggle('active', isActive);
    sec.hidden = !isActive;
  });

  if (zkSection) {
    zkSection.classList.remove('active');
    zkSection.hidden = true;
  }

  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_DAY, 'plan');
  } catch {
    /* non-critical */
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (!planInitialized && window.PLAN) {
    planInitialized = true;
    window.PLAN.init();
  }

  // T14: Switch to plan Pomodoro preset
  setPomodoroPreset('plan');
}

function switchDay(chapterKey) {
  if (chapterKey === 'plan') {
    switchPlan();
    return;
  }
  const tabs = $$('.day-tab');
  const sections = $$('.day-section');
  const zkSection = $('#zk-deepdive');

  tabs.forEach((tab) => {
    const isActive = tab.dataset.day === chapterKey;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });

  sections.forEach((sec) => {
    const isActive = sec.dataset.day === chapterKey;
    sec.classList.toggle('active', isActive);
    sec.hidden = !isActive;
  });

  /* Hide ZK deep dive when switching to a chapter */
  if (zkSection) {
    zkSection.classList.remove('active');
    zkSection.hidden = true;
  }

  /* Lazy-init flashcards on first visit */
  if (chapterKey === 'flashcards') {
    const fcContainer = document.getElementById('flashcards-section');
    if (fcContainer && fcContainer.children.length === 0 && typeof window.FLASHCARDS_UI !== 'undefined') {
      window.FLASHCARDS_UI.init();
    }
  }

  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_DAY, chapterKey);
  } catch {
    /* non-critical */
  }

  /* Lazily render SOTA section on first activation of this chapter */
  if (!sotaRendered[chapterKey] && typeof window.SOTA !== 'undefined'
      && document.getElementById(chapterKey + '-sota-container')) {
    sotaRendered[chapterKey] = true;
    window.SOTA.renderChapter(chapterKey, '#' + chapterKey + '-sota-container');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });

  /* Update global view toggle color to match new active chapter */
  if (typeof updateGlobalToggleColor === 'function') {
    updateGlobalToggleColor();
  }

  // T14: Restore chapters Pomodoro preset when switching to any chapter
  setPomodoroPreset('chapters');
}

function switchToZKDeepdive() {
  const tabs = $$('.day-tab');
  const sections = $$('.day-section');
  const zkSection = $('#zk-deepdive');

  /* Deactivate all chapter tabs and sections */
  tabs.forEach((tab) => {
    const isZK = tab.dataset.day === 'zk';
    tab.classList.toggle('active', isZK);
    tab.setAttribute('aria-selected', String(isZK));
  });

  sections.forEach((sec) => {
    sec.classList.remove('active');
    sec.hidden = true;
  });

  /* Show ZK deep dive */
  if (zkSection) {
    zkSection.classList.add('active');
    zkSection.hidden = false;

    /* Render on first open (lazy init) */
    const content = $('#zk-deepdive-content');
    if (content && content.children.length === 0 && typeof renderZKDeepdive === 'function') {
      renderZKDeepdive();
    }
  }

  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_DAY, 'zk');
  } catch {
    /* non-critical */
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // T14: ZK Deep Dive is a chapter view — use chapters preset
  setPomodoroPreset('chapters');
}

function restoreActiveDay() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_DAY);
    if (saved) {
      if (saved === 'zk') {
        switchToZKDeepdive();
      } else if (saved === 'plan') {
        switchPlan();
      } else if (CHAPTER_KEYS.includes(saved) && saved !== 'flashcards') {
        /* Don't restore flashcards tab on page load — let user navigate there */
        switchDay(saved);
      } else if (saved === 'flashcards') {
        switchDay(CHAPTER_KEYS[0]);
      } else {
        /* Backward compat: old numeric day values map to first chapter */
        switchDay(CHAPTER_KEYS[0]);
      }
    }
  } catch {
    /* non-critical */
  }
}

// T14: Apply a Pomodoro preset. Does NOT reset a running timer —
// the new durations take effect on the next cycle only.
function setPomodoroPreset(presetKey) {
  const preset = POMODORO_PRESETS[presetKey];
  if (!preset) return;
  activePomodoroPreset = presetKey;
  if (!timerState.running) {
    const seconds = timerState.phase === PHASE.WORK ? preset.work * 60 : preset.break * 60;
    timerState = { ...timerState, seconds };
  }
  renderTimer();
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
  // T14: use active preset for reset duration
  const preset = POMODORO_PRESETS[activePomodoroPreset] || POMODORO_PRESETS.chapters;
  const seconds = timerState.phase === PHASE.WORK ? preset.work * 60 : preset.break * 60;
  timerState = {
    ...timerState,
    seconds: seconds,
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
  // T14: use active preset durations for the next cycle
  const preset = POMODORO_PRESETS[activePomodoroPreset] || POMODORO_PRESETS.chapters;
  const nextSeconds = nextPhase === PHASE.WORK
    ? preset.work * 60
    : preset.break * 60;

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
    document.title = 'Thesis Study Plan';
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

  // T14: Update preset mode indicator
  const modeEl = $('#pomodoro-mode');
  if (modeEl) {
    const preset = POMODORO_PRESETS[activePomodoroPreset] || POMODORO_PRESETS.chapters;
    modeEl.textContent = preset.work + '/' + preset.break;
  }
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
      preset: activePomodoroPreset,
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
    if (data.preset && POMODORO_PRESETS[data.preset]) {
      activePomodoroPreset = data.preset;
    }
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
        const preset = POMODORO_PRESETS[activePomodoroPreset] || POMODORO_PRESETS.chapters;
        const nextSeconds = nextPhase === PHASE.WORK ? preset.work * 60 : preset.break * 60;
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
        switchDay(CHAPTER_KEYS[0]);
        break;
      case '2':
        switchDay(CHAPTER_KEYS[1]);
        break;
      case '3':
        switchDay(CHAPTER_KEYS[2]);
        break;
      case '4':
        switchDay(CHAPTER_KEYS[3]);
        break;
      case '5':
        switchDay(CHAPTER_KEYS[4]);
        break;
      case '6':
        switchDay(CHAPTER_KEYS[5]);
        break;
      case 'z':
      case 'Z':
        switchToZKDeepdive();
        break;
      case 'p':
      case 'P':
        switchPlan();
        break;
      case 'n':
      case 'N':
        if (window.PLAN && typeof window.PLAN.openNextUncompleted === 'function') {
          window.PLAN.openNextUncompleted();
        }
        break;
      case ' ':
        e.preventDefault();
        toggleTimer();
        const panel = $('#pomodoro-panel');
        if (panel && panel.hidden) {
          panel.hidden = false;
        }
        break;
      case 't':
      case 'T':
        toggleGlobalView();
        break;
      case 'l':
      case 'L':
        if (typeof toggleLexiconPanel === 'function') {
          toggleLexiconPanel();
        }
        break;
      case '/':
        e.preventDefault();
        if (typeof focusSearch === 'function') {
          focusSearch();
        }
        break;
      case 'f':
      case 'F':
        switchDay('flashcards');
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

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    nav.classList.toggle('expanded');
  });

  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && nav.classList.contains('expanded')) {
      nav.classList.remove('expanded');
    }
  });

  const mediaQuery = window.matchMedia('(min-width: 769px)');
  const handleResize = (mq) => {
    if (mq.matches) nav.classList.remove('expanded');
  };
  mediaQuery.addEventListener('change', handleResize);
  handleResize(mediaQuery);
}

/* === Global View Toggle (keyboard shortcut) === */

function toggleGlobalView() {
  const activeBtn = document.querySelector('.global-view-btn.active');
  if (!activeBtn) return;

  const targetView = activeBtn.dataset.view === 'intuitive' ? 'technical' : 'intuitive';
  const targetBtn = document.querySelector('.global-view-btn[data-view="' + targetView + '"]');
  if (targetBtn) {
    targetBtn.click();
  }
}

/* === T14: Friday Weekly Review Modal === */

// Returns today's date as YYYY-MM-DD string.
function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

function initWeeklyReview() {
  const isFriday = new Date().getDay() === 5;
  if (!isFriday) return;

  const today = getTodayString();
  let alreadySeen = false;
  try {
    alreadySeen = localStorage.getItem(WEEKLY_REVIEW_KEY) === today;
  } catch {
    /* non-critical */
  }

  if (alreadySeen) return;

  setTimeout(() => {
    openWeeklyReviewModal(today);
  }, 3000);
}

function openWeeklyReviewModal(today) {
  const modal = $('#weekly-review-modal');
  if (!modal) return;
  modal.removeAttribute('hidden');
  modal.setAttribute('aria-hidden', 'false');

  const saveBtn = modal.querySelector('#weekly-review-save');
  const skipBtn = modal.querySelector('#weekly-review-skip');

  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      closeWeeklyReviewModal(today);
    }, { once: true });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      saveWeeklyReviewNotes(today, modal);
      closeWeeklyReviewModal(today);
    }, { once: true });
  }

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeWeeklyReviewModal(today);
    }
  }, { once: true });
}

function closeWeeklyReviewModal(today) {
  const modal = $('#weekly-review-modal');
  if (!modal) return;
  modal.setAttribute('hidden', '');
  modal.setAttribute('aria-hidden', 'true');
  try {
    localStorage.setItem(WEEKLY_REVIEW_KEY, today);
  } catch {
    /* non-critical */
  }
}

function saveWeeklyReviewNotes(today, modal) {
  const checkboxes = modal.querySelectorAll('.weekly-review-check');
  const textArea = modal.querySelector('#weekly-review-notes');
  const notes = {
    date: today,
    checks: {},
    freeText: textArea ? textArea.value : '',
  };

  checkboxes.forEach((cb) => {
    notes.checks[cb.dataset.item] = cb.checked;
  });

  try {
    localStorage.setItem(WEEKLY_REVIEW_NOTES_PREFIX + today, JSON.stringify(notes));
  } catch {
    /* non-critical */
  }
}

/* === Study Guides (logic extracted to study-guide.js) === */
