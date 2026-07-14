/* Full-viewport scene reveals: each section surfaces out of the dark
   as you descend to it. Skipped under prefers-reduced-motion. */

(function () {
  "use strict";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("IntersectionObserver" in window)) return;

  const scenes = document.querySelectorAll(".section .section-inner");
  scenes.forEach((el) => el.classList.add("will-scene"));
  // Reveal once the scene's top clears the bottom 12% of the viewport.
  // A fractional threshold can't work here: tall scenes (projects on a
  // phone) can never have 18% visible at once, so they'd never reveal.
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("scene-in");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0 }
  );
  scenes.forEach((el) => io.observe(el));
})();
