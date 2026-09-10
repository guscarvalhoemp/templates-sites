/* ===========================================================
   Cerne Construções — interações
   GSAP 3.13.0 + ScrollTrigger + Flip
   =========================================================== */
(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger, Flip);

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var q = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var qa = function (sel, ctx) { return gsap.utils.toArray(sel, ctx); };

  /* ---------------------------------------------------------
     Header + menu mobile
     --------------------------------------------------------- */
  var header = q('#siteHeader');
  var burger = q('#navBurger');
  var mobileMenu = q('#mobileMenu');

  ScrollTrigger.create({
    start: 'top -60',
    end: 99999,
    onUpdate: function (self) {
      header.classList.toggle('is-scrolled', self.scroll() > 60);
    },
    onRefresh: function (self) {
      header.classList.toggle('is-scrolled', self.scroll() > 60);
    }
  });

  function setMenu(open) {
    mobileMenu.dataset.state = open ? 'open' : 'closed';
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.classList.toggle('is-locked', open);
  }
  if (burger) {
    burger.addEventListener('click', function () {
      setMenu(mobileMenu.dataset.state !== 'open');
    });
  }
  qa('.mobile-menu a').forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });

  /* ---------------------------------------------------------
     Marquee infinito
     --------------------------------------------------------- */
  var track = q('#marqueeTrack');
  if (track && !reduced) {
    gsap.to(track, { xPercent: -50, duration: 34, ease: 'none', repeat: -1 });
  }

  /* ---------------------------------------------------------
     Hero — revelação por máscara + linhas + parallax
     --------------------------------------------------------- */
  var heroFrame = q('#heroFrame');
  var heroImg = q('#heroImg');

  if (heroFrame && !reduced) {
    var tlHero = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tlHero
      .fromTo(heroFrame,
        { clipPath: 'inset(16% 14% 26% 14%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.7 })
      .fromTo(heroImg, { scale: 1.22 }, { scale: 1, duration: 2.1 }, 0)
      .fromTo('.hero .lmask__i',
        { yPercent: 115 },
        { yPercent: 0, duration: 1.2, stagger: 0.08 }, 0.5)
      .fromTo(['.hero .eyebrow', '.hero__lead', '.hero__actions', '.hero__rule'],
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.07 }, 0.8);
  }

  if (heroImg && !reduced) {
    gsap.to(heroImg, {
      yPercent: 10,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  /* ---------------------------------------------------------
     Revelações genéricas (nunca pré-escondidas via CSS)
     --------------------------------------------------------- */
  if (!reduced) {
    qa('[data-reveal]').forEach(function (el) {
      gsap.fromTo(el,
        { opacity: 0, y: 26 },
        {
          opacity: 1, y: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%' }
        });
    });

    qa('[data-reveal-mask]').forEach(function (el) {
      gsap.fromTo(el,
        { clipPath: 'inset(0% 0% 100% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' }
        });
    });

    qa('.work').forEach(function (el, i) {
      gsap.fromTo(el,
        { opacity: 0, y: 34 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: (i % 3) * 0.04,
          scrollTrigger: { trigger: el, start: 'top 92%' }
        });
    });

    var studioImg = q('.studio__media img');
    if (studioImg) {
      gsap.fromTo(studioImg,
        { yPercent: -5 },
        {
          yPercent: 5, ease: 'none',
          scrollTrigger: { trigger: '.studio__media', start: 'top bottom', end: 'bottom top', scrub: true }
        });
    }
  }

  /* ---------------------------------------------------------
     Fases da obra — scrubber com clip-path
     --------------------------------------------------------- */
  var phasesSection = q('#fases');
  var phaseFigs = qa('.phase-img');
  var phaseTicks = qa('.phase-tick');
  var phaseReads = qa('.phase-read');
  var phaseStamp = q('#phasesStamp');

  function setPhase(idx) {
    if (setPhase.current === idx) return;
    setPhase.current = idx;
    phaseTicks.forEach(function (t, i) { t.classList.toggle('is-active', i === idx); });
    phaseReads.forEach(function (r, i) {
      var on = i === idx;
      r.classList.toggle('is-active', on);
      gsap.to(r, { opacity: on ? 1 : 0, y: on ? 0 : 12, duration: 0.5, ease: 'power2.out', overwrite: true });
    });
    if (phaseStamp) phaseStamp.textContent = 'Fase 0' + (idx + 1) + '/05';
  }

  if (phasesSection && phaseFigs.length) {
    if (reduced) {
      phasesSection.classList.add('phases--static');
      if (phaseStamp) phaseStamp.textContent = 'Fase 01 a 05';
    } else {
      gsap.set(phaseFigs[0], { clipPath: 'inset(0% 0% 0% 0%)' });
      gsap.set(phaseFigs.slice(1), { clipPath: 'inset(100% 0% 0% 0%)' });
      gsap.set(phaseReads.slice(1), { opacity: 0, y: 12 });
      gsap.set(phaseReads[0], { opacity: 1, y: 0 });
      setPhase.current = 0;

      var clampPhase = gsap.utils.clamp(0, phaseFigs.length - 1);

      var tlPhases = gsap.timeline({
        scrollTrigger: {
          trigger: phasesSection,
          start: 'top top',
          end: function () { return '+=' + Math.round(window.innerHeight * 3.6); },
          scrub: 0.65,
          pin: '#phasesInner',
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: function (self) {
            setPhase(clampPhase(Math.floor(self.progress * phaseFigs.length - 0.5)));
          }
        }
      });

      for (var i = 1; i < phaseFigs.length; i++) {
        tlPhases.to(phaseFigs[i], {
          clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.inOut', duration: 1
        }, i);
        tlPhases.fromTo(phaseFigs[i].querySelector('img'),
          { scale: 1.14 }, { scale: 1, ease: 'power2.out', duration: 1.4 }, i);
      }
      tlPhases.to({}, { duration: 1 }, phaseFigs.length);
    }
  }

  /* ---------------------------------------------------------
     Obras — preview no cursor + expansão via Flip
     --------------------------------------------------------- */
  var preview = q('#wpreview');
  var previewImgs = qa('.wpreview__img');
  var rows = qa('.work__row');
  var items = qa('.works__list .work');

  var panel = q('#wpanel');
  var panelBg = q('#wpanelBg');
  var panelMedia = q('#wpMedia');
  var panelInfo = q('#wpInfo');
  var panelClose = q('#wpClose');

  var isOpen = false;
  var openIndex = -1;
  var lastTrigger = null;
  var originRect = null;
  var flipping = false;

  function fillPanel(li) {
    q('#wpTag').textContent = li.dataset.cat + ' / ' + li.dataset.year;
    q('#wpTitle').textContent = li.dataset.title;
    q('#wpDesc').textContent = li.dataset.desc;
    q('#wpArea').textContent = li.dataset.area;
    q('#wpPrazo').textContent = li.dataset.prazo;
    q('#wpLocal').textContent = li.dataset.local;
    q('#wpEscopo').textContent = li.dataset.escopo;

    var gal = q('#wpGallery');
    gal.textContent = '';
    var srcs = (li.dataset.gallery || '').split('|');
    var alts = (li.dataset.galleryAlt || '').split('|');
    srcs.forEach(function (src, i) {
      if (!src) return;
      var img = document.createElement('img');
      img.src = src;
      img.alt = alts[i] || (li.dataset.title + ' — imagem ' + (i + 1));
      img.loading = 'lazy';
      img.decoding = 'async';
      gal.appendChild(img);
    });
  }

  function lockScroll(on) {
    if (on) {
      var sw = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = sw > 0 ? sw + 'px' : '';
      document.body.classList.add('is-locked');
    } else {
      document.body.classList.remove('is-locked');
      document.body.style.paddingRight = '';
    }
  }

  function showPreviewImage(index, instant) {
    previewImgs.forEach(function (img, i) {
      if (instant) gsap.set(img, { opacity: i === index ? 1 : 0 });
      else gsap.to(img, { opacity: i === index ? 1 : 0, duration: 0.45, ease: 'power2.out', overwrite: true });
    });
  }

  function openWork(index, triggerEl) {
    if (isOpen || flipping || !preview || !panel) return;
    var li = items[index];
    if (!li) return;

    openIndex = index;
    lastTrigger = triggerEl || null;

    fillPanel(li);
    showPreviewImage(index, true);

    /* se não houve hover (toque), parte da miniatura da linha */
    var thumb = triggerEl ? triggerEl.querySelector('.work__thumb') : null;
    var previewVisible = gsap.getProperty(preview, 'opacity') > 0.05;
    if (!previewVisible) {
      var r = (thumb && thumb.offsetWidth) ? thumb.getBoundingClientRect() : triggerEl.getBoundingClientRect();
      gsap.set(preview, { x: r.left, y: r.top, width: r.width, height: r.height, opacity: 1 });
    }

    panel.hidden = false;
    lockScroll(true);
    isOpen = true;
    flipping = true;

    originRect = preview.getBoundingClientRect();

    var state = Flip.getState(preview);
    panelMedia.appendChild(preview);
    gsap.set(preview, { clearProps: 'all' });

    if (reduced) {
      gsap.set(panelBg, { opacity: 1 });
      gsap.set(panelInfo, { opacity: 1, y: 0 });
      flipping = false;
      panelClose.focus();
      return;
    }

    gsap.set(panelMedia, { overflow: 'visible' });
    gsap.set(panelBg, { opacity: 0 });
    gsap.set(panelInfo, { opacity: 0, y: 26 });

    gsap.to(panelBg, { opacity: 1, duration: 0.5, ease: 'power2.out' });

    Flip.from(state, {
      duration: 0.95,
      ease: 'expo.out',
      scale: false,
      onComplete: function () {
        gsap.set(panelMedia, { clearProps: 'overflow' });
        flipping = false;
      }
    });

    gsap.to(panelInfo, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.28 });
    panelClose.focus();
  }

  function finishClose() {
    gsap.set(preview, { clearProps: 'all' });
    panel.hidden = true;
    lockScroll(false);
    isOpen = false;
    flipping = false;
    if (lastTrigger) { lastTrigger.focus(); lastTrigger = null; }
    document.dispatchEvent(new CustomEvent('cerne:panel-closed'));
  }

  function closeWork() {
    if (!isOpen || flipping) return;
    flipping = true;

    if (reduced) { document.body.appendChild(preview); finishClose(); return; }

    var state = Flip.getState(preview);
    document.body.appendChild(preview);
    gsap.set(preview, { clearProps: 'all' });
    if (originRect) {
      gsap.set(preview, {
        x: originRect.left, y: originRect.top,
        width: originRect.width, height: originRect.height,
        opacity: 1
      });
    }

    gsap.to(panelInfo, { opacity: 0, y: 18, duration: 0.35, ease: 'power2.in' });
    gsap.to(panelBg, { opacity: 0, duration: 0.55, ease: 'power2.in', delay: 0.18 });

    Flip.from(state, {
      duration: 0.7,
      ease: 'expo.inOut',
      scale: false,
      onComplete: function () {
        gsap.to(preview, {
          opacity: 0, duration: 0.25, ease: 'power2.out',
          onComplete: finishClose
        });
      }
    });
  }

  rows.forEach(function (row) {
    row.addEventListener('click', function () {
      openWork(parseInt(row.dataset.index, 10), row);
    });
  });

  if (panelClose) panelClose.addEventListener('click', closeWork);
  if (panelBg) panelBg.addEventListener('click', closeWork);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (isOpen) closeWork();
      else if (mobileMenu && mobileMenu.dataset.state === 'open') setMenu(false);
    }
  });
  var wpCta = q('#wpCta');
  if (wpCta) wpCta.addEventListener('click', function () { if (isOpen) closeWork(); });

  /* --- preview seguindo o cursor (somente ponteiro fino em telas largas) --- */
  if (preview && rows.length) {
    gsap.matchMedia().add(
      '(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
      function () {
        var xTo = gsap.quickTo(preview, 'x', { duration: 0.6, ease: 'power3' });
        var yTo = gsap.quickTo(preview, 'y', { duration: 0.6, ease: 'power3' });
        var current = -1;
        var started = false;

        function target(e) {
          var w = preview.offsetWidth || 272;
          var h = preview.offsetHeight || 344;
          return {
            x: gsap.utils.clamp(12, window.innerWidth - w - 12, e.clientX - w / 2),
            y: gsap.utils.clamp(12, window.innerHeight - h - 12, e.clientY - h * 0.5)
          };
        }

        function onMove(e) {
          if (current < 0 || isOpen) return;
          var t = target(e);
          if (!started) { xTo(t.x, t.x); yTo(t.y, t.y); started = true; }
          else { xTo(t.x); yTo(t.y); }
        }

        function onEnter(e) {
          if (isOpen || flipping) return;
          var idx = parseInt(this.dataset.index, 10);
          var first = current < 0;
          current = idx;
          if (first) { started = false; onMove(e); }
          showPreviewImage(idx, first);
          /* overwrite:'auto' — nunca `true`: `true` mataria os tweens de x/y do quickTo
             e o preview congelaria no ponto de entrada em vez de seguir o cursor. */
          gsap.to(preview, { opacity: 1, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
        }

        function onLeaveList() {
          current = -1;
          started = false;
          if (!isOpen) gsap.to(preview, { opacity: 0, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
        }

        /* depois que o painel fecha, o preview volta ao zero via clearProps:
           reancora o quickTo para não saltar de uma posição obsoleta */
        function onPanelClosed() { current = -1; started = false; }

        var list = q('#worksList');
        rows.forEach(function (r) { r.addEventListener('pointerenter', onEnter); });
        list.addEventListener('pointerleave', onLeaveList);
        window.addEventListener('pointermove', onMove, { passive: true });
        document.addEventListener('cerne:panel-closed', onPanelClosed);

        return function () {
          rows.forEach(function (r) { r.removeEventListener('pointerenter', onEnter); });
          list.removeEventListener('pointerleave', onLeaveList);
          window.removeEventListener('pointermove', onMove);
          document.removeEventListener('cerne:panel-closed', onPanelClosed);
          if (!isOpen) gsap.set(preview, { opacity: 0, clearProps: 'transform' });
        };
      }
    );
  }

  /* ---------------------------------------------------------
     Refresh após carregamento de imagens / fontes
     --------------------------------------------------------- */
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
})();
