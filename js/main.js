/* =====================================================================
   BARREL PUB — main.js (v2.1)
   Toutes les animations sous le hero. RÈGLES :
   · hero.js n'est jamais touché ; il possède le rAF (gsap.ticker + Lenis).
   · Aucun ScrollTrigger ici, SAUF le parcours de privatisation.html (V5.1) : page
     sans hero ni épinglage concurrent. Partout ailleurs, IntersectionObserver ou le
     ticker global.
   · Une seule boucle continue : on s'abonne au gsap.ticker, sinon rien.
   · Chaque effet a sa porte de sortie (reduced-motion, coarse, document.hidden).
   ===================================================================== */
(function () {
  "use strict";

  var mm = function (q) { return window.matchMedia(q).matches; };
  var REDUCE = mm("(prefers-reduced-motion: reduce)");
  var COARSE = mm("(pointer: coarse)");
  var FINE   = mm("(min-width: 1024px)");
  var G = window.gsap || null;
  var lenis = window.__barrelLenis || null;
  // V5.1 — privatisation.html n'a pas de hero.js : le parcours a besoin de Lenis et de
  // ScrollTrigger. Même montage que hero.js (Lenis dans le gsap.ticker, aucune seconde
  // boucle rAF), seulement sur la page qui porte #parcours et hors mouvement réduit.
  if (!lenis && G && window.Lenis && window.ScrollTrigger && !REDUCE && document.getElementById("parcours")) {
    G.registerPlugin(window.ScrollTrigger);
    lenis = new window.Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.4 });
    lenis.on("scroll", window.ScrollTrigger.update);
    G.ticker.add(function (t) { lenis.raf(t * 1000); });
    window.__barrelLenis = lenis;
  }

  var q  = function (s, r) { return (r || document).querySelector(s); };
  var qa = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : (v > b ? b : v); };
  var lerp  = function (a, b, t) { return a + (b - a) * t; };

  /* ---------- vélocité de scroll (Lenis) + lissage ---------- */
  var rawVel = 0, smoothVel = 0;
  if (lenis && lenis.on) lenis.on("scroll", function (e) { rawVel = (e && e.velocity) || 0; });

  /* ---------- boucle unique : abonnés du gsap.ticker (rAF = hero.js) ---------- */
  var frameFns = [];
  function onFrame(fn) { frameFns.push(fn); }
  function runFrame() {
    if (document.hidden) return;
    smoothVel = lerp(smoothVel, rawVel, 0.12);
    rawVel *= 0.9; // relaxation quand le scroll s'arrête
    for (var i = frameFns.length - 1; i >= 0; i--) {
      if (frameFns[i]() === false) frameFns.splice(i, 1);
    }
  }
  function startLoop() {
    if (G && G.ticker) { G.ticker.add(runFrame); }
    else if (!REDUCE) { (function raf() { runFrame(); requestAnimationFrame(raf); })(); }
  }

  /* =====================================================================
     V2.4 §2 — L'ÉCRAN D'ENTRÉE
     Habillage du préchargeur existant. UN SEUL mécanisme de verrouillage dans la
     page : la classe is-locked, posée par le HTML et retirée par reveal() de
     hero.js. Ce bloc ne pose JAMAIS is-locked et ne touche à aucun état de hero.js.

     Les trois conditions du cahier des charges, tenues ici :
     1. La libération à 4 s n'a lieu QUE si le ScrollTrigger du hero existe déjà —
        sinon on libérerait le scroll avant que le pin existe, et la page saute.
        Si le trigger n'est pas là, on attend ; le failsafe 7 s de hero.js reprend
        la main. Le bouton PASSER, lui, est une action explicite de l'utilisateur :
        il libère tout de suite (§2.4, « personne ne doit être prisonnier »).
     2. Les 60 premières frames sont comptées DE L'EXTÉRIEUR, via un
        PerformanceObserver sur les entrées `resource` contenant `frames/`.
        On observe, on ne pilote pas : hero.js reste seul maître de son
        préchargement et continue de charger les 227 frames derrière.
     3. Le point de sortie retire is-locked et marque le préchargeur terminé.
        Rien d'autre.
     ===================================================================== */
  (function () {
    var loader = q("#loader");
    if (!loader) return;

    var bar   = q("#entryBar");
    var pct   = q("#entryPct");
    var fill  = q("#entryFill");
    var ready = q("#entryReady");
    var copy  = q("#entryCopy");
    var skip  = q("#entrySkip");

    var HARD_CAP = 4000;      // §2.4 — plafond dur
    var FRAMES_TARGET = 60;   // §2.3 — 60 frames suffisent pour démarrer

    // §2.4 — « une seule fois par session », sans sessionStorage (interdit par le
    // projet) et sans variable mémoire (elle serait remise à zéro au rechargement).
    // On regarde d'où vient le visiteur : s'il arrive d'une autre page du site, il
    // a déjà vu l'accueil complet. On garde le verrou et la progression — seul le
    // texte de bienvenue saute, et le voile part vite puisque tout est en cache.
    var fromSite = false;
    try {
      fromSite = !!document.referrer &&
                 new URL(document.referrer).origin === location.origin;
    } catch (e) {}
    if (fromSite && copy) copy.hidden = true;

    /* ---------- progression pondérée (§2.3) : 60 / 20 / 20 ---------- */
    var wFrames = 0, wFonts = 0, wImgs = 0, shown = -1, released = false;

    function paint() {
      var p = Math.round(wFrames * 60 + wFonts * 20 + wImgs * 20);
      if (p > 100) p = 100;
      if (p === shown) return;
      shown = p;
      if (bar)  bar.style.width = p + "%";
      if (pct)  pct.textContent = (p < 10 ? "0" : "") + p;
      if (fill) fill.style.clipPath = "inset(" + (100 - p) + "% 0 0 0)";
      if (p >= 100) finish();
    }

    // (2) on OBSERVE les frames, on ne les pilote pas
    var seen = 0;
    if ("PerformanceObserver" in window) {
      try {
        var po = new PerformanceObserver(function (list) {
          list.getEntries().forEach(function (en) {
            if (en.name && en.name.indexOf("frames/") !== -1) seen++;
          });
          wFrames = clamp(seen / FRAMES_TARGET, 0, 1);
          paint();
          if (wFrames >= 1) { try { po.disconnect(); } catch (e) {} }
        });
        po.observe({ type: "resource", buffered: true });
      } catch (e) { wFrames = 1; }
    } else { wFrames = 1; }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { wFonts = 1; paint(); });
    } else { wFonts = 1; }

    // images du premier écran après le hero
    var firstImgs = qa("#scene-seuil img");
    if (!firstImgs.length) { wImgs = 1; }
    else {
      var done = 0;
      firstImgs.forEach(function (im) {
        if (im.complete) { done++; return; }
        var bump = function () { done++; wImgs = done / firstImgs.length; paint(); };
        im.addEventListener("load", bump, { once: true });
        im.addEventListener("error", bump, { once: true });
      });
      wImgs = done / firstImgs.length;
    }
    paint();

    /* ---------- (3) le point de sortie : deux gestes, pas un de plus ---------- */
    function release() {
      if (released) return;                       // idempotent
      released = true;
      document.documentElement.classList.remove("is-locked");
      loader.classList.add("gone");
      // §2.4 — on rend un vrai focus au document
      var target = q("#hero h1") || document.body;
      if (target) {
        target.setAttribute("tabindex", "-1");
        try { target.focus({ preventScroll: true }); } catch (e) {}
      }
    }

    // (1) le pin du hero existe-t-il déjà ?
    function heroPinReady() {
      if (!window.ScrollTrigger || !ScrollTrigger.getAll) return false;
      return ScrollTrigger.getAll().some(function (t) {
        return t.trigger && t.trigger.id === "hero";
      });
    }

    function finish() {
      if (ready && copy && !fromSite) { copy.hidden = true; ready.hidden = false; }
      else if (ready) { ready.hidden = false; }
      if (heroPinReady()) release();
      // sinon : on ne force rien, la boucle du plafond ci-dessous s'en charge
    }

    // §2.4 — plafond dur à 4 s, mais jamais avant que le pin existe.
    // Entre 4 s et 7 s on sonde ; passé 7 s le failsafe de hero.js a déjà rendu
    // la main de toute façon, donc on cesse de sonder.
    setTimeout(function () {
      if (released) return;
      if (heroPinReady()) { release(); return; }
      var poll = setInterval(function () {
        if (released || heroPinReady()) { clearInterval(poll); release(); }
      }, 100);
      setTimeout(function () { clearInterval(poll); }, 3200);
    }, HARD_CAP);

    // §2.4 — PASSER : action explicite, libère immédiatement
    if (skip) skip.addEventListener("click", release);

    // Le compteur doit atteindre 100 %, quel que soit le chemin qui a rendu la main.
    // Sans ça il plafonne : au rechargement, les frames servies depuis le cache
    // mémoire ne produisent plus d'entrées `resource`, le PerformanceObserver n'en
    // voit qu'une partie (mesuré : 45 sur 60, soit 85 %) et « Prêt » ne s'affiche
    // jamais — exactement le compteur menteur que le §6.3 interdit.
    // On OBSERVE donc la levée du verrou (par reveal() de hero.js ou par nous) et
    // on complète l'affichage à ce moment : le 100 % correspond alors à un site
    // réellement prêt. On observe, on ne pilote pas.
    if ("MutationObserver" in window) {
      var lockObs = new MutationObserver(function () {
        if (document.documentElement.classList.contains("is-locked")) return;
        lockObs.disconnect();
        wFrames = wFonts = wImgs = 1;
        paint();
      });
      lockObs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    }
  })();

  /* =====================================================================
     V2.4 §3 — ignoreMobileResize
     Sur mobile, la barre d'URL qui se rétracte déclenche un resize et ScrollTrigger
     recalcule tout en plein scroll. On le lui interdit. Appelé ici et non dans
     hero.js (intouchable) : ScrollTrigger est global et main.js est parsé bien avant
     que hero.js ne crée son trigger — la config est donc en place à temps.
     ===================================================================== */
  if (window.ScrollTrigger && ScrollTrigger.config) {
    ScrollTrigger.config({ ignoreMobileResize: true });
  }

  /* =====================================================================
     V2.4 §3 — will-change UNIQUEMENT pendant l'animation
     Il était permanent sur [data-skew] (des dizaines d'éléments), .mq-track et
     .seuil-shot img : autant de couches de composition maintenues en permanence.
     On le pose à l'entrée dans le viewport, on le retire à la sortie.
     ===================================================================== */
  if (!REDUCE && "IntersectionObserver" in window) {
    var wcEls = qa("[data-skew], .mq-track, .seuil-shot img");
    if (wcEls.length) {
      var wio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          e.target.classList.toggle("is-anim", e.isIntersecting);
        });
      }, { rootMargin: "120px 0px" });
      wcEls.forEach(function (el) { wio.observe(el); });
    }
  }

  /* =====================================================================
     RÉVÉLATIONS · SPLIT-TEXT · GLITCH  (IntersectionObserver)
     ===================================================================== */
  var revealTargets = qa("[data-reveal],[data-reveal-stagger],[data-wall],[data-split]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-in"); });
  }

  // Glitch RGB — une salve à l'entrée (compatible avec le split : pas de transform)
  if (!REDUCE && "IntersectionObserver" in window) {
    var gio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var el = e.target;
          el.classList.add("glitch-once");
          setTimeout(function () { el.classList.remove("glitch-once"); }, 260);
          gio.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    qa("[data-glitch]").forEach(function (el) { gio.observe(el); });
  }

  /* =====================================================================
     SCRAMBLE mono — décodage à l'entrée (borné à 28 frames)
     ===================================================================== */
  if (!REDUCE && "IntersectionObserver" in window) {
    var CH = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\|—•";
    function scramble(el) {
      var real = el.getAttribute("data-final") || el.textContent;
      el.setAttribute("data-final", real);
      var len = real.length, f = 0, total = 28;
      onFrame(function () {
        var revealCount = Math.floor(len * (f / total)), out = "";
        for (var i = 0; i < len; i++) {
          var c = real[i];
          out += (c === " " || i < revealCount) ? c : CH[(Math.random() * CH.length) | 0];
        }
        el.textContent = out; f++;
        if (f > total) { el.textContent = real; return false; }
      });
    }
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { scramble(e.target); sio.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    qa("[data-scramble], .menu-item .p, .scene-jeu .tile figcaption, .nc-count").forEach(function (el) {
      if (el.textContent.trim()) sio.observe(el);
    });
  }

  /* =====================================================================
     CURSEUR CUSTOM + MAGNÉTIQUE
     ===================================================================== */
  if (!REDUCE && !COARSE && FINE) {
    var dot = q(".cursor-dot"), ring = q(".cursor-ring");
    if (dot && ring) {
      document.body.classList.add("has-cursor");
      var lab = document.createElement("span");
      lab.className = "cursor-label"; ring.appendChild(lab);
      var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, magnet = null;
      addEventListener("mousemove", function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });

      var HOVER = "a,button,.tile,.shot,.nc-slide,.ig-cell,.burger-row,[data-hover]";
      var MAG   = ".head-cta,.btn,.ov-cta,.foot-links a,.ig-cta,.head-cta,[data-cursor]";
      document.addEventListener("mouseover", function (e) {
        var m = e.target.closest(MAG);
        if (m) { magnet = m; ring.classList.add("is-hover", "is-magnet"); lab.textContent = m.getAttribute("data-cursor") || ""; }
        else if (e.target.closest(HOVER)) { ring.classList.add("is-hover"); }
      });
      document.addEventListener("mouseout", function (e) {
        var m = e.target.closest(MAG);
        if (m) { if (m.dataset.magX !== undefined) { m.style.transform = ""; } magnet = null; ring.classList.remove("is-hover", "is-magnet"); lab.textContent = ""; }
        else if (e.target.closest(HOVER)) { ring.classList.remove("is-hover"); }
      });

      onFrame(function () {
        dot.style.transform = "translate(" + mx + "px," + my + "px) translate(-50%,-50%)";
        var tx = mx, ty = my;
        if (magnet) {
          var r = magnet.getBoundingClientRect();
          var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
          var dx = mx - cx, dy = my - cy;
          if (Math.sqrt(dx * dx + dy * dy) < 80) {
            tx = cx; ty = cy;
            magnet.dataset.magX = "1";
            magnet.style.transform = "translate(" + (dx * 0.3) + "px," + (dy * 0.3) + "px)";
          } else { magnet.style.transform = ""; }
        }
        rx = lerp(rx, tx, 0.2); ry = lerp(ry, ty, 0.2);
        ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
      });

      document.addEventListener("mouseleave", function () { dot.style.opacity = "0"; ring.style.opacity = "0"; });
      document.addEventListener("mouseenter", function () { dot.style.opacity = "1"; ring.style.opacity = "1"; });
    }
  }

  /* =====================================================================
     VIGNETTE MENU — img flottante réutilisée (pointeur fin uniquement)
     ===================================================================== */
  if (!REDUCE && !COARSE && FINE) {
    var rows = qa(".burger-row[data-thumb]");
    if (rows.length) {
      var thumb = document.createElement("div"); thumb.className = "menu-thumb";
      var timg = document.createElement("img"); timg.alt = "";
      timg.src = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
      thumb.appendChild(timg);
      document.body.appendChild(thumb);
      var active = false, keyboard = false, ttx = 0, tty = 0, tcx = 0, tcy = 0;
      addEventListener("mousemove", function (e) { ttx = e.clientX + 150; tty = e.clientY; }, { passive: true });
      rows.forEach(function (row) {
        row.addEventListener("mouseenter", function () { show(row, false); });
        row.addEventListener("mouseleave", function () { if (!keyboard) hide(); });
        row.addEventListener("focus", function () { keyboard = true; var r = row.getBoundingClientRect(); ttx = r.right - 40; tty = r.top + r.height / 2; tcx = ttx; tcy = tty; show(row, true); });
        row.addEventListener("blur", function () { keyboard = false; hide(); });
      });
      function show(row, kb) { var s = row.getAttribute("data-thumb"); if (!s) return; timg.src = s; active = true; keyboard = kb; thumb.classList.add("on"); }
      function hide() { active = false; thumb.classList.remove("on"); }
      onFrame(function () {
        if (!active) return;
        var dx = ttx - tcx;
        tcx = keyboard ? ttx : lerp(tcx, ttx, 0.14);
        tcy = keyboard ? tty : lerp(tcy, tty, 0.14);
        var rot = keyboard ? 0 : clamp(dx * 0.4, -8, 8);
        thumb.style.left = tcx + "px"; thumb.style.top = tcy + "px";
        thumb.style.transform = "translate(-50%,-50%) rotate(" + rot + "deg)";
      });
    }
  }

  /* =====================================================================
     MARQUEE tapas — vélocité de scroll, sens inversé au retour
     ===================================================================== */
  (function () {
    var track = q("#mqTrack");
    if (!track || REDUCE) return;
    track.innerHTML += track.innerHTML; // dupliqué ×2 pour la boucle
    var x = 0, half = track.scrollWidth / 2;
    addEventListener("resize", function () { half = track.scrollWidth / 2; });
    onFrame(function () {
      var speed = 0.6 + Math.min(Math.abs(smoothVel) * 0.09, 4);
      x -= speed * Math.sign(smoothVel || 1);
      x = x % half; if (x > 0) x -= half;
      track.style.transform = "translate3d(" + x + "px,0,0)";
    });
  })();

  /* =====================================================================
     SKEW de vélocité — sur les gros titres uniquement (±3,5°)
     ===================================================================== */
  if (!REDUCE) {
    var skewEls = qa(".wall, #jeu-title, #carte-title, #sortie-title");
    skewEls.forEach(function (el) { el.setAttribute("data-skew", ""); });
    if (skewEls.length) {
      onFrame(function () {
        var s = clamp(smoothVel * 0.4, -3.5, 3.5);
        for (var i = 0; i < skewEls.length; i++) skewEls[i].style.transform = "skewY(" + s + "deg)";
      });
    }
  }

  /* =====================================================================
     PARALLAXE INVERSÉE — la photo du seuil (0,88×, ±60px)
     V3.0 §2.1 : le crochet était .dogs-parallax, posé sur chiens-duo. La photo
     a changé (chiens-duo est parti en galerie), l'effet reste — il compense le
     height:112% de .seuil-shot img, qui existe précisément pour lui.
     ===================================================================== */
  (function () {
    var fig = q(".seuil-shot"), img = fig ? fig.querySelector("img") : null;
    if (!img || !fig || REDUCE) return;
    onFrame(function () {
      var r = fig.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      var center = (r.top + r.height / 2) - innerHeight / 2;
      img.style.transform = "translate3d(0," + clamp(-center * 0.12, -60, 60) + "px,0)";
    });
  })();

  /* =====================================================================
     CARROUSEL DE NUIT — compteur (IntersectionObserver)
     Le total est dérivé du DOM : ajouter ou retirer une slide ne peut plus
     désynchroniser le compteur (il était figé à « 07 » en dur avant V2.2).
     ===================================================================== */
  (function () {
    var track = q("#ncTrack"), now = q("#ncNow"), total = q("#ncTotal");
    if (!track || !now || !("IntersectionObserver" in window)) return;
    var slides = qa(".nc-slide", track);
    if (total) total.textContent = ("0" + slides.length).slice(-2);
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var idx = slides.indexOf(e.target) + 1;
          if (idx > 0) now.textContent = ("0" + idx).slice(-2);
        }
      });
    }, { root: track, threshold: 0.6 });
    slides.forEach(function (s) { cio.observe(s); });
  })();

  /* =====================================================================
     §3bis.1 — LA BANDE DE PHOTOBOOTH
     La bande se compose vignette par vignette : 4 cases décalées de 120 ms,
     un flash blanc très court (0 → .9 → 0 en 90 ms) avant chaque case, puis le
     bandeau BARREL PUB CANNES en dernier. Une seule bande animée à la fois.

     SÉCURITÉ : sous prefers-reduced-motion le flash est DÉSACTIVÉ — un flash
     blanc répété est un déclencheur photosensible. En mode réduit les quatre
     cases apparaissent ensemble en fondu de 200 ms.
     Sans JS : aucun volet n'est posé, la bande s'affiche entière.
     ===================================================================== */
  (function () {
    var strip = q("[data-bande]");
    if (!strip) return;
    var shutters = qa(".bd-cell", strip);
    if (!shutters.length) return;

    // on n'arme les volets que si on peut les retirer ensuite
    if (!("IntersectionObserver" in window)) return;
    strip.classList.add("is-armed");

    var flash = q(".bd-flash", strip);
    var played = false;

    function reveal(i) {
      if (i >= shutters.length) return;
      if (!REDUCE && flash) {
        flash.classList.add("on");
        setTimeout(function () { flash.classList.remove("on"); }, 90);
      }
      shutters[i].classList.add("is-open");
      setTimeout(function () { reveal(i + 1); }, 120);
    }

    var bio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting || played) return;
        played = true;
        bio.disconnect();
        if (REDUCE) {
          strip.classList.add("is-reduced");
          shutters.forEach(function (s) { s.classList.add("is-open"); });
        } else {
          reveal(0);
        }
      });
    }, { threshold: 0.45 });
    bio.observe(strip);
  })();

  /* =====================================================================
     §3.3 — la bâche au logo : on marque le bloc quand il est à l'écran,
     au moment où le logo du header devient interactif.
     ===================================================================== */
  (function () {
    var live = q(".logo-live"), brand = q(".site-head .brand");
    if (!live || !("IntersectionObserver" in window)) return;
    var lio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        live.classList.toggle("is-live", e.isIntersecting);
        if (brand) brand.classList.toggle("is-live", e.isIntersecting);
      });
    }, { threshold: 0.4 });
    lio.observe(live);
  })();

  /* =====================================================================
     V2.4 §1 — LA VIDÉO DU CHIEN, SCRUBÉE AU SCROLL
     On déplace currentTime selon la progression de la figure dans le viewport :
     le visiteur avance vers l'œil en scrollant, c'est lui qui entre dans le chien.

     Règles du §1.3, toutes tenues ici :
     · IntersectionObserver + boucle bornée, JAMAIS de ScrollTrigger — le hero est
       pinné au-dessus, tout ScrollTrigger placé en dessous mesure faux.
     · La boucle ne tourne QUE quand la figure est visible : on s'abonne au
       gsap.ticker à l'entrée, on se désabonne (return false) à la sortie. C'est
       aussi ce qui garde UN SEUL requestAnimationFrame dans tout le fichier.
       runFrame() coupe déjà sur document.hidden.
     · Seuil de repositionnement d'une frame (1/24 s) : sans lui on repositionne la
       vidéo à chaque frame pour rien, le décodeur sature et l'image se fige. C'est
       la première cause de saccade sur ce type d'effet.
     · §1.4 — sur les 15 derniers pour cent, un voile noir monte de 0 à 1. Le JS ne
       met à jour QUE la variable --fade ; aucune autre propriété n'est animée.
     ===================================================================== */
  (function () {
    var fig = q("[data-chien-video]");
    if (!fig) return;
    var video = q("video", fig);
    if (!video) return;

    var FRAME = 1 / 24;          // seuil de repositionnement = une frame
    var FADE_FROM = 0.85;        // §1.4 — le voile démarre à 85 %

    // --- §1.5 · les portes de sortie : on affiche la photo, pas une vidéo figée ---
    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var saveData = !!(conn && conn.saveData);
    function fallbackPhoto() {
      fig.classList.add("is-photo");
      try { video.removeAttribute("src"); video.load(); } catch (e) {}
    }
    if (REDUCE || saveData) { fallbackPhoto(); return; }
    video.addEventListener("error", fallbackPhoto);
    // une source illisible remonte sur le <source>, pas sur le <video>
    qa("source", video).forEach(function (s) {
      s.addEventListener("error", function () {
        if (video.networkState === 3 /* NETWORK_NO_SOURCE */) fallbackPhoto();
      });
    });

    // --- progression de la figure dans le viewport, bornée 0..1 ---
    function progress() {
      var r = fig.getBoundingClientRect();
      var vh = window.innerHeight || 1;
      return clamp((vh - r.top) / (vh + r.height), 0, 1);
    }

    // écrit l'état pour une progression donnée
    function update(p) {
      if (video.readyState >= 1 && video.duration) {
        var target = p * video.duration;
        // seuil d'une frame : en dessous, on ne touche pas au décodeur
        if (Math.abs(target - video.currentTime) > FRAME) {
          try { video.currentTime = target; } catch (e) {}
        }
      }
      var fade = p <= FADE_FROM ? 0 : (p - FADE_FROM) / (1 - FADE_FROM);
      fig.style.setProperty("--fade", clamp(fade, 0, 1).toFixed(3));
    }

    var subscribed = false;
    function tick() {
      if (!subscribed) return false;          // désabonnement propre
      update(progress());
    }

    // --- §1.3 · chargement seulement quand la section approche (marge 600 px) ---
    var armed = false;
    var loadIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting || armed) return;
        armed = true;
        loadIO.disconnect();
        video.preload = "metadata";
        try { video.load(); } catch (err) {}
      });
    }, { rootMargin: "600px 0px" });
    loadIO.observe(fig);

    // --- la boucle ne vit que dans le viewport ---
    var runIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          if (!subscribed) { subscribed = true; onFrame(tick); }
        } else {
          subscribed = false;                  // tick() se retirera au prochain passage
          // On écrit une dernière fois l'état terminal AVANT de lâcher la boucle.
          // Sans ça, la figure sort du viewport pendant que le voile est à ~0,34 et
          // il y reste : le §1.4 (fondu au noir complet) ne se produit jamais, et la
          // vidéo se fige à ~4,5 s au lieu d'aller au bout. Hors viewport la
          // progression vaut exactement 0 ou 1, donc cet appel borne proprement.
          update(progress());
        }
      });
    }, { threshold: 0 });
    runIO.observe(fig);
  })();

  /* =====================================================================
     HORLOGE LIVE — le JS ne fait que remplacer (info statique sinon)
     ===================================================================== */
  (function () {
    var dotc = q("#clockDot"), txt = q("#clockTxt");
    if (!dotc || !txt) return;
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    function tick() {
      var d = new Date(), h = d.getHours(), m = d.getMinutes();
      if (h >= 18 || h < 5) {
        dotc.classList.add("on");
        txt.textContent = pad(h) + ":" + pad(m) + " — Le Barrel est ouvert.";
      } else {
        dotc.classList.remove("on");
        var mins = (18 * 60) - (h * 60 + m);
        txt.textContent = pad(h) + ":" + pad(m) + " — On ouvre dans " + Math.floor(mins / 60) + "H" + pad(mins % 60) + ".";
      }
    }
    tick(); setInterval(tick, 30000);
  })();

  /* =====================================================================
     V3.2 §1 — LA BANDE D'AVIS, AUX FLÈCHES DU CLAVIER
     Le défilement lui-même est natif : overflow-x + scroll-snap. Le doigt, la
     molette et la barre de défilement n'ont besoin de personne, et ce bloc ne
     les touche pas. Ce n'est pas un carrousel : ni lecture automatique, ni
     état, ni pin — juste le clavier.

     POURQUOI IL FAUT CES DOUZE LIGNES : un conteneur défilant focusable est
     censé répondre aux flèches tout seul. Mesuré ici, il ne le fait pas —
     l'événement arrive bien (isTrusted, non annulé, focus sur la bande) et
     scrollLeft ne bouge pas, avec mandatory comme avec proximity. Le §4 exige
     que les flèches fonctionnent ; on ne parie pas là-dessus.
     ===================================================================== */
  (function () {
    var band = q(".rev-band");
    if (!band) return;
    band.addEventListener("keydown", function (e) {
      var carte = band.querySelector(".rev-track > li");
      var pas = carte ? carte.getBoundingClientRect().width + 20 : 320;
      var dx = 0, abs = null;
      if (e.key === "ArrowRight") dx = pas;
      else if (e.key === "ArrowLeft") dx = -pas;
      else if (e.key === "Home") abs = 0;
      else if (e.key === "End") abs = band.scrollWidth;
      else return;
      e.preventDefault();
      // Défilement INSTANTANÉ, volontairement : en "smooth", trois appuis
      // rapides se calculent tous à partir d'un scrollLeft encore en vol et
      // n'avancent que d'une carte au lieu de trois (mesuré). Le scroll-snap
      // du CSS fait l'atterrissage propre, et le clavier reste prévisible.
      band.scrollTo({ left: abs !== null ? abs : band.scrollLeft + dx, behavior: "auto" });
    });
  })();

  /* =====================================================================
     V3.1 §1 — LE JOUR ET LA NUIT
     Tout le travail est fait par un <input type="range"> réel : le clavier, le
     tactile et le lecteur d'écran viennent avec, sans une ligne à écrire. Ce
     bloc n'ajoute que le confort à la souris — la poignée suit le pointeur sans
     qu'on ait à cliquer.

     POURQUOI --x N'EST PAS ÉCRIT DANS LE TICKER, contrairement à tous les
     autres effets de ce fichier : runFrame() commence par `if (document.hidden)
     return`, et la boucle est de toute façon suspendue quand la page ne peint
     pas. C'est la bonne règle pour une animation continue ; c'en est une
     mauvaise pour une commande qu'on manipule au doigt, qui doit répondre au
     geste et pas à la frame suivante. On écrit donc directement, une fois par
     événement, avec un garde-fou sur la valeur déjà posée. Aucun
     requestAnimationFrame n'est créé ici : le budget du §6 est tenu.

     Le rectangle du cadre est mis en cache : le relire à chaque pointermove
     juste après avoir écrit --x forcerait un recalcul de mise en page par
     événement. Il est rafraîchi à l'entrée du pointeur, au scroll et au
     redimensionnement — les trois seuls moments où il peut bouger.

     Aucune transition n'est posée sur clip-path : le curseur doit coller au
     doigt. C'est aussi ce qui rend ce module correct en mouvement réduit —
     c'est un geste, pas une animation.
     ===================================================================== */
  (function () {
    var frame = q("#dnFrame"), range = q("#dnRange");
    if (!frame || !range) return;

    var applied = null, box = null;

    function apply(v) {
      v = clamp(v, 0, 100);
      if (applied !== null && Math.abs(applied - v) < 0.05) return;
      applied = v;
      frame.style.setProperty("--x", v.toFixed(2) + "%");
    }

    range.addEventListener("input", function () {
      apply(parseFloat(range.value) || 0);
    });

    if (!COARSE) {
      var refresh = function () { box = frame.getBoundingClientRect(); };
      frame.addEventListener("pointerenter", refresh);
      addEventListener("scroll", function () { box = null; }, { passive: true });
      addEventListener("resize", function () { box = null; });

      frame.addEventListener("pointermove", function (e) {
        if (e.pointerType !== "mouse") return;
        if (!box) refresh();
        if (!box.width) return;
        var v = clamp(((e.clientX - box.left) / box.width) * 100, 0, 100);
        range.value = String(Math.round(v));
        apply(v);
      }, { passive: true });
    }

    apply(parseFloat(range.value) || 0);
  })();

  /* =====================================================================
     V3.1 §4 — LA MODALE DE RÉSERVATION
     · <dialog>.showModal() : piège de focus, fond inerte et fermeture à Échap
       sont natifs. On n'écrit ni l'un ni l'autre.
     · Sans JS, ce bloc ne tourne pas : les déclencheurs restent des liens vers
       contact.html. C'est le repli prévu au §4, et c'est aussi la page qu'on
       partage en lien direct.
     · L'envoi passe par fetch vers Netlify pour rester dans la modale. Si le
       fetch échoue (hors ligne, environnement local sans Netlify), on rend la
       main au navigateur : soumission classique vers /merci.html. Personne ne
       reste bloqué avec une demande dans les mains.
     ===================================================================== */
  (function () {
    var dlg = q("#rsvDialog");
    if (!dlg || typeof dlg.showModal !== "function") return;

    var form   = q("#rsvForm");
    var inner  = q("#rsvInner");
    var done   = q("#rsvDone");
    var type   = q("#rsv-type");
    var pers   = q("#rsvPersWrap");
    var closeB = q("#rsvClose");
    var doneB  = q("#rsvDoneClose");
    var eyeb   = q("#rsvEyebrow");
    var titre  = q("#rsvTitle");
    var lede   = q("#rsvLede");
    var last   = null;

    /* V3.2 §2.1 — la modale sert aussi de soupape : « nous écrire en privé »,
       depuis le bloc avis, l'ouvre avec le motif « retour d'expérience »
       présélectionné. Ouvrir une boîte titrée « On te garde une place » à
       quelqu'un qui vient raconter sa soirée serait à côté de la plaque, donc
       l'en-tête change avec le motif. Les libellés par défaut sont lus dans le
       DOM : les modifier dans le HTML suffit, il n'y a rien à répéter ici. */
    var DEFAUT = {
      eyebrow: eyeb  ? eyeb.textContent  : "",
      titre:   titre ? titre.textContent : "",
      lede:    lede  ? lede.textContent  : ""
    };
    var VARIANTES = {
      retour: {
        eyebrow: "Nous écrire",
        titre:   "Dis-nous tout.",
        lede:    "Un mot sur ta soirée, un reproche, une idée. Ça arrive directement à l'équipe, et ce n'est pas publié sur le site."
      }
    };
    function habiller(motif) {
      var v = VARIANTES[motif] || DEFAUT;
      if (eyeb)  eyeb.textContent  = v.eyebrow;
      if (titre) titre.textContent = v.titre;
      if (lede)  lede.textContent  = v.lede;
    }

    /* --- ouverture --- */
    qa("[data-rsv]").forEach(function (t) {
      t.addEventListener("click", function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        last = t;
        // si la modale a déjà servi, on la remet à l'état formulaire : rouvrir
        // sur l'écran de confirmation d'une demande précédente n'aurait pas de
        // sens. On réinitialise à l'ouverture, pas à la fermeture, pour ne pas
        // faire clignoter le contenu pendant l'animation de sortie.
        if (done && !done.hidden) {
          done.hidden = true;
          if (inner) inner.hidden = false;
          if (form) form.reset();
          var b = q("#rsvSubmit");
          if (b) { b.disabled = false; b.textContent = "Envoyer la demande"; }
          var e2 = q(".rsv-err", form);
          if (e2) e2.remove();
          syncPers();
        }
        var motif = t.getAttribute("data-rsv-type");
        if (type) { type.value = motif || "table"; syncPers(); }
        habiller(motif);
        dlg.showModal();
        var first = q("#rsv-nom");
        if (first) first.focus({ preventScroll: true });
      });
    });

    function close() { if (dlg.open) dlg.close(); }
    if (closeB) closeB.addEventListener("click", close);
    if (doneB)  doneB.addEventListener("click", close);

    /* --- Échap ---
       showModal() ferme nativement à Échap. Certains navigateurs embarqués
       (webviews, navigateurs intégrés à une application) reçoivent bien la
       touche sans déclencher la fermeture — c'est le cas du volet de prévisu
       de ce projet, mesuré. Le filet est conditionné à « la modale est
       ouverte » : là où le navigateur fait son travail, il ne fait rien. */
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape" && e.key !== "Esc") return;
      if (!dlg.open) return;
      close();
    });

    /* --- clic sur le fond ---
       Un clic sur ::backdrop a pour cible le <dialog> lui-même : il suffit de
       vérifier que le point cliqué tombe hors de sa boîte. Comparer
       e.target === dlg seul fermerait aussi sur un clic dans le padding. */
    dlg.addEventListener("click", function (e) {
      if (e.target !== dlg) return;
      var r = dlg.getBoundingClientRect();
      var dedans = e.clientX >= r.left && e.clientX <= r.right &&
                   e.clientY >= r.top  && e.clientY <= r.bottom;
      if (!dedans) close();
    });

    /* --- le focus revient au bouton d'où l'on vient --- */
    dlg.addEventListener("close", function () {
      if (last) { last.focus({ preventScroll: true }); last = null; }
    });

    /* --- champ conditionnel ---
       Une demande de groupe, d'anniversaire ou de privatisation sans nombre de
       personnes est inexploitable ; une réservation de table n'en a pas besoin.
       Le brief cite « anniversaire » et « groupe » : privatisation est ajoutée,
       c'est le cas où le nombre compte le plus. */
    var AVEC_NOMBRE = { groupe: 1, anniversaire: 1, privatisation: 1 };
    function syncPers() {
      if (!pers || !type) return;
      pers.hidden = !AVEC_NOMBRE[type.value];
    }
    if (type) type.addEventListener("change", function () {
      syncPers();
      habiller(type.value);
    });
    syncPers();

    /* --- envoi --- */
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!form.reportValidity()) return;

        var btn = q("#rsvSubmit");
        if (btn) { btn.disabled = true; btn.textContent = "Envoi…"; }
        var old = q(".rsv-err", form);
        if (old) old.remove();

        var data = new URLSearchParams(new FormData(form)).toString();
        fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: data
        }).then(function (r) {
          if (!r.ok) throw new Error(r.status);
          if (inner) inner.hidden = true;
          if (done) { done.hidden = false; if (doneB) doneB.focus({ preventScroll: true }); }
        }).catch(function () {
          // dernier recours : on laisse le navigateur poster vers /merci.html
          if (btn) { btn.disabled = false; btn.textContent = "Envoyer la demande"; }
          var msg = document.createElement("p");
          msg.className = "rsv-err";
          msg.textContent = "L'envoi direct n'a pas abouti — on bascule sur la page complète.";
          form.appendChild(msg);
          setTimeout(function () { form.submit(); }, 900);
        });
      });
    }
  })();

  /* =====================================================================
     V3.1 §2 — LA CARTE EN ONGLETS
     Le chapitre carte tenait sur cinq écrans dépliés ; il en tient un.
     · Aucune dépendance : View Transitions same-document quand le navigateur
       sait faire, sinon un fondu de 200 ms. Rien à charger dans /vendor.
     · Les catégories sont LUES DANS LE DOM : ajouter un bloc .menu-cat avec
       son data-cat et un bouton dans le tablist suffit, il n'y a pas de liste
       à tenir à jour ici.
     · Motif « onglets à panneau unique » : les cinq onglets pilotent le même
       #menuCols, dont le contenu change. aria-selected suit, le tabindex est
       mobile (0 sur l'onglet actif, -1 sur les autres), les flèches déplacent
       le focus ET sélectionnent — activation automatique, c'est la convention
       pour des onglets sans contenu coûteux.
     · Sans JS ce bloc ne tourne pas, la barre est masquée par le <noscript> et
       la carte reste entière.
     ===================================================================== */
  (function () {
    var tablist = q("#menuTabs"), cols = q("#menuCols");
    if (!tablist || !cols) return;
    var tabs = qa(".menu-tab", tablist);
    var cats = qa(".menu-cat", cols);
    if (!tabs.length || !cats.length) return;

    var current = "tout";

    function paint() {
      for (var i = 0; i < cats.length; i++) {
        // data-solo : bloc absent de « Tout », visible sur son propre onglet (V4.9)
        var on = current === "tout" ? !cats[i].hasAttribute("data-solo") : cats[i].getAttribute("data-cat") === current;
        if (on === !cats[i].hidden) continue;
        cats[i].hidden = !on;
      }
    }

    function select(tab, focus) {
      var cat = tab.getAttribute("data-cat");
      tabs.forEach(function (t) {
        var sel = t === tab;
        t.setAttribute("aria-selected", String(sel));
        t.tabIndex = sel ? 0 : -1;
      });
      if (focus) tab.focus();
      if (cat === current) return;
      current = cat;

      if (REDUCE) { paint(); return; }
      if (document.startViewTransition) {
        var vt = document.startViewTransition(paint);
        var hush = function () {};
        // une transition annulée (deux clics coup sur coup) rejette ses
        // promesses ; le DOM est déjà à jour, il n'y a rien à rattraper.
        if (vt) {
          if (vt.ready) vt.ready.catch(hush);
          if (vt.finished) vt.finished.catch(hush);
          if (vt.updateCallbackDone) vt.updateCallbackDone.catch(hush);
        }
        return;
      }
      cols.classList.add("is-fading");
      setTimeout(function () { paint(); cols.classList.remove("is-fading"); }, 200);
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () { select(tab, false); });
    });

    tablist.addEventListener("keydown", function (e) {
      var i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      var n = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") n = (i + 1) % tabs.length;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") n = 0;
      else if (e.key === "End") n = tabs.length - 1;
      if (n === null) return;
      e.preventDefault();
      select(tabs[n], true);
    });

    paint();
  })();

  /* =====================================================================
     PROGRAMME « CE SOIR » — surligne le jour courant
     ===================================================================== */
  (function () {
    var list = q("#program");
    if (!list) return;
    var day = new Date().getDay(); // 0 = dimanche
    var order = [1, 2, 3, 4, 5, 6, 0]; // lundi→dimanche pour matcher l'ordre du DOM
    var rows = qa("li", list);
    var idx = order.indexOf(day);
    if (rows[idx]) rows[idx].classList.add("today");
  })();

  /* =====================================================================
     COUNT-UP chiffres (odomètre-lite : tabular-nums + montée)
     ===================================================================== */
  (function () {
    var nums = qa(".stat b[data-count]");
    if (!nums.length || REDUCE || !("IntersectionObserver" in window)) return;
    function run(el) {
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      var suffix = el.getAttribute("data-suffix") || "";
      var f = 0, total = 60;
      onFrame(function () {
        var p = Math.min(1, f / total), eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + (p === 1 ? suffix : "");
        f++;
        if (p >= 1) return false;
      });
    }
    var nio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { run(e.target); nio.unobserve(e.target); } });
    }, { threshold: 0.4 });
    nums.forEach(function (n) { nio.observe(n); });
  })();

  /* =====================================================================
     FEED INSTAGRAM — lazy, une seule fois, fallback permanent
     ===================================================================== */
  (function () {
    var feed = q("#igFeed");
    if (!feed || !("IntersectionObserver" in window)) return;
    var iio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { feed.setAttribute("data-loaded", "true"); iio.disconnect(); } });
    }, { rootMargin: "600px 0px" });
    iio.observe(feed);
  })();

  /* =====================================================================
     ITINÉRAIRE — Apple Plans sur appareils Apple, Google Maps ailleurs
     ===================================================================== */
  (function () {
    var a = q("#itineraire");
    if (!a) return;
    if (/iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent)) {
      a.href = "https://maps.apple.com/?daddr=43.5513,7.0128&q=Barrel+Pub+Cannes";
    }
  })();

  /* =====================================================================
     V3.3 §4.2 — BARRE D'ACTION COLLANTE (MOBILE)
     Trois cibles — Réserver, Appeler, Itinéraire — qui suivent le visiteur
     sur les 25 000 px de la page, parce que le bouton RÉSERVER de l'en-tête
     part au premier scroll.

     Deux IntersectionObserver, aucun listener de scroll : l'un allume la
     barre quand le chapitre 02 entre dans le viewport (le hero est traversé),
     l'autre l'éteint quand le bloc VENIR entre à son tour — il porte déjà les
     trois mêmes actions en grand, les répéter par-dessus serait un doublon.
     La sortie du bloc VENIR par le haut (remontée) rallume la barre.

     Le gabarit mobile est décidé en CSS (@media max-width:860px et
     pointer:coarse) : ici on ne fait que poser des classes, donc rien ne
     bouge sur desktop même si le JS tourne.
     ===================================================================== */
  (function () {
    var dock = q("#dock");
    if (!dock || !("IntersectionObserver" in window)) return;

    var apres = q("#scene-seuil");   // le hero est derrière nous
    var venir = q("#venir");         // le bloc qui porte déjà les trois actions
    if (!apres) return;

    var passeHero = false, dansVenir = false, modaleOuverte = false;

    function paint() {
      var visible = passeHero && !dansVenir && !modaleOuverte;
      if (visible && dock.hidden) dock.hidden = false;   // premier affichage
      dock.classList.toggle("is-up", visible);
    }

    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) passeHero = true; });
      paint();
    }, { rootMargin: "0px 0px -25% 0px" }).observe(apres);

    if (venir) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { dansVenir = e.isIntersecting; });
        paint();
      }, { threshold: 0 }).observe(venir);
    }

    /* la modale de réservation prend tout l'écran : la barre s'efface le temps
       qu'elle est ouverte, et revient à la fermeture. */
    var dlg = q("#rsvDialog");
    if (dlg && "MutationObserver" in window) {
      new MutationObserver(function () {
        modaleOuverte = dlg.open;
        paint();
      }).observe(dlg, { attributes: true, attributeFilter: ["open"] });
    }
  })();

  /* =====================================================================
     V5.1 — LE PARCOURS DE LA PRIVATISATION (privatisation.html, #parcours)
     Le plan devient une traversée : on défile, un trait se dessine de la rue au fond
     de la salle, un repère avance dessus, chaque espace s'allume quand le repère y
     entre, et sa photo arrive avec son texte.
     · Le SVG, les textes et les photos sont dans la page (lisible sans JavaScript).
       Ici : le comportement, les noms (ZONES) et les quatre positions (STOPS).
     · STOPS est la SEULE source des quatre positions : elle place le repère, décide
       de l'espace actif, du panneau, de la photo interne et de l'atterrissage des
       raccourcis. Ne jamais les recopier ailleurs.
     · Ordinateur (≥ 760 px, mouvement normal) : section épinglée 400 vh, ScrollTrigger
       en onUpdate direct (pas d'animation autonome : le trait suit le doigt, sans
       retard). Téléphone / mouvement réduit : blocs empilés, aucun épinglage.
       gsap.matchMedia rebascule proprement au redimensionnement.
     · Aucune boucle rAF ici : Lenis tourne dans le gsap.ticker (créé en tête de
       fichier pour cette page, comme hero.js le fait sur l'accueil).
     ===================================================================== */
  (function () {
    var root = q("#parcours");
    var path = q("#planPath");
    if (!root || !path || !G || !window.ScrollTrigger || !G.matchMedia) return;
    G.registerPlugin(window.ScrollTrigger);

    var ZONES = {
      terrasse: { nom: "La terrasse couverte", capacite: "" },
      comptoir: { nom: "Le comptoir",          capacite: "" },
      billard:  { nom: "Le coin billard",      capacite: "" },
      salle:    { nom: "La grande salle",      capacite: "" }
    };
    var ORDER = ["terrasse", "comptoir", "billard", "salle"];

    // Progression le long du trait (0 → 1) à laquelle le repère ENTRE dans chaque espace.
    // Mesurées sur la géométrie de #planPath (longueur 1206,7 ; premier point à
    // l'intérieur du rectangle de la zone) : 0 · 0,1494 · 0,3818 · 0,6729, arrondies
    // vers le haut à 4 décimales pour que le changement tombe juste APRÈS l'entrée,
    // jamais avant. Si le tracé du <path> change, ces quatre valeurs se remesurent.
    var STOPS = [0, 0.1495, 0.3819, 0.673];

    var glow = q("#planGlow"), mark = q("#planMark");
    var steps = qa(".step", root);
    var zones = qa("#plan [data-zone]");
    var btns = qa(".plan-btn", root);
    var espace = q("#espace");
    var LEN = path.getTotalLength();
    var active = -1, pinST = null, pinned = false;

    // noms et capacités viennent de l'objet, pas du HTML
    qa("[data-zone-nom]").forEach(function (el) {
      var host = el.closest("[data-zone]") || el.closest("[data-step]") || el;
      var id = host.getAttribute("data-zone") || host.getAttribute("data-step") || el.getAttribute("value");
      if (ZONES[id]) el.textContent = ZONES[id].nom;
    });
    zones.forEach(function (el) {
      var id = el.getAttribute("data-zone");
      if (ZONES[id] && el.getAttribute("role") === "button") el.setAttribute("aria-label", ZONES[id].nom);
    });
    // une ligne sans donnée n'existe pas : la capacité n'est écrite que si elle est remplie
    ORDER.forEach(function (id) {
      if (!ZONES[id].capacite) return;
      var body = q("#step-" + id + " .step-body .step-text");
      if (!body) return;
      var c = document.createElement("p");
      c.className = "plan-cap"; c.textContent = ZONES[id].capacite;
      body.parentNode.insertBefore(c, body.nextSibling);
    });

    // bas du plan collé (mode empilé) : `top` sticky + hauteur du bloc
    function navBottom() {
      var n = q(".parcours-nav", root);
      if (!n) return 96;
      return (parseFloat(getComputedStyle(n).top) || 0) + n.offsetHeight;
    }

    function indexFor(p) {
      for (var i = STOPS.length - 1; i > 0; i--) if (p >= STOPS[i]) return i;
      return 0;
    }

    function setActive(i) {
      if (i === active) return;
      active = i;
      var id = ORDER[i];
      steps.forEach(function (s) { s.classList.toggle("is-active", s.getAttribute("data-step") === id); });
      zones.forEach(function (el) {
        var on = el.getAttribute("data-zone") === id;
        el.classList.toggle("is-active", on);
        el.setAttribute("aria-pressed", String(on));
      });
      btns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-zone") === id)); });
    }

    // photo interne : le segment de l'espace est découpé en autant de parts que de photos
    function paintPhoto(p, i) {
      var step = steps[i]; if (!step) return;
      var imgs = qa(".step-photo img", step);
      var from = STOPS[i], to = i + 1 < STOPS.length ? STOPS[i + 1] : 1;
      var t = clamp((p - from) / (to - from), 0, 0.9999);
      var j = Math.floor(t * imgs.length);
      imgs.forEach(function (im, k) { im.classList.toggle("on", k === j); });
    }

    // L'unique fonction qui dessine : trait, repère, espace actif, panneau, photo.
    function render(p) {
      p = clamp(p, 0, 1);
      var s = p * LEN;
      var off = String(LEN - s);
      path.style.strokeDashoffset = off;
      if (glow) glow.style.strokeDashoffset = off;
      var pt = path.getPointAtLength(s);
      if (mark) mark.setAttribute("transform", "translate(" + pt.x.toFixed(2) + " " + pt.y.toFixed(2) + ")");
      var i = indexFor(p);
      setActive(i);
      if (pinned) paintPhoto(p, i);
    }

    function drawFull() {
      path.style.strokeDasharray = "none"; path.style.strokeDashoffset = "0";
      if (glow) { glow.style.strokeDasharray = "none"; glow.style.strokeDashoffset = "0"; }
    }
    function armDash() {
      path.style.strokeDasharray = LEN + " " + LEN;
      if (glow) glow.style.strokeDasharray = LEN + " " + LEN;
    }

    // raccourcis : boutons et zones du plan amènent le défilement à l'étape
    function goTo(i) {
      var id = ORDER[i], y;
      if (pinned && pinST) {
        y = pinST.start + (STOPS[i] + 0.003) * (pinST.end - pinST.start);
      } else {
        var el = q("#step-" + id);
        if (!el) return;
        // mode empilé : le plan collé occupe le haut de l'écran, on s'arrête juste dessous
        y = el.getBoundingClientRect().top + window.pageYOffset - (navBottom() + 12);
      }
      if (lenis) lenis.scrollTo(y, { duration: pinned ? 1.6 : 1.1 });
      else window.scrollTo({ top: y, behavior: REDUCE ? "auto" : "smooth" });
    }
    // le configurateur (V5.4) peut demander d'amener le parcours sur un espace
    document.addEventListener("barrel:zone", function (e) {
      var i = ORDER.indexOf(e.detail && e.detail.id);
      if (i < 0) return;
      e.preventDefault();
      goTo(i);
    });
    zones.concat(btns).forEach(function (el) {
      var i = ORDER.indexOf(el.getAttribute("data-zone"));
      el.addEventListener("click", function () { goTo(i); });
      if (el.tagName.toLowerCase() === "a") {
        // <a role="button"> : Entrée et Espace, comme un vrai bouton
        el.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") { e.preventDefault(); goTo(i); }
        });
      }
    });

    // le bouton de devis renseigne le select avec l'espace affiché ; le select reste sur
    // « Je ne sais pas encore » tant que personne n'a rien choisi. L'ancre #form fait le reste.
    qa("[data-espace]", root).forEach(function (a) {
      a.addEventListener("click", function () {
        if (espace) espace.value = a.getAttribute("data-espace");
      });
    });

    root.classList.add("is-live");
    var mm = G.matchMedia();
    mm.add({
      desk: "(min-width: 760px) and (prefers-reduced-motion: no-preference)",
      flat: "(max-width: 759px), (prefers-reduced-motion: reduce)"
    }, function (ctx) {
      active = -1;
      if (ctx.conditions.desk) {
        pinned = true;
        root.classList.add("is-pinned");
        root.classList.remove("is-flat");
        armDash();
        steps.forEach(function (s) { s.removeAttribute("hidden"); });
        q("#steps").setAttribute("aria-live", "polite");
        pinST = ScrollTrigger.create({
          trigger: root,
          start: "top top",
          end: function () { return "+=" + Math.round(window.innerHeight * 3); },
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: function (self) { render(self.progress); }
        });
        render(pinST.progress);
        return function () {
          pinned = false; pinST = null;
          root.classList.remove("is-pinned");
          q("#steps").removeAttribute("aria-live");
          qa(".step-photo img", root).forEach(function (im) { im.classList.toggle("on", !im.previousElementSibling); });
        };
      }
      // téléphone / mouvement réduit : blocs empilés, plan affiché une fois au-dessus,
      // l'espace surligné au fil de l'apparition des blocs (aucun épinglage, aucun scrub)
      pinned = false;
      root.classList.add("is-flat");
      drawFull();
      var io = null, rzT = 0;
      function flatMark(i) {
        setActive(i);
        var pt = path.getPointAtLength(clamp(STOPS[i] + 0.004, 0, 1) * LEN);
        if (mark) mark.setAttribute("transform", "translate(" + pt.x.toFixed(2) + " " + pt.y.toFixed(2) + ")");
      }
      flatMark(0);
      // la bande de lecture est centrée sur la zone visible SOUS le plan collé
      function armIO() {
        if (!("IntersectionObserver" in window)) return;
        if (io) io.disconnect();
        var H = window.innerHeight, top = navBottom(), mid = top + (H - top) / 2;
        var a = Math.max(0, Math.round(mid - 24)), b = Math.max(0, Math.round(H - (mid + 24)));
        io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) flatMark(ORDER.indexOf(e.target.getAttribute("data-step")));
          });
        }, { rootMargin: "-" + a + "px 0px -" + b + "px 0px", threshold: 0 });
        steps.forEach(function (s) { io.observe(s); });
      }
      function onResize() { clearTimeout(rzT); rzT = setTimeout(armIO, 150); }
      armIO();
      window.addEventListener("resize", onResize);
      return function () {
        root.classList.remove("is-flat");
        clearTimeout(rzT);
        window.removeEventListener("resize", onResize);
        if (io) io.disconnect();
      };
    });
  })();

  /* =====================================================================
     V5.4 — CONFIGURATEUR, NUIT DE 18H À 5H, CHIFFRES, VISIONNEUSE
     (privatisation.html). Aucun de ces blocs n'ouvre de boucle rAF : le compteur
     passe par onFrame (ticker de GSAP), le reste est piloté par des événements.
     ===================================================================== */

  /* ---- §1 · le configurateur : les phrases sont ICI, jamais dans le HTML ---- */
  (function () {
    var root = q("#configurateur");
    if (!root) return;

    var CFG = {
      // type d'événement → phrase, valeur du select du formulaire, espace suggéré
      // (la cliente corrige la correspondance en changeant ces quatre lignes)
      type: {
        anniversaire: { phrase: "Un anniversaire",         form: "anniversaire", zone: "billard"  },
        entreprise:   { phrase: "Une soirée d'entreprise", form: "entreprise",   zone: "comptoir" },
        match:        { phrase: "Une soirée de match",     form: "match",        zone: "salle"    },
        entre:        { phrase: "Une soirée entre nous",   form: "autre",        zone: "terrasse" }
      },
      taille: {
        dizaine:      { phrase: "une dizaine de personnes",       n: 10 },
        vingtaine:    { phrase: "une vingtaine de personnes",     n: 20 },
        quarantaine:  { phrase: "une quarantaine de personnes",   n: 40 },
        cinquante:    { phrase: "plus de cinquante personnes",    n: 50 },
        inconnu:      { phrase: "on ne sait pas encore combien",  n: 0 }
      },
      besoin: {
        dj: "le DJ", photobooth: "le photobooth", billard: "le billard",
        ecrans: "les écrans", cocktails: "la carte cocktails", coin: "un coin à nous"
      },
      lieu: {
        terrasse: "sur la terrasse couverte", comptoir: "au comptoir",
        billard: "au coin billard", salle: "dans la grande salle"
      },
      defautType: "Une soirée",
      vide: "Répondez aux questions : on écrit votre demande pour vous.",
      suggestion: function (lieu) { return "On verrait bien ça " + lieu + "."; }
    };

    var recap = q("#cfgRecap"), sugg = q("#cfgSuggest"), go = q("#cfgGo");
    var chosen = [];   // ordre de sélection des besoins : c'est l'ordre de la phrase

    function val(name) {
      var el = q('input[name="' + name + '"]:checked', root);
      return el ? el.value : null;
    }
    function list(a) {
      return a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " et " + a[a.length - 1];
    }
    function sentence() {
      var t = val("cfg-type"), n = val("cfg-taille");
      if (!t && !n && !chosen.length) return "";
      var s = t ? CFG.type[t].phrase : CFG.defautType;
      if (n) s += ", " + CFG.taille[n].phrase;
      if (chosen.length) s += ", avec " + list(chosen.map(function (k) { return CFG.besoin[k]; }));
      return s + ".";
    }
    function paint() {
      var s = sentence();
      recap.textContent = s || CFG.vide;
      recap.classList.toggle("is-empty", !s);
      var t = val("cfg-type"), n = val("cfg-taille");
      if (t && n) {
        var z = CFG.type[t].zone;
        sugg.textContent = CFG.suggestion(CFG.lieu[z]);
        sugg.setAttribute("data-zone", z);
        sugg.hidden = false;
      } else {
        sugg.hidden = true;
      }
    }

    root.addEventListener("change", function (e) {
      var el = e.target;
      if (!el || el.name !== "cfg-besoin") { paint(); return; }
      var k = el.value, i = chosen.indexOf(k);
      if (el.checked && i < 0) chosen.push(k);
      if (!el.checked && i >= 0) chosen.splice(i, 1);
      paint();
    });

    // la suggestion amène le parcours sur l'espace : le plan s'y allume
    sugg.addEventListener("click", function () {
      var ev = new CustomEvent("barrel:zone", { detail: { id: sugg.getAttribute("data-zone") }, cancelable: true });
      if (document.dispatchEvent(ev)) { var p = q("#parcours"); if (p) p.scrollIntoView(); }
    });

    // « Demander un devis » remplit le formulaire, puis l'ancre #form amène jusqu'à lui
    go.addEventListener("click", function () {
      var type = q("#type"), pers = q("#pers"), msg = q("#msg");
      var t = val("cfg-type"), n = val("cfg-taille"), s = sentence();
      if (type && t) type.value = CFG.type[t].form;
      if (pers && n && CFG.taille[n].n) pers.value = CFG.taille[n].n;
      if (msg && s && (!msg.value || msg.value === msg.getAttribute("data-auto"))) {
        msg.value = s; msg.setAttribute("data-auto", s);
      }
      // le focus va au premier champ vide, une fois le défilement amorcé
      setTimeout(function () {
        var order = ["#nom", "#email", "#tel", "#type", "#pers"];
        for (var i = 0; i < order.length; i++) {
          var f = q(order[i]);
          if (f && !f.value) { f.focus({ preventScroll: true }); return; }
        }
        var m = q("#msg"); if (m) m.focus({ preventScroll: true });
      }, 60);
    });

    paint();
  })();

  /* ---- §2 · de 18h à 5h : une variable --t (0 → 1), un vrai <input type=range> ---- */
  (function () {
    var root = q("#nuit");
    var range = q("#nuitRange");
    if (!root || !range) return;

    var MOMENTS = [
      { h: 18, texte: "L'apéro sur la terrasse, le soleil descend sur la rue piétonne." },
      { h: 21, texte: "Le match sur les écrans, la salle se remplit." },
      { h: 23, texte: "Le DJ prend la main, le billard tourne." },
      { h: 26, texte: "La piste, les bras en l'air." }
    ];
    var H0 = 18, H1 = 29;     // 5h = 29
    var imgs = qa(".nuit-photo img", root);
    var time = q("#nuitTime"), text = q("#nuitText");
    var took = false, cur = -1;

    function label(v) {
      var h = Math.floor(v) % 24;
      return h + "h" + (v % 1 ? "30" : "");
    }
    function moment(v) {
      var m = 0;
      for (var i = 0; i < MOMENTS.length; i++) if (v >= MOMENTS[i].h) m = i;
      return m;
    }
    function set(v) {
      v = clamp(v, H0, H1);
      range.value = v;
      var t = (v - H0) / (H1 - H0);
      root.style.setProperty("--t", t.toFixed(3));
      var m = moment(v);
      time.textContent = label(v);
      range.setAttribute("aria-valuetext", label(v) + " — " + MOMENTS[m].texte);
      if (m !== cur) {
        cur = m;
        text.textContent = MOMENTS[m].texte;
        imgs.forEach(function (im, k) { im.classList.toggle("on", k === m); });
      }
    }

    // dès que le visiteur touche la réglette, le défilement ne la reprend plus
    function take() { took = true; }
    range.addEventListener("pointerdown", take);
    range.addEventListener("keydown", take);
    range.addEventListener("touchstart", take, { passive: true });
    range.addEventListener("input", function () { took = true; set(parseFloat(range.value)); });

    // le défilement fait avancer la réglette (jamais en mouvement réduit)
    if (!REDUCE) {
      var onScroll = function () {
        if (took) { removeEventListener("scroll", onScroll); return; }
        var r = root.getBoundingClientRect(), vh = window.innerHeight;
        var p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.3), 0, 1);
        set(Math.round((H0 + p * (H1 - H0)) * 2) / 2);
      };
      addEventListener("scroll", onScroll, { passive: true });
    }
    set(parseFloat(range.value));
  })();

  /* ---- §3 · les chiffres : comptés une seule fois, à l'arrivée à l'écran ---- */
  (function () {
    var nums = qa(".fig-n[data-count]");
    if (!nums.length || REDUCE || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var el = e.target, to = parseInt(el.getAttribute("data-count"), 10), t0 = performance.now(), D = 1100;
        el.textContent = "0";
        onFrame(function () {
          var k = clamp((performance.now() - t0) / D, 0, 1);
          el.textContent = String(Math.round(to * (1 - Math.pow(1 - k, 3))));
          if (k >= 1) { el.textContent = String(to); return false; }
        });
      });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { io.observe(n); });
  })();

  /* ---- §4 · la visionneuse : un <dialog> natif, flèches, Échap, focus rendu ---- */
  (function () {
    var dlg = q("#viewer");
    if (!dlg || typeof dlg.showModal !== "function") return;
    var img = q("#viewerImg"), cap = q("#viewerCap");
    var prev = q("#viewerPrev"), next = q("#viewerNext"), close = q("#viewerClose");
    var list = [], idx = 0, origin = null, prevOverflow = "";

    function show() {
      var a = list[idx];
      img.setAttribute("src", a.getAttribute("href"));
      img.setAttribute("alt", a.getAttribute("data-alt") || "");
      cap.textContent = a.getAttribute("data-alt") || "";
      var many = list.length > 1;
      prev.hidden = next.hidden = !many;
    }
    function step(d) { idx = (idx + d + list.length) % list.length; show(); }

    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest("a.thumb") : null;
      if (!a) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      list = qa("a.thumb", a.closest(".step") || document);
      idx = list.indexOf(a);
      origin = a;
      show();
      // le défilement de la page est gelé pendant que la photo est ouverte
      prevOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = "hidden";
      dlg.showModal();
    });
    prev.addEventListener("click", function () { step(-1); });
    next.addEventListener("click", function () { step(1); });
    close.addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft")  { e.preventDefault(); step(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
    });
    dlg.addEventListener("close", function () {
      document.documentElement.style.overflow = prevOverflow;
      img.removeAttribute("src");
      if (origin) { origin.focus({ preventScroll: true }); origin = null; }
    });
  })();

  /* =====================================================================
     ANCRES — smooth via Lenis si présent
     ===================================================================== */
  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href");
    if (id === "#" || id.length < 2) return;
    var target = q(id);
    if (!target) return;
    e.preventDefault();
    if (lenis && !REDUCE) lenis.scrollTo(target, { offset: 0, duration: 1.1 });
    else target.scrollIntoView({ behavior: REDUCE ? "auto" : "smooth", block: "start" });
  });

  startLoop();
})();
