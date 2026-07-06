// ============================================================
// Mobile nav toggle
// ============================================================
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ============================================================
// Hero canvas — a field of particles drifting between pure
// noise and a barely-legible shape (an eye), never fully
// resolving. This is the page's signature: the same thing
// the notebook studies (does the machine see a shape in
// noise?) staged as the very first thing a visitor sees.
// ============================================================
(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  let W, H, DPR;
  let particles = [];
  const COUNT = 260;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    buildParticles();
  }

  // Target shape: a simple almond eye outline + pupil, scaled to canvas.
  function eyeTargets(n) {
    const cx = W / 2, cy = H / 2;
    const scale = Math.min(W, H) * 0.28;
    const pts = [];
    const outlineCount = Math.floor(n * 0.7);
    const pupilCount = n - outlineCount;

    for (let i = 0; i < outlineCount; i++) {
      const t = (i / outlineCount) * Math.PI * 2;
      // almond shape: x = cos(t), y = sin(t)^3-ish taper
      const x = Math.cos(t);
      const y = Math.sin(t) * (0.45 + 0.55 * Math.pow(Math.abs(Math.cos(t)), 0.6)) * Math.sign(Math.sin(t) || 1);
      pts.push({ x: cx + x * scale, y: cy + y * scale * 0.55 });
    }
    for (let i = 0; i < pupilCount; i++) {
      const t = (i / pupilCount) * Math.PI * 2;
      const r = scale * 0.18 * Math.sqrt(Math.random());
      pts.push({ x: cx + Math.cos(t) * r, y: cy + Math.sin(t) * r * 0.9 });
    }
    return pts;
  }

  function buildParticles() {
    const targets = eyeTargets(COUNT);
    particles = targets.map((t) => ({
      rx: Math.random() * W,
      ry: Math.random() * H,
      tx: t.x,
      ty: t.y,
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.5,
      r: 1 + Math.random() * 1.6,
    }));
  }

  let start = performance.now();

  function draw(now) {
    const t = (now - start) / 1000;
    ctx.clearRect(0, 0, W, H);

    // global coherence oscillates slowly between scattered (0) and shaped (1),
    // lingering near the extremes rather than dwelling in a blurry middle.
    const raw = (Math.sin(t * 0.15) + 1) / 2;
    const coherence = Math.pow(raw, 1.6);

    for (const p of particles) {
      const wobble = Math.sin(t * p.speed + p.phase) * 6;
      const x = p.rx + (p.tx - p.rx) * coherence + wobble * (1 - coherence);
      const y = p.ry + (p.ty - p.ry) * coherence + wobble * (1 - coherence);

      const nearShape = coherence;
      const hue = nearShape > 0.6 ? 'rgba(82,209,196,' : 'rgba(139,147,166,';
      ctx.beginPath();
      ctx.fillStyle = hue + (0.25 + nearShape * 0.55) + ')';
      ctx.arc(x, y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(draw);
})();
