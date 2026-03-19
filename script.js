/* ============================================================
   SOLITUDE — script.js v2
   ─────────────────────────────────────────────────────────
   Modules
   ─────────────────────────────────────────────────────────
   1.  Canvas Grain
   2.  Compass-Tick Cursor
       — 4 cardinal arms + diamond center, slow rotation
       — velocity streak trails (2 lines, velocity-driven)
       — hover: arms retract, diamond blooms
       — click: inward pulse snap
   2.  Scroll Spine (GSAP scrub)
   3.  Hero parallax
   4.  Reveal animations (fade-up, stagger)
   5.  Stroke Reveals (clip-path)
   6.  Glitch Band
   7.  Blade Dividers
   8.  Finale
   9.  Showcase tilt + stagger
   10. Section markers
   11. Progress bar
   12. Footer
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  gsap.registerPlugin(ScrollTrigger);

  /* ════════════════════════════════════════
     1. CANVAS GRAIN
     Real pixel-noise redrawn each frame —
     far more organic than CSS filter grain.
  ════════════════════════════════════════ */
  (() => {
    const canvas = document.getElementById('grainCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function drawNoise() {
      const w = canvas.width, h = canvas.height;
      const img = ctx.createImageData(w, h);
      const d   = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        d[i] = d[i+1] = d[i+2] = v;
        d[i+3] = 24; // very low alpha
      }
      ctx.putImageData(img, 0, 0);
      requestAnimationFrame(drawNoise);
    }

    resize();
    drawNoise();
    window.addEventListener('resize', resize, { passive: true });
  })();


  /* ════════════════════════════════════════
     3. SCROLL SPINE — 1px green growing line
  ════════════════════════════════════════ */
  (() => {
    const fill = document.getElementById('spineFill');
    if (!fill) return;
    gsap.to(fill, {
      height: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end:   'bottom bottom',
        scrub: 0.04,
      }
    });
  })();


  /* ════════════════════════════════════════
     4. HERO PARALLAX
  ════════════════════════════════════════ */
  (() => {
    const content = document.querySelector('.hero__content');
    const ghost   = document.querySelector('.hero__ghost');
    if (content) {
      gsap.to(content, {
        y: -90, ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1.8 }
      });
    }
    if (ghost) {
      gsap.to(ghost, {
        y: 70, ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 2.5 }
      });
    }
  })();


  /* ════════════════════════════════════════
     5. REVEAL ANIMATIONS
     Staggered fade-up within each block.
  ════════════════════════════════════════ */
  (() => {
    // Text block stagger groups
    document.querySelectorAll('.tb__inner').forEach(block => {
      const lines = block.querySelectorAll('.reveal-up');
      if (!lines.length) return;
      gsap.fromTo(lines,
        { opacity: 0, y: 48, filter: 'blur(3px)' },
        {
          opacity: 1, y: 0, filter: 'blur(0px)',
          duration: 1.1, ease: 'power3.out', stagger: 0.14,
          scrollTrigger: {
            trigger: block, start: 'top 82%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    });

    // Standalone reveals
    ['.pivot__small', '.showcase__title', '.showcase__sub'].forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        gsap.fromTo(el,
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' }
          }
        );
      });
    });
  })();


  /* ════════════════════════════════════════
     6. STROKE REVEALS
     clip-path inset(0 100% 0 0) → inset(0 0% 0 0)
     The text "paints in" left to right.
  ════════════════════════════════════════ */
  (() => {
    document.querySelectorAll('.stroke-reveal').forEach(wrapper => {
      const solid = wrapper.querySelector('.sr__solid');
      if (!solid) return;
      gsap.fromTo(solid,
        { clipPath: 'inset(0 100% 0 0)' },
        {
          clipPath: 'inset(0 0% 0 0)',
          duration: 1.5, ease: 'power3.inOut',
          scrollTrigger: {
            trigger: wrapper, start: 'top 80%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    });
  })();


  /* ════════════════════════════════════════
     7. GLITCH BAND
     Response line slides + gets neon flicker.
  ════════════════════════════════════════ */
  (() => {
    const response = document.getElementById('gbResponse');
    if (!response) return;

    ScrollTrigger.create({
      trigger: '#glitchSection',
      start: 'top 68%',
      onEnter: () => {
        gsap.fromTo(response,
          { opacity: 0, x: -28, letterSpacing: '0.45em' },
          {
            opacity: 1, x: 0, letterSpacing: '0.18em',
            duration: 1.1, delay: 0.35, ease: 'power3.out',
            onComplete: () => {
              response.style.animation = 'neonFlicker 5s 0.1s infinite';
            }
          }
        );
      },
      onLeaveBack: () => {
        response.style.animation = '';
        gsap.to(response, { opacity: 0, x: -28, duration: 0.3 });
      }
    });
  })();


  /* ════════════════════════════════════════
     8. BLADE DIVIDERS — grow on scroll
  ════════════════════════════════════════ */
  (() => {
    document.querySelectorAll('.blade').forEach(blade => {
      gsap.fromTo(blade,
        { height: 0, opacity: 0 },
        {
          height: 80, opacity: 0.4, duration: 1.2, ease: 'power2.out',
          scrollTrigger: { trigger: blade, start: 'top 92%', toggleActions: 'play none none reverse' }
        }
      );
    });
  })();


  /* ════════════════════════════════════════
     9. FINALE
  ════════════════════════════════════════ */
  (() => {
    const blade = document.getElementById('finaleBlade');
    if (!blade) return;
    ScrollTrigger.create({
      trigger: '#finale', start: 'top 65%',
      onEnter: () => {
        gsap.fromTo(blade,
          { width: 0 },
          {
            width: 'clamp(80px, 24vw, 300px)',
            duration: 1.4, delay: 0.7, ease: 'power3.out',
            onComplete: () => blade.classList.add('glowing')
          }
        );
      },
      onLeaveBack: () => {
        blade.classList.remove('glowing');
        gsap.to(blade, { width: 0, duration: 0.4 });
      }
    });
  })();


  /* ════════════════════════════════════════
     10. SHOWCASE
  ════════════════════════════════════════ */
  (() => {
    // Stagger card reveal
    const cards = document.querySelectorAll('.reveal-card');
    const groups = new Map();
    cards.forEach(card => {
      const p = card.parentElement;
      if (!groups.has(p)) groups.set(p, []);
      groups.get(p).push(card);
    });
    groups.forEach((children, parent) => {
      gsap.fromTo(children,
        { opacity: 0, scale: 0.95, y: 40 },
        {
          opacity: 1, scale: 1, y: 0,
          duration: 1.1, ease: 'power3.out', stagger: 0.14,
          scrollTrigger: { trigger: parent, start: 'top 82%', toggleActions: 'play none none reverse' }
        }
      );
    });

    // 3D tilt on hover
    document.querySelectorAll('.img-card, .sc-img').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r  = el.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
        const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
        gsap.to(el, {
          rotateX: -dy * 4, rotateY: dx * 4,
          transformPerspective: 900,
          ease: 'power2.out', duration: 0.35,
        });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.7, ease: 'elastic.out(1, 0.6)' });
      });
    });
  })();


  /* ════════════════════════════════════════
     11. SECTION MARKERS
     Rule lines grow, numbers fade in.
  ════════════════════════════════════════ */
  (() => {
    document.querySelectorAll('.tb__rule').forEach(rule => {
      gsap.fromTo(rule,
        { scaleX: 0, opacity: 0 },
        {
          scaleX: 1, opacity: 0.15, transformOrigin: 'left',
          duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: rule, start: 'top 92%' }
        }
      );
    });
    document.querySelectorAll('.tb__num').forEach(num => {
      gsap.fromTo(num,
        { opacity: 0, x: -10 },
        {
          opacity: 0.5, x: 0, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: num, start: 'top 92%' }
        }
      );
    });
  })();


  /* ════════════════════════════════════════
     12. TOP PROGRESS BAR
     1px green line at very top edge.
  ════════════════════════════════════════ */
  (() => {
    const bar = document.createElement('div');
    Object.assign(bar.style, {
      position: 'fixed', top: '0', left: '0',
      height:   '1px',  width: '0%',
      background: '#00b347',
      zIndex: '9998', pointerEvents: 'none',
    });
    document.body.appendChild(bar);
    gsap.to(bar, {
      width: '100%', ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start:   'top top',
        end:     'bottom bottom',
        scrub:   0.04,
      }
    });
  })();


  /* ════════════════════════════════════════
     13. FOOTER
  ════════════════════════════════════════ */
  (() => {
    gsap.fromTo('.footer__brand, .footer__note',
      { opacity: 0, y: 16 },
      {
        opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power2.out',
        scrollTrigger: { trigger: '.footer', start: 'top 92%' }
      }
    );
    gsap.fromTo('.footer__blade',
      { scaleX: 0 },
      {
        scaleX: 1, transformOrigin: 'left', duration: 1.5, ease: 'power3.out',
        scrollTrigger: { trigger: '.footer', start: 'top 95%' }
      }
    );
  })();

}); // end DOMContentLoaded
