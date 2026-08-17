---
name: awwwards-lab
description: Boîte à outils de micro-interactions et d'effets de scroll niveau Awwwards, en vanilla JS + GSAP, sans framework ni build step. Utilise ce skill dès qu'il faut ajouter du motion, une micro-interaction, un effet de scroll, un curseur custom, un marquee, un text-scramble, un reveal, un glow néon, un grain, un compteur animé ou une transition de section sur un site — et dès qu'il est question de "niveau Awwwards", "site primé", "site immersif", "plus de wow", "rendre le site plus vivant". Contient le code réel de 12 effets éprouvés, les règles de perf et d'accessibilité qui font gagner ou perdre un prix, le diagnostic des scrolls qui saccadent sur mobile, et l'état 2026 du support des API natives.
---

# Awwwards Lab

Ajouter du motion à un site est facile. Ajouter du motion **sans casser la perf, l'accessibilité ou le scroll** est le vrai travail — et c'est exactement ce que le jury regarde.

Barème officiel Awwwards : **Design 40 % · Usability 30 % · Creativity 20 % · Content 10 %.**
L'usabilité pèse plus que la créativité. Un site sublime qui rame est éliminé au premier tour ; un site sobre et impeccable passe.

## Les six lois

1. **Un seul effet signature par section.** Le « tout bouge en même temps » est sanctionné.
2. **Un seul easing dans tout le site**, et trois durées seulement (0,6 / 0,9 / 1,2 s).
3. **Un seul `requestAnimationFrame`**, piloté par `gsap.ticker`, avec Lenis branché dessus. Chaque effet s'y abonne. Toute boucle a une condition de sortie ; toute boucle de retry est bornée.
4. **Chaque effet a sa porte de sortie** : `prefers-reduced-motion`, `pointer: coarse`, clavier. Un effet sans porte de sortie ne se fait pas.
5. **`transform` et `opacity` uniquement.** Animer `top`, `left`, `width` ou `height` est une faute.
6. **Le texte reste du texte dans le DOM.** Rien d'essentiel dans un canvas. On ne scramble jamais un `h1`.

## Comment travailler

Commence par lire `references/effets.md` — les 12 effets y sont avec leur code complet, leur coût de perf et leur porte de sortie. Prends le code, ne le réinvente pas.

Puis `references/plateforme.md` pour savoir quelles API natives sont réellement utilisables en production aujourd'hui, et lesquelles restent en amélioration progressive.

Quand quelque chose « cale » sans qu'on sache dire quoi — scroll qui se relance au doigt, vidéo scrubée qui se fige, saut au redimensionnement de la barre d'URL — va directement dans `references/debug-scroll.md` : il liste les causes réelles dans l'ordre où elles se présentent.

Avant de livrer, repasse `references/checklist.md`. C'est une liste de vérification, pas une formalité : chaque ligne correspond à un motif d'échec observé en jury.

## Le piège du pin

Si une section est pinnée (hero scrubbé, carrousel horizontal) **et** que Lenis est actif, tous les ScrollTrigger situés en dessous se retrouvent avec des mesures fausses. Sous une section pinnée : IntersectionObserver ou rAF borné, jamais ScrollTrigger.

Second piège du même ordre : un canvas peut mesurer 0 × 0 au moment de l'init (onglet en arrière-plan, pane masqué, barre d'URL mobile en cours d'animation). Créer le pin à ce moment-là le fige sur des mesures nulles — écran noir, scroll bloqué, **et aucune erreur en console**. La parade est un polling borné (40 tentatives × 150 ms) avant de créer le pin, plus un `ScrollTrigger.refresh()` sur `resize` et `visibilitychange`. `references/effets.md` contient le code.
