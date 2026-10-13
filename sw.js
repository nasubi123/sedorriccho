// せどりっちょ オフライン用（画面は常に最新を取りに行き、圏外のときだけ保存版を使う）
const CACHE="sedorriccho-v8";
const SHELL=["./","./index.html","./manifest.webmanifest","./icon-180.png","./icon-192.png","./icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL.map(u=>new Request(u,{cache:"reload"})))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const req=e.request;if(req.method!=="GET")return;
  const url=new URL(req.url);
  const isPage=req.mode==="navigate"||(url.origin===location.origin&&/\/(index\.html)?$/.test(url.pathname));
  if(isPage){
    e.respondWith(fetch(req.url,{cache:"no-cache",credentials:"same-origin"}).then(r=>{if(r&&r.ok){const c2=r.clone();caches.open(CACHE).then(c=>c.put("./index.html",c2))}return r}).catch(()=>caches.match("./index.html")));
    return;
  }
  e.respondWith(caches.open(CACHE).then(async c=>{
    const hit=await c.match(req,{ignoreSearch:true});
    const net=fetch(req).then(r=>{if(r&&(r.ok||r.type==="opaque"))c.put(req,r.clone());return r}).catch(()=>hit);
    return hit||net;
  }));
});
