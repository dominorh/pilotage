<div align="center">

# DOMINO RH · Espace outils

**Un point d’entrée unique pour les outils de pilotage, de recrutement et de développement commercial.**

[ Ouvrir la page de garde ](https://dominorh.github.io/pilotage/)

</div>

---

## Accès rapide

La page de garde est **[`index.html`](./index.html)** : on s'y connecte avec le compte créé par l'administrateur,
puis elle affiche les outils auxquels le rôle donne accès. Ouvrir directement un outil sans être connecté renvoie
vers la page de garde, puis ramène à l'outil après la connexion.

| Outil | Page | Données | Accès |
|---|---|---|---|
| **Planning partagé** | [`planning-base.html`](./planning-base.html) | base de données commune (Supabase) | tous les comptes rattachés à une agence |
| **Marges & ETP** | [`marges.html`](./marges.html) | exports CSV de marges, lus sur le poste | responsables, administrateurs |
| **Actions commerciales** | [`actions.html`](./actions.html) | exports Excel des actions, lus sur le poste | responsables, administrateurs |
| **Planning (Excel)** | [`planning.html`](./planning.html) | planning Excel de l'agence, lu sur le poste | responsables, administrateurs |
| **Gestion des comptes** | [`comptes.html`](./comptes.html) | comptes et rôles (base de données) | administrateurs |
| **Gestion des agences** | [`agences.html`](./agences.html) | agences et bases ETP (base de données) | administrateurs |
| **Page de démarrage** | [`demarrage.html`](./demarrage.html) | horloge, semaine en cours par agence, outils selon le rôle, liens personnels, recherche Brave | tous (connexion facultative) |
| **Générateur de propositions commerciales** | [`proposition_commerciale_domino.html`](./proposition_commerciale_domino.html) | saisie dans la page | tous les comptes |
| **Calculateur pédagogique de marge** | [`calculateur_marge_pedagogique.html`](./calculateur_marge_pedagogique.html) | saisie dans la page | tous les comptes |
| **Comparateur chauffeur PL / TP** | [`comparateur_remuneration_chauffeur_TP.html`](./comparateur_remuneration_chauffeur_TP.html) | saisie dans la page | tous les comptes |

- L'ancien **Reporting des marges** est remplacé par **Marges & ETP** : l'adresse `reporting_marges.html` y redirige.
- L'ancien **Dashboard recrutement** lisait les mêmes exports Tempo que **Actions commerciales**, qui le remplace : l'adresse `dashboard_recrutement_github_version.html` y redirige.
- Le calculateur pédagogique utilise des taux et coefficients modifiables ; il sert à comparer des hypothèses et ne remplace pas un paramétrage paie validé.
- Pour créer un PDF depuis le générateur commercial, utiliser **Imprimer / enregistrer en PDF**, puis choisir l'enregistrement PDF dans la fenêtre d'impression.
- Les outils simples (propositions, calculateur, comparateur) affichent en haut un bandeau commun : retour à l'espace outils et déconnexion.
- Pour changer qui a accès à un outil : attribut `data-acces` de la balise `auth.js` en tête de la page (`membre`, `responsable` ou `admin`) et de sa carte dans `index.html`.

## Connexion et rôles

- On se connecte sur la **page de garde** (`index.html`) (adresse e-mail + mot de passe créés par l'administrateur). La page de garde n'affiche
  ensuite que les outils autorisés.
- Ouvrir directement un outil sans être connecté renvoie vers la page de garde, puis ramène à la page demandée.
- Un compte qui ouvre un outil non autorisé voit « Accès réservé » ; les onglets correspondants sont masqués.
- « Se déconnecter » (en haut des pages) ramène à la page de garde ; une déconnexion dans un onglet ferme l'accès dans les autres.
- **« Changer mon mot de passe »** sur la page de garde, pour tout le monde.
- Un compte **suspendu** par un administrateur n'a plus accès à aucune page.

| Rôle | Planning partagé | Verrouiller une semaine | Planning (Excel), Marges, Actions | Gestion des comptes | Propositions, calculateur, comparateur |
|---|---|---|---|---|---|
| `admin` | lecture + saisie | oui | oui | oui | oui |
| `responsable` | lecture + saisie | oui | oui | non | oui |
| `commercial` | lecture + saisie (semaines ouvertes) | non | non | non | oui |
| `lecture` | lecture seule | non | non | non | oui |

Chaque compte ne voit que les agences auxquelles il est rattaché. Pour le planning partagé, les droits sont appliqués
par la base elle-même (Row Level Security) : masquer un bouton n'est jamais la seule protection. Pour les outils
sur fichiers, le contrôle d'accès protège l'affichage ; leurs données restent de toute façon sur le poste.

Comptes, rôles et installation de la base : voir le **paquet de déploiement** (`LISEZMOI.md`, scripts SQL numérotés),
fourni à part — il n'est pas dans ce dépôt.

## Gestion des comptes (`comptes.html`)

Réservée aux administrateurs, pour les agences qu'ils administrent :

- **Ajouter une personne** (nom, adresse, agence, rôle) : un **mot de passe provisoire** est affiché une seule fois, à lui transmettre ; elle le change depuis la page de garde.
- **Changer un rôle**, **ajouter / retirer une agence**, **nouveau mot de passe**, **suspendre / réactiver**, **supprimer** un compte.
- **Comptes sans agence** (créés dans Supabase sans rattachement) : à rattacher ou supprimer.
- Contrôles faits par la base à chaque action : on n'agit que sur ses agences, pas sur son propre compte, et **une agence garde toujours au moins un administrateur**.
- Création, mot de passe et suppression passent par la fonction serveur Supabase `gerer-comptes` (la clé secrète ne quitte jamais Supabase). Sans elle, la page affiche un avertissement et le reste fonctionne.

## Gestion des agences (`agences.html`)

Réservée aux administrateurs, pour les agences qu'ils administrent :

- **Créer une agence** (code de 2 à 10 lettres ou chiffres, nom) : son créateur en devient administrateur.
- **Modifier** le code, le nom et les bases ETP (heures / semaine pour le planning, heures / mois pour les marges).
- **Comptes de l'agence** : ouvre la gestion des comptes avec cette agence présélectionnée.
- **Supprimer** : directement si l'agence est vide ; sinon la page indique ce qui sera effacé et demande de retaper le code de l'agence. Un administrateur ne peut pas supprimer la dernière agence qu'il administre.

## Planning partagé (`planning-base.html`)

- Semaine (‹ ›), agence (si plusieurs), client, recherche, clients exclus (sans « 1 »).
- **Vue Grille** (par défaut) : une ligne par intérimaire, une case colorée par jour (non saisi, 0 h, moins de 7 h, 7 à 9 h,
  plus de 9 h), une couleur par client, le jour courant encadré, une barre des heures de la semaine sur la base ETP
  (orange au-delà), ⚠ pour les fins de contrat et le total par jour. Un clic sur un nom ouvre le détail de la ligne.
- **Vue Détail** : un bloc par client avec contrat, VM, commentaire et dates ; c'est la vue utilisée pour modifier.
  Le choix de la vue est mémorisé.
- Chiffres de la semaine (heures et ETP des clients suivis, intérimaires, clients, fins de contrat), heures par jour,
  un bloc par client avec les heures du lundi au dimanche, le total et l'ETP (heures / 35).
- **✎ Modifier** (commercial, responsable, administrateur) : heures par jour, métier, contrat, VM, commentaire, dates de
  début et de fin, case « Compté (1) » des clients. Chaque saisie est enregistrée dans la base dès qu'on quitte la case
  (ou Entrée) ; 0 à 24 h par jour.
  On peut aussi **ajouter un client** à la semaine (existant ou nouveau, compté ou non), **ajouter un intérimaire**
  chez un client (existant ou nouveau, avec métier, contrat et dates), **retirer une ligne** ou **retirer un client**.
- **Modifications simultanées** : si un collègue a modifié la même ligne entre-temps, la saisie est refusée avec un
  message et le planning est rechargé (rien n'est écrasé).
- **Mise à jour en direct** des modifications des collègues (« En direct ») ou, à défaut, toutes les 30 s.
- **Verrouiller la semaine** (responsable, administrateur) : plus aucune modification par les commerciaux.
- **+ Préparer la semaine suivante** (depuis la dernière semaine) : copie les clients et les intérimaires encore
  en mission, heures à saisir.
- **Exports** : Excel de la semaine affichée, PDF (impression).
- **Nouvelle agence** : la page propose « Démarrer le planning » (semaine vide ou import Excel).
- **⇪ Importer Excel** (commercial, responsable, administrateur) : lit le planning Excel de l'agence dans le navigateur
  (un onglet par semaine : S42, S43…), affiche un aperçu par semaine avec les anomalies, puis importe les semaines
  choisies. Une semaine déjà présente n'est pas écrasée : seules les lignes manquantes sont ajoutées.

## Planning (Excel) (`planning.html`)

Lit le planning Excel de l'agence (ex. `Planning_agence_DAX.xlsx`) : chaque **onglet de semaine** (`S42`, `S43`…) avec une ligne par client, puis ses intérimaires et leurs heures du lundi au dimanche. Les autres onglets (Besoins, KPI, anciens plannings `s38`…) sont ignorés.

- **Clients retenus** : seuls les clients dont la colonne **« Client » contient 1** ; les autres sont exclus avec leurs intérimaires (case « Afficher les clients exclus » pour les voir grisés).
- **Filtres** : semaine (‹ ›), agence (si plusieurs fichiers), client, métier, recherche.
- **Affichage** : intérimaires regroupés par client — métier, contrat, VM / commentaire, début, fin, heures par jour, total, ETP (heures / 35) ; heures par jour de la semaine ; évolution des heures par client d'une semaine à l'autre.
- **Alertes** : fin de contrat dans la semaine, fin de contrat dépassée.
- **Contrôles** : les totaux sont recalculés à partir des heures saisies jour par jour ; un écart avec la colonne « T He » du fichier est signalé. La semaine est prise dans le nom de l'onglet (un en-tête de dates non mis à jour est signalé).
- **Export PDF** (A4 paysage). Dossier surveillé : la page se met à jour à chaque enregistrement du fichier.
- **Modifier le planning depuis la page** (Edge / Chrome, dossier choisi) : bouton « ✎ Modifier le planning » → heures par jour, dates de début / fin, métier, contrat, VM, commentaire deviennent modifiables ; **chaque changement est écrit aussitôt dans le fichier Excel**.
  - Seule la cellule modifiée est réécrite : mise en forme, couleurs, formules, listes déroulantes et autres onglets restent intacts ; les totaux de la ligne sont mis à jour et Excel recalcule le classeur à l'ouverture.
  - Avant la première modification, une copie du fichier est enregistrée dans le sous-dossier `_sauvegardes`. Bouton « ↶ Annuler la dernière modification ».
  - Si le fichier a changé entre-temps (lignes déplacées par un collègue), rien n'est écrit : la page se recharge. Si le fichier est ouvert dans Excel (verrouillé), un message le signale.
  - Avec un dossier **SharePoint synchronisé par OneDrive**, la modification est synchronisée et apparaît chez les collègues qui surveillent le même dossier. Éviter d'éditer en même temps dans Excel et dans la page (OneDrive créerait une copie en conflit).
  - Ajouter ou supprimer un intérimaire / un client se fait toujours dans Excel.

## Marges & ETP (`marges.html`)

À partir des exports CSV de marges de Tempo (`Marges_AAAAMMJJ….csv`, séparateur `;`, encodage Windows ou UTF-8) :

- **Calculs** : heures facturées, **ETP = heures facturées / base mensuelle** (151,67 h par défaut, modifiable), **CA** = Total facturé, **coût** = Total payé, **marge** et **taux de marge** = marge / CA, marge par heure et par ETP, coefficient moyen (pondéré par les heures), intérimaires, contrats, clients.
- **Visuels** : barres horizontales (coût + marge = CA) avec les chiffres en face, par **dossier** (BNAT27, GBORD10…), **commercial**, **agence**, **client** ou **qualification** ; tri par colonne ; clic pour filtrer.
- **Agences** : une agence = l'addition de plusieurs commerciaux (« + Nouvelle agence », ou « Créer les agences depuis les fichiers » : les exports de plusieurs mois d'une même agence donnent une seule agence, et un nouveau commercial est ajouté à l'agence existante). Les agences sont enregistrées **dans le navigateur, pour le compte connecté** : un autre utilisateur du même poste ne les voit pas ; elles sont à recréer sur un autre poste (un clic). Une agence sans données dans les fichiers chargés s'affiche en carte réduite.
- **Commercial retenu** : commercial du contrat (par défaut) ou commercial du client.
- **Filtres** : mois de paie, agence, commercial, dossier, client, grand compte.
- **Exports** : **PDF** (impression A4 paysage, « Enregistrer au format PDF ») et **PowerPoint** (.pptx, graphiques natifs + tableaux, une fiche par agence).
- Dossier surveillé (Edge / Chrome) ou fichiers ponctuels ; une ligne identique présente dans deux fichiers n'est comptée qu'une fois.

## Actions commerciales (`actions.html`)

Tableau de bord des actions commerciales **par agence et par commercial**, construit à partir des exports Excel de Tempo (tableau croisé : *Type d'action → Agence → Commercial → Candidat/Client → Cible → année*).

1. Ouvrir l'outil avec **Microsoft Edge** ou **Google Chrome**.
2. Cliquer sur **« Choisir le dossier des exports »**, sélectionner le dossier des exports Excel, autoriser l'accès.
3. Dès qu'un export est **ajouté, modifié ou supprimé** dans ce dossier (sous-dossiers compris), les statistiques se mettent à jour toutes seules.

Chaque export correspond à **une semaine**, lue dans le **nom du fichier** :

| Nom du fichier | Semaine |
|---|---|
| `Export PAU S42.xlsx`, `Export 2026-S42.xlsx`, `pau_semaine_42.xlsx`, `Export W42.xlsx` | S42 |
| `Export DAX 2026-10-12.xlsx`, `export_20261012.xlsx`, `Export 12-10-2026.xlsx` | semaine contenant cette date (S42) |

Si le nom ne contient ni semaine ni date, la semaine est déduite de la **date d'enregistrement du fichier** (affichée avec un « ? ») : renommer le fichier pour la fixer. Si deux fichiers de la **même semaine** contiennent la même ligne (export refait), elle n'est comptée qu'une fois.

- Chiffres clés : actions totales, candidats / clients, cibles distinctes, commerciaux actifs
- Fiche par agence (cliquer pour filtrer), évolution par semaine (graphique cliquable)
- Actions par commercial et par type d'action, avec détail par commercial (cibles suivies et actions menées)
- Tableau triable par commercial, matrice commercial × type d'action, cibles les plus travaillées
- **Export PowerPoint (.pptx)** de la vue filtrée (graphiques natifs, modifiables) ; données détaillées avec recherche, tri, pagination et export CSV
- Filtres : agence, commercial, type de cible, type d'action, semaine, année

> Firefox ne permet pas la surveillance d'un dossier : il peut lire les exports, mais il faut cliquer sur « Actualiser » après chaque nouvel export.

## Dossier SharePoint / OneDrive synchronisé

Les trois outils sur fichiers peuvent surveiller un dossier synchronisé par OneDrive (bibliothèque SharePoint « Synchroniser » ou « Ajouter un raccourci à Mon OneDrive ») :

- **Contenu relu toutes les 8 s** (empreinte du fichier) : une mise à jour est détectée même si OneDrive conserve la date et la taille du fichier.
- **Surveillance instantanée** quand le navigateur la propose (Chrome / Edge récents), **relecture immédiate** quand on revient sur l'onglet.
- Sous la ligne d'état : **version la plus récente reçue** et bouton **« ↻ Relire maintenant »**.

Le délai restant est celui d'OneDrive. Pour le réduire : **enregistrement automatique** dans Excel, **« Toujours conserver sur cet appareil »** sur le dossier, icône OneDrive pas en pause.

## Retirer un fichier

Dans **Actions commerciales** et **Marges & ETP**, chaque fichier de la liste a un bouton **×** (deux clics) :

- fichier du dossier surveillé : **déplacé dans le sous-dossier `_corbeille`** (nom suffixé de la date), pas effacé ;
- fichier ajouté ponctuellement : simplement retiré de la page ;
- les sous-dossiers commençant par `_` (`_corbeille`, `_sauvegardes`) sont ignorés par les outils.

## Confidentialité et sécurité

- **Les exports et le planning Excel ne quittent jamais le poste** : ils sont lus par le navigateur. GitHub ne sert que les pages, vides de toute donnée.
- Les pages ne peuvent se connecter **qu'à la base de l'agence** (`Content-Security-Policy: connect-src` limité à l'adresse Supabase) : pour vérifier le compte et, pour le planning partagé, lire et enregistrer le planning. Toute autre connexion est bloquée par le navigateur.
- `supabase-config.js` contient l'adresse de la base et sa clé **publishable** : elle est publique par conception et ne donne accès à rien sans compte rattaché. La clé **secret / service_role** ne doit **jamais** figurer dans ce dépôt.
- Le dépôt **ne doit contenir aucun export ni aucune donnée** : le `.gitignore` bloque les fichiers `.xlsx`, `.xls`, `.xlsm` et `.csv`.
- Données réelles dans la base : uniquement après validation de l'hébergement par l'agence (contrat de sous-traitance RGPD, offre avec sauvegardes).

## Connexion internet requise

Toutes les pages vérifient le compte auprès de la base : elles demandent une connexion internet, y compris les outils
sur fichiers (dont les données restent pourtant sur le poste). Si la base est indisponible (coupure, projet en pause),
la page affiche « Connexion à la base impossible ». Pour revenir à des outils sans compte ni réseau, il suffit de
retirer les trois lignes `<script>` de connexion (`supabase-config.js`, `vendor/supabase.js`, `auth.js`) en tête des pages
et, pour `actions.html`, `marges.html` et `planning.html`, remettre `connect-src 'none'`.

## Structure

```
demarrage.html              page de démarrage pour Brave (ou Edge / Chrome) : semaine en cours, outils, liens personnels
index.html                  page de garde : connexion, outils selon le rôle, aide, liens pour SharePoint
accueil.html                ancienne adresse de l'accueil → redirige vers index.html
reporting_marges.html       ancien reporting des marges → redirige vers marges.html
proposition_commerciale_domino.html         Générateur de propositions commerciales
calculateur_marge_pedagogique.html          Calculateur pédagogique de marge
comparateur_remuneration_chauffeur_TP.html  Comparateur de rémunération chauffeur PL / TP
dashboard_recrutement_github_version.html   ancien dashboard recrutement → redirige vers actions.html
charte.css                  style commun des pages de pilotage (en-tête bleu marine, police, couleurs de la charte)
auth.js                     contrôle d'accès commun (session, rôles, redirection vers la page de garde, bandeau, déconnexion)
supabase-config.js          adresse de la base et clé publishable
planning-base.html          Planning partagé (base de données)
comptes.html                Gestion des comptes (administrateurs)
agences.html                Gestion des agences (administrateurs)
planning.html               Planning (Excel)
marges.html                 Marges & ETP
export-marges-pptx.js       génération de la présentation PowerPoint (marges)
actions.html                Actions commerciales
export-pptx.js              génération de la présentation PowerPoint (actions)
file-delete.js              retrait d'un fichier (vers _corbeille), commun aux outils Actions et Marges
watch.js                    surveillance renforcée des dossiers synchronisés, commune aux outils sur fichiers
vendor/supabase.js          supabase-js 2.117.3 (connexion à la base, licence MIT)
vendor/xlsx.full.min.js     SheetJS Community Edition 0.18.5 (lecture / écriture Excel, licence Apache-2.0)
vendor/pptxgen.bundle.js    PptxGenJS 3.12.0 (création du .pptx, licence MIT)
vendor/jszip.min.js         JSZip 3.10.1 (modification ciblée du .xlsx du planning, licence MIT)
```

Pas de compilation : HTML, CSS et JavaScript directement servis tels quels.

## Charte graphique

Toutes les pages suivent le style de l'espace outils : en-tête bleu marine pleine largeur, police Arial, fond gris-bleu.
Pour les pages de pilotage, ce style est regroupé dans `charte.css` (à modifier à un seul endroit).

Couleurs Domino RH : **bleu `#142469`** (boutons, liens, barres principales, planning), **orange `#ed4018`**
(seconde série : clients dans les actions, marge dans les barres CA = coût + marge) et **gris `#9b9b9b`** (coût,
éléments secondaires). En thème sombre, le bleu est éclairci (`#8494dd` pour le texte, `#4b5fbf` pour les boutons)
pour rester lisible. Les couleurs d'état (vert « en direct », orange foncé « alerte », rouge « marge négative »)
gardent leur sens. Les présentations PowerPoint exportées utilisent les mêmes couleurs.

## Publication (GitHub Pages)

*Settings → Pages → Build and deployment* : **Source = Deploy from a branch**, **Branch = `main` / `(root)`**.
La nouvelle version est en ligne en une ou deux minutes après chaque mise à jour de `main` (Ctrl+F5 pour la recharger).

Les outils de simulation et de développement commercial (propositions, calculateur, comparateur) et la page de garde viennent du dépôt **DOMINOSO** (afkfeclope/DOMINOSO), réunis ici avec les outils de pilotage.

## Propriété et licence

© 2026 Jérôme Desvaux — tous droits réservés. Ce logiciel est **propriétaire** : son utilisation, sa copie, sa
modification ou sa diffusion nécessitent un contrat de licence (voir [`LICENSE`](./LICENSE)). Les bibliothèques
du dossier `vendor/` gardent leurs propres licences (MIT, Apache-2.0).
