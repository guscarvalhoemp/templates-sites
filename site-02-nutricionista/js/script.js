/* =========================================================================
   LUMIÈRE ESTÉTICA — js/script.js
   Fade lento por seção via ScrollTrigger, comparador oval, header, menu
   mobile, e botão WhatsApp flutuante com atraso, entrada animada e pulso.
   ========================================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------------
     Header: estado "scrolled" (fundo sólido depois de sair do hero)
  --------------------------------------------------------------------- */
  var hdr = document.querySelector('.hdr');
  if (hdr) {
    var setHdrState = function () {
      hdr.classList.toggle('is-scrolled', window.scrollY > 40);
    };
    setHdrState();
    var hdrTicking = false;
    window.addEventListener('scroll', function () {
      if (!hdrTicking) {
        window.requestAnimationFrame(function () {
          setHdrState();
          hdrTicking = false;
        });
        hdrTicking = true;
      }
    }, { passive: true });
  }

  /* ---------------------------------------------------------------------
     Menu mobile
  --------------------------------------------------------------------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');
  if (burger && menu) {
    var closeMenu = function () {
      burger.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open');
    };
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      menu.classList.toggle('is-open', !open);
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ---------------------------------------------------------------------
     Reveal em fade lento (GSAP + ScrollTrigger)
     — sem CSS opacity:0 prévio: o estado inicial é aplicado por gsap.set()
       só depois que o GSAP confirmadamente carregou, então se o script
       falhar o conteúdo permanece visível (fallback seguro).
  --------------------------------------------------------------------- */
  var hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  if (hasGSAP && !reduceMotion) {
    gsap.registerPlugin(ScrollTrigger);

    var revealEls = gsap.utils.toArray('[data-reveal]');

    revealEls.forEach(function (el) {
      var isBlur = el.hasAttribute('data-blur');
      var fromVars = { autoAlpha: 0, y: 34 };
      var toVars = {
        autoAlpha: 1,
        y: 0,
        duration: 1.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          end: 'bottom 15%',
          toggleActions: 'play reverse play reverse'
        }
      };
      if (isBlur) {
        fromVars.filter = 'blur(10px)';
        toVars.filter = 'blur(0px)';
        toVars.duration = 1.3;
        toVars.ease = 'expo.out';
      }
      gsap.fromTo(el, fromVars, toVars);
    });

    /* Hero: pequena entrada de carregamento (não depende de scroll) */
    var heroTitle = document.getElementById('heroTitle');
    var heroLede = document.querySelector('.hero__lede');
    var heroEyebrow = document.querySelector('.hero .eyebrow');
    if (heroTitle) {
      var heroTl = gsap.timeline({ delay: .15 });
      if (heroEyebrow) heroTl.fromTo(heroEyebrow, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: .9, ease: 'power2.out' });
      heroTl.fromTo(heroTitle, { autoAlpha: 0, y: 26, filter: 'blur(6px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out' }, '-=.55');
      if (heroLede) heroTl.fromTo(heroLede, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'power2.out' }, '-=.7');
    }
  }

  /* ---------------------------------------------------------------------
     Comparador oval antes/depois
  --------------------------------------------------------------------- */
  var frame = document.getElementById('compareFrame');
  var after = document.getElementById('compareAfter');
  var handle = document.getElementById('compareHandle');

  if (frame && after && handle) {
    var setCompare = function (pct) {
      pct = Math.max(0, Math.min(100, pct));
      after.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
      handle.style.left = pct + '%';
      handle.setAttribute('aria-valuenow', Math.round(pct));
      handle.setAttribute('aria-valuetext', Math.round(pct) + '% do resultado depois visível');
    };
    setCompare(50);

    var dragging = false;
    var pctFromEvent = function (clientX) {
      var rect = frame.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    };

    var onMove = function (e) {
      if (!dragging) return;
      var x = e.touches ? e.touches[0].clientX : e.clientX;
      setCompare(pctFromEvent(x));
    };
    var stopDrag = function () { dragging = false; };

    frame.addEventListener('pointerdown', function (e) {
      dragging = true;
      setCompare(pctFromEvent(e.clientX));
    });
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', stopDrag);
    window.addEventListener('pointercancel', stopDrag);

    handle.addEventListener('keydown', function (e) {
      var current = parseFloat(handle.getAttribute('aria-valuenow')) || 50;
      if (e.key === 'ArrowLeft') { setCompare(current - 5); e.preventDefault(); }
      if (e.key === 'ArrowRight') { setCompare(current + 5); e.preventDefault(); }
      if (e.key === 'Home') { setCompare(0); e.preventDefault(); }
      if (e.key === 'End') { setCompare(100); e.preventDefault(); }
    });
  }

  /* ---------------------------------------------------------------------
     Botão WhatsApp flutuante — aparece 3s depois, pulso contínuo sutil
  --------------------------------------------------------------------- */
  var waFloat = document.getElementById('waFloat');
  if (waFloat) {
    window.setTimeout(function () {
      waFloat.classList.add('is-visible');

      if (hasGSAP && !reduceMotion) {
        gsap.fromTo(waFloat,
          { autoAlpha: 0, scale: .55 },
          {
            autoAlpha: 1, scale: 1, duration: .7, ease: 'back.out(1.6)',
            onComplete: function () {
              gsap.to(waFloat, {
                scale: 1.04,
                duration: 2,
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1
              });
            }
          }
        );
      } else {
        waFloat.style.opacity = '1';
        waFloat.style.visibility = 'visible';
        waFloat.style.transform = 'scale(1)';
      }
    }, 3000);
  }

})();
