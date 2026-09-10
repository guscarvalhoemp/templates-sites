/* =========================================================================
   Marchetti & Souza Advogados — comportamento
   Paradigma: dossiê editorial (split-screen pinado + trilho de índice)
   ========================================================================= */
(function () {
  "use strict";

  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };

  var HEADER_OFFSET = 108; // px — folga abaixo do cabeçalho fixo no desktop

  /* -----------------------------------------------------------------------
     Ano do rodapé
  ----------------------------------------------------------------------- */
  var yearEl = document.getElementById("anoAtual");
  if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }

  /* -----------------------------------------------------------------------
     Cabeçalho: fundo sólido depois do topo
  ----------------------------------------------------------------------- */
  var header = $(".site-header");
  function syncHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  /* -----------------------------------------------------------------------
     Menu móvel
  ----------------------------------------------------------------------- */
  var menuToggle = document.getElementById("menuToggle");
  var mobileMenu = document.getElementById("mobileMenu");

  function setMenu(open) {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    mobileMenu.setAttribute("data-state", open ? "open" : "closed");
    mobileMenu.setAttribute("aria-hidden", open ? "false" : "true");
    document.body.style.overflow = open ? "hidden" : "";
    var word = $(".menu-toggle-word", menuToggle);
    if (word) { word.textContent = open ? "Fechar" : "Menu"; }
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", function () {
      setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
    });
    $$("a", mobileMenu).forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { setMenu(false); }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1024) { setMenu(false); }
    });
  }

  /* -----------------------------------------------------------------------
     Formulário (front-end apenas)
  ----------------------------------------------------------------------- */
  var contactForm = document.getElementById("contactForm");
  var formNote = document.getElementById("formNote");
  if (contactForm && formNote) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      formNote.textContent =
        "Mensagem registrada. Um dos sócios retorna o contato em até um dia útil.";
      contactForm.reset();
    });
  }

  /* -----------------------------------------------------------------------
     Trilho de índice: navegação por clique (funciona com ou sem GSAP)
  ----------------------------------------------------------------------- */
  var railItems = $$(".rail-item");
  var blocks = $$(".dossie-block");

  function scrollToBlock(i) {
    var target = blocks[i];
    if (!target) return;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var y = target.getBoundingClientRect().top + window.pageYOffset -
            (window.innerHeight * 0.34);
    window.scrollTo({ top: Math.max(0, y), behavior: reduce ? "auto" : "smooth" });
  }

  railItems.forEach(function (btn) {
    btn.addEventListener("click", function () {
      scrollToBlock(parseInt(btn.getAttribute("data-goto"), 10) || 0);
    });
  });

  /* -----------------------------------------------------------------------
     Sem GSAP: nada é pré-escondido pelo CSS, então o site já está legível.
  ----------------------------------------------------------------------- */
  if (typeof window.gsap === "undefined" || typeof window.ScrollTrigger === "undefined") {
    return;
  }

  var hasSplit = typeof window.SplitText !== "undefined";
  gsap.registerPlugin(ScrollTrigger);
  if (hasSplit) { gsap.registerPlugin(SplitText); }

  var dossie   = $(".dossie");
  var stage    = document.getElementById("dossieStage");
  var left     = document.getElementById("dossieLeft");
  var leftIn   = document.getElementById("dossieLeftInner");
  var rail     = document.getElementById("dossieRail");
  var slides   = $$(".dossie-slide");
  var cursorEl = document.getElementById("cursor");

  var mm = gsap.matchMedia();

  mm.add(
    {
      isDesktop: "(min-width: 1024px)",
      reduce: "(prefers-reduced-motion: reduce)",
      fine: "(hover: hover) and (pointer: fine)"
    },
    function (ctx) {
      var c = ctx.conditions;
      var isDesktop = c.isDesktop;
      var reduce = c.reduce;
      var fine = c.fine;

      var splits = [];
      var teardown = [];

      /* --- modo pinado: define o layout ANTES de medir qualquer trigger --- */
      var pinned = isDesktop && !reduce && dossie && stage && left && slides.length;
      if (pinned) { dossie.classList.add("is-pinned"); }

      /* ------------------------------------------------------------------
         Revelações discretas (fromTo sempre com destino explícito)
      ------------------------------------------------------------------ */
      function reveal(targets, vars) {
        var els = gsap.utils.toArray(targets);
        if (!els.length) return;
        vars = vars || {};
        if (reduce) {
          gsap.set(els, { autoAlpha: 1, y: 0 });
          return;
        }
        els.forEach(function (el, i) {
          gsap.fromTo(el,
            { autoAlpha: 0, y: vars.y || 22 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.85,
              ease: "power3.out",
              delay: (vars.stagger || 0) * i,
              scrollTrigger: {
                trigger: vars.trigger || el,
                start: vars.start || "top 88%"
              }
            }
          );
        });
      }

      /* ------------------------------------------------------------------
         Títulos linha a linha (SplitText + máscara)
      ------------------------------------------------------------------ */
      function splitReveal(el, immediate, delay) {
        if (!el) return;
        if (!hasSplit || reduce) {
          gsap.set(el, { autoAlpha: 1 });
          return;
        }
        var st = SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "ln",
          autoSplit: true,
          onSplit: function (self) {
            return gsap.fromTo(self.lines,
              { yPercent: 108, autoAlpha: 0 },
              {
                yPercent: 0,
                autoAlpha: 1,
                duration: 1.05,
                stagger: 0.085,
                ease: "expo.out",
                delay: delay || 0,
                scrollTrigger: immediate ? undefined : { trigger: el, start: "top 86%" }
              }
            );
          }
        });
        splits.push(st);
      }

      splitReveal($(".hero-title"), true, 0.15);
      $$(".section-title.split").forEach(function (el) { splitReveal(el, false, 0); });

      reveal(".hero-eyebrow", { start: "top 100%" });
      reveal(".hero-lede", { start: "top 100%" });
      reveal(".hero-actions", { start: "top 100%" });
      reveal(".hero-strip > div", { stagger: 0.07, trigger: ".hero-strip", start: "top 92%" });
      reveal(".ledger-head");
      reveal(".ledger-row", { y: 26 });
      reveal(".dossie-head .eyebrow");
      reveal(".office .eyebrow");
      reveal(".office-lead");
      reveal(".office-text > *");
      reveal(".partners .eyebrow");
      reveal(".partner", { y: 34 });
      reveal(".contact .eyebrow");
      reveal(".contact-lede");
      reveal(".contact-details > div", { stagger: 0.05, trigger: ".contact-details" });
      reveal(".contact-form");
      if (!pinned) {
        reveal(".dossie-block .block-body", { y: 26 });
      }

      /* ------------------------------------------------------------------
         DOSSIÊ — split-screen pinado + troca de conteúdo + trilho
      ------------------------------------------------------------------ */
      if (pinned) {
        var current = 0;

        gsap.set(slides, { autoAlpha: 0, yPercent: 12, clipPath: "inset(0% 0% 100% 0%)" });
        gsap.set(slides[0], { autoAlpha: 1, yPercent: 0, clipPath: "inset(0% 0% 0% 0%)" });

        function paintRail(i) {
          railItems.forEach(function (btn, k) {
            var on = k === i;
            btn.classList.toggle("is-current", on);
            if (on) { btn.setAttribute("aria-current", "true"); }
            else { btn.removeAttribute("aria-current"); }
          });
        }
        paintRail(0);

        function setActive(i) {
          if (i === current || !slides[i]) return;
          var dir = i > current ? 1 : -1;
          var prev = slides[current];
          var next = slides[i];

          gsap.killTweensOf([prev, next]);

          gsap.to(prev, {
            autoAlpha: 0,
            yPercent: -12 * dir,
            clipPath: dir > 0 ? "inset(0% 0% 100% 0%)" : "inset(100% 0% 0% 0%)",
            duration: 0.4,
            ease: "power2.in"
          });

          gsap.fromTo(next,
            {
              autoAlpha: 0,
              yPercent: 16 * dir,
              clipPath: dir > 0 ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 100% 0%)"
            },
            {
              autoAlpha: 1,
              yPercent: 0,
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 0.75,
              ease: "power3.out"
            }
          );

          current = i;
          paintRail(i);
        }
        // exposto para verificação/manual
        window.__dossieSetActive = setActive;
        window.__dossieCurrent = function () { return current; };

        /* pin da coluna esquerda */
        ScrollTrigger.create({
          id: "dossie-pin",
          trigger: stage,
          start: function () { return "top top+=" + HEADER_OFFSET; },
          end: "bottom bottom",
          pin: left,
          pinSpacing: false,
          invalidateOnRefresh: true,
          refreshPriority: 1
        });

        /* saída suave para não "pular" quando o pin é liberado */
        gsap.fromTo(leftIn,
          { autoAlpha: 1 },
          {
            autoAlpha: 0,
            ease: "none",
            scrollTrigger: {
              trigger: stage,
              start: "bottom bottom+=260",
              end: "bottom bottom",
              scrub: true
            }
          }
        );

        /* qual bloco está sendo lido */
        blocks.forEach(function (block, i) {
          ScrollTrigger.create({
            trigger: block,
            start: "top 55%",
            end: "bottom 55%",
            refreshPriority: 2,
            onEnter: function () { setActive(i); },
            onEnterBack: function () { setActive(i); }
          });
        });

        /* trilho aparece só dentro da seção */
        if (rail) {
          ScrollTrigger.create({
            trigger: stage,
            start: "top 65%",
            end: "bottom 75%",
            refreshPriority: 3,
            onToggle: function (self) {
              rail.classList.toggle("is-visible", self.isActive);
            }
          });
        }

        teardown.push(function () {
          if (rail) { rail.classList.remove("is-visible"); }
          railItems.forEach(function (btn) {
            btn.classList.remove("is-current");
            btn.removeAttribute("aria-current");
          });
          delete window.__dossieSetActive;
          delete window.__dossieCurrent;
        });
      }

      /* ------------------------------------------------------------------
         Cursor discreto (apenas ponteiro fino, com movimento)
      ------------------------------------------------------------------ */
      if (cursorEl && fine && !reduce) {
        var xTo = gsap.quickTo(cursorEl, "x", { duration: 0.45, ease: "power3" });
        var yTo = gsap.quickTo(cursorEl, "y", { duration: 0.45, ease: "power3" });
        var shown = false;

        var onMove = function (e) {
          if (!shown) {
            shown = true;
            gsap.set(cursorEl, { x: e.clientX, y: e.clientY });
            gsap.to(cursorEl, { autoAlpha: 1, duration: 0.35 });
          }
          xTo(e.clientX);
          yTo(e.clientY);
        };
        var onLeave = function () {
          shown = false;
          gsap.to(cursorEl, { autoAlpha: 0, duration: 0.25 });
        };
        var grow = function () { gsap.to(cursorEl, { scale: 2.1, duration: 0.35, ease: "power3.out" }); };
        var shrink = function () { gsap.to(cursorEl, { scale: 1, duration: 0.35, ease: "power3.out" }); };

        window.addEventListener("pointermove", onMove, { passive: true });
        document.addEventListener("pointerleave", onLeave);

        var hotSel = "a, button, input, select, textarea, label";
        var hot = $$(hotSel);
        hot.forEach(function (el) {
          el.addEventListener("pointerenter", grow);
          el.addEventListener("pointerleave", shrink);
        });

        teardown.push(function () {
          window.removeEventListener("pointermove", onMove);
          document.removeEventListener("pointerleave", onLeave);
          hot.forEach(function (el) {
            el.removeEventListener("pointerenter", grow);
            el.removeEventListener("pointerleave", shrink);
          });
          gsap.set(cursorEl, { clearProps: "all" });
        });
      }

      /* ------------------------------------------------------------------
         Limpeza do branch
      ------------------------------------------------------------------ */
      return function cleanup() {
        teardown.forEach(function (fn) { fn(); });
        splits.forEach(function (s) { if (s && s.revert) { s.revert(); } });
        if (dossie) { dossie.classList.remove("is-pinned"); }
        if (slides.length) { gsap.set(slides, { clearProps: "all" }); }
      };
    }
  );

  /* -----------------------------------------------------------------------
     Recalcula depois que fontes e recursos terminam de carregar
  ----------------------------------------------------------------------- */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
