# Seeing Machines — project page

Static site, no build step. Three files: `index.html`, `assets/style.css`, `assets/script.js`.

## 1. Preview it locally (before publishing anything)

Easiest option — just double-click `index.html` and it opens in your browser.

If you want it served properly (fonts/paths behave more like production), from this folder run:

```bash
python3 -m http.server 8000
```

then open `http://localhost:8000` in your browser. Ctrl+C to stop.

## 2. Fill in your content

Open `index.html` in any text editor and search for `<!-- REPLACE`. Every one of those
comments marks something to swap for your real content: your name, corpus numbers, atlas
entries, dossier entries, images. Everything else (layout, styling, the pipeline diagram,
the schema table) is already built and doesn't need touching unless you want to.

For **images**: replace a placeholder block that looks like this —
```html
<div class="thumb-placeholder">corpus sample 01</div>
```
— with an actual image tag:
```html
<img src="assets/gallery/your-file.jpg" alt="brief description">
```
Put your real images in a new `assets/gallery/` folder next to `style.css`.

For **atlas entries** (Retrieval Atlas section) and **dossier entries** (Mis-Seeing Dossier
section): copy the existing `.atlas-card` / `.dossier-card` block, paste it again right below
itself, and edit the copy. Repeat until every logged entry from your notebook's exported
`retrieval_atlas.md` / `mis_seeing_dossier.md` is represented.

## 3. Publish to GitHub Pages

1. Create a **new public repository** on GitHub (Pages on free accounts requires public — only
   publish images you're allowed to share publicly).
2. From this folder:
   ```bash
   git init
   git add .
   git commit -m "Seeing Machines project page"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
3. On GitHub: go to your repo → **Settings → Pages** → under "Build and deployment", set
   **Source: Deploy from a branch**, branch **main**, folder **/ (root)** → Save.
4. Wait 1-2 minutes, then your site is live at:
   `https://YOUR_USERNAME.github.io/YOUR_REPO/`

## 4. Get the PDF for submission

Once it's live, open the real URL (not the local file) in Chrome, `Cmd/Ctrl+P` →
**Save as PDF** → save it alongside your notebook. Submit the PDF together with the link,
per the brief.

## Notes

- The hero has a small canvas animation (particles drifting between noise and a faint eye
  shape) — this is decorative/thematic only, it doesn't read any of your data and has no
  dependencies. It automatically turns itself off if the visitor's OS has "reduce motion" set.
- Everything is plain HTML/CSS/JS — no npm install, no build step, nothing to compile.
