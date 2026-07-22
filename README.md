# rebekah-portfolio-trench

The trench variant: a cinematic full-viewport descent modeled on space-journey portfolios. One continuous water column, full-screen scenes with ghost section numbers, projects as numbered rows, and the skills grown into a reef of glowing tool nodes. The daylight watercolor original lives in `../rebekah-portfolio/`.

My personal data science portfolio — a static site (plain HTML/CSS/JS, no frameworks or dependencies) designed around a watercolor-and-ocean theme. There is one build step: `node build.js`, which bakes the project content into the HTML. See [Content and the build step](#content-and-the-build-step). The page deepens in color as you scroll like descending on a dive, project cards expand in place into full case studies, and the hero has live water (light shafts + bubbles) that switches off under `prefers-reduced-motion`.

## Run it locally

No install needed. From this folder:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Add or edit projects (the easy way)

Open **<http://localhost:8000/editor.html>** (or `/editor.html` on the live site — it's unlinked and noindexed, but not secret). It gives you:

- a form for everything: title, one-liner, metric, tags, problem / approach / outcome, code snippet, chart image
- a live preview of the card and the case study as you type
- autosave to your browser (drafts survive reloads), plus Export/Import JSON backups

Publishing is two downloads:

1. **Download site.js** → replace `js/site.js` in the repo.
2. **Download page** (for a new project) → drop the file into `projects/`.

Then run `node build.js`, commit, and push. Chart images go in `assets/` — reference them by filename in the editor.

Your GitHub/LinkedIn URLs also live in the editor (or hand-edit the `SITE` object in `js/site.js`). They are written into the HTML as well, so crawlers and ATS parsers can read them without running JavaScript; `js/main.js` keeps the two in sync and hides any link that has no destination in either place.

Text fields support two formatting marks: `**bold**` and `` `code` ``.

## Add a project by hand (the manual way)

1. Add an object to `PROJECTS` in `js/site.js` (copy an existing one's shape).
2. Copy `projects/_template.html` to `projects/<slug>.html` and fill in the title/description placeholders.
3. Run `node build.js` to render the new project into `index.html` and its own page.

## Content and the build step

All project content lives in `js/site.js`. The HTML files carry a static copy of it, because content that only appears after JavaScript runs is invisible to search crawlers, link-preview bots, and applicant tracking systems.

`build.js` renders `js/site.js` through the same `js/render.js` the browser uses, and writes the result between the `<!-- BUILD:*:start -->` / `<!-- BUILD:*:end -->` markers in `index.html` and `projects/*.html`. Nothing outside those markers is touched, so it is safe to re-run: if nothing changed it reports `unchanged` and writes nothing.

**After every edit to `js/site.js`, run:**

```sh
node build.js
```

If you skip it, your edit does not appear anywhere: the pages keep serving the previous text, to you as well as to crawlers. `js/main.js` renders from `js/site.js` only when the baked markup is missing entirely, so it cannot rescue content that is merely out of date. To check at a glance:

```sh
grep -c 'class="project-card"' index.html   # expect 4, not 0
```

The build also reports which project repos are still unpublished; those render an honest "going up shortly" note instead of a dead link. Publish one, set `published: true` in `js/site.js`, and re-run.

Node is not a dependency of the site, only of this script. The published site is plain static files.

## Deploy to GitHub Pages

1. Search the HTML files for **`USERNAME`** and replace it with your GitHub username (those are the Open Graph URLs for link previews).
2. Create a new **public** repo on GitHub (e.g. `rebekah-portfolio`, no README).
3. From this folder:

   ```sh
   git init
   git add .
   git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/USERNAME/rebekah-portfolio.git
   git push -u origin main
   ```

4. On GitHub: **Settings → Pages → Build and deployment**, Source = **Deploy from a branch**, branch **main**, folder **/ (root)**. Save.
5. The site appears at `https://USERNAME.github.io/rebekah-portfolio/` in a minute or two. Future updates are commit + push.

Any other static host (Netlify, Cloudflare Pages) works the same way. The generated HTML is committed to the repo, so the host only ever serves static files and never needs to run `build.js` itself.

## Structure

```
index.html                  the single scrolling page
editor.html                 project editor (form + live preview, unlinked)
projects/                   one shell page per project (+ _template.html)
js/site.js                  ← all content lives here (links + project data)
build.js                    bakes site.js into the HTML; run after every site.js edit
js/render.js                shared card/case-study rendering
js/main.js                  site behavior: expansion, gauge, counters, skills notes
js/water.js                 hero canvas animation (rays + bubbles)
js/snow.js                  marine-snow canvas; drifts with scroll, whole page
js/scenes.js                reveals each full-screen scene as you reach it
js/editor.js                editor logic (localStorage drafts, downloads)
css/styles.css              all styling; palette variables at the top
assets/                     og-image.png and chart/screenshot images
.nojekyll                   tells GitHub Pages to serve files as-is
```
