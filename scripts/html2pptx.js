const pptxgen = require('pptxgenjs');
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function main() {
  const htmlPath = path.join(__dirname, '..', 'output', '260525_히로푸마키즈', 'index.html');
  const outputPath = path.join(__dirname, '..', 'output', '260525_히로푸마키즈', 'HIRO_x_PUMA_KIDS_콜라보_제안서.pptx');
  
  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('🚀 Starting HTML → PPTX conversion');
  
  // Launch browser
  const browser = await chromium.launch();
  
  // Slide dimensions: 16:9 at 2x retina
  const SLIDE_WIDTH = 1920;
  const SLIDE_HEIGHT = 1080;

  const page = await browser.newPage();
  await page.setViewportSize({ width: SLIDE_WIDTH, height: SLIDE_HEIGHT });
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
  
  // Wait for fonts
  await page.waitForTimeout(2500);
  
  // Get total slide count
  const totalSlides = await page.evaluate(() => document.querySelectorAll('.slide').length);
  console.log(`Found ${totalSlides} slides`);
  
  // Create presentation
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE';
  pres.author = 'HIRO';
  pres.title = 'HIRO x PUMA KIDS Collaboration Proposal';
  
  for (let i = 0; i < totalSlides; i++) {
    console.log(`Processing slide ${i + 1}/${totalSlides}`);
    
    // Navigate to slide
    await page.evaluate((idx) => {
      document.querySelectorAll('.slide').forEach((s, j) => {
        s.classList.toggle('active', j === idx);
      });
    }, i);
    
    await page.waitForTimeout(500);
    
    // Screenshot
    const screenshotPath = path.join(__dirname, '..', `_temp_slide_${i + 1}.png`);
    await page.screenshot({
      path: screenshotPath,
      clip: { x: 0, y: 0, width: SLIDE_WIDTH, height: SLIDE_HEIGHT }
    });
    
    // Add to PPTX
    const slide = pres.addSlide();
    slide.addImage({
      path: screenshotPath,
      x: 0,
      y: 0,
      w: 13.33,
      h: 7.5
    });
    
    console.log(`  ✓ Slide ${i + 1} captured`);
  }
  
  await browser.close();
  
  // Save
  await pres.writeFile({ fileName: outputPath });
  console.log(`\n✅ Saved: ${outputPath}`);
  
  // Cleanup temp files
  for (let i = 0; i < totalSlides; i++) {
    const tempFile = path.join(__dirname, '..', `_temp_slide_${i + 1}.png`);
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
  }
  console.log('🧹 Temp files cleaned');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
