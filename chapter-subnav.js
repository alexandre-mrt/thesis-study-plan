/**
 * Chapter sub-navigation — tabs within each chapter block to switch between
 * Guide / Papers / Videos / Flashcards / SOTA without scrolling.
 * Runs after app.js init and after paper/guide renderers hydrate their containers.
 */

const CH_SUBNAV_KEY = 'chapter:subnav:active';

const CH_SUBNAV_SECTIONS = [
  { key: 'guide',      label: '📖 Guide',      icon: '' },
  { key: 'papers',     label: '📄 Papers',     icon: '' },
  { key: 'videos',     label: '🎬 Videos',     icon: '' },
  { key: 'flashcards', label: '🗂 Flashcards', icon: '' },
  { key: 'sota',       label: '⚡ SOTA',       icon: '' },
];

const CH_CHAPTER_IDS = ['ch-21', 'ch-22', 'ch-23', 'ch-24', 'ch-25', 'ch-26', 'ch-rust'];

function loadActiveSubsection(chapterId) {
  try {
    const map = JSON.parse(localStorage.getItem(CH_SUBNAV_KEY) || '{}');
    return map[chapterId] || 'guide';
  } catch {
    return 'guide';
  }
}

function saveActiveSubsection(chapterId, key) {
  try {
    const map = JSON.parse(localStorage.getItem(CH_SUBNAV_KEY) || '{}');
    map[chapterId] = key;
    localStorage.setItem(CH_SUBNAV_KEY, JSON.stringify(map));
  } catch {}
}

function chapterKeyFromSectionId(sectionId) {
  if (sectionId === 'ch-rust') return 'rust';
  const m = sectionId.match(/^ch-(\d)(\d)$/);
  return m ? 'ch' + m[1] + m[2] : sectionId;
}

function hasContent(el) {
  if (!el) return false;
  if (el.children && el.children.length > 0) return true;
  return (el.textContent || '').trim().length > 0;
}

function buildFlashcardsSection(chapterKey) {
  const host = document.createElement('div');
  host.className = 'chapter-flashcards-list';
  const cards = (window.FLASHCARDS || []).filter((c) => c.chapter === chapterKey);
  if (cards.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'chapter-flashcards-empty';
    empty.textContent = 'No flashcards yet for this chapter.';
    host.appendChild(empty);
    return host;
  }
  const header = document.createElement('div');
  header.className = 'chapter-flashcards-header';
  header.innerHTML =
    '<span class="chapter-flashcards-count">' +
    cards.length +
    ' cards</span>' +
    '<span class="chapter-flashcards-hint">Tap a card to flip</span>';
  host.appendChild(header);

  const grid = document.createElement('div');
  grid.className = 'chapter-flashcards-grid';
  cards.forEach((c) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'chapter-flashcard';
    card.dataset.flipped = 'false';
    const front = document.createElement('div');
    front.className = 'chapter-flashcard-face chapter-flashcard-front';
    front.textContent = c.front;
    const back = document.createElement('div');
    back.className = 'chapter-flashcard-face chapter-flashcard-back';
    back.textContent = c.back;
    const tag = document.createElement('span');
    tag.className = 'chapter-flashcard-tag';
    tag.textContent = c.category || '';
    card.appendChild(tag);
    card.appendChild(front);
    card.appendChild(back);
    card.addEventListener('click', () => {
      const flipped = card.dataset.flipped === 'true';
      card.dataset.flipped = flipped ? 'false' : 'true';
      card.classList.toggle('flipped', !flipped);
    });
    grid.appendChild(card);
  });
  host.appendChild(grid);
  return host;
}

function wrapSectionIn(subsection, el) {
  const wrap = document.createElement('div');
  wrap.className = 'chapter-section';
  wrap.dataset.subsection = subsection;
  if (el) wrap.appendChild(el);
  return wrap;
}

function setupChapter(section) {
  if (section.dataset.subnavMounted === 'true') return;
  const chapterId = section.id;
  const chapterKey = chapterKeyFromSectionId(chapterId);

  const header = section.querySelector('.day-header');
  const toggleBtns = section.querySelectorAll('.study-guide-toggle');
  const guideContainers = section.querySelectorAll('.study-guide-container');
  const paperContainers = section.querySelectorAll('.paper-guide-container');
  const resourcesGrids = section.querySelectorAll('.resources-grid');
  const sotaContainers = section.querySelectorAll('.sota-container');

  const wrapMany = (key, nodeList) => {
    if (!nodeList || nodeList.length === 0) return null;
    const wrap = document.createElement('div');
    wrap.className = 'chapter-section';
    wrap.dataset.subsection = key;
    nodeList.forEach((n) => wrap.appendChild(n));
    return wrap;
  };

  const sectionMap = {};
  const guide = wrapMany('guide', guideContainers);
  if (guide) sectionMap.guide = guide;
  const papers = wrapMany('papers', paperContainers);
  if (papers) sectionMap.papers = papers;
  const videos = wrapMany('videos', resourcesGrids);
  if (videos) sectionMap.videos = videos;
  sectionMap.flashcards = wrapSectionIn('flashcards', buildFlashcardsSection(chapterKey));
  const sota = wrapMany('sota', sotaContainers);
  if (sota) sectionMap.sota = sota;

  /* Remove the old study-guide toggle buttons — the Guide sub-tab replaces them. */
  toggleBtns.forEach((t) => t.remove());

  /* Build subnav bar */
  const subnav = document.createElement('div');
  subnav.className = 'chapter-subnav';
  subnav.setAttribute('role', 'tablist');
  CH_SUBNAV_SECTIONS.forEach((s) => {
    if (!sectionMap[s.key]) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chapter-subnav-tab';
    btn.dataset.subsection = s.key;
    btn.setAttribute('role', 'tab');
    btn.textContent = s.label;
    subnav.appendChild(btn);
  });

  /* Append subnav + sections after .day-header */
  const anchor = header && header.parentNode === section ? header : null;
  const insertAfter = (node, ref) => {
    if (ref.nextSibling) ref.parentNode.insertBefore(node, ref.nextSibling);
    else ref.parentNode.appendChild(node);
  };
  if (anchor) {
    insertAfter(subnav, anchor);
    let prev = subnav;
    CH_SUBNAV_SECTIONS.forEach((s) => {
      const wrap = sectionMap[s.key];
      if (!wrap) return;
      insertAfter(wrap, prev);
      prev = wrap;
    });
  } else {
    section.insertBefore(subnav, section.firstChild);
    CH_SUBNAV_SECTIONS.forEach((s) => {
      const wrap = sectionMap[s.key];
      if (wrap) section.appendChild(wrap);
    });
  }

  /* Activate default subsection */
  const saved = loadActiveSubsection(chapterId);
  const defaultKey = sectionMap[saved] ? saved : Object.keys(sectionMap)[0];
  activateSubsection(section, defaultKey);

  /* Wire click listeners */
  subnav.querySelectorAll('.chapter-subnav-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      activateSubsection(section, btn.dataset.subsection);
      saveActiveSubsection(chapterId, btn.dataset.subsection);
    });
  });

  section.dataset.subnavMounted = 'true';
}

function activateSubsection(section, key) {
  section.querySelectorAll('.chapter-subnav-tab').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.subsection === key);
    btn.setAttribute('aria-selected', btn.dataset.subsection === key ? 'true' : 'false');
  });
  section.querySelectorAll('.chapter-section').forEach((el) => {
    el.classList.toggle('active', el.dataset.subsection === key);
  });

  /* Study guide content is rendered on page load into .study-guide-container.
     Force its .study-guide child into the .open state (original toggle is gone). */
  if (key === 'guide') {
    section.querySelectorAll('.study-guide-container .study-guide').forEach((sg) => {
      sg.classList.add('open');
    });
  }
}

function mountAll() {
  CH_CHAPTER_IDS.forEach((id) => {
    const section = document.getElementById(id);
    if (section) setupChapter(section);
  });
}

function init() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(mountAll, 50));
  } else {
    setTimeout(mountAll, 50);
  }
}

window.CHAPTER_SUBNAV = { init, mountAll };
init();
