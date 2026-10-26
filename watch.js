/* © 2026 Jérôme Desvaux — Tous droits réservés. Logiciel propriétaire : toute utilisation, copie, modification ou diffusion est soumise à licence (voir LICENSE). */
/* ============================================================
   Surveillance renforcée des fichiers (dossiers synchronisés OneDrive / SharePoint)
   Commun à actions.html, marges.html et planning.html.

   La surveillance de base de chaque page compare la date et la taille des
   fichiers toutes les 2 s. Avec OneDrive, ça ne suffit pas toujours :
   - un fichier mis à jour par la synchronisation peut garder la même date
     et la même taille → ici on compare aussi le CONTENU (empreinte SHA-256) ;
   - un fichier « disponible en ligne uniquement » n'est pas retéléchargé tant
     que personne ne l'ouvre → la lecture régulière force son téléchargement ;
   - le navigateur ralentit les minuteurs d'un onglet en arrière-plan → on
     relit dès que la fenêtre redevient active ;
   - quand le navigateur sait signaler les changements (FileSystemObserver),
     la page réagit immédiatement, sans attendre le prochain passage.

   S'appuie sur les variables globales de la page : dirHandle, cache, lastSig,
   sync(), EXT.
   ============================================================ */
(function () {
  const DEEP_EVERY = 8000;          // relecture du contenu (ms)
  const hashes = new Map();         // chemin -> empreinte du contenu
  let deepBusy = false, observer = null, observed = null, lastDeep = 0, debounce = null;

  const $ = id => document.getElementById(id);
  const hasCrypto = !!(window.crypto && crypto.subtle);

  async function digest(buf) {
    if (hasCrypto) {
      const h = new Uint8Array(await crypto.subtle.digest('SHA-256', buf));
      return Array.from(h.subarray(0, 12), b => b.toString(16).padStart(2, '0')).join('');
    }
    // repli (contexte non sécurisé) : empreinte FNV-1a
    const u = new Uint8Array(buf); let x = 0x811c9dc5;
    for (let i = 0; i < u.length; i++) { x ^= u[i]; x = Math.imul(x, 0x01000193) >>> 0; }
    return x.toString(16) + ':' + u.length;
  }

  async function listAll(dir, prefix = '', out = []) {
    for await (const [name, h] of dir.entries()) {
      if (name.startsWith('~$') || name.startsWith('.')) continue;
      if (h.kind === 'directory') { if (!name.startsWith('_')) await listAll(h, prefix + name + '/', out); continue; }
      if (EXT.test(name)) out.push({ name: prefix + name, handle: h });
    }
    return out;
  }

  function forceReload(names) {
    for (const n of names) cache.delete(n);
    lastSig = '';
    return sync();
  }

  // relecture du contenu : détecte un changement même si date et taille sont identiques
  async function deepCheck(reason) {
    if (deepBusy || !dirHandle || (typeof syncing !== 'undefined' && syncing)) return;
    deepBusy = true; lastDeep = Date.now();
    try {
      const changed = [];
      const seen = new Set();
      for (const e of await listAll(dirHandle)) {
        seen.add(e.name);
        let buf;
        try { buf = await (await e.handle.getFile()).arrayBuffer(); } catch (err) { continue; }   // verrouillé : on réessaiera
        const h = await digest(buf);
        const prev = hashes.get(e.name);
        hashes.set(e.name, h);
        if (prev && prev !== h) changed.push(e.name);
      }
      for (const n of [...hashes.keys()]) if (!seen.has(n)) hashes.delete(n);
      if (changed.length) {
        await forceReload(changed);
        note(`contenu modifié détecté (${changed.map(n => n.split('/').pop()).join(', ')})`);
      }
    } catch (e) { /* dossier momentanément inaccessible : la page le signale déjà */ }
    finally { deepBusy = false; }
  }

  // notifications immédiates du navigateur, si disponibles
  function observe() {
    if (!('FileSystemObserver' in window) || !dirHandle || observed === dirHandle) return;
    try {
      if (observer) observer.disconnect();
      observer = new FileSystemObserver(() => {
        clearTimeout(debounce);
        debounce = setTimeout(() => { lastSig = ''; sync(); deepCheck('observer'); }, 400);
      });
      observer.observe(dirHandle, { recursive: true }).catch(() => {});
      observed = dirHandle;
    } catch (e) { observer = null; }
  }

  // ligne d'information : dernière version reçue + bouton « Relire maintenant »
  let lastNote = '';
  function note(t) { lastNote = `${t} à ${new Date().toLocaleTimeString('fr-FR')}`; info(); }
  const ago = ms => { const s = Math.round(ms / 1000); if (s < 60) return 'à l\'instant'; const m = Math.round(s / 60); if (m < 60) return `il y a ${m} min`; const h = Math.floor(m / 60); if (h < 24) return `il y a ${h} h ${String(m % 60).padStart(2, '0')}`; const d = Math.floor(h / 24); return `il y a ${d} jour${d > 1 ? 's' : ''}`; };
  function info() {
    let el = $('freshInfo');
    const live = $('liveTxt');
    if (!live) return;
    if (!el) { el = document.createElement('div'); el.id = 'freshInfo'; el.className = 'sub'; el.style.cssText = 'font-size:12px;margin-top:2px'; live.parentNode.insertBefore(el, live.nextSibling); }
    if (!dirHandle) { el.textContent = ''; return; }
    let best = null;
    for (const [name, c] of cache) if (c && c.mtime && (!best || c.mtime > best.mtime)) best = { name, mtime: c.mtime };
    const parts = [];
    if (best) parts.push(`Version la plus récente reçue : ${best.name.split('/').pop()}, enregistrée le ${new Date(best.mtime).toLocaleDateString('fr-FR')} à ${new Date(best.mtime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} (${ago(Date.now() - best.mtime)})`);
    parts.push(('FileSystemObserver' in window) ? 'surveillance instantanée' : `contenu relu toutes les ${DEEP_EVERY / 1000} s`);
    if (lastNote) parts.push(lastNote);
    el.textContent = parts.join(' · ');
  }

  function addButton() {
    const pick = $('pickBtn');
    if (!pick || $('reloadNow')) return;
    const b = document.createElement('button');
    b.id = 'reloadNow'; b.type = 'button'; b.textContent = '↻ Relire maintenant';
    b.title = 'Relire tous les fichiers du dossier tout de suite (utile si OneDrive vient de synchroniser)';
    b.hidden = true;
    b.onclick = async () => {
      b.disabled = true; b.textContent = 'Lecture…';
      hashes.clear();
      try { cache.clear(); lastSig = ''; await sync(); await deepCheck('manuel'); note('relecture complète'); }
      finally { b.disabled = false; b.textContent = '↻ Relire maintenant'; }
    };
    pick.parentNode.insertBefore(b, pick.nextSibling);
  }

  addButton();
  setInterval(() => {
    const b = $('reloadNow'); if (b) b.hidden = !dirHandle;
    observe();
    info();
    if (dirHandle && !document.hidden && Date.now() - lastDeep >= DEEP_EVERY) deepCheck('periodique');
  }, 2000);
  // dès que la fenêtre redevient active : relecture immédiate (le navigateur ralentit les onglets en arrière-plan)
  const wake = () => { if (dirHandle && !document.hidden) { lastSig = ''; sync(); deepCheck('retour'); } };
  window.addEventListener('focus', wake);
  document.addEventListener('visibilitychange', wake);
  window.addEventListener('online', wake);
})();
