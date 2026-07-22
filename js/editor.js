/* Editor page logic. Working copy lives in localStorage; publishing =
   downloading a regenerated js/site.js (and a page shell for new
   projects) and dropping them into the repo. */

(function () {
  "use strict";

  const R = window.PortfolioRender;
  const LS_KEY = "rw-portfolio-editor-v1";
  const $ = (id) => document.getElementById(id);
  const statusEl = $("status");

  /* ---------- State ---------- */
  const clone = (o) => JSON.parse(JSON.stringify(o));

  function blankProject() {
    return {
      slug: "",
      title: "",
      oneLiner: "",
      metric: { value: "", label: "" },
      tags: [],
      wash: "wash-teal",
      caseStudy: {
        problem: [],
        approach: [],
        code: { afterParagraph: null, snippet: "" },
        tools: "",
        outcome: [],
        image: null,
      },
    };
  }

  let state;
  try {
    state = JSON.parse(localStorage.getItem(LS_KEY));
  } catch (e) {
    state = null;
  }
  if (!state || !Array.isArray(state.projects)) {
    state = { site: clone(SITE), projects: PROJECTS.map(clone) };
  } else {
    // Pick up projects added to site.js outside the editor.
    PROJECTS.forEach((p) => {
      if (!state.projects.some((x) => x.slug === p.slug)) {
        state.projects.push(clone(p));
      }
    });
  }

  let currentIndex = 0;

  function persist() {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }

  function say(msg) {
    statusEl.textContent = msg;
    clearTimeout(say.t);
    say.t = setTimeout(() => (statusEl.textContent = ""), 6000);
  }

  /* ---------- Helpers ---------- */
  const kebab = (s) =>
    String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const splitParas = (s) =>
    String(s).split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);
  const joinParas = (arr) => (arr || []).join("\n\n");

  let slugTouched = false;

  /* ---------- Form <-> state ---------- */
  function current() {
    return state.projects[currentIndex];
  }

  function fillForm() {
    const p = current();
    const cs = p.caseStudy || (p.caseStudy = blankProject().caseStudy);
    $("f-title").value = p.title || "";
    $("f-slug").value = p.slug || "";
    $("f-oneliner").value = p.oneLiner || "";
    $("f-metric-value").value = (p.metric && p.metric.value) || "";
    $("f-metric-label").value = (p.metric && p.metric.label) || "";
    $("f-tags").value = (p.tags || []).join(", ");
    $("f-wash").value = p.wash || "wash-teal";
    $("f-problem").value = joinParas(cs.problem);
    $("f-approach").value = joinParas(cs.approach);
    $("f-code").value = (cs.code && cs.code.snippet) || "";
    $("f-code-after").value =
      cs.code && Number.isInteger(cs.code.afterParagraph)
        ? String(cs.code.afterParagraph)
        : "";
    $("f-tools").value = cs.tools || "";
    $("f-outcome").value = joinParas(cs.outcome);
    $("f-img-file").value = (cs.image && cs.image.file) || "";
    $("f-img-alt").value = (cs.image && cs.image.alt) || "";
    $("f-img-caption").value = (cs.image && cs.image.caption) || "";
    slugTouched = Boolean(p.slug) && p.slug !== kebab(p.title || "");
  }

  function readForm() {
    const p = current();
    p.title = $("f-title").value.trim();
    if (!slugTouched) $("f-slug").value = kebab(p.title);
    p.slug = kebab($("f-slug").value.trim());
    p.oneLiner = $("f-oneliner").value.trim();
    p.metric = {
      value: $("f-metric-value").value.trim(),
      label: $("f-metric-label").value.trim(),
    };
    p.tags = $("f-tags").value.split(",").map((t) => t.trim()).filter(Boolean);
    p.wash = $("f-wash").value;
    const after = $("f-code-after").value.trim();
    p.caseStudy = {
      problem: splitParas($("f-problem").value),
      approach: splitParas($("f-approach").value),
      code: {
        afterParagraph: after === "" ? null : parseInt(after, 10) || null,
        snippet: $("f-code").value.replace(/\s+$/, ""),
      },
      tools: $("f-tools").value.trim(),
      outcome: splitParas($("f-outcome").value),
      image: $("f-img-file").value.trim()
        ? {
            file: $("f-img-file").value.trim(),
            alt: $("f-img-alt").value.trim(),
            caption: $("f-img-caption").value.trim(),
          }
        : null,
    };
    state.site.github = $("f-github").value.trim();
    state.site.linkedin = $("f-linkedin").value.trim();
    state.site.resume = $("f-resume").value.trim();
  }

  /* ---------- Picker ---------- */
  function rebuildPicker() {
    const sel = $("f-picker");
    sel.innerHTML = state.projects
      .map(
        (p, i) =>
          `<option value="${i}">${R.escapeHTML(p.title || "(untitled)")}</option>`
      )
      .join("");
    sel.value = String(currentIndex);
  }

  /* ---------- Preview ---------- */
  function renderPreview() {
    const p = current();
    $("preview-card").innerHTML = R.projectCardHTML(p);
    $("preview-case").innerHTML =
      `<div class="case-preview"><h1>${R.escapeHTML(p.title || "(untitled)")}</h1>` +
      `<ul class="tags">${(p.tags || []).map((t) => `<li>${R.escapeHTML(t)}</li>`).join("")}</ul>` +
      R.caseStudyBodyHTML(p, { assetPrefix: "", headingTag: "h2" }) +
      `</div>`;
  }

  function refresh() {
    readForm();
    persist();
    renderPreview();
  }

  /* ---------- Downloads ---------- */
  function download(name, text) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  }

  function siteJsText() {
    return (
      "/* ============================================================\n" +
      "   Site data, generated by editor.html.\n" +
      "   Replace js/site.js with this file to publish your edits.\n" +
      "   (You can still hand-edit; the editor picks up new projects\n" +
      "   by slug next time you open it.)\n" +
      "   ============================================================ */\n\n" +
      "const SITE = " + JSON.stringify(state.site, null, 2) + ";\n\n" +
      "const PROJECTS = " + JSON.stringify(state.projects, null, 2) + ";\n"
    );
  }

  function pageShellText(p) {
    const title = R.escapeHTML(p.title);
    const desc = R.escapeHTML(p.oneLiner || p.title);
    const tags = (p.tags || [])
      .map((t) => `<li>${R.escapeHTML(t)}</li>`)
      .join("");
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} · Rebekah Warner</title>
  <meta name="description" content="Case study: ${desc}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${title} · Rebekah Warner">
  <meta property="og:description" content="${desc}">
  <meta property="og:image" content="https://USERNAME.github.io/rebekah-portfolio/assets/og-image.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,500&family=IBM+Plex+Mono:wght@400;500&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/styles.css">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='42' fill='%23175E63'/><circle cx='38' cy='40' r='10' fill='%23BCDCD2'/></svg>">
</head>
<body class="case-study">
  <header class="case-header">
    <div class="section-inner">
      <a class="back-link" href="../index.html#projects">&larr; Back to all projects</a>
      <h1>${title}</h1>
      <ul class="tags">
        ${tags}
      </ul>
    </div>
  </header>

  <main class="case-body" data-case="${R.escapeHTML(p.slug)}">
    <div class="section-inner">
      <!-- BUILD:case-study:start -->
      <!-- BUILD:case-study:end -->
    </div>
  </main>

  <footer class="case-footer">
    <div class="section-inner">
      <p><a href="../index.html">&larr; Rebekah Warner</a> &middot; <a href="mailto:rebekahrwarner@protonmail.com">rebekahrwarner@protonmail.com</a> &middot; <a data-social="github" href="${SITE.github}" rel="me noopener noreferrer" target="_blank">GitHub</a> <a data-social="linkedin" href="${SITE.linkedin}" rel="me noopener noreferrer" target="_blank">LinkedIn</a> &middot; <a data-social="resume" href="../${SITE.resume}" target="_blank" rel="noopener noreferrer">Resume</a></p>
    </div>
  </footer>

  <script src="../js/site.js"></script>
  <script src="../js/render.js"></script>
  <script src="../js/main.js"></script>
</body>
</html>
`;
  }

  /* ---------- Wire up ---------- */
  $("f-github").value = state.site.github || "";
  $("f-linkedin").value = state.site.linkedin || "";
  $("f-resume").value = state.site.resume || "";

  document
    .querySelectorAll(".editor-form input, .editor-form textarea, .editor-form select")
    .forEach((el) => {
      if (el.id === "f-picker" || el.id === "f-import") return;
      el.addEventListener("input", () => {
        if (el.id === "f-slug") slugTouched = true;
        refresh();
        if (el.id === "f-title") rebuildPicker();
      });
    });

  $("f-picker").addEventListener("change", (e) => {
    currentIndex = parseInt(e.target.value, 10) || 0;
    fillForm();
    renderPreview();
  });

  $("b-new").addEventListener("click", () => {
    state.projects.push(blankProject());
    currentIndex = state.projects.length - 1;
    rebuildPicker();
    fillForm();
    renderPreview();
    persist();
    say("New project started. It saves as you type.");
    $("f-title").focus();
  });

  $("b-save").addEventListener("click", () => {
    refresh();
    rebuildPicker();
    say("Saved in this browser. Use the download buttons to publish.");
  });

  $("b-delete").addEventListener("click", () => {
    const p = current();
    if (!confirm(`Remove "${p.title || "(untitled)"}" from the working set?`)) return;
    state.projects.splice(currentIndex, 1);
    if (!state.projects.length) state.projects.push(blankProject());
    currentIndex = Math.max(0, currentIndex - 1);
    rebuildPicker();
    fillForm();
    renderPreview();
    persist();
    say("Removed. Download site.js to make it real.");
  });

  $("b-dl-site").addEventListener("click", () => {
    refresh();
    const bad = state.projects.find((p) => !p.slug || !p.title);
    if (bad) {
      say("Every project needs a title and slug before exporting site.js.");
      return;
    }
    download("site.js", siteJsText());
    say("Downloaded. Replace js/site.js with it, then commit/push.");
  });

  $("b-dl-page").addEventListener("click", () => {
    refresh();
    const p = current();
    if (!p.slug || !p.title) {
      say("This project needs a title and slug first.");
      return;
    }
    download(`${p.slug}.html`, pageShellText(p));
    say(`Downloaded. Drop ${p.slug}.html into the projects/ folder.`);
  });

  $("b-export").addEventListener("click", () => {
    refresh();
    download("portfolio-data.json", JSON.stringify(state, null, 2));
    say("Exported a JSON backup of everything.");
  });

  $("b-import").addEventListener("click", () => $("f-import").click());
  $("f-import").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!data || !Array.isArray(data.projects)) throw new Error("bad shape");
      if (!confirm("Replace the current working set with this file?")) return;
      state = data;
      currentIndex = 0;
      persist();
      $("f-github").value = state.site.github || "";
      $("f-linkedin").value = state.site.linkedin || "";
      rebuildPicker();
      fillForm();
      renderPreview();
      say("Imported.");
    } catch (err) {
      say("That file didn't look like a portfolio export.");
    }
    e.target.value = "";
  });

  /* ---------- Preview tabs ---------- */
  const tabs = { "t-card": "preview-card", "t-case": "preview-case" };
  Object.keys(tabs).forEach((tid) => {
    $(tid).addEventListener("click", () => {
      Object.entries(tabs).forEach(([t, pane]) => {
        const active = t === tid;
        $(t).setAttribute("aria-pressed", String(active));
        $(pane).hidden = !active;
      });
    });
  });

  /* ---------- Go ---------- */
  rebuildPicker();
  fillForm();
  renderPreview();
})();
