/* =========================================================================
   CULTO Café — comportamento
   Paradigma: grid de categorias + cards de produto com hover de detalhes.
   Site estático de amostragem — "Comprar" leva direto ao WhatsApp com uma
   mensagem pré-preenchida por produto (não há carrinho/checkout real).
   ========================================================================= */
(function () {
  "use strict";

  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };

  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* -----------------------------------------------------------------------
     0. Dados — categorias e produtos (fictícios)
  ----------------------------------------------------------------------- */
  var CATEGORIES = [
    {
      id: "graos",
      nome: "Grãos",
      img: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=700&q=75"
    },
    {
      id: "moidos",
      nome: "Moídos",
      img: "https://images.unsplash.com/photo-1524350876685-274059332603?auto=format&fit=crop&w=700&q=75"
    },
    {
      id: "capsulas",
      nome: "Cápsulas",
      img: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=700&q=75"
    },
    {
      id: "acessorios",
      nome: "Acessórios",
      img: "https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=700&q=75"
    }
  ];

  var PRODUCTS = [
    {
      id: "graos-ritual-noturno",
      cat: "graos",
      nome: "Ritual Noturno",
      torra: "Torra escura",
      peso: "250g em grãos",
      notas: "Cacau amargo, tabaco, amêndoa torrada",
      nota: 4.9,
      preco: 54.90,
      novo: true,
      img: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "graos-alvorada",
      cat: "graos",
      nome: "Alvorada",
      torra: "Torra média",
      peso: "250g em grãos",
      notas: "Caramelo, laranja, mel silvestre",
      nota: 4.8,
      preco: 52.90,
      img: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "moido-combustivel",
      cat: "moidos",
      nome: "Combustível 100%",
      torra: "Torra escura forte",
      peso: "250g moído",
      notas: "Chocolate amargo, pimenta-do-reino, terra molhada",
      nota: 4.7,
      preco: 39.90,
      img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "moido-domingo-lento",
      cat: "moidos",
      nome: "Domingo Lento",
      torra: "Torra média-clara",
      peso: "250g moído",
      notas: "Frutas vermelhas, jasmim, rapadura",
      nota: 4.9,
      preco: 42.90,
      novo: true,
      img: "https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "capsula-ritual",
      cat: "capsulas",
      nome: "Cápsula Ritual",
      torra: "Intensidade 10",
      peso: "10 unidades",
      notas: "Cacau, madeira, especiarias, compatível com sistemas de cápsula padrão*",
      nota: 4.6,
      preco: 36.90,
      img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "capsula-suave",
      cat: "capsulas",
      nome: "Cápsula Suave",
      torra: "Intensidade 5",
      peso: "10 unidades",
      notas: "Avelã, baunilha, mel",
      nota: 4.7,
      preco: 34.90,
      img: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "acessorio-kit-coador",
      cat: "acessorios",
      nome: "Kit Ritual do Coador",
      torra: "Kit completo",
      peso: "Coador + suporte + colher",
      notas: "Coador de pano, suporte em aço e colher dosadora, o básico bem feito",
      nota: 4.8,
      preco: 89.90,
      img: "https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "acessorio-moedor",
      cat: "acessorios",
      nome: "Moedor Manual CULTO",
      torra: "Uso diário",
      peso: "Mó cônica em aço inox",
      notas: "18 níveis de moagem, do espresso ao coador de pano",
      nota: 4.9,
      preco: 129.90,
      novo: true,
      img: "https://images.unsplash.com/photo-1442550528053-c431ecb55509?auto=format&fit=crop&w=600&q=80"
    }
  ];

  var CAT_LABELS = CATEGORIES.reduce(function (acc, c) { acc[c.id] = c.nome; return acc; }, {});

  var WHATSAPP_NUMBER = "5511955443322";

  function brl(value) {
    return "R$ " + value.toFixed(2).replace(".", ",");
  }

  function whatsappBuyLink(product) {
    var msg = "Olá! Tenho interesse no " + product.nome + " (" + product.peso + ", " + brl(product.preco) + "). Ainda está disponível?";
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(msg);
  }

  function starIcon() {
    return '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.5l2.47 5.53 6.03.6-4.55 4.06 1.3 5.93L10 14.9l-5.25 2.72 1.3-5.93L1.5 7.63l6.03-.6L10 1.5z"/></svg>';
  }

  /* -----------------------------------------------------------------------
     1. Ano do rodapé
  ----------------------------------------------------------------------- */
  var yearEl = $("#anoAtual");
  if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }

  /* -----------------------------------------------------------------------
     2. Menu mobile
  ----------------------------------------------------------------------- */
  var menuToggle = $("#menuToggle");
  var mobileMenu = $("#mobileMenu");

  function closeMobileMenu() {
    if (!menuToggle || !mobileMenu) { return; }
    menuToggle.setAttribute("aria-expanded", "false");
    mobileMenu.dataset.state = "closed";
    mobileMenu.setAttribute("aria-hidden", "true");
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", function () {
      var isOpen = mobileMenu.dataset.state === "open";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      mobileMenu.dataset.state = isOpen ? "closed" : "open";
      mobileMenu.setAttribute("aria-hidden", String(isOpen));
    });
    $$("a", mobileMenu).forEach(function (a) {
      a.addEventListener("click", closeMobileMenu);
    });
  }

  /* -----------------------------------------------------------------------
     3. Render — categorias
  ----------------------------------------------------------------------- */
  var categoryGrid = $("#categoryGrid");
  var activeCategory = "all";

  function countByCategory(catId) {
    return PRODUCTS.filter(function (p) { return p.cat === catId; }).length;
  }

  if (categoryGrid) {
    categoryGrid.innerHTML = CATEGORIES.map(function (c) {
      return (
        '<button type="button" class="category-card" data-cat="' + c.id + '">' +
          '<img src="' + c.img + '" alt="Café, categoria ' + c.nome + '" loading="lazy">' +
          '<span class="category-card-label">' +
            '<span class="category-card-name">' + c.nome + '</span>' +
            '<span class="category-card-count">' + countByCategory(c.id) + '</span>' +
          '</span>' +
        '</button>'
      );
    }).join("");
  }

  /* -----------------------------------------------------------------------
     4. Render — filtros de produto
  ----------------------------------------------------------------------- */
  var productFilters = $("#productFilters");
  if (productFilters) {
    var chips = ['<button type="button" class="filter-chip" data-cat="all" aria-pressed="true">Todos</button>']
      .concat(CATEGORIES.map(function (c) {
        return '<button type="button" class="filter-chip" data-cat="' + c.id + '" aria-pressed="false">' + c.nome + '</button>';
      }));
    productFilters.innerHTML = chips.join("");
  }

  /* -----------------------------------------------------------------------
     5. Render — grid de produtos
  ----------------------------------------------------------------------- */
  var productGrid = $("#productGrid");

  function renderProducts() {
    if (!productGrid) { return; }
    productGrid.innerHTML = PRODUCTS.map(function (p) {
      return (
        '<article class="product-card" data-id="' + p.id + '" data-cat="' + p.cat + '">' +
          '<div class="product-media">' +
            '<img src="' + p.img + '" alt="' + p.nome + ', café ' + CAT_LABELS[p.cat] + '" loading="lazy">' +
            '<span class="product-roast">' + p.torra + '</span>' +
            (p.novo ? '<span class="product-new">Novo</span>' : '') +
            '<div class="product-details">' +
              '<div class="product-details-row"><span class="dt">Peso</span><span class="dd">' + p.peso + '</span></div>' +
              '<div class="product-details-row"><span class="dt">Torra</span><span class="dd">' + p.torra + '</span></div>' +
              '<p class="product-notes">' + p.notas + '</p>' +
            '</div>' +
          '</div>' +
          '<div class="product-body">' +
            '<p class="product-rating">' + starIcon() + ' ' + p.nota.toFixed(1) + ' / 5</p>' +
            '<h3 class="product-name">' + p.nome + '</h3>' +
            '<p class="product-desc">' + CAT_LABELS[p.cat] + ' · ' + p.peso + '</p>' +
            '<div class="product-foot">' +
              '<p class="product-price">' + brl(p.preco) + '<span>à vista</span></p>' +
              '<a class="product-buy" data-buy="' + p.id + '" href="' + whatsappBuyLink(p) + '" target="_blank" rel="noopener">' +
                '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.9.53 3.68 1.44 5.2L2 22l4.99-1.51a9.9 9.9 0 0 0 5.05 1.38c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.8 14.13c-.24.68-1.4 1.3-1.93 1.36-.49.06-1.11.09-1.79-.11-.41-.13-.94-.3-1.62-.6-2.85-1.23-4.7-4.1-4.85-4.29-.14-.19-1.16-1.54-1.16-2.94s.73-2.09.98-2.38c.26-.28.56-.35.75-.35h.53c.17 0 .4-.06.62.48.24.58.81 2 .88 2.15.07.14.12.31.02.5-.09.19-.14.31-.28.47-.14.16-.29.36-.42.48-.14.13-.28.28-.12.55.16.28.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.21 1.37.28.14.44.12.6-.07.16-.19.68-.8.87-1.07.18-.28.36-.23.61-.14.24.09 1.55.73 1.82.86.26.14.44.2.5.31.07.12.07.66-.17 1.34z"/></svg>' +
                "Comprar" +
              '</a>' +
            '</div>' +
          '</div>' +
        '</article>'
      );
    }).join("");

    initProductCardInteractions();
  }

  renderProducts();

  /* -----------------------------------------------------------------------
     6. Filtro de categoria (categorias + chips de produto ficam em sincronia)
  ----------------------------------------------------------------------- */
  function applyFilter(catId) {
    activeCategory = catId;

    $$(".filter-chip", productFilters).forEach(function (chip) {
      chip.setAttribute("aria-pressed", String(chip.dataset.cat === catId));
    });

    $$(".category-card", categoryGrid).forEach(function (card) {
      card.classList.toggle("is-active", card.dataset.cat === catId);
    });

    $$(".product-card", productGrid).forEach(function (card) {
      var show = catId === "all" || card.dataset.cat === catId;
      card.hidden = !show;
    });
  }

  if (categoryGrid) {
    categoryGrid.addEventListener("click", function (e) {
      var card = e.target.closest(".category-card");
      if (!card) { return; }
      var catId = card.dataset.cat;
      applyFilter(activeCategory === catId ? "all" : catId);
      var productsSection = $("#produtos");
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      }
    });
  }

  if (productFilters) {
    productFilters.addEventListener("click", function (e) {
      var chip = e.target.closest(".filter-chip");
      if (!chip) { return; }
      applyFilter(chip.dataset.cat);
    });
  }

  $$('[data-footer-filter]').forEach(function (link) {
    link.addEventListener("click", function () {
      applyFilter(link.dataset.footerFilter);
    });
  });

  /* -----------------------------------------------------------------------
     7. Botão "Comprar" — feedback visual antes de sair para o WhatsApp
     (site estático de amostragem: não há carrinho/checkout, cada clique
     abre o WhatsApp numa aba nova com o produto já preenchido na mensagem)
  ----------------------------------------------------------------------- */
  if (productGrid) {
    productGrid.addEventListener("click", function (e) {
      var buyBtn = e.target.closest("[data-buy]");
      if (!buyBtn) { return; }
      if (window.gsap) {
        gsap.fromTo(buyBtn, { scale: 1 }, { scale: 1.06, duration: 0.15, ease: "power2.out", yoyo: true, repeat: 1 });
      }
    });
  }

  /* -----------------------------------------------------------------------
     9. Hover / tap de detalhes do card de produto (GSAP)
  ----------------------------------------------------------------------- */
  function initProductCardInteractions() {
    $$(".product-card").forEach(function (card) {
      var media   = $(".product-media", card);
      var details = $(".product-details", card);
      var img     = $("img", card);
      if (!media || !details) { return; }

      if (window.gsap) {
        gsap.set(details, { yPercent: 100 });
      }

      var isOpen = false;

      function open() {
        if (isOpen) { return; }
        isOpen = true;
        card.classList.add("is-open");
        if (window.gsap) {
          gsap.to(details, { yPercent: 0, duration: 0.4, ease: "power2.out" });
          gsap.to(card, { y: -6, duration: 0.35, ease: "power2.out" });
          if (img) { gsap.to(img, { scale: 1.06, duration: 0.5, ease: "power2.out" }); }
        }
      }

      function close() {
        if (!isOpen) { return; }
        isOpen = false;
        card.classList.remove("is-open");
        if (window.gsap) {
          gsap.to(details, { yPercent: 100, duration: 0.35, ease: "power2.in" });
          gsap.to(card, { y: 0, duration: 0.35, ease: "power2.out" });
          if (img) { gsap.to(img, { scale: 1, duration: 0.5, ease: "power2.out" }); }
        }
      }

      card.addEventListener("pointerenter", function (e) {
        if (e.pointerType === "touch") { return; }
        open();
      });
      card.addEventListener("pointerleave", function (e) {
        if (e.pointerType === "touch") { return; }
        close();
      });

      card.addEventListener("click", function (e) {
        if (e.target.closest("[data-buy]")) { return; }
        if (window.matchMedia("(hover: hover)").matches) { return; }
        isOpen ? close() : open();
      });
    });
  }

  /* -----------------------------------------------------------------------
     10. Entrada do hero (badge + título) — roda ao carregar, não no scroll
  ----------------------------------------------------------------------- */
  function initHero() {
    if (!window.gsap || prefersReducedMotion) { return; }

    var heroTitle = $("#heroTitle");
    var heroStage = $("#heroStage");
    var heroBadge = $("#heroBadge");

    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    if (heroTitle) {
      tl.from(heroTitle, { y: 28, autoAlpha: 0, duration: 0.7 }, 0);
    }
    if (heroStage) {
      tl.from(heroStage, { y: 34, autoAlpha: 0, duration: 0.8 }, 0.15);
    }
    if (heroBadge) {
      tl.fromTo(heroBadge,
        { scale: 0.4, rotation: -18, autoAlpha: 0 },
        { scale: 1, rotation: -8, autoAlpha: 1, duration: 0.6, ease: "back.out(1.8)" },
        0.55
      );
    }
  }

  initHero();

  /* -----------------------------------------------------------------------
     11. Scroll reveals — categorias, produtos, manifesto (ScrollTrigger)
  ----------------------------------------------------------------------- */
  function initScrollReveals() {
    if (!window.gsap || !window.ScrollTrigger || prefersReducedMotion) { return; }
    gsap.registerPlugin(ScrollTrigger);

    var categoryCards = $$(".category-card");
    if (categoryCards.length) {
      gsap.set(categoryCards, { autoAlpha: 0, y: 28 });
      gsap.to(categoryCards, {
        autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.08,
        scrollTrigger: { trigger: "#categoryGrid", start: "top 85%", toggleActions: "play none none reverse" }
      });
    }

    var productCards = $$(".product-card");
    if (productCards.length) {
      gsap.set(productCards, { autoAlpha: 0, y: 32 });
      gsap.to(productCards, {
        autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.06,
        scrollTrigger: { trigger: "#productGrid", start: "top 88%", toggleActions: "play none none reverse" }
      });
    }

    var manifestoLines = $$(".manifesto-statement .line");
    if (manifestoLines.length) {
      gsap.set(manifestoLines, { autoAlpha: 0, y: 24 });
      gsap.to(manifestoLines, {
        autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.1,
        scrollTrigger: { trigger: "#manifesto", start: "top 70%", toggleActions: "play none none reverse" }
      });
    }

    var manifestoFoot = $(".manifesto-foot");
    if (manifestoFoot) {
      gsap.set(manifestoFoot, { autoAlpha: 0, y: 16 });
      gsap.to(manifestoFoot, {
        autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.3,
        scrollTrigger: { trigger: "#manifesto", start: "top 65%", toggleActions: "play none none reverse" }
      });
    }
  }

  initScrollReveals();

})();
