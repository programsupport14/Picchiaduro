// Salva solo la pagina d'ingresso (che porta al gioco in picchiaduro-sito/): il gioco ha un suo service worker.
const C='cafuddra-ingresso-2';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./','index.html'])).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('cafuddra-ingresso')&&k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;const rel=u.pathname.slice(new URL(self.registration.scope).pathname.length);if(rel!==''&&rel!=='index.html')return;
 e.respondWith(fetch(e.request).then(n=>{const c=n.clone();caches.open(C).then(x=>x.put(e.request,c));return n}).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(h=>h||caches.match('./'))))});
