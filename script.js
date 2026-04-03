// ── SCROLL PROGRESS + BACK TOP ──
const progressBar = document.getElementById('scroll-progress');
const backTop = document.getElementById('back-top');
const nav = document.getElementById('navbar');
let expandedPkg = null, savedScroll = 0, savedRect = null, lastScrollY = window.scrollY;

backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

window.addEventListener('scroll', () => {
  const s = window.scrollY;
  const total = document.body.scrollHeight - window.innerHeight;
  progressBar.style.width = (s / total * 100) + '%';
  backTop.classList.toggle('show', s > 400);
  nav.classList.toggle('scrolled', s > 60);
  lastScrollY = s;
});

// ── HAMBURGER ──
const hamburger = document.getElementById('hamburger');
hamburger.addEventListener('click', () => {
  let panel = document.querySelector('.nav-mobile-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.className = 'nav-mobile-panel';
    const links = [
      ['#services','Services'],['#packages','Packages'],['#fleet','Fleet'],
      ['#pilgrimage','State Trips'],['#contact','Contact']
    ];
    links.forEach(([href, label]) => {
      const a = document.createElement('a');
      a.href = href; a.textContent = label;
      a.addEventListener('click', () => panel.classList.remove('open'));
      panel.appendChild(a);
    });
    document.body.appendChild(panel);
  }
  panel.classList.toggle('open');
});

// ── SCROLL REVEAL ──
const revealEls = document.querySelectorAll('.reveal, .why-item');
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
revealEls.forEach(el => revObs.observe(el));

// ── ANIMATED STAT COUNTERS ──
let counted = false;
const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !counted) {
      counted = true;
      [{ idx: 0, target: 8000, fmt: v => Math.round(v / 1000) + 'K+' },
       { idx: 1, target: 30, fmt: v => Math.round(v) + '+' }
      ].forEach(({ idx, target, fmt }) => {
        const el = document.querySelectorAll('.stat strong')[idx];
        if (!el) return;
        let v = 0; const step = target / 40;
        const iv = setInterval(() => {
          v = Math.min(v + step, target);
          el.textContent = fmt(v);
          if (v >= target) clearInterval(iv);
        }, 30);
      });
    }
  }, { threshold: 0.5 }).observe(heroStats);
}

// ── 3D TILT ON SERVICE CARDS ──
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 10;
    const y = ((e.clientY - r.top) / r.height - 0.5) * -10;
    card.style.transform = `translateY(-8px) rotateX(${y}deg) rotateY(${x}deg)`;
    card.style.transformStyle = 'preserve-3d';
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; card.style.transformStyle = ''; });
});

// ── PACKAGE EXPAND / COLLAPSE ──
function expandPkg(e, id) {
  if (e && e.stopPropagation) e.stopPropagation();
  if (expandedPkg) return;
  const card = document.getElementById(id);
  savedScroll = window.scrollY;
  savedRect = card.getBoundingClientRect(); // viewport-relative

  card.classList.add('visible');

  // Snapshot current viewport position (no scroll offset needed — we use fixed positioning)
  card.style.cssText = `
    position: fixed;
    top: ${savedRect.top}px;
    left: ${savedRect.left}px;
    width: ${savedRect.width}px;
    height: ${savedRect.height}px;
    border-radius: 28px;
    z-index: 2000;
    transition: none;
  `;
  card.offsetHeight; // force reflow

  card.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100dvh;
    border-radius: 0;
    z-index: 2000;
    transition: all 0.45s cubic-bezier(0.4,0,0.2,1);
  `;
  card.classList.add('expanded');
  document.getElementById('pkgOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
  expandedPkg = id;
}

function closePkg(e, id) {
  if (e && e.stopPropagation) e.stopPropagation();
  const card = document.getElementById(id);
  card.classList.remove('expanded');

  // Animate back to original viewport position
  card.style.cssText = `
    position: fixed;
    top: ${savedRect.top}px;
    left: ${savedRect.left}px;
    width: ${savedRect.width}px;
    height: ${savedRect.height}px;
    border-radius: 28px;
    z-index: 2000;
    transition: all 0.45s cubic-bezier(0.4,0,0.2,1);
  `;
  setTimeout(() => {
    card.style.cssText = '';
    document.getElementById('pkgOverlay').classList.remove('active');
    document.body.style.overflow = '';
    expandedPkg = null;
    window.scrollTo(0, savedScroll);
  }, 460);
}

document.getElementById('pkgOverlay').addEventListener('click', () => {
  if (expandedPkg) closePkg({}, expandedPkg);
});

// ── QUICK TRIP PLANNER → WHATSAPP ──
function searchTrip() {
  const tripType = document.getElementById('bf-triptype').value;
  const from = document.getElementById('bf-from').value.trim();
  const to = document.getElementById('bf-to').value.trim();
  const date = document.getElementById('bf-date').value;
  const vehicle = document.getElementById('bf-vehicle').value;

  let msg = `Hi Sri Varu Travels! I'd like to book a trip.\n\n`;
  msg += `📌 Trip Type: ${tripType}\n`;
  if (from) msg += `🚩 From: ${from}\n`;
  if (to)   msg += `🏁 To: ${to}\n`;
  if (date) msg += `📅 Date: ${date}\n`;
  msg += `🚗 Vehicle: ${vehicle}\n\nPlease share the fare and availability.`;

  const encoded = encodeURIComponent(msg);
  window.open(`https://wa.me/917299921960?text=${encoded}`, '_blank');
}

// ── FLEET CATEGORY SLIDESHOWS ──
document.querySelectorAll('.fcc-slideshow').forEach(ss => {
  const slides = ss.querySelectorAll('.fcc-slide');
  const dotsWrap = ss.querySelector('.fcc-dots');
  let current = 0;
  let timer = null;

  // Build dots
  slides.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'fcc-dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', e => { e.stopPropagation(); goTo(i); });
    dotsWrap.appendChild(d);
  });

  function goTo(idx) {
    slides[current].classList.remove('active');
    dotsWrap.querySelectorAll('.fcc-dot')[current].classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    dotsWrap.querySelectorAll('.fcc-dot')[current].classList.add('active');
  }

  function startAuto() {
    stopAuto();
    timer = setInterval(() => goTo(current + 1), 3200);
  }
  function stopAuto() {
    if (timer) clearInterval(timer);
  }

  ss.querySelector('.fcc-prev').addEventListener('click', e => { e.stopPropagation(); goTo(current - 1); startAuto(); });
  ss.querySelector('.fcc-next').addEventListener('click', e => { e.stopPropagation(); goTo(current + 1); startAuto(); });

  ss.addEventListener('mouseenter', stopAuto);
  ss.addEventListener('mouseleave', startAuto);

  startAuto();
});

// ── TESTIMONIAL SLIDER ──
(function () {
  const viewport = document.querySelector('.testi-viewport');
  const track    = document.getElementById('testiTrack');
  const dotsWrap = document.getElementById('testiDots');
  if (!track || !viewport) return;

  const cards = Array.from(track.querySelectorAll('.testi-card'));
  const TOTAL  = cards.length;
  const GAP    = 24; // must match CSS gap
  let current  = 0;
  let autoTimer = null;

  // How many cards fit in view at current breakpoint
  function perView() {
    const w = window.innerWidth;
    if (w > 1024) return 3;
    if (w > 600)  return 2;
    return 1;
  }

  // Compute card width so cards fill the viewport exactly (accounting for gaps)
  function cardWidth() {
    const pv   = perView();
    const vw   = viewport.offsetWidth;
    return (vw - GAP * (pv - 1)) / pv;
  }

  function maxIndex() {
    return Math.max(0, TOTAL - perView());
  }

  // Size every card and move track
  function render() {
    const cw = cardWidth();
    // Set CSS variable so the flex-basis in CSS picks it up
    cards.forEach(c => { c.style.flex = `0 0 ${cw}px`; });
    track.style.transform = `translateX(-${current * (cw + GAP)}px)`;
    updateDots();
  }

  // Build dots dynamically (one per "page")
  function buildDots() {
    dotsWrap.innerHTML = '';
    const pages = maxIndex() + 1;
    for (let i = 0; i < pages; i++) {
      const d = document.createElement('button');
      d.className = 'testi-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', `Go to slide ${i + 1}`);
      d.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(d);
    }
  }

  function updateDots() {
    const dots = dotsWrap.querySelectorAll('.testi-dot');
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function goTo(idx) {
    current = Math.max(0, Math.min(idx, maxIndex()));
    render();
  }

  function next() { goTo(current >= maxIndex() ? 0 : current + 1); }
  function prev() { goTo(current <= 0 ? maxIndex() : current - 1); }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(next, 4500);
  }
  function stopAuto() { clearInterval(autoTimer); }

  document.getElementById('testiNext').addEventListener('click', () => { next(); startAuto(); });
  document.getElementById('testiPrev').addEventListener('click', () => { prev(); startAuto(); });

  // Pause on hover
  viewport.addEventListener('mouseenter', stopAuto);
  viewport.addEventListener('mouseleave', startAuto);

  // Rebuild on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { buildDots(); render(); }, 120);
  });

  // Init — wait one frame so layout is settled
  requestAnimationFrame(() => {
    buildDots();
    render();
    startAuto();
  });
})();

// ── PILGRIM / STATE CARD CURSOR PARALLAX ──
document.querySelectorAll('.pilgrim-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    const bg = card.querySelector('.pilgrim-bg');
    if (bg) bg.style.transform = `scale(1.08) translate(${x * 10}px,${y * 10}px)`;
  });
  card.addEventListener('mouseleave', () => {
    const bg = card.querySelector('.pilgrim-bg');
    if (bg) bg.style.transform = '';
  });
});

// ── DESTINATION SLIDER ──
(function () {
  const dt = document.getElementById('destTrack');
  const dotsWrap = document.getElementById('destDots');
  if (!dt) return;
  const cards = dt.querySelectorAll('.dest-card');
  const perView = () => window.innerWidth > 1024 ? 3 : window.innerWidth > 600 ? 2 : 1;
  let dIdx = 0;

  if (dotsWrap) {
    for (let i = 0; i < cards.length; i++) {
      const d = document.createElement('div');
      d.className = 'dest-dot' + (i === 0 ? ' active' : '');
      d.addEventListener('click', () => goDest(i));
      dotsWrap.appendChild(d);
    }
  }

  function goDest(idx) {
    const max = Math.max(0, cards.length - perView());
    dIdx = Math.max(0, Math.min(idx, max));
    const w = dt.parentElement.offsetWidth;
    const cardW = (w - (perView() - 1) * 22) / perView();
    dt.style.transform = `translateX(-${dIdx * (cardW + 22)}px)`;
    cards.forEach(c => { c.style.flex = `0 0 ${cardW}px`; });
    if (dotsWrap) dotsWrap.querySelectorAll('.dest-dot').forEach((d, i) => d.classList.toggle('active', i === dIdx));
  }

  window.addEventListener('resize', () => goDest(dIdx));
  setTimeout(() => goDest(0), 120);
  document.getElementById('destNext').addEventListener('click', () => goDest(dIdx + 1));
  document.getElementById('destPrev').addEventListener('click', () => goDest(dIdx - 1));
  setInterval(() => goDest(dIdx + 1 > Math.max(0, cards.length - perView()) ? 0 : dIdx + 1), 4000);
})();

// ── FORM SUBMIT ──
function submitForm() {
  // Collect form field values
  const name = document.querySelector('.contact-form .form-row:first-of-type .form-field:first-child input').value.trim();
  const phone = document.querySelector('.contact-form .form-row:first-of-type .form-field:last-child input').value.trim();
  const tripType = document.querySelector('.contact-form select').value;
  const from = document.querySelector('.contact-form .form-row:last-of-type .form-field:first-child input').value.trim();
  const date = document.querySelector('.contact-form .form-row:last-of-type .form-field:last-child input').value;
  const message = document.querySelector('.contact-form textarea').value.trim();

  // Basic validation
  if (!name || !phone) {
    alert('Please enter your name and phone number.');
    return;
  }

  // Build WhatsApp message
  const formattedDate = date ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not specified';

  const waMessage =
    `🚗 *New Booking Enquiry — Sri Varu Travels*\n\n` +
    `👤 *Name:* ${name}\n` +
    `📞 *Phone:* ${phone}\n` +
    `🗺️ *Trip Type:* ${tripType}\n` +
    `📍 *From:* ${from || 'Not specified'}\n` +
    `📅 *Travel Date:* ${formattedDate}\n` +
    `💬 *Message:* ${message || 'No additional message'}`;

  const encoded = encodeURIComponent(waMessage);
  const waURL = `https://wa.me/917299921960?text=${encoded}`;

  // Visual feedback on button
  const btn = document.querySelector('.form-submit');
  btn.textContent = "✓ Sent! We'll call you soon.";
  btn.style.background = 'var(--green-light)';
  btn.style.transform = 'scale(1.02)';
  setTimeout(() => {
    btn.textContent = 'Send Enquiry →';
    btn.style.background = '';
    btn.style.transform = '';
  }, 3000);

  // Open WhatsApp
  window.open(waURL, '_blank');
}
