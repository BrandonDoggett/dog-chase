import { isValidName, DOG_NAMES, SQUIRREL_NAMES } from "./shared.mjs";

export const MAX_SCORE = 150;      // best real score so far is 103 (May 2026)
export const MIN_GAME_SECS = 58;   // a round is 60s; small allowance for latency
export const MAX_TOKEN_SECS = 600;

// Checks a POST /scores body against its session token payload (null when the
// signature didn't verify). Pure, so it can be unit tested without DynamoDB.
// Returns { status, error } to reject, or { entry, tokenId } to store.
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

  return { entry: { playerName, score, dog, squirrel }, tokenId: payload.id };
}
