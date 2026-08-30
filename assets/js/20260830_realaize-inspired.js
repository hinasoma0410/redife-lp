(() => {
  'use strict';

  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('[data-menu-button]');
  const nav = document.querySelector('[data-nav]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  menuButton?.addEventListener('click', () => {
    const willOpen = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(willOpen));
    nav?.classList.toggle('is-open', willOpen);
  });

  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
  }));

  if (!reducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.button, .header-cta, .circle-link, .service-hero-actions > a:last-child, .diagnosis-actions > a:last-child, .profile-copy > a').forEach((button) => {
      button.addEventListener('pointermove', (event) => {
        const rect = button.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        button.style.setProperty('--tilt-x', `${(0.5 - y) * 9}deg`);
        button.style.setProperty('--tilt-y', `${(x - 0.5) * 11}deg`);
        button.style.setProperty('--glow-x', `${x * 100}%`);
        button.style.setProperty('--glow-y', `${y * 100}%`);
      });

      button.addEventListener('pointerleave', () => {
        button.style.setProperty('--tilt-x', '0deg');
        button.style.setProperty('--tilt-y', '0deg');
        button.style.setProperty('--glow-x', '50%');
        button.style.setProperty('--glow-y', '50%');
      });
    });
  }

  if (!reducedMotion && window.gsap) {
    const { gsap } = window;
    if (document.querySelector('.hero')) {
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
      intro
        .from('.hero .eyebrow', { opacity: 0, y: 18, duration: .55 })
        .from('.hero h1 span', { opacity: 0, y: 70, rotate: 2, duration: .85, stagger: .12 }, '-=.2')
        .from('.hero-lead', { opacity: 0, y: 28, duration: .65 }, '-=.45')
        .from('.hero-actions, .trust-list', { opacity: 0, y: 22, duration: .55, stagger: .1 }, '-=.35')
        .from('.hero-orbit', { opacity: 0, scale: .82, rotate: -8, duration: 1.1 }, '-=.9');
    } else if (document.querySelector('.service-hero')) {
      document.querySelector('.service-hero-visual')?.classList.add('is-revealed');
      const serviceIntro = gsap.timeline({ defaults: { ease: 'power3.out' } });
      serviceIntro
        .from('.service-back, .service-code', { opacity: 0, y: 18, duration: .55, stagger: .1 })
        .from('.service-hero h1', { opacity: 0, y: 60, duration: .85 }, '-=.25')
        .from('.service-hero-lead, .service-hero-actions', { opacity: 0, y: 24, duration: .6, stagger: .12 }, '-=.42')
        .from('.service-hero-visual', { opacity: 0, scale: .84, rotate: -6, duration: 1.05 }, '-=.85');
    }

    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        gsap.to(entry.target, {
          opacity: 1,
          y: 0,
          duration: .82,
          ease: 'power3.out',
          clearProps: 'transform',
          onComplete: () => entry.target.classList.add('is-revealed')
        });
        instance.unobserve(entry.target);
      });
    }, { threshold: .08, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal:not(.service-hero-visual)').forEach((item) => observer.observe(item));
  } else {
    document.querySelectorAll('.reveal').forEach((item) => {
      item.classList.add('is-revealed');
      item.style.opacity = '1';
      item.style.transform = 'none';
    });
  }

  const canvas = document.querySelector('[data-hero-canvas]');
  if (!canvas || reducedMotion) return;

  const context = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let frame = 0;
  const points = Array.from({ length: 26 }, (_, index) => ({
    x: (index * 97) % 1000,
    y: (index * 61) % 700,
    vx: .08 + (index % 3) * .025,
    vy: (index % 2 ? 1 : -1) * .035
  }));

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const draw = () => {
    context.clearRect(0, 0, width, height);
    points.forEach((point) => {
      point.x = (point.x + point.vx + width) % width;
      point.y = (point.y + point.vy + height) % height;
    });
    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        const distance = Math.hypot(dx, dy);
        if (distance > 170) continue;
        context.strokeStyle = `rgba(46,122,82,${(1 - distance / 170) * .16})`;
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(points[i].x, points[i].y);
        context.lineTo(points[j].x, points[j].y);
        context.stroke();
      }
    }
    points.forEach((point, index) => {
      context.fillStyle = index % 5 === 0 ? 'rgba(199,238,90,.65)' : 'rgba(46,122,82,.32)';
      context.beginPath();
      context.arc(point.x, point.y, index % 5 === 0 ? 3 : 1.8, 0, Math.PI * 2);
      context.fill();
    });
    frame = window.requestAnimationFrame(draw);
  };

  resize();
  draw();
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      window.cancelAnimationFrame(frame);
    } else {
      draw();
    }
  });
})();
