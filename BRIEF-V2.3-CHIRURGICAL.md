# BRIEF V2.3 — MODIFICATIONS CHIRURGICALES

Le site est validé par la cliente. **Cinq corrections précises, rien d'autre.**
Ne pas refactorer, ne pas « améliorer » au passage, ne pas toucher à ce qui n'est
pas listé ici. `js/hero.js` reste strictement inchangé — l'animation est validée.

---

## §1 · L'ÉCRAN NOIR ET LA PHOTO DE LA MOTARDE — c'est le même bug

**Symptôme :** aux trois quarts du site, un écran presque entièrement noir. À gauche,
une bande verticale étroite qui laisse deviver un bout de la fille à la moto, et la
légende `ET OUI, ELLE EST À L'INTÉRIEUR.` perdue au milieu du vide.

**Où :** `index.html` ligne 328, `<figure class="moto-solo">`.
CSS : `css/main.css` lignes 602–612.

Ce n'est pas une image cassée : les 113 références d'assets de la page résolvent
toutes, aucun 404. C'est un problème de mise en page.

```css
.moto-solo{ ... grid-template-columns:1fr; max-width:520px; }
@media (min-width:560px){ .moto-solo{grid-template-columns:180px 1fr} }
.moto-solo img{width:100%;aspect-ratio:2/3;object-fit:cover}
```

La colonne image fait 180 px et la seconde colonne ne contient qu'une légende de
trois mots : d'où une image minuscule et un immense vide noir à droite.

**Correction demandée :**

```css
.moto-solo{
  margin:clamp(30px,6vh,70px) auto;
  display:block;               /* plus de grille deux colonnes */
  max-width:380px;
}
.moto-solo img{
  width:100%;height:auto;aspect-ratio:3/4;object-fit:cover;
  object-position:center 30%;  /* on cadre le visage, pas le réservoir */
  background:var(--noir-2);
}
.moto-solo figcaption{margin-top:12px;text-align:left}
```

Puis **vérifier à l'écran**, pas seulement dans le code : il ne doit plus rester
d'espace vide de plus d'un demi-écran entre la bande de néons et le bloc programme.
Si du vide subsiste, il vient du conteneur parent — chercher un `min-height` ou un
`gap` surdimensionné sur `.scene-jeu .scene-inner` et le ramener à la valeur des
autres chapitres. Faire une capture avant / après.

---

## §2 · LE TROISIÈME NÉON — trop cru en gros

`index.html` ligne 267 :
`<p class="neon playlist">Fuck nudes,<br>send me your playlist</p>`

C'est un vrai néon du bar, mais écrit en 86 px sur toute la largeur d'un écran, ça
ne se lit pas comme un clin d'œil au mur du fond : ça devient le slogan de
l'établissement. La cliente le refuse, et elle a raison.

**Correction :** le troisième mur reprend une phrase qu'elle a elle-même proposée.

```html
<p class="neon">This place is hotter<br>than your ex</p>
<span class="neon-step">03 — la fin</span>
```

Conséquence : cette phrase sert aujourd'hui de `.night-claim` à la ligne 244. On ne
peut pas l'avoir deux fois. **Supprimer le bloc `.night-claim`** (lignes 243–245) —
la phrase est plus forte en fin de séquence néon qu'en accroche, et le chapitre nuit
n'en a pas besoin pour démarrer.

L'image de fond du troisième mur, `neon-playlist-foule.webp`, **reste** : le néon y
est petit, flou, au fond du cadre, à sa place documentaire. Elle est déjà à
`opacity:.22` sous le dégradé. Ne pas la remplacer.

---

## §3 · LE HERO EN NÉON BLEU

La cliente adore le traitement néon et veut le même dans le hero, sur les phrases qui
défilent au scroll. Aujourd'hui elles sont en blanc (`css/main.css` ligne 159).

**C'est une modification purement CSS. Aucune ligne de `js/hero.js` ne bouge.**

On garde la Fraunces italique — ce n'est pas un compromis, c'est le bon choix : les
vrais néons du bar sont en écriture cursive (`neon-tequila`, l'enseigne de façade).
Une italique qui brille en bleu, c'est exactement un néon du Barrel. Passer le hero
en capitales Archivo comme les murs de néons casserait la respiration entre le hero
et le reste.

```css
.cue p{
  font-family:var(--serif);font-style:italic;font-weight:400;
  font-size:clamp(30px,5.6vw,82px);line-height:1.12;letter-spacing:-.01em;
  color:#dfeeff;
  text-shadow:
    0 0 10px rgba(0,163,255,.85),
    0 0 30px rgba(43,92,255,.65),
    0 0 62px rgba(43,92,255,.42),
    0 2px 40px rgba(0,0,0,.9);   /* on garde une ombre noire : lisibilité sur photo claire */
}
```

Trois règles à respecter :

- **`text-shadow`, jamais `filter: drop-shadow()`.** Le hero est pinné et scrubbé sur
  un canvas ; un filtre sur du texte au-dessus force une nouvelle couche de
  composition à chaque frame.
- **Aucune animation de scintillement dans le hero.** Le `neonFlicker` reste réservé
  aux murs de néons. Dans le hero, le texte apparaît et disparaît déjà — deux
  mouvements simultanés, c'est un mouvement de trop.
- La dernière ombre noire n'est pas décorative : les premières frames sont la
  Croisette en plein jour, un texte bleu clair sans ombre y devient illisible.
  **Vérifier la lisibilité sur la frame 001 et sur la frame 227**, pas seulement au
  milieu.

`.ov-sub--serif` est en or (`--or`) ligne 175. La laisser telle quelle : c'est ce qui
donne au bleu sa valeur de contraste.

---

## §4 · LA PHRASE DU CHIEN DANS LE HERO

`index.html` ligne 119 : `La première, / c'est la meilleure.` remplacée par
`Le chien, lui, / t'attendait.` La cliente ne comprend toujours pas — le chien n'est
pas encore apparu à ce moment du récit, la phrase arrive sans référent.

**Remplacement retenu :**

```html
<p><span class="ov-line"><span>Tu es exactement</span></span><span class="ov-line"><span>là où il faut.</span></span></p>
```

C'est la traduction du néon `YOU ARE EXACTLY WHERE YOU NEED TO BE`, qui est
**physiquement visible dans la frame à ce moment-là**, sur le mur de gauche au-dessus
de la bibliothèque. Le texte nomme ce que l'image montre déjà. Et il annonce le mur
de néons qui arrive plus loin.

Deux lignes, même longueur, même rythme : aucun impact sur le timing des overlays.

Deux replis si elle préfère : `Personne / ne t'a vu entrer.` ou `Et là, / tu es dedans.`

---

## §5 · LE TATOUEUR

`index.html` ligne 348 : `<li><b>Tatoueur résident</b>…</li>`

Le brief V2.2 demandait de ne pas utiliser cette photo tant que la cliente n'avait
pas confirmé s'il s'agit d'un rendez-vous récurrent ou d'un soir unique. La mention
« résident » affirme une récurrence qui n'est pas vérifiée.

**Retirer la ligne** jusqu'à confirmation écrite d'Eva. Une prestation annoncée qui
n'existe pas est une réclamation client, et en jury c'est une faute de contenu.

---

## §6 · CHECKLIST AVANT DE RENDRE

- [ ] Plus aucun demi-écran vide entre les néons et le programme, vérifié à l'écran.
- [ ] La photo de la motarde est cadrée sur la personne, en un seul bloc lisible.
- [ ] Le troisième néon ne dit plus « fuck nudes ». La phrase n'apparaît qu'une fois
      dans toute la page.
- [ ] Le texte du hero brille en bleu et reste lisible sur la frame 001 (Croisette,
      plein jour) comme sur la frame 227.
- [ ] Aucun scintillement dans le hero.
- [ ] `git diff js/hero.js` est vide.
- [ ] Console propre sur les quatre pages.
- [ ] Aucune autre modification que celles listées ici.
