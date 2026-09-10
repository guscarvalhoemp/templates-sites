/* =========================================================
   IRONCAGE BOXING & PERFORMANCE — SCRIPT
   Vanilla JS + GSAP / ScrollTrigger (via CDN, ver index.html).
   Sem outras dependências externas.
========================================================= */
(function () {
  "use strict";

  var hasGSAP = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* -----------------------------------------------------
     1. MENU MOBILE (HAMBÚRGUER)
  ----------------------------------------------------- */
  var hamburger = document.getElementById("hamburger");
  var mobileMenu = document.getElementById("mobile-menu");

  function closeMobileMenu() {
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.setAttribute("aria-label", "Abrir menu");
    mobileMenu.hidden = true;
  }

  function openMobileMenu() {
    hamburger.setAttribute("aria-expanded", "true");
    hamburger.setAttribute("aria-label", "Fechar menu");
    mobileMenu.hidden = false;
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", function () {
      var isOpen = hamburger.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    // Fecha o menu ao clicar em qualquer link
    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMobileMenu);
    });

    // Fecha com a tecla Esc
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && hamburger.getAttribute("aria-expanded") === "true") {
        closeMobileMenu();
        hamburger.focus();
      }
    });

    // Fecha o menu se a tela for redimensionada para desktop
    window.addEventListener("resize", function () {
      if (window.innerWidth > 960 && hamburger.getAttribute("aria-expanded") === "true") {
        closeMobileMenu();
      }
    });
  }

  /* -----------------------------------------------------
     2. ANIMAÇÕES GSAP — entrada da hero, parallax, reveals
        de scroll e contador de estatísticas.

     Tudo roda dentro de gsap.matchMedia() para respeitar
     prefers-reduced-motion: quando o usuário pediu movimento
     reduzido, as animações são substituídas pelo estado final
     estático (sem stagger, sem parallax, sem contagem).

     Se o GSAP/ScrollTrigger não carregar (ex.: CDN indisponível),
     caímos num fallback simples que apenas garante que os números
     de estatística mostrem o valor final — nada fica escondido,
     pois o estado inicial "oculto" só é aplicado via gsap.set()
     quando o GSAP de fato está disponível.
  ----------------------------------------------------- */
  if (hasGSAP) {
    initGsapAnimations();
  } else {
    document.querySelectorAll(".stat-number").forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      el.textContent = target + (el.getAttribute("data-suffix") || "");
    });
  }

  function initGsapAnimations() {
    var mm = gsap.matchMedia();

    mm.add(
      {
        reduceMotion: "(prefers-reduced-motion: reduce)",
        motionOK: "(prefers-reduced-motion: no-preference)"
      },
      function (context) {
        var reduceMotion = context.conditions.reduceMotion;

        /* --- 2.1 ENTRADA DA HERO (stagger/slide) --- */
        var heroTargets = gsap.utils.toArray(
          ".eyebrow, .hero-title, .hero-lead, .hero-cta .btn"
        );

        if (reduceMotion) {
          gsap.set(heroTargets, { autoAlpha: 1, y: 0 });
        } else {
          gsap.timeline({ defaults: { ease: "power3.out" } })
            .from(".eyebrow", { autoAlpha: 0, y: 20, duration: 0.6 })
            .from(".hero-title", { autoAlpha: 0, y: 42, duration: 0.85 }, "-=0.35")
            .from(".hero-lead", { autoAlpha: 0, y: 24, duration: 0.7 }, "-=0.5")
            .from(".hero-cta .btn", { autoAlpha: 0, y: 18, duration: 0.6, stagger: 0.12 }, "-=0.4");
        }

        /* --- 2.2 PARALLAX SUTIL NAS IMAGENS DE FUNDO --- */
        if (!reduceMotion) {
          gsap.to(".hero-media img", {
            yPercent: 14,
            ease: "none",
            scrollTrigger: {
              trigger: ".hero",
              start: "top top",
              end: "bottom top",
              scrub: true
            }
          });

          gsap.to(".cta-final-media img", {
            yPercent: 12,
            ease: "none",
            scrollTrigger: {
              trigger: ".cta-final",
              start: "top bottom",
              end: "bottom top",
              scrub: true
            }
          });
        }

        /* --- 2.3 CONTADOR DE ESTATÍSTICAS (gsap.to em objeto) --- */
        gsap.utils.toArray(".stat-number").forEach(function (el) {
          var target = parseInt(el.getAttribute("data-count"), 10) || 0;
          var suffix = el.getAttribute("data-suffix") || "";

          if (reduceMotion) {
            el.textContent = target + suffix;
            return;
          }

          var counter = { val: 0 };
          gsap.to(counter, {
            val: target,
            duration: 1.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              once: true
            },
            onUpdate: function () {
              el.textContent = Math.round(counter.val) + suffix;
            }
          });
        });

        /* --- 2.4 REVEAL DOS CARDS EM GRID (stagger ao entrar) --- */
        var cardGroups = [".prog-card", ".coach-card", ".testi-card", ".price-card", ".diff-list li"];

        cardGroups.forEach(function (selector) {
          var items = gsap.utils.toArray(selector);
          if (!items.length) return;

          if (reduceMotion) {
            gsap.set(items, { autoAlpha: 1, y: 0 });
            return;
          }

          gsap.set(items, { autoAlpha: 0, y: 32 });
          ScrollTrigger.batch(items, {
            start: "top 88%",
            once: true,
            onEnter: function (batch) {
              gsap.to(batch, {
                autoAlpha: 1,
                y: 0,
                duration: 0.7,
                ease: "power2.out",
                stagger: 0.12,
                overwrite: true
              });
            }
          });
        });

        /* --- 2.5 REVEAL DOS TÍTULOS E LEADS DE SEÇÃO --- */
        var textTargets = gsap.utils.toArray(".section-title, .section-lead");

        if (reduceMotion) {
          gsap.set(textTargets, { autoAlpha: 1, y: 0 });
        } else {
          textTargets.forEach(function (el) {
            gsap.set(el, { autoAlpha: 0, y: 24 });
            gsap.to(el, {
              autoAlpha: 1,
              y: 0,
              duration: 0.8,
              ease: "power2.out",
              scrollTrigger: {
                trigger: el,
                start: "top 90%",
                once: true
              }
            });
          });
        }

        // cleanup: gsap.matchMedia() já reverte tudo sozinho ao sair da condição.
      }
    );
  }

  /* -----------------------------------------------------
     3. FAQ — ACCORDION ACESSÍVEL
  ----------------------------------------------------- */
  var accordion = document.getElementById("accordion");

  if (accordion) {
    var triggers = accordion.querySelectorAll(".accordion-trigger");

    triggers.forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        var expanded = trigger.getAttribute("aria-expanded") === "true";
        var panel = document.getElementById(trigger.getAttribute("aria-controls"));

        // Fecha os outros itens (comportamento de acordeão único)
        triggers.forEach(function (otherTrigger) {
          if (otherTrigger !== trigger) {
            otherTrigger.setAttribute("aria-expanded", "false");
            var otherPanel = document.getElementById(otherTrigger.getAttribute("aria-controls"));
            if (otherPanel) otherPanel.hidden = true;
          }
        });

        trigger.setAttribute("aria-expanded", String(!expanded));
        if (panel) panel.hidden = expanded;
      });
    });
  }

  /* -----------------------------------------------------
     4. CABEÇALHO — SOMBRA/COMPACTAÇÃO AO ROLAR
  ----------------------------------------------------- */
  var header = document.getElementById("site-header");

  function onScroll() {
    var currentScrollY = window.scrollY;
    if (header) {
      if (currentScrollY > 12) {
        header.style.boxShadow = "0 12px 30px -18px rgba(0,0,0,.7)";
      } else {
        header.style.boxShadow = "none";
      }
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* -----------------------------------------------------
     5. FORMULÁRIO DE CONTATO — VALIDAÇÃO E FEEDBACK SIMPLES
     (sem backend real — apenas feedback visual ao usuário)
  ----------------------------------------------------- */
  var contactForm = document.querySelector(".contact-form");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var isValid = contactForm.checkValidity();
      if (!isValid) {
        contactForm.reportValidity();
        return;
      }

      var submitBtn = contactForm.querySelector('button[type="submit"]');
      var originalText = submitBtn.textContent;

      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando...";

      window.setTimeout(function () {
        submitBtn.textContent = "Recebemos sua solicitação!";
        contactForm.reset();
        window.setTimeout(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }, 3000);
      }, 900);
    });
  }

  /* -----------------------------------------------------
     6. ANO DINÂMICO NO RODAPÉ
  ----------------------------------------------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();
