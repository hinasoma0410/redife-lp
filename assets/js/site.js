(() => {
  'use strict';

  const menuButton = document.querySelector('[data-menu-button]');
  const nav = document.querySelector('[data-nav]');

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menuButton.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      });
    });
  }

  const scrollProgress = document.createElement('div');
  scrollProgress.className = 'scroll-progress';
  scrollProgress.setAttribute('aria-hidden', 'true');
  document.body.append(scrollProgress);

  let progressFrame = 0;
  const updateScrollProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
    scrollProgress.style.transform = `scaleX(${progress})`;
    progressFrame = 0;
  };
  const requestProgressUpdate = () => {
    if (!progressFrame) progressFrame = window.requestAnimationFrame(updateScrollProgress);
  };
  updateScrollProgress();
  window.addEventListener('scroll', requestProgressUpdate, { passive: true });
  window.addEventListener('resize', requestProgressUpdate, { passive: true });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const gsapAvailable = typeof window.gsap !== 'undefined';

  if (gsapAvailable && !reducedMotion.matches) {
    const { gsap } = window;

    const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
    const heroCopy = document.querySelector('.hero-copy');

    if (heroCopy) {
      heroTimeline
        .fromTo(heroCopy.querySelector('.eyebrow'), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.55 })
        .fromTo(heroCopy.querySelector('h1'), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.8 }, '-=0.28')
        .fromTo(heroCopy.querySelector('.hero-lead'), { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.65 }, '-=0.48')
        .fromTo(heroCopy.querySelector('.hero-actions'), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.55 }, '-=0.4')
        .fromTo(heroCopy.querySelectorAll('.trust-list li'), { autoAlpha: 0, x: -10 }, { autoAlpha: 1, x: 0, duration: 0.4, stagger: 0.08 }, '-=0.3');
    }

    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual) {
      heroTimeline.fromTo(
        heroVisual.querySelectorAll('.visual-card'),
        { autoAlpha: 0, y: 30, scale: 0.96 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.14 },
        0.24
      );
    }

    const revealGroups = [
      '.page-hero .container',
      '.section-heading',
      '.problem-grid',
      '.service-grid',
      '.works-block',
      '.reason-list',
      '.flow-list',
      '.service-index-grid',
      '.detail-grid',
      '.contact-layout',
      '.line-contact-grid',
      '.privacy-content',
      '.cta-inner'
    ];

    const itemSelectors = [
      '.problem-card',
      '.service-card',
      '.work-card',
      '.demo-card',
      '.reason-list article',
      '.flow-list li',
      '.service-index-card',
      '.content-block',
      '.contact-note',
      '.contact-form',
      '.line-card',
      '.email-card',
      '.consultation-info'
    ].join(',');

    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const target = entry.target;
        const items = target.matches(itemSelectors)
          ? [target]
          : Array.from(target.querySelectorAll(itemSelectors)).filter((item) => !item.dataset.motionRevealed);

        if (items.length) {
          items.forEach((item) => { item.dataset.motionRevealed = 'true'; });
          gsap.fromTo(items, { autoAlpha: 0, y: 28 }, {
            autoAlpha: 1,
            y: 0,
            duration: 0.72,
            stagger: 0.1,
            ease: 'power3.out',
            clearProps: 'opacity,visibility,transform'
          });
        } else {
          gsap.fromTo(target, { autoAlpha: 0, y: 24 }, {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out',
            clearProps: 'opacity,visibility,transform'
          });
        }

        instance.unobserve(target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealGroups.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        if (!element.closest('.hero')) observer.observe(element);
      });
    });

    const marquee = document.querySelector('[data-industry-marquee]');
    if (marquee) {
      const track = marquee.querySelector('.industry-track');
      if (track) {
        const marqueeTween = gsap.to(track, {
          xPercent: -50,
          duration: 32,
          ease: 'none',
          repeat: -1
        });
        const pauseMarquee = () => marqueeTween.pause();
        const resumeMarquee = () => marqueeTween.resume();
        marquee.addEventListener('pointerenter', pauseMarquee);
        marquee.addEventListener('pointerleave', resumeMarquee);
        marquee.addEventListener('focusin', pauseMarquee);
        marquee.addEventListener('focusout', resumeMarquee);
      }
    }

    const imageTargets = document.querySelectorAll('.work-thumb img, .demo-thumb img, .case-work-visual img');
    if (imageTargets.length) {
      const imageObserver = new IntersectionObserver((entries, instance) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          gsap.fromTo(entry.target, {
            clipPath: 'inset(0 0 100% 0)',
            scale: 1.05
          }, {
            clipPath: 'inset(0 0 0% 0)',
            scale: 1,
            duration: 0.9,
            ease: 'power3.out',
            clearProps: 'clipPath,transform'
          });
          instance.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
      imageTargets.forEach((image) => imageObserver.observe(image));
    }

    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const tiltTargets = document.querySelectorAll('.service-card, .work-card, .demo-card, .service-jump-card, .case-work-card');
      tiltTargets.forEach((card) => {
        card.addEventListener('pointermove', (event) => {
          const rect = card.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;
          gsap.to(card, {
            rotationY: x * 4,
            rotationX: y * -4,
            y: -4,
            transformPerspective: 900,
            duration: 0.35,
            ease: 'power2.out',
            overwrite: true
          });
        });
        card.addEventListener('pointerleave', () => {
          gsap.to(card, {
            rotationY: 0,
            rotationX: 0,
            y: 0,
            duration: 0.45,
            ease: 'power2.out',
            overwrite: true,
            clearProps: 'transform'
          });
        });
      });
    }
  }

  const sceneTarget = document.querySelector('[data-three-scene]');
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const slowConnection = connection && (connection.saveData || /(^|-)2g$/.test(connection.effectiveType || ''));
  const sceneAllowed = sceneTarget
    && !reducedMotion.matches
    && !slowConnection
    && window.matchMedia('(min-width: 769px)').matches
    && 'WebGLRenderingContext' in window;

  if (sceneAllowed) {
    const startScene = () => {
      import('./hero-scene.js').then(({ createHeroScene }) => {
        createHeroScene(sceneTarget);
      }).catch(() => {
        sceneTarget.classList.add('three-unavailable');
      });
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(startScene, { timeout: 1800 });
    } else {
      window.setTimeout(startScene, 700);
    }
  }
})();
