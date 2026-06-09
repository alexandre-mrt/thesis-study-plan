/**
 * build-pdf.js — generate a printable concept-reference HTML from the study-guide data files.
 * Two columns (Intuitive | Technical) per concept, full-width schemas, chapter page-breaks.
 * Excludes: Rust, Post-Quantum, audit, ZK-book. Run: node build-pdf.js → pdf/thesis-concepts.html
 */
'use strict';
const fs = require('fs');
const path = require('path');

global.window = {};
const load = (f) => require(path.join(__dirname, f));

/* ----- load datasets (guide + technical) ----- */
[
  'day1-guide.js', 'day1-technical.js',
  'day2-guide.js', 'day2-technical.js',
  'day3-guide.js', 'day3-technical.js',
  'ch22-guide.js', 'ch22-technical.js',
  'confidential-transfers-guide.js', 'confidential-transfers-technical.js',
  'nautilus-guide.js', 'nautilus-technical.js',
  'sui-crypto-guide.js', 'sui-crypto-technical.js',
  'sui-private-tx-guide.js', 'sui-private-tx-technical.js',
  'ch25-iop-guide.js', 'ch25-iop-technical.js',
].forEach(load);

const W = global.window;

/* ----- ordered chapters (thesis-logical order) ----- */
const CHAPTERS = [
  { n: '1', title: 'ZK Proof Systems & Crypto Fundamentals', guide: W.DAY1_GUIDE, tech: W.DAY1_TECHNICAL },
  { n: '2', title: 'Anonymous Credentials & TEE Foundations', guide: W.DAY2_GUIDE, tech: W.DAY2_TECHNICAL },
  { n: '3', title: 'Confidential Transactions & Range Proofs', guide: W.CH22_GUIDE, tech: W.CH22_TECHNICAL },
  { n: '4', title: 'Confidential Transfers on Sui (contra)', guide: W.CONFIDENTIAL_GUIDE, tech: W.CONFIDENTIAL_TECHNICAL },
  { n: '5', title: 'Nautilus — Verifiable Off-Chain Compute (TEE)', guide: W.NAUTILUS_GUIDE, tech: W.NAUTILUS_TECHNICAL },
  { n: '6', title: 'Sui Cryptographic Primitives', guide: W.SUICRYPTO_GUIDE, tech: W.SUICRYPTO_TECHNICAL },
  { n: '7', title: 'Private Payments', guide: W.DAY3_GUIDE, tech: W.DAY3_TECHNICAL },
  { n: '8', title: 'Private Transactions on Sui — Synthesis', guide: W.SUIPRIVATETX_GUIDE, tech: W.SUIPRIVATETX_TECHNICAL },
  { n: '9', title: 'IOP & PCP — Probabilistic Proofs', guide: W.CH25_IOP_GUIDE, tech: W.CH25_IOP_TECHNICAL },
];

/* ----- helpers ----- */
const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const blockKeys = (o) => Object.keys(o || {}).filter((k) => /^block\d+/.test(k)).sort();
const techConcept = (techBlock, name, idx) => {
  if (!techBlock || !techBlock.concepts) return null;
  return techBlock.concepts.find((c) => c.name === name) || techBlock.concepts[idx] || null;
};

function renderConcept(c, tc) {
  const kp = (c.keyPoints || []).map((k) => `<li>${esc(k)}</li>`).join('');
  const diagram = c.diagram ? `<pre class="diagram">${esc(c.diagram)}</pre>` : '';

  const intuitive = [
    c.analogy ? `<p class="analogy">${esc(c.analogy)}</p>` : '',
    diagram,
    kp ? `<div class="sub">Key points</div><ul class="kp">${kp}</ul>` : '',
    c.connections ? `<div class="sub">Why it matters</div><p class="meta-p">${esc(c.connections)}</p>` : '',
    c.thesisExample ? `<div class="sub">Thesis angle</div><p class="meta-p">${esc(c.thesisExample)}</p>` : '',
  ].join('');

  const md = (tc && tc.mathDetails || []).map((d) =>
    `<div class="md-sub">${esc(d.subtitle || '')}</div><div class="md-body">${d.content || ''}</div>`).join('');
  const technical = [
    tc && tc.formalDefinition ? `<div class="md-body">${tc.formalDefinition}</div>` : '<p class="muted">—</p>',
    md,
  ].join('');

  const hist = c.history
    ? `<span class="foot-label">History</span> ${esc(c.history.inventor || '')}${c.history.year ? ` (${esc(c.history.year)})` : ''}.${c.history.funFact ? ` <em>${esc(c.history.funFact)}</em>` : ''}`
    : '';
  const lim = (c.limitations || []).length
    ? `<div class="foot-block"><span class="foot-label">Limitations</span><ul>${c.limitations.map((l) => `<li>${esc(l)}</li>`).join('')}</ul></div>` : '';
  const ex = (c.exercises || []).length
    ? `<div class="foot-block"><span class="foot-label">Exercises</span><ol>${c.exercises.map((e) => `<li><b>${esc(e.type || '')}</b> — ${esc(e.question || '')}</li>`).join('')}</ol></div>` : '';
  const footer = (hist || lim || ex) ? `<div class="concept-foot">${hist ? `<p class="hist">${hist}</p>` : ''}${lim}${ex}</div>` : '';

  return `<section class="concept">
    <h3 class="concept-title">${esc(c.name)}</h3>
    <div class="cols">
      <div class="col col-int"><div class="col-badge int">Intuitive</div>${intuitive}</div>
      <div class="col col-tech"><div class="col-badge tech">Technical</div>${technical}</div>
    </div>
    ${footer}
  </section>`;
}

function renderChapter(ch) {
  const gks = blockKeys(ch.guide);
  let body = '';
  gks.forEach((bk) => {
    const gb = ch.guide[bk];
    const tb = ch.tech ? ch.tech[bk] : null;
    if (!gb || !gb.concepts) return;
    if (gks.length > 1 && gb.title) body += `<h2 class="block-title">${esc(gb.title)}</h2>`;
    gb.concepts.forEach((c, i) => { body += renderConcept(c, techConcept(tb, c.name, i)); });
  });
  return `<div class="chapter"><div class="chapter-head"><span class="chapter-num">Chapter ${ch.n}</span><h1>${esc(ch.title)}</h1></div>${body}</div>`;
}

const toc = CHAPTERS.map((c) => `<li><span class="toc-n">${c.n}</span>${esc(c.title)}</li>`).join('');
const chapters = CHAPTERS.map(renderChapter).join('');

const css = `
:root{--ink:#15171c;--muted:#6b7280;--line:#d8dce3;--int:#0e7490;--tech:#6d28d9;--bg-int:#f0fafc;--bg-tech:#f6f3fe;--code:#0b1020;}
*{box-sizing:border-box;}
@page{size:A4;margin:13mm 11mm 14mm;}
@page:first{margin:0;}
html,body{margin:0;padding:0;}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Arial,sans-serif;color:var(--ink);font-size:9.3px;line-height:1.5;}
code,pre,.mono{font-family:'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;}
h1,h2,h3{margin:0;font-weight:700;letter-spacing:-0.01em;}
/* cover */
.cover{height:297mm;display:flex;flex-direction:column;justify-content:center;padding:0 26mm;color:#fff;background:linear-gradient(135deg,#0b1020 0%,#15233f 55%,#3a1d6e 100%);page-break-after:always;}
.cover .kicker{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.32em;text-transform:uppercase;color:#9fb4ff;margin-bottom:18px;}
.cover h1{font-size:34px;line-height:1.12;margin-bottom:14px;}
.cover .sub{font-size:13px;color:#c8d2e6;max-width:135mm;line-height:1.55;}
.cover .by{margin-top:30px;font-size:11px;color:#9aa6bd;font-family:'JetBrains Mono',monospace;}
/* toc */
.toc{page-break-after:always;padding-top:6mm;}
.toc h2{font-size:18px;margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid var(--ink);}
.toc ol,.toc ul{list-style:none;margin:0;padding:0;}
.toc li{display:flex;align-items:baseline;gap:12px;padding:7px 0;border-bottom:1px solid var(--line);font-size:12px;}
.toc .toc-n{font-family:'JetBrains Mono',monospace;font-weight:700;color:var(--tech);min-width:22px;}
.toc .note{margin-top:14px;font-size:9px;color:var(--muted);line-height:1.5;}
/* chapter */
.chapter{page-break-before:always;}
.chapter-head{border-bottom:3px solid var(--ink);padding-bottom:8px;margin-bottom:12px;}
.chapter-num{font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:0.22em;text-transform:uppercase;color:var(--tech);}
.chapter-head h1{font-size:21px;margin-top:3px;}
.block-title{font-size:13px;margin:14px 0 6px;color:#1f2937;padding-left:8px;border-left:4px solid var(--tech);}
/* concept */
.concept{margin:0 0 13px;padding-bottom:9px;border-bottom:1px solid var(--line);page-break-inside:auto;}
.concept-title{font-size:12.5px;margin-bottom:6px;color:#111827;}
.concept-title::before{content:"";display:inline-block;width:9px;height:9px;border-radius:2px;background:var(--tech);margin-right:7px;vertical-align:middle;}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:11px;align-items:start;}
.col{border:1px solid var(--line);border-radius:5px;padding:8px 9px;}
.col-int{background:var(--bg-int);}
.col-tech{background:var(--bg-tech);}
.col-badge{font-family:'JetBrains Mono',monospace;font-size:7.5px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:1.5px 6px;border-radius:3px;display:inline-block;margin-bottom:6px;}
.col-badge.int{color:#fff;background:var(--int);}
.col-badge.tech{color:#fff;background:var(--tech);}
.analogy{margin:0 0 6px;font-style:italic;line-height:1.55;}
.sub,.md-sub{font-family:'JetBrains Mono',monospace;font-size:7.5px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--int);margin:7px 0 3px;}
.col-tech .md-sub{color:var(--tech);}
ul.kp{margin:2px 0 0;padding-left:14px;}
ul.kp li{margin-bottom:2.5px;line-height:1.45;}
.meta-p{margin:0 0 4px;line-height:1.5;}
.muted{color:var(--muted);}
.md-body{margin:0 0 4px;}
.md-body p{margin:0 0 5px;line-height:1.5;}
.md-body ul,.md-body ol{margin:3px 0;padding-left:15px;}
.md-body li{margin-bottom:2.5px;line-height:1.45;}
.md-body table{width:100%;border-collapse:collapse;margin:4px 0;font-size:8px;}
.md-body th,.md-body td{border:1px solid var(--line);padding:2px 4px;text-align:left;vertical-align:top;}
.md-body code{background:rgba(109,40,217,0.08);padding:0 2px;border-radius:2px;font-size:8px;}
/* code & diagram blocks */
pre{margin:4px 0;background:var(--code);color:#e6edf3;border-radius:4px;padding:6px 7px;overflow:hidden;white-space:pre;}
pre,pre code{font-size:6.5px;line-height:1.32;}
pre code{background:none;padding:0;color:inherit;}
pre.diagram{background:#0b1224;color:#cfe0ff;border:1px solid #1e2b4a;}
.md-body pre{font-size:6.5px;}
/* concept footer */
.concept-foot{margin-top:6px;padding:6px 8px;background:#fafafa;border:1px solid var(--line);border-radius:4px;font-size:8.4px;}
.concept-foot .hist{margin:0 0 4px;line-height:1.45;}
.foot-label{font-family:'JetBrains Mono',monospace;font-size:7px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#9333ea;margin-right:5px;}
.foot-block{margin-top:4px;}
.foot-block ul,.foot-block ol{margin:2px 0;padding-left:15px;}
.foot-block li{margin-bottom:2px;line-height:1.4;}
.concept,.col,.concept-foot{break-inside:avoid;}
@media print{a{color:inherit;text-decoration:none;}}
`;

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Privacy on Sui — Concept Reference</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" crossorigin="anonymous">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js" crossorigin="anonymous"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js" crossorigin="anonymous"></script>
<style>${css}</style></head><body>
<div class="cover">
  <div class="kicker">Master Thesis · Concept Reference</div>
  <h1>Privacy on Sui<br>ZK Proofs, TEEs &amp; Confidential Transactions</h1>
  <div class="sub">A printable, chapter-by-chapter reference for anonymous credentials and low-value private payments on Sui — each concept explained twice, side by side: an intuitive picture and the technical detail, with schemas.</div>
  <div class="by">Alexandre Mourot · EPFL × Mysten Labs · generated from the study-plan corpus</div>
</div>
<div class="toc">
  <h2>Contents</h2>
  <ul>${toc}</ul>
  <p class="note">Each concept is laid out in two columns — <b>Intuitive</b> (analogy, schema, key points, thesis relevance) on the left, <b>Technical</b> (formal definitions, equations, code/citations) on the right — followed by history, limitations, and exercises. Code/source citations point to MystenLabs repositories (e.g. confidential-transfers / contra @ 27c382f). Excludes Rust, Post-Quantum, audit, and the ZK-book modules.</p>
</div>
${chapters}
<script>
  function typeset(){
    if(!window.renderMathInElement){ setTimeout(typeset, 120); return; }
    renderMathInElement(document.body, {
      delimiters:[
        {left:'\\\\[', right:'\\\\]', display:true},
        {left:'\\\\(', right:'\\\\)', display:false},
        {left:'$$', right:'$$', display:true}
      ],
      throwOnError:false, ignoredTags:['script','noscript','style','textarea','pre','code']
    });
    document.title = 'READY ' + document.title;
  }
  window.addEventListener('load', typeset);
</script>
</body></html>`;

const outDir = path.join(__dirname, 'pdf');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'thesis-concepts.html');
fs.writeFileSync(outFile, html);

let nConcepts = 0;
CHAPTERS.forEach((ch) => blockKeys(ch.guide).forEach((bk) => { nConcepts += (ch.guide[bk].concepts || []).length; }));
console.log(`Wrote ${outFile}`);
console.log(`Chapters: ${CHAPTERS.length} · Concepts: ${nConcepts}`);
