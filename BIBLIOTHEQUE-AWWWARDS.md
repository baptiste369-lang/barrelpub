# BIBLIOTHÈQUE AWWWARDS — AZZAGENCY
### Veille technique, juillet 2026. Document de référence, à rouvrir sur chaque projet immersif.

Le barème officiel Awwwards : **Design 40 % · Usability 30 % · Creativity 20 % · Content 10 %**.
L'usabilité pèse plus lourd que la créativité. C'est exactement là que la plupart des sites « à effets » perdent leur Site of the Day.

---

## 1. Les sites de référence

| Site | URL | Ce qu'on lui prend |
|---|---|---|
| **Dragonfly Redux** — Studio Freight | dragonfly.xyz | Le « fold » de scroll en `clip-path` animé + Lenis synchronisé DOM/canvas. Marche sans WebGL. |
| **TRIONN** | trionn.com | Typo éditoriale massive, transitions de section au masque plein écran. Rythme lent et lourd. |
| **Partizan** — Beaucoup. | partizan.com | Grille en hover distortion léger, curseur contextuel qui change de label. |
| **Artem Shcherbakov** | artemartemartem.com | Portfolio sombre, text-scramble sur les titres, marquee de bas de page. Très transposable en vanilla. |
| **Spotify Wrapped Party** — Active Theory | wrapped-party.activetheory.dev | La direction couleur néon saturée sur noir et le rythme d'apparition. Pas la stack (WebGL lourd). |
| **NORMAL IS BORING** — LaNegrita | normalisboring.es | Anti-design maîtrisé : superposition de calques, rotations légères, textures. |
| **Lacoste Polo Factory** — Merci Michel | members-play.lacoste.com/polo-factory-experience | Storytelling scroll en chapitres avec sticky sections. Structure narrative reprenable telle quelle. |
| **IZANAMI** — baqemono | izanami-official.com | Grain animé et lignes fines. Le grain est la clé de la texture « lieu nocturne ». |
| **Glitch&Grit** | glitchandgrit.com | Glitch RGB-split en pur CSS (`text-shadow` décalé + `clip-path` keyframes). Zéro WebGL. |
| **Floema** — Bürocratik | floema.com/en | Transitions de page fluides, curseur magnétique. Référence sur la **qualité d'easing**. |
| **Uncommon Studio** | uncommonstudio.com.au | Le meilleur modèle « GSAP sans WebGL » de la liste. Grilles dynamiques, stagger précis. |
| **Unseen Studio** | unseen.co | Navigation plein écran au hover, typo bold, curseur custom. |
| **Mat Voyce** | matvoyce.tv | Typographie cinétique 100 % timeline GSAP. |
| **Epic** | epic.net/en | Titres qui morphent au scroll, images entrant par angles inattendus. |
| **Terminal Industries** — REJOUICE | terminal-industries.com | Système monospace, data-viz décorative, bleu électrique sur noir. |

**À admirer, ne pas copier techniquement** (React / Three.js / WebGPU obligatoires) : Lusion, Bruno Simon, Active Theory, Resn, Immersive Garden. Hors budget en vanilla, et destructeur pour le Lighthouse mobile.

---

## 2. Les techniques, avec leur vrai coût

| Technique | Effet perçu | Faisabilité vanilla | Coût perf |
|---|---|---|---|
| Clip-path reveal / fold au scroll | Une section se déplie ou découpe la suivante | Facile | Faible — composité si on évite un `filter` simultané |
| Sticky stacking cards | Cartes qui s'empilent | Facile | Très faible, pur CSS |
| Marquee infini à vélocité de scroll | Bandeau qui accélère au scroll | Facile | Négligeable si `will-change` ciblé |
| Text scramble / decode | Titre mono qui se décode | Facile | Négligeable. Ne jamais scrambler un `h1` (SEO) |
| Split-text line reveal | Les phrases montent depuis le sol | Facile | Faible. Découper au `load`, pas au scroll |
| Curseur magnétique | Les boutons attirent la souris | Facile | Faible. Couper sur `pointer: coarse` |
| Curseur contextuel à label | Sensation d'objet piloté | Facile | Faible. Un seul rAF pour tout le curseur |
| Grain animé | Texture pellicule | Facile | **Piège :** `feTurbulence` animé coûte cher. Un WebP tileable 128 px en `steps()` est quasi gratuit |
| Glitch RGB-split | Néon qui grésille | Facile | Faible si limité à de courtes salves déclenchées |
| Néon glow multi-couches | Enseigne allumée | Facile | Moyen — `filter` force une couche de peinture. 2-3 éléments max à l'écran |
| Masque SVG au scroll | Une forme révèle une image plein écran | Moyen | Moyen. Animer le `transform` du masque, jamais sa géométrie |
| Distortion hover sans WebGL | Image qui ondule | Moyen | Moyen à lourd en SVG displacement. Préférer 2 calques + clip |
| Parallaxe multi-couches | Profondeur | Facile | Faible. Plafonner à 4-5 couches |
| Scroll velocity skew | Le contenu « traîne » | Facile | Faible. **Danger a11y**, couper sur reduced-motion |
| Transitions de page (View Transitions) | Continuité sans SPA | Moyen | Faible, c'est le navigateur qui compose |
| Section à scroll horizontal | Défilement latéral | Moyen | Moyen — le pin provoque un reflow |
| Compteur odomètre | Chiffres qui roulent | Facile | Négligeable |
| **Un seul moment WebGL léger** — canvas fullscreen, shader fragment ~60 lignes, sans Three.js | Wow-factor unique | Lourd mais isolable | **Le seul poste vraiment risqué.** Lazy en IO, résolution 0.5×, pause hors viewport, image statique en fallback |

---

## 3. Les API natives réellement utilisables (juillet 2026)

| API | Statut réel | Verdict |
|---|---|---|
| **Popover API** | Baseline janvier 2025 | Oui. Focus trap, light-dismiss et Escape gratuits. Gros gain d'a11y sans code |
| **`@starting-style` + `allow-discrete`** | Baseline août 2024 | Oui. Remplace 80 % du JS d'ouverture de modale |
| **`text-wrap: balance` / `pretty`** | Baseline octobre 2024 | Oui, obligatoire sur les gros titres |
| **Container queries** | Largement disponible depuis 2023 | Oui, sans réserve |
| **`:has()`** | Largement disponible depuis fin 2023 | Oui, sans réserve |
| **View Transitions same-document** | Baseline (Firefox 144, oct. 2025) | Oui, sans réserve |
| **View Transitions cross-document** | ~83 % global. Firefox 144+ partiel (cross-fade au lieu du morph nommé) | Oui, meilleure façon d'avoir des transitions de page sans SPA. Dégradation propre |
| **CSS Anchor Positioning** | Baseline janvier 2026. `@position-try` demande Safari 18.4+ | Oui avec fallback |
| **CSS scroll-driven animations** (`animation-timeline: view()`) | Chrome/Edge 115+, Safari 26+ — **Firefox toujours non supporté**, dans Interop 2026 | **Amélioration progressive uniquement.** Sur Firefox l'animation ne joue pas, le contenu reste visible. Tout le motion chorégraphié reste en GSAP |

**Ligne de conduite :** GSAP est la source de vérité pour le motion chorégraphié — c'est ce qui est jugé. Les API natives prennent l'UI (popover, transitions, typo) et les micro-reveals.

---

## 4. Les dix pièges qui coûtent le prix

1. **Scroll hijack abusif.** Lenis est accepté (smoothing, pas hijack). Ce qui tue : les sections pinnées de plus de ~2 écrans, le snap forcé, un scroll horizontal dont on ne peut pas sortir. Règle : toute section pinnée se traverse en moins de ~300 vh et se saute par une ancre.
2. **Préchargeur trop long.** Au-delà de ~2,5 s, éliminatoire — pour le jury comme pour le visiteur. Progression réelle obligatoire, et déverrouillage forcé.
3. **Poids des assets.** Le péché n°1 des sites sombres : la vidéo de fond de 15 Mo. AV1/WebM, `preload="none"`, poster WebP, coupée sous 768 px.
4. **Mobile bâclé.** Un site desktop-only est disqualifié d'office sur Usability. Chaque effet lourd doit avoir un chemin mobile **décidé**, pas subi.
5. **`prefers-reduced-motion` ignoré.** Non négociable en 2026.
6. **Contraste.** Un bleu électrique saturé sur noir tourne autour de 3,3:1 — insuffisant pour du texte courant (AA exige 4,5:1). Couleur d'accent seulement ; prévoir une variante éclaircie pour les liens.
7. **Focus states détruits.** `outline: none` sans remplacement = perte sèche.
8. **Texte en canvas non sélectionnable.** Content pèse 10 %, mais ça plombe aussi le SEO et l'accessibilité.
9. **Sur-animation.** Le jury sanctionne le « tout bouge en même temps ». Un effet signature par section, un easing unique, trois durées.
10. **Fuites de perf classiques.** Animer `top`/`left`/`width` au lieu de `transform` ; `will-change` posé partout ; `backdrop-filter` sur de grandes surfaces scrollées ; `feTurbulence` animé en continu ; plusieurs rAF concurrents — n'en garder qu'un, piloté par `gsap.ticker`, avec Lenis branché dessus.

---

## Sources

- [Awwwards — Sites of the Day](https://www.awwwards.com/websites/sites_of_the_day/)
- [Awwwards — Evaluation System](https://www.awwwards.com/about-evaluation/)
- [Awwwards — Case Study : Dragonfly by Studio Freight](https://www.awwwards.com/case-study-dragonfly-by-studio-freight.html)
- [Web Platform Features Explorer — Scroll-driven animations](https://web-platform-dx.github.io/web-features-explorer/features/scroll-driven-animations/)
- [Can I Use — Cross-document View Transitions](https://caniuse.com/cross-document-view-transitions)
- [WebKit — A guide to Scroll-driven Animations with just CSS](https://webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/)
- [MDN — CSS scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations)
- [web.dev — Same-document view transitions are now Baseline](https://web.dev/blog/same-document-view-transitions-are-now-baseline-newly-available)
- [Codrops — SVG Mask Transitions on Scroll with GSAP and ScrollTrigger](https://tympanus.net/codrops/2026/03/11/svg-mask-transitions-on-scroll-with-gsap-and-scrolltrigger/)
- [Codrops — Sticky Grid Scroll](https://tympanus.net/codrops/2026/03/02/sticky-grid-scroll-building-a-scroll-driven-animated-grid/)
- [Codrops — Animated Product Grid Preview with GSAP & Clip-Path](https://tympanus.net/codrops/2025/05/27/animated-product-grid-preview-with-gsap-clip-path/)
- [buildmvpfast — Web Platform Baseline 2026](https://www.buildmvpfast.com/blog/web-platform-baseline-2026-new-features-browser-support)
- [Godly — Sites Inspiration](https://godly.design/sites)
