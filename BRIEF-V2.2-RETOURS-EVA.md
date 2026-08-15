# BRIEF V2.2 — RETOURS CLIENTE (EVA)

Additif au brief de fondation et au brief V2.1.
À appliquer sur le build existant. **Rien à refaire, tout est additif ou substitutif.**

---

## §0 · RÈGLES DU LOT

1. **`js/hero.js` : zéro ligne modifiée.** L'animation du hero est validée par la cliente
   (« tt ces trucs je kiff »). On ne touche ni au canvas, ni au pin, ni au scrub.
   Les **textes** des overlays peuvent changer — c'est du copywriting, pas de l'animation.
2. **La DA reste celle d'aujourd'hui.** Noir, bleu néon, léopard. L'or `--or: #C9A24B`
   **reste inchangé** : la cliente n'a rien demandé dessus.
3. **Les néons bleus sont le point fort du site.** Elle les adore. On en met plus,
   pas moins.
4. Deux lots séparés, deux commits : **le lot photos** (§3) et **le lot textes/chiffres**
   (§2). Si l'un coince, l'autre part quand même.
5. La typographie fait l'objet d'un **lot 3 séparé, en attente** de la référence
   qu'Eva doit envoyer. Ne rien changer à la typo dans ce lot.

---

## §1 · DEUX ERREURS DE CONTENU À CORRIGER EN PRIORITÉ

### 1.1 — Le néon mal transcrit

Le site affiche : `Fuck Alexa,<br>Siri me your play…` (index.html ligne 195).

Le vrai néon du bar dit : **« FUCK NUDES, SEND ME YOUR PLAYLIST »**.
Vérifiable sur trois photos du dossier client (`neon-playlist-foule`,
`neon-playlist-large`, `neon-playlist-nb`).

C'est une mauvaise transcription. La phrase actuelle ne veut littéralement rien dire,
ce qui explique exactement la remarque d'Eva (« comprends pas »). On remet le vrai
texte du néon, à l'identique, en capitales :

```
FUCK NUDES,
SEND ME YOUR PLAYLIST
```

### 1.2 — « MAKE IT COUNT » n'est pas une phrase du Barrel

En vérifiant les photos, on retrouve d'où vient cette phrase : elle est imprimée sur
un **fût publicitaire Jack Daniel's** installé dans le bar, sous le texte
« *Jack Daniel's and Old No. 7 are registered trademarks* ».

C'est donc un **slogan de marque déposée**, repris par erreur comme mot géant du
footer du site. Au-delà du fait qu'Eva n'en veut plus, l'utiliser comme signature
d'un autre établissement est un risque juridique inutile.

**Remplacement retenu, dans le mot géant du footer** (`.foot-count`, index.html
ligne 447 et contact.html ligne 114) :

```
YOU ARE EXACTLY WHERE YOU NEED TO BE
```

C'est un vrai néon du bar, on en a la photo, il est déjà dans le site, et il tombe
juste en fin de parcours. La seconde proposition d'Eva —
**« THIS PLACE IS HOTTER THAN YOUR EX »** — est excellente mais trop drôle pour une
fin ; on la place en accroche du chapitre 04 (la nuit), où elle fonctionne mieux.

---

## §2 · TEXTES, CHIFFRES ET POSITIONNEMENT

### 2.1 — Chiffres à corriger

| Où | Aujourd'hui | Doit devenir |
|---|---|---|
| Compteur `.stat` chapitre 05 | `2` terrasses | **`3`** terrasses |
| Compteur `.stat` chapitre 05 | `150` places extérieur | **`170`** places extérieur |
| Bloc infos (ligne 412) | `2 terrasses · 150 places extérieur · 60 intérieur` | **`3 terrasses · 170 places extérieur · 60 intérieur`** |
| `<meta description>`, `og:description`, JSON-LD | « deux terrasses » | **« trois terrasses »** |
| Carte des jeux (ligne 239) | `Ta Bobine · 3€` | **`Ta Bobine · 4€`** |
| Alt de `photobooth-ta-bobine` | « pour trois euros » | **« pour quatre euros »** |
| Titre chapitre 05 | `DEUX TERRASSES, UNE RUE, LA NUIT.` | **`TROIS TERRASSES, UNE RUE PIÉTONNE, LA NUIT.`** |

**Attention :** la photo `photobooth-equipe` montre le panneau Ta Bobine avec l'ancien
tarif « 3 € » encore lisible. Ne pas l'utiliser en gros plan à côté du prix 4 € —
elle est prévue en petit format dans la mosaïque, où le panneau n'est pas lisible.

### 2.2 — Horaires

Remplacer partout « ouvert tous les jours » par **« ouvert 364 jours par an, de 18h à 5h »**.

Dans le JSON-LD, `openingHoursSpecification` reste sur les sept jours : le balisage
décrit une semaine type, et il n'existe pas de façon propre de dire « sauf un jour
par an ». En revanche, **ne pas écrire « 7j/7 » en clair** dans le texte visible.

*À confirmer avec Eva : quel est le jour de fermeture ?* Si c'est le 25 décembre ou
le 1er janvier, on peut l'écrire noir sur blanc, c'est plus fort que « 364 jours ».

### 2.3 — Le virage restaurant

C'est la demande de fond d'Eva : le Barrel devient **aussi** un restaurant, et elle
veut que les gens viennent **plus tôt, pour manger**.

- **Supprimer** l'accroche `Ce n'est pas un restaurant` (index.html ligne 171).
- **La remplacer** par : `ON MANGE ICI, ET ON RESTE`.
- Remonter le chapitre bouffe dans la hiérarchie de lecture : c'est aujourd'hui
  le chapitre 03 sur 05, il garde sa place, mais il gagne **le double de photos**
  (voir §3) et une accroche d'entrée qui parle de cuisine maison.
- Ajouter, en tête du chapitre bouffe, une ligne courte et factuelle :
  `Burgers maison, pain brioché, viande fraîche. Service dès 18h.`
  *(à faire valider par Eva — ne pas inventer de détail de production)*
- Le mot « pub » reste, mais partout où le site oppose le bar au restaurant,
  on remplace l'opposition par un cumul : **pub, cuisine, terrasses, jeux, sport, nuit**.

### 2.4 — L'argument prix / accessibilité

Eva veut qu'on mette en avant le fait que le Barrel est un des rares établissements à
proposer autant de services, accessible à tout le monde, avec des alcools premium à
des prix imbattables.

Nouveau bloc court, à placer **juste avant le bloc infos du chapitre 05** :

```
UN SEUL ENDROIT.
TOUT DEDANS.

Cuisine, billard, fléchettes, babyfoot, arcade, photobooth,
DJ, karaoké, 10 écrans sport, trois terrasses.
Des marques premium au prix du quartier.
Ouvert 364 jours par an, de 18h à 5h.
```

Pas de chiffre de prix tant qu'Eva ne les a pas donnés. Pas de superlatif invérifiable
type « le seul à Cannes » : on écrit « un des seuls », comme elle l'a formulé.

### 2.5 — Privatisation

Ajouter au bloc infos et à la page contact :
`Privatisation partielle ou intégrale — de 10 à 600 personnes.`
Le formulaire accepte déjà `max="600"`, rien à changer côté code.

### 2.6 — Overlay du hero

Remplacer la ligne `La première, / c'est la meilleure.` — Eva n'en comprend pas le sens —
par : **`Le chien, lui, / t'attendait.`**

Même nombre de lignes, même rythme, aucun impact sur le timing de l'animation.

### 2.7 — Instagram

Le lien `https://www.instagram.com/barrelpubcannes` est faux. Il apparaît **13 fois**,
dont dans le `sameAs` du JSON-LD. **Ne rien publier tant que le bon compte n'est pas
fourni.** Un `sameAs` erroné dans le JSON-LD associe l'établissement à un compte tiers
aux yeux de Google.

---

## §3 · PHOTOS

**59 nouvelles photos** ont été converties au format du site (WebP, ≤ 1600 px, q80,
8,8 Mo au total) et déposées dans `assets/photos/`. La liste exacte avec les
dimensions est dans `assets/photos/NOUVELLES.txt`.

### 3.1 — À retirer

| Fichier | Raison |
|---|---|
| `billard-joueur.webp` | Fille devant le **billard vert**. Contredit la DA léopard. Eva la refuse explicitement. |
| `moto-rose-01.webp`, `moto-comptoir.webp` | Trop de moto. On descend à deux photos. |
| `moto-portrait.webp` dans la grille Instagram | Idem — la moto ne doit pas être le visage du site. |

### 3.2 — La moto : deux photos, pas plus

Eva : « on n'est pas un shop de moto ». On garde exactement deux occurrences,
et elles ne sont **ni la première image du site, ni dans la grille Instagram** :

- `moto-frites.webp` — la fille sur la moto rose en train de manger des frites.
  C'est la meilleure des six : elle raccroche la moto à la bouffe, qui est le
  nouveau sujet du site. À placer **dans le chapitre bouffe**, pas ailleurs.
- `moto-portrait-02.webp` — portrait posé, bouteille à la main, au bar.
  À placer dans le chapitre nuit, en petit format.

Aucune photo de casque en position d'ouverture de chapitre.

### 3.3 — Chapitre 02 · Le seuil

- `chiens-duo.webp` reste l'image maîtresse (déjà en place).
- Ajouter `chien-billard-debout.webp` en second temps : le staffie debout sur le
  tapis léopard, sous la lumière bleue. C'est la plus belle photo de chien du lot.
- `terrasse-couverte-logo.webp` : la bâche de terrasse avec **la tête de chien du
  logo** imprimée dessus. À utiliser au moment où le logo devient interactif —
  l'image montre que la mascotte existe pour de vrai dans la rue.

### 3.4 — Chapitre 03 · La carte (le gros du lot)

Le chapitre passe de 12 à 20 images. Mosaïque, formats mélangés :

**Burgers et sandwiches** — `burgers-trio-leopard`, `burger-stack-leopard`,
`burger-oeuf-bacon`, `burger-oeuf-plateau`, `burgers-duo-leopard`,
`burgers-plateau-leopard`, `burger-pulled-plateau`, `burger-chicken-fondant`,
`sandwich-pulled-vert`, `sandwiches-plateau-vert`, `burger-bun-noir`.

**À côté** — `frites-curly-cornet`, `chips-maison`, `tenders-assiette`.

**Cocktails** — `cocktail-passion-mains` et `cocktail-passion-table` en paire
(même verre, deux cadrages : parfait pour un hover qui bascule de l'un à l'autre),
`cocktail-violet-paille`, `cocktail-orange-assise`.

**Le lien moto/bouffe** — `moto-frites`.

Le tapis léopard revient dans presque tous ces plans : c'est ce qui donne au chapitre
son unité visuelle. Ne pas désaturer, ne pas recadrer pour l'éliminer.

> **En attente d'Eva :** les **cocktails citernes**. Elle demande de les mettre en
> avant, mais aucune photo du dossier ne montre un contenant de type citerne.
> `cocktail-violet-paille` est le plus gros verre du lot, sans plus. Il faut soit une
> photo, soit renoncer à l'argument. **Ne pas illustrer avec un verre normal.**

### 3.5 — Chapitre 04 · La nuit

Accroche : **`THIS PLACE IS HOTTER THAN YOUR EX`** (§1.2).

Carrousel : `foule-large-bleue`, `foule-bleue-02`, `foule-bras-leves`,
`foule-bleue-03`, `groupe-tonneau`, `trio-filles-tonneau`, `trio-filles-rouge`,
`couple-danse`, `dj-platines`, et fin sur `foule-nb-02` en noir et blanc.

**Le mur des néons** — c'est le moment que la cliente préfère, on l'étoffe :
`neon-exactly-where-02` (le néon seul, net, sur fond de bibliothèque),
`neon-playlist-foule` et `neon-playlist-large` (le néon au-dessus de la foule),
et `neon-playlist-nb` en noir et blanc pour fermer la séquence.

Le glow bleu du §3.8 du brief V2.1 s'applique ici, et **seulement ici** : deux néons
allumés au maximum à l'écran en même temps.

Staff, en fin de chapitre : `barman-flair-02`, `barman-shot`, `cave-futs`,
`cave-futs-02`.

### 3.6 — Chapitre 05 · Les terrasses

C'est le chapitre qui change le plus, puisqu'on passe de deux à trois terrasses et
qu'on ajoute la rue piétonne.

Séquence jour → nuit, dans cet ordre : `terrasse-rue-pietonne` (la rue vide, les
tonneaux alignés, plein jour — c'est l'image qui prouve le mot « piétonne »),
`terrasse-jour-ciel`, `terrasse-jour-alignee`, `terrasse-jour-store`,
`terrasse-jour-barrieres`, `terrasse-jour-tonneaux`, `terrasse-veranda`,
`terrasse-crepuscule`, `terrasse-nuit-chaude`, `terrasse-nuit-enseigne`
(l'enseigne « Barrel Pub » en néon script, la plus belle de nuit),
`terrasse-nuit-couloir`, `terrasse-nuit-facade`.

### 3.7 — Jeux

`photobooth-cabine` (la cabine dans la salle bleue) et `flechettes-02` remplacent
avantageusement les deux plans actuels. `photobooth-equipe` en petit format
uniquement (cf. §2.1, le prix affiché est périmé).

### 3.8 — Grille Instagram

Reconstituer avec : `burgers-trio-leopard`, `neon-playlist-foule`, `chiens-duo`,
`terrasse-nuit-enseigne`, `cocktail-passion-mains`, `foule-bleue-02`.
Aucune moto, aucun billard vert.

### 3.9 — Règle transversale

Le mood est **vintage américain, flash direct, nuit** — c'est ce qu'Eva demande et
c'est ce que les photos sont déjà. Ne pas ajouter de filtre, ne pas uniformiser les
températures de couleur : le contraste entre les terrasses en lumière du jour et
l'intérieur au flash bleu est exactement ce qui fait la respiration du site.

Chaque `<img>` ajoutée porte ses `width`/`height` réels (voir `NOUVELLES.txt` et
`NOUVELLES-2.txt`), `loading="lazy"` et `decoding="async"`. Sans ça, le CLS décroche
et tout le travail de perf du lot précédent est perdu.

---

## §3bis · LE DERNIER ENVOI — 33 PHOTOS DE PLUS

Second dossier reçu après le premier. 38 fichiers, 38 uniques, **33 retenues**,
converties au même format (3,1 Mo), listées dans `assets/photos/NOUVELLES-2.txt`.
Ce lot n'est pas un complément décoratif : il contient trois choses qui changent
la structure du site.

### 3bis.1 — LES BANDES DE PHOTOBOOTH · le meilleur objet du dossier

Trois bandes « Ta Bobine » complètes : quatre vignettes verticales, une fille qui
mange un burger en quatre temps, et le bandeau imprimé **BARREL PUB CANNES** avec la
date et l'heure (`08-03-2026 · 22:07`).

`photobooth-bande-01`, `photobooth-bande-02`, `photobooth-bande-03`.

C'est l'objet le plus fort de tout le matériel client, pour trois raisons : c'est un
format natif du lieu (personne d'autre ne l'a), il raconte **le photobooth et la
bouffe dans la même image**, et il est déjà marqué au nom de l'établissement.

**Traitement demandé — nouveau module signature, chapitre 03 :**

Une bande de photobooth qui se **compose vignette par vignette** à l'entrée dans le
viewport : les quatre cases apparaissent l'une après l'autre, décalées de 120 ms,
avec un flash blanc très court (opacité 0 → 0,9 → 0 en 90 ms) avant chaque case.
Le bandeau `BARREL PUB CANNES` arrive en dernier.

Contraintes : IntersectionObserver, pas de ScrollTrigger. Une seule bande animée à la
fois. Le flash est **désactivé** sous `prefers-reduced-motion` — un flash blanc
répété est un déclencheur photosensible, ce n'est pas négociable. En mode réduit,
les quatre cases apparaissent ensemble en fondu de 200 ms.

Les deux autres bandes restent statiques, en petit format, dans la mosaïque des jeux.

### 3bis.2 — UN TROISIÈME NÉON

`neon-tequila` : **« I DIDN'T TEXT YOU, TEQUILA DID »**, bleu, sous les moulures,
au-dessus des appliques et du papier peint baroque.

Le mur des néons du chapitre 04 passe donc à **trois phrases réelles**, ce qui en
fait une vraie séquence et plus une illustration :

1. `YOU ARE EXACTLY WHERE YOU NEED TO BE` — l'accueil
2. `I DIDN'T TEXT YOU, TEQUILA DID` — le milieu de soirée
3. `FUCK NUDES, SEND ME YOUR PLAYLIST` — la fin

Les trois se lisent dans cet ordre, en scroll, chacune sur son propre écran. C'est le
moment que la cliente préfère dans le site, et on a désormais de quoi le tenir sur
trois temps au lieu d'un.

Photos disponibles pour ce mur : `neon-exactly-biblio` (le néon seul, net, devant la
bibliothèque — la plus propre), `neon-exactly-triptyque` (le même néon répété trois
fois par les reflets d'étagère, très graphique, à réserver au fond du bloc),
`neon-tequila`, `neon-playlist-foule-02` et `neon-playlist-portrait`.

### 3bis.3 — LE CHEVRON ROUGE ET JAUNE · une seconde texture

Plusieurs plans montrent le **tapis de comptoir à chevrons rouge et jaune** du bar :
`cocktails-bleus-trinque`, `cocktail-bleu-comptoir`, `longdrinks-trio`, `staff-glacons`.

Le site n'a qu'une texture aujourd'hui, le léopard. Le chevron en est le contrepoint
exact : léopard = les jeux et la bouffe, chevron = le comptoir et les cocktails.
Utiliser le chevron **uniquement** dans le bloc cocktails, jamais mélangé au léopard
dans la même mosaïque. Deux textures qui alternent par chapitre, ce n'est pas la même
chose que deux textures qui se disputent le même écran.

### 3bis.4 — LES COCKTAILS

`cocktail-bleu-tonneau` est la plus belle photo de boisson des deux dossiers : la
fille penchée sur le tonneau, deux pailles, cocktail bleu, sous l'enseigne
« POWER & SON IRISH WHISKEY EST. 1794 ». Elle ouvre le bloc cocktails.

Puis `cocktails-bleus-trinque` (les deux verres bleus qui trinquent au-dessus du
chevron), `cocktail-bleu-comptoir`, `longdrinks-trio`, `cocktail-passion-mains-02`.

> **Toujours pas de cocktail citerne dans ce dossier.** Cinq nouvelles photos de
> boissons, aucune citerne. La demande d'Eva reste sans image. Il faut la photo, ou
> on retire l'argument.

### 3bis.5 — LES COULISSES · ce qui manquait au site

Le site n'avait presque personne qui travaille. Ce lot le corrige :
`staff-glacons` (le bac à glace porté à bout de bras au-dessus du comptoir),
`barman-flair-03` (deux bouteilles versées en même temps),
`patron-enseigne` (le patron bras croisés sous l'enseigne),
`dj-bandeau` et `dj-bandeau-nb` (le DJ au bandeau lumineux, la version noir et blanc
est la meilleure image de nuit des deux dossiers).

À placer en fin de chapitre 04, en séquence courte : le bar ne tourne pas tout seul,
il y a des gens dedans. C'est aussi ce qui rend crédible le virage restaurant.

`tatoueur-soiree` montre un **tatoueur en train de travailler dans le bar**.
C'est manifestement une soirée événementielle. À garder de côté pour le bloc
« CE SOIR » — mais **ne pas l'utiliser tant qu'Eva n'a pas confirmé** qu'il s'agit
d'un rendez-vous récurrent et non d'un one-shot.

### 3bis.6 — SALLES VIDES · le seuil

`salle-bleue-vide`, `salle-violette-vide`, `salle-lanterne` (la lanterne allumée
devant le papier peint baroque rouge).

Ces trois plans sans personne sont exactement ce qu'il faut au chapitre 02, juste
avant l'arrivée de la foule : le lieu qui attend. Le site n'avait que des plans
peuplés, il manquait ce silence.

### 3bis.7 — Le reste

Terrasses, en renfort de §3.6 : `terrasse-jour-ciel-02`, `terrasse-jour-stores`,
`terrasse-jour-rue`, `terrasse-jour-store-bleu`, `terrasse-nuit-tonneaux`.
`terrasse-logo-chien` — la bâche avec la tête de chien du logo — reste réservée au
moment où le logo devient interactif (§3.3).

Foule : `foule-bar-bleue`, `foule-rouge`, `groupe-filles-tonneau-02`,
`fille-lunettes-ecrans` (lunettes de soleil de nuit devant les écrans sport, très
juste pour le bloc sport).

`flou-leopard` — un filé de mouvement sur un imprimé léopard — est une image
abstraite. À utiliser en transition plein écran entre le chapitre 03 et le chapitre
04, là où le site passe du repas à la nuit. Une seule fois.

### 3bis.8 — Écarté

`D11` (jambe plâtrée), `D14` (encore le fût Jack Daniel's « MAKE IT COUNT », cf.
§1.2), et les doublons stricts. Les captures d'écran ont été recadrées pour retirer
la barre de statut du téléphone — vérifier qu'aucune n'a été réintroduite depuis
l'original.

---

## §4 · EN ATTENTE

| Sujet | Bloquant pour |
|---|---|
| Référence typographique d'Eva | Lot 3 — ne rien changer avant |
| Le bon lien Instagram | Mise en ligne (13 occurrences + JSON-LD) |
| Photo d'un cocktail citerne | L'argument « cocktails citernes » — toujours aucune image dans les deux dossiers |
| Le tatoueur : soirée récurrente ou one-shot ? | Usage de `tatoueur-soiree` |
| Jour de fermeture (364 j) | Formulation exacte des horaires |
| Programme de la semaine | Bloc « CE SOIR » |
| Vrais avis Google | Bloc « ILS Y ÉTAIENT » |
| Quelle photo au casque de moto elle voyait à l'ouverture | Vérification finale |

---

## §5 · ORDRE D'EXÉCUTION

1. Corriger le néon (§1.1) et le mot géant du footer (§1.2). Deux lignes, gros effet.
2. Chiffres et horaires (§2.1, §2.2).
3. Virage restaurant (§2.3) + bloc services/prix (§2.4) + privatisation (§2.5).
4. Overlay du hero (§2.6) — texte uniquement.
5. Retraits photo (§3.1) et réduction moto (§3.2).
6. Chapitre 03, le gros lot bouffe (§3.4).
7. Chapitre 04, néons et nuit (§3.5).
8. Chapitre 05, terrasses (§3.6).
9. Jeux et grille Instagram (§3.7, §3.8).
10. Le mur des trois néons (§3bis.2) — c'est le moment préféré de la cliente.
11. Le module bande de photobooth (§3bis.1) — le seul vrai développement de ce lot.
12. Coulisses et salles vides (§3bis.5, §3bis.6).

Repasser la checklist de non-régression du brief V2.1 après chaque commit.
`hero.js` doit rester strictement inchangé du premier au dernier.
