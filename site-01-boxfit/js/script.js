/* ============================================================
   IRONCAGE BOXING & PERFORMANCE — script.js
   Assinatura: movimento rápido e contundente (back.out / power4.out).
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined';

  if (hasGSAP && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header: shrink on scroll ---------- */
  var header = document.getElementById('site-header');
  if (header) {
    var onHeaderScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 30);
    };
    onHeaderScroll();
    window.addEventListener('scroll', onHeaderScroll, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobile-menu');
  if (hamburger && mobileMenu) {
    var closeMenu = function () {
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('is-open');
      document.body.style.overflow = '';
    };
    var openMenu = function () {
      hamburger.setAttribute('aria-expanded', 'true');
      mobileMenu.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    };
    hamburger.addEventListener('click', function () {
      var isOpen = hamburger.getAttribute('aria-expanded') === 'true';
      if (isOpen) closeMenu(); else openMenu();
    });
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }

  /* ============================================================
     HERO — timeline de entrada, rápida e com impacto
     ============================================================ */
  if (hasGSAP) {
    var heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    heroTl
      .fromTo('.hero-eyebrow', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.45 })
      .fromTo('.hero-title .line', { opacity: 0, y: 70, rotate: 2 },
        { opacity: 1, y: 0, rotate: 0, duration: 0.7, stagger: 0.1, ease: 'back.out(1.6)' }, '-=0.2')
      .fromTo('.hero-lead', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45 }, '-=0.3')
      .fromTo('.hero-cta > *', { opacity: 0, y: 16, scale: 0.92 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.08, ease: 'back.out(2)' }, '-=0.25');
  }

  /* ============================================================
     REVEAL ao rolar (ScrollTrigger) — rápido, sem preciosismo
     ============================================================ */
  if (hasGSAP && window.ScrollTrigger && !reduceMotion) {
    var revealEls = gsap.utils.toArray('.reveal');
    revealEls.forEach(function (el, i) {
      gsap.fromTo(el,
        { opacity: 0, y: 26 },
        {
          opacity: 1, y: 0, duration: 0.5, ease: 'power4.out',
          scrollTrigger: { trigger: el, start: 'top 88%' }
        }
      );
    });

    gsap.utils.toArray('.service-card').forEach(function (card, i) {
      gsap.fromTo(card,
        { opacity: 0, y: 30, scale: 0.96 },
        {
          opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'back.out(1.5)', delay: (i % 3) * 0.06,
          scrollTrigger: { trigger: card, start: 'top 92%' }
        }
      );
    });
  }

  /* ============================================================
     SERVICES — grid horizontal com scroll-snap
     ============================================================ */
  (function initServicesScroller() {
    var scroller = document.getElementById('servicesScroller');
    var track = document.getElementById('servicesTrack');
    var progressBar = document.getElementById('servicesProgressBar');
    var arrows = document.querySelectorAll('.services-arrow');
    if (!scroller || !track) return;

    function cardStep() {
      var card = track.querySelector('.service-card');
      if (!card) return 320;
      var style = window.getComputedStyle(track);
      var gap = parseFloat(style.columnGap || style.gap || '20') || 20;
      return card.getBoundingClientRect().width + gap;
    }

    function updateProgress() {
      var max = scroller.scrollWidth - scroller.clientWidth;
      var ratio = max > 0 ? scroller.scrollLeft / max : 0;
      if (progressBar) {
        if (hasGSAP) {
          gsap.to(progressBar, { scaleX: Math.max(0.05, Math.min(1, ratio * 0.834 + 0.166)), duration: 0.15, ease: 'power1.out', overwrite: true, transformOrigin: 'left center' });
        }
        progressBar.style.width = (16.6 + ratio * 83.4) + '%';
      }
      arrows.forEach(function (btn) {
        var dir = parseInt(btn.getAttribute('data-dir'), 10);
        if (dir < 0) btn.disabled = scroller.scrollLeft <= 4;
        if (dir > 0) btn.disabled = scroller.scrollLeft >= max - 4;
      });
    }

    var ticking = false;
    scroller.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () { updateProgress(); ticking = false; });
        ticking = true;
      }
    }, { passive: true });

    arrows.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var dir = parseInt(btn.getAttribute('data-dir'), 10);
        scroller.scrollBy({ left: dir * cardStep(), behavior: 'smooth' });
      });
    });

    window.addEventListener('resize', updateProgress);
    updateProgress();
  })();

  /* ============================================================
     TESTIMONIALS — carrossel (autoplay + arrows/dots + swipe)
     ============================================================ */
  (function initTestiCarousel() {
    var carousel = document.getElementById('testiCarousel');
    var track = document.getElementById('testiTrack');
    var dotsWrap = document.getElementById('testiDots');
    var arrows = document.querySelectorAll('.carousel-arrow');
    if (!carousel || !track) return;

    var slides = Array.prototype.slice.call(track.children);
    var index = 0;
    var autoplayDelay = 5500;
    var autoplayTimer = null;

    slides.forEach(function (slide, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Ir para depoimento ' + (i + 1));
      dot.addEventListener('click', function () { goTo(i); restartAutoplay(); });
      dotsWrap.appendChild(dot);
    });
    var dots = Array.prototype.slice.call(dotsWrap.children);

    function render() {
      if (hasGSAP) {
        gsap.to(track, { xPercent: -100 * index, duration: 0.6, ease: 'power3.inOut' });
      } else {
        track.style.transform = 'translateX(' + (-100 * index) + '%)';
      }
      dots.forEach(function (d, i) {
        d.classList.toggle('is-active', i === index);
        d.setAttribute('aria-selected', i === index ? 'true' : 'false');
      });
    }

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      render();
    }

    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    arrows.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var dir = parseInt(btn.getAttribute('data-dir'), 10);
        if (dir > 0) next(); else prev();
        restartAutoplay();
      });
    });

    function startAutoplay() {
      if (reduceMotion) return;
      stopAutoplay();
      autoplayTimer = window.setInterval(next, autoplayDelay);
    }
    function stopAutoplay() {
      if (autoplayTimer) { window.clearInterval(autoplayTimer); autoplayTimer = null; }
    }
    function restartAutoplay() { startAutoplay(); }

    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    carousel.addEventListener('focusin', stopAutoplay);
    carousel.addEventListener('focusout', startAutoplay);

    /* swipe */
    var touchStartX = 0, touchDeltaX = 0, isTouching = false;
    track.addEventListener('touchstart', function (e) {
      isTouching = true;
      touchStartX = e.touches[0].clientX;
      touchDeltaX = 0;
      stopAutoplay();
    }, { passive: true });
    track.addEventListener('touchmove', function (e) {
      if (!isTouching) return;
      touchDeltaX = e.touches[0].clientX - touchStartX;
    }, { passive: true });
    track.addEventListener('touchend', function () {
      if (!isTouching) return;
      isTouching = false;
      if (touchDeltaX < -40) next();
      else if (touchDeltaX > 40) prev();
      restartAutoplay();
    });

    render();
    startAutoplay();
  })();

  /* ============================================================
     WHATSAPP FLUTUANTE — aparece por SCROLL (IntersectionObserver),
     entrada com impacto (back-ease), sem pulso contínuo.
     ============================================================ */
  (function initWhatsappFloat() {
    var btn = document.getElementById('whatsappFloat');
    var trigger = document.getElementById('modalidades');
    if (!btn || !trigger || typeof IntersectionObserver === 'undefined') {
      if (btn) { btn.style.opacity = '1'; btn.style.visibility = 'visible'; btn.style.pointerEvents = 'auto'; }
      return;
    }

    var visible = false;

    function show() {
      if (visible) return;
      visible = true;
      btn.style.visibility = 'visible';
      btn.style.pointerEvents = 'auto';
      if (hasGSAP) {
        gsap.fromTo(btn,
          { opacity: 0, y: 44, scale: 0.8 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.8)', overwrite: true }
        );
      } else {
        btn.style.opacity = '1';
      }
    }

    function hide() {
      if (!visible) return;
      visible = false;
      if (hasGSAP) {
        gsap.to(btn, {
          opacity: 0, y: 44, scale: 0.8, duration: 0.3, ease: 'power2.in', overwrite: true,
          onComplete: function () { btn.style.visibility = 'hidden'; btn.style.pointerEvents = 'none'; }
        });
      } else {
        btn.style.opacity = '0';
        btn.style.visibility = 'hidden';
        btn.style.pointerEvents = 'none';
      }
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var passedDown = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        if (passedDown) show(); else hide();
      });
    }, { threshold: 0 });

    observer.observe(trigger);
  })();

})();
