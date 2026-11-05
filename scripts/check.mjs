import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
const pass = process.env.REVIEW_PASS || '2';
const output = `docs/screenshots/pass-${pass}`;
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
const results = [];
try {
 for (const width of [390,768,1280,1920]) {
  const context = await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e=>errors.push(e.message));
  page.on('response', r=>{if(r.status()>=400)errors.push(`${r.status()}: ${r.url()}`)});
  for (const [name,url] of [['home','/'],['academics','/academics.html'],['menu','/menu.html']]) {
   await page.goto(`http://127.0.0.1:4173${url}`,{waitUntil:'networkidle'});
   await page.evaluate(()=>document.fonts.ready);
   // Scroll once to load all below-the-fold images before full-page capture.
   await page.evaluate(async()=>{for(const img of document.images){img.loading='eager';}await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
   const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,h1:document.querySelectorAll('h1').length,brokenImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).length,hasScript:!!document.querySelector('script'),skyline:document.querySelector('.skyline').getBoundingClientRect().width}));
   const brokenLinks=await page.evaluate(()=>[...document.querySelectorAll('a[href^="#"]')].filter(a=>!document.getElementById(a.getAttribute('href').slice(1))).map(a=>a.getAttribute('href')));
   const a11y=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
   await page.screenshot({path:`${output}/${name}-${width}.png`,fullPage:true});
   const result={name,width,...layout,brokenLinks,violations:a11y.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>n.target)})),errors:[...errors]};
   results.push(result); console.log(JSON.stringify(result));
  }
  // Functional navigation, focus and native accordion states.
  await page.goto('http://127.0.0.1:4173/');
  await page.keyboard.press('Tab');
  if(await page.locator(':focus').textContent()!=='Skip to content')throw Error('Skip link is not first focus target');
  await page.keyboard.press('Enter');
  await page.getByRole('link',{name:'Open full menu'}).click();
  await page.waitForURL('**/menu.html');
  await page.locator('.full-menu a').first().click();
  await page.waitForURL('**/academics.html');
  const details=page.locator('details').first();
  await details.locator('summary').click();
  if(await details.getAttribute('open')!==null)throw Error('Footer accordion failed to close');
  await details.locator('summary').click();
  if(await details.getAttribute('open')===null)throw Error('Footer accordion failed to reopen');
  await context.close();
 }
 await writeFile(`${output}/results.json`,JSON.stringify(results,null,2)+'\n');
 if(results.some(r=>r.overflow||r.h1!==1||r.brokenImages||r.brokenLinks.length||r.violations.length||r.errors.length||r.hasScript)) process.exitCode=1;
} finally { await browser.close(); }
