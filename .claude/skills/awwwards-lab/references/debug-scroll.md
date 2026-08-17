# Scroll, tactile et vidéo — les défauts qu'on sent sans savoir les nommer

Un site peut passer tous les audits et donner quand même l'impression de « caler ».
Ce fichier liste les causes réelles de cette sensation, dans l'ordre où elles se
présentent.

## Le scroll qui « se relance » sur mobile

**Cause.** Un lissage JavaScript (Lenis, Locomotive) actif au tactile se superpose à
l'inertie native du système. Les deux courbes de décélération ne coïncident jamais :
le doigt s'arrête, le système freine, le lissage continue puis rattrape. Sur iOS,
l'inertie est gérée hors du fil principal — aucun JS ne peut s'y aligner.

**Correction.** Le lissage sert à la molette et au trackpad, pas au doigt.

```js
new Lenis({ lerp: 0.11, smoothWheel: true, syncTouch: false, touchMultiplier: 1 })
```

On ne perd rien. Le natif est meilleur que tout ce qu'on écrira.

## La barre d'URL mobile

`100vh` est **statique** : il vaut toujours la hauteur du viewport barre rétractée, et
ne bouge jamais. `100dvh` est l'unité **dynamique** : elle suit la barre d'URL en temps
réel. Ce sont donc deux outils opposés, et le choix dépend de l'élément.

Pour un bloc qui doit remplir l'écran visible sans laisser de bande vide sous la barre :
`100dvh`.

Pour un élément **pinné** — hero scrubbé, carrousel horizontal — surtout pas `dvh`.
Une hauteur qui change pendant le scroll, sur un élément dont la position est calculée
au pixel, c'est exactement le saut qu'on cherche à supprimer. Sur un pin, `100vh` est le
bon choix, précisément parce qu'il ne bouge pas.

Et dans tous les cas `ScrollTrigger.config({ ignoreMobileResize: true })`, pour que le
redimensionnement de la barre ne déclenche pas un recalcul complet.

## Une vidéo pilotée par le scroll qui se fige

**Cause.** On écrit `video.currentTime` à chaque frame de la boucle. Le décodeur reçoit
plus de demandes de repositionnement qu'il ne peut en servir et finit par abandonner.

**Correction.** Un seuil : on ne repositionne que si l'écart dépasse la durée d'une
frame.

```js
const T = 1 / 24;
if (Math.abs(target - video.currentTime) > T) video.currentTime = target;
```

Et à l'encodage, un keyframe toutes les 12 frames (`-g 12 -keyint_min 12
-sc_threshold 0`). Un fichier encodé par défaut n'a qu'un keyframe toutes les
250 frames : le scrub y est impossible, quoi qu'on fasse côté JS.

## `will-change` permanent

Chaque `will-change` crée une couche de composition qui reste en mémoire graphique.
Sur un téléphone milieu de gamme, quelques couches de trop suffisent à faire tomber le
scroll sous les 60 i/s. Le poser à l'entrée dans le viewport, le retirer à la fin de
la transition.

## Ce qui n'est pas visible ne doit pas être calculé

```css
.scene:not(#hero){ content-visibility:auto; contain-intrinsic-size:auto 900px; }
```

Le gain le moins cher qui existe sur une page longue. **Jamais** sur une section pinnée
ni sur une cible d'ancre : les mesures deviennent fausses et le pin se fige.

## Le préchargeur

Une barre décorative qui atteint 100 % avant la fin du chargement, le visiteur le
sent : l'écran reste, le compteur ne bouge plus. Afficher une progression réelle,
pondérée sur ce qui est réellement attendu, et **plafonner dur** — au-delà de 4
secondes, on lève le voile quoi qu'il arrive, et on prévoit un bouton pour passer.

Deux mécanismes de verrouillage qui coexistent, c'est un scroll bloqué définitivement
chez une fraction des visiteurs, sans aucune erreur en console. S'il existe déjà un
`unlock()`, il reste le seul point de sortie ; tout le reste n'est qu'habillage.

## L'ordre de diagnostic

1. Compter les `requestAnimationFrame` : il n'en faut qu'un.
2. Chercher les animations de `top`, `left`, `width`, `height`.
3. Chercher les `will-change` permanents.
4. Enregistrer un profil de performance pendant un scroll au doigt, sur un vrai
   téléphone. L'émulateur ne reproduit ni l'inertie, ni le GPU, ni la thermique.
5. Seulement ensuite, regarder le poids des ressources.
