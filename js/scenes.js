/* Full-viewport scene reveals: each section surfaces out of the dark
   as you descend to it. Skipped under prefers-reduced-motion. */

(function () {
  "use strict";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("IntersectionObserver" in window)) return;

  const scenes = document.querySelectorAll(".section .section-inner");
  scenes.forEach((el) => el.classList.add("will-scene"));
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("scene-in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );
  scenes.forEach((el) => io.observe(el));
})();
