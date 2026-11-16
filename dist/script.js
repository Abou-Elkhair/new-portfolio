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
  const viewport = carousel.querySelector('.carousel-viewport');
  const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
  if (!track || !viewport || slides.length < 2) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let gap = 0;
  let loopWidth = 0;
  let slideStep = 0;
  let offset = 0;
  let targetOffset = null;

  slides.forEach((slide) => {
    const copy = slide.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    copy.querySelectorAll('img').forEach((image) => image.setAttribute('alt', ''));
    copy.querySelectorAll('a, button, input, select, textarea, [tabindex]').forEach((element) => element.setAttribute('tabindex', '-1'));
    track.appendChild(copy);
  });

  const wrapOffset = (value) => {
    if (!loopWidth) return value;
    const normalized = value % loopWidth;
    return normalized > 0 ? normalized - loopWidth : normalized;
  };
  const applyOffset = () => {
    track.style.transform = `translate3d(${wrapOffset(offset)}px, 0, 0)`;
  };
  const measure = () => {
    gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 0;
    loopWidth = slides.reduce((width, slide) => width + slide.getBoundingClientRect().width + gap, 0);
    slideStep = slides[0].getBoundingClientRect().width + gap;
    applyOffset();
  };
  measure();
  if (!loopWidth) return;
  const speed = Math.max(0.026, slideStep * 0.00009);
  const moveBy = (direction) => {
    const nextOffset = (targetOffset ?? offset) + direction * slideStep;
    if (reducedMotion) {
      offset = nextOffset;
      applyOffset();
      return;
    }
    targetOffset = nextOffset;
  };

  const controls = document.createElement('div');
  controls.className = 'carousel-controls';
  controls.setAttribute('aria-label', 'Carousel controls');
  const previous = document.createElement('button');
  previous.type = 'button';
  previous.className = 'carousel-control carousel-control-previous';
  previous.setAttribute('aria-label', 'Previous screens');
  previous.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" focusable="false"><path d="M14.5 5.5 8 12l6.5 6.5" /></svg>';
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'carousel-control carousel-control-next';
  next.setAttribute('aria-label', 'Next screens');
  next.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" focusable="false"><path d="m9.5 5.5 6.5 6.5-6.5 6.5" /></svg>';
  previous.addEventListener('click', () => moveBy(1));
  next.addEventListener('click', () => moveBy(-1));
  controls.append(previous, next);
  carousel.appendChild(controls);

  let lastFrame = 0;
  let hovered = false;
  let focused = false;
  let keyboardMode = false;
  let isDragging = false;
  let isVisible = false;
  let visibleSince = 0;
  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let startOffset = 0;
  let dragVelocity = 0;
  let lastPointerX = 0;
  let lastPointerTime = 0;
  let suppressClick = false;
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
    if (targetOffset !== null) {
      const distance = targetOffset - offset;
      const easing = Math.min(0.16, Math.max(0.08, elapsed * 0.009));
      if (Math.abs(distance) < 0.35) {
        offset = targetOffset;
        targetOffset = null;
      } else {
        offset += distance * easing;
      }
      applyOffset();
    } else if (!reducedMotion && isVisible && introHoldComplete && !hovered && !focused && !isDragging && loopWidth > 0) {
      offset -= elapsed * speed;
      applyOffset();
    }
    window.requestAnimationFrame(animate);
  };
  carousel.querySelectorAll('.carousel-slide, .carousel-control').forEach((hoverTarget) => {
    hoverTarget.addEventListener('mouseenter', () => { hovered = true; });
    hoverTarget.addEventListener('mouseleave', () => { hovered = false; });
  });
  window.addEventListener('keydown', () => { keyboardMode = true; });
  carousel.addEventListener('pointerdown', () => {
    keyboardMode = false;
    focused = false;
  }, true);
  carousel.addEventListener('focusin', () => { focused = keyboardMode; });
  carousel.addEventListener('focusout', (event) => {
    if (!carousel.contains(event.relatedTarget)) focused = false;
  });
  carousel.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    moveBy(event.key === 'ArrowRight' ? -1 : 1);
  });
  viewport.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || event.target.closest('.carousel-controls')) return;
    pointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    startOffset = offset;
    targetOffset = null;
    dragVelocity = 0;
    lastPointerX = event.clientX;
    lastPointerTime = performance.now();
  });
  viewport.addEventListener('pointermove', (event) => {
    if (event.pointerId !== pointerId) return;
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    if (!isDragging) {
      if (Math.abs(deltaX) < 7 && Math.abs(deltaY) < 7) return;
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        pointerId = null;
        return;
      }
      isDragging = true;
      carousel.classList.add('is-dragging');
      if (viewport.setPointerCapture) viewport.setPointerCapture(event.pointerId);
    }
    event.preventDefault();
    const moveTime = performance.now();
    const moveElapsed = Math.max(moveTime - lastPointerTime, 8);
    dragVelocity = (event.clientX - lastPointerX) / moveElapsed;
    lastPointerX = event.clientX;
    lastPointerTime = moveTime;
    offset = startOffset + deltaX;
    applyOffset();
  });
  const endDrag = (event) => {
    if (event.pointerId !== pointerId && !isDragging) return;
    if (viewport.hasPointerCapture && viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
    if (isDragging) {
      suppressClick = true;
      window.setTimeout(() => { suppressClick = false; }, 0);
      if (!reducedMotion && Math.abs(dragVelocity) > 0.04) {
        const momentum = Math.max(-slideStep * 0.65, Math.min(slideStep * 0.65, dragVelocity * 180));
        targetOffset = offset + momentum;
      }
    }
    isDragging = false;
    pointerId = null;
    carousel.classList.remove('is-dragging');
  };
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);
  carousel.addEventListener('click', (event) => {
    if (!suppressClick) return;
    event.preventDefault();
    event.stopPropagation();
  }, true);
  window.addEventListener('resize', measure, { passive: true });
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
