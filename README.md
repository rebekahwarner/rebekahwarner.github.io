# rebekah-portfolio-trench

The trench variant: a cinematic full-viewport descent modeled on space-journey portfolios. One continuous water column, full-screen scenes with ghost section numbers, projects as numbered rows, and the skills grown into a reef of glowing tool nodes. The daylight watercolor original lives in `../rebekah-portfolio/`.

My personal data science portfolio — a static site (plain HTML/CSS/JS, no build step) designed around a watercolor-and-ocean theme. The page deepens in color as you scroll like descending on a dive, project cards expand in place into full case studies, and the hero has live water (light shafts + bubbles) that switches off under `prefers-reduced-motion`.

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

Commit and push; done. Chart images go in `assets/` — reference them by filename in the editor.

Your GitHub/LinkedIn URLs also live in the editor (or hand-edit the `SITE` object in `js/site.js`). The links stay hidden on the site until a URL is filled in.

Text fields support two formatting marks: `**bold**` and `` `code` ``.

## Add a project by hand (the manual way)

1. Add an object to `PROJECTS` in `js/site.js` (copy an existing one's shape).
2. Copy `projects/_template.html` to `projects/<slug>.html` and fill in the title/description placeholders.
3. Optionally add the new page to the `<noscript>` list in `index.html`.

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

Any other static host (Netlify, Cloudflare Pages) works the same way — there's no build step.

## Structure

```
index.html                  the single scrolling page
editor.html                 project editor (form + live preview, unlinked)
projects/                   one shell page per project (+ _template.html)
js/site.js                  ← all content lives here (links + project data)
js/render.js                shared card/case-study rendering
js/main.js                  site behavior: expansion, gauge, counters, skills notes
js/water.js                 hero canvas animation (rays + bubbles)
js/editor.js                editor logic (localStorage drafts, downloads)
css/styles.css              all styling; palette variables at the top
assets/                     og-image.png and chart/screenshot images
.nojekyll                   tells GitHub Pages to serve files as-is
```
