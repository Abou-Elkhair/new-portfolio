document.documentElement.classList.add('js');

const selectedCase = new URLSearchParams(window.location.search).get('case');
if (selectedCase === 'e-invest') {
  document.body.classList.add('case-mode', 'case-einvest-mode');
  document.title = 'E‑Invest — Abouelkhair Rady';
}
if (selectedCase === '7salty') {
  document.body.classList.add('case-mode', 'case-7salty-mode');
  document.title = '7salty — Abouelkhair Rady';
}
if (selectedCase === 'zabatha') {
  document.body.classList.add('case-mode', 'case-zabatha-mode');
  document.title = 'Zabatha — Abouelkhair Rady';
}
if (selectedCase === 'monsooq') {
  document.body.classList.add('case-mode', 'case-monsooq-mode');
  document.title = 'Monsooq — Abouelkhair Rady';
}
if (selectedCase === 'go-bus') {
  document.body.classList.add('case-mode', 'case-gobus-mode');
  document.title = 'Go Bus — Abouelkhair Rady';
}
if (selectedCase === 'sas-vaya') {
  document.body.classList.add('case-mode', 'case-sas-vaya-mode');
  document.title = 'SAS Vaya — Abouelkhair Rady';
}
if (selectedCase) {
  document.querySelectorAll('.site-header nav a').forEach((link) => {
    const section = link.getAttribute('href');
    if (section && section.startsWith('#')) link.setAttribute('href', `index.html${section}`);
  });
}
if (selectedCase) {
  const caseSelector = {
    'e-invest': '#einvest',
    '7salty': '#seven-salty',
    zabatha: '#zabatha',
    monsooq: '#monsooq',
    'go-bus': '#go-bus',
    'sas-vaya': '#sas-vaya'
  }[selectedCase];
  const activeCase = caseSelector && document.querySelector(caseSelector);
  if (activeCase) {
    document.querySelectorAll('.case').forEach((caseArticle) => {
      caseArticle.style.display = caseArticle === activeCase ? 'block' : 'none';
    });
  }
}

document.querySelectorAll('[data-carousel]').forEach((carousel) => {
  const track = carousel.querySelector('.carousel-track');
  const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
  if (!track || slides.length < 2) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 0;
  const loopWidth = slides.reduce((width, slide) => width + slide.getBoundingClientRect().width + gap, 0);
  if (!loopWidth) return;
  const speed = Math.max(0.026, (slides[0].getBoundingClientRect().width + gap) * 0.00009);
  if (!reducedMotion) {
    slides.forEach((slide) => {
      const copy = slide.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      copy.querySelectorAll('img').forEach((image) => image.setAttribute('alt', ''));
      track.appendChild(copy);
    });
  }

  let offset = 0;
  let lastFrame = 0;
  let hovered = false;
  let focused = false;
  let isVisible = false;
  let visibleSince = 0;
  const carouselVisibility = new IntersectionObserver((entries) => {
    isVisible = entries[0].isIntersecting;
    if (isVisible && !visibleSince) visibleSince = performance.now();
  });
  carouselVisibility.observe(carousel);
  const animate = (time) => {
    if (!lastFrame) lastFrame = time;
    const elapsed = Math.min(time - lastFrame, 48);
    lastFrame = time;
    const introHoldComplete = visibleSince && time - visibleSince > 1600;
    if (!reducedMotion && isVisible && introHoldComplete && !hovered && !focused && loopWidth > 0) {
      offset -= elapsed * speed;
      if (offset <= -loopWidth) offset += loopWidth;
      track.style.transform = `translate3d(${offset}px, 0, 0)`;
    }
    window.requestAnimationFrame(animate);
  };
  carousel.addEventListener('mouseenter', () => { hovered = true; });
  carousel.addEventListener('mouseleave', () => { hovered = false; });
  carousel.addEventListener('focusin', () => { focused = true; });
  carousel.addEventListener('focusout', (event) => {
    if (!carousel.contains(event.relatedTarget)) focused = false;
  });
  carousel.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const step = slides[0].getBoundingClientRect().width + gap;
    offset += event.key === 'ArrowRight' ? -step : step;
    if (offset <= -loopWidth) offset += loopWidth;
    if (offset > 0) offset -= loopWidth;
    track.style.transform = `translate3d(${offset}px, 0, 0)`;
  });
  window.requestAnimationFrame(animate);
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

const revealTargets = document.querySelectorAll('.portfolio-hero > *, .case-index > *, .experience > *, .case-section > *, .next-case > *');
revealTargets.forEach((target) => target.classList.add('reveal'));
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.08 });
revealTargets.forEach((target) => revealObserver.observe(target));
