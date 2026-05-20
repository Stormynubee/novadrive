/** Generate high-contrast PDF from built HTML — run after build-docs.js */
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
const pdfPath = path.join(__dirname, '..', 'RELAYSATHI_MASTER_BRIEF.pdf');

async function main() {
  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch {
    console.log('Installing puppeteer...');
    require('child_process').execSync('npm install puppeteer --no-save', {
      cwd: __dirname,
      stdio: 'inherit',
    });
    puppeteer = require('puppeteer');
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  // Load in PDF mode — light theme + pdf-export class applied before mermaid renders
  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/') + '?pdf=1';
  await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 90000 });

  // Ensure pdf-export styles active
  await page.evaluate(() => document.body.classList.add('pdf-export'));

  // Wait for mermaid diagrams to render
  await page.waitForFunction(
    () => document.querySelectorAll('.mermaid svg').length >= 4,
    { timeout: 30000 }
  ).catch(() => console.warn('Some mermaid diagrams may not have rendered'));

  // Force readable text inside mermaid SVGs
  await page.evaluate(() => {
    document.querySelectorAll('.mermaid svg text, .mermaid svg tspan').forEach((el) => {
      el.setAttribute('fill', '#0f0f0f');
      el.style.fill = '#0f0f0f';
    });
    document.querySelectorAll('.mermaid svg .node rect, .mermaid svg .cluster rect').forEach((el) => {
      if (!el.getAttribute('fill') || el.getAttribute('fill') === 'transparent') return;
    });
  });

  await new Promise((r) => setTimeout(r, 1500));

  await page.emulateMediaType('print');

  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: false,
    margin: { top: '18mm', bottom: '18mm', left: '14mm', right: '14mm' },
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-size:8px;width:100%;padding:0 14mm;color:#374151;font-family:Arial,sans-serif;
        display:flex;justify-content:space-between;border-bottom:1px solid #d1d5db;padding-bottom:4px;">
        <span>RelaySaathi — Master Team Brief</span>
        <span>Road Safety Hackathon 2026 · RoadSoS</span>
      </div>`,
    footerTemplate: `
      <div style="font-size:8px;width:100%;padding:0 14mm;color:#6b7280;font-family:Arial,sans-serif;
        display:flex;justify-content:space-between;border-top:1px solid #d1d5db;padding-top:4px;">
        <span>CoERS · IIT Madras · Deadline May 31, 2026</span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>`,
  });

  await browser.close();

  const stats = fs.statSync(pdfPath);
  console.log('✅ PDF saved:', pdfPath);
  console.log('   Size:', (stats.size / 1024 / 1024).toFixed(2), 'MB');
}

main().catch((err) => {
  console.error('PDF generation failed:', err.message);
  process.exit(1);
});
