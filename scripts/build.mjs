import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export function destinationFor(route,via='qr') {
  const url=new URL(route.destination);
  if(url.protocol!=='https:' || url.hostname!=='joey-wilkes-home.vercel.app' || url.username || url.password) throw new Error('Destination must be the approved HTTPS portfolio origin');
  for(const [key,value] of Object.entries({utm_source:'resume',utm_medium:via==='pdf'?'pdf_link':'qr',utm_campaign:`profile-${route.id}`,utm_content:'r1',resume_profile:route.profile})) url.searchParams.set(key,value);
  return url.href;
}
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const style=`body{margin:0;padding:clamp(24px,6vw,64px);color:#20252b;background:#fff;font:1rem/1.6 system-ui,sans-serif}main{max-width:42rem}h1{margin:0 0 12px;font-size:1.8rem}a{display:inline-flex;align-items:center;min-height:44px;color:#0758b3;overflow-wrap:anywhere}a:focus-visible{outline:3px solid #0758b3;outline-offset:4px}ul{padding-left:22px}p{max-width:65ch}`;
const config=JSON.parse(await readFile(resolve(root,'routes.json'),'utf8'));
if(config.routes.length!==4 || new Set(config.routes.map(x=>x.id)).size!==4) throw new Error('Expected exactly four distinct profile routes');
await mkdir(resolve(root,'docs'),{recursive:true});
for(const route of config.routes){
  if(!/^[a-z]+(?:-[a-z]+)*$/.test(route.id))throw new Error('Invalid route');
  const target=destinationFor(route);const json=JSON.stringify({target}).replaceAll('<','\\u003c');
  const html=`<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><meta name="referrer" content="strict-origin-when-cross-origin"><meta http-equiv="refresh" content="1;url=${escape(target)}"><link rel="canonical" href="${escape(route.destination)}"><title>Joseph Wilkes | ${escape(route.label)}</title><style>${style}</style><script id="route-config" type="application/json">${json}</script><script defer src="../redirect.js"></script></head><body><main><h1>Joseph Wilkes</h1><p>${escape(route.label)} portfolio</p><a id="continue" href="${escape(target)}">Continue to my website</a></main></body></html>\n`;
  await mkdir(resolve(root,'docs',route.id),{recursive:true});await writeFile(resolve(root,'docs',route.id,'index.html'),html);
}
await writeFile(resolve(root,'docs','redirect.js'),`const {target}=JSON.parse(document.getElementById('route-config').textContent);\nconst destination=new URL(target);\nconst via=new URLSearchParams(location.search).get('via');\nif(via==='pdf')destination.searchParams.set('utm_medium','pdf_link');\ndocument.getElementById('continue').href=destination.href;\nlocation.replace(destination.href);\n`);
await writeFile(resolve(root,'docs','index.html'),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>Joseph Wilkes | Portfolio links</title><style>${style}</style></head><body><main><h1>Joseph Wilkes</h1><p>Explore my portfolio.</p><ul>${config.routes.map(r=>`<li><a href="./${r.id}/">${escape(r.label)}</a></li>`).join('')}</ul></main></body></html>\n`);
await writeFile(resolve(root,'docs','.nojekyll'),'');
await writeFile(resolve(root,'docs','robots.txt'),'User-agent: *\nAllow: /\n');
console.log('Generated four profile redirects in docs/');
