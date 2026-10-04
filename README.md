# FluxFrame Studio — Motion Video Generator

A modern, browser-native procedural motion video generator powered by **WebGL GLSL Shaders**, **Canvas 2D Compositing**, **Web Audio API**, and **MediaRecorder**.

---

## Features

- **Studio Visual Styles**:
  - **Silk Flow**: Fluid, luxury mesh gradient with organic motion.
  - **Obsidian**: Deep, darkroom cinematic atmosphere with ambient bokeh lighting.
  - **Prism Glass**: Refractive iridescent light waves with subtle dispersion.
  - **Editorial**: Minimalist architectural lighting and clean modern gradient.
- **2D Layer Compositor**: Modern kinetic typography, soft studio lighting, atmospheric vignettes, and logo overlays.
- **Logo / Watermark Embedding**: Upload PNG/SVG logos with auto-scaling and positioning.
- **Generative Audio Soundtrack**: Harmonic ambient pad synthesized via Web Audio API and embedded directly into the exported WebM file.
- **Segmented Controls & Timeline**: Quick 1-click toggles for aspect ratios (`16:9`, `9:16`, `1:1`), durations (`4s`, `5s`, `8s`), and timeline scrubbing.
- **Curated Color Moods**: Electric Indigo, Ocean Cyan, Sunset Coral, Emerald Glow, Amber Gold, plus custom color picker.
- **Zero Backend**: 100% private, client-side GPU accelerated.

---

## Local Run

Open [index.html](file:///c:/Users/jojin/Downloads/fluxframe-video-generator/index.html) in any modern browser, or run:

```bash
# Node.js
npx serve .

# Python
python -m http.server 3000
```

---

## Deploy to Vercel (No Cloudflare Needed!)

FluxFrame is a static client-side web application.

```bash
npx vercel
```
Or push to GitHub and deploy via the [Vercel Dashboard](https://vercel.com).
