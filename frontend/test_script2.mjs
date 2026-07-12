import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('pageerror', error => console.log('CRASH:', error.message));
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
  });
  
  try {
    await page.goto('http://localhost:3000');
    console.log('Loaded page');
    
    // Wait for the dropzone or input to be ready
    await page.waitForSelector('input[type="file"]', { timeout: 10000 });
    await page.setInputFiles('input[type="file"]', '../test.csv');
    console.log('Uploaded file');
    
    // Wait for preview step
    await page.waitForSelector('button:has-text("Confirm Import")', { timeout: 10000 });
    console.log('Preview step loaded');
    
    // Click confirm with force
    await page.click('button:has-text("Confirm Import")', { force: true });
    console.log('Clicked Confirm Import');
    
    // Wait for processing or crash
    await page.waitForTimeout(10000);
  } catch (err) {
    console.error('SCRIPT ERROR:', err.message);
  } finally {
    await browser.close();
  }
})();
