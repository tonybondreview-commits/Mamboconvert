# Community Mamboconvert — configurazione Firebase (una volta sola)

La condivisione ricette usa **Firebase Firestore**: l'app parla direttamente con
Firebase, non c'è nessun server da gestire. La sicurezza è nelle *regole*.
Tu (amministratore) approvi le proposte; ogni utente tiene comunque le sue
ricette sul proprio telefono.

## Come funziona
1. Un utente crea una ricetta e preme **Proponi alla community** → finisce nella
   raccolta `proposte` (in attesa).
2. Tu apri il **pannello moderazione** (visibile solo a te) e **approvi** o
   **rifiuti**. Approvando, la ricetta passa nella raccolta pubblica `ricette`.
3. Tutti vedono le ricette pubbliche nella sezione **Community** e possono
   dargli le **stelle**.

## Passi da fare (≈ 10 minuti)

### 1. Progetto e database
1. <https://console.firebase.google.com> → apri (o crea) il progetto.
2. **Build → Firestore Database → Crea database** → modalità **produzione** →
   scegli una regione europea (es. `eur3`).

### 2. Accesso anonimo (serve per i voti e l'attribuzione, senza password)
1. **Build → Authentication → Get started**
2. Scheda **Sign-in method** → abilita **Anonimo**.

### 3. App web e configurazione
1. In **Impostazioni progetto** (ingranaggio) → **Le tue app** → icona **web `</>`**
2. Dai un nome (es. "Mamboconvert web") → **Registra app**.
3. Copia il blocco **`firebaseConfig`** (apiKey, authDomain, projectId, ecc.):
   **mandalo a chi cura l'app**, verrà incollato nel codice.
   > Queste chiavi sono pubbliche per natura in Firebase: la sicurezza la fanno
   > le regole, non il segreto delle chiavi.

### 4. Regole di sicurezza
1. **Firestore Database → Regole**
2. Incolla il contenuto di `firestore.rules` (in questa cartella).
3. **Non pubblicare ancora**: prima devi mettere il tuo UID admin (passo 5).

### 5. Il tuo UID di amministratore
1. Apri l'app una volta (dopo che la config è stata inserita): l'accesso anonimo
   crea il tuo utente.
2. In **Authentication → Users** trovi lo **User UID** del tuo dispositivo.
   In alternativa, l'app te lo mostra nel pannello moderazione.
3. In `firestore.rules` sostituisci `INCOLLA_QUI_IL_TUO_UID_ADMIN` con quell'UID
   e **Pubblica** le regole.

Da quel momento solo tu vedi le proposte e puoi pubblicare.

## Limiti gratuiti (piano Spark)
50.000 letture / 20.000 scritture al giorno, 1 GB. Per un'app di ricette è
abbondante: nessun costo previsto.

## Cosa NON viene raccolto
Nessun account, nessuna email, nessuna password. Solo un identificativo anonimo
del dispositivo (per un voto a testa) e il nome che l'utente sceglie di mettere
sulla ricetta proposta.
