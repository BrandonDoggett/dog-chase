// Builds the site into dist/:
//  - index.html with the minified game inlined
//  - Phaser and the Nunito font served from our own origin (offline play and
//    app-store builds can't depend on a CDN)
//  - PWA manifest + icons from public/
//  - sw.js, which precaches all of the above
import { minify } from "terser";
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, readdirSync, statSync } from "fs";
import { createHash } from "crypto";
import { join, relative, sep } from "path";

const OUT = "dist";
// Local builds (including the Android app) read API_URL from a gitignored
// .env; see .env.example. CI sets it from a repository secret.
try { process.loadEnvFile(".env"); } catch {}
const API_URL = process.env.API_URL || "http://localhost:3001";
if (!process.env.API_URL) console.warn(`API_URL not set; leaderboard calls will go to ${API_URL}`);

const PHASER_VERSION = JSON.parse(readFileSync("node_modules/phaser/package.json", "utf8")).version;

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync("public", OUT, { recursive: true });

// The name and catalog rules shared with the Lambda go first, so the game and
// the server check names against the same word lists.
const shared = readFileSync("lambda/shared.mjs", "utf8").replace(/^export /gm, "");
const src = (shared + "\n" + readFileSync("src/game.js", "utf8")).replace("__API_URL__", API_URL);

const result = await minify(src, {
  compress: { passes: 2, drop_console: true },
  mangle: true,
  module: false,
  format: { comments: false },
});

if (result.error) { console.error(result.error); process.exit(1); }

const html = readFileSync("src/index.template.html", "utf8")
  .replace("__PHASER_VERSION__", PHASER_VERSION)
  .replace("__GAME_SCRIPT__", () => result.code); // function form: minified code can contain "$&"-style patterns
writeFileSync(join(OUT, "index.html"), html, "utf8");

mkdirSync(join(OUT, "vendor"));
cpSync("node_modules/phaser/dist/phaser.min.js", join(OUT, "vendor", `phaser-${PHASER_VERSION}.min.js`));
mkdirSync(join(OUT, "fonts"));
for (const weight of [400, 700, 900])
  cpSync(`node_modules/@fontsource/nunito/files/nunito-latin-${weight}-normal.woff2`, join(OUT, "fonts", `nunito-${weight}.woff2`));

// Precache list for the service worker. Hashing the content gives every deploy
// a fresh cache name, so players pick up new versions automatically.
const files = walk(OUT).map(f => relative(OUT, f).split(sep).join("/")).sort();
const hash = createHash("sha256");
for (const f of files) hash.update(f).update(readFileSync(join(OUT, f)));
const assets = ["./", ...files.filter(f => f !== "index.html")];
const sw = readFileSync("src/sw.template.js", "utf8")
  .replace("__BUILD_ID__", hash.digest("hex").slice(0, 12))
  .replace("__ASSETS__", () => JSON.stringify(assets));
writeFileSync(join(OUT, "sw.js"), sw, "utf8");

console.log(`Built ${OUT}/ (game ${(result.code.length / 1024).toFixed(1)}KB minified, ${files.length + 1} files)`);

function walk(dir) {
  return readdirSync(dir).flatMap(name => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}
