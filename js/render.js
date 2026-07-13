/* Shared rendering used by the site (js/main.js) and the editor
   (editor.html). Project text supports two tiny formatting marks:
   **bold** and `code`. Everything else is escaped. */

(function () {
  "use strict";

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, (c) => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    ));
  }

  function fmt(s) {
    return escapeHTML(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");
  }

  function paras(arr) {
    return (arr || []).filter(Boolean).map((t) => `<p>${fmt(t)}</p>`).join("");
  }

  /* Build the raw pieces of a case study once; the two layouts below
     compose them differently. */
  function buildParts(p, assetPrefix) {
    const cs = p.caseStudy || {};
    const codeHTML =
      cs.code && cs.code.snippet
        ? `<pre><code>${escapeHTML(cs.code.snippet)}</code></pre>`
        : "";

    let approach = "";
    const ap = (cs.approach || []).filter(Boolean);
    const codeAfter =
      cs.code && Number.isInteger(cs.code.afterParagraph)
        ? cs.code.afterParagraph
        : ap.length;
    ap.forEach((t, i) => {
      approach += `<p>${fmt(t)}</p>`;
      if (i + 1 === codeAfter) approach += codeHTML;
    });
    if (!approach.includes("<pre>")) approach += codeHTML;

    let figure = "";
    if (cs.image && cs.image.file) {
      figure = `<figure><img src="${assetPrefix}assets/${escapeHTML(cs.image.file)}" alt="${escapeHTML(cs.image.alt || "")}" loading="lazy">`;
      if (cs.image.caption) figure += `<figcaption>${fmt(cs.image.caption)}</figcaption>`;
      figure += `</figure>`;
    }

    return {
      problem: paras(cs.problem),
      approach,
      tools: cs.tools ? `<p>${fmt(cs.tools)}</p>` : "",
      outcome: paras(cs.outcome),
      figure,
    };
  }

  /* Flat layout: standalone case-study pages and the editor preview. */
  function caseStudyBodyHTML(p, opts) {
    const { assetPrefix = "", headingTag = "h2" } = opts || {};
    const parts = buildParts(p, assetPrefix);
    const H = headingTag;
    let html = "";
    if (parts.problem) html += `<${H}>The problem</${H}>${parts.problem}`;
    if (parts.approach) html += `<${H}>My approach</${H}>${parts.approach}`;
    if (parts.tools) html += `<${H}>Tools</${H}>${parts.tools}`;
    if (parts.outcome) html += `<${H}>The outcome</${H}>${parts.outcome}`;
    html += parts.figure;
    return html;
  }

  /* Split layout: the in-place expansion on the home page. Narrative on
     the left, tools + outcome as a sidebar, figure full width below. */
  function caseStudySplitHTML(p, opts) {
    const { assetPrefix = "", pagePrefix = "projects/" } = opts || {};
    const parts = buildParts(p, assetPrefix);
    const label = (t) => `<p class="cs-label">${t}</p>`;
    let main = "";
    if (parts.problem) main += label("The problem") + parts.problem;
    if (parts.approach) main += label("My approach") + parts.approach;
    let side = "";
    if (parts.outcome)
      side += `<div class="cs-outcome">${label("The outcome")}${parts.outcome}</div>`;
    if (parts.tools) side += label("Tools") + parts.tools;
    side += `<p class="case-standalone"><a href="${pagePrefix}${escapeHTML(p.slug)}.html">Open as its own page</a></p>`;
    let html = `<div class="cs-grid"><div class="cs-main">${main}</div><aside class="cs-side">${side}</aside></div>`;
    if (parts.figure) html += `<div class="cs-figure">${parts.figure}</div>`;
    return html;
  }

  /* One project card. Expansion behavior is wired up in main.js. */
  function projectCardHTML(p, opts) {
    const { pagePrefix = "projects/" } = opts || {};
    return `
      <article class="project-card" data-slug="${escapeHTML(p.slug)}">
        <div class="card-head">
          <div class="card-wash ${escapeHTML(p.wash || "wash-teal")}" aria-hidden="true">
            <p class="card-metric"><strong>${escapeHTML(p.metric.value)}</strong><span>${escapeHTML(p.metric.label)}</span></p>
          </div>
          <div class="card-body">
            <h3><button type="button" class="card-toggle" aria-expanded="false" aria-controls="case-${escapeHTML(p.slug)}">${escapeHTML(p.title)}</button></h3>
            <p class="card-oneliner">${fmt(p.oneLiner)}</p>
            <ul class="tags">${(p.tags || []).map((t) => `<li>${escapeHTML(t)}</li>`).join("")}</ul>
            <span class="card-cta" aria-hidden="true"><span class="cta-open">Open the case study</span><span class="cta-close">Close</span> <span class="cta-arrow">&#8964;</span></span>
          </div>
        </div>
        <div class="card-case" id="case-${escapeHTML(p.slug)}">
          <div class="card-case-inner">
            <div class="case-pad">
              ${caseStudySplitHTML(p, { assetPrefix: "", pagePrefix })}
            </div>
          </div>
        </div>
      </article>`;
  }

  window.PortfolioRender = {
    escapeHTML,
    fmt,
    caseStudyBodyHTML,
    caseStudySplitHTML,
    projectCardHTML,
  };
})();
