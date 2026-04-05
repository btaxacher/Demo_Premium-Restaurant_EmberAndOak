/* ═══════════════════════════════════════════════════════════
   EMBER & OAK — Navigation
   Scroll-aware floating nav with section highlighting
   ═══════════════════���═══════════════════════════════════════ */

(function () {
  'use strict';

  const nav = document.getElementById('siteNav');
  const scrollProgress = document.getElementById('scrollProgress');
  if (!nav) return;

  let lastScrollY = 0;
  let ticking = false;

  /* ── Scroll-aware hide/show + background ── */
  function updateNav() {
    const scrollY = window.scrollY;
    const heroHeight = window.innerHeight * 0.5;

    // Background: transparent on hero, solid after
    if (scrollY > heroHeight) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    // Hide on scroll down, show on scroll up (only after hero)
    if (scrollY > heroHeight) {
      if (scrollY > lastScrollY && scrollY - lastScrollY > 5) {
        nav.classList.add('hidden');
      } else if (lastScrollY - scrollY > 5) {
        nav.classList.remove('hidden');
      }
    } else {
      nav.classList.remove('hidden');
    }

    lastScrollY = scrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNav);
      ticking = true;
    }
  }, { passive: true });

  /* ── Scroll Progress Bar ── */
  function updateScrollProgress() {
    if (!scrollProgress) return;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
    scrollProgress.style.transform = `scaleX(${progress})`;
  }

  window.addEventListener('scroll', updateScrollProgress, { passive: true });

  /* ── Active Section Highlighting ── */
  function updateActiveSection() {
    const sections = ['philosophy', 'menu', 'gallery', 'reservation'];
    const navLinks = nav.querySelectorAll('.nav-links a');
    const scrollPosition = window.scrollY + window.innerHeight / 3;

    let activeSection = '';

    for (const sectionId of sections) {
      const section = document.getElementById(sectionId);
      if (section) {
        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;
        if (scrollPosition >= top && scrollPosition < bottom) {
          activeSection = sectionId;
          break;
        }
      }
    }

    navLinks.forEach((link) => {
      const section = link.dataset.section;
      if (section === activeSection) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveSection, { passive: true });

  /* ── Smooth Scroll for Nav Links ── */
  nav.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        const offset = targetId === 'hero' ? 0 : 80; // Account for nav height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;

        // Use Lenis if available, otherwise native
        if (window.__lenis) {
          window.__lenis.scrollTo(top, { duration: 1.2 });
        } else {
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    });
  });

  // Run on load
  updateNav();
  updateScrollProgress();
  updateActiveSection();
})();
