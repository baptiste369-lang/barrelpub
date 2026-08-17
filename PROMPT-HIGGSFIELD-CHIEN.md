# Animer le chien — trois plans, et ce qu'ils servent

Le premier prompt était trop prudent. J'ai écrit une consigne anti-bug au lieu d'un
plan de cinéma : un chien qui cligne des yeux, ça ne raconte rien et ça ne justifie
pas le poids d'une vidéo sur la page. Tu as raison.

Voici trois plans qui ont chacun **un rôle précis dans le site**. Le mouvement n'est
pas là pour faire joli, il est là pour faire passer le visiteur d'un endroit à un autre.

**Image source pour les trois :** `assets/photos/chien-billard-debout.webp` (1362 × 1600).
Le chien fauve, harnais noir, assis sur le tapis léopard, vu en légère plongée, la
tête levée vers l'objectif. Devant lui le triangle de billes, la queue en diagonale,
la plaque « BLACK BALL LIVE » en bas.

---

## PLAN A — La plongée dans l'œil · **c'est celui que je te recommande**

**Ce que ça sert :** c'est la transition d'entrée du chapitre 02. La caméra descend
vers le chien, entre dans son œil, l'iris ambré remplit l'écran, et le noir de la
pupille devient le fond du chapitre suivant. Le visiteur passe littéralement
**à travers le chien** pour entrer dans le bar. C'est ça, « le chien te fait entrer ».

C'est aussi le seul des trois qui se marie avec le scroll : la vidéo se scrube sur la
progression du scroll, et quand la pupille a mangé l'écran, la section suivante est
déjà là. Aucune coupe visible.

```
Cinematic slow push-in on a fawn Staffordshire bull terrier wearing a black harness,
sitting on a leopard-print pool table in a dark pub lit by deep blue neon, head raised
toward the lens. The camera moves forward in one continuous smooth dolly, straight
toward the dog's face, then continues into an extreme close-up of his right eye until
the amber iris fills the entire frame and the black pupil takes over the screen.
The dog stays perfectly still and holds the gaze the whole time. Shallow depth of
field increasing as the camera approaches. Blue neon rim light on the fur, warm amber
reflection in the eye. Photographic realism, natural film grain, no stylisation.
Ends on pure black.
```

**Negative :**
```
dog moving away, dog standing up, dog turning head away, mouth opening, tongue out,
melting muzzle, morphing eye, changing iris colour, rolling billiard balls, moving cue
stick, warping leopard pattern, camera shake, handheld, jitter, whip pan, text,
watermark, cartoon, 3D render, oversaturation
```

**Durée :** 4 à 6 s. Pas de boucle — ce plan a une fin, c'est le noir.

---

## PLAN B — L'orbite autour de la table

**Ce que ça sert :** le moment où le site dit que ce chien est le patron des lieux.
La caméra tourne lentement autour du billard, le chien reste au centre et **suit la
caméra du regard**. Le tapis léopard défile, les néons bleus balayent le pelage. Ça
donne du volume à une photo qui était plate, et ça montre la salle autour.

À utiliser en boucle courte, dans le chapitre 02, à la place de la photo fixe.

```
Cinematic slow orbital camera move around a fawn Staffordshire bull terrier wearing a
black harness, sitting at the centre of a leopard-print pool table in a dark pub lit
by deep blue neon. The camera arcs smoothly to the right around the table, revealing
the room behind: dark walls, blue neon glow, bar in the background. The dog stays
seated at the centre and slowly turns his head to keep following the camera with his
eyes. Parallax between the dog, the table and the background. Locked height, no
vertical movement. Photographic realism, natural film grain, shallow depth of field.
Seamless loop: the last frame matches the first.
```

**Negative :** même liste que le plan A, plus `dog leaving the table, background
morphing into new furniture, duplicated bar, floating objects`.

**Durée :** 5 à 8 s, boucle activée. L'orbite ne doit pas dépasser 30 à 40 degrés —
au-delà, le modèle invente une pièce qui n'existe pas.

---

## PLAN C — La descente

**Ce que ça sert :** l'ouverture du chapitre. La caméra part du plafond, descend le
long du billard et vient se poser à hauteur du chien, qui lève la tête au moment où
elle arrive. C'est le plan le plus « arrivée dans le lieu » des trois.

```
Cinematic crane-down shot in a dark pub lit by deep blue neon. The camera starts high
above a leopard-print pool table, looking down, and descends smoothly and slowly until
it reaches eye level with a fawn Staffordshire bull terrier wearing a black harness,
sitting on the table. As the camera arrives, the dog raises his head and looks
straight into the lens. The billiard balls, the rack and the cue stay perfectly still
throughout. Blue neon rim light, warm fur. Photographic realism, natural film grain,
no stylisation.
```

**Durée :** 4 à 6 s. Pas de boucle, ou boucle avec un fondu — la fin ne raccorde pas
naturellement au début.

---

## Ce qu'il faut savoir avant de lancer

**Un mouvement de caméra oblige le modèle à inventer.** Dès qu'on avance, qu'on tourne
ou qu'on descend, il doit fabriquer des pixels qui n'existent nulle part dans la photo :
le côté du chien, le fond de la salle, le dessous de la table. C'est là que ça casse.
Concrètement : sur les plans B et C, génère **trois ou quatre variantes** et garde la
meilleure. Sur le plan A, une ou deux suffisent, parce qu'on avance dans ce qui est
déjà visible.

Si l'outil propose un **préréglage de mouvement de caméra** (dolly in, orbit, crane
down), utilise-le plutôt que de tout confier au texte : le mouvement sera net et
régulier, et le modèle gardera son énergie pour le sujet.

**Le triangle de billes reste le premier truc à vérifier.** Un modèle vidéo adore
faire rouler des billes bien rangées. Sur le plan A ça ne se voit pas, sur les plans
B et C, si une bille bouge, la prise est morte.

Et **le regard**. Sur les trois plans, ce qui fait la valeur de l'image, c'est que le
chien ne lâche pas l'objectif. S'il regarde ailleurs à un moment, même une demi-seconde,
recommence — c'est tout le propos qui tombe.

---

## Côté site, quand la vidéo sera prête

Ce n'est pas dans le lot en cours, et ça ne touche pas au hero.

Le plan A se comporte différemment des deux autres : il n'est pas en lecture
automatique, il est **piloté par le scroll**. La vidéo est chargée en mémoire et on
déplace `currentTime` en fonction de la progression de la section — même principe que
le hero, mais sur une vidéo au lieu d'un canvas de frames. Prévoir un repli propre :
sur mobile et sous `prefers-reduced-motion`, on joue simplement la vidéo une fois en
automatique, sans scrub.

Pour les trois, dans tous les cas : **WebM/AV1 avec repli MP4**, sous 1,5 Mo,
`muted playsinline preload="none"`, et un `poster` qui est exactement
`chien-billard-debout.webp` — tant que la vidéo n'est pas chargée, on voit la photo,
jamais un carré noir. Lecture déclenchée à l'entrée dans le viewport, pause à la sortie
et sur `visibilitychange`. Sous `prefers-reduced-motion`, la photo seule.

Et si l'idée est de brancher ça sur le logo tête de chien interactif : la vidéo reste
dans le chapitre 02, le logo garde son SVG. Un SVG de 32 ko dans la barre de navigation
ne se remplace pas par une vidéo.
