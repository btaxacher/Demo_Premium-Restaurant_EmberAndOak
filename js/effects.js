/* ═══════════════════════════════════════════════════════════
   EMBER & OAK — Visual Effects
   Particles, Custom Cursor, Film Grain, Lightbox
   ═══��═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const isMobile = window.innerWidth < 768;

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
    initLightbox();
  });
})();
