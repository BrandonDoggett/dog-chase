// Builds the game into one of two shapes:
//   npm run build       → dist/       the website and the store apps: installable,
//                                     leaderboard, privacy link, service worker
//   npm run build:poki  → dist-poki/  the Poki build: no external requests, no
//                                     outgoing links, their SDK, no service worker
// Poki blocks every external request and forbids outgoing links, so its build
// drops the leaderboard and the PWA parts rather than shipping dead code.
import { minify } from "terser";
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, readdirSync, statSync } from "fs";
import { createHash } from "crypto";
import { join, relative, sep } from "path";

const TARGET = process.env.TARGET === "poki" ? "poki" : "web";
const POKI = TARGET === "poki";
const OUT = POKI ? "dist-poki" : "dist";

// Local builds (including the Android app) read API_URL from a gitignored
// .env; see .env.example. CI sets it from a repository secret.
try { process.loadEnvFile(".env"); } catch {}
const API_URL = process.env.API_URL || "http://localhost:3001";
if (!POKI && !process.env.API_URL) console.warn(`API_URL not set; leaderboard calls will go to ${API_URL}`);

const PHASER_VERSION = JSON.parse(readFileSync("node_modules/phaser/package.json", "utf8")).version;

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
if (!POKI) cpSync("public", OUT, { recursive: true }); // manifest, icons, privacy page

// The name and catalog rules shared with the Lambda go first, so the game and
// the server check names against the same word lists.
const shared = readFileSync("lambda/shared.mjs", "utf8").replace(/^export /gm, "");
const src = (shared + "\n" + readFileSync("src/game.js", "utf8"))
  .replace("__API_URL__", POKI ? "" : API_URL)
  .replace("__TARGET__", TARGET);

const result = await minify(src, {
  compress: { passes: 2, drop_console: true },
  mangle: true,
  module: false,
  format: { comments: false },
});

if (result.error) { console.error(result.error); process.exit(1); }

const html = dropBlocks(readFileSync("src/index.template.html", "utf8"), POKI ? "WEB-ONLY" : "POKI-ONLY")
  .replace("__PHASER_VERSION__", PHASER_VERSION)
  .replace("__GAME_SCRIPT__", () => result.code); // function form: minified code can contain "$&"-style patterns
writeFileSync(join(OUT, "index.html"), html, "utf8");

mkdirSync(join(OUT, "vendor"));
cpSync("node_modules/phaser/dist/phaser.min.js", join(OUT, "vendor", `phaser-${PHASER_VERSION}.min.js`));
mkdirSync(join(OUT, "fonts"));
for (const weight of [400, 700, 900])
  cpSync(`node_modules/@fontsource/nunito/files/nunito-latin-${weight}-normal.woff2`, join(OUT, "fonts", `nunito-${weight}.woff2`));

const files = walk(OUT).map(f => relative(OUT, f).split(sep).join("/")).sort();

if (!POKI) {
  // Precache list for the service worker. Hashing the content gives every deploy
  // a fresh cache name, so players pick up new versions automatically.
  const hash = createHash("sha256");
  for (const f of files) hash.update(f).update(readFileSync(join(OUT, f)));
  const assets = ["./", ...files.filter(f => f !== "index.html")];
  const sw = readFileSync("src/sw.template.js", "utf8")
    .replace("__BUILD_ID__", hash.digest("hex").slice(0, 12))
    .replace("__ASSETS__", () => JSON.stringify(assets));
  writeFileSync(join(OUT, "sw.js"), sw, "utf8");
}

console.log(`Built ${OUT}/ for ${TARGET} (game ${(result.code.length / 1024).toFixed(1)}KB minified, ${files.length + (POKI ? 0 : 1)} files)`);

// <!--WEB-ONLY--> … <!--/WEB-ONLY--> is dropped from the Poki build, and
// <!--POKI-ONLY--> … <!--/POKI-ONLY--> from every other build.
function dropBlocks(text, name) {
  return text.replace(new RegExp(`<!--${name}-->[\\s\\S]*?<!--/${name}-->\\s*`, "g"), "");
}

function walk(dir) {
  return readdirSync(dir).flatMap(name => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}
