// Renders the Google Play listing graphics from the real game build.
// Usage: npm run build && npm run store   → store/*.png (commit them)
//   feature-graphic.png   1024x500, required by Play
//   screenshot-*.png      1080x1440 phone screenshots (3:4, the game's own shape)
// The leaderboard API is blocked throughout, so no score gets submitted and no
// real player names end up in a screenshot. Plays one full 60-second round.
import { chromium } from "playwright";
import { mkdir, readFile } from "node:fs/promises";
import { serveDist } from "./serve-dist.mjs";

const { server, base } = await serveDist();
await mkdir("store", { recursive: true });
const browser = await chromium.launch();

// ── Feature graphic ──────────────────────────────────────────────────────────
const art = (await readFile("assets/icon-foreground.png")).toString("base64");
const promo = await browser.newPage({ viewport: { width: 1024, height: 500 } });
await promo.goto(base); // same origin, so the font files load
await promo.setContent(`<!doctype html><style>
  @font-face { font-family: Nunito; font-weight: 900; src: url(${base}fonts/nunito-900.woff2) format('woff2'); }
  @font-face { font-family: Nunito; font-weight: 700; src: url(${base}fonts/nunito-700.woff2) format('woff2'); }
  body { margin: 0; width: 1024px; height: 500px; overflow: hidden; display: flex; align-items: center;
         font-family: Nunito, Arial, sans-serif; background: linear-gradient(#90CC80, #3A7830); }
  .text { padding-left: 64px; flex: none; }
  h1 { margin: 0; white-space: nowrap; font-size: 88px; font-weight: 900; line-height: 1;
       color: #FFF5DD; text-shadow: 4px 4px 0 #1A3010; }
  p { margin: 20px 0 0; font-size: 30px; font-weight: 700; color: #F0FFE8; text-shadow: 2px 2px 0 rgba(0,0,0,.28); }
  img { width: 560px; height: 560px; margin-left: -60px; flex: none; }
</style><div class="text"><h1>DOG CHASE!</h1><p>Pick a pup. Chase squirrels.<br>Beat the clock.</p></div>
<img src="data:image/png;base64,${art}">`);
await promo.evaluate(() => document.fonts.ready);
await promo.screenshot({ path: "store/feature-graphic.png" });
console.log("store/feature-graphic.png");
await promo.close(); // keep the game the only page, so nothing else competes with it

// ── Phone screenshots ────────────────────────────────────────────────────────
// A 480x640 viewport matches the game canvas exactly, so game coordinates are
// page coordinates, and 2.25x gives 1080x1440 images.
const ctx = await browser.newContext({ viewport: { width: 480, height: 640 }, deviceScaleFactor: 2.25, isMobile: true, hasTouch: true });
await ctx.addInitScript(() => localStorage.setItem("dogchase_name", "ZoomyCorgi7"));
await ctx.route(url => url.origin !== new URL(base).origin, route => route.abort());
const page = await ctx.newPage();
await page.bringToFront();
const isActive = key => page.evaluate(k => !!window.dogChase?.scene.isActive(k), key);
const waitForScene = key => page.waitForFunction(k => window.dogChase?.scene.isActive(k), key, { timeout: 120000 });
const hud = () => page.evaluate(() => {
  const g = window.dogChase.scene.getScene("Game");
  return `score ${g.score}, ${g.timeLeft}s left`;
});

await page.goto(base);
await waitForScene("Select");
await page.waitForTimeout(600);   // let the fade-in finish
await page.mouse.click(420, 160); // pick the Corgi (the pick screen redraws itself)
await page.waitForTimeout(800);
await page.screenshot({ path: "store/screenshot-1-select.png" });
console.log("store/screenshot-1-select.png");

await page.mouse.click(240, 500); // PLAY!
await waitForScene("Game");
// Hold the pointer down and sweep the yard so the dog chases squirrels around.
await page.mouse.move(240, 320);
await page.mouse.down();
const start = Date.now();
const deadline = start + 150000; // a round is 60s, plus 10s per clock power-up
let playShot = false;
for (let i = 0; Date.now() < deadline && !(i % 20 === 0 && await isActive("GameOver")); i++) {
  const t = (Date.now() - start) / 1000;
  await page.mouse.move(240 + 190 * Math.sin(t * 0.9), 330 + 250 * Math.sin(t * 0.55), { steps: 4 });
  if (!playShot && t > 20) {
    await page.screenshot({ path: "store/screenshot-2-play.png" });
    console.log(`store/screenshot-2-play.png (${await hud()})`);
    playShot = true;
  }
  await page.waitForTimeout(50);
}
await page.mouse.up();

if (await isActive("GameOver")) {
  await page.waitForTimeout(1500); // results animate in
  await page.screenshot({ path: "store/screenshot-3-results.png" });
  console.log("store/screenshot-3-results.png");
} else {
  console.log(`warning: the round hadn't ended after 150s (${await hud()}); no results screenshot`);
}

await browser.close();
server.close();
