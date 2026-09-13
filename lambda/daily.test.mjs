import { test } from "node:test";
import assert from "node:assert/strict";
import { dailyDate, minutesIntoDay, dailySetup, dailyDayKey, shareText, DOG_NAMES, SQUIRREL_NAMES, WORLD_COUNT } from "./shared.mjs";

test("the day turns over at midnight Central, everywhere at once", () => {
  assert.equal(dailyDate(new Date("2026-09-13T04:59:00Z")), "2026-09-12"); // 23:59 Central
  assert.equal(dailyDate(new Date("2026-09-13T05:00:00Z")), "2026-09-13"); // 00:00 Central
  assert.equal(minutesIntoDay(new Date("2026-09-13T05:05:00Z")), 5);
});

test("the turnover follows Central's clock changes, not a fixed offset", () => {
  // Central is UTC-5 in summer and UTC-6 after 1 November. Hardcoding -5 would
  // turn the day over at 11pm all winter, and these two lines would fail.
  assert.equal(dailyDate(new Date("2026-11-15T05:59:00Z")), "2026-11-14"); // 23:59 Central
  assert.equal(dailyDate(new Date("2026-11-15T06:00:00Z")), "2026-11-15"); // 00:00 Central
  assert.equal(minutesIntoDay(new Date("2026-11-15T06:05:00Z")), 5);
});

test("a date always gives the same setup, and always a real dog, squirrel and yard", () => {
  assert.deepEqual(dailySetup("2026-09-12"), dailySetup("2026-09-12"));
  for (let day = 0; day < 400; day++) {
    const date = dailyDate(new Date(Date.UTC(2026, 0, 1) + day * 86400000));
    const { dogIdx, sqIdx, bgIdx } = dailySetup(date);
    assert.ok(dogIdx >= 0 && dogIdx < DOG_NAMES.length, `${date} dog ${dogIdx}`);
    assert.ok(sqIdx >= 0 && sqIdx < SQUIRREL_NAMES.length, `${date} squirrel ${sqIdx}`);
    assert.ok(bgIdx >= 0 && bgIdx < WORLD_COUNT, `${date} world ${bgIdx}`);
  }
});

test("the challenge rotates evenly: no dog, squirrel or yard is rare", () => {
  const DAYS = 200;
  const sizes = { dog: DOG_NAMES.length, squirrel: SQUIRREL_NAMES.length, world: WORLD_COUNT };
  const counts = { dog: {}, squirrel: {}, world: {} };
  let repeats = 0, previous = null;

  for (let day = 0; day < DAYS; day++) {
    const s = dailySetup(dailyDate(new Date(Date.UTC(2026, 0, 1) + day * 86400000)));
    counts.dog[s.dogIdx] = (counts.dog[s.dogIdx] ?? 0) + 1;
    counts.squirrel[s.sqIdx] = (counts.squirrel[s.sqIdx] ?? 0) + 1;
    counts.world[s.bgIdx] = (counts.world[s.bgIdx] ?? 0) + 1;
    const matchup = `${s.dogIdx}-${s.sqIdx}-${s.bgIdx}`;
    if (matchup === previous) repeats++;
    previous = matchup;
  }

  for (const [what, tally] of Object.entries(counts)) {
    assert.equal(Object.keys(tally).length, sizes[what], `${what}: ${JSON.stringify(tally)}`);
    const fairShare = DAYS / sizes[what];
    for (const [which, times] of Object.entries(tally))
      assert.ok(times >= fairShare * 0.6,
        `${what} ${which} came up ${times} times in ${DAYS} days: ${JSON.stringify(tally)}`);
  }
  // Some repeats are expected by chance; a run of them would mean a stuck rotation.
  assert.ok(repeats <= DAYS / 10, `the same matchup landed twice running ${repeats} times`);
});

test("daily scores are keyed apart from free play", () => {
  assert.equal(dailyDayKey("2026-09-12"), "daily-2026-09-12");
  assert.notEqual(dailyDayKey("2026-09-12"), "2026-09-12");
});

test("the share line says the day, the matchup, the score and where to play", () => {
  const text = shareText({ dateStr: "2026-09-12", dogName: "Corgi", squirrelName: "Red Squirrel", score: 14, streak: "GODLIKE!" });
  assert.equal(text, [
    "Dog Chase · Daily 12 Sep",
    "🐕 Corgi vs 🐿️ Red Squirrel",
    "14 caught · GODLIKE!",
    "dogchase.eldoggosoftware.com",
  ].join("\n"));
});

test("the share line leaves out the streak when there wasn't one", () => {
  const text = shareText({ dateStr: "2026-01-05", dogName: "Dalmatian", squirrelName: "Gray Squirrel", score: 1, streak: null });
  assert.match(text, /^Dog Chase · Daily 5 Jan$/m);
  assert.match(text, /^1 caught$/m);
});
