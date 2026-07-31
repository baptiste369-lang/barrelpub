/* =====================================================================
   BARREL PUB — hero.js
   Séquence d'images scrubbée sur <canvas>. Technique Apple.
   Failsafe : le scroll se déverrouille DANS TOUS LES CAS.
   ===================================================================== */
(function () {
  "use strict";

  var html = document.documentElement;
  var loader = document.getElementById("loader");
  var started = false;

  function reveal() {
    html.classList.remove("is-locked");
    if (loader) loader.classList.add("gone");
  }

  // --- FAILSAFE 1 : quoi qu'il arrive, dans 7s le scroll est rendu ---
  setTimeout(reveal, 7000);

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var FRAME_COUNT = 227;
  var isMobile = window.matchMedia("(max-width: 767px)").matches; // figé au chargement
  var DIR = isMobile ? "frames/mobile/" : "frames/desktop/";
  function src(i) { return DIR + "f_" + ("00" + i).slice(-3) + ".webp"; }

  var canvas = document.getElementById("hero-canvas");
  // --- FAILSAFE 2 : pas de canvas ---
  if (!canvas) { reveal(); return; }
  var ctx = canvas.getContext("2d");
  // --- FAILSAFE 3 : pas de contexte 2D ---
  if (!ctx) { reveal(); return; }

  var images = [], loaded = 0, current = -1;
  var lbar = document.getElementById("lbar");
  var lpct = document.getElementById("lpct");
  var lmFill = document.getElementById("lmFill");
  var cues = [].slice.call(document.querySelectorAll(".cue"));
  var scrollCue = document.getElementById("scrollCue");

  function sizeCanvas() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2); // clamp 2
    var w = canvas.clientWidth, h = canvas.clientHeight;
    var nw = Math.round(w * dpr), nh = Math.round(h * dpr);
    if (canvas.width !== nw || canvas.height !== nh) {
      canvas.width = nw; canvas.height = nh;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w: w, h: h };
  }

  function draw(i) {
    var img = images[i];
    if (!img || !img.complete || !img.naturalWidth) return;
    current = i;
    var s = sizeCanvas();
    ctx.clearRect(0, 0, s.w, s.h);
    // cover manuel : max des deux échelles, centré
    var scale = Math.max(s.w / img.naturalWidth, s.h / img.naturalHeight);
    var dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
    ctx.drawImage(img, (s.w - dw) / 2, (s.h - dh) / 2, dw, dh);
  }

  function setProgress(p) {
    var idx = Math.round(p * (FRAME_COUNT - 1));
    if (idx < 0) idx = 0; if (idx > FRAME_COUNT - 1) idx = FRAME_COUNT - 1;
    if (idx !== current) draw(idx);
    for (var k = 0; k < cues.length; k++) {
      var c = cues[k];
      var a = parseFloat(c.getAttribute("data-in"));
      var b = parseFloat(c.getAttribute("data-out"));
      var on = p >= a && p <= b;
      if (on !== c.classList.contains("on")) c.classList.toggle("on", on);
    }
    if (scrollCue) scrollCue.classList.toggle("hide", p > 0.02);
  }

  function onFrame() {
    // s'incrémente sur onload ET onerror : une image manquante ne bloque pas
    loaded++;
    var p = Math.round(loaded / FRAME_COUNT * 100);
    if (lbar) lbar.style.width = p + "%";
    if (lpct) lpct.textContent = p;
    if (lmFill) lmFill.style.clipPath = "inset(" + (100 - p) + "% 0 0 0)";
    if (loaded >= FRAME_COUNT) start();
  }

  // Préchargement complet
  for (var i = 1; i <= FRAME_COUNT; i++) {
    var im = new Image();
    im.onload = onFrame;
    im.onerror = onFrame;
    im.src = src(i);
    images.push(im);
  }

  // Repli sans GSAP : hero = image fixe (dernière frame), scroll normal
  function heroStaticFallback() {
    function paintLast() {
      var img = images[FRAME_COUNT - 1];
      if (img && img.complete && img.naturalWidth) draw(FRAME_COUNT - 1);
      else draw(0);
    }
    paintLast();
    window.addEventListener("resize", function () { current = -1; paintLast(); });
    if (scrollCue) scrollCue.classList.add("hide");
  }

  function start() {
    if (started) return;
    started = true;
    reveal();

    // --- Mouvement réduit : pas d'animation, image fixe ---
    if (reduce) { heroStaticFallback(); return; }

    // --- FAILSAFE 4 : GSAP absent (CDN bloqué / JS en erreur) ---
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      heroStaticFallback();
      // scrub léger au scroll natif pour rester vivant
      window.addEventListener("scroll", function () {
        var p = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight || 1)));
        setProgress(p);
      }, { passive: true });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    if (window.CustomEase) { try { CustomEase.create("barrel", "0.625, 0.05, 0, 1"); } catch (e) {} }

    // Lenis (smooth scroll) couplé à ScrollTrigger
    var lenis = null;
    if (window.Lenis) {
      lenis = new Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.4 });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
      window.__barrelLenis = lenis; // exposé pour main.js (ancres)
    }

    draw(0);

    ScrollTrigger.create({
      trigger: "#hero",
      start: "top top",
      end: "+=600%",
      pin: true,
      scrub: 0.8,
      invalidateOnRefresh: true,
      onUpdate: function (self) { setProgress(self.progress); }
    });

    // Redessin sur resize (debounce 150ms) + recalcul cover
    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        current = -1;
        ScrollTrigger.refresh();
        setProgress(ScrollTrigger.getAll().length ? (window.scrollY / (document.body.scrollHeight - window.innerHeight) || 0) : 0);
      }, 150);
    });

    ScrollTrigger.refresh();
  }
})();
