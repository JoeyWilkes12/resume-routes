import {readFile} from 'node:fs/promises';
import {destinationFor} from './build.mjs';
const cfg=JSON.parse(await readFile(new URL('../routes.json',import.meta.url),'utf8'));
const base=process.env.ROUTE_BASE_URL;
for(const r of cfg.routes){
 if(base){const source=await fetch(`${base.replace(/\/$/,'')}/${r.id}/`,{redirect:'follow'});if(!source.ok)throw new Error(`${r.id} source HTTP ${source.status}`);const text=await source.text();if(!text.includes(`profile-${r.id}`)||!text.includes('Continue to my website'))throw new Error(`Wrong route page: ${r.id}`);}
 const response=await fetch(destinationFor(r),{redirect:'follow'});
 if(!response.ok)throw new Error(`${r.id} destination HTTP ${response.status}`);
 if(new URL(response.url).origin!=='https://joey-wilkes-home.vercel.app')throw new Error('Unexpected final destination origin');
 const text=await response.text();if(!/Joey Wilkes|Joseph Wilkes/.test(text)||!/<main/.test(text))throw new Error('Expected portfolio content missing');
 console.log(`PASS ${r.id}: ${response.status} and expected portfolio content`);
}
