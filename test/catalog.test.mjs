import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DOG_NAMES, SQUIRREL_NAMES, WORLD_COUNT } from "../lambda/shared.mjs";

const game = readFileSync(new URL("../src/game.js", import.meta.url), "utf8");

function namesIn(table) {
  const block = game.match(new RegExp(`const ${table} = \\[([\\s\\S]*?)\\n\\];`))?.[1] ?? "";
  return [...block.matchAll(/name:'([^']+)'/g)].map(m => m[1]);
}

test("the Lambda accepts exactly the dogs and squirrels the game offers", () => {
  assert.deepEqual(namesIn("DOGS"), DOG_NAMES);
  assert.deepEqual(namesIn("SQUIRRELS"), SQUIRREL_NAMES);
});

test("the Daily Chase can pick any world the game has", () => {
  assert.equal(namesIn("BGS").length, WORLD_COUNT);
});

test("the name word lists live only in lambda/shared.mjs", () => {
  assert.doesNotMatch(game, /const (ADJ|NOU)\s*=/);
});
