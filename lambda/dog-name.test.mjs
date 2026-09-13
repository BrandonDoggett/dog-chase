import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanDogName } from "./shared.mjs";

test("keeps an ordinary dog's name as it was typed", () => {
  assert.equal(cleanDogName("Biscuit"), "Biscuit");
  assert.equal(cleanDogName("Mr Waffles"), "Mr Waffles");
  assert.equal(cleanDogName("Rex O'Hara"), "Rex O'Hara");
  assert.equal(cleanDogName("Jean-Luc"), "Jean-Luc");
});

test("tidies up spacing and length so it fits the card", () => {
  assert.equal(cleanDogName("   Biscuit   "), "Biscuit");
  assert.equal(cleanDogName("Sir  Barks   A Lot"), "Sir Barks A");
  assert.equal(cleanDogName("Bartholomewthethird"), "Bartholomewt");
});

test("drops characters that don't belong in a name", () => {
  assert.equal(cleanDogName("<script>x</script>"), "scriptxscrip");
  assert.equal(cleanDogName("Biscuit 🐕"), "Biscuit");
  assert.equal(cleanDogName("emoji: 🎉🎉"), "emoji");
});

test("falls back when there's nothing usable", () => {
  for (const raw of ["", "   ", "🐕🐕", null, undefined, 42, {}])
    assert.equal(cleanDogName(raw), "My Dog", JSON.stringify(raw));
});
