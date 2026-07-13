/* Marine snow: the ocean's starfield. A full-page field of drifting
   specks that sweeps upward as you scroll down, so descending the page
   feels like swimming down through the water column. Two speck tones
   (pale and teal) so some catch the light on dark sections and some on
   light ones. Skipped under prefers-reduced-motion; paused when the
   tab is hidden. */

(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.className = "marine-snow";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  let w = 0, h = 0;
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);

  const rnd = (a, b) => a + Math.random() * (b - a);
  const N = window.innerWidth < 720 ? 26 : 60;
  const parts = Array.from({ length: N }, () => ({
    x: rnd(0, 1),
    y: rnd(0, 1),
    d: rnd(0.25, 1),          // depth layer: near specks move faster
    r: rnd(0.8, 2.4),
    wob: rnd(0, Math.PI * 2),
    ws: rnd(0.2, 0.7),
    light: Math.random() < 0.5,
  }));

  let lastScroll = window.scrollY;
  let vel = 0;
  let rafId = null;

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && rafId === null) {
      lastScroll = window.scrollY;
      rafId = requestAnimationFrame(frame);
    }
  });

  function frame(now) {
    rafId = null;
    if (document.hidden) return;
    const t = now / 1000;

    // Smoothed scroll velocity: descending makes the snow stream upward.
    const sy = window.scrollY;
    vel += (sy - lastScroll - vel) * 0.12;
    lastScroll = sy;

    ctx.clearRect(0, 0, w, h);
    for (const p of parts) {
      p.y -= (vel * p.d * 0.35) / h;   // swim-past motion
      p.y += (0.000018 * (0.4 + p.d)); // idle: snow sinks, slowly
      if (p.y > 1.02) p.y -= 1.04;
      if (p.y < -0.02) p.y += 1.04;
      const px = (p.x + Math.sin(t * p.ws + p.wob) * 0.006) * w;
      const py = p.y * h;
      ctx.beginPath();
      ctx.arc(px, py, p.r * (0.6 + p.d * 0.6), 0, Math.PI * 2);
      ctx.fillStyle = p.light
        ? `rgba(200, 245, 235, ${0.14 + p.d * 0.2})`
        : `rgba(111, 224, 205, ${0.10 + p.d * 0.16})`;
      ctx.fill();
    }
    rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);
})();
