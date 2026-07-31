/* =====================================================================
   BARREL PUB — main.js
   Curseur custom · révélations IntersectionObserver · mur typo · ancres
   (Le hero, Lenis et ScrollTrigger sont gérés dans hero.js.)
   ===================================================================== */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var coarse = window.matchMedia("(pointer: coarse)").matches;
  var fine = window.matchMedia("(min-width: 1024px)").matches;

  /* ---------- CURSEUR CUSTOM (disque + anneau à retard, lerp) ---------- */
  if (!reduce && !coarse && fine) {
    var dot = document.querySelector(".cursor-dot");
    var ring = document.querySelector(".cursor-ring");
    if (dot && ring) {
      document.body.classList.add("has-cursor");
      var mx = window.innerWidth / 2, my = window.innerHeight / 2;
      var rx = mx, ry = my;
      window.addEventListener("mousemove", function (e) {
        mx = e.clientX; my = e.clientY;
        dot.style.transform = "translate(" + mx + "px," + my + "px) translate(-50%,-50%)";
      }, { passive: true });

      (function loop() {
        rx += (mx - rx) * 0.15; // retard
        ry += (my - ry) * 0.15;
        ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
        requestAnimationFrame(loop);
      })();

      var hoverSel = "a, button, .tile, .shot, [data-hover]";
      document.addEventListener("mouseover", function (e) {
        if (e.target.closest(hoverSel)) ring.classList.add("is-hover");
      });
      document.addEventListener("mouseout", function (e) {
        if (e.target.closest(hoverSel)) ring.classList.remove("is-hover");
      });
      document.addEventListener("mouseleave", function () {
        dot.style.opacity = "0"; ring.style.opacity = "0";
      });
      document.addEventListener("mouseenter", function () {
        dot.style.opacity = "1"; ring.style.opacity = "1";
      });
    }
  }

  /* ---------- RÉVÉLATIONS — IntersectionObserver (jamais ScrollTrigger) ---------- */
  var revealTargets = document.querySelectorAll("[data-reveal], [data-reveal-stagger], [data-wall]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- ANCRES — smooth via Lenis si présent ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href");
    if (id === "#" || id.length < 2) return;
    var target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    var lenis = window.__barrelLenis;
    if (lenis && !reduce) {
      lenis.scrollTo(target, { offset: 0, duration: 1.1 });
    } else {
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  });

  /* ---------- HORLOGE LIVE (mouvement 3) — le JS ne fait que remplacer ---------- */
  (function () {
    var dot = document.getElementById("clockDot");
    var txt = document.getElementById("clockTxt");
    if (!dot || !txt) return;
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    function tick() {
      var d = new Date(), h = d.getHours(), m = d.getMinutes();
      var open = (h >= 18 || h < 5); // ouvert 18h → 5h
      if (open) {
        dot.classList.add("on");
        txt.textContent = pad(h) + ":" + pad(m) + " — Le Barrel est ouvert.";
      } else {
        dot.classList.remove("on");
        var mins = (18 * 60) - (h * 60 + m); // fermé seulement entre 5h et 18h
        txt.textContent = pad(h) + ":" + pad(m) + " — On ouvre dans " + Math.floor(mins / 60) + "H" + pad(mins % 60) + ".";
      }
    }
    tick();
    setInterval(tick, 30000);
  })();

  /* ---------- COUNT-UP (mouvement 9) — valeurs déjà en dur, on anime depuis 0 ---------- */
  (function () {
    var nums = [].slice.call(document.querySelectorAll(".stat b[data-count]"));
    if (!nums.length || reduce || !("IntersectionObserver" in window)) return;
    function run(el) {
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      var suffix = el.getAttribute("data-suffix") || "";
      var start = null, dur = 1200;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min(1, (ts - start) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + (p === 1 ? suffix : "");
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.4 });
    nums.forEach(function (n) { io.observe(n); });
  })();

  /* ---------- FEED INSTAGRAM (mouvement 11) — lazy, une seule fois, fallback toujours présent ---------- */
  (function () {
    var feed = document.getElementById("igFeed");
    if (!feed || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          // Aperçu photos + lien = fallback permanent. Hook pour l'embed officiel (chargé une seule fois).
          feed.setAttribute("data-loaded", "true");
          io.disconnect();
        }
      });
    }, { rootMargin: "600px 0px" });
    io.observe(feed);
  })();
})();
