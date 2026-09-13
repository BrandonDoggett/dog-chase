# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the game

```bash
npm install
npm run build                      # writes dist/; set API_URL to use the real leaderboard
python -m http.server 8080 -d dist # then open http://localhost:8080
```

The production API only allows the live origin (CORS), so the leaderboard shows "Could not load scores" locally. That's expected.

## Tests

- `npm test`: unit tests (Node's built-in runner) for leaderboard validation and the check that the game and the Lambda agree on the dog/squirrel catalog. CI runs them before every deploy.
- `npm run smoke`: run after `npm run build`. Headless Chromium checks that the game boots, the service worker takes over, the game loads with no network, and nothing is fetched from third-party hosts. Screenshots go to `.smoke/`.

## Deploying changes

- **Site:** push to `main`. GitHub Actions runs the tests, builds `dist/` with the `API_URL` secret, uploads to S3 (`dogchase-eldoggosoftware`), and invalidates CloudFront (`E3DSN9XE0HJ8WL`). Don't upload by hand: a local build without `API_URL` points the leaderboard at localhost.
- **Leaderboard Lambda:** `npm run deploy:lambda` runs the tests, zips `lambda/`, and updates `dogchase-api` using the `dogchase` AWS profile. CI does not deploy it.
- **Icons:** `npm run icons` redraws `public/icons/*.png` from the sprite code. Commit the PNGs.

Live URL: **https://dogchase.eldoggosoftware.com**

## Android app

The store app wraps the same `dist/` build with Capacitor 8 in `android/`. The app id is `com.eldoggosoftware.dogchase`, and it can never change once the app is on Google Play. No Android Studio is needed:

- **Toolchain:** JDK 21 at `%LOCALAPPDATA%\Programs\jdk-21`, Android SDK at `%LOCALAPPDATA%\Android\Sdk`. `scripts/android.mjs` points Gradle at both; override with `JAVA_HOME` / `ANDROID_HOME`.
- **Build:** `npm run android:apk` builds a debug APK for a phone or the emulator. `npm run android:bundle` builds the signed release `.aab` for Google Play. Both rebuild `dist/` and run `cap sync` first. Output goes to `android/app/build/outputs/`.
- **API URL:** local builds read `API_URL` from `.env` (copy `.env.example`). The Lambda's CORS list in `lambda/cors.mjs` includes the app origins `https://localhost` (Android) and `capacitor://localhost` (iOS).
- **Signing:** release builds use the Play upload key in `~/.eldoggo/dogchase/` (`upload.jks` + `upload.properties`), outside the repo. Keep a backup of both. Play App Signing holds the real app-signing key.
- **Versions:** bump `versionCode` (and `versionName`) in `android/app/build.gradle` before every Play upload.
- **Icons and splash:** `npm run icons` redraws `assets/*.png`, then `npm run android:assets` regenerates the Android resources.
- **Emulator:** an Android 16 virtual phone named `dogchase` is installed. Start it with `%LOCALAPPDATA%\Android\Sdk\emulator\emulator.exe -avd dogchase` (add `-no-window -gpu swiftshader_indirect` to run it headless), then install with `adb install -r android\app\build\outputs\apk\debug\app-debug.apk`.
- **Android smoke test:** `npm run android:smoke` starts the installed debug app fresh and checks it from inside its WebView over DevTools: name screen, one canvas, local font, no service worker, the leaderboard loading, and no screen relaunch at startup. Screenshots go to `.smoke/`.
- **Store listing:** `store/listing.md` has the Play copy and suggested App content answers. `npm run store` renders the feature graphic and screenshots from the real game. The privacy policy is `public/privacy.html`, served at `/privacy.html` and linked from the pick screen. Google Play requires it both in the listing and inside the app.
- The service worker is skipped inside the app (`window.Capacitor` is set there), since the app already ships every file.

## Architecture

The game is one script, `src/game.js`, on Phaser 3. `build.mjs` minifies it and inlines it into `dist/index.html`. Phaser and the Nunito font are copied from `node_modules` and served from our own origin, with no CDNs, so the game works offline and inside app-store builds.

The site is an installable PWA: `public/manifest.webmanifest` plus icons, and `dist/sw.js` (generated from `src/sw.template.js`) precaches every file. Page loads are network-first so new deploys show up right away; the leaderboard API is never cached.

**Leaderboard names** are generated from the word lists in `lambda/shared.mjs`, never typed, because the board is public and the game appeals to kids. `build.mjs` inlines `shared.mjs` ahead of `game.js`, and the Lambda checks names, dogs, and squirrels against the same file. Only append words to the lists; removing one invalidates names players already have. When you add a dog or squirrel, add its name to `DOG_NAMES` / `SQUIRREL_NAMES` and redeploy the Lambda (`npm test` fails on a mismatch).

**Daily Chase** lives in `lambda/shared.mjs`: the UTC date picks the day's dog, squirrel and yard, and seeds where squirrels and power-ups appear, so everyone plays the same round. Daily scores are stored under the day key `daily-<date>` and read back with `period=challenge`, which keeps them off the free-play boards, and the Lambda rejects a daily score played with the wrong dog or squirrel. The results screen offers the three-line summary from `shareText()`.

**Your dog** is the fifth card on the pick screen: `CustomiseScene` recolours one of the four shapes and names it (`cleanDogName()` in `lambda/shared.mjs`). It lives in `localStorage` under `dogchase_mydog` and is never sent anywhere. It keeps its shape's speed and reach and reports that breed to the leaderboard, so `cfg.name` stays the breed and `cfg.label` is the player's name for it; saving redraws the `dog_my` texture. The Daily Chase always forces the day's dog, so a custom dog can't affect it.

**Backend:** API Gateway `kcgalwlhh3` (stage `prod`, throttled to 25 req/s, burst 50) → Lambda `dogchase-api` → DynamoDB `dogchase-scores` (TTL on `ttl` expires used session tokens).

**Scene flow:** `BootScene` → `NameScene` (first run only) → `SelectScene` → `GameScene` → `GameOverScene`, plus `LeaderboardScene`.

- **BootScene** generates all sprite textures procedurally using `graphics.generateTexture()`. No image files exist; every visual is drawn with Phaser graphics primitives.
- **SelectScene** is the dog/squirrel/world picker. Uses `this.registry` to persist selections across scene restarts. Dog/squirrel swaps use a `_soft=true` registry flag to skip the fade-in (avoids black flash). World swaps do a full fade transition since the background changes.
- **GameScene** is the main gameplay. 60-second timer, 5 squirrels active at all times. Squirrel AI has flee/wander states driven by distance to dog. Power-ups spawn on a timer and float with a depleting arc timer.
- **GameOverScene** shows score, high score (persisted in `localStorage` as `dogchase_hs`), squirrel parade, replay/menu buttons.

## Key constants (top of file)

- `W=480, H=640`: canvas dimensions; Phaser Scale.FIT centers on any screen
- `DOGS`, `SQUIRRELS`, `BGS`: data tables for all selectable options; add entries here to extend
- `STREAKS`: indexed by combo count; `null` entries = no display; `announce:true` triggers full-screen text + camera flash at combo ≥7
- `POWERUPS`: each has a `duration` in seconds; `key:'time'` is instant (+10s), all others set `this.effects[key]` countdown

## Sprite drawing

All sprites are drawn in `drawDog()`, `drawSquirrel()`, `drawTree()` using two helpers:
- `ol(g, alpha=0.20)` sets dark fill for a soft outline layer drawn *before* the main shape
- `fl(g, color, alpha=1)` sets fill color for the main shape

Pattern: draw outline shape slightly larger → draw fill shape on top. Alpha 0.20 keeps outlines subtle.

Gradients use `fillGradientStyle(top, top, bot, bot, 1)`, with the same color for left/right corners to avoid the Phaser diamond artifact.

`scripts/make-icons.mjs` reuses everything above the `// ── Boot` marker to draw the app icons, so keep that marker.

## UI conventions

- **Double-text drop shadow**: draw text at `(x+2, y+2)` in dark, then at `(x, y)` in light, at depths 1 and 2. Avoids Phaser stroke rendering artifacts.
- **Hit areas**: interactive zones use invisible `this.add.rectangle(..., 0, 0)` at a higher depth than visuals, not the graphics objects themselves.
- **Card layout**: `CX = [60, 180, 300, 420]` centers for 4 cards across W=480 with even margins.
- Flag/composite emoji do not render in Phaser canvas on Windows. Use colored pill badges or simple single-codepoint emoji instead.
