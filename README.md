# Machas — 3D concept site

React + Vite + Three.js (React Three Fiber, drei), GSAP + ScrollTrigger, Lenis smooth scroll.

```bash
npm install
npm run dev   # http://localhost:5180
```

## Experience
1. **Loader** — counter tied to texture loading.
2. **Hero / Artist Network** — the 17 artists' work floats as a 3D tunnel joined by network threads; scroll flies the camera through it. Hover = colour returns + name in cursor, click = profile.
3. **Manifesto** — words ink in on scroll, with animated stats.
4. **Roster ring** — a pinned panoramic ring of curved cards around the camera. Scroll or drag to rotate, it snaps to the nearest artist, and you can filter by discipline.
5. **Artist profile** — full-screen panel: disciplines, base, collaborations, a short bio, works and a commission CTA.
6. **Consultancy** — three services · **Selected work** hover list with a floating preview · **Clients** marquee · **Contact**.

## Content
All copy, artists and images live in `src/data.js`.

## Images
Artwork from itsmachas.com is bundled in `public/art-local/`. It is © the respective artists / Machas Ltd and is included only to illustrate this concept pitch.

## Deploy
Pushing to `main` builds and publishes to GitHub Pages via `.github/workflows/deploy.yml`.
The site is served under `/machas-concept/` (see `base` in `vite.config.js`).

## Key files
- `src/three/ArtMaterial.js` — the shared shader (cover-fit, bend, hover, velocity, fog)
- `src/three/NetworkScene.jsx` — hero tunnel
- `src/three/RingScene.jsx` — roster ring
