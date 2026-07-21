/* Site behavior. You shouldn't need to edit this file; links and
   project content live in js/site.js (or use editor.html). */

(function () {
  "use strict";

  const R = window.PortfolioRender;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Social links ----------
     The real URLs are hard-coded in the HTML so crawlers, link-preview
     bots, and ATS parsers see them without running any JavaScript. This
     only keeps them in sync with site.js, and hides a link that has no
     destination in either place. */
  document.querySelectorAll("[data-social]").forEach((a) => {
    const url = SITE[a.dataset.social];
    const hasRealHref = a.getAttribute("href") && a.getAttribute("href") !== "#";
    if (url) {
      /* Resume is a repo-relative path; respect the page's own prefix. */
      if (!/^\w+:|^\/\//.test(url) && hasRealHref) return;
      a.href = url;
    } else if (!hasRealHref) {
      const li = a.closest("li");
      (li || a).hidden = true;
    }
  });

  /* ---------- Project cards: render + expand in place ---------- */
  const grid = document.getElementById("project-grid");
  if (grid) {
    grid.insertAdjacentHTML(
      "afterbegin",
      PROJECTS.map((p) => R.projectCardHTML(p)).join("")
    );

    grid.addEventListener("click", (e) => {
      if (e.target.closest("a") || e.target.closest(".card-case")) return;
      const head = e.target.closest(".card-head");
      if (!head) return;
      const card = head.closest(".project-card");
      const btn = head.querySelector(".card-toggle");
      const open = card.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
      if (open && !reducedMotion) {
        // keep the card in view as it grows
        setTimeout(() => {
          card.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 320);
      }
    });
  }

  /* ---------- Case-study pages render from the same data ---------- */
  const caseMount = document.querySelector("[data-case]");
  if (caseMount) {
    const p = PROJECTS.find((x) => x.slug === caseMount.dataset.case);
    const inner = caseMount.querySelector(".section-inner") || caseMount;
    if (p) {
      inner.innerHTML = R.caseStudyBodyHTML(p, {
        assetPrefix: "../",
        headingTag: "h2",
      });
    } else {
      inner.innerHTML =
        "<p>This case study isn't in <code>js/site.js</code> yet. Add the project there (or via <code>editor.html</code>) using the same slug as this file's name.</p>";
    }
  }

  /* ---------- Metric count-up (a small data moment) ---------- */
  const metrics = document.querySelectorAll(".card-metric strong");
  if (metrics.length && !reducedMotion && "IntersectionObserver" in window) {
    const animate = (el) => {
      const m = el.textContent.match(/^([^0-9]*)([0-9][0-9,.]*)(.*)$/);
      if (!m) return;
      const [, pre, numStr, post] = m;
      const target = parseFloat(numStr.replace(/,/g, ""));
      const decimals = (numStr.split(".")[1] || "").length;
      const t0 = performance.now();
      const DUR = 900;
      const tick = (now) => {
        const t = Math.min((now - t0) / DUR, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = pre + (target * eased).toFixed(decimals) + post;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const counted = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          counted.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    metrics.forEach((el) => counted.observe(el));
  }

  /* ---------- Skills: explorable field notes ---------- */
  const skillGroups = document.querySelectorAll(".skill-group");
  if (skillGroups.length && document.querySelector(".field-note")) {
    const heading = document.querySelector(".section-skills h2");
    if (heading) {
      heading.insertAdjacentHTML(
        "afterend",
        '<p class="skills-hint">Tap any group for a field note.</p>'
      );
    }
  }
  skillGroups.forEach((g) => {
    const note = g.querySelector(".field-note");
    const h3 = g.querySelector("h3");
    if (!note || !h3) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "skill-toggle";
    btn.setAttribute("aria-expanded", "false");
    btn.textContent = h3.textContent;
    h3.textContent = "";
    h3.appendChild(btn);
    btn.addEventListener("click", () => {
      const open = g.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
      note.hidden = !open;
    });
  });


  /* ---------- Depth gauge ---------- */
  const gauge = document.querySelector(".depth-gauge");
  if (gauge) {
    const STOPS = [
      { id: "top", label: "Surface", depth: 0 },
      { id: "skills", label: "Skills", depth: 6 },
      { id: "projects", label: "Projects", depth: 14 },
      { id: "experience", label: "Experience", depth: 22 },
      { id: "about", label: "About", depth: 30 },
      { id: "contact", label: "Contact", depth: 40 },
    ];

    const list = gauge.querySelector(".gauge-stops");
    list.innerHTML = STOPS.map(
      (s) =>
        `<li><a href="#${s.id}" data-stop="${s.id}"><span class="stop-depth">−${s.depth}&hairsp;m</span> ${s.label}</a></li>`
    ).join("");
    gauge.hidden = false;

    const links = new Map(
      [...list.querySelectorAll("a")].map((a) => [a.dataset.stop, a])
    );
    const DEEP_STOPS = new Set(["skills", "about", "contact"]);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            links.forEach((a) => a.classList.remove("is-active"));
            const link = links.get(entry.target.id);
            if (link) link.classList.add("is-active");
            gauge.classList.toggle("on-dark", DEEP_STOPS.has(entry.target.id));
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    STOPS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    const readout = document.getElementById("gauge-depth");
    let ticking = false;
    const updateDepth = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const depth = max > 0 ? Math.round((window.scrollY / max) * 40) : 0;
      readout.textContent = depth === 0 ? "0" : "−" + depth;
      const tempEl = document.getElementById("dive-temp");
      if (tempEl) tempEl.textContent = Math.round(26 - depth * 0.5) + "\u00B0";
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(updateDepth);
        }
      },
      { passive: true }
    );
    updateDepth();

    // Dive time: how long you've been under (on the page).
    const timeEl = document.getElementById("dive-time");
    if (timeEl) {
      const t0 = Date.now();
      setInterval(() => {
        const s = Math.floor((Date.now() - t0) / 1000);
        timeEl.textContent =
          String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
      }, 1000);
    }
  }

  /* ---------- Creature parallax: wildlife passes at its own depth ---------- */
  if (!reducedMotion && window.innerWidth > 1100) {
    const drifters = [
      [".sea-turtle", 0.06],
      [".reef-fish", 0.09],
      [".jellies", 0.07],
      [".diver", 0.05],
      [".manta", 0.08],
    ]
      .map(([sel, f]) => {
        const el = document.querySelector(sel);
        return el ? { el, f, cur: 0 } : null;
      })
      .filter(Boolean);

    if (drifters.length) {
      let queued = false;
      const applyParallax = () => {
        queued = false;
        const mid = window.innerHeight / 2;
        drifters.forEach((d) => {
          const r = d.el.getBoundingClientRect();
          const baseCenter = r.top - d.cur + r.height / 2;
          d.cur = (baseCenter - mid) * d.f;
          d.el.style.transform = `translateY(${d.cur.toFixed(1)}px)`;
        });
      };
      const queue = () => {
        if (!queued) {
          queued = true;
          requestAnimationFrame(applyParallax);
        }
      };
      window.addEventListener("scroll", queue, { passive: true });
      window.addEventListener("resize", queue);
      applyParallax();
    }
  }

  /* ---------- One orchestrated reveal moment (skipped under reduced motion) ---------- */
  if (!reducedMotion && "IntersectionObserver" in window) {
    const revealables = document.querySelectorAll(".project-card, .timeline > li");
    revealables.forEach((el) => el.classList.add("will-reveal"));
    const revealer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            revealer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealables.forEach((el) => revealer.observe(el));
  }

  /* ---------- Reef log: click a coral head, hear its field note ---------- */
  const reefEl = document.querySelector(".reef");
  const noteEl = document.getElementById("reef-note");
  if (reefEl && noteEl) {
    const nameEl = noteEl.querySelector(".rn-name");
    const textEl = noteEl.querySelector(".rn-text");
    const phone = window.matchMedia("(max-width: 620px)");
    // No hover on touch screens; the prompt should say what works there.
    if (window.matchMedia("(pointer: coarse)").matches) {
      textEl.textContent = "Tap a coral head for what I actually do with it.";
    }
    reefEl.addEventListener("click", (e) => {
      const cluster = e.target.closest(".coral-cluster");
      if (!cluster) return;
      nameEl.textContent = cluster.getAttribute("aria-label") || "";
      textEl.textContent = cluster.dataset.note || "";
      noteEl.classList.add("rn-active");
      // On phones the log lives below the whole stack, out of sight;
      // bring the note to the coral that was tapped instead.
      if (phone.matches) cluster.insertAdjacentElement("afterend", noteEl);
    });
  }

  /* ---------- The gauge surfaces only once you leave the surface ---------- */
  const heroSection = document.querySelector(".hero");
  const gaugeEl = document.querySelector(".depth-gauge");
  if (heroSection && gaugeEl && "IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      gaugeEl.classList.toggle("gauge-hidden", entries[0].isIntersecting);
    }, { threshold: 0.2 }).observe(heroSection);
  }

  /* ---------- Seafloor: on phones, crop to the kelp forest ---------- */
  // The scene is authored 1440 wide; a centered crop on a narrow screen
  // lands on its sparsest stretch. Anchor left, where the kelp lives.
  const seafloor = document.querySelector(".seafloor");
  if (seafloor && window.matchMedia("(max-width: 720px)").matches) {
    seafloor.setAttribute("preserveAspectRatio", "xMinYMax slice");
  }

  /* ---------- Footer year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
