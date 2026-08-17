# BRIEF V2.5 — LES IMAGES QUI NE S'AFFICHENT PLUS

Trois corrections, un rappel, et une information. Rien d'autre.
**`js/hero.js` : zéro ligne, comme toujours.**

---

## §1 · LE BUG — les images ne s'affichent plus à partir du chapitre carte

**Symptôme :** à partir de « la carte » et jusqu'à la fin du site, les images ne
s'affichent pas.

**Cause : le `content-visibility: auto` ajouté au lot V2.4.** `css/main.css`,
lignes 293 à 307.

```css
#scene-jeu,#scene-carte,#scene-sortie,#venir{ content-visibility:auto; }
```

Le mécanisme de révélation du site repose sur un IntersectionObserver qui ajoute
`.is-in` aux éléments `[data-reveal]`, puis **les désabonne** (`unobserve`) après le
premier déclenchement. Or un sous-arbre en `content-visibility: auto` non rendu ne
produit pas de rectangles valides : les éléments qu'il contient sont effondrés sur la
boîte intrinsèque de la section. L'observer voit donc des mesures fausses, se
déclenche au mauvais moment ou pas du tout, désabonne — et les éléments restent à
`opacity: 0` définitivement.

Les chiffres le confirment : `#scene-carte` contient 7 blocs `[data-reveal]` et 34
images en `loading="lazy"`, `#scene-sortie` 8 et 25. Tout ce qui devait apparaître
dans ces deux chapitres est concerné. `#venir` n'a aucun `data-reveal`, ce qui
explique qu'il s'affiche encore.

**Correction : supprimer entièrement le bloc,** lignes 293 à 307, commentaire compris.

L'instruction venait du brief V2.4 §3, donc de moi. Elle était juste dans l'absolu et
fausse ici : `content-visibility` ne se marie pas avec une révélation au scroll qui
désabonne ses cibles. Le gain de mise en page ne vaut pas un site à moitié blanc.

**Ne pas essayer de sauver la règle** en la limitant à certaines sections, en retirant
le `unobserve`, ou en ajoutant `contain-intrinsic-size` ailleurs. On la retire, point.
Si on veut ce gain un jour, ce sera un lot dédié avec vérification visuelle chapitre
par chapitre.

Bump du `?v=` de `css/main.css` après correction, et **vérification à l'écran des
quatre chapitres**, pas seulement du code : descendre lentement jusqu'au pied de page
et confirmer que chaque image apparaît.

---

## §2 · LES CIBLES TACTILES — sans bouger la mise en page

Tu as relevé 10 cibles sous 44 px à 375 px, dont « Réserver » à 38 px, et tu poses la
question comme un arbitrage entre accessibilité et mise en page. Il n'y en a pas :
**on agrandit la zone de clic sans changer la taille visible.**

```css
@media (pointer:coarse){
  .btn-reserver, .nav a, .foot-legal a, /* …les 10 cibles relevées… */
  { position:relative }

  .btn-reserver::after, .nav a::after, .foot-legal a::after{
    content:"";position:absolute;left:50%;top:50%;
    transform:translate(-50%,-50%);
    width:max(100%,44px);height:max(100%,44px);
  }
}
```

Le pseudo-élément déborde de l'élément et capte le toucher. Rien ne bouge à l'écran,
aucun décalage, et tout devient atteignable au doigt. À réserver au `pointer: coarse`
pour ne pas créer de zones fantômes à la souris.

Vérifier après coup qu'aucun de ces pseudo-éléments n'en recouvre un autre — deux
cibles voisines de 44 px dans un espace de 60 px se marchent dessus.

---

## §3 · L'AVERTISSEMENT CONSOLE — tu n'as pas épuisé la piste

L'avertissement porte sur le preload de `frames/mobile/f_001.webp`. La balise
`<link rel="preload">` est dans **`index.html`**, pas dans `hero.js` : tu as le droit
d'y toucher.

Ajouter `type="image/webp"` aux deux preloads de frames :

```html
<link rel="preload" as="image" type="image/webp" href="frames/desktop/f_001.webp" media="(min-width:768px)">
<link rel="preload" as="image" type="image/webp" href="frames/mobile/f_001.webp"  media="(max-width:767px)">
```

C'est le motif le plus courant de cet avertissement. Si après ça il persiste, tu le
laisses et tu le documentes — il est bénin et antérieur au lot.

---

## §4 · LES FRAMES ONT ÉTÉ RÉ-ENCODÉES — ne rien faire

C'est déjà fait, hors du dépôt de code. Information, pas tâche.

| | avant | après |
|---|---|---|
| `frames/desktop` | 17,63 Mo | **13,54 Mo** |
| `frames/mobile` | 9,07 Mo | **6,99 Mo** |
| total | 26,70 Mo | **20,53 Mo** |

Mêmes noms, même nombre (227 + 227), mêmes dimensions (1920 × 1072 et 828 × 1472),
qualité WebP 62. Comparaison au pixel près sur un recadrage agrandi : indiscernable de
l'original. **Aucune ligne de code à changer.**

Les originaux sont conservés dans `~/Downloads/barrel-v2-frames-original/`, hors du
dossier du site. Ne pas les committer, ne pas les déployer.

Conséquence à vérifier : le préchargeur du §2 du lot précédent doit afficher une
progression plus rapide. Relever le nouveau temps de chargement des 60 premières
frames.

---

## §5 · LE SKILL

Le fichier `skill-awwwards-lab.zip` à la racine du dépôt a été corrigé — la section
sur `100vh` / `100dvh` disait l'inverse de la vérité, tu avais raison.

Pour t'en servir, décompresse-le dans le dossier des skills du projet :

```bash
cd ~/Downloads/barrel-v2
mkdir -p .claude/skills
unzip -o skill-awwwards-lab.zip -d .claude/skills/
```

Tu obtiens `.claude/skills/awwwards-lab/` avec `SKILL.md` et quatre fichiers de
référence : les effets et leur code, l'état des API natives, la checklist de
livraison, et le diagnostic des scrolls qui saccadent. Le zip peut rester à la racine
comme archive, ou être retiré du dépôt une fois décompressé — au choix.

---

## §6 · CHECKLIST

- [ ] Le bloc `content-visibility` est entièrement supprimé de `css/main.css`.
- [ ] Les quatre chapitres ont été parcourus **à l'écran**, chaque image apparaît.
- [ ] `?v=` de `css/main.css` bumpé.
- [ ] Les 10 cibles tactiles font 44 px au toucher, sans aucun décalage visuel.
- [ ] Aucun chevauchement entre deux zones tactiles agrandies.
- [ ] `type="image/webp"` ajouté aux deux preloads de frames.
- [ ] `git diff js/hero.js` est vide.
- [ ] Console propre sur les quatre pages.
- [ ] `barrel-v2-frames-original/` n'est ni committé ni déployé.
