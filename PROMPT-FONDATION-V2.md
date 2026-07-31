# BRIEF FONDATION — BARREL PUB CANNES V2
### Document unique et complet. À coller intégralement dans Claude Code. Rien à chercher ailleurs.

---

## 0. AVANT TOUT — RÈGLES DE SURVIE

1. **NE TOUCHE JAMAIS au dossier `~/Downloads/barrel-pub-site`.** C'est la v1, elle est livrée, elle est morte. On ne la modifie pas.
2. Le site v2 se construit dans son propre dossier : `~/Downloads/barrel-pub-v2/`.
3. **Vanilla only.** HTML + CSS + JS. Pas de React, pas de Vue, pas de Next, pas de Tailwind, pas de build step, pas de node_modules dans le livrable. Le site s'ouvre avec un simple serveur statique.
4. **Aucun `localStorage` / `sessionStorage`.** Jamais.
5. **Toutes les libs sont vendorisées en local** dans `/vendor/`. Pas de CDN. (Historique : cdnjs a été bloqué par une extension navigateur chez un client, on a perdu une journée.)
6. Langue du site : **`<html lang="fr">`**.
7. Tu écris le code toi-même, pas de placeholder « TODO à remplir ». Chaque section livrée est finie.

---

## 1. LE PROJET EN UNE PHRASE

**Barrel Pub Cannes** — pub américain, 17 rue du Docteur Gérard Monod, 06400 Cannes. Ouvert **tous les jours de 18h à 5h**. Deux terrasses, 150 places dehors, 60 dedans, 600+ de capacité (1000+ avec la rue). Burgers, bières, billard, fléchettes, DJ, karaoké, 10 écrans sport, photobooth, tatoueur résident.

On construit un site **niveau Awwwards**. Pas un site de restaurant. Une **expérience de descente** : on part de la mer, on descend la Croisette, on entre dans le bar, et **le chien nous fait entrer**.

---

## 2. L'IDÉE UNIQUE (loi n°1)

> ## « LE CHIEN TE FAIT ENTRER »

Le site est un **seuil**. Dehors : la lumière, la mer, Cannes, le tourisme, la carte postale. Dedans : le noir, le néon bleu, le bois, le bruit, le vrai.
Le chien du patron — il est sur toutes les photos, il est allongé sur le billard, il est la mascotte réelle du lieu — est **le passeur**. Il apparaît au moment du basculement, et à partir de là on est dedans.

Cette idée doit se lire du hero jusqu'au footer. Chaque section répond à une question : « est-ce qu'on est encore dehors, ou est-ce qu'on est déjà dedans ? »

**Conséquence formelle :** le site s'assombrit en descendant. Le début a encore un peu de ciel. À partir de l'entrée, c'est du `#0A0B0E` et du néon. **On ne revient jamais en arrière vers le clair.**

---

## 3. DIRECTION ARTISTIQUE — LE POINT LE PLUS IMPORTANT

### 3.1 Le retour cliente, mot pour mot

Elle GARDE : l'ouverture sur la mer / la Croisette, l'entrée dans le bar, les citations en overlay, le chien.
Elle CHANGE : elle veut des **photos récentes du bar** (fournies, voir §7), et surtout —

> **ELLE N'EST PAS FAN DU BEIGE / CRÈME. LE SITE DOIT ÊTRE SOMBRE.**

C'est la contrainte n°1 de cette v2. **Le crème et le beige de la v1 sont totalement supprimés.** Pas de `#F5F0E8`, pas de `#EDE4D3`, pas de fond clair, pas de section « respiration blanche ». Si tu hésites sur une couleur, la réponse est plus sombre.

### 3.2 Palette (issue des vraies photos du lieu)

```css
:root{
  --noir:        #0A0B0E;  /* fond global, partout */
  --noir-2:      #121419;  /* fond de carte / élévation légère */
  --bleu:        #2B5CFF;  /* néon signature — le bleu du bar */
  --bleu-clair:  #00A3FF;  /* fin du dégradé néon */
  --vert:        #1B3A2F;  /* vert bouteille — la façade du pub */
  --or:          #C9A24B;  /* laiton / logo / accents précieux */
  --chene:       #8A5A32;  /* bois, tonneaux, comptoir */
  --blanc:       #EDE8E0;  /* texte — cassé, jamais #FFF pur */
  --gris:        #7A7F88;  /* texte secondaire */
  --ease: cubic-bezier(0.625, 0.05, 0, 1);
}
```

**Le bleu néon est LA signature.** C'est ce qui rend le lieu identifiable en une image : le bar baigne dans un bleu électrique. Dégradé `linear-gradient(120deg, #2B5CFF, #00A3FF)` sur les éléments qui « éclairent » : soulignements, bordure active, glow des néons, curseur, barre de progression.

Le vert bouteille est **structurel** (façade, blocs institutionnels : infos pratiques, horaires). L'or est **rare** (logo, chiffres de prix, détails). Le chêne est une **texture**, pas un aplat.

### 3.3 Le motif léopard

En dépouillant les 78 photos du lieu, un motif revient partout : **le léopard**. Le feutre du billard est léopard, les plateaux de service sont léopard, il y a du léopard en fond de salle. **Ce n'est pas une invention, c'est la vraie texture de la maison.**

→ Il **remplace le damier bleu/crème de la v1**. Un SVG léopard en `opacity: 0.04–0.07` en fond de section, jamais en aplat plein, jamais criard. C'est un grain, un clin d'œil pour ceux qui connaissent. Une seule section peut monter à `opacity: 0.12` — celle du jeu / billard.

### 3.4 Typographie

Toutes Google Fonts, **auto-hébergées en woff2** dans `/assets/fonts/` avec `font-display: swap`. Aucun appel à fonts.googleapis.com.

| Rôle | Police | Usage |
|---|---|---|
| Display | **Archivo Black** | Titres géants tout en capitales. Le mur typographique. `font-size: min(12vw, 160px)`, `letter-spacing: -0.03em`, `line-height: 0.85` |
| Texte / UI | **Instrument Sans** 400/500/700 | Corps, boutons, nav |
| Data | **IBM Plex Mono** 500 | **TOUTE donnée** : horaires, prix, GPS, numéros de chapitre, téléphone, capacités. Systématique, sans exception. C'est un tic de style qui fait pro. |
| Éditorial | **Fraunces** italic | Rarissime. Les citations du hero, et rien d'autre. |

Tout en `clamp()` fluide. Aucune media query pour la typo.

### 3.5 Texture & finition

- **Grain** : overlay bruit en `position:fixed`, `pointer-events:none`, `mix-blend-mode:overlay`, `opacity:0.05`, généré en SVG `feTurbulence` inline (pas de PNG à charger). Il unifie photos et aplats, c'est ce qui fait « film » plutôt que « site ».
- **Curseur custom** : disque 8px + anneau 32px qui suit en retard (lerp ~0.25). L'anneau passe à 64px et vire au néon au survol des liens. Désactivé sous 1024px et si `pointer: coarse`. **La boucle rAF doit avoir une condition de sortie** (compteur d'inactivité + `document.hidden`).
- **Vignettage** : `radial-gradient` sombre sur les bords du hero, subtil.
- **Aucune ombre portée molle.** Si un élément doit se détacher, c'est par un `border: 1px solid rgba(237,232,224,.12)` ou par un glow néon, jamais par un `box-shadow` gris flou.

---

## 4. LE HERO — L'ANIMATION EXISTE, ON N'Y TOUCHE PAS

> ## ⚠️ NE MODIFIE AUCUNE LIGNE DE CODE DU HERO.
> Le canvas, le scrub, le préchargeur, le failsafe, les fenêtres de progression des overlays, les timings, le line-reveal : **tout est déjà en place et validé. On n'y touche pas.**
> Ce chapitre ne concerne **que le contenu textuel** des overlays. Tu remplaces des chaînes de caractères entre les balises, rien d'autre.

### 4.1 Rappel de principe (pour contexte, pas pour réécriture)

Une descente filmée (mer → Croisette → façade → entrée → intérieur) en 227 frames WebP redessinées sur un `<canvas>` au scroll. Deux jeux de frames, `/frames/desktop/` et `/frames/mobile/`. C'est **le seul moment techniquement lourd du site** (loi n°3 : une seule pièce de bravoure) — tout le reste est sobre. C'est fait, c'est bon, on avance.

### 4.2 Les textes des overlays — à reprendre du site précédent

Les textes de la v1 sont meilleurs que ceux en place : ils installent Cannes, l'heure, le Carré d'Or, et ils finissent sur une phrase de comptoir. On les remet.

Tu gardes les overlays existants — leurs `id`, leurs bornes `data-in` / `data-out`, leur structure `.ov-line > span`. **Tu ne changes que ce qu'il y a entre les balises :**

| overlay | texte |
|---|---|
| intro | **BARREL / PUB** *(display)* — sous-titre mono : `Cannes — Carré d'Or` |
| 2 | « La nuit tombe sur Cannes. » |
| 3 | « Quelque part / dans le Carré d'Or… » |
| 4 | « …il y a une porte qui ne / ferme presque jamais. » — sous-ligne mono : `Ouvert 18h–5h, 7j/7` |
| 5 | « Bienvenue au Barrel. » |
| 6 | « La première, / c'est la meilleure. » |
| final | **BARREL / PUB** — `Le pub du Carré d'Or` *(Fraunces italic)* — CTA : `Descendre au bar ↓` |

Indication de scroll en bas du hero : `Scroller pour descendre` (mono).

**Le `/` marque une coupure de ligne.** Chaque ligne est son propre `.ov-line > span`, pour que le line-reveal tombe ligne par ligne exactement comme aujourd'hui.

Les citations sont en **Fraunces italic**, blanc cassé, avec un `text-shadow: 0 2px 60px rgba(0,0,0,.55)` pour rester lisibles sur n'importe quelle frame.

Le chien reste dans le récit : il arrive au **chapitre suivant**, dans le mur typographique « LE CHIEN / TE FAIT / ENTRER ». Le hero ne le nomme pas, il l'annonce.

### 4.3 La seule règle technique à retenir pour la suite

**Un hero pinné + Lenis casse tous les ScrollTrigger situés en dessous.** C'est un fait vécu, pas une hypothèse.

→ **Tout ce qui est sous le hero est animé à l'IntersectionObserver, jamais à ScrollTrigger.** Une fonction générique `reveal()` sur `[data-reveal]` / `.reveal`, `threshold: 0.05`, `rootMargin: '0px 0px -8% 0px'`, `unobserve` après déclenchement, qui ajoute une classe `.is-in` — le CSS fait le reste (`opacity` + `translateY`).

ScrollTrigger n'existe que pour le hero. Les seules exceptions tolérées ailleurs sont des boucles `requestAnimationFrame` **avec condition de sortie** — jamais une rAF infinie.

---

## 5. STRUCTURE — 5 CHAPITRES, 11 MOUVEMENTS

La loi Awwwards dit « 5 scènes maximum ». On la respecte au niveau du **récit** : cinq chapitres, l'idée unique ne se dilue pas. Mais le lieu a beaucoup à montrer — alors chaque chapitre contient plusieurs **mouvements** : des blocs distincts, non numérotés, qui ne relancent pas une grande respiration typographique.

Numérotation en IBM Plex Mono en haut à gauche de chaque **chapitre** : `01 / 05`, `02 / 05`… Les mouvements ne sont pas numérotés.

Une seule page `index.html`, plus `contact.html`.

---

### **CHAPITRE 01 — LA DESCENTE**

**Mouvement 1 · Le hero.** Inchangé (§4). Logo SVG en or en haut à gauche, indication de scroll discrète en bas.

---

### **CHAPITRE 02 — LE SEUIL**

**Mouvement 2 · Le chien.** Fond `--noir` plein. **Le mur typographique** : « LE CHIEN / TE FAIT / ENTRER » en Archivo Black géant, chaque ligne révélée en décalé (stagger 80 ms, déclenché à l'IntersectionObserver).
`chien-billard-01.webp` — le chien allongé sur le feutre léopard du billard — en plein format. C'est l'image la plus forte du lot, elle mérite le traitement.
Deux phrases max en dessous sur ce qu'est le lieu. Pas de blabla marketing. Léopard en fond `opacity: 0.05`.

**Mouvement 3 · L'horloge live.** Un bloc court en mono qui lit **l'heure réelle du visiteur** :
- `23:47 — LE BARREL EST OUVERT.` (entre 18h et 5h), avec un point néon bleu qui pulse
- `14:12 — ON OUVRE DANS 3H48.` (le reste du temps), avec un point éteint

Rafraîchi toutes les 30 s. Dix lignes de JS, c'est vrai, c'est vivant, et ça dit tout du lieu : un pub ouvert quand les autres ferment.
**Le bloc est écrit en dur dans le HTML avec `OUVERT TOUS LES JOURS — 18H → 05H` par défaut** ; le JS ne fait que remplacer. Si le JS meurt, l'information reste juste.

---

### **CHAPITRE 03 — LE JEU & LA NUIT**

Le cœur battant. C'est ici qu'on prouve que ce n'est pas un restaurant.

**Mouvement 4 · Le jeu.** Billard vintage, fléchettes, babyfoot, arcade, photobooth **« TA BOBINE »** (4 flashs, 3€), **tatoueur résident sur demande**, 10 écrans sport.
Photos : `salle-billard-bleue`, `billard-joueur`, `flechettes`, `photobooth-ta-bobine`, `ecrans-sport`, `foule-billard`.
Mosaïque asymétrique, tailles inégales, révélation en stagger. Léopard `opacity: 0.12` autorisé ici et ici seulement.

**Mouvement 5 · Le mur des néons.** Les enseignes du lieu sont **du copywriting déjà écrit sur les murs** — on le reprend en typo géante avec un vrai glow CSS multi-couches (`text-shadow` en `--bleu`, pas une image) :
- **« YOU ARE EXACTLY WHERE YOU NEED TO BE »** (photo `neon-exactly-where.webp`) — c'est la phrase de la maison, elle mérite le plus gros traitement typographique du site après le hero.
- **« FUCK ALEXA, SIRI ME YOUR PLAY… »** (`neon-alexa-foule.webp`) — contre le bloc DJ / karaoké.
- **« MAKE IT COUNT »**, sur les tonneaux (`barrique-make-it-count.webp`) — gardé pour le footer.

**Mouvement 6 · La nuit.** DJ booth, karaoké, la foule. Photos : `dj-booth`, `foule-01`, `foule-nb`, `foule-bleue`, `foule-tonneau`, `barman-flair`, `staff-futs`.
**La moto rose** (`moto-rose-01/02/03/04`, `moto-comptoir`, `moto-portrait`) va ici : elle est **à l'intérieur du bar**, c'est un décor permanent, pas un événement. C'est le signe visuel que la maison ne se prend pas au sérieux.

---

### **CHAPITRE 04 — LA CARTE**

Prix en IBM Plex Mono, en `--or`. Structure éditoriale, pas un tableau de resto. Une ligne par plat, avec une **couleur d'accent** en variable inline (`style="--accent:var(--bleu)"`) qui s'allume au survol **et au focus clavier** (`tabindex="0"`).

**Mouvement 7 · Les burgers.**

**PORN BURGERS** — *servis avec Frites mégas sexy*

| | |
|---|---|
| Better than your ex | **16€** |
| Orgasmeat | **18€** |
| Maya l'abeille | **16€** |
| Chicken | **16€** |
| Black Barrel | **15€** *(+2,5€ steak)* |

**Mouvement 8 · Tapas, planches, buckets.**

**TAPAS** — Hot-Doggy **9€** · Big oignons rings **8€** · Mozza sticks **8€** · Crispy potatoes cheddar **8€** · Chicken Dynamite **8€** · Mac & Cheese Balls **8€**
**PLANCHES** — Planche mixte pour 2 **24€** · Big Planche signature **40€**
**CHICKEN BUCKETS** — Pour 2 **17€** · Pour 4 **30€**

Photos : `burger-01`→`06`, `burger-plateau`, `burger-pulled`, `burger-chicken`, `burger-black-barrel`, `frites-curly-01/02`, `chicken-strips`, `cocktail-01`→`04`.
Fond `--noir`. Les visuels food sont saturés et chauds : ils suffisent, n'ajoute pas de couleur autour.

---

### **CHAPITRE 05 — LE LIEU**

**Mouvement 9 · Les chiffres.** Count-up au scroll, déclenché à l'IntersectionObserver, **boucle rAF bornée** (200 frames max, stop si `document.hidden`), easing `1 - (1-k)⁴`. Chiffres en Archivo Black géant, légendes en mono :

```
2 terrasses · 150 places extérieur · 60 intérieur
600+ de capacité · 10 écrans sport · 11h d'ouverture par nuit
```

**Mouvement 10 · La terrasse, de nuit.** On ressort — mais **on ne revient jamais au clair**. Photos : `terrasse-nuit-01/02`, `terrasse-heure-bleue`, `terrasse-couloir-01/02`, `terrasse-tonneaux`, `facade-nuit`, `facade-crepuscule`, `facade-soir`. Les versions plein jour (`terrasse-jour-*`, `facade-jour`) ne servent **que** pour l'image OG, jamais dans une section.

**Mouvement 11 · Le feed & les infos.**
Feed Instagram : **embed officiel `instagram.com/embed.js`, chargé en lazy à l'IntersectionObserver** (`rootMargin: '600px 0px'`), une seule fois. **On ne scrape jamais Instagram.** Si l'embed ne charge pas, un lien texte vers `@barrelpubcannes` reste visible en fallback.

Bloc infos pratiques sur fond `--vert`, tout en IBM Plex Mono :

```
17 rue du Docteur Gérard Monod
06400 CANNES
43.5513°N / 7.0128°E

TOUS LES JOURS — 18H00 → 05H00

06 87 36 11 10
lebarrelpubcannes@gmail.com
@barrelpubcannes

2 terrasses · 150 places extérieur · 60 intérieur
Capacité 600+ · 1000+ avec la rue
Privatisations sur demande
```

CTA vers `contact.html` + lien Google Maps (`target="_blank" rel="noopener"`).

---

### **LE FOOTER**

Le logo SVG en grand, en `--or`, avec un léger glow bleu au survol. **« MAKE IT COUNT »** en Archivo Black. Réseaux, adresse, horaires. Mention **AZZAGENCY** discrète. Rien d'autre.

---

### **PAGE `contact.html`**

Même DA, même header/footer, plus léger. Formulaire (nom, email, téléphone, date, nombre de personnes, message) avec attribut `netlify` pour Netlify Forms + honeypot. Validation HTML5 native, états d'erreur stylés. Bloc privatisation mis en avant. Carte statique ou lien Maps. **Pas de hero canvas, pas d'animation lourde** : elle doit charger instantanément.

---

## 6. LA NAV

- **Invisible pendant le hero**, apparaît à l'IntersectionObserver quand le premier chapitre entre dans le viewport.
- **Thème adaptatif** : chaque section porte `data-theme="noir|vert|bleu"` ; un IO avec `rootMargin: '-4% 0px -88% 0px'` (une bande fine en haut du viewport) bascule la classe de la nav. **Jamais de thème clair.**
- **Menu plein écran** en mobile, `aria-expanded` tenu à jour, fermeture à `Escape`.
- Ancres internes interceptées et déléguées à `lenis.scrollTo(el, { duration: 1.6 })`, avec `scrollIntoView` en fallback si Lenis n'est pas là.

---

## 7. LES ASSETS FOURNIS

### 7.1 Le logo — le vrai
```
/assets/logo/barrel-logo.svg          ← À UTILISER PARTOUT
/assets/logo/barrel-logo-white.png
/assets/logo/barrel-logo-gold.png
```
Le SVG est vectorisé proprement, `viewBox="0 0 1024 1024"`, **`fill="currentColor"`** : il se recolore **entièrement en CSS**. Or dans le header, blanc cassé dans le footer, bleu néon au survol, sans jamais recharger un fichier. C'est exactement ce qu'il faut sur un site sombre.
Sers-t'en aussi pour le préchargeur, la favicon (SVG + fallback PNG) et la page 404.

### 7.2 Les photos
**57 photos réelles du lieu**, recadrées, converties en **WebP ≤1600px q80**, nommées explicitement, dans `/assets/photos/`. Un `INDEX.txt` fait le lien avec les fichiers d'origine.

Familles : `chien-*` (3), `moto-*` (6), `neon-*` (2), `barrique-*`, `photobooth-*`, `flechettes`, `salle-billard-*`, `billard-*`, `facade-*` (4), `terrasse-*` (8), `burger-*` (10), `frites-*`, `chicken-strips`, `cocktail-*` (4), `foule-*` (5), `interieur-bleu-*` (2), `dj-booth`, `ecrans-sport`, `barman-flair`, `staff-futs-*` (2).

**Deux choses à savoir :** il y a **deux chiens** (`chiens-duo.webp`) — n'écris jamais « le chien » comme s'il était unique dans un bloc qui montre les deux. Et la moto rose est **dans le bar**, pas dehors.

### 7.3 D'autres photos arrivent
Baptiste ajoutera des visuels après cette livraison. **Construis en conséquence :**
- Aucun chemin d'image codé en dur dans le JS.
- Un **tableau de configuration unique en haut de `main.js`** listant les visuels de chaque mouvement (`{ id, src, alt, span }`), pour qu'ajouter une photo = ajouter une ligne.
- Des grilles qui acceptent un élément de plus sans casser la composition (`grid-auto-flow: dense`, spans variables).

### 7.4 Les libs
Vendorisées dans `/vendor/` :
- `gsap.min.js` — GSAP **3.13.0** (npm : `gsap@3.13.0`)
- `ScrollTrigger.min.js`, `CustomEase.min.js`
- `lenis.min.js` — Lenis **1.0.42** (npm : `@studio-freight/lenis@1.0.42` — attention, le package `lenis` tout court n'existe pas en 1.0.42)

**Ease signature**, une fois, partout : `CustomEase.create("barrel", "0.625, 0.05, 0, 1")` — en CSS `cubic-bezier(0.625, 0.05, 0, 1)`.

**Boot Lenis avec retry borné** (40 tentatives × 125 ms) — les libs vendorisées peuvent arriver après le script d'init selon l'ordre de parsing. Pas de Lenis si `prefers-reduced-motion`.

---

## 8. CE QU'ON GARDE DES SITES PRÉCÉDENTS

Repris du site award précédent et de la v1 Barrel, uniquement ce qui sert ici :

- **Le mur typographique** en display géant révélé ligne par ligne en stagger. Le geste le plus rentable du lot.
- **Le curseur custom à retard** (lerp). Petit coût, gros effet perçu.
- **Le grain fixe** en overlay. Ce qui fait passer de « site web » à « objet ».
- **La numérotation des chapitres en mono.** Structure la lecture, coûte cinq lignes de CSS.
- **La révélation par IntersectionObserver** plutôt que par scroll listener. Plus fluide, moins cher.
- **Le count-up** sur les chiffres.
- **Les traits de soulignement animés** sur les liens (`transform: scaleX` depuis l'origine, jamais `width`).
- **L'ease unique partout.** Un seul ease sur tout le site = cohérence perçue immédiate.
- **Le CTA à remplissage de motif** (`::before` qui monte au survol) — mais en **léopard ou dégradé néon**, plus en damier bleu/crème.

Ce qu'on **ne reprend pas** : toute la palette crème/beige et les thèmes `light`, les accents corail/moutarde/orange, les transitions de page (site mono-page), le split-text caractère par caractère (trop lourd pour le gain), les parallaxes multiples (le hero scrubbé suffit).

**Règle transversale héritée de la v1 : toute boucle `requestAnimationFrame` doit avoir une condition de sortie** (`document.hidden`, compteur de frames, drapeau IO), et **toute boucle de retry doit être bornée** à 40 tentatives. Aucune exception.

**Références de niveau visées** : rideradian.com (UNCOMMON) pour la rigueur de l'ease, glitchandgrit.com pour la texture et le grain, houseofhoney pour le rythme éditorial des sections.

---

## 9. ACCESSIBILITÉ, PERF, SEO

- **`prefers-reduced-motion: reduce`** géré sur **chaque** animation : hero en image fixe, révélations instantanées, curseur custom désactivé, Lenis non initialisé, count-up affiché directement à sa valeur finale. Ce n'est pas optionnel.
- **Animations en `transform` et `opacity` uniquement.** Jamais `top`, `left`, `width`, `height`, `margin`.
- Contraste AA minimum. Sur fond noir le blanc cassé passe largement ; **vérifie `--gris` sur `--noir`** et remonte-le si nécessaire.
- Focus visible au clavier, jamais `outline: none` sans remplacement. Skip-link en début de page. Les lignes de la carte sont atteignables au clavier et déclenchent le même effet qu'au survol.
- `alt` réel et descriptif sur chaque image. Le `<canvas>` porte un `aria-label` décrivant la descente ; **le contenu textuel de toutes les scènes reste lisible sans JS.**
- **Lazy loading** sur toutes les images hors premier écran. `width`/`height` explicites partout (zéro CLS).
- Scripts versionnés : `<script src="js/main.js?v=1">`.
- **JSON-LD `BarAndPub`** : nom, adresse complète, geo, `openingHoursSpecification` (tous les jours 18:00–05:00), téléphone, `priceRange`, URL, image.
- `robots.txt`, `sitemap.xml`, **404 stylée** (fond noir, logo, une phrase dans le ton, retour à l'accueil).
- OpenGraph + Twitter Card, image 1200×630 (façade de nuit ou le chien sur le billard).
- **`netlify.toml`** : `Cache-Control: public, max-age=31536000, immutable` sur `/frames/*` et `/assets/*`, headers de sécurité de base.

---

## 10. ARBORESCENCE ATTENDUE

```
barrel-pub-v2/
├─ index.html
├─ contact.html
├─ 404.html
├─ robots.txt · sitemap.xml · netlify.toml
├─ css/main.css
├─ js/
│  ├─ main.js     (config images, Lenis, nav, curseur, reveals, count-up, horloge, feed)
│  └─ hero.js     (canvas, préchargement, scrub, overlays, failsafe) — NE PAS MODIFIER
├─ vendor/        (gsap · ScrollTrigger · CustomEase · lenis)
├─ frames/
│  ├─ desktop/ f_001.webp … f_227.webp
│  └─ mobile/  f_001.webp … f_227.webp
└─ assets/
   ├─ fonts/     (woff2 auto-hébergés)
   ├─ logo/      (svg + png)
   └─ photos/    (57 webp + INDEX.txt)
```

---

## 11. ORDRE DE CONSTRUCTION

1. Squelette : arborescence, `index.html` structuré, reset, variables, polices auto-hébergées, grain, logo SVG dans le header.
2. **Hero : uniquement les textes des overlays** (§4.2). Zéro modification de `hero.js`.
3. Lenis + nav adaptative + curseur + `reveal()` à l'IntersectionObserver.
4. Chapitre 02 (le chien, l'horloge) — c'est lui qui valide la DA sombre. **Montre-le avant d'aller plus loin.**
5. Chapitres 03, 04, 05 dans l'ordre.
6. Footer, `contact.html`, `404.html`.
7. SEO, JSON-LD, netlify.toml, sitemap, OG.
8. Passe finale : reduced-motion, clavier, contraste, Lighthouse, mobile réel.

**Test** : `python3 -m http.server 8765` puis `http://localhost:8765`. **L'onglet doit être au premier plan** pendant le test du scrub — Chrome throttle les `requestAnimationFrame` en arrière-plan et le scrub paraîtra cassé alors qu'il ne l'est pas.

---

## 12. CRITÈRES DE RÉUSSITE

- **Pas un seul pixel beige ou crème** nulle part.
- On comprend « le chien te fait entrer » **sans qu'on nous l'explique**.
- Le hero est resté exactement tel qu'il était, aux textes près.
- On peut couper le JS : le contenu reste lisible et le site reste navigable.
- Un visiteur qui connaît le Barrel reconnaît son bar : le bleu, le léopard, la moto rose, les néons, les chiens.
- Le tout tient dans un dossier statique qu'on dépose sur Netlify sans build.

---

*Brief AZZAGENCY — Barrel Pub Cannes v2 — fondation.*
