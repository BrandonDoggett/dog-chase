// Records Poki's animated thumbnail from real gameplay.
// Usage: npm run build:poki && npm run thumbnail:video   → store/thumbnail.mp4
//
// Poki's rules: 1:1, 1080x1080 or larger, .mp4, 50fps or more, 4 to 6 seconds,
// muted, under 100MB, no cursor, and the action centred. So we record the wide
// Poki build, keep its centre square, and steer the dog from inside the page —
// setting the same target the touch controls set — so no pointer ring shows.
import { chromium } from "playwright";
import { writeFileSync, mkdirSync, statSync } from "node:fs";
import { serveDist } from "./serve-dist.mjs";

const SECONDS = 5.2, FPS = 50, SIZE = 1080;

const { server, base } = await serveDist("dist-poki");
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
await ctx.addInitScript(() => localStorage.setItem("dogchase_name", "ZoomyCorgi7"));
await ctx.route(url => url.origin !== new URL(base).origin, route => route.abort());
const page = await ctx.newPage();

await page.goto(base);
await page.waitForFunction(() => window.dogChase?.scene.isActive("Select"), null, { timeout: 30000 });
// Straight into a round, in the default dog and yard, as Poki ask.
await page.evaluate(() => { window.dogChase.scene.stop("Select"); window.dogChase.scene.start("Game"); });
await page.waitForFunction(() => window.dogChase?.scene.isActive("Game"), null, { timeout: 20000 });
await page.waitForTimeout(900); // let the fade-in finish and a power-up drift in

const base64 = await page.evaluate(async ({ seconds, fps, size }) => {
  const game = window.dogChase, scene = game.scene.getScene("Game"), src = game.canvas;

  // A window that follows the dog, inside the grass only: the HUD bars top and
  // bottom would read as the letterboxing Poki forbid.
  const HUD_TOP = 52, HUD_BOTTOM = 44, WIN = 420;
  const maxY = src.height - HUD_BOTTOM - WIN;

  // The touch indicator is this game's cursor, and Poki want no cursor.
  for (const part of ["touchLine", "touchRingOuter", "touchRingInner"]) scene[part]?.setVisible(false);

  const out = document.createElement("canvas");
  out.width = out.height = size;
  const paint = out.getContext("2d");

  let running = true;
  const frame = () => {
    if (!running) return;
    // Chase the nearest squirrel: real play, steered the way a finger would.
    const dog = scene.dog;
    if (dog) {
      let closest = null, best = Infinity;
      for (const d of scene.sqData) {
        if (!d?.sprite?.active) continue;
        const away = Phaser.Math.Distance.Between(dog.x, dog.y, d.sprite.x, d.sprite.y);
        if (away < best) { best = away; closest = d.sprite; }
      }
      if (closest) scene.touch = { x: closest.x, y: closest.y };
    }
    // Keep the fence rails out of frame as well, so no edge reads as a border.
    const cx = Phaser.Math.Clamp((dog ? dog.x : src.width / 2) - WIN / 2, 18, src.width - WIN - 18);
    const cy = Phaser.Math.Clamp((dog ? dog.y : src.height / 2) - WIN / 2, HUD_TOP, Math.max(HUD_TOP, maxY));
    paint.drawImage(src, cx, cy, WIN, WIN, 0, 0, size, size);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  const type = MediaRecorder.isTypeSupported("video/mp4;codecs=avc1") ? "video/mp4;codecs=avc1" : "video/webm";
  const chunks = [];
  const recorder = new MediaRecorder(out.captureStream(fps), { mimeType: type, videoBitsPerSecond: 12000000 });
  recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
  const finished = new Promise(done => { recorder.onstop = done; });
  recorder.start();
  await new Promise(done => setTimeout(done, seconds * 1000));
  recorder.stop();
  running = false;
  await finished;

  const bytes = new Uint8Array(await new Blob(chunks, { type }).arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 8192)
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192));
  return { type, data: btoa(binary) };
}, { seconds: SECONDS, fps: FPS, size: SIZE });

if (!base64.type.startsWith("video/mp4")) {
  console.error(`This browser recorded ${base64.type}, and Poki need .mp4.`);
  process.exit(1);
}

mkdirSync("store", { recursive: true });
writeFileSync("store/thumbnail.mp4", Buffer.from(base64.data, "base64"));

// Decode what we just wrote: the right shape and length, and not a blank frame.
const checked = await page.evaluate(async data => {
  const video = document.createElement("video");
  video.muted = true;
  video.src = "data:video/mp4;base64," + data;
  await new Promise((ok, fail) => { video.onloadedmetadata = ok; video.onerror = () => fail(new Error("the file doesn't decode")); });
  video.currentTime = Math.min(2, video.duration / 2);
  await new Promise(ok => { video.onseeked = ok; });
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  g.drawImage(video, 0, 0, 64, 64);
  const px = g.getImageData(0, 0, 64, 64).data;
  let low = 255, high = 0;
  for (let i = 0; i < px.length; i += 4) { low = Math.min(low, px[i]); high = Math.max(high, px[i]); }
  return { duration: Number(video.duration.toFixed(2)), width: video.videoWidth, height: video.videoHeight, contrast: high - low };
}, base64.data);

const mb = (statSync("store/thumbnail.mp4").size / 1048576).toFixed(1);
console.log(`store/thumbnail.mp4 — ${checked.width}x${checked.height}, ${checked.duration}s, ${mb}MB`);
if (checked.width !== SIZE || checked.height !== SIZE) console.error(`FAIL: Poki want ${SIZE}x${SIZE}`);
if (checked.duration < 4 || checked.duration > 6) console.error("FAIL: Poki want 4 to 6 seconds");
if (checked.contrast < 20) console.error("FAIL: the middle frame looks blank");

await browser.close();
server.close();
