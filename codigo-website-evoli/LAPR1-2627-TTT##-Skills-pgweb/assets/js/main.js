/* EVOLI — scripts da página web (vanilla) */
(function () {
  "use strict";

  /* Lenis — scroll suave */
  var lenis = null;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion && typeof Lenis !== "undefined") {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }

  /* Âncoras com offset do cabeçalho */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -86 });
      else target.scrollIntoView({ behavior: "smooth", block: "start" });
      var nav = document.getElementById("navMob");
      if (nav && nav.classList.contains("show")) {
        window.bootstrap && window.bootstrap.Collapse.getOrCreateInstance(nav).hide();
      }
    });
  });

  /* Cabeçalho com sombra ao fazer scroll */
  var header = document.querySelector(".nav-glass");
  var lastY = -1;
  function onScrollFrame() {
    var y = window.scrollY || 0;
    if (y !== lastY) {
      lastY = y;
      if (header) header.classList.toggle("scrolled", y > 24);
      document.querySelectorAll("[data-parallax]").forEach(function (el) {
        var speed = parseFloat(el.getAttribute("data-parallax")) || 0.05;
        el.style.transform = "translateY(" + (y * speed).toFixed(1) + "px)";
      });
    }
    requestAnimationFrame(onScrollFrame);
  }
  requestAnimationFrame(onScrollFrame);

  /* Revelação ao scroll */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = parseInt(entry.target.getAttribute("data-reveal-delay") || "0", 10);
          entry.target.style.transitionDelay = delay + "ms";
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  }
})();
