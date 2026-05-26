const pptxgen = require('pptxgenjs');
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');

const proposals = [
  {
    name: 'HIRO x PUMA KIDS',
    html: 'output/260525_히로푸마키즈/index.html',
    pptx: 'output/260525_히로푸마키즈/HIRO_x_PUMA_KIDS_콜라보_제안서.pptx',
    pdf:  'output/260525_히로푸마키즈/HIRO_x_PUMA_KIDS_콜라보_제안서.pdf',
  },
  {
    name: '아디다스 키즈 어카운트',
    html: 'output/260525_매장 어카운트제안_아디다스/index.html',
    pptx: 'output/260525_매장 어카운트제안_아디다스/아디다스_키즈_어카운트_승인_제안서.pptx',
    pdf:  'output/260525_매장 어카운트제안_아디다스/아디다스_키즈_어카운트_승인_제안서.pdf',
  },
];

async function exportProposal({ name, html, pptx, pdf }) {
  const htmlPath = path.join(ROOT, html);
  const pptxPath = path.join(ROOT, pptx);
  const pdfPath = path.join(ROOT, pdf);
  const dir = path.dirname(pptxPath);

  console.log(`\n📄 ${name}`);

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  const totalSlides = await page.evaluate(() => document.querySelectorAll('.slide').length);
  console.log(`   ${totalSlides} slides`);

  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE';
  pres.title = name;

  const pngs = [];
  for (let i = 0; i < totalSlides; i++) {
    await page.evaluate((idx) => {
      document.querySelectorAll('.slide').forEach((s, j) => s.classList.toggle('active', j === idx));
    }, i);
    await page.waitForTimeout(500);

    const png = path.join(dir, `_export_${i + 1}.png`);
    await page.screenshot({ path: png, clip: { x: 0, y: 0, width: 1920, height: 1080 } });
    pngs.push(png);

    const slide = pres.addSlide();
    slide.addImage({ path: png, x: 0, y: 0, w: 13.33, h: 7.5 });
    process.stdout.write(`   ✓ slide ${i + 1}\n`);
  }

  await pres.writeFile({ fileName: pptxPath });
  console.log(`   ✅ PPTX → ${path.basename(pptxPath)}`);
  await browser.close();

  // PDF via Python PIL
  const pyScript = `
from PIL import Image
import sys
imgs = [Image.open(f).convert("RGB") for f in sys.argv[2:]]
imgs[0].save(sys.argv[1], save_all=True, append_images=imgs[1:])
`;
  const args = [pdfPath, ...pngs].map(f => `"${f}"`).join(' ');
  execSync(`python3 -c '${pyScript}' ${args}`);
  console.log(`   ✅ PDF  → ${path.basename(pdfPath)}`);

  // Cleanup
  pngs.forEach(f => fs.unlinkSync(f));
}

async function main() {
  console.log('🚀 Exporting all proposals...');
  for (const p of proposals) {
    await exportProposal(p);
  }
  console.log('\n🎉 Done!');
}

main().catch(err => { console.error(err); process.exit(1); });
