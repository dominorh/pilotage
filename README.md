# Statistiques commerciales

👉 **Page d'accueil : https://dominorh.github.io/pilotage/accueil.html** — présentation des outils, mise en place du dossier SharePoint synchronisé, questions fréquentes, et adresses à mettre en lien depuis SharePoint (composant « Liens rapides »).

Trois outils, dans le navigateur, sans installation :

- **Actions commerciales** (`index.html`) — actions par agence, commercial, semaine (exports Excel)
- **Marges & ETP** (`marges.html`) — CA, marge, ETP par dossier, commercial et agence (exports CSV de marges)
- **Planning** (`planning.html`) — intérimaires par client et par semaine (planning Excel hebdomadaire)

Tableau de bord des actions commerciales **par agence et par commercial**, construit à partir des exports Excel (tableau croisé : *Type d'action → Agence → Commercial → Candidat/Client → Cible → année*).

👉 **Utiliser l'outil : https://dominorh.github.io/pilotage/**

## Comment ça marche

1. Ouvrir le lien ci-dessus avec **Microsoft Edge** ou **Google Chrome**.
2. Cliquer sur **« Choisir le dossier des exports »** et sélectionner le dossier où sont enregistrés les exports Excel, puis autoriser l'accès.
3. C'est tout : dès qu'un export est **ajouté, modifié ou supprimé** dans ce dossier (sous-dossiers compris), les statistiques se mettent à jour toutes seules en ~2 secondes.

### Semaines

Chaque export correspond à **une semaine**. La semaine est lue dans le **nom du fichier** :

| Nom du fichier | Semaine |
|---|---|
| `Export PAU S42.xlsx`, `Export 2026-S42.xlsx`, `pau_semaine_42.xlsx`, `Export W42.xlsx` | S42 |
| `Export DAX 2026-10-12.xlsx`, `export_20261012.xlsx`, `Export 12-10-2026.xlsx` | semaine contenant cette date (S42) |

Si le nom ne contient ni semaine ni date, la semaine est déduite de la **date d'enregistrement du fichier** (affichée avec un « ? » dans la liste des fichiers) : renommer le fichier pour la fixer.

Un filtre **Semaine** et un graphique **Évolution par semaine** (cliquable) permettent de suivre l'activité semaine par semaine. Si deux fichiers de la **même semaine** contiennent la même ligne (export refait), elle n'est comptée qu'une fois.

À la réouverture, le dossier est mémorisé ; selon le navigateur, un clic sur **« Reprendre la surveillance »** peut être demandé.

> Firefox ne permet pas la surveillance d'un dossier : il peut lire les exports, mais il faut cliquer sur « Actualiser » après chaque nouvel export.

## Marges & ETP (`marges.html`)

👉 **https://dominorh.github.io/pilotage/marges.html**

À partir des exports CSV de marges (`Marges_AAAAMMJJ….csv`, séparateur `;`, encodage Windows ou UTF-8) :

- **Calculs** : heures facturées, **ETP = heures facturées / base mensuelle** (151,67 h par défaut, modifiable), **CA** = Total facturé, **coût** = Total payé, **marge** et **taux de marge** = marge / CA, marge par heure et par ETP, coefficient moyen (pondéré par les heures), intérimaires, contrats, clients.
- **Visuels** : barres horizontales (coût + marge = CA) avec les chiffres en face, par **dossier** (BNAT27, GBORD10…), **commercial**, **agence**, **client** ou **qualification** ; tri par colonne ; clic pour filtrer.
- **Agences** : une agence = l'addition de plusieurs commerciaux (« + Nouvelle agence », ou « Créer une agence par fichier »). Les agences sont mémorisées dans le navigateur.
- **Commercial retenu** : commercial du contrat (par défaut) ou commercial du client.
- **Filtres** : mois de paie, agence, commercial, dossier, client, grand compte.
- **Exports** : **PDF** (impression A4 paysage, « Enregistrer au format PDF ») et **PowerPoint** (.pptx, graphiques natifs + tableaux, une fiche par agence).
- Même fonctionnement que l'autre outil : dossier surveillé (Edge / Chrome), fichiers ponctuels, une ligne identique présente dans deux fichiers n'est comptée qu'une fois.

## Planning (`planning.html`)

👉 **https://dominorh.github.io/pilotage/planning.html**

Lit le planning Excel de l'agence (ex. `Planning_agence_DAX.xlsx`) : chaque **onglet de semaine** (`S42`, `S43`…) avec une ligne par client, puis ses intérimaires et leurs heures du lundi au dimanche. Les autres onglets (Besoins, KPI, anciens plannings `s38`…) sont ignorés.

- **Clients retenus** : seuls les clients dont la colonne **« Client » contient 1** ; les autres sont exclus avec leurs intérimaires (liste affichée, case « Afficher les clients exclus » pour les voir grisés).
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

## Dossier SharePoint / OneDrive synchronisé

Les trois outils peuvent surveiller un dossier synchronisé par OneDrive (bibliothèque SharePoint « Synchroniser » ou « Ajouter un raccourci à Mon OneDrive »). La surveillance est renforcée pour ce cas :

- **Contenu relu toutes les 8 s** (empreinte du fichier) : une mise à jour est détectée même si OneDrive conserve la date et la taille du fichier. Les fichiers « disponibles en ligne uniquement » sont ainsi retéléchargés.
- **Surveillance instantanée** quand le navigateur la propose (Chrome / Edge récents) : la page réagit dès qu'OneDrive dépose la nouvelle version.
- **Relecture immédiate** quand on revient sur l'onglet (le navigateur ralentit les onglets en arrière-plan).
- Sous la ligne d'état : **version la plus récente reçue** (fichier, heure d'enregistrement) — pour voir si c'est OneDrive qui n'a pas encore synchronisé — et bouton **« ↻ Relire maintenant »**.

Le délai restant est celui d'OneDrive (téléversement chez le collègue puis téléchargement chez soi, quelques secondes à quelques minutes). Pour le réduire : activer l'**enregistrement automatique** dans Excel, choisir **« Toujours conserver sur cet appareil »** sur le dossier, et vérifier que l'icône OneDrive n'est pas en pause.

## Retirer un fichier

Dans **Actions commerciales** et **Marges & ETP**, chaque fichier de la liste a un bouton **×** : un 1er clic demande confirmation (« Supprimer ? »), un 2e clic retire le fichier.

- Fichier du dossier surveillé : il est **déplacé dans le sous-dossier `_corbeille`** (nom suffixé de la date), pas effacé définitivement — pour le récupérer, le remettre à la main dans le dossier. Le navigateur demande une fois l'autorisation de modifier le dossier.
- Fichier ajouté ponctuellement : il est simplement retiré de la page (l'original n'est pas touché).
- Les sous-dossiers commençant par `_` (`_corbeille`, `_sauvegardes`) sont ignorés par les outils.

## Confidentialité

- **Les exports ne quittent jamais le poste.** Ils sont lus directement par le navigateur ; GitHub ne sert que la page, vide de toute donnée.
- La page interdit au navigateur toute connexion réseau (`Content-Security-Policy: connect-src 'none'`) : même par erreur, aucune donnée ne peut être envoyée.
- Le dépôt **ne doit contenir aucun export** : le `.gitignore` bloque les fichiers `.xlsx`, `.xls`, `.xlsm` et `.csv`.

## Fonctionnalités

- Chiffres clés : actions totales, candidats / clients, cibles distinctes, commerciaux actifs
- Fiche par agence (cliquer pour filtrer)
- Actions par commercial et par type d'action, avec détail par commercial (cibles suivies et actions menées)
- Tableau triable par commercial, matrice commercial × type d'action, cibles les plus travaillées
- **Export en présentation PowerPoint (.pptx)** de la vue filtrée : page de titre, chiffres clés, agences, évolution par semaine, commerciaux, types d'action, puis une fiche par commercial — graphiques PowerPoint natifs, modifiables. Généré dans le navigateur, rien n'est envoyé.
- Données détaillées avec recherche, tri et pagination ; export CSV de la vue filtrée
- Filtres : agence, commercial, type de cible, type d'action, semaine, année
- Évolution par semaine (graphique cliquable)
- Gestion des exports refaits : une même ligne présente dans plusieurs fichiers de la même semaine est comptée une seule fois (fichier le plus récent), ou additionnée au choix
- Thème clair / sombre, affichage mobile

## Utilisation hors ligne

Télécharger le dépôt (**Code → Download ZIP**), le dézipper et ouvrir `index.html` avec Edge ou Chrome. Garder le dossier `vendor/` à côté.

## Structure

```
accueil.html                page d'accueil (lien à mettre sur SharePoint)
index.html                  l'application (HTML + CSS + JS, sans build)
export-pptx.js              génération de la présentation PowerPoint (actions)
marges.html                 l'outil Marges & ETP
file-delete.js              retrait d'un fichier (vers _corbeille), commun aux deux premiers outils
watch.js                    surveillance renforcée des dossiers synchronisés, commune aux trois outils
planning.html               l'outil Planning
export-marges-pptx.js       génération de la présentation PowerPoint (marges)
vendor/xlsx.full.min.js     SheetJS Community Edition 0.18.5 (lecture des fichiers Excel, licence Apache-2.0)
vendor/pptxgen.bundle.js    PptxGenJS 3.12.0 (création du .pptx, licence MIT)
vendor/jszip.min.js         JSZip 3.10.1 (modification ciblée du .xlsx du planning, licence MIT)
```

## Publication (GitHub Pages)

*Settings → Pages → Build and deployment* : **Source = Deploy from a branch**, **Branch = `main` / `(root)`**.
