/* ============================================================
   SOLITUDE — script.js v3 BADASS EDITION
   ─────────────────────────────────────────────────────────
   Modules
   ─────────────────────────────────────────────────────────
   1.  Canvas Grain (organic pixel noise)
   2.  Scroll Spine (GSAP scrub fill)
   3.  Progress Bar (top edge)
   4.  Hero Parallax (multi-layer depth)
   5.  Word-by-Word Slam (split text, paused → triggered)
   6.  Reveal Animations (fade-up with blur, staggered)
   7.  Stroke Reveals (clip-path paint)
   8.  Glitch Band (entry + neon flicker)
   9.  Blade Dividers (grow on scroll)
   10. tb__giant Shimmer (scroll-activated)
   11. Section Markers (rule + number entry)
   12. Image Parallax (vertical scrub inside frame)
   13. 3D Tilt Cards (mouse-tracking perspective)
   14. Showcase Stagger (card reveals)
   15. Finale (blade glow)
   16. Footer (brand + blade)
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  gsap.registerPlugin(ScrollTrigger);

  /* ════════════════════════════════════════════════════════
     1. CANVAS GRAIN
        Real pixel-noise redrawn every frame.
        More organic than CSS filter grain.
  ════════════════════════════════════════════════════════ */
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
        d[i+3] = 20; /* very low alpha — barely visible texture */
      }
      ctx.putImageData(img, 0, 0);
      requestAnimationFrame(drawNoise);
    }

    resize();
    drawNoise();
    window.addEventListener('resize', resize, { passive: true });
  })();


  /* ════════════════════════════════════════════════════════
     2. SCROLL SPINE
        1px vertical fill, scrubbed to scroll position.
  ════════════════════════════════════════════════════════ */
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
        scrub: 0.05,
      }
    });
  })();


  /* ════════════════════════════════════════════════════════
     3. PROGRESS BAR
        2px top-edge gradient bar, scrubbed.
  ════════════════════════════════════════════════════════ */
  (() => {
    const bar = document.getElementById('progress-bar');
    if (!bar) return;

    gsap.to(bar, {
      width: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end:   'bottom bottom',
        scrub: 0.05,
      }
    });
  })();


  /* ════════════════════════════════════════════════════════
     4. HERO PARALLAX
        Multi-layer depth — content drifts up,
        ghost number drifts down at different rate.
  ════════════════════════════════════════════════════════ */
  (() => {
    const content = document.querySelector('.hero__content');
    const ghost   = document.querySelector('.hero__ghost');
    const grid    = document.querySelector('.hero__grid');

    if (content) {
      gsap.to(content, {
        y: -100, ease: 'none',
        scrollTrigger: {
          trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 2,
        }
      });
    }
    if (ghost) {
      gsap.to(ghost, {
        y: 80, ease: 'none',
        scrollTrigger: {
          trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 2.8,
        }
      });
    }
    if (grid) {
      gsap.to(grid, {
        opacity: 0, ease: 'none',
        scrollTrigger: {
          trigger: '#hero', start: '60% top', end: 'bottom top', scrub: 1,
        }
      });
    }
  })();


  /* ════════════════════════════════════════════════════════
     5. WORD-BY-WORD SLAM ANIMATION
        Splits .word-anim paragraph text into individual
        <span class="word"> elements.
        Each gets a staggered animation-delay.
        CSS handles wordSlam keyframe.
        ScrollTrigger toggles the .is-visible class,
        which switches animation-play-state to running.
  ════════════════════════════════════════════════════════ */
  (() => {
    document.querySelectorAll('.word-anim').forEach(el => {
      /* Split text into word spans, preserving spaces */
      const rawText = el.innerHTML;
      const tokens  = rawText.split(/(\s+)/);
      let delay = 0;
      const html = tokens.map(token => {
        if (/^\s+$/.test(token)) return token; // keep spaces
        const span = `<span class="word" style="animation-delay:${delay.toFixed(2)}s">${token}</span>`;
        delay += 0.085;
        return span;
      });
      el.innerHTML = html.join('');

      /* ScrollTrigger: add class to start CSS animation */
      ScrollTrigger.create({
        trigger: el,
        start: 'top 84%',
        onEnter: () => el.classList.add('is-visible'),
        onLeaveBack: () => {
          el.classList.remove('is-visible');
          /* Reset opacity so animation replays */
          el.querySelectorAll('.word').forEach(w => {
            w.style.opacity = '0';
          });
          /* Small timeout to allow reflow before removing opacity override */
          setTimeout(() => {
            el.querySelectorAll('.word').forEach(w => w.style.opacity = '');
          }, 50);
        }
      });
    });
  })();


  /* ════════════════════════════════════════════════════════
     6. REVEAL ANIMATIONS — fade-up with blur, staggered
  ════════════════════════════════════════════════════════ */
  (() => {
    /* Text block line groups — staggered within each block */
    document.querySelectorAll('.tb__inner').forEach(block => {
      const lines = block.querySelectorAll('.reveal-up');
      if (!lines.length) return;

      gsap.fromTo(lines,
        { opacity: 0, y: 55, filter: 'blur(6px)' },
        {
          opacity: 1, y: 0, filter: 'blur(0px)',
          duration: 1.3, ease: 'power3.out', stagger: 0.16,
          scrollTrigger: {
            trigger: block, start: 'top 82%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    });

    /* Standalone elements — pivot, showcase header */
    ['.pivot__small', '.showcase__title', '.showcase__sub'].forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        gsap.fromTo(el,
          { opacity: 0, y: 34, filter: 'blur(4px)' },
          {
            opacity: 1, y: 0, filter: 'blur(0px)',
            duration: 1.1, ease: 'power3.out',
            scrollTrigger: {
              trigger: el, start: 'top 88%',
              toggleActions: 'play none none reverse',
            }
          }
        );
      });
    });
  })();


  /* ════════════════════════════════════════════════════════
     7. STROKE REVEALS — left-to-right clip-path paint
        Both sr__solid layers animate independently.
        Fires with slight stagger on nested reveals.
  ════════════════════════════════════════════════════════ */
  (() => {
    document.querySelectorAll('.stroke-reveal').forEach(wrapper => {
      const solid = wrapper.querySelector('.sr__solid');
      if (!solid) return;

      gsap.fromTo(solid,
        { clipPath: 'inset(0 100% 0 0)' },
        {
          clipPath: 'inset(0 0% 0 0)',
          duration: 1.65, ease: 'power3.inOut',
          scrollTrigger: {
            trigger: wrapper, start: 'top 80%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    });
  })();


  /* ════════════════════════════════════════════════════════
     8. GLITCH BAND
        Response text slams in from left with blur.
        On complete, CSS neonFlicker animation kicks in.
        Glitch shake fires on the ghost text.
  ════════════════════════════════════════════════════════ */
  (() => {
    const response = document.getElementById('gbResponse');
    const ghost    = document.querySelector('.gb__ghost');
    if (!response) return;

    let shakeInterval = null;

    ScrollTrigger.create({
      trigger: '#glitchSection',
      start: 'top 68%',
      onEnter: () => {
        gsap.fromTo(response,
          { opacity: 0, x: -40, letterSpacing: '0.5em', filter: 'blur(8px)' },
          {
            opacity: 1, x: 0, letterSpacing: '0.16em', filter: 'blur(0px)',
            duration: 1.2, delay: 0.3, ease: 'power3.out',
            onComplete: () => {
              response.style.animation = 'neonFlicker 5s 0.1s infinite';
            }
          }
        );

        /* Ghost text: occasional glitch shake */
        if (ghost) {
          shakeInterval = setInterval(() => {
            if (Math.random() > 0.65) {
              ghost.style.animation = 'glitchShake 0.4s ease, breathe 9s ease-in-out infinite';
              setTimeout(() => {
                ghost.style.animation = 'breathe 9s ease-in-out infinite';
              }, 420);
            }
          }, 2200);
        }
      },
      onLeaveBack: () => {
        response.style.animation = '';
        gsap.to(response, { opacity: 0, x: -30, filter: 'blur(4px)', duration: 0.3 });
        if (shakeInterval) { clearInterval(shakeInterval); shakeInterval = null; }
      }
    });
  })();


  /* ════════════════════════════════════════════════════════
     9. BLADE DIVIDERS — vertical line grows on scroll
  ════════════════════════════════════════════════════════ */
  (() => {
    document.querySelectorAll('.blade').forEach(blade => {
      gsap.fromTo(blade,
        { height: 0, opacity: 0 },
        {
          height: 90, opacity: 0.5, duration: 1.4, ease: 'power2.out',
          scrollTrigger: {
            trigger: blade, start: 'top 92%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    });
  })();


  /* ════════════════════════════════════════════════════════
     10. TB__GIANT SHIMMER
         The giant outline word gets a gold-to-crimson shimmer
         activated when it enters the viewport.
  ════════════════════════════════════════════════════════ */
  (() => {
    document.querySelectorAll('.tb__giant').forEach(el => {
      ScrollTrigger.create({
        trigger: el, start: 'top 85%',
        onEnter:    () => el.classList.add('shimmer-active'),
        onLeaveBack:() => el.classList.remove('shimmer-active'),
      });
    });
  })();


  /* ════════════════════════════════════════════════════════
     11. SECTION MARKERS — rule + number
         Rule scaleX grows from left.
         Number ticks in from left with opacity.
  ════════════════════════════════════════════════════════ */
  (() => {
    document.querySelectorAll('.tb__rule').forEach(rule => {
      gsap.fromTo(rule,
        { scaleX: 0, opacity: 0 },
        {
          scaleX: 1, opacity: 0.22, transformOrigin: 'left',
          duration: 1.3, ease: 'power3.out',
          scrollTrigger: { trigger: rule, start: 'top 93%' }
        }
      );
    });

    document.querySelectorAll('.tb__num').forEach(num => {
      gsap.fromTo(num,
        { opacity: 0, x: -18 },
        {
          opacity: 0.55, x: 0, duration: 0.75, ease: 'power2.out',
          scrollTrigger: { trigger: num, start: 'top 93%' }
        }
      );
    });
  })();


  /* ════════════════════════════════════════════════════════
     12. IMAGE PARALLAX
         Each image shifts vertically as its section scrolls
         past. Rate varies per image for layered depth.
         This runs alongside the CSS ken-burns animation.
  ════════════════════════════════════════════════════════ */
  (() => {
    const scrubRates = [1.4, 2.0, 1.7, 1.9, 1.5, 2.2];

    document.querySelectorAll('.sc-img__frame img, .img-card__frame img').forEach((img, i) => {
      const container = img.closest('.sc-img, .img-card');
      if (!container) return;

      /* Only apply vertical parallax — don't fight the ken-burns X/scale */
      gsap.fromTo(img,
        { yPercent: -6 },
        {
          yPercent: 6, ease: 'none',
          scrollTrigger: {
            trigger: container,
            start: 'top bottom', end: 'bottom top',
            scrub: scrubRates[i % scrubRates.length],
          }
        }
      );
    });
  })();


  /* ════════════════════════════════════════════════════════
     13. 3D TILT CARDS — mouse-tracking perspective
         rotateX / rotateY follow cursor within card bounds.
         Elastic spring on mouse leave.
  ════════════════════════════════════════════════════════ */
  (() => {
    document.querySelectorAll('.img-card, .sc-img').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r  = el.getBoundingClientRect();
        const dx = (e.clientX - r.left  - r.width  / 2) / (r.width  / 2);
        const dy = (e.clientY - r.top   - r.height / 2) / (r.height / 2);
        gsap.to(el, {
          rotateX: -dy * 7, rotateY: dx * 7,
          transformPerspective: 1000,
          ease: 'power2.out', duration: 0.3,
        });
      });

      el.addEventListener('mouseleave', () => {
        gsap.to(el, {
          rotateX: 0, rotateY: 0,
          duration: 1.0, ease: 'elastic.out(1, 0.55)',
        });
      });
    });
  })();


  /* ════════════════════════════════════════════════════════
     14. SHOWCASE STAGGER — staggered card reveals
         Groups cards by parent so img-strip and showcase
         each animate independently.
  ════════════════════════════════════════════════════════ */
  (() => {
    const cards  = document.querySelectorAll('.reveal-card');
    const groups = new Map();

    cards.forEach(card => {
      const parent = card.parentElement;
      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent).push(card);
    });

    groups.forEach((children, parent) => {
      gsap.fromTo(children,
        { opacity: 0, scale: 0.90, y: 55, filter: 'blur(8px)' },
        {
          opacity: 1, scale: 1, y: 0, filter: 'blur(0px)',
          duration: 1.4, ease: 'power3.out', stagger: 0.18,
          scrollTrigger: {
            trigger: parent, start: 'top 83%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    });
  })();


  /* ════════════════════════════════════════════════════════
     15. FINALE — glowing horizontal blade
  ════════════════════════════════════════════════════════ */
  (() => {
    const blade = document.getElementById('finaleBlade');
    if (!blade) return;

    ScrollTrigger.create({
      trigger: '#finale', start: 'top 65%',
      onEnter: () => {
        gsap.fromTo(blade,
          { width: 0 },
          {
            width: 'clamp(80px, 25vw, 320px)',
            duration: 1.5, delay: 0.65, ease: 'power3.out',
            onComplete: () => blade.classList.add('glowing'),
          }
        );
      },
      onLeaveBack: () => {
        blade.classList.remove('glowing');
        gsap.to(blade, { width: 0, duration: 0.4 });
      }
    });
  })();


  /* ════════════════════════════════════════════════════════
     16. FOOTER — brand text + blade rule
  ════════════════════════════════════════════════════════ */
  (() => {
    gsap.fromTo('.footer__brand, .footer__credit',
      { opacity: 0, y: 20, filter: 'blur(4px)' },
      {
        opacity: 1, y: 0, filter: 'blur(0px)',
        duration: 1, stagger: 0.15, ease: 'power2.out',
        scrollTrigger: { trigger: '.footer', start: 'top 92%' }
      }
    );

    gsap.fromTo('.footer__blade',
      { scaleX: 0 },
      {
        scaleX: 1, transformOrigin: 'left',
        duration: 2, ease: 'power3.out',
        scrollTrigger: { trigger: '.footer', start: 'top 95%' }
      }
    );
  })();

}); /* end DOMContentLoaded */
