/**
 * Builds NovaDrive team brief as static HTML (+ optional PDF via browser print)
 * Run: node docs/site/build-docs.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const MD_PATH = path.join(ROOT, 'NOVADRIVE_MASTER_BRIEF.md');
const OUT_HTML = path.join(__dirname, 'index.html');

const md = fs.readFileSync(MD_PATH, 'utf8').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

// Split mermaid blocks before markdown conversion
const parts = [];
const mermaidRegex = /```mermaid\r?\n([\s\S]*?)```/g;
let lastIndex = 0;
let match;
let mermaidIndex = 0;

while ((match = mermaidRegex.exec(md)) !== null) {
  if (match.index > lastIndex) {
    parts.push({ type: 'md', content: md.slice(lastIndex, match.index) });
  }
  parts.push({ type: 'mermaid', content: match[1].trim(), id: `mermaid-${mermaidIndex++}` });
  lastIndex = match.index + match[0].length;
}
if (lastIndex < md.length) {
  parts.push({ type: 'md', content: md.slice(lastIndex) });
}

function mdToHtml(text) {
  const codeBlocks = [];
  let html = text;

  // Fenced code blocks first — protects content from header/list transforms
  html = html.replace(/```(\w*)\r?\n([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length;
    const langClass = lang ? ` class="language-${lang}"` : '';
    const preClass = lang ? '' : ' class="diagram-block"';
    codeBlocks.push(
      `<pre${preClass}><code${langClass}>${escapeHtml(code.replace(/\s+$/, ''))}</code></pre>`
    );
    return `\n%%CODEBLOCK${idx}%%\n`;
  });

  // Headers
  html = html.replace(/^###### (.+)$/gm, '<h6 id="$1">$1</h6>');
  html = html.replace(/^##### (.+)$/gm, '<h5 id="$1">$1</h5>');
  html = html.replace(/^#### (.+)$/gm, '<h4 id="$1">$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3 id="$1">$1</h3>');
  html = html.replace(/^## (\d+\. .+)$/gm, (_, t) => {
    const id = t.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    return `<h2 id="${id}">${t}</h2>`;
  });
  html = html.replace(/^## (.+)$/gm, (_, t) => {
    const id = t.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    return `<h2 id="${id}">${t}</h2>`;
  });
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold / italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  // Tables
  html = convertTables(html);

  // Lists
  html = html.replace(/^- \[ \] (.+)$/gm, '<li class="checklist"><input type="checkbox" disabled> $1</li>');
  html = html.replace(/^- \[x\] (.+)$/gm, '<li class="checklist"><input type="checkbox" checked disabled> $1</li>');
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="numbered">$1</li>');
  html = html.replace(/(?:<li class="checklist">[\s\S]*?<\/li>\s*)+/g, (block) => `<ul class="checklist">${block.trim()}</ul>`);
  html = html.replace(/(?:<li class="numbered">[\s\S]*?<\/li>\s*)+/g, (block) => `<ol>${block.trim().replace(/ class="numbered"/g, '')}</ol>`);
  html = html.replace(/(?:<li>[\s\S]*?<\/li>\s*)+/g, (block) => {
    if (block.startsWith('<ul') || block.startsWith('<ol')) return block;
    return `<ul>${block.trim()}</ul>`;
  });

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // Paragraphs
  html = html.split('\n\n').map((block) => {
    block = block.trim();
    if (!block) return '';
    if (/^%%CODEBLOCK\d+%%$/.test(block)) return block;
    if (/^<(h[1-6]|ul|ol|pre|table|hr|blockquote|div)/.test(block)) return block;
    return `<p>${block.replace(/\n/g, '<br>')}</p>`;
  }).join('\n');

  html = html.replace(/%%CODEBLOCK(\d+)%%/g, (_, idx) => codeBlocks[Number(idx)] || '');

  return html;
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function convertTables(html) {
  const lines = html.split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.includes('|') && i + 1 < lines.length && /^\|?[\s-:|]+\|?$/.test(lines[i + 1])) {
      const rows = [];
      while (i < lines.length && lines[i].includes('|')) {
        if (!/^\|?[\s-:|]+\|?$/.test(lines[i])) {
          const cells = lines[i].split('|').map((c) => c.trim()).filter(Boolean);
          rows.push(cells);
        }
        i++;
      }
      if (rows.length) {
        let table = '<table><thead><tr>';
        rows[0].forEach((c) => { table += `<th>${c}</th>`; });
        table += '</tr></thead><tbody>';
        for (let r = 1; r < rows.length; r++) {
          table += '<tr>';
          rows[r].forEach((c) => { table += `<td>${c}</td>`; });
          table += '</tr>';
        }
        table += '</tbody></table>';
        out.push(table);
      }
      continue;
    }
    out.push(line);
    i++;
  }
  return out.join('\n');
}

let bodyContent = '';
for (const part of parts) {
  if (part.type === 'mermaid') {
    bodyContent += `<div class="mermaid-wrap"><pre class="mermaid">${part.content}</pre></div>\n`;
  } else {
    bodyContent += mdToHtml(part.content);
  }
}

// Extract TOC links from original md
const tocItems = [];
const tocRegex = /^\d+\. \[([^\]]+)\]\(#([^)]+)\)/gm;
while ((match = tocRegex.exec(md)) !== null) {
  tocItems.push({ label: match[1], href: `#${match[2]}` });
}

const tocHtml = tocItems.map((t) => `<a href="${t.href}" class="toc-link">${t.label}</a>`).join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NovaDrive — Master Team Brief</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <style>
    :root {
      --bg: #0c0f14;
      --surface: #141922;
      --surface2: #1a2030;
      --border: #2a3347;
      --text: #e8ecf4;
      --muted: #8b95a8;
      --accent: #ef4444;
      --accent2: #f97316;
      --green: #22c55e;
      --blue: #3b82f6;
      --sidebar-w: 280px;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'DM Sans', system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.65;
      font-size: 15px;
    }
    .layout { display: flex; min-height: 100vh; }
    .sidebar {
      position: fixed;
      top: 0; left: 0;
      width: var(--sidebar-w);
      height: 100vh;
      background: var(--surface);
      border-right: 1px solid var(--border);
      overflow-y: auto;
      padding: 1.5rem 1rem;
      z-index: 100;
    }
    .sidebar-brand {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--accent);
      margin-bottom: 0.25rem;
    }
    .sidebar-sub {
      font-size: 0.75rem;
      color: var(--muted);
      margin-bottom: 1.5rem;
      line-height: 1.4;
    }
    .toc-link {
      display: block;
      padding: 0.35rem 0.75rem;
      color: var(--muted);
      text-decoration: none;
      font-size: 0.82rem;
      border-radius: 6px;
      border-left: 2px solid transparent;
      transition: all 0.15s;
    }
    .toc-link:hover {
      color: var(--text);
      background: var(--surface2);
      border-left-color: var(--accent);
    }
    .sidebar-actions {
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border);
    }
    .btn {
      display: block;
      width: 100%;
      padding: 0.6rem 1rem;
      margin-bottom: 0.5rem;
      border: none;
      border-radius: 8px;
      font-family: inherit;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      text-align: center;
      text-decoration: none;
    }
    .btn-primary {
      background: linear-gradient(135deg, var(--accent), var(--accent2));
      color: white;
    }
    .btn-secondary {
      background: var(--surface2);
      color: var(--text);
      border: 1px solid var(--border);
    }
    .main {
      margin-left: var(--sidebar-w);
      flex: 1;
      max-width: 900px;
      padding: 3rem 3rem 5rem;
    }
    .hero {
      background: linear-gradient(135deg, rgba(239,68,68,0.12), rgba(249,115,22,0.08));
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 2rem 2.5rem;
      margin-bottom: 2.5rem;
    }
    .hero h1 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.75rem;
      border: none;
      padding: 0;
    }
    .hero-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      font-size: 0.85rem;
      color: var(--muted);
    }
    .badge {
      display: inline-block;
      background: rgba(239,68,68,0.15);
      color: var(--accent);
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    h1 { font-size: 1.75rem; margin: 2rem 0 1rem; color: var(--text); }
    h2 {
      font-size: 1.35rem;
      margin: 2.5rem 0 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--border);
      color: var(--text);
    }
    h3 { font-size: 1.1rem; margin: 1.75rem 0 0.75rem; color: var(--accent2); }
    h4, h5, h6 { margin: 1.25rem 0 0.5rem; color: var(--muted); }
    p { margin-bottom: 1rem; color: #c8d0de; }
    a { color: var(--blue); }
    strong { color: var(--text); font-weight: 600; }
    hr { border: none; border-top: 1px solid var(--border); margin: 2rem 0; }
    ul, ol { margin: 0.75rem 0 1rem 1.5rem; color: #c8d0de; }
    li { margin-bottom: 0.35rem; }
    ul.checklist { list-style: none; margin-left: 0; }
    ul.checklist li { display: flex; align-items: flex-start; gap: 0.5rem; }
    blockquote {
      border-left: 3px solid var(--accent);
      padding: 0.75rem 1.25rem;
      margin: 1rem 0;
      background: rgba(239,68,68,0.06);
      border-radius: 0 8px 8px 0;
      color: var(--text);
      font-style: italic;
    }
    pre {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 1rem 1.25rem;
      overflow-x: auto;
      margin: 1rem 0 1.5rem;
      font-size: 0.82rem;
    }
    pre code {
      white-space: pre;
      display: block;
      line-height: 1.5;
      color: #c8d0de;
    }
    pre.diagram-block code {
      font-size: 0.78rem;
      line-height: 1.45;
    }
    code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85em;
    }
    p code, li code, td code {
      background: var(--surface2);
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      color: var(--accent2);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0 1.5rem;
      font-size: 0.88rem;
    }
    th {
      background: var(--surface2);
      color: var(--text);
      font-weight: 600;
      text-align: left;
      padding: 0.65rem 0.85rem;
      border: 1px solid var(--border);
    }
    td {
      padding: 0.6rem 0.85rem;
      border: 1px solid var(--border);
      color: #c8d0de;
      vertical-align: top;
    }
    tr:nth-child(even) td { background: rgba(255,255,255,0.02); }
    .mermaid-wrap {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
      margin: 1.5rem 0;
      overflow-x: auto;
    }
    .mermaid { background: transparent !important; }
    .footer {
      margin-top: 3rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border);
      font-size: 0.85rem;
      color: var(--muted);
      text-align: center;
    }
    @media (max-width: 900px) {
      .sidebar { display: none; }
      .main { margin-left: 0; padding: 1.5rem; }
    }
    /* ===== PDF / PRINT — high contrast, readable ===== */
    .pdf-cover {
      display: none;
      page-break-after: always;
      padding: 3rem 0 2rem;
      border-bottom: 3px solid #dc2626;
      margin-bottom: 2rem;
    }
    .pdf-cover h1 { font-size: 2.2rem; color: #0f0f0f !important; border: none; margin-bottom: 0.5rem; }
    .pdf-cover .subtitle { font-size: 1.1rem; color: #374151 !important; margin-bottom: 1.5rem; }
    .pdf-cover .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem 2rem; font-size: 0.9rem; color: #1f2937 !important; }
    .pdf-cover .meta-grid strong { color: #0f0f0f !important; }
    .pdf-cover .tagline { margin-top: 1.5rem; font-size: 1rem; font-style: italic; color: #dc2626 !important; }

    body.pdf-export { background: #ffffff !important; color: #0f0f0f !important; font-size: 11pt !important; }
    body.pdf-export .sidebar, body.pdf-export .sidebar-actions, body.pdf-export .btn { display: none !important; }
    body.pdf-export .main { margin-left: 0 !important; max-width: 100% !important; padding: 0 0 2rem !important; }
    body.pdf-export .pdf-cover { display: block !important; }
    body.pdf-export h1, body.pdf-export h2 { color: #0f0f0f !important; page-break-after: avoid; }
    body.pdf-export h2 { border-bottom: 2px solid #dc2626 !important; padding-bottom: 0.35rem; margin-top: 1.75rem; }
    body.pdf-export h3 { color: #b45309 !important; }
    body.pdf-export h4, body.pdf-export h5, body.pdf-export h6 { color: #374151 !important; }
    body.pdf-export p, body.pdf-export li, body.pdf-export ul, body.pdf-export ol { color: #1f2937 !important; }
    body.pdf-export strong { color: #0f0f0f !important; }
    body.pdf-export em { color: #374151 !important; }
    body.pdf-export a { color: #1d4ed8 !important; text-decoration: underline; }
    body.pdf-export .hero { background: #fef2f2 !important; border: 2px solid #dc2626 !important; border-radius: 8px; padding: 1.25rem 1.5rem; margin-bottom: 1.5rem; }
    body.pdf-export .hero h1 { color: #0f0f0f !important; font-size: 1.5rem; }
    body.pdf-export .hero-meta, body.pdf-export .hero p { color: #374151 !important; }
    body.pdf-export .badge { background: #dc2626 !important; color: #ffffff !important; }
    body.pdf-export pre { background: #f3f4f6 !important; border: 1px solid #9ca3af !important; color: #111827 !important; page-break-inside: avoid; }
    body.pdf-export pre code { color: #111827 !important; }
    body.pdf-export p code, body.pdf-export li code, body.pdf-export td code { background: #e5e7eb !important; color: #991b1b !important; border: 1px solid #d1d5db; }
    body.pdf-export table { page-break-inside: avoid; border: 1px solid #374151 !important; }
    body.pdf-export th { background: #1f2937 !important; color: #ffffff !important; border: 1px solid #374151 !important; font-weight: 700; }
    body.pdf-export td { color: #111827 !important; border: 1px solid #9ca3af !important; background: #ffffff !important; }
    body.pdf-export tr:nth-child(even) td { background: #f9fafb !important; }
    body.pdf-export blockquote { background: #fef2f2 !important; border-left: 4px solid #dc2626 !important; color: #1f2937 !important; page-break-inside: avoid; }
    body.pdf-export hr { border-top: 1px solid #9ca3af !important; }
    body.pdf-export .mermaid-wrap { background: #ffffff !important; border: 1px solid #9ca3af !important; page-break-inside: avoid; padding: 1rem; }
    body.pdf-export .footer { color: #6b7280 !important; border-top: 1px solid #d1d5db; }

    @media print {
      .sidebar, .sidebar-actions, .btn { display: none !important; }
      body { background: #ffffff !important; color: #0f0f0f !important; font-size: 11pt !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .main { margin-left: 0 !important; max-width: 100% !important; padding: 0 0 2rem !important; }
      .pdf-cover { display: block !important; }
      h1, h2 { color: #0f0f0f !important; page-break-after: avoid; }
      h2 { border-bottom: 2px solid #dc2626 !important; padding-bottom: 0.35rem; }
      h3 { color: #b45309 !important; }
      h4, h5, h6 { color: #374151 !important; }
      p, li, ul, ol { color: #1f2937 !important; }
      strong { color: #0f0f0f !important; }
      em { color: #374151 !important; }
      a { color: #1d4ed8 !important; text-decoration: underline; }
      .hero { background: #fef2f2 !important; border: 2px solid #dc2626 !important; }
      .hero h1, .hero p { color: #0f0f0f !important; }
      .hero-meta { color: #374151 !important; }
      .badge { background: #dc2626 !important; color: #fff !important; }
      pre { background: #f3f4f6 !important; border: 1px solid #9ca3af !important; color: #111827 !important; page-break-inside: avoid; }
      pre code { color: #111827 !important; }
      p code, li code, td code { background: #e5e7eb !important; color: #991b1b !important; }
      table { page-break-inside: avoid; border: 1px solid #374151 !important; }
      th { background: #1f2937 !important; color: #ffffff !important; border: 1px solid #374151 !important; }
      td { color: #111827 !important; border: 1px solid #9ca3af !important; background: #fff !important; }
      tr:nth-child(even) td { background: #f9fafb !important; }
      blockquote { background: #fef2f2 !important; border-left: 4px solid #dc2626 !important; color: #1f2937 !important; }
      hr { border-top: 1px solid #9ca3af !important; }
      .mermaid-wrap { background: #fff !important; border: 1px solid #9ca3af !important; page-break-inside: avoid; }
      .footer { color: #6b7280 !important; }
      h2, h3 { page-break-after: avoid; }
      pre, table, .mermaid-wrap, blockquote { page-break-inside: avoid; }
    }
  </style>
  <script>
    window.IS_PDF_EXPORT = location.search.includes('pdf=1');
    if (window.IS_PDF_EXPORT) {
      document.documentElement.classList.add('pdf-export-root');
    }
  </script>
</head>
<body>
  <div class="layout">
    <nav class="sidebar">
      <div class="sidebar-brand">🚨 NovaDrive</div>
      <div class="sidebar-sub">Master Team Brief<br>Road Safety Hackathon 2026</div>
      <div class="toc">${tocHtml}</div>
      <div class="sidebar-actions">
        <button class="btn btn-primary" onclick="window.print()">⬇ Save as PDF</button>
        <a class="btn btn-secondary" href="./NovaDrive-Master-Brief.pdf" download>📕 Download PDF</a>
        <a class="btn btn-secondary" href="./NOVADRIVE_MASTER_BRIEF.md" download>📄 Download Markdown</a>
      </div>
    </nav>
    <main class="main">
      <div class="pdf-cover">
        <h1>NovaDrive</h1>
        <div class="subtitle">Master Team Brief — Road Safety Hackathon 2026 (RoadSoS Track)</div>
        <div class="meta-grid">
          <div><strong>Organizer:</strong> CoERS & RBG Labs, IIT Madras</div>
          <div><strong>Deadline:</strong> May 31, 2026, 11:59 PM IST</div>
          <div><strong>Version:</strong> 1.0</div>
          <div><strong>Audience:</strong> Full hackathon team</div>
        </div>
        <p class="tagline">The network failed. The golden hour didn't.</p>
      </div>
      <div class="hero">
        <span class="badge">RoadSoS Track · IIT Madras</span>
        <h1>NovaDrive Master Team Brief</h1>
        <div class="hero-meta">
          <span>📅 May 2026</span>
          <span>👥 Full team document</span>
          <span>⏰ Deadline: May 31, 2026</span>
        </div>
        <p style="margin-top:1rem;margin-bottom:0"><em>The network failed. The golden hour didn't.</em></p>
      </div>
      ${bodyContent}
      <div class="footer">
        NovaDrive · CoERS Road Safety Hackathon 2026 · Share with all team members
      </div>
    </main>
  </div>
  <script>
    if (window.IS_PDF_EXPORT) {
      document.body.classList.add('pdf-export');
    }
    const mermaidTheme = window.IS_PDF_EXPORT ? 'default' : 'dark';
    const mermaidVars = window.IS_PDF_EXPORT ? {
      primaryColor: '#fecaca',
      primaryTextColor: '#0f0f0f',
      primaryBorderColor: '#374151',
      lineColor: '#374151',
      secondaryColor: '#f3f4f6',
      tertiaryColor: '#ffffff',
      nodeTextColor: '#0f0f0f'
    } : {
      primaryColor: '#ef4444',
      primaryTextColor: '#e8ecf4',
      primaryBorderColor: '#2a3347',
      lineColor: '#8b95a8',
      secondaryColor: '#1a2030',
      tertiaryColor: '#141922'
    };
    mermaid.initialize({
      startOnLoad: true,
      theme: mermaidTheme,
      themeVariables: mermaidVars,
      securityLevel: 'loose'
    });
  </script>
</body>
</html>`;

fs.writeFileSync(OUT_HTML, html, 'utf8');

// Copy downloadable assets into site folder for Vercel deployment
const mdSrc = path.join(ROOT, 'NOVADRIVE_MASTER_BRIEF.md');
const pdfSrc = path.join(ROOT, 'NOVADRIVE_MASTER_BRIEF.pdf');
if (fs.existsSync(mdSrc)) {
  fs.copyFileSync(mdSrc, path.join(__dirname, 'NOVADRIVE_MASTER_BRIEF.md'));
}
if (fs.existsSync(pdfSrc)) {
  fs.copyFileSync(pdfSrc, path.join(__dirname, 'NovaDrive-Master-Brief.pdf'));
}

console.log('✅ Built:', OUT_HTML);
console.log('   Open in browser → click "Save as PDF" in sidebar');
