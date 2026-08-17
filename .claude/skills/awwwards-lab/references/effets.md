# Les 12 effets — code, coût, porte de sortie

Prérequis commun : GSAP + ScrollTrigger + CustomEase + Lenis vendorisés localement (~90 ko gzip). **Aucune autre lib.**

## Le socle : un seul rAF

Tout part de là. Chaque effet s'abonne, aucun n'ouvre sa propre boucle.

```js
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const COARSE = matchMedia('(pointer: coarse)').matches;

let lenis = null, tries = 0;
(function boot(){
  if (++tries > 40) { try { ScrollTrigger.refresh(); } catch(e){} return; }
  if (!window.Lenis || !window.gsap || !window.ScrollTrigger) return setTimeout(boot, 125);
  if (RM) return;
  lenis = new Lenis({ lerp: 0.11 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  ScrollTrigger.refresh();
})();

const subs = new Set();
gsap.ticker.add(() => { if (document.hidden) return; for (const f of subs) f(); });
const onTick = f => subs.add(f);
```

## Le socle bis : l'IO de reveal

Sous une section pinnée, c'est la seule façon sûre de déclencher quoi que ce soit.

```js
const io = new IntersectionObserver(es => {
  for (const e of es) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
}, { threshold: 0.05, rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));
```

Sans IntersectionObserver ou en reduced-motion : ajoute `.is-in` à tout, immédiatement.

---

## 1. Split-text line reveal
**Coût :** faible. **Porte de sortie :** reduced-motion → fade 200 ms.

Découper **une seule fois au `load`**, jamais au scroll — sinon reflow en boucle. Le texte réel reste dans le DOM.

```js
function splitLines(el){
  const words = el.textContent.trim().split(/\s+/);
  el.textContent = '';
  words.forEach((w,i) => {
    const s = document.createElement('span');
    s.className = 'w'; s.textContent = w + (i < words.length-1 ? ' ' : '');
    el.appendChild(s);
  });
  // regrouper par offsetTop : chaque ligne devient un .line > span
  const spans = [...el.querySelectorAll('.w')];
  const lines = []; let top = null, cur = null;
  for (const s of spans){
    if (s.offsetTop !== top){ top = s.offsetTop; cur = []; lines.push(cur); }
    cur.push(s);
  }
  el.textContent = '';
  for (const l of lines){
    const wrap = document.createElement('span'); wrap.className = 'line';
    const inner = document.createElement('span');
    l.forEach(s => inner.appendChild(s));
    wrap.appendChild(inner); el.appendChild(wrap);
  }
}
```
```css
.line { display:block; overflow:hidden; }
.line > span { display:block; transform:translateY(100%);
  transition: transform .9s cubic-bezier(.625,.05,0,1); }
.is-in .line > span { transform:none; }
.is-in .line:nth-child(2) > span { transition-delay:.07s; }
.is-in .line:nth-child(3) > span { transition-delay:.14s; }
```

## 2. Text scramble
**Coût :** négligeable. **Porte de sortie :** reduced-motion → texte final direct. **Jamais sur un `h1`/`h2`.**

```js
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\|—•';
function scramble(el){
  const final = el.dataset.text || el.textContent;
  if (RM) { el.textContent = final; return; }
  let f = 0; const MAX = 28;
  (function step(){
    f++;
    const settled = Math.floor(final.length * (f / MAX));
    let out = final.slice(0, settled);
    for (let i = settled; i < final.length; i++)
      out += final[i] === ' ' ? ' ' : CHARS[(Math.random()*CHARS.length)|0];
    el.textContent = out;
    if (f < MAX && !document.hidden) requestAnimationFrame(step);
    else el.textContent = final;
  })();
}
```

## 3. Marquee à vélocité de scroll
**Coût :** négligeable. **Porte de sortie :** reduced-motion → statique.

Contenu dupliqué ×2. `will-change: transform` sur la piste **uniquement**, pas sur les enfants.

```js
let vel = 0, x = 0;
if (lenis) lenis.on('scroll', e => { vel = e.velocity; });
const w = track.scrollWidth / 2;
onTick(() => {
  x -= (0.6 + Math.min(Math.abs(vel) * 0.09, 4)) * Math.sign(vel || 1);
  if (x <= -w) x += w; if (x > 0) x -= w;
  track.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
});
```

## 4. Curseur custom + magnétique
**Coût :** faible. **Porte de sortie :** `pointer: coarse` ou reduced-motion → aucun curseur custom, on garde le curseur natif.

Une seule boucle, avec sortie sur inactivité.

```js
if (!COARSE && !RM){
  let cx=-100, cy=-100, tx=-100, ty=-100, raf=null, idle=0;
  addEventListener('mousemove', e => {
    tx = e.clientX; ty = e.clientY; idle = 0;
    const btn = document.elementFromPoint(tx,ty)?.closest('[data-magnetic]');
    if (btn){ const r = btn.getBoundingClientRect();
      const dx = r.left + r.width/2 - tx, dy = r.top + r.height/2 - ty;
      if (Math.hypot(dx,dy) < 80){ tx += dx*0.55; ty += dy*0.55;
        btn.style.transform = `translate(${-dx*0.3}px,${-dy*0.3}px)`; }
      else btn.style.transform = '';
    }
    if (!raf) raf = requestAnimationFrame(loop);
  }, { passive:true });

  function loop(){
    cx += (tx-cx)*0.28; cy += (ty-cy)*0.28;
    cursor.style.transform = `translate(${cx.toFixed(1)}px,${cy.toFixed(1)}px)`;
    if (Math.abs(tx-cx) < .2 && Math.abs(ty-cy) < .2) idle++; else idle = 0;
    if (idle > 40 || document.hidden){ raf = null; return; }   // sortie
    raf = requestAnimationFrame(loop);
  }
}
```

Label contextuel : `document.body.classList.toggle('is-link', !!e.target.closest('a,button,[data-cursor]'))` sur `mouseover`.

## 5. Vignette qui suit le curseur
**Coût :** faible. **Porte de sortie :** mobile et clavier → image en bloc statique sous la ligne active, animée en `@starting-style`.

**Une seule `<img>` réutilisée**, dont on change le `src` — pas N images empilées dans le DOM.

```js
rows.forEach(row => {
  row.addEventListener('mouseenter', () => {
    if (COARSE) return;
    thumb.src = row.dataset.img; thumb.classList.add('is-on');
  });
  row.addEventListener('mouseleave', () => thumb.classList.remove('is-on'));
  row.addEventListener('focus', () => row.classList.add('show-static'));
  row.addEventListener('blur',  () => row.classList.remove('show-static'));
});
onTick(() => {
  if (!thumb.classList.contains('is-on')) return;
  ix += (tx-ix)*0.14; iy += (ty-iy)*0.14;
  const rot = Math.max(-8, Math.min(8, (tx-ix)*0.4));
  thumb.style.transform = `translate(${ix}px,${iy}px) rotate(${rot}deg)`;
});
```

## 6. Grain animé
**Coût :** quasi nul si fait correctement. **Piège majeur :** `feTurbulence` SVG animé en continu détruit le framerate. Utiliser un **WebP tileable de 128 px**.

```css
.grain{ position:fixed; inset:0; pointer-events:none; z-index:9999;
  background:url(grain-128.webp) repeat; opacity:.045;
  mix-blend-mode:overlay; animation:g .8s steps(8) infinite; }
@keyframes g{ 0%{background-position:0 0} 100%{background-position:128px 128px} }
@media (prefers-reduced-motion:reduce){ .grain{ animation:none } }
```

## 7. Néon glow + grésillement
**Coût :** moyen — `filter` force une couche de peinture. **Deux éléments à l'écran au maximum.**

Les vrais tubes néon ne clignotent pas en rythme : keyframes non linéaires, salve courte, jamais en boucle permanente.

```css
.neon{ color:#EDE8E0;
  text-shadow:0 0 8px #00A3FF, 0 0 24px #2B5CFF, 0 0 60px #2B5CFF80;
  animation:flick 9s infinite; }
@keyframes flick{
  0%,88%,100%{opacity:1} 89%{opacity:.35} 90.5%{opacity:1}
  91%{opacity:.5} 92%{opacity:1} 93.5%{opacity:.7} 94%{opacity:1} }
```

## 8. Glitch RGB-split
**Coût :** faible si limité à de courtes salves déclenchées à l'entrée en viewport, jamais en boucle.

```css
.glitch.is-in{ animation:gl .11s steps(2) 3; }
@keyframes gl{
  0%{ text-shadow:3px 0 #2B5CFF, -3px 0 #C9A24B; clip-path:inset(0 0 62% 0) }
  50%{ text-shadow:-3px 0 #2B5CFF, 3px 0 #C9A24B; clip-path:inset(58% 0 0 0) }
  100%{ text-shadow:none; clip-path:none } }
```

## 9. Skew de vélocité
**Coût :** faible. **Porte de sortie :** reduced-motion → rien. **Ne jamais l'appliquer aux photos de produit ni aux blocs d'informations pratiques.**

Clamper à ±3,5° pour du sobre, ±6° pour du démonstratif.

```js
onTick(() => {
  const s = Math.max(-3.5, Math.min(3.5, vel * 0.35));
  sections.forEach(el => el.style.transform = `skewY(${s.toFixed(2)}deg)`);
});
```

## 10. Parallaxe d'image
**Coût :** faible. Plafonner à 4-5 couches, et le déplacement à ±60 px.

Conteneur en `overflow: hidden`, image légèrement plus grande que lui.

```js
onTick(() => {
  const r = box.getBoundingClientRect();
  if (r.bottom < 0 || r.top > innerHeight) return;      // hors viewport : on saute
  const p = (r.top + r.height/2 - innerHeight/2) / innerHeight;
  img.style.transform = `translate3d(0,${(p * -60).toFixed(1)}px,0)`;
});
```

Variante « regard soutenu » : facteur négatif très faible (0,88× la vitesse du scroll) sur une seule image forte du site. Le sujet semble rester fixe pendant que la page glisse autour de lui. Très efficace, à n'utiliser qu'une fois.

## 11. Compteur odomètre
**Coût :** négligeable. **Porte de sortie :** reduced-motion → valeur finale directe.

Chaque chiffre est une colonne 0-9 translatée, `font-variant-numeric: tabular-nums`, décalage de 60 ms par colonne de gauche à droite. Déclenché par IO à `threshold: 0.6`, `unobserve` après.

Version texte simple, avec rAF borné :
```js
function count(el){
  const target = +el.dataset.count || 0;
  if (RM){ el.textContent = target; return; }
  let t0 = null, frames = 0;
  requestAnimationFrame(function step(ts){
    if (!t0) t0 = ts;
    const k = Math.min((ts-t0)/1400, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1-k, 4)));
    if (k < 1 && ++frames < 200 && !document.hidden) requestAnimationFrame(step);
    else el.textContent = target;
  });
}
```

## 12. Canvas scrubbé (séquence d'images)
**Coût :** le plus lourd du lot. La technique Apple : une séquence WebP dessinée sur `<canvas>`, jamais une `<video>` scrubbée (le seek est saccadé et ne tient pas sur iOS).

**Le failsafe est non négociable** — il s'arme avant tout le reste, et chaque sortie anticipée déverrouille.

```js
const unlock = () => { document.documentElement.classList.remove('is-locked');
  document.getElementById('preloader')?.classList.add('is-done'); };
setTimeout(unlock, 5000);                          // quoi qu'il arrive
if (RM) { unlock(); return; }
const canvas = document.getElementById('c'); if (!canvas) { unlock(); return; }
const ctx = canvas.getContext('2d');   if (!ctx)    { unlock(); return; }
if (!window.gsap || !window.ScrollTrigger) { unlock(); return; }
```

Le **bug qui coûte une journée** : un canvas peut mesurer 0 × 0 à l'init (onglet en arrière-plan, pane masqué, barre d'URL mobile en cours d'animation). Créer le pin à ce moment-là le fige sur des mesures nulles : écran noir, scroll bloqué, **aucune erreur en console**. Parade — polling borné avant de créer le pin :

```js
let initTries = 0, inited = false;
function initScroll(){
  if (inited) return;
  if (!innerHeight || !canvas.clientHeight){
    if (initTries++ < 40) return setTimeout(initScroll, 150);
    return unlock();
  }
  inited = true;
  gsap.to(state, { p:1, ease:'none', onUpdate:render, scrollTrigger:{
    trigger:'#hero', start:'top top',
    end: () => '+=' + Math.round(innerHeight * 5.5),
    pin:true, scrub:0.8, invalidateOnRefresh:true }});
}
function onViewportMaybeValid(){
  if (!innerHeight) return;
  if (!inited){ initTries = 0; initScroll(); }
  resizeCanvas();
  try { ScrollTrigger.refresh(); } catch(e){}
}
addEventListener('resize', onViewportMaybeValid);
document.addEventListener('visibilitychange', onViewportMaybeValid);
```

Même logique de polling borné dans `resizeCanvas()`. Et sur le préchargement : `img.onerror = onImageSettled` autant que `img.onload` — **une frame manquante ne doit jamais bloquer la page.**

DPR clampé par la résolution réelle des frames : `Math.min(devicePixelRatio||1, 2, 1920/w)`.

## 13. Section à scroll horizontal
**Coût :** moyen, le pin provoque un reflow. **C'est l'effet le plus risqué du point de vue du jury.**

- Le pin ne dépasse **jamais ~260 vh**.
- Une ancre doit pouvoir sauter la section entière.
- Sur mobile : pas de pin, on repasse en `scroll-snap-type: x mandatory` natif.
- Sous une section déjà pinnée : pas de ScrollTrigger — `position: sticky` natif + `getBoundingClientRect()` dans le ticker global.

Si ce n'est pas parfaitement fluide en test, **le remplacer par une grille classique.** Un carrousel mal fichu coûte plus cher qu'il ne rapporte.
