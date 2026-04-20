/* =============================================
   KEROMI SOLES — MAIN JS
   ============================================= */

// ── NAVBAR ──────────────────────────────────
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

hamburger.addEventListener('click', () => {
  const open = hamburger.classList.toggle('open');
  mobileNav.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

mobileNav.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ── HERO CANVAS ──────────────────────────────
(function heroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], lines = [];
  const PINK = 'rgba(232,25,122,';
  const NAVY = 'rgba(26,52,128,';

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // Create floating sole-outline shapes (ellipses mimicking soles)
  class SoleShape {
    constructor() { this.reset(true); }
    reset(initial) {
      this.x = Math.random() * W;
      this.y = initial ? Math.random() * H : H + 100;
      this.rx = 18 + Math.random() * 40;
      this.ry = this.rx * (1.8 + Math.random() * 0.6);
      this.angle = (Math.random() - 0.5) * Math.PI * 0.4;
      this.speed = 0.15 + Math.random() * 0.25;
      this.alpha = 0.03 + Math.random() * 0.07;
      this.color = Math.random() > 0.6 ? PINK : NAVY;
      this.drift = (Math.random() - 0.5) * 0.3;
    }
    update() {
      this.y -= this.speed;
      this.x += this.drift;
      if (this.y < -this.ry * 2) this.reset(false);
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.beginPath();
      ctx.ellipse(0, 0, this.rx, this.ry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = this.color + this.alpha + ')';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      // inner tread lines
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.ellipse(0, i * (this.ry / 3.5), this.rx * 0.7, 3, 0, 0, Math.PI * 2);
        ctx.strokeStyle = this.color + (this.alpha * 0.5) + ')';
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  for (let i = 0; i < 22; i++) particles.push(new SoleShape());

  // Topographic-style horizontal lines
  class TopoLine {
    constructor(i) {
      this.y = (H / 14) * i + Math.random() * 30;
      this.amplitude = 20 + Math.random() * 40;
      this.freq = 0.003 + Math.random() * 0.004;
      this.phase = Math.random() * Math.PI * 2;
      this.speed = 0.004 + Math.random() * 0.006;
      this.alpha = 0.04 + Math.random() * 0.06;
      this.color = i % 3 === 0 ? PINK : NAVY;
    }
    update() { this.phase += this.speed; }
    draw() {
      ctx.beginPath();
      for (let x = 0; x <= W; x += 4) {
        const y = this.y + Math.sin(x * this.freq + this.phase) * this.amplitude;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = this.color + this.alpha + ')';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  for (let i = 0; i < 14; i++) lines.push(new TopoLine(i));

  function animate() {
    ctx.clearRect(0, 0, W, H);
    lines.forEach(l => { l.update(); l.draw(); });
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
})();

// ── SCROLL REVEAL ────────────────────────────
(function scrollReveal() {
  const els = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
})();

// ── TESTIMONIALS SLIDER ──────────────────────
(function testimonialsSlider() {
  const track = document.querySelector('.testimonials-track');
  if (!track) return;
  const cards = track.querySelectorAll('.testimonial-card');
  const dots = document.querySelectorAll('.slider-dot');
  let current = 0;
  let autoTimer;

  function goTo(idx) {
    cards[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (idx + cards.length) % cards.length;
    cards[current].classList.add('active');
    dots[current].classList.add('active');
    track.style.transform = `translateX(-${current * 100}%)`;
    resetAuto();
  }

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }

  document.getElementById('slider-prev')?.addEventListener('click', () => goTo(current - 1));
  document.getElementById('slider-next')?.addEventListener('click', () => goTo(current + 1));
  dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

  goTo(0);
})();

// ── CONTACT FORM ─────────────────────────────
(function contactForm() {
  const form = document.getElementById('quote-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    btn.textContent = 'Sending…';
    btn.disabled = true;
    setTimeout(() => {
      form.style.display = 'none';
      document.getElementById('form-success').style.display = 'block';
    }, 1200);
  });
})();

// ── SMOOTH SCROLL for anchor links ───────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH = navbar.offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ── TWEAKS PANEL ─────────────────────────────
(function tweaks() {
  const DEFAULTS = /*EDITMODE-BEGIN*/{
    "accentColor": "#e8197a",
    "heroTagline": "Premium PVC Soles. African Precision. Global Standard.",
    "darkMode": true
  }/*EDITMODE-END*/;

  window.addEventListener('message', e => {
    if (e.data?.type === '__activate_edit_mode') showTweaks();
    if (e.data?.type === '__deactivate_edit_mode') hideTweaks();
  });
  window.parent.postMessage({ type: '__edit_mode_available' }, '*');

  const panel = document.getElementById('tweaks-panel');
  if (!panel) return;

  function showTweaks() { panel.style.display = 'block'; }
  function hideTweaks() { panel.style.display = 'none'; }

  panel.querySelector('#tweak-accent').addEventListener('input', function() {
    document.documentElement.style.setProperty('--pink', this.value);
    const light = this.value; // simplified
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { accentColor: this.value } }, '*');
  });

  panel.querySelector('#tweak-tagline').addEventListener('input', function() {
    const el = document.querySelector('.hero-tagline');
    if (el) el.innerHTML = this.value;
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { heroTagline: this.value } }, '*');
  });
})();
