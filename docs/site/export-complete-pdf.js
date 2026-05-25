/** Generate NovaDrive Complete Project PDF for UI team */
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'novadrive-complete.html');
const pdfPath = path.join(__dirname, 'NOVADRIVE_COMPLETE_PROJECT.pdf');
const pdfPathDocs = path.join(__dirname, '..', 'NOVADRIVE_COMPLETE_PROJECT.pdf');

async function main() {
  if (!fs.existsSync(htmlPath)) {
    console.error('Missing:', htmlPath);
    process.exit(1);
  }
  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch {
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
  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 120000 });
  await page.evaluate(() => document.body.classList.add('pdf-export'));
  await page
    .waitForFunction(() => document.querySelectorAll('.mermaid svg').length >= 3, {
      timeout: 45000,
    })
    .catch(() => console.warn('Some diagrams may be missing'));
  await new Promise((r) => setTimeout(r, 2000));
  await page.emulateMediaType('print');

  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '16mm', bottom: '16mm', left: '12mm', right: '12mm' },
    displayHeaderFooter: true,
    headerTemplate: `<div style="font-size:7px;width:100%;padding:0 12mm;color:#374151;font-family:Arial,sans-serif;display:flex;justify-content:space-between;"><span>NovaDrive — Complete Project & UI Brief</span><span>RoadSoS 2026</span></div>`,
    footerTemplate: `<div style="font-size:7px;width:100%;padding:0 12mm;color:#6b7280;font-family:Arial,sans-serif;display:flex;justify-content:space-between;"><span>IIT Madras · May 31, 2026 deadline</span><span>Page <span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
  });

  await browser.close();
  fs.copyFileSync(pdfPath, pdfPathDocs);
  const stats = fs.statSync(pdfPath);
  console.log('PDF saved:', pdfPath);
  console.log('PDF copy:', pdfPathDocs);
  console.log('Size MB:', (stats.size / 1024 / 1024).toFixed(2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
