# COMPLÉMENT AU BRIEF — à appliquer en plus de ce qui précède

Deux ajouts seulement. Le reste du brief ne change pas.

---

## A. LE COPYWRITING DU HERO — REPRENDRE LES TEXTES DE LA V1

> ⚠️ **NE TOUCHE À AUCUNE LIGNE DE CODE DU HERO.** L'animation, le scrub, le canvas, le préchargeur, le failsafe, les fenêtres de progression, les timings : **tout reste exactement en l'état.** Ce point ne concerne QUE le contenu textuel des overlays. Tu remplaces des chaînes de caractères, rien d'autre.

Les textes de la v1 sont meilleurs que ceux en place : ils installent Cannes, l'heure, le Carré d'Or, et ils finissent sur une phrase de comptoir. On les reprend.

Tu gardes les overlays existants, leurs `id`, leurs `data-in` / `data-out`, leur structure `.ov-line > span`. **Tu ne changes que ce qu'il y a entre les balises :**

| overlay | texte à mettre |
|---|---|
| intro | **BARREL / PUB** *(display)* — sous-titre mono : `Cannes — Carré d'Or` |
| 2 | « La nuit tombe sur Cannes. » |
| 3 | « Quelque part / dans le Carré d'Or… » |
| 4 | « …il y a une porte qui ne / ferme presque jamais. » — sous-ligne mono : `Ouvert 18h–5h, 7j/7` |
| 5 | « Bienvenue au Barrel. » |
| 6 | « La première, / c'est la meilleure. » |
| final | **BARREL / PUB** — `Le pub du Carré d'Or` *(Fraunces italic)* — CTA : `Descendre au bar ↓` |

Indication de scroll en bas du hero : `Scroller pour descendre` (mono).

**Le `/` marque une coupure de ligne** — chaque ligne est son propre `.ov-line > span` pour que le line-reveal s'applique ligne par ligne, exactement comme aujourd'hui.

Le chien reste dans le récit : il arrive au **chapitre suivant**, dans le mur typographique « LE CHIEN / TE FAIT / ENTRER ». Le hero ne le nomme pas, il l'annonce.

---

## B. PLUS DE VOLUME : 5 CHAPITRES, 11 MOUVEMENTS

On garde 5 chapitres numérotés (`01 / 05`…) pour que le récit ne se dilue pas, mais chaque chapitre contient plusieurs **mouvements** — des blocs distincts, non numérotés, qui ne relancent pas une grande respiration typographique. Même DA, même palette sombre, aucune exception.

**Chapitre 01 — La descente**
1. Le hero. Inchangé.

**Chapitre 02 — Le seuil**
2. Le chien : mur typo « LE CHIEN / TE FAIT / ENTRER » + `chien-billard-01` plein format, léopard en fond à `opacity: 0.05`.
3. **L'horloge live** *(nouveau)* — un bloc mono qui lit l'heure réelle du visiteur : `23:47 — LE BARREL EST OUVERT.` avec un point néon bleu qui pulse, ou `14:12 — ON OUVRE DANS 3H48.` avec un point éteint. Rafraîchi toutes les 30 s. Dix lignes de JS, et ça dit tout du lieu : un pub ouvert quand les autres ferment. **Le bloc est écrit en dur dans le HTML avec `OUVERT TOUS LES JOURS — 18H → 05H` par défaut**, le JS ne fait que remplacer : si le JS meurt, l'info reste juste.

**Chapitre 03 — Le jeu & la nuit**
4. Le jeu : billard vintage, fléchettes, babyfoot, arcade, photobooth **TA BOBINE** (4 flashs, 3€), tatoueur résident sur demande, 10 écrans sport. Mosaïque asymétrique, révélation en stagger. Léopard `opacity: 0.12` autorisé ici et ici seulement.
5. **Le mur des néons** *(nouveau)* — les enseignes du lieu sont du copywriting déjà écrit sur les murs, on le reprend en typo géante avec un glow CSS multi-couches (pas une image) : **« YOU ARE EXACTLY WHERE YOU NEED TO BE »** en traitement majeur — c'est la phrase de la maison — et **« FUCK ALEXA, SIRI ME YOUR PLAY… »** contre le bloc DJ. **« MAKE IT COUNT »** (sur les tonneaux) se garde pour le footer.
6. La nuit : DJ booth, karaoké, la foule. Et **la moto rose** — elle est **à l'intérieur du bar**, c'est un décor permanent, pas un événement.

**Chapitre 04 — La carte**
7. Les burgers. 8. Tapas, planches, buckets. Prix en mono, en `--or`, structure éditoriale.

**Chapitre 05 — Le lieu**
9. **Les chiffres** *(nouveau)* — count-up au scroll : `2 terrasses · 150 places extérieur · 60 intérieur · 600+ de capacité · 10 écrans sport · 11h d'ouverture par nuit`. Chiffres en Archivo Black géant, légendes en mono.
10. La terrasse **de nuit** : `terrasse-nuit-*`, `terrasse-heure-bleue`, `facade-nuit`, `facade-crepuscule`. Les versions plein jour ne servent que pour l'image OG — **on ne revient jamais au clair**.
11. **Le feed & les infos** *(nouveau)* — embed Instagram officiel chargé en lazy à l'IntersectionObserver (`rootMargin:'600px 0px'`), une seule fois, **jamais de scraping**, avec un lien texte vers `@barrelpubcannes` en fallback si l'embed ne charge pas. Puis le bloc infos pratiques sur fond `--vert`.

**Footer** — **« MAKE IT COUNT »** en Archivo Black, le logo SVG, les réseaux, l'adresse, les horaires, mention AZZAGENCY discrète.

---

*Tout le reste du brief — palette, typo, assets, accessibilité, SEO, arborescence — reste tel quel.*
