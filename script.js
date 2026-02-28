/* ============================================================
   SOLITUDE — script.js
   GSAP + ScrollTrigger animations + cursor + interactions
   ============================================================ */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {

  // ─── Register GSAP Plugins ─────────────────────────────
  gsap.registerPlugin(ScrollTrigger);


  /* ══════════════════════════════════════════════════════
     1. CUSTOM LIME CURSOR
  ══════════════════════════════════════════════════════ */
  const cursor      = document.getElementById('cursor');
  const cursorTrail = document.getElementById('cursorTrail');

  // Track mouse position with smooth lag for trail
  let mouseX = 0, mouseY = 0;
  let trailX = 0, trailY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Snap inner cursor immediately
    cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  // Animate trail with lerp
  function animateTrail() {
    trailX += (mouseX - trailX) * 0.12;
    trailY += (mouseY - trailY) * 0.12;
    cursorTrail.style.transform = `translate(${trailX}px, ${trailY}px)`;
    requestAnimationFrame(animateTrail);
  }
  animateTrail();

  // Add hover class on interactive elements
  const hoverTargets = document.querySelectorAll('a, button, .img-card, .showcase-img, .glitch-text');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    cursorTrail.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    cursorTrail.style.opacity = '0.5';
  });


  /* ══════════════════════════════════════════════════════
     2. REVEAL TEXT ANIMATIONS (ScrollTrigger)
  ══════════════════════════════════════════════════════ */

  // Generic fade-up for all .reveal-text elements
  gsap.utils.toArray('.reveal-text').forEach((el) => {
    gsap.fromTo(el,
      {
        opacity: 0,
        y: 50,
        filter: 'blur(4px)',
      },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          end: 'top 50%',
          toggleActions: 'play none none reverse',
        },
        // Stagger siblings automatically via delay
        delay: el.classList.contains('large') ? 0 : 0.15,
        onComplete: () => {
          // Trigger lime underline animation for highlighted text
          if (el.classList.contains('highlight')) {
            el.classList.add('animated');
          }
        }
      }
    );
  });

  // Stagger text blocks — children animate in sequence
  gsap.utils.toArray('.text-block__inner').forEach((block) => {
    const children = block.querySelectorAll('.reveal-text');
    gsap.fromTo(children,
      { opacity: 0, y: 40, filter: 'blur(3px)' },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.0,
        ease: 'power3.out',
        stagger: 0.18,
        scrollTrigger: {
          trigger: block,
          start: 'top 82%',
          toggleActions: 'play none none reverse',
        },
        onComplete: () => {
          children.forEach(child => {
            if (child.classList.contains('highlight')) {
              child.classList.add('animated');
            }
          });
        }
      }
    );
  });


  /* ══════════════════════════════════════════════════════
     3. IMAGE CARDS REVEAL
  ══════════════════════════════════════════════════════ */
  gsap.utils.toArray('.reveal-card').forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, y: 60, scale: 0.97 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.1,
        ease: 'power3.out',
        delay: i * 0.14,
        scrollTrigger: {
          trigger: card,
          start: 'top 86%',
          toggleActions: 'play none none reverse',
        }
      }
    );
  });


  /* ══════════════════════════════════════════════════════
     4. GLITCH SECTION ANIMATION
  ══════════════════════════════════════════════════════ */
  const glitchText = document.querySelector('.glitch-text');
  const glitchSub  = document.querySelector('.glitch-sub');

  if (glitchText) {
    ScrollTrigger.create({
      trigger: '#glitchSection',
      start: 'top 70%',
      onEnter: () => {
        // Animate main glitch text
        gsap.fromTo(glitchText,
          { opacity: 0, x: -30 },
          { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out' }
        );

        // Activate glitch CSS effect after short delay
        setTimeout(() => {
          glitchText.classList.add('glitch-active');
        }, 500);

        // Animate sub text
        gsap.fromTo(glitchSub,
          { opacity: 0, y: 20, letterSpacing: '0.5em' },
          {
            opacity: 1,
            y: 0,
            letterSpacing: '0.15em',
            duration: 1.2,
            delay: 0.4,
            ease: 'power3.out'
          }
        );
      },
      onLeaveBack: () => {
        glitchText.classList.remove('glitch-active');
        gsap.to(glitchText, { opacity: 0, x: -30, duration: 0.4 });
        gsap.to(glitchSub, { opacity: 0, duration: 0.3 });
      }
    });
  }


  /* ══════════════════════════════════════════════════════
     5. FINAL REVEAL — "myself."
  ══════════════════════════════════════════════════════ */
  const finalWord      = document.querySelector('.final-reveal__word');
  const finalUnderline = document.querySelector('.final-reveal__underline');

  if (finalWord) {
    ScrollTrigger.create({
      trigger: '#finalReveal',
      start: 'top 65%',
      onEnter: () => {
        finalWord.classList.add('visible');
        finalUnderline.classList.add('visible');

        // Extra glow animation via GSAP
        gsap.fromTo(finalWord,
          { textShadow: '0 0 0px transparent' },
          {
            textShadow: '0 0 40px rgba(255,255,255,0.15)',
            duration: 2,
            ease: 'power2.out',
            delay: 0.4
          }
        );
      },
      onLeaveBack: () => {
        finalWord.classList.remove('visible');
        finalUnderline.classList.remove('visible');
      }
    });
  }


  /* ══════════════════════════════════════════════════════
     6. HERO PARALLAX — subtle depth on scroll
  ══════════════════════════════════════════════════════ */
  const heroTitle = document.querySelector('.hero__title');
  const heroDecoNum = document.querySelector('.hero__deco-num');

  if (heroTitle) {
    gsap.to(heroTitle, {
      y: -80,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
      }
    });
  }

  if (heroDecoNum) {
    gsap.to(heroDecoNum, {
      y: 60,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 2,
      }
    });
  }


  /* ══════════════════════════════════════════════════════
     7. DIVIDER QUOTE — text stroke reveal
  ══════════════════════════════════════════════════════ */
  const dqAccent = document.querySelector('.dq__accent');
  const dqLines  = document.querySelectorAll('.dq__line');

  if (dqAccent) {
    ScrollTrigger.create({
      trigger: '#dividerQuote',
      start: 'top 75%',
      onEnter: () => {
        // Lines expand from center
        gsap.fromTo(dqLines,
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 0.6, duration: 1, ease: 'power2.out', stagger: 0.1 }
        );

        // Accent word reveals with stroke first
        gsap.fromTo(dqAccent,
          { opacity: 0, scale: 0.8, filter: 'blur(10px)' },
          { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.2, delay: 0.3, ease: 'power3.out' }
        );
      }
    });
  }


  /* ══════════════════════════════════════════════════════
     8. SECTION BACKGROUND SHIFT on scroll
  ══════════════════════════════════════════════════════ */
  // Subtle lime tint shift as user scrolls through sections
  const sections = document.querySelectorAll('.text-block, .glitch-section');
  sections.forEach((section) => {
    gsap.fromTo(section,
      { backgroundPosition: 'center 0%' },
      {
        backgroundPosition: 'center 100%',
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        }
      }
    );
  });


  /* ══════════════════════════════════════════════════════
     9. SHOWCASE IMAGE REVEAL — stagger with scale
  ══════════════════════════════════════════════════════ */
  const showcaseImgs = document.querySelectorAll('.showcase-img');
  gsap.fromTo(showcaseImgs,
    { opacity: 0, scale: 0.94, y: 40 },
    {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 1.2,
      ease: 'power3.out',
      stagger: 0.2,
      scrollTrigger: {
        trigger: '#showcase',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      }
    }
  );


  /* ══════════════════════════════════════════════════════
     10. FOOTER FADE
  ══════════════════════════════════════════════════════ */
  gsap.fromTo('.footer__tagline, .footer__copy',
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: 1,
      stagger: 0.15,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.footer',
        start: 'top 90%',
      }
    }
  );


  /* ══════════════════════════════════════════════════════
     11. BACKGROUND LINES in HERO — fade in stagger
  ══════════════════════════════════════════════════════ */
  gsap.fromTo('.hero__bg-lines span',
    { scaleY: 0, opacity: 0 },
    {
      scaleY: 1,
      opacity: 0.25,
      duration: 2,
      ease: 'power2.out',
      stagger: 0.1,
      delay: 0.3,
    }
  );


  /* ══════════════════════════════════════════════════════
     12. BLOCK LABEL NUMBER COUNTERS — subtle entrance
  ══════════════════════════════════════════════════════ */
  gsap.utils.toArray('.block-label').forEach(label => {
    gsap.fromTo(label,
      { opacity: 0, x: -20 },
      {
        opacity: 0.7,
        x: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: label,
          start: 'top 90%',
        }
      }
    );
  });


  /* ══════════════════════════════════════════════════════
     13. SMOOTH SCROLL PROGRESS indicator (optional bar)
  ══════════════════════════════════════════════════════ */
  // Create a tiny lime progress bar at top
  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    height: 2px;
    width: 0%;
    background: #a3ff12;
    z-index: 9999;
    box-shadow: 0 0 6px #a3ff12;
    pointer-events: none;
    transition: none;
  `;
  document.body.appendChild(progressBar);

  gsap.to(progressBar, {
    width: '100%',
    ease: 'none',
    scrollTrigger: {
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.1,
    }
  });


  /* ══════════════════════════════════════════════════════
     14. GRAIN OVERLAY — random flicker for atmosphere
  ══════════════════════════════════════════════════════ */
  const grain = document.querySelector('.grain-overlay');
  if (grain) {
    function flickerGrain() {
      const opacity = 0.02 + Math.random() * 0.02;
      grain.style.opacity = opacity;
      setTimeout(flickerGrain, 80 + Math.random() * 120);
    }
    flickerGrain();
  }


  /* ══════════════════════════════════════════════════════
     15. SHOWCASE IMG — magnetic effect on hover
  ══════════════════════════════════════════════════════ */
  document.querySelectorAll('.showcase-img, .img-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;

      gsap.to(card, {
        rotateX: -dy * 6,
        rotateY: dx * 6,
        transformPerspective: 800,
        ease: 'power2.out',
        duration: 0.4,
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.5)',
      });
    });
  });

}); // end DOMContentLoaded
