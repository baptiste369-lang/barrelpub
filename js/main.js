/* =====================================================================
   BARREL PUB — main.js (v2.1)
   Toutes les animations sous le hero. RÈGLES :
   · hero.js n'est jamais touché ; il possède le rAF (gsap.ticker + Lenis).
   · Aucun ScrollTrigger ici. IntersectionObserver ou le ticker global.
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
    var skewEls = qa(".wall, .neon, #jeu-title, #carte-title, #sortie-title");
    skewEls.forEach(function (el) { el.setAttribute("data-skew", ""); });
    if (skewEls.length) {
      onFrame(function () {
        var s = clamp(smoothVel * 0.4, -3.5, 3.5);
        for (var i = 0; i < skewEls.length; i++) skewEls[i].style.transform = "skewY(" + s + "deg)";
      });
    }
  }

  /* =====================================================================
     PARALLAXE INVERSÉE — la photo des chiens (0,88×, ±60px)
     ===================================================================== */
  (function () {
    var img = q(".dogs-parallax"), fig = img ? img.closest(".seuil-shot") : null;
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
     §3bis.2 — LE MUR DES TROIS NÉONS
     Chaque néon s'allume en entrant dans le viewport. Contrainte du brief :
     jamais plus de DEUX néons allumés en même temps — si un troisième entre,
     on éteint le plus ancien. IntersectionObserver, aucun ScrollTrigger.
     Sans JS (ou sans IO) : tout est allumé, la séquence reste lisible.
     ===================================================================== */
  (function () {
    var walls = qa("#neonRun .neon-wall");
    if (!walls.length) return;
    if (!("IntersectionObserver" in window)) {
      walls.forEach(function (w) { w.classList.add("is-lit"); });
      return;
    }
    var lit = [];
    var nio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var i = lit.indexOf(e.target);
        if (e.isIntersecting) {
          if (i === -1) lit.push(e.target);
          e.target.classList.add("is-lit");
        } else {
          if (i !== -1) lit.splice(i, 1);
          e.target.classList.remove("is-lit");
        }
      });
      while (lit.length > 2) { lit.shift().classList.remove("is-lit"); }
    }, { threshold: 0.35 });
    walls.forEach(function (w) { nio.observe(w); });
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
