/* =====================================================================
   BARREL PUB — galerie.js (V3.0)
   Filtres, pagination et agrandissement de la page galerie.

   RÈGLES DU LOT :
   · Aucune image n'est jamais rechargée : le filtre masque, il ne reconstruit
     pas la grille. Les 110 <figure> sont dans le HTML dès le départ ; celles
     au-delà de la 24e portent [hidden], donc display:none, donc le navigateur
     ne va pas les chercher.
   · Aucun ScrollTrigger, aucune dépendance : ce fichier tourne seul, gsap n'est
     pas chargé sur cette page. js/hero.js non plus.
   · prefers-reduced-motion : changement instantané, aucune transition.
   ===================================================================== */
(function () {
  "use strict";

  var grid = document.getElementById("galGrid");
  if (!grid) return;

  var REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var PAGE   = 24;

  var items   = [].slice.call(grid.querySelectorAll(".gal-item"));
  var buttons = [].slice.call(document.querySelectorAll(".gal-filter"));
  var more    = document.getElementById("galMore");
  var status  = document.getElementById("galStatus");
  var empty   = document.getElementById("galEmpty");

  var cat   = "tout";
  var shown = PAGE;

  /* ---------- compteurs écrits depuis le DOM ---------- */
  (function counts() {
    var per = {};
    items.forEach(function (el) {
      var c = el.getAttribute("data-cat");
      per[c] = (per[c] || 0) + 1;
    });
    buttons.forEach(function (b) {
      var f = b.getAttribute("data-filter");
      var n = f === "tout" ? items.length : (per[f] || 0);
      var i = document.createElement("i");
      i.textContent = n;
      b.appendChild(document.createTextNode(" "));
      b.appendChild(i);
    });
  })();

  function matching() {
    if (cat === "tout") return items;
    return items.filter(function (el) { return el.getAttribute("data-cat") === cat; });
  }

  /* ---------- l'unique mutation du DOM ---------- */
  function paint() {
    var list = matching();
    var visible = {};
    for (var i = 0; i < list.length && i < shown; i++) visible[list[i].dataset.gid] = 1;

    items.forEach(function (el) {
      var on = visible[el.dataset.gid] === 1;
      if (on === !el.hidden) return;      // rien à changer
      el.hidden = !on;
    });

    var n = Math.min(shown, list.length);
    if (status) {
      status.textContent = list.length
        ? n + " photo" + (n > 1 ? "s" : "") + " sur " + list.length
        : "";
    }
    if (more) more.hidden = n >= list.length;
    if (empty) empty.hidden = list.length > 0;
  }

  // identifiant stable, pour ne pas comparer des nœuds dans une boucle chaude
  items.forEach(function (el, i) { el.dataset.gid = i; });

  /* ---------- le fondu : View Transitions, sinon 200 ms d'opacité ---------- */
  function repaint(animate) {
    if (!animate || REDUCE) { paint(); return; }

    if (document.startViewTransition) {
      var vt = document.startViewTransition(paint);
      // Une transition annulée (deux clics coup sur coup, onglet caché) rejette
      // ses promesses. Le DOM est déjà à jour à ce moment-là : il n'y a rien à
      // rattraper, seulement une erreur non gérée à ne pas laisser en console.
      var hush = function () {};
      if (vt) {
        if (vt.ready) vt.ready.catch(hush);
        if (vt.finished) vt.finished.catch(hush);
        if (vt.updateCallbackDone) vt.updateCallbackDone.catch(hush);
      }
      return;
    }
    grid.classList.add("is-fading");
    setTimeout(function () {
      paint();
      grid.classList.remove("is-fading");
    }, 200);
  }

  /* ---------- filtres ---------- */
  buttons.forEach(function (b) {
    b.addEventListener("click", function () {
      var f = b.getAttribute("data-filter");
      if (f === cat) return;
      cat = f;
      shown = PAGE;
      buttons.forEach(function (o) {
        o.setAttribute("aria-pressed", String(o === b));
      });
      repaint(true);
    });
  });

  /* ---------- « voir plus » ----------
     Pas de fondu ici : on ajoute à la suite, on ne remplace pas. Un
     cross-fade de toute la grille pour vingt-quatre vignettes de plus
     ferait clignoter ce qui était déjà à l'écran. */
  if (more) {
    more.addEventListener("click", function () {
      shown += PAGE;
      paint();
      var list = matching();
      var first = list[Math.min(shown - PAGE, list.length - 1)];
      if (first) {
        var a = first.querySelector("a");
        if (a) a.focus({ preventScroll: true });
      }
    });
  }

  /* =====================================================================
     L'AGRANDISSEMENT — Popover API
     Une seule boîte pour les 110 photos : on n'instancie pas 110 popovers.
     Si le navigateur ne connaît pas la Popover API, on ne touche à rien :
     le clic suit le href et ouvre la photo seule (§1.3, « repli »).
     ===================================================================== */
  (function lightbox() {
    var box = document.getElementById("galLightbox");
    if (!box) return;
    if (typeof box.showPopover !== "function" || typeof box.togglePopover !== "function") return;

    var img   = document.getElementById("glbImg");
    var cap   = document.getElementById("glbCap");
    var close = document.getElementById("glbClose");
    if (!img || !cap) return;

    box.setAttribute("popover", "auto");
    box.hidden = false;

    var last = null;

    grid.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest(".gal-open") : null;
      if (!a || !grid.contains(a)) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();

      var src = a.getAttribute("href");
      var thumb = a.querySelector("img");
      img.setAttribute("src", src);
      img.setAttribute("alt", thumb ? thumb.getAttribute("alt") : "");
      if (thumb) {
        img.setAttribute("width", thumb.getAttribute("width"));
        img.setAttribute("height", thumb.getAttribute("height"));
      }
      cap.textContent = a.getAttribute("data-cap") || "";
      last = a;
      try { box.showPopover(); } catch (err) { location.href = src; }
    });

    if (close) close.addEventListener("click", function () { box.hidePopover(); });

    // Le clic extérieur est géré par popover="auto" — vérifié.
    // Échap devrait l'être aussi, mais certains environnements embarqués
    // (webviews, navigateurs intégrés à une application) reçoivent bien la
    // touche sans déclencher la fermeture native. Le filet ci-dessous est
    // strictement conditionné à « la boîte est ouverte » : quand le navigateur
    // fait déjà le travail, il n'a rien à faire.
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape" && e.key !== "Esc") return;
      if (!box.matches(":popover-open")) return;
      box.hidePopover();
    });

    // Reste à rendre le focus au lien d'où l'on vient et à libérer la source.
    // Une photo pleine résolution laissée en mémoire pour rien, c'est tout.
    box.addEventListener("toggle", function (e) {
      if (e.newState === "closed") {
        if (last) { last.focus({ preventScroll: true }); last = null; }
        img.removeAttribute("src");
      }
    });
  })();

  paint();
})();
