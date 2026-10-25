import {readFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const cfg=JSON.parse(await readFile(new URL('../routes.json',import.meta.url),'utf8'));
const script=await readFile(new URL('../docs/redirect.js',import.meta.url),'utf8');
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
await mkdir(new URL('../output/',import.meta.url),{recursive:true});
try {
 for(const width of [390,1440])for(const r of cfg.routes){
  const context=await browser.newContext({viewport:{width,height:900}});
  const page=await context.newPage();
  const html=await readFile(new URL(`../docs/${r.id}/index.html`,import.meta.url),'utf8');
  await page.route('**/*',async request=>{
   const u=new URL(request.request().url());
   if(u.hostname==='route.test')return request.fulfill({status:200,contentType:u.pathname.endsWith('.js')?'text/javascript':'text/html',body:u.pathname.endsWith('.js')?script:html});
   assert.equal(u.origin,'https://joey-wilkes-home.vercel.app');
   await request.fulfill({status:200,contentType:'text/html',body:'<main><h1>Verified destination fixture</h1></main>'});
  });
  await page.goto(`http://route.test/${r.id}/?via=pdf&url=https://invalid.example/`);
  await page.waitForURL(u=>u.hostname==='joey-wilkes-home.vercel.app');
  const u=new URL(page.url());assert.equal(u.searchParams.get('utm_medium'),'pdf_link');assert.equal(u.searchParams.get('resume_profile'),r.profile);assert.equal(u.searchParams.get('utm_campaign'),`profile-${r.id}`);
  // Inspect the actual visible fallback without auto-navigation; source content otherwise unchanged.
  await page.unroute('**/*');
  await page.route('**/*',req=>req.abort());
  await page.setContent(html.replace(/<meta http-equiv="refresh"[^>]*>/,'').replace(/<script defer[^>]*><\/script>/,''));
  assert.equal(await page.locator('h1').textContent(),'Joseph Wilkes');
  assert.ok(await page.locator('#continue').getAttribute('href'));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.screenshot({path:fileURLToPath(new URL(`../output/${r.id}-${width}.png`,import.meta.url)),fullPage:true});
  await context.close();console.log(`PASS ${r.id} @ ${width}px: navigation, tracking and fallback`);
 }
}finally{await browser.close();}
