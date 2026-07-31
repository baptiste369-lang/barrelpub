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
      var timg = document.createElement("img"); timg.alt = ""; thumb.appendChild(timg);
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
     CARROUSEL DE NUIT — compteur 01/07 (IntersectionObserver)
     ===================================================================== */
  (function () {
    var track = q("#ncTrack"), now = q("#ncNow");
    if (!track || !now || !("IntersectionObserver" in window)) return;
    var slides = qa(".nc-slide", track);
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
