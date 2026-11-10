(function () {
  "use strict";

  var root = document.documentElement;

  /* ---------- Mouvement réduit (préférence système + bouton) ---------- */
  var motionBtn = document.getElementById("motionToggle");
  var mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  var saved = null;
  try { saved = localStorage.getItem("reduce-motion"); } catch (e) { /* stockage indisponible */ }

  function setMotion(reduce, persist) {
    root.classList.toggle("reduce-motion", reduce);
    if (motionBtn) motionBtn.setAttribute("aria-pressed", String(reduce));
    if (persist) {
      try { localStorage.setItem("reduce-motion", reduce ? "1" : "0"); } catch (e) { /* ignoré */ }
    }
  }
  setMotion(saved === null ? mq.matches : saved === "1", false);
  if (motionBtn) {
    motionBtn.addEventListener("click", function () {
      setMotion(!root.classList.contains("reduce-motion"), true);
    });
  }

  /* ---------- Navigation ---------- */
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");
  var links = document.querySelectorAll("#navLinks a");

  function onScroll() {
    nav.classList.toggle("is-solid", window.scrollY > 24);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  function closeMenu() {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "Menu";
  }
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.textContent = open ? "Fermer" : "Menu";
  });
  links.forEach(function (a) { a.addEventListener("click", closeMenu); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      closeMenu();
      toggle.focus();
    }
  });

  /* ---------- Lien actif selon la section visible ---------- */
  if ("IntersectionObserver" in window) {
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var sectionObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = map[en.target.id];
        if (!a || a.classList.contains("nav__cta")) return;
        if (en.isIntersecting) {
          links.forEach(function (l) { l.removeAttribute("aria-current"); });
          a.setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) sectionObs.observe(s);
    });

    /* ---------- Apparition au défilement ---------- */
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          revealObs.unobserve(en.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    document.querySelectorAll("[data-reveal]").forEach(function (el) { revealObs.observe(el); });
  } else {
    document.querySelectorAll("[data-reveal]").forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Année du pied de page ---------- */
  var y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());

  /* ---------- Formulaire Netlify sans rechargement ---------- */
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");
  var btn = document.getElementById("sendBtn");
  if (form && window.fetch) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.className = "form__status";
      status.textContent = "";
      btn.disabled = true;
      var body = new URLSearchParams(new FormData(form)).toString();
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body
      })
        .then(function (r) {
          if (!r.ok) throw new Error("http " + r.status);
          form.reset();
          status.className = "form__status is-ok";
          status.textContent = "Message envoyé. Je vous réponds dès que possible.";
        })
        .catch(function () {
          status.className = "form__status is-err";
          status.textContent = "Le message n'est pas parti. Écrivez-moi directement à Jniapoh@gmail.com.";
        })
        .then(function () { btn.disabled = false; });
    });
  }
})();
