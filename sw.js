/* Service worker: network-first per l'app (nuove ricette da sole quando sei online),
   cache-first per le foto dei piatti (anche remote, es. Pexels) così restano offline
   dopo la prima volta che le vedi. Cambia CACHE per forzare la pulizia dell'app. */
const CACHE = 'cucina-mambo-v24';
const IMG_CACHE = 'mambo-fotos';   /* persistente: non si svuota agli aggiornamenti */
const ASSETS = ['./', './index.html', './manifest.webmanifest', './logo.png', './foto.js',
  './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  /* attiva subito la nuova versione: i fix arrivano senza restare bloccati in "waiting".
     Il reload è protetto da una guardia (una sola volta per sessione) in index.html. */
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== IMG_CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

function isFoto(req, url) {
  return req.destination === 'image' || /(^|\.)pexels\.com$/.test(url.hostname)
    || /\.(jpe?g|png|webp|avif|gif)$/i.test(url.pathname);
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  /* Foto (anche di un altro dominio): prima la cache, poi la rete; salva per l'offline. */
  if (isFoto(req, url)) {
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(IMG_CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => Response.error()))
    );
    return;
  }

  /* App: solo stesso dominio, network-first. */
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
