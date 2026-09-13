# ADR-0001: The Daily Chase turns over at midnight Central

- **Status:** Accepted
- **Date:** 2026-09-12

## Context

The Daily Chase gives everyone the same dog, squirrel and yard each day. The first
version worked that out from the UTC date, which is the easy thing to compute and
the wrong thing for players: UTC midnight is 7pm Central. Someone playing after
dinner got tomorrow's challenge before bed, and the day's board reset underneath
them. A "daily" challenge promises a day that the player feels, not a day the
server finds convenient.

Our players are effectively all in the US right now, so there is one sensible
boundary: midnight Central.

Letting each player's own timezone decide was the other option. It would need the
client to say what day it is, which is trivially spoofable — someone could farm an
old day's board — and it would split one global board into many.

The cost of this change only goes one way. Today no daily scores exist, so it is a
date function. Once the boards carry history it becomes a migration plus an
explanation to players about why yesterday moved.

## Decision

1. The day is the date in **`America/Chicago`**, computed with
   `Intl.DateTimeFormat`, in `lambda/shared.mjs` (`dailyDate`, `minutesIntoDay`).
2. **The zone is stored, never an offset.** Central is UTC-5 in summer and UTC-6
   after the first Sunday in November. A hardcoded `-5` would silently start
   turning the day over at 11pm every winter, and nobody would notice for days.
   Two tests in `lambda/daily.test.mjs` fail if anyone replaces the zone with an
   offset.
3. **One global board stays.** A player elsewhere plays the US day; that is a
   fair trade for a single leaderboard at our size.
4. The grace window that lets a round finishing just after midnight count for
   yesterday is measured in the same zone.

## Consequences

**Easier.** The challenge changes while players are asleep, which is what the word
"daily" promises, and the boards match the day people think they played.

**Harder.** Every part of the daily — the date, the grace window, the share line's
date — has to go through these helpers. Anything that reaches for `toISOString()`
or `getUTCHours()` reintroduces the bug.

**Revisit** when a meaningful number of players are outside the Americas. Moving
then means migrating existing boards, so decide it before those boards matter.

This is the third timezone fault in the estate in one evening: a scheduled report
filed under the UTC date, a machine clock running UTC while the company works in
Central, and this. The lesson, recorded in the HQ's `memory/lessons.md`: assume UTC
is wrong wherever a person is meant to feel the boundary.
