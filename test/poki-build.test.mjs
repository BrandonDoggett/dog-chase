import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";

// Poki blocks every external request and forbids outgoing links. Flags are easy
// to get wrong, so this runs the real build and reads what came out.
test("the Poki build carries no external calls, no outgoing links and no service worker", () => {
  execFileSync("node", ["scripts/build-poki.mjs"], { stdio: "pipe" });
  const html = readFileSync("dist-poki/index.html", "utf8");

  assert.doesNotMatch(html, /execute-api|amazonaws\.com/, "the leaderboard API is still in there");
  assert.doesNotMatch(html, /privacy\.html/, "the outgoing privacy link is still in there");
  assert.doesNotMatch(html, /manifest\.webmanifest|serviceWorker/, "PWA parts are still in there");
  assert.ok(!existsSync("dist-poki/sw.js"), "a service worker was written");
  assert.ok(!existsSync("dist-poki/privacy.html"), "the privacy page was copied in");

  // What it must have: their SDK, and everything else bundled with the game.
  assert.match(html, /game-cdn\.poki\.com\/scripts\/v2\/poki-sdk\.js/, "the Poki SDK is missing");
  assert.ok(existsSync("dist-poki/fonts/nunito-900.woff2"), "the font isn't bundled");
  assert.match(html, /vendor\/phaser-[\d.]+\.min\.js/, "Phaser isn't bundled");
});
