// PWA smoke test: serves dist/ locally, then checks that the game boots, the
// service worker takes over, and the game still loads with the server gone.
// Usage: npm run build && npm run smoke   (screenshots land in .smoke/)
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { serveDist } from "./serve-dist.mjs";

const { server, base } = await serveDist();

let failed = 0;
const check = (name, ok, detail = "") => {
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail && !ok ? `: ${detail}` : ""}`);
};

await mkdir(".smoke", { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const page = await context.newPage();
const errors = [];
page.on("pageerror", e => errors.push(e.message));
page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
// Block every other origin: the real API only allows the production site, and
// anything else showing up here means a CDN dependency crept back in.
const external = [];
await context.route(url => url.origin !== new URL(base).origin, route => { external.push(route.request().url()); route.abort(); });

// The game exposes itself as window.dogChase, so we wait for a scene rather
// than guessing at timings.
const sceneActive = (key, timeout = 30000) =>
  page.waitForFunction(k => window.dogChase?.scene.isActive(k), key, { timeout }).then(() => true, () => false);

// Taps a point given in game coordinates (the canvas is 480x640, scaled to fit).
async function tapGame(x, y) {
  const box = await page.locator("canvas").boundingBox();
  const s = box.width / 480;
  await page.mouse.click(box.x + x * s, box.y + y * s);
}

await page.goto(base);
check("first run shows the name screen", await sceneActive("Name"));
await page.waitForTimeout(400); // let the fade-in finish
await page.screenshot({ path: ".smoke/1-name.png" });
check("Nunito font loads from our own server", await page.evaluate(() => document.fonts.check("900 16px Nunito")));
check("service worker installs", await page.evaluate(async () => !!(await navigator.serviceWorker.ready).active));

await tapGame(240, 320 + 86); // LET'S GO
check("LET'S GO opens the pick screen and saves a generated name",
  await sceneActive("Select") && await page.evaluate(() => isValidName(localStorage.getItem("dogchase_name"))));
await page.waitForTimeout(400);
await page.screenshot({ path: ".smoke/2-select.png" });

const privacyRequest = context.waitForEvent("request", { predicate: r => r.url().endsWith("/privacy.html"), timeout: 5000 })
  .then(r => r.url(), () => null);
await tapGame(480 - 34, 640 - 14); // Privacy link, bottom right of the pick screen
check("pick screen links to the privacy policy", !!(await privacyRequest), "no request for /privacy.html");
for (const p of context.pages()) if (p !== page) await p.close();

await page.reload();
await sceneActive("Select");
check("service worker controls the page after reload", await page.evaluate(() => !!navigator.serviceWorker.controller));

const manifest = await page.evaluate(async () => {
  const href = document.querySelector("link[rel=manifest]").href;
  const m = await (await fetch(href)).json();
  const iconsOk = (await Promise.all(m.icons.map(i => fetch(new URL(i.src, href)).then(r => r.ok)))).every(Boolean);
  return { name: m.name, start: m.start_url, sizes: m.icons.map(i => i.sizes), iconsOk };
});
check("manifest has a name, start_url, and 192 + 512 icons that load",
  manifest.name && manifest.start && manifest.sizes.includes("192x192") && manifest.sizes.includes("512x512") && manifest.iconsOk,
  JSON.stringify(manifest));

// Take the server away entirely, then reload: everything must come from the cache.
await context.setOffline(true);
server.closeAllConnections();
await new Promise(r => server.close(r));
await page.reload();
const offline = await sceneActive("Select");
await page.screenshot({ path: ".smoke/3-offline.png" });
check("game loads with no network", offline && await page.evaluate(() => document.fonts.check("900 16px Nunito")));

const unexpected = external.filter(u =>
  !/\.execute-api\.[a-z0-9-]+\.amazonaws\.com\/|localhost:3001|^https:\/\/dogchase\.eldoggosoftware\.com\/privacy\.html$/.test(u));
check("no requests to third-party hosts", unexpected.length === 0, unexpected.join(", "));
const realErrors = errors.filter(e => !/Failed to load resource|net::ERR_|Failed to fetch/i.test(e));
check("no JavaScript errors", realErrors.length === 0, realErrors.join(" | "));

await browser.close();
console.log(failed ? `\n${failed} check(s) failed` : "\nAll checks passed");
process.exit(failed ? 1 : 0);
