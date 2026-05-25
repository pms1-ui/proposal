const { chromium } = require('playwright');
const path = require('path');

async function main() {
  const htmlPath = path.join(__dirname, '..', 'output', '260525_히로푸마키즈', 'index.html');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  const total = await page.evaluate(() => document.querySelectorAll('.slide').length);

  for (let i = 0; i < total; i++) {
    await page.evaluate((idx) => {
      document.querySelectorAll('.slide').forEach((s, j) => s.classList.toggle('active', j === idx));
    }, i);
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(__dirname, '..', 'output', '260525_히로푸마키즈', `preview_slide_${i+1}.png`), clip: { x: 0, y: 0, width: 1920, height: 1080 } });
    console.log(`✓ Slide ${i+1} preview saved`);
  }

  await browser.close();
  console.log('\n✅ All previews saved to output/');
}

main().catch(console.error);
