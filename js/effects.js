/* ═══════════════════════════════════════════════════════════
   EMBER & OAK — Visual Effects
   Particles, Custom Cursor, Film Grain, Lightbox
   ═══��═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768;

  /* ── Ember Particles ── */
  function initEmberParticles() {
    if (prefersReducedMotion || isMobile) return;

    const canvas = document.getElementById('ember-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const particles = [];
    const PARTICLE_COUNT = 40;

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    class Ember {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 100;
        this.size = Math.random() * 2.5 + 0.5;
        this.speedY = -(Math.random() * 0.8 + 0.3);
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random() * 0.6 + 0.2;
        this.decay = Math.random() * 0.003 + 0.001;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.02 + 0.01;

        // Color: gold to orange
        const hue = Math.random() * 30 + 20; // 20-50
        const sat = Math.random() * 30 + 70;
        this.color = `hsla(${hue}, ${sat}%, 60%, `;
      }

      update() {
        this.wobble += this.wobbleSpeed;
        this.x += this.speedX + Math.sin(this.wobble) * 0.3;
        this.y += this.speedY;
        this.opacity -= this.decay;

        if (this.opacity <= 0 || this.y < -20) {
          this.reset();
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color + this.opacity + ')';
        ctx.shadowBlur = this.size * 4;
        ctx.shadowColor = this.color + (this.opacity * 0.5) + ')';
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = new Ember();
      p.y = Math.random() * canvas.height; // Start distributed
      particles.push(p);
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.update();
        p.draw();
      }
      requestAnimationFrame(animate);
    }

    animate();
  }

  /* ── Custom Cursor ─�� */
  function initCustomCursor() {
    if (isMobile || prefersReducedMotion) return;

    const cursor = document.getElementById('cursorRing');
    if (!cursor) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Expand cursor on interactive elements
    const interactives = 'a, button, .menu-item, .gallery-item, .nav-reserve-btn, .btn-reserve';

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactives)) {
        cursor.classList.add('expanded');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactives)) {
        cursor.classList.remove('expanded');
      }
    });

    function updateCursor() {
      // Smooth follow with lerp
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      cursor.style.left = cursorX + 'px';
      cursor.style.top = cursorY + 'px';
      requestAnimationFrame(updateCursor);
    }

    updateCursor();
  }

  /* ── Lightbox ── */
  function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const lightboxCounter = document.getElementById('lightboxCounter');

    if (!lightbox) return;

    const galleryItems = document.querySelectorAll('[data-lightbox]');
    const images = [];

    galleryItems.forEach((item) => {
      const img = item.querySelector('img');
      if (img) {
        images.push({
          src: img.src,
          alt: img.alt,
        });
      }
    });

    let currentIndex = 0;

    function openLightbox(index) {
      currentIndex = index;
      updateLightboxImage();
      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    function updateLightboxImage() {
      if (images[currentIndex]) {
        lightboxImg.src = images[currentIndex].src;
        lightboxImg.alt = images[currentIndex].alt;
        lightboxCounter.textContent = `${currentIndex + 1} / ${images.length}`;
      }
    }

    function prevImage() {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      updateLightboxImage();
    }

    function nextImage() {
      currentIndex = (currentIndex + 1) % images.length;
      updateLightboxImage();
    }

    // Event listeners
    galleryItems.forEach((item) => {
      item.addEventListener('click', () => {
        const index = parseInt(item.dataset.lightbox, 10);
        openLightbox(index);
      });
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', prevImage);
    lightboxNext.addEventListener('click', nextImage);

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    });
  }

  /* ── Image Fallback Check ── */
  function initImageFallbacks() {
    // Check if local hero-bg exists, otherwise use fallback class
    const heroBg = document.querySelector('.hero-bg-image');
    const reservationBg = document.querySelector('.reservation-bg');

    if (heroBg) {
      const testImg = new Image();
      testImg.onload = () => heroBg.classList.remove('fallback');
      testImg.onerror = () => heroBg.classList.add('fallback');
      testImg.src = 'assets/images/hero-bg.png';
    }

    if (reservationBg) {
      const testImg = new Image();
      testImg.onload = () => reservationBg.classList.remove('fallback');
      testImg.onerror = () => reservationBg.classList.add('fallback');
      testImg.src = 'assets/images/reservation-bg.png';
    }
  }

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', () => {
    initImageFallbacks();
    initEmberParticles();
    initCustomCursor();
    initLightbox();
  });
})();
