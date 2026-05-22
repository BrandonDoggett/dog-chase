# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the game

Open `index.html` directly in a browser — no build step, no server required. For mobile testing, serve it locally:

```bash
python -m http.server 8080
# then open http://localhost:8080
```

## Deploying changes

Every change to `index.html` requires two actions — both should be done together:

```bash
# 1. Deploy to AWS (S3 + CloudFront cache bust)
aws s3 cp index.html s3://dogchase-eldoggosoftware/index.html --content-type "text/html" --cache-control "no-cache" --profile dogchase
aws cloudfront create-invalidation --distribution-id E3DSN9XE0HJ8WL --paths "/*" --profile dogchase

# 2. Push to GitHub
git add index.html && git commit -m "<description>" && git push
```

Live URL: **https://dogchase.eldoggosoftware.com**

## Architecture

The entire game is a single HTML file with inline JS. No bundler, no dependencies except Phaser 3 (CDN) and Nunito font (Google Fonts CDN).

**Scene flow:** `BootScene` → `SelectScene` → `GameScene` → `GameOverScene`

- **BootScene** — generates all sprite textures procedurally using `graphics.generateTexture()`. No image files exist; every visual is drawn with Phaser graphics primitives.
- **SelectScene** — dog/squirrel/world picker. Uses `this.registry` to persist selections across scene restarts. Dog/squirrel swaps use a `_soft=true` registry flag to skip the fade-in (avoids black flash). World swaps do a full fade transition since the background changes.
- **GameScene** — main gameplay. 60-second timer, 5 squirrels active at all times. Squirrel AI has flee/wander states driven by distance to dog. Power-ups spawn on a timer and float with a depleting arc timer.
- **GameOverScene** — shows score, high score (persisted in `localStorage` as `dogchase_hs`), squirrel parade, replay/menu buttons.

## Key constants (top of file)

- `W=480, H=640` — canvas dimensions; Phaser Scale.FIT centers on any screen
- `DOGS`, `SQUIRRELS`, `BGS` — data tables for all selectable options; add entries here to extend
- `STREAKS` — indexed by combo count; `null` entries = no display; `announce:true` triggers full-screen text + camera flash at combo ≥7
- `POWERUPS` — each has a `duration` in seconds; `key:'time'` is instant (+10s), all others set `this.effects[key]` countdown

## Sprite drawing

All sprites are drawn in `drawDog()`, `drawSquirrel()`, `drawTree()` using two helpers:
- `ol(g, alpha=0.20)` — sets dark fill for a soft outline layer drawn *before* the main shape
- `fl(g, color, alpha=1)` — sets fill color for the main shape

Pattern: draw outline shape slightly larger → draw fill shape on top. Alpha 0.20 keeps outlines subtle.

Gradients use `fillGradientStyle(top, top, bot, bot, 1)` — same color for left/right corners to avoid the Phaser diamond artifact.

## UI conventions

- **Double-text drop shadow** — draw text at `(x+2, y+2)` in dark, then at `(x, y)` in light, at depths 1 and 2. Avoids Phaser stroke rendering artifacts.
- **Hit areas** — interactive zones use invisible `this.add.rectangle(..., 0, 0)` at a higher depth than visuals, not the graphics objects themselves.
- **Card layout** — `CX = [60, 180, 300, 420]` centers for 4 cards across W=480 with even margins.
- Flag/composite emoji do not render in Phaser canvas on Windows — use colored pill badges or simple single-codepoint emoji instead.
