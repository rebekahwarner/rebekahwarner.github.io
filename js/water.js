/* Live water in the hero: soft light shafts and rising bubbles,
   painted in the site palette. Gently follows the cursor. Skipped
   entirely when the visitor prefers reduced motion; paused when the
   hero is offscreen or the tab is hidden. */

(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const hero = document.querySelector(".hero");
  const heroInner = document.querySelector(".hero-inner");
  if (!hero || !heroInner) return;

  const canvas = document.createElement("canvas");
  canvas.className = "hero-water";
  canvas.setAttribute("aria-hidden", "true");
  hero.insertBefore(canvas, heroInner);
  const ctx = canvas.getContext("2d");

  let w = 0, h = 0;
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = hero.clientWidth;
    h = hero.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);

  // Pointer: rays lean toward it, bubbles drift away from it.
  let px = 0.65, tx = 0.65, pyPix = -1000;
  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width;
    pyPix = e.clientY - r.top;
  });
  hero.addEventListener("pointerleave", () => {
    tx = 0.65;
    pyPix = -1000;
  });

  const rnd = (a, b) => a + Math.random() * (b - a);

  const N = w < 720 ? 16 : 30;
  const bubbles = [];
  const spawn = (anywhere) => ({
    x: rnd(0.02, 0.98),
    y: anywhere ? rnd(0, 1) : rnd(1.02, 1.1),
    r: rnd(1.5, 5),
    v: rnd(0.0008, 0.002),
    wob: rnd(0, Math.PI * 2),
    wobs: rnd(0.4, 1.4),
  });
  for (let i = 0; i < N; i++) bubbles.push(spawn(true));

  // Light shafts, weighted toward the wash side of the hero.
  const rays = [
    { x: 0.58, w: 0.05, o: 0.045 },
    { x: 0.70, w: 0.08, o: 0.06 },
    { x: 0.82, w: 0.06, o: 0.05 },
    { x: 0.93, w: 0.09, o: 0.04 },
  ];

  let running = true;
  let rafId = null;
  const io = new IntersectionObserver((entries) => {
    const visible = entries[0].isIntersecting;
    if (visible && !running) {
      running = true;
      rafId = requestAnimationFrame(frame);
    } else if (!visible) {
      running = false;
    }
  });
  io.observe(hero);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && running && rafId === null) {
      rafId = requestAnimationFrame(frame);
    }
  });

  function frame(now) {
    rafId = null;
    if (!running || document.hidden) return;
    const t = now / 1000;
    px += (tx - px) * 0.02;

    ctx.clearRect(0, 0, w, h);

    // Shafts of light angling down, swaying slowly.
    rays.forEach((r, i) => {
      const sway = Math.sin(t * 0.13 + i * 1.9) * 0.035 + (px - 0.65) * 0.1;
      const x0 = (r.x + sway) * w;
      const drift = h * 0.22; // lean left as they descend
      const wTop = r.w * w * 0.35;
      const wBot = r.w * w * 1.1;
      const grad = ctx.createLinearGradient(x0, 0, x0 - drift, h);
      grad.addColorStop(0, `rgba(111, 224, 205, ${r.o})`);
      grad.addColorStop(1, "rgba(111, 224, 205, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(x0 - wTop, 0);
      ctx.lineTo(x0 + wTop, 0);
      ctx.lineTo(x0 - drift + wBot, h);
      ctx.lineTo(x0 - drift - wBot, h);
      ctx.closePath();
      ctx.fill();
    });

    // Bubbles rising with a wobble, nudged away from the pointer.
    bubbles.forEach((b, i) => {
      b.y -= b.v * (0.6 + b.r * 0.12);
      if (b.y < -0.05) bubbles[i] = spawn(false);
      const bx = (b.x + Math.sin(t * b.wobs + b.wob) * 0.012) * w;
      const by = b.y * h;
      const dx = bx - px * w;
      const dy = by - pyPix;
      const d2 = dx * dx + dy * dy;
      let ox = 0, oy = 0;
      if (d2 < 22500) { // within 150px of the pointer
        const d = Math.sqrt(d2) || 1;
        const push = ((150 - d) / 150) * 14;
        ox = (dx / d) * push;
        oy = (dy / d) * push;
      }
      ctx.beginPath();
      ctx.arc(bx + ox, by + oy, b.r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(111, 224, 205, 0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(bx + ox - b.r * 0.3, by + oy - b.r * 0.3, b.r * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(230, 255, 250, 0.8)";
      ctx.fill();
    });

    rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);
})();
