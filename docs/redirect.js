const {target}=JSON.parse(document.getElementById('route-config').textContent);
const destination=new URL(target);
const via=new URLSearchParams(location.search).get('via');
if(via==='pdf')destination.searchParams.set('utm_medium','pdf_link');
document.getElementById('continue').href=destination.href;
location.replace(destination.href);
