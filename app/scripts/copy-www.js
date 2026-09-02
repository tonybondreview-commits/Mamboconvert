/* Copia i file del sito (cartella superiore) dentro app/www,
   che e' la cartella che Capacitor impacchetta nell'APK. */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const WWW  = path.resolve(__dirname, '..', 'www');

/* Solo i file che servono davvero all'app: niente strumenti interni. */
const FILES = [
  'index.html', 'sw.js', 'foto.js', 'manifest.webmanifest',
  'logo.png', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'
];

fs.rmSync(WWW, { recursive: true, force: true });
fs.mkdirSync(WWW, { recursive: true });

let copiati = 0;
for (const f of FILES) {
  const src = path.join(ROOT, f);
  if (!fs.existsSync(src)) { console.warn('  salto (manca): ' + f); continue; }
  fs.copyFileSync(src, path.join(WWW, f));
  copiati++;
}
console.log(`www aggiornata: ${copiati} file copiati da ${ROOT}`);
