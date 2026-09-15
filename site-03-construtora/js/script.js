/* ===========================================================
   Cerne Construções — interações
   GSAP 3.13.0 + ScrollTrigger + Flip
   Assinatura: reveal contido em stagger + expansão de galeria
   via Flip. Sem parallax agressivo, sem scroll horizontal,
   sem pulso.
   =========================================================== */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    var hasGSAP = typeof window.gsap !== "undefined";
    if (hasGSAP) {
      gsap.registerPlugin(ScrollTrigger, Flip);
    }

    setupHeader(hasGSAP);
    setupMobileMenu();
    setupReveals(hasGSAP);
    setupLightbox(hasGSAP);

    if (hasGSAP && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        ScrollTrigger.refresh();
      });
    }
  }

  /* ---------- Header: estado "scrolled" ---------- */
  function setupHeader(hasGSAP) {
    var header = document.getElementById("siteHeader");
    if (!header) return;

    if (hasGSAP) {
      ScrollTrigger.create({
        start: "top -60",
        end: 999999,
        toggleClass: { targets: header, className: "is-scrolled" }
      });
    } else {
      window.addEventListener(
        "scroll",
        function () {
          header.classList.toggle("is-scrolled", window.scrollY > 60);
        },
        { passive: true }
      );
    }
  }

  /* ---------- Menu mobile ---------- */
  function setupMobileMenu() {
    var burger = document.getElementById("navBurger");
    var menu = document.getElementById("mobileMenu");
    if (!burger || !menu) return;

    var links = menu.querySelectorAll("a");

    function closeMenu() {
      burger.setAttribute("aria-expanded", "false");
      menu.dataset.state = "closed";
    }
    function openMenu() {
      burger.setAttribute("aria-expanded", "true");
      menu.dataset.state = "open";
    }

    burger.addEventListener("click", function () {
      var isOpen = burger.getAttribute("aria-expanded") === "true";
      if (isOpen) closeMenu();
      else openMenu();
    });

    links.forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ---------- Reveals sutis em stagger ----------
     Estado inicial de ocultação é aplicado via JS (gsap.set),
     nunca via CSS estático — assim, se o GSAP falhar ao carregar,
     nenhum conteúdo fica preso em opacity:0. */
  function setupReveals(hasGSAP) {
    if (!hasGSAP) return;

    var mm = gsap.matchMedia();

    // condição "sempre verdadeira" garante que o handler roda em
    // qualquer largura de tela — evita o bug de matchMedia com
    // condições não exaustivas nunca disparando em algumas telas.
    mm.add(
      {
        always: "(min-width: 1px)",
        reduceMotion: "(prefers-reduced-motion: reduce)"
      },
      function (context) {
        var reduceMotion = context.conditions.reduceMotion;

        // Hero — entrada imediata ao carregar
        var heroEls = gsap.utils.toArray("[data-hero-reveal]");
        if (heroEls.length) {
          if (reduceMotion) {
            gsap.set(heroEls, { autoAlpha: 1, y: 0 });
          } else {
            gsap.set(heroEls, { autoAlpha: 0, y: 22 });
            gsap.to(heroEls, {
              autoAlpha: 1,
              y: 0,
              duration: 1,
              ease: "power2.out",
              stagger: 0.12,
              delay: 0.15
            });
          }
        }

        // Elementos genéricos revelados ao rolar (títulos, textos)
        var revealEls = gsap.utils.toArray("[data-reveal]");
        if (revealEls.length) {
          if (reduceMotion) {
            gsap.set(revealEls, { autoAlpha: 1, y: 0 });
          } else {
            gsap.set(revealEls, { autoAlpha: 0, y: 26 });
            ScrollTrigger.batch(revealEls, {
              start: "top 88%",
              once: true,
              onEnter: function (batch) {
                gsap.to(batch, {
                  autoAlpha: 1,
                  y: 0,
                  duration: 0.8,
                  ease: "power2.out",
                  stagger: 0.08,
                  overwrite: true
                });
              }
            });
          }
        }

        // Passos do processo (studio__steps li) — leve stagger próprio
        var steps = gsap.utils.toArray(".studio__steps li");
        if (steps.length) {
          if (reduceMotion) {
            gsap.set(steps, { autoAlpha: 1, x: 0 });
          } else {
            gsap.set(steps, { autoAlpha: 0, x: -16 });
            ScrollTrigger.batch(steps, {
              start: "top 90%",
              once: true,
              onEnter: function (batch) {
                gsap.to(batch, {
                  autoAlpha: 1,
                  x: 0,
                  duration: 0.7,
                  ease: "power2.out",
                  stagger: 0.06,
                  overwrite: true
                });
              }
            });
          }
        }

        // Galeria masonry — stagger leve ao entrar na viewport
        var items = gsap.utils.toArray(".masonry__item");
        if (items.length) {
          if (reduceMotion) {
            gsap.set(items, { autoAlpha: 1, y: 0 });
          } else {
            gsap.set(items, { autoAlpha: 0, y: 34 });
            ScrollTrigger.batch(items, {
              start: "top 90%",
              once: true,
              onEnter: function (batch) {
                gsap.to(batch, {
                  autoAlpha: 1,
                  y: 0,
                  duration: 0.85,
                  ease: "power2.out",
                  stagger: { each: 0.09, from: "start" },
                  overwrite: true
                });
              }
            });
          }
        }

        return function cleanup() {
          // gsap.matchMedia reverte tweens/ScrollTriggers automaticamente
        };
      }
    );
  }

  /* ---------- Lightbox — expansão de obra via GSAP Flip ---------- */
  function setupLightbox(hasGSAP) {
    var lightbox = document.getElementById("lightbox");
    var stage = document.getElementById("lightboxStage");
    var scrim = document.getElementById("lightboxScrim");
    var closeBtn = document.getElementById("lightboxClose");
    var captionEl = document.getElementById("lightboxCaption");
    var triggers = document.querySelectorAll(".masonry__trigger");
    if (!lightbox || !stage || !triggers.length) return;

    var activeClone = null;
    var activeTrigger = null;
    var reduceMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    triggers.forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        openLightbox(trigger);
      });
    });

    closeBtn.addEventListener("click", closeLightbox);
    scrim.addEventListener("click", closeLightbox);
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lightbox.classList.contains("is-open")) {
        closeLightbox();
      }
    });

    function openLightbox(trigger) {
      var img = trigger.querySelector("img");
      if (!img) return;

      activeTrigger = trigger;
      var rect = img.getBoundingClientRect();

      var clone = document.createElement("img");
      clone.src = img.currentSrc || img.src;
      clone.alt = img.alt || "";
      clone.className = "lightbox__img";
      clone.style.top = rect.top + "px";
      clone.style.left = rect.left + "px";
      clone.style.width = rect.width + "px";
      clone.style.height = rect.height + "px";
      stage.appendChild(clone);
      activeClone = clone;

      var title = trigger.getAttribute("data-title") || "";
      var meta = trigger.getAttribute("data-meta") || "";
      captionEl.textContent = title + (meta ? ", " + meta : "");

      document.documentElement.classList.add("lightbox-open");
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");

      var target = computeFinalRect(rect);

      if (!hasGSAP || reduceMotion) {
        clone.style.top = target.top + "px";
        clone.style.left = target.left + "px";
        clone.style.width = target.width + "px";
        clone.style.height = target.height + "px";
        scrim.style.opacity = "1";
        captionEl.style.opacity = "1";
        closeBtn.focus();
        return;
      }

      var state = Flip.getState(clone);
      clone.style.top = target.top + "px";
      clone.style.left = target.left + "px";
      clone.style.width = target.width + "px";
      clone.style.height = target.height + "px";

      gsap.to(scrim, { opacity: 1, duration: 0.5, ease: "power1.out" });
      Flip.from(state, {
        duration: 0.6,
        ease: "power3.inOut",
        absolute: true,
        onComplete: function () {
          gsap.to(captionEl, { opacity: 1, duration: 0.4, ease: "power1.out" });
          closeBtn.focus();
        }
      });
    }

    function closeLightbox() {
      if (!activeClone) return;
      var clone = activeClone;
      var trigger = activeTrigger;
      var originImg = trigger ? trigger.querySelector("img") : null;
      var originRect = originImg
        ? originImg.getBoundingClientRect()
        : { top: clone.offsetTop, left: clone.offsetLeft, width: clone.offsetWidth, height: clone.offsetHeight };

      function finish() {
        clone.remove();
        activeClone = null;
        document.documentElement.classList.remove("lightbox-open");
        lightbox.classList.remove("is-open");
        lightbox.setAttribute("aria-hidden", "true");
        scrim.style.opacity = "0";
        captionEl.style.opacity = "0";
        if (trigger) trigger.focus();
        activeTrigger = null;
      }

      if (!hasGSAP || reduceMotion) {
        finish();
        return;
      }

      gsap.to(scrim, { opacity: 0, duration: 0.35, ease: "power1.out" });
      gsap.to(captionEl, { opacity: 0, duration: 0.25, ease: "power1.out" });

      var state = Flip.getState(clone);
      clone.style.top = originRect.top + "px";
      clone.style.left = originRect.left + "px";
      clone.style.width = originRect.width + "px";
      clone.style.height = originRect.height + "px";

      Flip.from(state, {
        duration: 0.5,
        ease: "power3.inOut",
        absolute: true,
        onComplete: finish
      });
    }

    function computeFinalRect(originRect) {
      var vw = window.innerWidth;
      var vh = window.innerHeight;
      var maxW = Math.min(vw * 0.9, 1200);
      var maxH = vh * 0.82;
      var ratio = originRect.width / originRect.height || 1;

      var w = maxW;
      var h = w / ratio;
      if (h > maxH) {
        h = maxH;
        w = h * ratio;
      }
      return {
        width: w,
        height: h,
        left: (vw - w) / 2,
        top: (vh - h) / 2
      };
    }
  }
})();
