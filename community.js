/* ============================================================
   Mamboconvert — modulo Community (Firebase Firestore)
   Isolato: se Firebase non carica o non è configurato, l'app
   resta identica. La sicurezza è nelle regole (community/firestore.rules).
   Le chiavi qui sotto sono pubbliche per natura in Firebase.
   ============================================================ */
(function(){
  const CONFIG = {
    apiKey: "AIzaSyBy5M4sl_Qlq3xg6XIlbpnK5jHIcJd3ECU",
    authDomain: "mamboconvert.firebaseapp.com",
    projectId: "mamboconvert",
    storageBucket: "mamboconvert.firebasestorage.app",
    messagingSenderId: "994081632699",
    appId: "1:994081632699:web:aa9576e4eaf38341dcd49e"
  };
  /* Dopo il primo avvio metti qui il TUO UID (lo trovi nella scheda Community,
     "Il tuo ID"): abilita il pannello di moderazione solo per te.
     Ricordati di metterlo anche in community/firestore.rules e pubblicare. */
  const ADMIN_UID = "oa4dOu8HZLYH5nKsV0P65bWCI6J3";

  const V = "10.12.2";
  const BASE = "https://www.gstatic.com/firebasejs/"+V+"/";
  let fb=null, db=null, auth=null, uid=null;

  function loadScript(src){ return new Promise((res,rej)=>{
    const s=document.createElement('script'); s.src=src; s.async=true;
    s.onload=res; s.onerror=()=>rej(new Error('load '+src)); document.head.appendChild(s); }); }

  /* solo i campi ammessi di una ricetta, per tenere puliti i documenti */
  function pulisci(r){
    const s=x=>Array.isArray(x)?x:[];
    return {
      id: String(r.id||''), nome:String(r.nome||'').slice(0,80),
      cat:String(r.cat||'Primi'), tempo:+r.tempo||0, porz:+r.porz||1, vol:+r.vol||500,
      caraffa:String(r.caraffa||'Acciaio'), acc:s(r.acc).slice(0,8), tag:s(r.tag).slice(0,8),
      ing:s(r.ing).slice(0,60).map(i=>({q:+i.q||0,u:String(i.u||'').slice(0,12),n:String(i.n||'').slice(0,60)})),
      steps:s(r.steps).slice(0,40).map(p=>({x:String(p.x||'').slice(0,400),
        t:String(p.t||'—').slice(0,20), v:String(p.v||'—').slice(0,20),
        T:String(p.T||'—').slice(0,20), P:String(p.P||'—').slice(0,20),
        a:String(p.a||'—').slice(0,20), b:'—'})),
      note:s(r.note).slice(0,10).map(n=>String(n).slice(0,300))
    };
  }

  const ready = (async function init(){
    if(!CONFIG.apiKey || /INCOLLA/i.test(CONFIG.apiKey)) throw new Error('community non configurata');
    await loadScript(BASE+'firebase-app-compat.js');
    await Promise.all([ loadScript(BASE+'firebase-auth-compat.js'), loadScript(BASE+'firebase-firestore-compat.js') ]);
    fb=window.firebase; fb.initializeApp(CONFIG); auth=fb.auth(); db=fb.firestore();
    await auth.signInAnonymously();
    uid=auth.currentUser && auth.currentUser.uid;
    return true;
  })();
  /* evita il "rejection non gestito" in console quando Firebase non carica
     (offline o non configurato): chi attende ready lo intercetta comunque */
  ready.catch(function(){});

  window.Community = {
    ready,
    configured: true,
    uid: ()=>uid,
    isAdmin: ()=> !!uid && !!ADMIN_UID && uid===ADMIN_UID,

    async propose(recipe, autore){
      await ready;
      const ref=await db.collection('proposte').add({
        uid, autore:String(autore||'').slice(0,40), stato:'in_attesa',
        creata: fb.firestore.FieldValue.serverTimestamp(), recipe: pulisci(recipe)
      });
      return ref.id;
    },
    async pending(){ await ready;
      const q=await db.collection('proposte').orderBy('creata').get();
      return q.docs.map(d=>Object.assign({propId:d.id}, d.data())); },
    async approve(propId){ await ready;
      const snap=await db.collection('proposte').doc(propId).get();
      if(!snap.exists) return; const data=snap.data();
      const rec=pulisci(data.recipe); const docId=rec.id||propId;
      await db.collection('ricette').doc(docId).set({
        recipe:rec, autore:data.autore||'', uid:data.uid||'',
        approvata: fb.firestore.FieldValue.serverTimestamp() });
      await db.collection('proposte').doc(propId).delete();
      return docId; },
    async reject(propId){ await ready; await db.collection('proposte').doc(propId).delete(); },
    async removePublic(id){ await ready; await db.collection('ricette').doc(id).delete(); },
    async publicList(){ await ready;
      const q=await db.collection('ricette').get();
      return q.docs.map(d=>Object.assign({docId:d.id}, d.data())); },

    async rate(id, stelle){ await ready;
      await db.collection('ricette').doc(id).collection('voti').doc(uid).set({stelle:+stelle}); },
    async ratings(id){ await ready;
      const q=await db.collection('ricette').doc(id).collection('voti').get();
      let n=q.size,sum=0,mio=0; q.forEach(d=>{const s=+d.data().stelle||0;sum+=s;if(d.id===uid)mio=s;});
      return {n, media:n?sum/n:0, mio}; }
  };
})();
