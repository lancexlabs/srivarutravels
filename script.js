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
  if (expandedPkg && Math.abs(s - lastScrollY) > 60) closePkg({}, expandedPkg);
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
const revealEls = document.querySelectorAll('.reveal, .why-item, .testi-card');
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
      [{ idx: 0, target: 5000, fmt: v => Math.round(v / 1000) + 'K+' },
       { idx: 1, target: 8, fmt: v => Math.round(v) + '+' }
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
function expandPkg(id) {
  if (expandedPkg) return;
  const card = document.getElementById(id);
  savedScroll = window.scrollY;
  savedRect = card.getBoundingClientRect();

  // Force-show if still in reveal animation
  card.classList.add('visible');

  // Snapshot position then animate to fullscreen
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
    transition: all 0.55s cubic-bezier(0.4,0,0.2,1);
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
  card.style.cssText = `
    position: fixed;
    top: ${savedRect.top}px;
    left: ${savedRect.left}px;
    width: ${savedRect.width}px;
    height: ${savedRect.height}px;
    border-radius: 28px;
    z-index: 2000;
    transition: all 0.55s cubic-bezier(0.4,0,0.2,1);
  `;
  setTimeout(() => {
    card.style.cssText = '';
    document.getElementById('pkgOverlay').classList.remove('active');
    document.body.style.overflow = '';
    expandedPkg = null;
    window.scrollTo(0, savedScroll);
  }, 560);
}

document.getElementById('pkgOverlay').addEventListener('click', () => {
  if (expandedPkg) closePkg({}, expandedPkg);
});

// ── TESTIMONIAL SLIDER ──
const track = document.getElementById('testiTrack');
const testiCards = track.querySelectorAll('.testi-card');
const testiDots = document.getElementById('testiDots');
let testiIndex = 0;
const perView = () => window.innerWidth > 1024 ? 3 : window.innerWidth > 600 ? 2 : 1;
const maxTesti = () => Math.max(0, testiCards.length - perView());

function slideTesti(dir) {
  const max = maxTesti();
  testiIndex = (dir === 'auto')
    ? (testiIndex >= max ? 0 : testiIndex + 1)
    : Math.max(0, Math.min(testiIndex + dir, max));
  const cardW = track.querySelector('.testi-card').offsetWidth + 28;
  track.style.transform = `translateX(-${testiIndex * cardW}px)`;
  const dots = testiDots.querySelectorAll('span');
  dots.forEach((d, i) => {
    d.style.width = i === Math.min(testiIndex, dots.length - 1) ? '24px' : '8px';
    d.style.borderRadius = i === Math.min(testiIndex, dots.length - 1) ? '4px' : '50%';
    d.style.background = i === Math.min(testiIndex, dots.length - 1) ? 'var(--green)' : '#ddd';
  });
}

document.getElementById('testiNext').addEventListener('click', () => slideTesti(1));
document.getElementById('testiPrev').addEventListener('click', () => slideTesti(-1));
if (testiDots) testiDots.querySelectorAll('span').forEach((d, i) => d.addEventListener('click', () => { testiIndex = i; slideTesti(0); }));
setInterval(() => slideTesti('auto'), 4500);

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

// ── FLEET SLIDER ──
(function () {
  const ft = document.getElementById('fleetTrack');
  const dotsWrap = document.getElementById('fleetDots');
  if (!ft) return;
  const cards = ft.querySelectorAll('.fleet-card');
  const perView = () => window.innerWidth > 1100 ? 4 : window.innerWidth > 700 ? 2 : 1;
  let fIdx = 0;
  if (dotsWrap) {
    for (let i = 0; i < cards.length; i++) {
      const d = document.createElement('div');
      d.className = 'fleet-dot' + (i === 0 ? ' active' : '');
      d.addEventListener('click', () => goFleet(i));
      dotsWrap.appendChild(d);
    }
  }
  function goFleet(idx) {
    const max = Math.max(0, cards.length - perView());
    fIdx = Math.max(0, Math.min(idx, max));
    const w = ft.parentElement.offsetWidth;
    const cardW = (w - (perView() - 1) * 24) / perView();
    ft.style.transform = `translateX(-${fIdx * (cardW + 24)}px)`;
    cards.forEach(c => { c.style.flex = `0 0 ${cardW}px`; });
    if (dotsWrap) dotsWrap.querySelectorAll('.fleet-dot').forEach((d, i) => d.classList.toggle('active', i === fIdx));
  }
  window.addEventListener('resize', () => goFleet(fIdx));
  setTimeout(() => goFleet(0), 100);
  document.getElementById('fleetNext').addEventListener('click', () => goFleet(fIdx + 1));
  document.getElementById('fleetPrev').addEventListener('click', () => goFleet(fIdx - 1));
  setInterval(() => goFleet(fIdx + 1 > Math.max(0, cards.length - perView()) ? 0 : fIdx + 1), 3500);
})();

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
    const cardW = (w - (perView() - 1) * 24) / perView();
    dt.style.transform = `translateX(-${dIdx * (cardW + 24)}px)`;
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
  const btn = document.querySelector('.form-submit');
  btn.textContent = "✓ Sent! We'll call you soon.";
  btn.style.background = 'var(--green-light)';
  btn.style.transform = 'scale(1.02)';
  setTimeout(() => { btn.textContent = 'Send Enquiry →'; btn.style.background = ''; btn.style.transform = ''; }, 3000);
}
