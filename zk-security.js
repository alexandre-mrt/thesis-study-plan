/**
 * ZK Security Audit — Rendering Logic
 * Reads ZK_SECURITY_DATA and renders the security audit page
 * as categorized collapsible cards with severity badges and code examples.
 */

const ZK_SEC_STORAGE_KEY = 'zkSecurityState';

function loadSecurityState() {
  try {
    const raw = localStorage.getItem(ZK_SEC_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveSecurityState(state) {
  try { localStorage.setItem(ZK_SEC_STORAGE_KEY, JSON.stringify(state)); }
  catch { /* noop */ }
}

function escapeSecHtml(text) {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

const SEVERITY_COLORS = {
  critical: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', border: '#ef4444' },
  high:     { bg: 'rgba(249,115,22,0.15)', text: '#f97316', border: '#f97316' },
  medium:   { bg: 'rgba(234,179,8,0.15)',  text: '#eab308', border: '#eab308' },
  low:      { bg: 'rgba(34,197,94,0.15)',  text: '#22c55e', border: '#22c55e' },
  info:     { bg: 'rgba(99,102,241,0.15)', text: '#6366f1', border: '#6366f1' },
};

function buildSeverityBadge(severity) {
  const s = (severity || 'info').toLowerCase();
  const c = SEVERITY_COLORS[s] || SEVERITY_COLORS.info;
  const badge = document.createElement('span');
  badge.className = 'zk-sec-severity';
  badge.textContent = s.toUpperCase();
  badge.style.cssText =
    'font-size:0.65rem;font-weight:700;padding:2px 8px;border-radius:999px;' +
    'letter-spacing:0.06em;background:' + c.bg + ';color:' + c.text +
    ';border:1px solid ' + c.border + ';';
  return badge;
}

function buildVulnCard(vuln, catId, idx, savedState) {
  const cardId = catId + '-' + idx;
  const card = document.createElement('div');
  card.className = 'zk-sec-card';
  card.id = cardId;

  const header = document.createElement('div');
  header.className = 'zk-sec-card-header';

  const titleWrap = document.createElement('div');
  titleWrap.className = 'zk-sec-card-title-wrap';

  const title = document.createElement('h4');
  title.className = 'zk-sec-card-title';
  title.textContent = vuln.name;

  const badges = document.createElement('div');
  badges.className = 'zk-sec-badges';
  badges.appendChild(buildSeverityBadge(vuln.severity));
  if (vuln.year) {
    const yearBadge = document.createElement('span');
    yearBadge.className = 'zk-sec-year';
    yearBadge.textContent = vuln.year;
    badges.appendChild(yearBadge);
  }
  if (vuln.tags) {
    vuln.tags.forEach(function(t) {
      const tag = document.createElement('span');
      tag.className = 'zk-sec-tag';
      tag.textContent = t;
      badges.appendChild(tag);
    });
  }

  titleWrap.appendChild(title);
  titleWrap.appendChild(badges);

  const chevron = document.createElement('span');
  chevron.className = 'zk-sec-chevron';
  chevron.innerHTML = '&#9660;';

  header.appendChild(titleWrap);
  header.appendChild(chevron);

  header.addEventListener('click', function() {
    card.classList.toggle('open');
    var st = loadSecurityState();
    st[cardId] = card.classList.contains('open');
    saveSecurityState(st);
  });

  card.appendChild(header);

  const body = document.createElement('div');
  body.className = 'zk-sec-card-body';

  if (vuln.description) {
    const desc = document.createElement('div');
    desc.className = 'zk-sec-desc';
    desc.innerHTML = vuln.description;
    body.appendChild(desc);
  }

  if (vuln.diagram) {
    const diag = document.createElement('pre');
    diag.className = 'zk-sec-diagram';
    diag.textContent = vuln.diagram;
    body.appendChild(diag);
  }

  if (vuln.vulnerable_code) {
    const codeBlock = document.createElement('div');
    codeBlock.className = 'zk-sec-code-block';
    const codeLabel = document.createElement('div');
    codeLabel.className = 'zk-sec-code-label zk-sec-code-bad';
    codeLabel.textContent = '✗ Vulnerable';
    const code = document.createElement('pre');
    code.className = 'zk-sec-code';
    code.innerHTML = '<code>' + vuln.vulnerable_code + '</code>';
    codeBlock.appendChild(codeLabel);
    codeBlock.appendChild(code);
    body.appendChild(codeBlock);
  }

  if (vuln.fixed_code) {
    const codeBlock = document.createElement('div');
    codeBlock.className = 'zk-sec-code-block';
    const codeLabel = document.createElement('div');
    codeLabel.className = 'zk-sec-code-label zk-sec-code-good';
    codeLabel.textContent = '✓ Fixed';
    const code = document.createElement('pre');
    code.className = 'zk-sec-code';
    code.innerHTML = '<code>' + vuln.fixed_code + '</code>';
    codeBlock.appendChild(codeLabel);
    codeBlock.appendChild(code);
    body.appendChild(codeBlock);
  }

  if (vuln.impact) {
    const impact = document.createElement('div');
    impact.className = 'zk-sec-impact';
    impact.innerHTML = '<strong>Impact:</strong> ' + escapeSecHtml(vuln.impact);
    body.appendChild(impact);
  }

  if (vuln.mitigation) {
    const mit = document.createElement('div');
    mit.className = 'zk-sec-mitigation';
    mit.innerHTML = '<strong>Mitigation:</strong> ' + escapeSecHtml(vuln.mitigation);
    body.appendChild(mit);
  }

  if (vuln.references) {
    const refs = document.createElement('div');
    refs.className = 'zk-sec-refs';
    refs.innerHTML = '<strong>References:</strong> ' + vuln.references;
    body.appendChild(refs);
  }

  card.appendChild(body);

  if (savedState[cardId]) {
    card.classList.add('open');
  }

  return card;
}

function renderZKSecurity() {
  const container = document.getElementById('zk-security-content');
  if (!container) return;
  const data = window.ZK_SECURITY_DATA;
  if (!data || !data.categories) return;

  const savedState = loadSecurityState();

  const headerEl = document.createElement('div');
  headerEl.className = 'zk-sec-page-header';
  headerEl.innerHTML =
    '<div class="zk-sec-page-label">SECURITY AUDIT</div>' +
    '<h1 class="zk-sec-page-title">ZK Proof Security</h1>' +
    '<p class="zk-sec-page-subtitle">Attack vectors, circuit pitfalls, production exploits, ' +
    'and audit checklists. Every vulnerability that matters for building ' +
    'anonymous credentials and private payments on Sui.</p>';
  container.appendChild(headerEl);

  /* Stats bar */
  var totalVulns = 0;
  var critCount = 0;
  var highCount = 0;
  data.categories.forEach(function(cat) {
    (cat.items || []).forEach(function(v) {
      totalVulns++;
      if (v.severity === 'critical') critCount++;
      if (v.severity === 'high') highCount++;
    });
  });
  var stats = document.createElement('div');
  stats.className = 'zk-sec-stats';
  stats.innerHTML =
    '<div class="zk-sec-stat"><span class="zk-sec-stat-num">' + totalVulns + '</span><span class="zk-sec-stat-label">Vulnerabilities</span></div>' +
    '<div class="zk-sec-stat"><span class="zk-sec-stat-num" style="color:#ef4444">' + critCount + '</span><span class="zk-sec-stat-label">Critical</span></div>' +
    '<div class="zk-sec-stat"><span class="zk-sec-stat-num" style="color:#f97316">' + highCount + '</span><span class="zk-sec-stat-label">High</span></div>' +
    '<div class="zk-sec-stat"><span class="zk-sec-stat-num">' + data.categories.length + '</span><span class="zk-sec-stat-label">Categories</span></div>';
  container.appendChild(stats);

  /* TOC */
  var toc = document.createElement('nav');
  toc.className = 'zk-sec-toc';
  toc.innerHTML = '<h4 class="zk-sec-toc-title">Categories</h4>';
  var tocList = document.createElement('ol');
  tocList.className = 'zk-sec-toc-list';
  data.categories.forEach(function(cat) {
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = '#sec-' + cat.id;
    a.textContent = cat.icon + ' ' + cat.title + ' (' + (cat.items || []).length + ')';
    a.addEventListener('click', function(e) {
      e.preventDefault();
      var target = document.getElementById('sec-' + cat.id);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    li.appendChild(a);
    tocList.appendChild(li);
  });
  toc.appendChild(tocList);
  container.appendChild(toc);

  /* Render categories */
  data.categories.forEach(function(cat) {
    var section = document.createElement('div');
    section.className = 'zk-sec-category';
    section.id = 'sec-' + cat.id;

    var catHeader = document.createElement('div');
    catHeader.className = 'zk-sec-cat-header';
    catHeader.innerHTML =
      '<span class="zk-sec-cat-icon">' + (cat.icon || '') + '</span>' +
      '<div><h3 class="zk-sec-cat-title">' + escapeSecHtml(cat.title) + '</h3>' +
      '<p class="zk-sec-cat-desc">' + escapeSecHtml(cat.description || '') + '</p></div>';
    section.appendChild(catHeader);

    (cat.items || []).forEach(function(vuln, idx) {
      section.appendChild(buildVulnCard(vuln, cat.id, idx, savedState));
    });

    container.appendChild(section);
  });

  /* KaTeX */
  if (typeof renderMathInElement === 'function') {
    try {
      renderMathInElement(container, {
        delimiters: [
          { left: '\\[', right: '\\]', display: true },
          { left: '\\(', right: '\\)', display: false },
        ],
        throwOnError: false,
      });
    } catch (e) { /* noop */ }
  }
}
