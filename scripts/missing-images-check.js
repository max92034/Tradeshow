(async()=>{
const ps=JSON.parse(localStorage.getItem('tradeshow_products'));
const B='https://d2smnk90fd10gg.cloudfront.net';
const norm=u=>{
const i=u.indexOf('/_next/image?');
if(i<0)return u;
return new URLSearchParams(u.slice(i+13)).get('url')||u};
const src=p=>norm(p.imageUrl)||(B+'/commodity/photo/'+p.sku+'-1.jpg');
const missing=[];
await Promise.all(ps.map(p=>new Promise(res=>{
const img=new Image();
img.onload=()=>res();
img.onerror=()=>{missing.push(p.sku);res()};
img.src=src(p)})));
console.log('missing:',missing.length,'of',ps.length);
const a=document.createElement('a');
a.href=URL.createObjectURL(new Blob(['SKU\n'+missing.join('\n')]));
a.download='missing_images.csv';
a.click()})()
