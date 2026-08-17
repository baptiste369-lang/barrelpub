# Checklist avant livraison

Chaque ligne correspond à un motif d'échec réellement observé en jury. Ce n'est pas une formalité.

## Performance
- [ ] LCP < 2,5 s · INP < 200 ms · CLS < 0,1, mesurés en **mobile 4G simulé**, pas en desktop filaire.
- [ ] Aucun préchargeur de plus de ~2,5 s. Progression réelle affichée, déverrouillage forcé quoi qu'il arrive.
- [ ] Toutes les images ont `width` et `height` réels — c'est ce qui tient le CLS à zéro.
- [ ] Tout ce qui est sous le premier écran est en `loading="lazy" decoding="async"`.
- [ ] `<link rel="preload">` sur les fontes critiques uniquement, `font-display: swap` partout.
- [ ] Pas de vidéo de fond non compressée. AV1/WebM, poster WebP, `preload="none"`, coupée sous 768 px.
- [ ] `will-change` uniquement sur ce qui est réellement animé en continu.
- [ ] Pas de `backdrop-filter` sur de grandes surfaces qui scrollent.
- [ ] Pas de `feTurbulence` SVG animé en continu.
- [ ] Un seul `requestAnimationFrame` actif dans toute la page.
- [ ] Aucune animation de `top`, `left`, `width`, `height`.

## Accessibilité
- [ ] Contraste vérifié sur **chaque** paire texte/fond. Un accent saturé sur fond noir tourne souvent autour de 3,3:1 — insuffisant pour du texte courant (AA exige 4,5:1). Prévoir une variante éclaircie pour les liens.
- [ ] `:focus-visible` visible et cohérent avec la DA, partout. Jamais `outline: none` sans remplacement.
- [ ] Un `matchMedia('(prefers-reduced-motion: reduce)')` global qui coupe skew, parallaxe, scramble, glitch, flicker, marquee et curseur magnétique, et réduit les reveals à un fade de 200 ms.
- [ ] Navigation complète au clavier, Escape ferme les couches ouvertes.
- [ ] Toute section pinnée est sautable par une ancre et se traverse en moins de ~300 vh.
- [ ] `alt` réels et descriptifs. Décoratif → `alt=""` + `aria-hidden="true"`.
- [ ] Le texte est du vrai texte dans le DOM, sélectionnable. Rien d'essentiel dans un canvas.

## Mobile
- [ ] Chaque effet lourd a un chemin mobile **décidé**, pas subi.
- [ ] Pas de curseur custom, pas de magnétisme sur `pointer: coarse`.
- [ ] Pas de pin horizontal sur petit écran — `scroll-snap` natif à la place.
- [ ] Testé barre d'URL en cours d'animation : rien ne se fige.

## Robustesse
- [ ] Onglet mis en arrière-plan puis ramené : rien n'est figé, rien ne s'emballe.
- [ ] Redimensionnement de fenêtre : pas de layout cassé, pas de canvas à 0 × 0.
- [ ] Une image ou une frame manquante ne bloque jamais la page.
- [ ] Console propre : zéro erreur, zéro warning.
- [ ] Le site reste lisible et navigable JS désactivé (contenu et coordonnées écrits en dur dans le HTML).

## Contenu
- [ ] Aucun `TODO`, aucun lorem, aucun placeholder, aucun faux avis, aucune fausse donnée en ligne.
- [ ] JSON-LD complet et valide pour le type d'établissement concerné.
- [ ] Open Graph + Twitter Card avec une image 1200 × 630 réelle.
- [ ] `lang` correct, hiérarchie `h1` → `h2` → `h3` sans saut.

## Discipline
- [ ] Un seul effet signature par section.
- [ ] Un seul easing dans tout le site.
- [ ] Trois durées maximum.
- [ ] Rien ne bouge en même temps que autre chose sans raison.
