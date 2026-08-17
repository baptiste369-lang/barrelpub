# État de la plateforme — juillet 2026

**Ligne de conduite :** GSAP est la source de vérité pour tout le motion chorégraphié — c'est ce qui est jugé, et ce qui doit être identique partout. Les API natives prennent l'UI (popover, transitions de page, typographie) et les micro-reveals.

| API | Statut réel | Verdict |
|---|---|---|
| **Popover API** (`popover`, `:popover-open`, `::backdrop`) | Baseline depuis janvier 2025 | **Oui.** Focus trap, light-dismiss et fermeture à l'Escape gratuits. Pour les menus mobiles, modales, tooltips. Supprime beaucoup de JS et rend la nav réellement accessible sans effort |
| **`@starting-style` + `transition-behavior: allow-discrete`** | Baseline depuis août 2024 | **Oui.** Anime l'entrée d'éléments passant de `display: none`. Remplace 80 % du JS d'ouverture de modale |
| **`text-wrap: balance` / `pretty`** | Baseline depuis octobre 2024 | **Oui, obligatoire.** `balance` sur tous les gros titres — plus jamais de veuve typographique. `pretty` sur les paragraphes. Deux lignes de CSS, gain visuel immédiat |
| **Container queries** | Largement disponible depuis début 2023 | **Oui.** Les composants s'adaptent à leur conteneur, pas au viewport. Fin des media queries en cascade |
| **`:has()`** | Largement disponible depuis fin 2023 | **Oui.** `\.row:has(:focus-visible)` allume un état au clavier sans une ligne de JS |
| **View Transitions same-document** | Baseline (Firefox 144, oct. 2025 a complété le tableau) | **Oui.** Filtres de galerie, ouverture de fiche |
| **View Transitions cross-document** | ~83 % global. Chrome/Edge 126+, Safari 18.2+, Firefox 144+ partiel (cross-fade au lieu du morph nommé) | **Oui.** La meilleure façon d'avoir des transitions de page sans passer en SPA. Dégradation propre |
| **CSS Anchor Positioning** | Baseline janvier 2026 (Firefox 147). `@position-try` demande Safari 18.4+ | **Oui avec fallback** en `transform` |
| **CSS scroll-driven animations** (`animation-timeline: view()` / `scroll()`) | Chrome/Edge 115+ (2023), Safari 26+ (sept. 2025), **Firefox toujours non supporté** — dans Interop 2026. ~5 % des page loads | **Amélioration progressive uniquement.** Bon pour les fades/rises simples à l'entrée en viewport : sur Firefox l'animation ne joue pas, le contenu reste visible — dégradé acceptable. Tout ce qui est chorégraphié reste en GSAP |

## Budget

GSAP + ScrollTrigger + CustomEase + Lenis ≈ **90 ko gzip**, vendorisés localement.

Vendoriser, jamais de CDN : un CDN bloqué par une extension navigateur chez un client coûte une journée, et le site est simplement blanc.

Aucune autre lib. Si un effet demande une dépendance supplémentaire, c'est que l'effet est mal choisi.
