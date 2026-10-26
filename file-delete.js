/* © 2026 Jérôme Desvaux — Tous droits réservés. Logiciel propriétaire : toute utilisation, copie, modification ou diffusion est soumise à licence (voir LICENSE). */
/* ============================================================
   Suppression d'un fichier importé, depuis la liste des fichiers.
   Utilisé par actions.html (Actions commerciales) et marges.html (Marges & ETP).
   Repose sur les variables de la page : dirHandle, snapshotFiles, manual,
   lastSig, sync().

   Par sécurité, rien n'est effacé définitivement : le fichier est DÉPLACÉ dans
   le sous-dossier « _corbeille » du dossier surveillé (ignoré par la page),
   d'où on peut le remettre en place à la main.
   ============================================================ */
(function () {
  const TRASH = '_corbeille';

  // bouton à insérer dans chaque pastille de fichier
  window.delBtn = function (name) {
    const n = String(name).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    return `<button class="del" type="button" data-del="${n}" title="Retirer ce fichier" aria-label="Retirer ${n}">×</button>`;
  };

  function msg(txt, kind) {
    let el = document.getElementById('delMsg');
    if (!el) {
      el = document.createElement('div');
      el.id = 'delMsg';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      const files = document.getElementById('files');
      files.parentNode.insertBefore(el, files.nextSibling);
    }
    el.textContent = txt;
    el.className = 'delmsg' + (kind ? ' ' + kind : '');
    clearTimeout(msg.t);
    if (txt && kind !== 'err') msg.t = setTimeout(() => { el.textContent = ''; el.className = 'delmsg'; }, 8000);
  }

  const stamp = () => {
    const d = new Date(), p = v => String(v).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}h${p(d.getMinutes())}`;
  };

  async function moveToTrash(path) {
    const parts = path.split('/');
    let dir = dirHandle;
    for (const p of parts.slice(0, -1)) dir = await dir.getDirectoryHandle(p);
    const fname = parts[parts.length - 1];
    const fh = await dir.getFileHandle(fname);
    let bytes;
    try { bytes = await (await fh.getFile()).arrayBuffer(); }
    catch (e) { throw new Error('fichier illisible (ouvert dans Excel ?)'); }
    // 1. copie dans _corbeille
    const trash = await dirHandle.getDirectoryHandle(TRASH, { create: true });
    const dot = fname.lastIndexOf('.');
    const copyName = `${dot > 0 ? fname.slice(0, dot) : fname} (retire le ${stamp()})${dot > 0 ? fname.slice(dot) : ''}`;
    const out = await trash.getFileHandle(copyName, { create: true });
    const w = await out.createWritable(); await w.write(bytes); await w.close();
    // 2. suppression de l'original (seulement si la copie a réussi)
    try { await dir.removeEntry(fname); }
    catch (e) {
      try { await trash.removeEntry(copyName); } catch (_) {}
      throw new Error(/NoModification|InvalidModification|lock/i.test(e.name + e.message) ? 'fichier ouvert dans Excel ou verrouillé : ferme-le puis recommence' : e.message);
    }
    return copyName;
  }

  async function remove(name) {
    // fichier ajouté à la main : on le retire simplement de la page
    if (name.startsWith('(ajouté) ')) {
      manual.delete(name.slice('(ajouté) '.length));
      lastSig = ''; await sync();
      msg(`« ${name.slice(9)} » retiré de la page (le fichier d'origine n'est pas touché).`, 'ok');
      return;
    }
    if (!dirHandle) {
      msg('Ce navigateur ne permet pas de supprimer un fichier du dossier : retire-le dans l\'explorateur de fichiers puis clique sur « Actualiser ».', 'err');
      return;
    }
    let perm = 'denied';
    try { perm = await dirHandle.requestPermission({ mode: 'readwrite' }); } catch (e) {}
    if (perm !== 'granted') { msg('Autorisation de modifier le dossier refusée par le navigateur.', 'err'); return; }
    msg(`Suppression de « ${name} »…`, 'busy');
    try {
      const copy = await moveToTrash(name);
      lastSig = ''; await sync();
      msg(`« ${name} » a été retiré du dossier. Une copie est conservée dans « ${TRASH}/${copy} ».`, 'ok');
    } catch (e) {
      msg(`« ${name} » n'a pas été supprimé : ${e.message}`, 'err');
    }
  }

  // 1er clic : demande de confirmation ; 2e clic (dans les 4 s) : suppression
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-del]');
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    if (b.dataset.armed !== '1') {
      document.querySelectorAll('[data-del][data-armed="1"]').forEach(x => { x.dataset.armed = ''; x.textContent = '×'; x.classList.remove('armed'); });
      b.dataset.armed = '1'; b.textContent = 'Supprimer ?'; b.classList.add('armed');
      setTimeout(() => { if (b.isConnected && b.dataset.armed === '1') { b.dataset.armed = ''; b.textContent = '×'; b.classList.remove('armed'); } }, 4000);
      return;
    }
    b.disabled = true;
    remove(b.dataset.del);
  }, true);
})();
