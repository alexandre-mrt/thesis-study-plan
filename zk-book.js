/**
 * ZK Book Vault — Reader
 * Renders an interactive table of contents for the RareSkills ZK Book.
 * Fetches markdown on demand (no caching). Converts to HTML + KaTeX.
 */

const ZK_BOOK_CHAPTERS = [
  {
    group: 'Foundations',
    chapters: [
      { slug: 'p-vs-np', title: 'P vs NP and ZK Proofs' },
      { slug: 'set-theory', title: 'Elementary Set Theory' },
      { slug: 'abstract-algebra', title: 'Abstract Algebra' },
      { slug: 'group-theory', title: 'Elementary Group Theory' },
      { slug: 'homomorphisms', title: 'Homomorphisms by Example' },
      { slug: 'finite-fields', title: 'Finite Fields and Modular Arithmetic' },
    ],
  },
  {
    group: 'Elliptic Curves',
    chapters: [
      { slug: 'elliptic-curve-addition', title: 'Elliptic Curve Point Addition' },
      { slug: 'elliptic-curves-finite-fields', title: 'Elliptic Curves over Finite Fields' },
      { slug: 'bilinear-pairing', title: 'Bilinear Pairings' },
    ],
  },
  {
    group: 'Arithmetic Circuits & R1CS',
    chapters: [
      { slug: 'arithmetic-circuit', title: 'Arithmetic Circuits for ZK' },
      { slug: 'rank-1-constraint-system', title: 'R1CS (Rank One Constraint System)' },
      { slug: 'r1cs-zkp', title: 'ZK Proof from an R1CS' },
      { slug: 'python-lagrange-interpolation', title: 'Lagrange Interpolation' },
      { slug: 'schwartz-zippel-lemma', title: 'Schwartz-Zippel Lemma' },
      { slug: 'quadratic-arithmetic-program', title: 'Quadratic Arithmetic Programs' },
      { slug: 'r1cs-to-qap', title: 'R1CS to QAP in Python' },
      { slug: 'quadratic-constraints', title: 'Quadratic Constraints' },
    ],
  },
  {
    group: 'Trusted Setup & Groth16',
    chapters: [
      { slug: 'trusted-setup', title: 'Trusted Setup' },
      { slug: 'elliptic-curve-qap', title: 'QAP on a Trusted Setup' },
      { slug: 'groth16', title: 'Groth16 Explained', crosslinks: ['ch25', 'zk'] },
    ],
  },
  {
    group: 'Circom (ZK Circuits)',
    chapters: [
      { slug: 'zero-knowledge-programming-language', title: 'ZK Programming Languages' },
      { slug: 'circom-intro', title: 'Introduction to Circom' },
      { slug: 'hello-world-circom', title: 'Circom in the Command Line' },
      { slug: 'circom-syntax', title: 'Circom Syntax' },
      { slug: 'circom-symbolic-variable', title: 'Symbolic Variables' },
      { slug: 'circom-intermediate-signals', title: 'Intermediate Signals' },
      { slug: 'circom-public-private-inputs', title: 'Public and Private Inputs' },
      { slug: 'indicate-then-constrain', title: 'Indicate Then Constrain' },
      { slug: 'compute-then-constrain', title: 'Compute Then Constrain' },
      { slug: 'circom-component-loop', title: 'Components in a Loop' },
      { slug: 'underconstrained-circom', title: 'Hacking Underconstrained Circuits' },
      { slug: 'circom-aliascheck', title: 'AliasCheck and Num2Bits_strict' },
      { slug: 'circom-if-statement', title: 'Conditional Statements' },
      { slug: 'quin-selector', title: 'Quin Selector' },
      { slug: 'circom-array-swap', title: 'Array Swap in Circom' },
      { slug: 'sort-circuit', title: 'Sort Circuit (Conclusion)' },
    ],
  },
  {
    group: 'Stateful ZK & Advanced Circuits',
    chapters: [
      { slug: 'stateful-zk', title: 'Stateful Computations in ZK' },
      { slug: 'zk-stack', title: 'Stack Data Structure in ZK' },
      { slug: 'zkvm', title: 'How a ZKVM Works', crosslinks: ['ch25', 'zk'] },
      { slug: 'emulate-32-bits', title: '32-Bit Emulation in ZK' },
      { slug: 'md5-circom', title: 'MD5 Hash in Circom' },
      { slug: 'zk-friendly-hash', title: 'ZK Friendly Hash Functions' },
      { slug: 'permutation-argument', title: 'The Permutation Argument' },
    ],
  },
  {
    group: 'Bulletproofs & Commitments',
    chapters: [
      { slug: 'pedersen-commitment', title: 'Pedersen Commitments', crosslinks: ['ch25', 'zk'] },
      { slug: 'pedersen-polynomial-commitment', title: 'Polynomial Commitments via Pedersen' },
      { slug: 'bulletproofs-zk', title: 'Introduction to Bulletproofs', crosslinks: ['ch25'] },
      { slug: 'zk-multiplication', title: 'Zero Knowledge Multiplication' },
      { slug: 'inner-product-argument', title: 'ZK Proof for Inner Product', crosslinks: ['ch25'] },
      { slug: 'inner-product-algebra', title: 'Inner Product Algebra' },
      { slug: 'outer-product-inner-product', title: 'Succinct Proofs of Vector Commitment' },
      { slug: 'log-n-vector-commitment-proof', title: 'Logarithmic Sized Proofs' },
      { slug: 'bulletproofs-zkp', title: 'Bulletproofs ZKP' },
      { slug: 'random-linear-combination', title: 'Random Linear Combinations' },
      { slug: 'range-proof', title: 'Range Proof', crosslinks: ['ch25'] },
    ],
  },
  {
    group: 'FFT & Number Theoretic Transforms',
    chapters: [
      { slug: 'polynomial-multiplication-point-form', title: 'Polynomial Multiplication (Point Form)' },
      { slug: 'multiplicative-subgroups', title: 'Multiplicative Subgroups' },
      { slug: 'fundamental-theorem-cyclic-groups', title: 'Fundamental Theorem of Cyclic Groups' },
      { slug: 'roots-of-unity-finite-field', title: 'Roots of Unity in Finite Fields' },
      { slug: 'roots-of-unity-unit-circle', title: 'Visual Roots of Unity' },
      { slug: 'roots-of-unity-additive-inverse', title: 'Roots of Unity: Additive Inverse' },
      { slug: 'roots-of-unity-squared', title: 'Roots of Unity: Squared' },
      { slug: 'roots-of-unity-raised-k-over-2', title: 'Roots of Unity: k/2 Power' },
      { slug: 'roots-of-unity-square-roots', title: 'Square Roots of Roots of Unity' },
      { slug: 'image-preservation-theorem', title: 'Image Preservation Theorem' },
      { slug: 'square-root-multivalued-functions', title: 'Multivalued Functions' },
      { slug: 'vandermonde-matrix', title: 'Vandermonde Matrices' },
      { slug: 'orthogonality-of-roots-of-unity', title: 'Orthogonality of Roots of Unity' },
      { slug: 'ntt-by-hand', title: 'NTT Algorithm by Hand' },
      { slug: 'fft-friendly-finite-fields', title: 'FFT Friendly Finite Fields' },
      { slug: 'inverse-number-theoretic-transform', title: 'Inverse NTT' },
      { slug: 'inverse-of-vandermonde-matrix', title: 'Inverse of Vandermonde Matrix' },
      { slug: 'intt-by-hand', title: 'INTT Algorithm by Hand' },
    ],
  },
  {
    group: 'Applications',
    chapters: [
      { slug: 'how-does-tornado-cash-work', title: 'How Tornado Cash Works', crosslinks: ['ch25', 'zk'] },
      { slug: 'zk-addition-dapp-with-noir-and-nextjs', title: 'ZK Addition dApp (Noir + Next.js)' },
    ],
  },
];

const CROSSLINK_LABELS = {
  ch25: { label: 'Ch 2.5 — ZK Proof Systems', tab: 'ch25' },
  zk: { label: 'ZK Deep Dive', tab: 'zk' },
};

const ZK_BOOK_STORAGE_KEY = 'zk-book-checked';

const ZK_DEEPDIVE_TO_BOOK = {
  'zk-what-is': ['p-vs-np'],
  'zk-three-properties': ['r1cs-zkp'],
  'zk-circuits': ['arithmetic-circuit', 'rank-1-constraint-system', 'quadratic-arithmetic-program'],
  'zk-e2e-flow': ['groth16', 'trusted-setup'],
  'zk-complexity': ['p-vs-np'],
  'zk-public-private': ['circom-public-private-inputs'],
  'zk-thesis-flow': ['how-does-tornado-cash-work', 'pedersen-commitment'],
  'zk-sumcheck': ['inner-product-argument', 'inner-product-algebra'],
  'zk-lattices': [],
};

function openZKBookChapter(slug) {
  if (typeof switchToZKBook === 'function') switchToZKBook();
  setTimeout(() => {
    const container = document.getElementById('zk-book-content');
    if (container && findChapter(slug)) openChapter(container, slug);
  }, 100);
}
window.openZKBookChapter = openZKBookChapter;

let zkBookInitialized = false;

function loadBookChecked() {
  try { return JSON.parse(localStorage.getItem(ZK_BOOK_STORAGE_KEY)) || {}; } catch { return {}; }
}
function saveBookChecked(state) {
  try { localStorage.setItem(ZK_BOOK_STORAGE_KEY, JSON.stringify(state)); } catch { /* */ }
}

function getBookProgress() {
  const state = loadBookChecked();
  let total = 0;
  let done = 0;
  for (const g of ZK_BOOK_CHAPTERS) {
    for (const ch of g.chapters) {
      total++;
      if (state[ch.slug]) done++;
    }
  }
  return { done, total };
}

function renderZKBook() {
  const container = document.getElementById('zk-book-content');
  if (!container) return;
  zkBookInitialized = true;
  renderTOC(container);
}

function renderTOC(container) {
  const checked = loadBookChecked();
  const { done, total } = getBookProgress();
  const pct = total ? Math.round((done / total) * 100) : 0;

  let html = '<div class="zk-book-header"><div class="day-label">Reference</div>';
  html += '<h1>ZK Book — RareSkills</h1>';
  html += `<p>${total} chapters &middot; <span id="zk-book-progress">${done}/${total} read (${pct}%)</span></p></div>`;
  html += '<div class="zk-book-toc">';

  let globalIdx = 1;
  for (const group of ZK_BOOK_CHAPTERS) {
    html += '<div class="zk-book-group">';
    html += `<div class="zk-book-group-title">${escapeHtmlSafe(group.group)}</div>`;
    html += '<ul class="zk-book-list">';
    for (const ch of group.chapters) {
      const badges = (ch.crosslinks || [])
        .map((k) => {
          const cl = CROSSLINK_LABELS[k];
          return cl ? `<span class="zk-book-item-badge">${cl.label}</span>` : '';
        })
        .join('');
      const isChecked = checked[ch.slug] ? 'checked' : '';
      const doneClass = checked[ch.slug] ? ' zk-book-item-done' : '';
      html += `<li class="zk-book-item${doneClass}" data-slug="${ch.slug}">`;
      html += `<label class="zk-book-check-wrap" onclick="event.stopPropagation()"><input type="checkbox" class="zk-book-check" data-slug="${ch.slug}" ${isChecked}><span class="zk-book-checkmark"></span></label>`;
      html += `<span class="zk-book-item-num">${String(globalIdx).padStart(2, '0')}</span>`;
      html += `<span class="zk-book-item-title">${escapeHtmlSafe(ch.title)}</span>`;
      html += badges;
      html += '</li>';
      globalIdx++;
    }
    html += '</ul></div>';
  }

  html += '</div>';
  container.innerHTML = html;

  container.querySelectorAll('.zk-book-check').forEach((cb) => {
    cb.addEventListener('change', () => {
      const state = loadBookChecked();
      state[cb.dataset.slug] = cb.checked;
      saveBookChecked(state);
      const item = cb.closest('.zk-book-item');
      if (item) item.classList.toggle('zk-book-item-done', cb.checked);
      const { done: d, total: t } = getBookProgress();
      const el = document.getElementById('zk-book-progress');
      if (el) el.textContent = `${d}/${t} read (${t ? Math.round((d / t) * 100) : 0}%)`;
    });
  });

  container.querySelectorAll('.zk-book-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('.zk-book-check-wrap')) return;
      const slug = item.dataset.slug;
      openChapter(container, slug);
    });
  });
}

function findChapter(slug) {
  for (const group of ZK_BOOK_CHAPTERS) {
    for (const ch of group.chapters) {
      if (ch.slug === slug) return ch;
    }
  }
  return null;
}

async function openChapter(container, slug) {
  const ch = findChapter(slug);
  if (!ch) return;

  const crosslinksHtml = buildCrosslinksHtml(ch);
  container.innerHTML =
    `<button class="zk-book-back" id="zk-book-back-btn">&larr; Back to Table of Contents</button>` +
    crosslinksHtml +
    `<div class="zk-book-reader"><div class="zk-book-loading">Loading chapter&hellip;</div></div>`;

  container.querySelector('#zk-book-back-btn').addEventListener('click', () => renderTOC(container));

  container.querySelectorAll('.zk-book-crosslink').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = link.dataset.tab;
      if (tab === 'zk' && typeof switchToZKDeepdive === 'function') switchToZKDeepdive();
      else if (typeof switchDay === 'function') switchDay(tab);
    });
  });

  const reader = container.querySelector('.zk-book-reader');

  try {
    const res = await fetch(`zk-book-vault/${slug}.md`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const md = await res.text();
    const html = convertMarkdown(md);
    reader.innerHTML = html;

    reader.querySelectorAll('.zk-book-wikilink').forEach((wl) => {
      wl.addEventListener('click', () => {
        const target = wl.dataset.slug;
        if (findChapter(target)) {
          openChapter(container, target);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });

    if (typeof renderMathInElement === 'function') {
      renderMathInElement(reader, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true },
        ],
        throwOnError: false,
      });
    }
  } catch (err) {
    reader.innerHTML = `<p style="color:#ef4444;">Failed to load chapter: ${escapeHtmlSafe(err.message)}</p>`;
  }
}

function buildCrosslinksHtml(ch) {
  if (!ch.crosslinks || ch.crosslinks.length === 0) return '';
  let html = '<div class="zk-book-crosslinks"><span class="zk-book-crosslinks-label">Related sections</span>';
  for (const k of ch.crosslinks) {
    const cl = CROSSLINK_LABELS[k];
    if (!cl) continue;
    html += `<a class="zk-book-crosslink" data-tab="${cl.tab}" href="#">&rarr; ${cl.label}</a>`;
  }
  html += '</div>';
  return html;
}

function escapeHtmlSafe(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function convertMarkdown(md) {
  let html = md;

  // Obsidian image embeds: ![[attachments/file.png]]
  html = html.replace(/!\[\[([^\]]+)\]\]/g, (_, path) => {
    const src = path.startsWith('attachments/') ? `zk-book-vault/${path}` : `zk-book-vault/attachments/${path}`;
    return `<img src="${src}" alt="" loading="lazy">`;
  });

  // Obsidian wiki links: [[slug|display]] or [[slug]]
  html = html.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, (_, slug, display) => {
    return `<span class="zk-book-wikilink" data-slug="${slug}">${display}</span>`;
  });
  html = html.replace(/\[\[([^\]]+)\]\]/g, (_, slug) => {
    return `<span class="zk-book-wikilink" data-slug="${slug}">${slug}</span>`;
  });

  // Protect code blocks and math blocks from further processing
  const codeBlocks = [];
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push(`<pre><code class="language-${lang || 'text'}">${escapeHtmlSafe(code.trimEnd())}</code></pre>`);
    return `%%CODEBLOCK_${idx}%%`;
  });

  const mathBlocks = [];
  html = html.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    const idx = mathBlocks.length;
    mathBlocks.push(`$$${math}$$`);
    return `%%MATHBLOCK_${idx}%%`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Headers
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Markdown links: [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr>');

  // Tables
  html = html.replace(/^(\|.+\|)\n(\|[-| :]+\|)\n((?:\|.+\|\n?)+)/gm, (_, headerRow, _sep, bodyRows) => {
    const headers = headerRow.split('|').filter(Boolean).map((h) => `<th>${h.trim()}</th>`).join('');
    const rows = bodyRows.trim().split('\n').map((row) => {
      const cells = row.split('|').filter(Boolean).map((c) => `<td>${c.trim()}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
    return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
  });

  // Unordered lists
  html = html.replace(/^(\s*)[-*] (.+)$/gm, '$1<li>$2</li>');
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

  // Ordered lists
  html = html.replace(/^(\s*)\d+\. (.+)$/gm, '$1<li>$2</li>');

  // Paragraphs: lines that aren't HTML or blank
  const lines = html.split('\n');
  const result = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === '') {
      result.push('');
    } else if (
      line.startsWith('<') ||
      line.startsWith('%%') ||
      line.startsWith('$')
    ) {
      result.push(line);
    } else {
      result.push(`<p>${line}</p>`);
    }
  }
  html = result.join('\n');

  // Restore code blocks and math blocks
  for (let i = 0; i < codeBlocks.length; i++) {
    html = html.replace(`%%CODEBLOCK_${i}%%`, codeBlocks[i]);
  }
  for (let i = 0; i < mathBlocks.length; i++) {
    html = html.replace(`%%MATHBLOCK_${i}%%`, mathBlocks[i]);
  }

  return html;
}
