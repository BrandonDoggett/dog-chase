// Renders Poki's static thumbnail from the game's own sprite code.
// Usage: npm run thumbnail   → store/thumbnail.png (1080x1080)
//
// Poki's rules: square, at least 628x628, full-bleed with no borders, padding or
// letterboxing, no text, and it should show the main character mid-action rather
// than standing still. Their site background is #83FFE7, so the art stays green.
import { chromium } from "playwright";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const SIZE = 1080;
const game = readFileSync("src/game.js", "utf8");
const end = game.indexOf("// ── Boot");
if (end < 0) throw new Error("Couldn't find the '// ── Boot' marker in src/game.js");
const spriteCode = game.slice(0, end); // data tables + drawDog / drawSquirrel / drawTree
const phaser = readFileSync("node_modules/phaser/dist/phaser.min.js", "utf8");

const html = `<!doctype html><body style="margin:0">
<script src="/phaser.js"></script>
<script>${spriteCode}
window.renderThumb = S => new Promise(resolve => {
  const u = S / 1080;
  const place = (g, cx, cy, scale, x, y) => {
    const s = scale * u;
    g.setScale(s).setPosition(x * u - cx * s, y * u - cy * s);
  };
  new Phaser.Game({
    type: Phaser.CANVAS, width: S, height: S, banner: false,
    scene: { create() {
      const yard = BGS[0];
      // Grass, drawn as bands: Phaser's gradient fills are WebGL-only.
      const C = Phaser.Display.Color, top = C.ValueToColor(yard.gTop), bot = C.ValueToColor(yard.gBot);
      const bg = this.add.graphics();
      for (let y = 0; y < S; y += 2) {
        const c = C.Interpolate.ColorWithColor(top, bot, S, y);
        bg.fillStyle(C.GetColor(c.r, c.g, c.b), 1).fillRect(0, y, S, 2);
      }
      // The checkered mown-grass pattern from the yard itself.
      const check = this.add.graphics();
      check.fillStyle(0x000000, 0.03);
      const tile = 44 * u * 2;
      for (let x = 0; x < S; x += tile) for (let y = 0; y < S; y += tile)
        if ((Math.round(x / tile) + Math.round(y / tile)) % 2 === 0) check.fillRect(x, y, tile, tile);

      // Two trees for depth, well away from the chase.
      [[120, 210, 2.2], [910, 830, 2.6]].forEach(([x, y, s]) => {
        const t = this.add.graphics(); drawTree(t, yard.t1, yard.t2, yard.trunk); place(t, 25, 30, s, x, y);
      });

      // Paw prints trailing behind the dog: the thumbnail has to suggest movement,
      // and they have to be dark enough to read on a small tile.
      [[120, 742, 0.7, 0.18], [268, 706, 0.9, 0.26], [416, 670, 1.1, 0.34], [564, 634, 1.3, 0.42]].forEach(([x, y, s, a]) => {
        const p = this.add.graphics();
        p.fillStyle(0x1F4A18, a);
        p.fillCircle(7, 5, 5); p.fillCircle(14, 3, 4); p.fillCircle(18, 6, 4); p.fillCircle(16, 11, 4);
        place(p, 13, 7, s * 2.6, x, y);
      });

      // The dog mid-chase, and squirrels breaking away in front of it.
      const sq1 = this.add.graphics(); drawSquirrel(sq1, SQUIRRELS[0]); place(sq1, 24, 25, 3.4, 830, 330);
      const sq2 = this.add.graphics(); drawSquirrel(sq2, SQUIRRELS[0]); place(sq2, 24, 25, 2.8, 640, 180);
      const dog = this.add.graphics(); drawDog(dog, DOGS[0]); place(dog, 36, 32, 6.6, 470, 560);

      this.game.renderer.snapshot(img => resolve(img.src));
    } },
  });
});
</script></body>`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.route("http://thumb.local/**", route => route.request().url().endsWith("/phaser.js")
  ? route.fulfill({ contentType: "text/javascript", body: phaser })
  : route.fulfill({ contentType: "text/html", body: html }));
await page.goto("http://thumb.local/");
const dataUrl = await page.evaluate(size => window.renderThumb(size), SIZE);
mkdirSync("store", { recursive: true });
writeFileSync("store/thumbnail.png", Buffer.from(dataUrl.split(",")[1], "base64"));
console.log(`store/thumbnail.png (${SIZE}x${SIZE})`);
await browser.close();
