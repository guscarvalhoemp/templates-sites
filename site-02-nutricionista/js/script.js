/* =====================================================================
   NUTRE BELLEVIE — interações
   GSAP 3.13 + ScrollTrigger + Draggable
   Paradigma: círculos, arcos e órbitas.
   ===================================================================== */
(function () {
  'use strict';

  var hasGSAP = typeof window.gsap !== 'undefined';
  if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger, Draggable);
    gsap.defaults({ ease: 'power3.out', duration: 0.8 });
  }

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var D = function (v) { return REDUCED ? 0 : v; };
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var RAD = Math.PI / 180;

  /* ------------------------------------------------------------------
     1. HEADER + MENU MOBILE (revelação circular)
     ------------------------------------------------------------------ */
  (function header() {
    var hdr = $('.hdr');
    var burger = $('#burger');
    var menu = $('#menu');
    if (!hdr || !burger || !menu) return;

    var onScroll = function () {
      hdr.classList.toggle('is-stuck', (window.scrollY || window.pageYOffset) > 12);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    var isDesktop = window.matchMedia('(min-width: 900px)');

    function setOpen(open) {
      menu.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.querySelector('.sr-only').textContent = open ? 'Fechar menu' : 'Abrir menu';
      document.body.style.overflow = open ? 'hidden' : '';
    }

    burger.addEventListener('click', function () {
      setOpen(burger.getAttribute('aria-expanded') !== 'true');
    });

    menu.addEventListener('click', function (e) {
      if (e.target.closest('a') && !isDesktop.matches) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        setOpen(false); burger.focus();
      }
    });

    isDesktop.addEventListener('change', function (e) { if (e.matches) setOpen(false); });
  })();

  /* ------------------------------------------------------------------
     2. SELETOR ORBITAL DE PROGRAMAS
     ------------------------------------------------------------------ */
  (function orbit() {
    var stage = $('#orbitStage');
    var tablist = $('#orbitTabs');
    if (!stage || !tablist) return;

    var chips = $$('.chip', tablist);
    var slides = $$('.core-slide', stage);
    var panels = $$('.panel', $('#orbitDetail'));
    var n = chips.length;
    var step = 360 / n;
    var active = 0;
    var rot = -90;                 // rotação atual da órbita (graus)
    var orbitMQ = window.matchMedia('(min-width: 1160px)');
    var radius = 0;

    /* estado inicial dos slides definido em JS (nunca via CSS pré-oculto) */
    if (hasGSAP) {
      slides.forEach(function (s, i) { gsap.set(s, { autoAlpha: i === 0 ? 1 : 0, scale: 1 }); });
    } else {
      slides.forEach(function (s, i) { s.style.opacity = i === 0 ? '1' : '0'; });
    }

    function measure() {
      var w = stage.clientWidth;
      var half = 0;
      chips.forEach(function (c) { half = Math.max(half, c.offsetWidth / 2); });
      radius = Math.max(140, w / 2 - half - 8);
    }

    function place(animated) {
      if (!orbitMQ.matches || !hasGSAP) return;
      chips.forEach(function (chip, i) {
        var a = (rot + i * step) * RAD;
        var vars = {
          x: Math.cos(a) * radius,
          y: Math.sin(a) * radius,
          xPercent: -50, yPercent: -50,
          scale: i === active ? 1.06 : 1
        };
        if (animated && !REDUCED) {
          gsap.to(chip, Object.assign({ duration: 0.85, ease: 'power3.inOut', overwrite: 'auto' }, vars));
        } else {
          gsap.set(chip, vars);
        }
      });
    }

    /* anima a rotação: cada quadro recalcula a posição pela trigonometria,
       então os chips percorrem o arco de verdade — não uma reta. */
    function spinTo(target) {
      if (!orbitMQ.matches || !hasGSAP) return;
      while (target - rot > 180) target -= 360;
      while (target - rot < -180) target += 360;
      if (REDUCED) { rot = target; place(false); return; }
      gsap.to({ v: rot }, {
        v: target, duration: 0.95, ease: 'power3.inOut', overwrite: true,
        onUpdate: function () { rot = this.targets()[0].v; place(false); }
      });
      chips.forEach(function (chip, i) {
        gsap.to(chip, { scale: i === active ? 1.06 : 1, duration: 0.6, ease: 'power2.out' });
      });
    }

    function swapCore(prev, next) {
      if (!hasGSAP) {
        slides.forEach(function (s, i) { s.style.opacity = i === next ? '1' : '0'; });
        return;
      }
      if (prev === next) return;
      gsap.to(slides[prev], { autoAlpha: 0, scale: 1.05, duration: D(0.45), ease: 'power2.inOut' });
      gsap.fromTo(slides[next],
        { autoAlpha: 0, scale: 1.1 },
        { autoAlpha: 1, scale: 1, duration: D(0.7), ease: 'power3.out' });
    }

    function swapPanel(next) {
      panels.forEach(function (p, i) {
        if (i === next) {
          p.hidden = false;
          if (hasGSAP && !REDUCED) {
            gsap.fromTo(p, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' });
          }
        } else {
          p.hidden = true;
        }
      });
    }

    function select(i, moveFocus) {
      var prev = active;
      active = (i + n) % n;
      chips.forEach(function (c, k) {
        var on = k === active;
        c.setAttribute('aria-selected', String(on));
        c.tabIndex = on ? 0 : -1;
      });
      swapCore(prev, active);
      swapPanel(active);

      if (orbitMQ.matches) {
        spinTo(-90 - active * step);
      } else {
        chips[active].scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
      }
      if (moveFocus) chips[active].focus();
    }

    chips.forEach(function (chip, i) {
      chip.addEventListener('click', function () { select(i, false); });
    });

    tablist.addEventListener('keydown', function (e) {
      var k = e.key, next = null;
      if (k === 'ArrowRight' || k === 'ArrowDown') next = active + 1;
      else if (k === 'ArrowLeft' || k === 'ArrowUp') next = active - 1;
      else if (k === 'Home') next = 0;
      else if (k === 'End') next = n - 1;
      if (next === null) return;
      e.preventDefault();
      select(next, true);
    });

    function applyMode() {
      if (orbitMQ.matches) {
        measure();
        rot = -90 - active * step;
        place(false);
      } else if (hasGSAP) {
        gsap.set(chips, { clearProps: 'transform' });
      }
    }

    orbitMQ.addEventListener('change', applyMode);
    window.addEventListener('resize', function () {
      if (!orbitMQ.matches) return;
      measure(); place(false);
    });

    /* posições só depois das fontes carregarem (largura dos chips muda) */
    applyMode();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { applyMode(); });
    }
    window.addEventListener('load', applyMode);
  })();

  /* ------------------------------------------------------------------
     3. COMPARADOR ANTES / DEPOIS (círculo arrastável)
     ------------------------------------------------------------------ */
  (function compare() {
    var box = $('#compare');
    var handle = $('#compareHandle');
    if (!box || !handle) return;

    var pct = 0.5;
    var HW = 2;

    function span() { return Math.max(1, box.clientWidth - HW); }

    function paint(p, silent) {
      pct = Math.min(1, Math.max(0, p));
      box.style.setProperty('--pos', (pct * 100) + '%');
      var v = Math.round(pct * 100);
      handle.setAttribute('aria-valuenow', String(v));
      handle.setAttribute('aria-valuetext', v + '% do prato depois visível');
      if (!silent) {
        if (hasGSAP) gsap.set(handle, { x: pct * span() });
        else handle.style.transform = 'translateX(' + (pct * span()) + 'px)';
      }
    }

    paint(0.5);

    if (hasGSAP && typeof Draggable !== 'undefined') {
      Draggable.create(handle, {
        type: 'x',
        bounds: box,
        cursor: 'ew-resize',
        onPress: function () { box.classList.add('is-dragging'); },
        onRelease: function () { box.classList.remove('is-dragging'); },
        onDrag: function () { paint(this.x / span(), true); },
        onThrowUpdate: function () { paint(this.x / span(), true); }
      });
    } else {
      var down = false;
      handle.addEventListener('pointerdown', function (e) { down = true; handle.setPointerCapture(e.pointerId); });
      window.addEventListener('pointermove', function (e) {
        if (!down) return;
        paint((e.clientX - box.getBoundingClientRect().left) / span());
      });
      window.addEventListener('pointerup', function () { down = false; });
    }

    /* clique/toque em qualquer ponto do círculo move a alça */
    box.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      if (e.target.closest('.compare__handle')) return;
      paint((e.clientX - box.getBoundingClientRect().left) / span());
    });

    handle.addEventListener('keydown', function (e) {
      var s = e.shiftKey ? 0.1 : 0.03, next = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = pct + s;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = pct - s;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = 1;
      if (next === null) return;
      e.preventDefault();
      paint(next);
    });

    window.addEventListener('resize', function () { paint(pct); });
    window.addEventListener('load', function () { paint(pct); });
  })();

  /* ------------------------------------------------------------------
     4. DEPOIMENTOS COMPACTOS
     ------------------------------------------------------------------ */
  (function quotes() {
    var wrap = $('#quotes');
    if (!wrap) return;
    var items = $$('.quote', wrap);
    var dots = $$('.avatar');
    var i = 0, timer = null;

    function go(k) {
      i = (k + items.length) % items.length;
      items.forEach(function (q, x) { q.classList.toggle('is-active', x === i); });
      dots.forEach(function (d, x) { d.classList.toggle('is-active', x === i); });
    }

    dots.forEach(function (d, k) {
      d.addEventListener('click', function () { go(k); stop(); });
    });

    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    if (!REDUCED) {
      timer = setInterval(function () { go(i + 1); }, 7000);
      wrap.addEventListener('pointerenter', stop);
    }
  })();

  /* ------------------------------------------------------------------
     5. FORMULÁRIO
     ------------------------------------------------------------------ */
  (function form() {
    var f = $('#form');
    if (!f) return;
    var status = $('#formStatus');

    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = null;
      $$('.field', f).forEach(function (field) {
        var ctrl = field.querySelector('input,select,textarea');
        if (!ctrl || !ctrl.required) return;
        var ok = ctrl.checkValidity() && String(ctrl.value).trim() !== '';
        field.classList.toggle('is-invalid', !ok);
        if (!ok && !bad) bad = ctrl;
      });
      if (bad) {
        status.textContent = 'Confira os campos destacados antes de enviar.';
        status.classList.add('is-error');
        bad.focus();
        return;
      }
      status.classList.remove('is-error');
      status.textContent = 'Pedido recebido. A equipe da Nutre Bellevie responde pelo WhatsApp em até 1 dia útil.';
      f.reset();
    });

    $$('.field input,.field select', f).forEach(function (ctrl) {
      ctrl.addEventListener('input', function () { ctrl.closest('.field').classList.remove('is-invalid'); });
    });
  })();

  /* ------------------------------------------------------------------
     6. ANIMAÇÕES DE SCROLL (tudo dentro de matchMedia)
     ------------------------------------------------------------------ */
  if (!hasGSAP) return;

  var mm = gsap.matchMedia();

  /* ---- 6a. gauges: arcos preenchendo (motion + reduced) ---- */
  function initGauges(animate) {
    $$('.gauge').forEach(function (g) {
      var value = parseFloat(g.dataset.value) || 0;
      var path = $('.gauge__fill', g);
      var num = $('.gauge__n', g);
      var display = g.dataset.display;
      var len = path.getTotalLength();

      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });

      if (!animate) {
        gsap.set(path, { strokeDashoffset: len * (1 - value / 100) });
        return;
      }

      var target = { v: 0 };
      var end = display ? parseFloat(display.replace(',', '.')) : value;
      num.textContent = display ? '0,0' : '0';

      gsap.to(path, {
        strokeDashoffset: len * (1 - value / 100),
        duration: 1.6, ease: 'power2.inOut',
        scrollTrigger: { trigger: g, start: 'top 82%', once: true }
      });
      gsap.to(target, {
        v: end, duration: 1.6, ease: 'power2.inOut',
        scrollTrigger: { trigger: g, start: 'top 82%', once: true },
        onUpdate: function () {
          num.textContent = display
            ? target.v.toFixed(1).replace('.', ',')
            : String(Math.round(target.v));
        }
      });
    });
  }

  /* ---- 6b. montagem do prato ---- */
  function initPlate(animate) {
    var track = $('#assembleTrack');
    var stage = $('#assembleStage');
    var plate = $('#plate');
    var ring = $('#plateRing');
    var pieces = $$('.piece');
    if (!track || !stage || !pieces.length) return;

    var ringLen = ring ? ring.getTotalLength() : 0;

    function geo(i) {
      var box = Math.min(stage.clientWidth, stage.clientHeight);
      var size = pieces[i].offsetWidth || 80;
      var r = Math.max(90, box / 2 - size / 2 - 12);
      var a = (-90 + i * (360 / pieces.length)) * RAD;
      return { fx: Math.cos(a) * r, fy: Math.sin(a) * r, sx: Math.cos(a) * r * 2.15, sy: Math.sin(a) * r * 2.15 };
    }

    if (!animate) {
      pieces.forEach(function (el, i) {
        var g = geo(i);
        gsap.set(el, { x: g.fx, y: g.fy, scale: 1, rotate: 0, autoAlpha: 1 });
      });
      gsap.set(plate, { scale: 1, autoAlpha: 1 });
      if (ring) gsap.set(ring, { strokeDasharray: ringLen, strokeDashoffset: 0 });
      gsap.set(track, { height: 'auto' });
      gsap.set(stage, { position: 'relative', top: 'auto', height: 'min(78vh, 640px)' });
      return;
    }

    if (ring) gsap.set(ring, { strokeDasharray: ringLen, strokeDashoffset: ringLen });

    var tl = gsap.timeline({
      defaults: { duration: 1, ease: 'power2.out' },
      scrollTrigger: {
        trigger: track,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        invalidateOnRefresh: true
      }
    });

    tl.fromTo(plate, { scale: 0.78, autoAlpha: 0.25 }, { scale: 1, autoAlpha: 1, duration: 1.4 }, 0);
    if (ring) tl.to(ring, { strokeDashoffset: 0, duration: 3.4, ease: 'none' }, 0.2);

    pieces.forEach(function (el, i) {
      tl.fromTo(el,
        {
          x: function () { return geo(i).sx; },
          y: function () { return geo(i).sy; },
          scale: 0.3, rotate: i % 2 ? -34 : 34, autoAlpha: 0
        },
        {
          x: function () { return geo(i).fx; },
          y: function () { return geo(i).fy; },
          scale: 1, rotate: 0, autoAlpha: 1, duration: 1.15, ease: 'power2.out'
        },
        0.55 + i * 0.42);
    });

    tl.fromTo($('#plateCaption'),
      { autoAlpha: 0, y: 14, xPercent: -50 },
      { autoAlpha: 1, y: 0, xPercent: -50, duration: 0.8 }, '>-0.4');
  }

  /* ---- 6c. reveals ---- */
  function initReveals() {
    var groups = [
      ['.hero__copy > *', 0.09],
      ['.hero__media', 0],
      ['.gauges .sec-head > *', 0.08],
      ['.gauge', 0.12],
      ['.gauges__foot', 0],
      ['.orbit-sec .sec-head > *', 0.08],
      ['.orbit__stage', 0],
      ['.orbit__detail', 0],
      ['.assemble__intro > *', 0.08],
      ['.steps-text li', 0.06],
      ['.stories__viz', 0],
      ['.stories__copy > .eyebrow, .stories__copy > h2, .quotes, .quotes__nav', 0.08],
      ['.book__aside', 0],
      ['.book__form-wrap', 0]
    ];

    groups.forEach(function (g) {
      var els = $$(g[0]);
      if (!els.length) return;
      gsap.set(els, { autoAlpha: 0, y: 26 });
      gsap.to(els, {
        autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: g[1],
        scrollTrigger: { trigger: els[0].closest('section') || els[0], start: 'top 78%', once: true }
      });
    });
  }

  mm.add('(prefers-reduced-motion: no-preference)', function () {
    initGauges(true);
    initPlate(true);
    initReveals();
  });

  mm.add('(prefers-reduced-motion: reduce)', function () {
    initGauges(false);
    initPlate(false);
  });

  /* recalcular depois que imagens e fontes assentam */
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
})();
