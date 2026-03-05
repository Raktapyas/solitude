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
   3.  Scroll Spine (GSAP scrub)
   4.  Hero parallax
   5.  Reveal animations (fade-up, stagger)
   6.  Stroke Reveals (clip-path)
   7.  Glitch Band
   8.  Blade Dividers
   9.  Finale
   10. Showcase tilt + stagger
   11. Section markers
   12. Progress bar
   13. Footer
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
     2. COMPASS-TICK CURSOR
     ─────────────────────────────────────
     Concept:
       A minimal targeting assembly —
       four 1×7px arms at N/E/S/W orbit a
       tiny diamond center. The assembly
       slow-rotates at idle. Two ghost
       streak lines trail behind at the
       inverse of travel velocity.

       Hover → arms retract, diamond grows,
               glow fires.
       Click → inward snap pulse.
       Idle  → arms slowly rotate (CSS does
               this via a continuous GSAP tween).
  ════════════════════════════════════════ */
  (() => {
    const cur     = document.getElementById('cur');
    const diamond = document.getElementById('curDiamond');
    const armN    = document.getElementById('curN');
    const armE    = document.getElementById('curE');
    const armS    = document.getElementById('curS');
    const armW    = document.getElementById('curW');
    const streak1 = document.getElementById('streak1');
    const streak2 = document.getElementById('streak2');
    if (!cur) return;

    /* ── Position tracking ── */
    let mx = 0, my = 0;        // raw mouse
    let cx = 0, cy = 0;        // lerped position for the wrapper
    let vx = 0, vy = 0;        // velocity
    let pvx= 0, pvy= 0;        // previous velocity (for smoothing)
    let idleAngle = 0;         // rotation angle for idle spin
    let lastTime  = performance.now();
    let isHover   = false;

    /* ── Mouse events ── */
    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
    }, { passive: true });

    document.addEventListener('mousedown', () => {
      document.body.classList.add('is-clicking');
      setTimeout(() => document.body.classList.remove('is-clicking'), 200);
    });

    document.addEventListener('mouseleave', () => { cur.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { cur.style.opacity = '1'; });

    /* ── Hover targets ── */
    document.querySelectorAll(
      'a, button, .img-card, .sc-img, .stroke-reveal, .tb__line--green, figcaption'
    ).forEach(el => {
      el.addEventListener('mouseenter', () => {
        isHover = true;
        document.body.classList.add('is-hovering');
      });
      el.addEventListener('mouseleave', () => {
        isHover = false;
        document.body.classList.remove('is-hovering');
      });
    });

    /* ── Main animation loop ── */
    function tick(now) {
      const dt = Math.min((now - lastTime) / 1000, 0.05); // delta in seconds
      lastTime = now;

      /* Lerp cursor position */
      const lerpFactor = 0.14;
      vx = mx - cx;
      vy = my - cy;
      cx += vx * lerpFactor;
      cy += vy * lerpFactor;

      /* Translate the whole assembly */
      cur.style.transform = `translate(${cx}px, ${cy}px)`;

      /* ── Idle rotation ──
         When not hovering, the arms slowly orbit.
         We add to idleAngle each frame, apply as
         rotation on all four arms simultaneously. */
      if (!isHover) {
        idleAngle += dt * 18; // 18 deg/second = one full rotation ~20s
        if (idleAngle > 360) idleAngle -= 360;

        armN.style.transform = `rotate(${idleAngle}deg) translateY(-14px)`;
        armE.style.transform = `rotate(${idleAngle}deg) translateX(7px)`;
        armS.style.transform = `rotate(${idleAngle}deg) translateY(7px)`;
        armW.style.transform = `rotate(${idleAngle}deg) translateX(-14px)`;
      }

      /* ── Velocity streaks ──
         Compute speed from velocity components.
         Rotate streak lines to trail direction.
         Length is proportional to speed.                */
      const speed = Math.sqrt(vx * vx + vy * vy);
      // Smooth velocity
      pvx = pvx * 0.7 + vx * 0.3;
      pvy = pvy * 0.7 + vy * 0.3;

      if (speed > 1.5) {
        // Angle pointing AWAY from travel direction
        const angle = Math.atan2(pvy, pvx) * (180 / Math.PI) + 180;
        const len1  = Math.min(speed * 1.8, 55);
        const len2  = Math.min(speed * 1.2, 35);

        streak1.style.transform = `rotate(${angle}deg)`;
        streak2.style.transform = `rotate(${angle + 6}deg)`;
        streak1.style.width     = `${len1}px`;
        streak2.style.width     = `${len2}px`;
        streak1.style.opacity   = Math.min(speed / 40, 0.55).toString();
        streak2.style.opacity   = Math.min(speed / 60, 0.25).toString();
      } else {
        // Fade out streaks at rest
        streak1.style.width   = `${Math.max(parseFloat(streak1.style.width || '0') * 0.85, 0)}px`;
        streak2.style.width   = `${Math.max(parseFloat(streak2.style.width || '0') * 0.85, 0)}px`;
        streak1.style.opacity = (parseFloat(streak1.style.opacity || '0') * 0.88).toString();
        streak2.style.opacity = (parseFloat(streak2.style.opacity || '0') * 0.88).toString();
      }

      requestAnimationFrame(tick);
    }

    requestAnimationFrame((t) => {
      lastTime = t;
      requestAnimationFrame(tick);
    });
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
