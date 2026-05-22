import { minify } from "terser";
import { readFileSync, writeFileSync } from "fs";

const API_URL = process.env.API_URL || "http://localhost:3001";

let src = readFileSync("src/game.js", "utf8");

// Inject API URL at build time — never visible as a readable string in source
src = src.replace("__API_URL__", API_URL);

const result = await minify(src, {
  compress: { passes: 2, drop_console: true },
  mangle: true,
  module: false,
  format: { comments: false },
});

if (result.error) { console.error(result.error); process.exit(1); }

const template = readFileSync("src/index.template.html", "utf8");
const output = template.replace("__GAME_SCRIPT__", result.code);
writeFileSync("index.html", output, "utf8");

console.log(`Built index.html — ${(result.code.length / 1024).toFixed(1)}KB minified`);
