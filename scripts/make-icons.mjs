// Renders the app icons with the game's own sprite code (the game has no image
// files; every sprite is drawn in code).
// Usage: npm run icons   → writes public/icons/*.png (commit the results)
import { chromium } from "playwright";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const game = readFileSync("src/game.js", "utf8");
const end = game.indexOf("// ── Boot");
if (end < 0) throw new Error("Couldn't find the '// ── Boot' marker in src/game.js");
const spriteCode = game.slice(0, end); // data tables + drawDog / drawSquirrel
const phaser = readFileSync("node_modules/phaser/dist/phaser.min.js", "utf8");

// safe: shrink the art into the centre circle Android keeps for maskable icons
const ICONS = [
  { file: "icon-192.png", size: 192, safe: false },
  { file: "icon-512.png", size: 512, safe: false },
  { file: "icon-maskable-512.png", size: 512, safe: true },
  { file: "apple-touch-icon.png", size: 180, safe: false },
];

const html = `<!doctype html><body style="margin:0">
<script src="/phaser.js"></script>
<script>${spriteCode}
window.renderIcon = (S, safe) => new Promise(resolve => {
  const k = safe ? 0.68 : 1, u = S / 512;
  // Put a sprite's centre (cx, cy in its own pixels) at an offset from the icon centre.
  const place = (g, cx, cy, scale, ox, oy) => {
    const s = scale * u * k;
    g.setScale(s).setPosition(S / 2 + ox * u * k - cx * s, S / 2 + oy * u * k - cy * s);
  };
  new Phaser.Game({
    type: Phaser.CANVAS, width: S, height: S, banner: false,
    scene: { create() {
      // Sunny Backyard grass, drawn as thin bands: Phaser's gradient fills are
      // WebGL-only and the icon renders on a plain canvas.
      const C = Phaser.Display.Color, top = C.ValueToColor(BGS[0].gTop), bot = C.ValueToColor(BGS[0].gBot);
      const bg = this.add.graphics();
      for (let y = 0; y < S; y += 2) {
        const c = C.Interpolate.ColorWithColor(top, bot, S, y);
        bg.fillStyle(C.GetColor(c.r, c.g, c.b), 1).fillRect(0, y, S, 2);
      }
      const sq = this.add.graphics(); drawSquirrel(sq, SQUIRRELS[0]); place(sq, 24, 25, 2.6, 136, -156);
      const dog = this.add.graphics(); drawDog(dog, DOGS[0]); place(dog, 36, 32, 5.2, -30, 64);
      this.game.renderer.snapshot(img => resolve(img.src));
    } },
  });
});
</script></body>`;

const browser = await chromium.launch();
mkdirSync("public/icons", { recursive: true });
for (const { file, size, safe } of ICONS) {
  const page = await browser.newPage();
  await page.route("http://icons.local/**", route => route.request().url().endsWith("/phaser.js")
    ? route.fulfill({ contentType: "text/javascript", body: phaser })
    : route.fulfill({ contentType: "text/html", body: html }));
  await page.goto("http://icons.local/");
  const dataUrl = await page.evaluate(([s, sf]) => window.renderIcon(s, sf), [size, safe]);
  writeFileSync(`public/icons/${file}`, Buffer.from(dataUrl.split(",")[1], "base64"));
  console.log(`public/icons/${file}`);
  await page.close();
}
await browser.close();
