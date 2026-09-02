/* Service worker: network-first per l'app (nuove ricette da sole quando sei online),
   cache-first per le foto dei piatti (anche remote, es. Pexels) così restano offline
   dopo la prima volta che le vedi. Cambia CACHE per forzare la pulizia dell'app. */
const CACHE = 'cucina-mambo-v27';
const IMG_CACHE = 'mambo-fotos-v2';   /* persistente; il nome cambia solo per svuotare cache guaste */
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

/* Solo le immagini vere. Le chiamate alle API non sono foto: metterle in cache
   congelerebbe anche le risposte di errore, che poi tornerebbero identiche per
   sempre (e' successo con Pexels: un 401 di una chiave scaduta restava salvato). */
function isFoto(req, url) {
  if (/^api\./i.test(url.hostname)) return false;
  return req.destination === 'image'
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
        if (res && res.ok) {                       /* solo le risposte riuscite */
          const copy = res.clone();
          caches.open(IMG_CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => Response.error()))
    );
    return;
  }

  /* App: solo stesso dominio, network-first. */
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      }
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
