/* Contrôle d'accès commun à toutes les pages (connexion Supabase).
 *
 * À charger dans le <head>, après supabase-config.js et vendor/supabase.js :
 *   <script src="auth.js" data-acces="responsable"></script>
 * data-acces :
 *   "membre"       → tout compte rattaché à au moins une agence (planning partagé)
 *   "responsable"  → responsable ou administrateur d'au moins une agence (marges, actions, planning Excel)
 *   "public"       → page d'accueil : pas de redirection, la page gère elle-même la connexion
 * data-chip="non"  → ne pas ajouter « adresse · Se déconnecter » dans la barre d'onglets
 *
 * Sans session : retour à l'accueil (accueil.html?suite=<page>), qui ramène ici après connexion.
 * Les liens d'onglets marqués data-acces="responsable" sont masqués pour les autres rôles.
 * Ce contrôle protège l'affichage ; les données de la base restent protégées côté serveur par les règles RLS.
 */
(function(){
  const me = document.currentScript;
  const acces = (me && me.dataset.acces) || 'membre';
  const chip = !(me && me.dataset.chip === 'non');
  const CFG = window.PILOTAGE_SUPABASE || {};
  const page = (location.pathname.split('/').pop() || 'accueil.html') + location.search + location.hash;
  const MANAGER = ['admin', 'responsable'];

  // masquer la page tant que l'accès n'est pas vérifié (pas d'aperçu furtif)
  if (acces !== 'public'){
    const st = document.createElement('style');
    st.textContent = 'html.auth-wait body{visibility:hidden}';
    document.head.appendChild(st);
    document.documentElement.classList.add('auth-wait');
  }

  const sb = window.supabase.createClient(CFG.url, CFG.key, {auth:{persistSession:true, autoRefreshToken:true, storageKey:'pilotage-auth'}});
  const goLogin = () => location.replace('accueil.html?suite=' + encodeURIComponent(page));

  async function memberships(user){
    const {data, error} = await sb.from('membres_agence').select('role, agence_id, agences(code, nom)').eq('profil_id', user.id);
    if (error) throw error;
    return data || [];
  }

  function esc(s){ return String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

  function decorate(info){
    // onglets réservés aux responsables
    document.querySelectorAll('nav.tabsnav a[data-acces="responsable"]').forEach(a => { a.hidden = !info.isManager; if (!info.isManager) a.style.display = 'none'; });
    if (chip && info.user){
      const nav = document.querySelector('nav.tabsnav');
      if (nav && !nav.querySelector('.authchip')){
        const s = document.createElement('span');
        s.className = 'authchip';
        s.style.cssText = 'margin-left:auto;display:inline-flex;gap:8px;align-items:center;font-size:12.5px;color:var(--text-2,#555)';
        s.innerHTML = `<span>${esc(info.user.email)}</span><a href="#" style="color:inherit">Se déconnecter</a>`;
        s.querySelector('a').onclick = async e => { e.preventDefault(); await sb.auth.signOut(); };   // le retour à l'accueil est fait par onAuthStateChange
        nav.appendChild(s);
      }
    }
  }

  function deny(title, text){
    const run = () => {
      document.body.innerHTML = `<div style="max-width:520px;margin:12vh auto;padding:24px;font:15px/1.5 system-ui,sans-serif;background:var(--surface,#fff);color:var(--text,#111);border:1px solid var(--border,#ddd);border-radius:14px">
        <h1 style="font-size:20px;margin:0 0 8px">${esc(title)}</h1><p style="margin:0 0 16px;color:var(--text-2,#555)">${text}</p>
        <p style="margin:0;display:flex;gap:14px;flex-wrap:wrap"><a href="accueil.html">Retour à l'accueil</a><a href="planning-base.html">Planning partagé</a><a href="#" id="authOut">Se déconnecter</a></p></div>`;
      document.getElementById('authOut').onclick = async e => { e.preventDefault(); await sb.auth.signOut(); };
      document.documentElement.classList.remove('auth-wait');
    };
    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', run) : run();
  }

  const ready = (async () => {
    const {data:{session}} = await sb.auth.getSession();
    const user = session ? session.user : null;
    if (!user){
      if (acces !== 'public') { goLogin(); return new Promise(() => {}); }   // la page ne doit pas continuer
      return {sb, user: null, memberships: [], isManager: false};
    }
    let ms;
    try { ms = await memberships(user); }
    catch(e){
      if (/JWT|token|401|403/i.test(e.message || '') ){ await sb.auth.signOut(); if (acces !== 'public'){ goLogin(); return new Promise(() => {}); } return {sb, user:null, memberships:[], isManager:false}; }
      if (acces !== 'public'){ deny('Connexion à la base impossible', 'Vérifie ta connexion internet puis recharge la page.'); return new Promise(() => {}); }
      return {sb, user, memberships: [], isManager: false, error: e};
    }
    const info = {sb, user, memberships: ms, isManager: ms.some(m => MANAGER.includes(m.role))};
    if (acces === 'responsable' && !info.isManager){ deny('Accès réservé', 'Cet outil est réservé aux responsables et aux administrateurs d\'agence. Ton compte donne accès au planning partagé.'); return new Promise(() => {}); }
    if (acces === 'membre' && !ms.length){ deny('Compte non rattaché', 'Ton compte n\'est rattaché à aucune agence. Demande à l\'administrateur de t\'ajouter.'); return new Promise(() => {}); }
    const show = () => { decorate(info); document.documentElement.classList.remove('auth-wait'); };
    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', show) : show();
    return info;
  })();

  // déconnexion depuis un autre onglet → retour à l'accueil
  sb.auth.onAuthStateChange(ev => { if (ev === 'SIGNED_OUT' && acces !== 'public') location.replace('accueil.html'); });

  window.PilotageAuth = {sb, ready, MANAGER};
})();
