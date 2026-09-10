/* =====================================================================
   Casa Fabbrica — movimento
   GSAP 3.13 · ScrollTrigger (trilha pinada) · Flip (galeria) · ScrollTo
   Mobile first: tudo passa por gsap.matchMedia().
   ===================================================================== */
(function () {
  'use strict';

  var hasGsap = typeof window.gsap !== 'undefined';
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------- básico */
  var ano = $('#ano');
  if (ano) ano.textContent = new Date().getFullYear();

  // menu mobile
  var navToggle = $('#navToggle');
  var mobileNav = $('#mobile-nav');
  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      var open = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!open));
      mobileNav.hidden = open;
      if (hasGsap && !open) {
        gsap.fromTo(mobileNav.querySelectorAll('li, .btn'),
          { y: 14, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: .4, stagger: .05, ease: 'power2.out', clearProps: 'all' });
      }
    });
    $$('a', mobileNav).forEach(function (a) {
      a.addEventListener('click', function () {
        navToggle.setAttribute('aria-expanded', 'false');
        mobileNav.hidden = true;
      });
    });
  }

  // formulário (demo)
  var form = $('#quoteForm');
  var formNote = $('#formNote');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        var bad = form.querySelector(':invalid');
        if (bad) bad.focus();
        if (formNote) formNote.textContent = 'Preencha os campos obrigatórios para continuar.';
        return;
      }
      if (formNote) {
        formNote.textContent = 'Recebemos sua solicitação. Retornamos em até 24 horas.';
        formNote.classList.add('is-ok');
      }
      if (hasGsap) gsap.fromTo(form, { y: -4 }, { y: 0, duration: .5, ease: 'elastic.out(1,.5)' });
      form.reset();
    });
  }

  if (!hasGsap) return;

  gsap.registerPlugin(ScrollTrigger, Flip, ScrollToPlugin);
  // evita refresh/salto quando a barra de endereço do mobile aparece/some
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ------------------------------------------------- estado inicial
     Nunca escondemos nada por CSS: quem esconde é o JS, logo se o JS
     falhar o conteúdo continua visível. */
  var reveals = $$('[data-reveal]');
  gsap.set(reveals, { y: 26, autoAlpha: 0 });

  var heroWords = $$('.hero-title .w');
  gsap.set(heroWords, { yPercent: 115 });

  /* ------------------------------------------------------ header */
  ScrollTrigger.create({
    start: 'top -60',
    end: 99999,
    toggleClass: { targets: '.site-header', className: 'is-stuck' }
  });

  /* ----------------------------------------------- âncoras suaves */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (!id || id === '#' || id.length < 2) return;
      var t = document.getElementById(id.slice(1));
      if (!t) return;
      e.preventDefault();
      gsap.to(window, {
        scrollTo: { y: t, offsetY: id === '#cardapio' ? 0 : 72, autoKill: true },
        duration: 1, ease: 'power2.inOut'
      });
    });
  });

  /* -------------------------------------------------- selo girando */
  var sealRing = $('.seal-ring');
  if (sealRing) {
    gsap.to(sealRing, { rotation: 360, duration: 26, repeat: -1, ease: 'none', transformOrigin: '50% 50%' });
  }

  /* ------------------------------------------------------ marquee */
  var marqueeTween = null;
  var marquee = $('#marquee');
  if (marquee) {
    marqueeTween = gsap.to(marquee, {
      xPercent: -50, duration: 26, repeat: -1, ease: 'none'
    });
  }

  /* ============================ matchMedia ============================ */
  var mm = gsap.matchMedia();

  /* ------------------------- 1. movimento completo ------------------- */
  mm.add('(prefers-reduced-motion: no-preference)', function () {

    /* entrada do hero */
    var intro = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: .15 });
    intro
      .to(heroWords, { yPercent: 0, duration: .95, stagger: .055 })
      // a moldura nunca parte de opacidade 0: se o loop de frames travar,
      // ela continua visível em vez de sumir para sempre
      .from('.hero-arch', { yPercent: 6, scale: .96, duration: 1.1 }, .25)
      .from('.hero-arch img', { scale: 1.24, duration: 1.6, ease: 'power2.out' }, .25)
      .from('.seal', { scale: .4, autoAlpha: 0, duration: .8, ease: 'back.out(1.7)' }, .7)
      .from('.hero-hint', { y: 12, autoAlpha: 0, duration: .6 }, .95);

    /* rede de segurança: se em 1,5 s o loop de animação não tiver rodado
       (aba em segundo plano, rAF bloqueado), mostra tudo direto. */
    var frame0 = gsap.ticker.frame;
    var safety = setTimeout(function () {
      if (gsap.ticker.frame - frame0 >= 3) return;          // o loop está rodando: nada a fazer
      if (document.visibilityState !== 'visible') return;   // aba em segundo plano: só adiado
      // página visível mas sem frames: mostra tudo em vez de deixar texto invisível
      intro.progress(1);
      gsap.set(heroWords, { yPercent: 0 });
      gsap.set(reveals, { y: 0, autoAlpha: 1 });
    }, 1500);

    /* parallax do pointer no hero (o "mexa o cursor" do coffee-shop) */
    var arch = $('#heroArch');
    var hint = $('#heroHint');
    var pointerCtx = null;
    if (arch && window.matchMedia('(pointer: fine)').matches) {
      var xTo = gsap.quickTo(arch, 'rotationY', { duration: .9, ease: 'power3' });
      var yTo = gsap.quickTo(arch, 'rotationX', { duration: .9, ease: 'power3' });
      var iTo = gsap.quickTo('.hero-arch img', 'xPercent', { duration: 1.1, ease: 'power3' });
      gsap.set(arch, { transformPerspective: 900, transformOrigin: '50% 50%' });
      pointerCtx = function (e) {
        var r = arch.getBoundingClientRect();
        var nx = gsap.utils.clamp(-1, 1, (e.clientX - (r.left + r.width / 2)) / (r.width * 0.9));
        var ny = gsap.utils.clamp(-1, 1, (e.clientY - (r.top + r.height / 2)) / (r.height * 0.9));
        xTo(nx * 7); yTo(-ny * 7); iTo(nx * -2.4);
        if (hint) { gsap.to(hint, { autoAlpha: 0, duration: .4 }); hint = null; }
      };
      window.addEventListener('pointermove', pointerCtx, { passive: true });
    }

    /* a faixa reage à velocidade do scroll */
    var velTrigger = null;
    if (marqueeTween) {
      velTrigger = ScrollTrigger.create({
        start: 0, end: 'max',
        onUpdate: function (self) {
          var v = gsap.utils.clamp(-6, 6, self.getVelocity() / 260);
          gsap.to(marqueeTween, { timeScale: 1 + Math.abs(v), duration: .3, overwrite: true });
          gsap.to(marqueeTween, { timeScale: 1, duration: 1.2, delay: .35, overwrite: 'auto' });
        }
      });
    }

    /* reveals genéricos */
    reveals.forEach(function (el) {
      gsap.to(el, {
        y: 0, autoAlpha: 1, duration: .9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    /* parallax leve no bloco de citação
       (a foto grande da galeria fica de fora de propósito: o Flip precisa
       do transform dela livre para a troca círculo → arco) */
    gsap.fromTo('.casa-quote',
      { yPercent: 5 },
      {
        yPercent: -5, ease: 'none',
        scrollTrigger: { trigger: '.casa-quote', start: 'top bottom', end: 'bottom top', scrub: true }
      });

    return function () {
      clearTimeout(safety);
      if (pointerCtx) window.removeEventListener('pointermove', pointerCtx);
      if (velTrigger) velTrigger.kill();
      intro.kill();
      gsap.set(heroWords, { yPercent: 0 });
      gsap.set(reveals, { y: 0, autoAlpha: 1 });
    };
  });

  /* --------------------- 2. movimento reduzido ---------------------- */
  mm.add('(prefers-reduced-motion: reduce)', function () {
    gsap.set(heroWords, { yPercent: 0 });
    gsap.set(reveals, { y: 0, autoAlpha: 1 });
    if (marqueeTween) marqueeTween.pause(0);
    if (sealRing) gsap.killTweensOf(sealRing);
  });

  /* ===================================================================
     A ASSINATURA — cardápio em trilha horizontal cinematográfica
     =================================================================== */
  var stage = $('#cardapio');
  var viewport = $('#trackViewport');
  var track = $('#track');
  var dishes = $$('[data-dish]');
  var dotsWrap = $('#dots');
  var bar = $('#stageBar');
  var N = dishes.length;

  if (stage && track && viewport && N > 1) {

    /* pontinhos de navegação */
    var dotBtns = [];
    if (dotsWrap) {
      dishes.forEach(function (d, i) {
        var name = $('.dish-name', d);
        var li = document.createElement('li');
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', 'Ir para ' + (name ? name.textContent : 'prato ' + (i + 1)));
        li.appendChild(b);
        dotsWrap.appendChild(li);
        dotBtns.push(b);
      });
    }

    var btns = dishes.map(function (d) { return $('.dish-btn', d); });
    var frames = dishes.map(function (d) { return $('.dish-frame', d); });
    var metas = dishes.map(function (d) { return $('.dish-meta', d); });

    // atenção: quickSetter('scale') não funciona no GSAP 3.13 (só scaleX/scaleY),
    // então escalamos os dois eixos explicitamente
    var setScale = btns.map(function (b) {
      var sx = gsap.quickSetter(b, 'scaleX');
      var sy = gsap.quickSetter(b, 'scaleY');
      return function (v) { sx(v); sy(v); };
    });
    var setY = btns.map(function (b) { return gsap.quickSetter(b, 'y', 'px'); });
    var setOp = btns.map(function (b) { return gsap.quickSetter(b, 'opacity'); });
    var setMeta = metas.map(function (m) { return m ? gsap.quickSetter(m, 'opacity') : null; });
    var setBar = bar ? gsap.quickSetter(bar, 'scaleX') : null;

    var travel = 0;
    var lastActive = -1;

    var measure = function () {
      travel = Math.max(1, track.scrollWidth - viewport.clientWidth);
      return travel;
    };

    /* núcleo do efeito: distância de cada item ao centro → escala/opacidade/blur */
    var focus = function () {
      var step = travel / (N - 1);
      if (!step) return;
      var x = gsap.getProperty(track, 'x') || 0;
      var pos = gsap.utils.clamp(0, N - 1, -x / step);
      var active = Math.round(pos);

      for (var i = 0; i < N; i++) {
        var d = Math.min(Math.abs(i - pos), 3);
        setScale[i](gsap.utils.clamp(0.52, 1, 1 - d * 0.17));
        setY[i](d * 14);
        setOp[i](gsap.utils.clamp(0.2, 1, 1 - d * 0.38));
        if (setMeta[i]) setMeta[i](gsap.utils.clamp(0, 1, 1 - d * 1.25));
        if (frames[i]) {
          var b = Math.min(d * 1.7, 3.4);
          frames[i].style.filter = b < 0.12 ? '' : 'blur(' + b.toFixed(2) + 'px)';
        }
      }

      if (active !== lastActive) {
        lastActive = active;
        dishes.forEach(function (el, i) { el.classList.toggle('is-active', i === active); });
        dotBtns.forEach(function (el, i) { el.classList.toggle('is-on', i === active); });
      }
      if (setBar) setBar(pos / (N - 1));
    };

    var HOLD = 0.12; // pausa no fim para o último prato respirar antes de soltar o pin

    /* ---------- versão com pin (padrão, mobile e desktop) ---------- */
    mm.add('(prefers-reduced-motion: no-preference)', function () {
      stage.classList.add('is-pinned');
      stage.classList.remove('is-static');

      var tl = gsap.timeline({
        scrollTrigger: {
          id: 'cardapio',
          trigger: stage,
          start: 'top top',
          end: function () { return '+=' + Math.round(measure() * 1.12 + 120); },
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: 0.5,
          invalidateOnRefresh: true,
          // o pin é criado depois de triggers que estão acima dele na página;
          // prioridade menor garante que ele recalcule primeiro
          refreshPriority: -1,
          onRefresh: function () { measure(); focus(); }
        }
      });

      tl.to(track, { x: function () { return -measure(); }, ease: 'none', duration: 1 })
        .to({}, { duration: HOLD });

      for (var i = 0; i < N; i++) tl.addLabel('d' + i, i / (N - 1));

      gsap.ticker.add(focus);

      /* clique num item lateral → ele vem para o centro */
      var goTo = function (i) {
        i = gsap.utils.clamp(0, N - 1, Math.round(i));
        var st = tl.scrollTrigger;
        if (!st) return;
        var y;
        if (typeof st.labelToScroll === 'function') {
          y = st.labelToScroll('d' + i);
        }
        if (y == null || isNaN(y)) {
          y = st.start + (st.end - st.start) * (1 / (1 + HOLD)) * (i / (N - 1));
        }
        gsap.to(window, { scrollTo: { y: y, autoKill: false }, duration: .85, ease: 'power2.inOut' });
      };

      /* clique OU foco por teclado: o navegador tentaria rolar o container
         recortado e desalinhar a trilha, então zeramos e trazemos ao centro */
      var onDish = dishes.map(function (d, i) {
        var handler = function () {
          viewport.scrollLeft = 0; viewport.scrollTop = 0;
          stage.scrollLeft = 0; stage.scrollTop = 0;
          goTo(i);
        };
        var b = btns[i];
        if (b) { b.addEventListener('click', handler); b.addEventListener('focus', handler); }
        return handler;
      });
      var onDot = dotBtns.map(function (b, i) {
        var handler = function () { goTo(i); };
        b.addEventListener('click', handler);
        return handler;
      });

      var prev = $('#prevDish'), next = $('#nextDish');
      var goPrev = function () { goTo(lastActive - 1); };
      var goNext = function () { goTo(lastActive + 1); };
      if (prev) prev.addEventListener('click', goPrev);
      if (next) next.addEventListener('click', goNext);

      /* teclado dentro da trilha */
      var onKey = function (e) {
        if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
      };
      viewport.addEventListener('keydown', onKey);

      measure(); focus();

      return function () {
        gsap.ticker.remove(focus);
        tl.scrollTrigger && tl.scrollTrigger.kill(true);
        tl.kill();
        btns.forEach(function (b, i) {
          if (!b) return;
          b.removeEventListener('click', onDish[i]);
          b.removeEventListener('focus', onDish[i]);
        });
        dotBtns.forEach(function (b, i) { b.removeEventListener('click', onDot[i]); });
        if (prev) prev.removeEventListener('click', goPrev);
        if (next) next.removeEventListener('click', goNext);
        viewport.removeEventListener('keydown', onKey);
        gsap.set(track, { clearProps: 'transform' });
        btns.forEach(function (b) { gsap.set(b, { clearProps: 'all' }); });
        metas.forEach(function (m) { if (m) gsap.set(m, { clearProps: 'opacity' }); });
        frames.forEach(function (f) { if (f) f.style.filter = ''; });
        stage.classList.remove('is-pinned');
      };
    });

    /* ---------- versão sem movimento: lista vertical legível ---------- */
    mm.add('(prefers-reduced-motion: reduce)', function () {
      stage.classList.add('is-static');
      stage.classList.remove('is-pinned');
      gsap.set(track, { clearProps: 'transform' });
      btns.forEach(function (b) { gsap.set(b, { clearProps: 'all' }); });
      metas.forEach(function (m) { if (m) gsap.set(m, { opacity: 1 }); });
      frames.forEach(function (f) { if (f) f.style.filter = ''; });
      return function () { stage.classList.remove('is-static'); };
    });
  }

  /* ===================================================================
     GALERIA "A CASA" — clique numa moldura pequena e ela vira a grande
     (GSAP Flip: círculo → arco)
     =================================================================== */
  var galleryMain = $('#galleryMain');
  var caption = $('#galleryCaption');
  if (galleryMain) {
    var holders = $$('.thumb-holder');
    var busy = false;

    var setCaption = function (img) {
      if (!caption || !img) return;
      var txt = img.getAttribute('data-caption') || '';
      gsap.to(caption, {
        autoAlpha: 0, y: 6, duration: .2,
        onComplete: function () {
          caption.textContent = txt;
          gsap.to(caption, { autoAlpha: 1, y: 0, duration: .35, ease: 'power2.out' });
        }
      });
    };

    holders.forEach(function (holder) {
      var btn = holder.closest('button');
      if (!btn) return;
      btn.addEventListener('click', function () {
        if (busy) return;
        var incoming = holder.querySelector('img');
        var outgoing = galleryMain.querySelector('img');
        if (!incoming || !outgoing || incoming === outgoing) return;
        busy = true;

        var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var state = Flip.getState([incoming, outgoing], { props: 'borderRadius,boxShadow' });

        // troca: a pequena sobe para o centro, a grande desce para o lugar clicado
        galleryMain.appendChild(incoming);
        holder.appendChild(outgoing);

        Flip.from(state, {
          duration: reduce ? 0 : 0.7,
          ease: 'power2.inOut',
          absolute: true,
          props: 'borderRadius,boxShadow',
          onComplete: function () { busy = false; }
        });

        setCaption(incoming);
      });
    });
  }

  /* ------------------------------------------------- botões magnéticos */
  if (window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    $$('[data-magnetic]').forEach(function (el) {
      var xTo = gsap.quickTo(el, 'x', { duration: .5, ease: 'power3' });
      var yTo = gsap.quickTo(el, 'y', { duration: .5, ease: 'power3' });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * .3);
        yTo((e.clientY - (r.top + r.height / 2)) * .45);
      });
      el.addEventListener('pointerleave', function () { xTo(0); yTo(0); });
    });
  }

  /* ------------------------- recalcular após carregar imagens/fontes */
  var refresh = function () { ScrollTrigger.refresh(); };
  window.addEventListener('load', refresh);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  $$('img').forEach(function (img) {
    if (!img.complete) img.addEventListener('load', refresh, { once: true });
  });
  // medir a trilha sempre a partir do zero (padrão oficial para scroll horizontal)
  ScrollTrigger.addEventListener('refreshInit', function () {
    if (track) gsap.set(track, { x: 0 });
  });
})();
