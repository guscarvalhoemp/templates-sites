/* =========================================================================
   Casa Fabbrica — script.js
   Assinatura: entrada de logo no hero (letras se agrupando) + parallax
   de imagem via ScrollTrigger scrub nos blocos alternados + citações
   que ganham foco ao cruzar o centro da tela.

   Nota de robustez (ver tasks/lessons.md): nenhum elemento é escondido via
   CSS estático. Todo estado inicial "invisível" é aplicado aqui, via
   gsap.set()/fromTo() com destino explícito. Se o GSAP não carregar, o
   HTML permanece 100% visível no estado final (apenas sem animação).
   ========================================================================= */

(function(){
  "use strict";

  var hasGSAP = typeof window.gsap !== "undefined";
  var hasST = hasGSAP && typeof window.ScrollTrigger !== "undefined";
  var prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (hasST){ gsap.registerPlugin(ScrollTrigger); }

  /* ---------------- Ano no rodapé ---------------- */
  var anoEl = document.getElementById("ano");
  if (anoEl){ anoEl.textContent = new Date().getFullYear(); }

  /* ---------------- Header: fundo ao rolar ---------------- */
  var header = document.querySelector(".site-header");
  function syncHeader(){
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  /* ---------------- Menu mobile ---------------- */
  var navToggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("mobile-nav");
  if (navToggle && mobileNav){
    navToggle.addEventListener("click", function(){
      var open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!open));
      mobileNav.hidden = open;
    });
    mobileNav.querySelectorAll("a").forEach(function(a){
      a.addEventListener("click", function(){
        navToggle.setAttribute("aria-expanded", "false");
        mobileNav.hidden = true;
      });
    });
  }

  /* ---------------- Split de caracteres do wordmark ---------------- */
  function splitChars(el){
    var text = el.textContent;
    el.textContent = "";
    var frag = document.createDocumentFragment();
    text.split("").forEach(function(ch){
      var span = document.createElement("span");
      span.className = "char" + (ch === " " ? " is-space" : "");
      span.textContent = ch === " " ? " " : ch;
      frag.appendChild(span);
    });
    el.appendChild(frag);
    return el.querySelectorAll(".char");
  }

  var wordmarkEl = document.querySelector("[data-split]");
  var chars = wordmarkEl ? splitChars(wordmarkEl) : [];

  /* =======================================================================
     Sem GSAP: nada a animar, o HTML já está no estado final visível.
     ======================================================================= */
  if (!hasGSAP){ return; }

  /* =======================================================================
     HERO — entrada da logo (letras se agrupando) + reveal do headline
     ======================================================================= */
  function heroIntro(){
    var heroFadeEls = document.querySelectorAll("[data-hero-fade]");
    var ruleEl = document.querySelector(".hero__rule");

    if (prefersReduced){
      gsap.set(chars, { opacity: 1, x: 0, y: 0, rotate: 0 });
      gsap.set(ruleEl, { scaleX: 1 });
      gsap.set(heroFadeEls, { opacity: 1, y: 0 });
      return;
    }

    gsap.set(chars, {
      opacity: 0,
      y: function(){ return gsap.utils.random(-46, 46); },
      x: function(){ return gsap.utils.random(-70, 70); },
      rotate: function(){ return gsap.utils.random(-24, 24); },
      filter: "blur(6px)"
    });
    gsap.set(ruleEl, { scaleX: 0 });
    gsap.set(heroFadeEls, { opacity: 0, y: 18 });

    var tl = gsap.timeline({ delay: .25, defaults: { ease: "power3.out" } });

    tl.to(chars, {
      opacity: 1, x: 0, y: 0, rotate: 0, filter: "blur(0px)",
      duration: 1.05,
      stagger: { each: .032, from: "center" }
    })
    .to(ruleEl, { scaleX: 1, duration: .7, ease: "power2.out" }, "-=.35")
    .to(heroFadeEls, { opacity: 1, y: 0, duration: .7, stagger: .12 }, "-=.4");
  }
  heroIntro();

  /* =======================================================================
     ScrollTrigger: parallax nos blocos + citações em foco
     ======================================================================= */
  if (!hasST){ return; }

  var mm = gsap.matchMedia();

  mm.add({
    isDesktop: "(min-width: 769px)",
    isMobile: "(max-width: 768px)"
  }, function(context){
    var isMobile = context.conditions.isMobile;
    var parallaxAmount = prefersReduced ? 0 : (isMobile ? 8 : 16);

    /* ---- Parallax nos blocos alternados ---- */
    document.querySelectorAll("[data-parallax]").forEach(function(mediaEl){
      var img = mediaEl.querySelector("img");
      if (!img) return;

      if (parallaxAmount > 0){
        gsap.fromTo(img,
          { yPercent: -parallaxAmount },
          {
            yPercent: parallaxAmount,
            ease: "none",
            scrollTrigger: {
              trigger: mediaEl,
              start: "top bottom",
              end: "bottom top",
              scrub: true
            }
          }
        );
      }

      /* Reveal suave do bloco de mídia ao entrar na tela */
      gsap.fromTo(mediaEl,
        { clipPath: "inset(6% 0 6% 0)", opacity: 0 },
        {
          clipPath: "inset(0% 0 0% 0)", opacity: 1, duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: mediaEl, start: "top 85%", toggleActions: "play none none reverse" }
        }
      );
    });

    /* ---- Reveal do texto dos blocos e outras seções ---- */
    document.querySelectorAll("[data-reveal]").forEach(function(el){
      gsap.fromTo(el,
        { opacity: 0, y: 28 },
        {
          opacity: 1, y: 0, duration: .8, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none reverse" }
        }
      );
    });

    /* ---- Depoimentos: foco progressivo ao cruzar o centro ---- */
    var quoteItems = gsap.utils.toArray(".quote-item");
    quoteItems.forEach(function(item, i){
      gsap.set(item, { opacity: .28, scale: .94, filter: "blur(2px)" });

      gsap.fromTo(item,
        { opacity: .28, scale: .94, filter: "blur(2px)" },
        {
          opacity: 1, scale: 1, filter: "blur(0px)", ease: "none",
          scrollTrigger: {
            trigger: item,
            start: "top 78%",
            end: "top 38%",
            scrub: true
          }
        }
      );

      if (i < quoteItems.length - 1){
        gsap.fromTo(item,
          { opacity: 1, scale: 1, filter: "blur(0px)" },
          {
            opacity: .28, scale: .94, filter: "blur(2px)", ease: "none",
            scrollTrigger: {
              trigger: item,
              start: "bottom 55%",
              end: "bottom 15%",
              scrub: true
            }
          }
        );
      }
    });

    return function(){
      /* cleanup ao trocar de breakpoint é feito automaticamente pelo matchMedia */
    };
  });

  /* Recalcula posições após fontes/imagens carregarem */
  window.addEventListener("load", function(){
    ScrollTrigger.refresh();
  });
})();
