import { isValidName, DOG_NAMES, SQUIRREL_NAMES, dailyDate, dailySetup, minutesIntoDay } from "./shared.mjs";

export const MAX_SCORE = 150;      // best real score so far is 103 (May 2026)
export const MIN_GAME_SECS = 58;   // a round is 60s; small allowance for latency
export const MAX_TOKEN_SECS = 600;
export const MIDNIGHT_GRACE_MINS = 12; // a token lives 10 minutes, plus slack
const DAY_MS = 86400000;

// Checks a POST /scores body against its session token payload (null when the
// signature didn't verify). Pure, so it can be unit tested without DynamoDB.
// Returns { status, error } to reject, or { entry, tokenId, dailyOn } to store;
// dailyOn is the Daily Chase date when the round was one, otherwise null.
export function validateSubmission(body, payload, nowMs) {
  if (!body || typeof body !== "object") return { status: 400, error: "Bad request" };
  if (!payload || !Number.isFinite(payload.iat) || typeof payload.id !== "string")
    return { status: 403, error: "Invalid token" };

  const elapsed = (nowMs - payload.iat) / 1000;
  if (elapsed < MIN_GAME_SECS) return { status: 403, error: "Game too short" };
  if (elapsed > MAX_TOKEN_SECS) return { status: 403, error: "Token expired" };

  const { playerName, score, dog, squirrel } = body;
  if (!Number.isInteger(score) || score < 0 || score > MAX_SCORE)
    return { status: 400, error: "Invalid score" };
  if (!isValidName(playerName)) return { status: 400, error: "Invalid name" };
  if (!DOG_NAMES.includes(dog) || !SQUIRREL_NAMES.includes(squirrel))
    return { status: 400, error: "Invalid dog or squirrel" };

  // Older versions send no mode, and those rounds are free play.
  const mode = body.mode ?? "free";
  if (mode !== "free" && mode !== "daily") return { status: 400, error: "Invalid mode" };

  // A Daily Chase score only counts if it was played with the day's dog and
  // squirrel. A round can start before midnight and finish after it, so
  // yesterday's challenge counts for a few minutes into the new day — but only
  // that long, or yesterday's board could be padded all day.
  let dailyOn = null;
  if (mode === "daily") {
    const now = new Date(nowMs);
    const dates = [dailyDate(now)];
    if (minutesIntoDay(now) < MIDNIGHT_GRACE_MINS)
      dates.push(dailyDate(new Date(nowMs - DAY_MS)));
    dailyOn = dates.find(date => {
      const setup = dailySetup(date);
      return DOG_NAMES[setup.dogIdx] === dog && SQUIRREL_NAMES[setup.sqIdx] === squirrel;
    }) ?? null;
    if (!dailyOn) return { status: 400, error: "Not today's Daily Chase" };
  }

  return { entry: { playerName, score, dog, squirrel, mode }, tokenId: payload.id, dailyOn };
}
