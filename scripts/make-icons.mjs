// Renders the app icons and splash screens with the game's own sprite code
// (the game has no image files; every sprite is drawn in code).
// Usage: npm run icons   (commit the results)
//   public/icons/*.png  web app (PWA) icons
//   assets/*.png        sources for the store apps' icons and splash screens
//                       (npm run android:assets turns these into Android resources)
import { chromium } from "playwright";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const game = readFileSync("src/game.js", "utf8");
const end = game.indexOf("// ── Boot");
if (end < 0) throw new Error("Couldn't find the '// ── Boot' marker in src/game.js");
const spriteCode = game.slice(0, end); // data tables + drawDog / drawSquirrel
const phaser = readFileSync("node_modules/phaser/dist/phaser.min.js", "utf8");

// k shrinks the art toward the centre. Android keeps the centre 80% of a
// maskable web icon and only about the centre 60% of an adaptive icon's
// foreground layer. bg: "grass" (the Sunny Backyard gradient), "none", or a colour.
const OUTPUTS = [
  { file: "public/icons/icon-192.png", size: 192, k: 1, bg: "grass" },
  { file: "public/icons/icon-512.png", size: 512, k: 1, bg: "grass" },
  { file: "public/icons/icon-maskable-512.png", size: 512, k: 0.68, bg: "grass" },
  { file: "public/icons/apple-touch-icon.png", size: 180, k: 1, bg: "grass" },
  { file: "assets/icon-only.png", size: 1024, k: 1, bg: "grass" },
  { file: "assets/icon-foreground.png", size: 1024, k: 0.6, bg: "none" },
  { file: "assets/icon-background.png", size: 1024, k: 1, bg: "grass", art: false },
  { file: "assets/splash.png", size: 2732, k: 0.3, bg: 0x0d1117 },
  { file: "assets/splash-dark.png", size: 2732, k: 0.3, bg: 0x0d1117 },
];

const html = `<!doctype html><body style="margin:0">
<script src="/phaser.js"></script>
<script>${spriteCode}
window.renderIcon = (S, k, bg, art) => new Promise(resolve => {
  const u = S / 512;
  // Put a sprite's centre (cx, cy in its own pixels) at an offset from the icon centre.
  const place = (g, cx, cy, scale, ox, oy) => {
    const s = scale * u * k;
    g.setScale(s).setPosition(S / 2 + ox * u * k - cx * s, S / 2 + oy * u * k - cy * s);
  };
  new Phaser.Game({
    type: Phaser.CANVAS, width: S, height: S, banner: false, transparent: true,
    scene: { create() {
      const g = this.add.graphics();
      if (bg === "grass") {
        // Drawn as thin bands: Phaser's gradient fills are WebGL-only.
        const C = Phaser.Display.Color, top = C.ValueToColor(BGS[0].gTop), bot = C.ValueToColor(BGS[0].gBot);
        for (let y = 0; y < S; y += 2) {
          const c = C.Interpolate.ColorWithColor(top, bot, S, y);
          g.fillStyle(C.GetColor(c.r, c.g, c.b), 1).fillRect(0, y, S, 2);
        }
      } else if (typeof bg === "number") {
        g.fillStyle(bg, 1).fillRect(0, 0, S, S);
      }
      if (art) {
        const sq = this.add.graphics(); drawSquirrel(sq, SQUIRRELS[0]); place(sq, 24, 25, 2.6, 136, -156);
        const dog = this.add.graphics(); drawDog(dog, DOGS[0]); place(dog, 36, 32, 5.2, -30, 64);
      }
      this.game.renderer.snapshot(img => resolve(img.src));
    } },
  });
});
</script></body>`;

const browser = await chromium.launch();
for (const { file, size, k, bg, art = true } of OUTPUTS) {
  const page = await browser.newPage();
  await page.route("http://icons.local/**", route => route.request().url().endsWith("/phaser.js")
    ? route.fulfill({ contentType: "text/javascript", body: phaser })
    : route.fulfill({ contentType: "text/html", body: html }));
  await page.goto("http://icons.local/");
  const dataUrl = await page.evaluate(args => window.renderIcon(...args), [size, k, bg, art]);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, Buffer.from(dataUrl.split(",")[1], "base64"));
  console.log(file);
  await page.close();
}
await browser.close();
