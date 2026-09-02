# Mamboconvert — app Android (Capacitor)

Guscio nativo Android dell'app Mamboconvert. **Riusa lo stesso codice del sito**
(`index.html` nella cartella superiore): ogni miglioria fatta al sito arriva
anche nell'app, basta rifare il build.

## Cosa serve, una volta sola
- **Android Studio** installato (include l'SDK Android e Java)
- **Node.js 20+**

## Generare l'APK

```bash
cd app
npm install          # solo la prima volta
npm run build        # copia il sito in www/ e sincronizza il progetto Android
npm run open         # apre il progetto in Android Studio
```

In Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
per un APK di prova, oppure **Build → Generate Signed Bundle / APK → Android App Bundle (.aab)**
per caricarlo sul Play Store (il Play Store vuole il formato `.aab`).

> Dopo **ogni** modifica al sito rilancia `npm run build`, altrimenti l'app
> continua a contenere la versione precedente.

## Notifiche per le nuove ricette

Le notifiche usano Firebase Cloud Messaging (gratuito). Servono **una volta sola**:

1. Vai su <https://console.firebase.google.com> → **Aggiungi progetto** (nome: Mamboconvert).
2. Dentro il progetto: **Aggiungi app → Android**.
   - Nome pacchetto: **`com.mamboconvert.app`** (deve essere identico)
   - Scarica il file **`google-services.json`**
3. Copia quel file in: **`app/android/app/google-services.json`**
4. Rifai `npm run build` e ricompila l'APK.

### Inviare una notifica quando aggiungi ricette
Nella console Firebase: **Messaggistica** → **Crea la prima campagna** →
*Messaggi Firebase Notification* → scrivi titolo e testo
(es. «5 nuove ricette» / «Apri Mamboconvert per scoprirle») → scegli l'app
`com.mamboconvert.app` → **Rivedi e pubblica**.

Non serve nessun server: le notifiche partono dalla console, gratis.

## Pubblicare sul Play Store
1. <https://play.google.com/console> → **Crea app**
2. Carica il file `.aab` firmato
3. Compila scheda del negozio, informativa privacy, questionario contenuti
4. Invia per la revisione (di solito pochi giorni)

Il nome pacchetto **`com.mamboconvert.app` non è più modificabile** dopo la
prima pubblicazione.
