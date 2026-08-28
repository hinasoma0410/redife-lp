(() => {
  "use strict";

  const header = document.querySelector(".site-header");
  const updateHeader = () => header?.classList.toggle("is-compact", window.scrollY > 24);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !window.gsap) {
    document.documentElement.classList.add("motion-ready");
    return;
  }

  const items = window.gsap.utils.toArray(".reveal");
  items.forEach((item) => {
    item.style.opacity = "0";
    item.style.transform = "translateY(28px)";
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      window.gsap.to(entry.target, {
        opacity: 1,
        y: 0,
        duration: 0.75,
        ease: "power2.out",
        clearProps: "transform",
      });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.13, rootMargin: "0px 0px -5%" });

  items.forEach((item) => observer.observe(item));
  window.gsap.fromTo(".map-pin", { y: -8 }, { y: 8, duration: 1.6, repeat: -1, yoyo: true, ease: "sine.inOut" });
  document.documentElement.classList.add("motion-ready");
})();
