/* =====================================================================
   BARREL PUB — dj-viz.js (V3.4)
   Le spectre en néon bleu, à droite du DJ, dans le chapitre 03.

   POURQUOI IL EXISTE : à droite de la photo du DJ, sur grand écran, il y
   avait 400 à 520 px de noir vide sur toute la hauteur de la figure. On ne
   le comble pas avec une photo de plus — le reproche de départ était « trop
   chargé ». On le comble avec du code : aucun octet d'image, aucune
   dépendance, et la cabine a l'air de tourner pendant qu'on regarde.

   LES CINQ RÈGLES DU PROJET, TENUES :
   · js/hero.js n'est pas touché ; il possède l'unique boucle rAF de la page.
   · Aucun rAF nouveau : on s'abonne au gsap.ticker, qui EST cette boucle.
   · Aucun déclencheur de défilement GSAP — on est sous le hero épinglé, et un
     tel déclencheur y mesurerait des positions fausses. IntersectionObserver.
   · Aucune dépendance : ni Web Audio ni AnalyserNode. Il n'y a pas de son
     sur la page, et en demander un ouvrirait une autorisation navigateur
     pour une décoration.
   · Porte de sortie : prefers-reduced-motion, hors écran, onglet caché.

   SANS CE FICHIER (ou sans JS), .dj-viz reste un rectangle --noir-2 avec son
   label mono en bas. C'est propre et volontaire.
   ===================================================================== */
(function () {
  "use strict";

  var host = document.querySelector("[data-dj-viz]");
  if (!host) return;                                  // pas ce gabarit de page
  var cv = host.querySelector(".dj-viz__c");
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext("2d");
  if (!ctx) return;                                   // contexte 2D indisponible
  var G = window.gsap;
  if (!G || !G.ticker) return;                        // pas de ticker, pas de boucle

  var N = 24;                       // barres
  var BEAT = 60 / 124;              // 124 BPM, comme le dit le label
  var peaks = new Float32Array(N);  // les caps de crête, persistants
  var w = 0, h = 0, grad = null;
  var last = 0, resync = true, running = false, visible = false;
  var reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------------------------------------------------------------
     LE SIGNAL — synthétisé, jamais tiré au hasard.
     Un Math.random() par frame donnerait un grésillement : cher à l'œil,
     et qui ne ressemble à rien de musical. Ici trois oscillateurs de
     périodes non commensurables (2.10 / 3.37 / 5.11) — le motif ne se
     répète jamais à l'œil — sous une enveloppe de fréquence qui fait
     monter les graves à gauche, plus un kick à chaque temps.
     --------------------------------------------------------------- */
  function bar(x, t) {
    var env = 0.30 + 0.70 * Math.pow(1 - x, 1.55);
    var osc = 0.50 + 0.28 * Math.sin(t * 2.10 + x * 7.3)
                   + 0.16 * Math.sin(t * 3.37 + x * 13.1 + 1.7)
                   + 0.10 * Math.sin(t * 5.11 + x * 21.7 + 3.9);
    var p = (t % BEAT) / BEAT;                 // 0 au down-beat, 1 juste avant
    var kick = Math.exp(-p * 6.2) * (1 - x) * 0.55;   // attaque nette, chute exp
    return Math.min(1, Math.max(0.04, env * osc + kick));
  }

  /* ---------------------------------------------------------------
     LE DESSIN — grille, barres, caps. Dans cet ordre.
     --------------------------------------------------------------- */
  function draw(t, dt) {
    if (w < 2 || h < 2) return;       // le piège du canvas 0×0 : on ne peint pas
    ctx.clearRect(0, 0, w, h);

    /* 1 · la grille de fond, statique : elle donne l'échelle et empêche le
          bloc de flotter dans le noir. */
    ctx.fillStyle = "rgba(122,127,136,.10)";
    for (var g = 1; g <= 7; g++) ctx.fillRect(0, Math.round(h * g / 8), w, 1);

    /* 2 · les barres. Gouttière = 40 % de la largeur d'une barre. */
    var bw = w / (N * 1.4 - 0.4);
    var step = bw * 1.4;
    for (var i = 0; i < N; i++) {
      var x = i / (N - 1);
      var v = bar(x, t);
      var bh = v * h;
      var bx = i * step;

      ctx.fillStyle = grad;
      ctx.fillRect(bx, h - bh, bw, bh);

      /* au-delà de 0.86, la barre sature : ses 12 derniers pour cent passent
         en or. C'est le seul endroit de l'animation où l'or sert. */
      if (v > 0.86) {
        ctx.fillStyle = "#C9A24B";
        ctx.fillRect(bx, h - bh, bw, bh * 0.12);
      }

      /* 3 · le cap de crête : attaque instantanée, chute lente. C'est ce
         détail — et lui seul — qui fait croire à un vrai VU mètre plutôt
         qu'à des barres qui gigotent au hasard. */
      if (v > peaks[i]) peaks[i] = v;
      else peaks[i] = Math.max(peaks[i] - 0.55 * dt, v);
      var cy = Math.min(Math.max(h - peaks[i] * h, 0), h - 2);
      ctx.fillStyle = "rgba(237,232,224,.7)";
      ctx.fillRect(bx, cy, bw, 2);
    }
  }

  /* une seule image, arrêtée sur un instant qui a l'air d'un spectre —
     pas un rectangle vide. Sert au premier peint et au mouvement réduit. */
  function still() { draw(0.7, 0); }

  /* ---------------------------------------------------------------
     LE DIMENSIONNEMENT — dans le ResizeObserver, jamais avant.
     Le bloc est hors écran au chargement : lire sa boîte trop tôt donne un
     canvas 0×0 qui dessine dans le vide, sans lever la moindre erreur.
     Le premier dessin part donc de l'observateur.
     --------------------------------------------------------------- */
  function measure(nw, nh) {
    w = nw; h = nh;
    if (w < 2 || h < 2) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);   // plafonné à 2 :
    cv.width  = Math.round(w * dpr);                       // au-delà on peint
    cv.height = Math.round(h * dpr);                       // quatre fois plus
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);                // de pixels pour rien
    /* le dégradé est recréé ICI et mis en cache : pas un par frame, pas un
       par barre. C'est la seule allocation de tout le fichier. */
    grad = ctx.createLinearGradient(0, h, 0, 0);
    grad.addColorStop(0, "#2B5CFF");                       // --bleu, en bas
    grad.addColorStop(1, "#00A3FF");                       // --bleu-clair, en haut
    still();
  }

  /* ---------------------------------------------------------------
     LA BOUCLE — celle de hero.js, empruntée. Aucune autre.
     --------------------------------------------------------------- */
  function tick(t) {
    if (resync) { resync = false; last = t; }   // onglet revenu : pas de dt de 30 s
    var dt = Math.min(Math.max(t - last, 0), 1 / 20);
    last = t;
    draw(t, dt);
  }

  function sync() {
    var want = visible && !document.hidden && !reduceMQ.matches;
    if (want === running) return;
    running = want;
    if (want) { resync = true; G.ticker.add(tick); }
    else { G.ticker.remove(tick); }
  }

  if ("ResizeObserver" in window) {
    new ResizeObserver(function (entries) {
      var r = entries[0].contentRect;
      measure(r.width, r.height);
    }).observe(host);
  } else {
    var fallback = function () { var r = host.getBoundingClientRect(); measure(r.width, r.height); };
    window.addEventListener("resize", fallback);
    fallback();
  }

  /* hors écran, la boucle s'arrête : un canvas à 60 fps trois écrans plus
     haut, c'est de la batterie brûlée pour personne. */
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      sync();
    }, { threshold: 0, rootMargin: "200px 0px" }).observe(host);
  } else {
    visible = true; sync();
  }

  document.addEventListener("visibilitychange", function () { resync = true; sync(); });

  /* mouvement réduit : on ne s'abonne jamais au ticker, et l'image fixe
     reste. La préférence peut changer en cours de session. */
  var onMQ = function () { sync(); still(); };
  if (reduceMQ.addEventListener) reduceMQ.addEventListener("change", onMQ);
  else if (reduceMQ.addListener) reduceMQ.addListener(onMQ);
})();
