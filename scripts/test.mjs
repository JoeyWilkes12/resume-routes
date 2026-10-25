import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {destinationFor} from './build.mjs';
const cfg=JSON.parse(await readFile(new URL('../routes.json',import.meta.url),'utf8'));
const script=await readFile(new URL('../docs/redirect.js',import.meta.url),'utf8');
for(const route of cfg.routes) test(`${route.id}: fallback and script target approved profile with stable campaign`,async()=>{
 const html=await readFile(new URL(`../docs/${route.id}/index.html`,import.meta.url),'utf8');
 const payload=JSON.parse(html.match(/id="route-config" type="application\/json">([^<]+)/)[1]);
 assert.equal(payload.target,destinationFor(route));
 assert.ok(html.includes('noindex,follow'));assert.ok(html.includes('id="continue"'));
 assert.ok(html.includes('http-equiv="refresh"'));
 for(const query of ['', '?via=pdf','?via=qr','?url=https://attacker.example/&via=pdf']){
  let actual;const link={href:''};
  vm.runInNewContext(script,{URL,URLSearchParams,document:{getElementById:id=>id==='route-config'?{textContent:JSON.stringify(payload)}:link},location:{search:query,replace:url=>{actual=url}}});
  const u=new URL(actual);assert.equal(u.origin,'https://joey-wilkes-home.vercel.app');assert.equal(u.searchParams.get('resume_profile'),route.profile);assert.equal(u.searchParams.get('utm_campaign'),`profile-${route.id}`);assert.equal(u.searchParams.get('utm_medium'),query.includes('via=pdf')?'pdf_link':'qr');assert.equal(link.href,actual);assert.equal(u.searchParams.has('url'),false);
 }
});
test('reject arbitrary and non-HTTPS destinations',()=>{for(const destination of ['http://joey-wilkes-home.vercel.app/','https://attacker.example/','https://bad@joey-wilkes-home.vercel.app/'])assert.throws(()=>destinationFor({...cfg.routes[0],destination}));});
test('index links resolve to generated pages',async()=>{const html=await readFile(new URL('../docs/index.html',import.meta.url),'utf8');for(const r of cfg.routes){assert.ok(html.includes(`href="./${r.id}/"`));assert.ok((await readFile(new URL(`../docs/${r.id}/index.html`,import.meta.url),'utf8')).includes('Joseph Wilkes'));}});
