import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { validateSubmission, MAX_TOKEN_SECS } from "./validate.mjs";
import { corsHeaders } from "./cors.mjs";
import { dailyDate, dailyDayKey } from "./shared.mjs";

const db = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "us-east-1" }));
const TABLE = "dogchase-scores";
const SECRET = process.env.TOKEN_SECRET;

function signToken(payload) {
  const data = JSON.stringify(payload);
  const b64 = Buffer.from(data).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(b64).digest("base64url");
  return `${b64}.${sig}`;
}

function verifyToken(token) {
  if (typeof token !== "string") return null;
  const [b64, sig] = token.split(".");
  if (!b64 || !sig) return null;
  const expected = Buffer.from(createHmac("sha256", SECRET).update(b64).digest("base64url"));
  const given = Buffer.from(sig);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try { return JSON.parse(Buffer.from(b64, "base64url").toString()); }
  catch { return null; }
}

function isoWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return `${d.getFullYear()}-W${String(1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)).padStart(2, "0")}`;
}

export async function handler(event) {
  const method = event.httpMethod;
  const path = event.path;
  const headers = { ...corsHeaders(event.headers), "Content-Type": "application/json" };
  const respond = (status, body) => ({ statusCode: status, headers, body: JSON.stringify(body) });

  if (method === "OPTIONS") return respond(200, {});

  // ── GET /session — issue a one-time game token ─────────────────────────────
  if (method === "GET" && path === "/session") {
    const token = signToken({ iat: Date.now(), id: randomBytes(12).toString("hex") });
    return respond(200, { token });
  }

  // ── POST /scores — validate and store a score ──────────────────────────────
  if (method === "POST" && path === "/scores") {
    let body;
    try { body = JSON.parse(event.body); } catch { return respond(400, { error: "Bad request" }); }

    const checked = validateSubmission(body, verifyToken(body?.token), Date.now());
    if (checked.error) return respond(checked.status, { error: checked.error });

    // Claim the token atomically, so two racing requests can't both spend it.
    // The marker only has to outlive the token; DynamoDB TTL deletes it later.
    try {
      await db.send(new PutCommand({
        TableName: TABLE,
        Item: { scoreId: `used_${checked.tokenId}`, ttl: Math.floor(Date.now() / 1000) + MAX_TOKEN_SECS },
        ConditionExpression: "attribute_not_exists(scoreId)",
      }));
    } catch (e) {
      if (e.name === "ConditionalCheckFailedException") return respond(403, { error: "Token already used" });
      throw e;
    }

    const now = new Date();
    const scoreId = randomBytes(16).toString("hex");
    // Daily Chase rounds get their own day key, so they have their own board.
    const dayKey = checked.dailyOn ? dailyDayKey(checked.dailyOn) : dailyDate(now);
    await db.send(new PutCommand({
      TableName: TABLE,
      Item: {
        scoreId, gameId: "dogchase", ...checked.entry,
        dayKey, weekKey: isoWeek(now), submittedAt: now.toISOString(),
      },
    }));

    return respond(201, { ok: true, scoreId });
  }

  // ── GET /scores?period=alltime|weekly|daily|challenge&limit=10 ─────────────
  if (method === "GET" && path === "/scores") {
    const period = event.queryStringParameters?.period || "alltime";
    const limit = Math.min(Math.max(parseInt(event.queryStringParameters?.limit, 10) || 10, 1), 25);

    let indexName, keyCondition, exprValues;
    if (period === "alltime") {
      indexName = "alltime-index";
      keyCondition = "gameId = :gid";
      exprValues = { ":gid": "dogchase" };
    } else if (period === "weekly") {
      indexName = "week-index";
      keyCondition = "weekKey = :wk";
      exprValues = { ":wk": isoWeek(new Date()) };
    } else {
      // "challenge" is today's Daily Chase; "daily" is today's free play.
      indexName = "day-index";
      keyCondition = "dayKey = :dk";
      exprValues = { ":dk": period === "challenge" ? dailyDayKey(dailyDate()) : dailyDate() };
    }

    const result = await db.send(new QueryCommand({
      TableName: TABLE,
      IndexName: indexName,
      KeyConditionExpression: keyCondition,
      ExpressionAttributeValues: exprValues,
      ScanIndexForward: false,
      Limit: limit,
    }));

    const scores = (result.Items || []).map((r, i) => ({
      rank: i + 1,
      playerName: r.playerName,
      score: r.score,
      dog: r.dog,
      squirrel: r.squirrel,
      date: r.submittedAt?.slice(0, 10),
    }));

    return respond(200, { scores });
  }

  return respond(404, { error: "Not found" });
}
