// PWA smoke test: serves dist/ locally, then checks that the game boots, the
// service worker takes over, and the game still loads with the server gone.
// Usage: npm run build && npm run smoke   (screenshots land in .smoke/)
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";

const ROOT = resolve("dist");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".webmanifest": "application/manifest+json",
  ".png": "image/png", ".woff2": "font/woff2" };

const server = createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const file = normalize(join(ROOT, path === "/" ? "index.html" : path));
  if (!file.startsWith(ROOT)) return res.writeHead(403).end();
  try {
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": TYPES[extname(file)] || "application/octet-stream", "Cache-Control": "no-cache" }).end(body);
  } catch { res.writeHead(404).end(); }
});
await new Promise(r => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}/`;

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

// Taps a point given in game coordinates (the canvas is 480x640, scaled to fit).
async function tapGame(x, y) {
  const box = await page.locator("canvas").boundingBox();
  const s = box.width / 480;
  await page.mouse.click(box.x + x * s, box.y + y * s);
}

await page.goto(base);
await page.waitForSelector("canvas");
await page.waitForTimeout(1800);
await page.screenshot({ path: ".smoke/1-name.png" });
check("Nunito font loads from our own server", await page.evaluate(() => document.fonts.check("900 16px Nunito")));
check("service worker installs", await page.evaluate(async () => !!(await navigator.serviceWorker.ready).active));

await tapGame(240, 320 + 86); // LET'S GO
await page.waitForTimeout(900);
await page.screenshot({ path: ".smoke/2-select.png" });
check("LET'S GO saves a generated leaderboard name",
  await page.evaluate(() => isValidName(localStorage.getItem("dogchase_name"))));

await page.reload();
await page.waitForSelector("canvas");
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
await page.waitForSelector("canvas");
await page.waitForTimeout(1800);
await page.screenshot({ path: ".smoke/3-offline.png" });
check("game loads with no network", await page.evaluate(() => typeof Phaser !== "undefined" && document.fonts.check("900 16px Nunito")));

const unexpected = external.filter(u => !/\.execute-api\.[a-z0-9-]+\.amazonaws\.com\/|localhost:3001/.test(u));
check("no requests to third-party hosts", unexpected.length === 0, unexpected.join(", "));
const realErrors = errors.filter(e => !/Failed to load resource|net::ERR_|Failed to fetch/i.test(e));
check("no JavaScript errors", realErrors.length === 0, realErrors.join(" | "));

await browser.close();
console.log(failed ? `\n${failed} check(s) failed` : "\nAll checks passed");
process.exit(failed ? 1 : 0);
