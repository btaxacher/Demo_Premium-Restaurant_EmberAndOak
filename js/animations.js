/* ════════════════════════════════════════════���══════════════
   EMBER & OAK — GSAP Animations
   ScrollTrigger, Parallax, Reveals, Hero Timeline
   ═════════════════════��══════════════════════════════════��══ */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // Show everything immediately
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    // Remove page loader
    const loader = document.getElementById('pageLoader');
    if (loader) loader.style.display = 'none';
    return;
  }

  // Wait for GSAP
  if (typeof gsap === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  /* ── Lenis Smooth Scroll ── */
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.5,
    });

    window.__lenis = lenis; // Expose for nav.js

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }

  /* ── Page Loader + Hero Timeline ── */
  function initHeroAnimation() {
    const loader = document.getElementById('pageLoader');
    const brandIcon = document.querySelector('.hero-content .brand-icon');
    const wordInners = document.querySelectorAll('.main-title .word-inner');
    const ampersand = document.querySelector('.main-title .ampersand');
    const subtitle = document.querySelector('.hero-subtitle');
    const scrollIndicator = document.querySelector('.scroll-indicator');

    const tl = gsap.timeline({
      defaults: { ease: 'expo.out' },
    });

    // Page loader fade out
    if (loader) {
      tl.to(loader, {
        opacity: 0,
        duration: 0.6,
        onComplete: () => {
          loader.style.display = 'none';
        },
      });
    }

    // Brand icon
    if (brandIcon) {
      tl.fromTo(brandIcon,
        { opacity: 0, scale: 0.5, y: 20 },
        { opacity: 0.9, scale: 1, y: 0, duration: 0.8 },
        loader ? '-=0.2' : '0'
      );
    }

    // "Ember" word
    if (wordInners[0]) {
      tl.fromTo(wordInners[0],
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9 },
        '-=0.4'
      );
    }

    // Ampersand
    if (ampersand) {
      tl.fromTo(ampersand,
        { opacity: 0, rotation: -10 },
        { opacity: 0.8, rotation: 0, duration: 0.5 },
        '-=0.5'
      );
    }

    // "Oak" word
    if (wordInners[1]) {
      tl.fromTo(wordInners[1],
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9 },
        '-=0.4'
      );
    }

    // Subtitle
    if (subtitle) {
      tl.fromTo(subtitle,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
        '-=0.3'
      );
    }

    // Scroll indicator pulse
    if (scrollIndicator) {
      tl.fromTo(scrollIndicator,
        { opacity: 0 },
        { opacity: 0.5, duration: 0.6 },
        '-=0.2'
      );

      gsap.to(scrollIndicator, {
        y: 10,
        opacity: 0.2,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 3,
      });
    }
  }

  /* ── Scroll Reveals ── */
  function initScrollReveals() {
    // Standard reveals (fade up)
    gsap.utils.toArray('.reveal').forEach((el, i) => {
      gsap.fromTo(el,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          delay: (el.closest('.menu-list') ? i * 0.1 : 0), // Stagger menu items
        }
      );
    });

    // Reveal from left
    gsap.utils.toArray('.reveal-left').forEach((el) => {
      gsap.fromTo(el,
        { opacity: 0, x: -40 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    // Reveal from right
    gsap.utils.toArray('.reveal-right').forEach((el) => {
      gsap.fromTo(el,
        { opacity: 0, x: 40 },
        {
          opacity: 1,
          x: 0,
          duration: 1.2,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    // Reveal with scale
    gsap.utils.toArray('.reveal-scale').forEach((el) => {
      gsap.fromTo(el,
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    });
  }

  /* ── Parallax Effects ── */
  function initParallax() {
    const isMobile = window.innerWidth < 768;
    if (isMobile) return; // Reduced parallax on mobile

    // Hero background parallax
    const heroBg = document.querySelector('.hero-bg-image');
    if (heroBg) {
      gsap.to(heroBg, {
        y: 200,
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }

    // Philosophy image parallax
    const philImage = document.querySelector('.philosophy-image');
    if (philImage) {
      gsap.to(philImage, {
        y: -60,
        scrollTrigger: {
          trigger: '#philosophy',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
      });
    }

    // Philosophy gold frame offset parallax
    const philWrap = document.querySelector('.philosophy-image-wrap');
    if (philWrap) {
      gsap.to(philWrap, {
        y: -30,
        scrollTrigger: {
          trigger: '#philosophy',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 2,
        },
      });
    }

    // Philosophy image clip-path wipe reveal
    if (philImage) {
      gsap.fromTo(philImage,
        { clipPath: 'inset(0 100% 0 0)' },
        {
          clipPath: 'inset(0 0% 0 0)',
          duration: 1.2,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: philImage,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    }

    // Gallery images - multi-speed parallax
    const galleryItems = document.querySelectorAll('.gallery-item');
    const speeds = [-40, -60, -30, -50, -45];
    galleryItems.forEach((item, i) => {
      gsap.to(item, {
        y: speeds[i % speeds.length],
        scrollTrigger: {
          trigger: item,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1 + (i * 0.3),
        },
      });
    });

    // Reservation background parallax
    const resBg = document.querySelector('.reservation-bg');
    if (resBg) {
      gsap.to(resBg, {
        y: 80,
        scrollTrigger: {
          trigger: '#reservation',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
      });
    }
  }

  /* ── Menu Item Stagger ── */
  function initMenuAnimations() {
    const menuItems = document.querySelectorAll('.menu-item');
    if (menuItems.length === 0) return;

    menuItems.forEach((item, index) => {
      gsap.fromTo(item,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'expo.out',
          delay: index * 0.15,
          scrollTrigger: {
            trigger: item,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    // SVG divider draw animation
    const dividerPaths = document.querySelectorAll('.menu-divider svg path, .menu-divider svg circle');
    dividerPaths.forEach((path) => {
      if (path.getTotalLength) {
        const length = path.getTotalLength();
        gsap.fromTo(path,
          { strokeDasharray: length, strokeDashoffset: length },
          {
            strokeDashoffset: 0,
            duration: 1.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: path.closest('.menu-divider'),
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    });
  }

  /* ── Gallery Stagger ── */
  function initGalleryAnimations() {
    const galleryItems = document.querySelectorAll('.gallery-item');

    galleryItems.forEach((item, index) => {
      // Different reveal for each
      const animations = [
        { clipPath: 'inset(0 100% 0 0)', toClip: 'inset(0 0% 0 0)' },  // wipe right
        { clipPath: 'inset(100% 0 0 0)', toClip: 'inset(0% 0 0 0)' },   // wipe up
        { clipPath: 'inset(0 0 0 100%)', toClip: 'inset(0 0 0 0%)' },    // wipe left
        { clipPath: 'inset(0 0 100% 0)', toClip: 'inset(0 0 0% 0)' },    // wipe down
        { clipPath: 'inset(50% 50% 50% 50%)', toClip: 'inset(0% 0% 0% 0%)' }, // center expand
      ];

      const anim = animations[index % animations.length];

      gsap.fromTo(item,
        { clipPath: anim.clipPath, opacity: 0 },
        {
          clipPath: anim.toClip,
          opacity: 1,
          duration: 1.2,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    });
  }

  /* ── Drop Cap Animation ── */
  function initDropCapAnimation() {
    const dropCap = document.querySelector('.drop-cap');
    if (!dropCap) return;

    gsap.fromTo(dropCap,
      { opacity: 0, scale: 1.5 },
      {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: dropCap,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  }

  /* ── Init All ── */
  document.addEventListener('DOMContentLoaded', () => {
    // Short delay to ensure all DOM is ready
    requestAnimationFrame(() => {
      initHeroAnimation();
      initScrollReveals();
      initParallax();
      initMenuAnimations();
      initGalleryAnimations();
      initDropCapAnimation();
    });
  });
})();
