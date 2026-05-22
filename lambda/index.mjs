import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { createHmac, randomBytes } from "crypto";

const db = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "us-east-1" }));
const TABLE = "dogchase-scores";
const SECRET = process.env.TOKEN_SECRET;
const ORIGIN = process.env.ALLOWED_ORIGIN || "https://dogchase.eldoggosoftware.com";
const MAX_SCORE = 150;
const MIN_GAME_SECS = 58;

const cors = {
  "Access-Control-Allow-Origin": ORIGIN,
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function respond(status, body) {
  return { statusCode: status, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify(body) };
}

function signToken(payload) {
  const data = JSON.stringify(payload);
  const b64 = Buffer.from(data).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(b64).digest("base64url");
  return `${b64}.${sig}`;
}

function verifyToken(token) {
  const [b64, sig] = token.split(".");
  if (!b64 || !sig) return null;
  const expected = createHmac("sha256", SECRET).update(b64).digest("base64url");
  if (expected !== sig) return null;
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

    const { token, playerName, score, dog, squirrel } = body;
    if (!token || !playerName || score == null || !dog || !squirrel)
      return respond(400, { error: "Missing fields" });

    const payload = verifyToken(token);
    if (!payload) return respond(403, { error: "Invalid token" });

    const elapsed = (Date.now() - payload.iat) / 1000;
    if (elapsed < MIN_GAME_SECS) return respond(403, { error: "Game too short" });
    if (elapsed > 600) return respond(403, { error: "Token expired" });

    if (typeof score !== "number" || score < 0 || score > MAX_SCORE || !Number.isInteger(score))
      return respond(400, { error: "Invalid score" });

    const name = String(playerName).trim().slice(0, 24).replace(/[^a-zA-Z0-9 _\-!?.]/g, "");
    if (!name) return respond(400, { error: "Invalid name" });

    // Reject replayed tokens
    const used = await db.send(new GetCommand({ TableName: TABLE, Key: { scoreId: `used_${payload.id}` } }));
    if (used.Item) return respond(403, { error: "Token already used" });

    const now = new Date();
    const dayKey = now.toISOString().slice(0, 10);
    const weekKey = isoWeek(now);
    const scoreId = randomBytes(16).toString("hex");

    // Mark token as used (TTL 10 min)
    await db.send(new PutCommand({
      TableName: TABLE,
      Item: { scoreId: `used_${payload.id}`, ttl: Math.floor(Date.now() / 1000) + 600 },
    }));

    await db.send(new PutCommand({
      TableName: TABLE,
      Item: { scoreId, gameId: "dogchase", playerName: name, score, dog, squirrel, dayKey, weekKey, submittedAt: now.toISOString() },
    }));

    return respond(201, { ok: true, scoreId });
  }

  // ── GET /scores?period=alltime|weekly|daily&limit=10 ───────────────────────
  if (method === "GET" && path === "/scores") {
    const period = event.queryStringParameters?.period || "alltime";
    const limit = Math.min(parseInt(event.queryStringParameters?.limit || "10"), 25);

    let indexName, keyCondition, exprValues;
    if (period === "alltime") {
      indexName = "alltime-index";
      keyCondition = "gameId = :gid";
      exprValues = { ":gid": "dogchase" };
    } else if (period === "weekly") {
      indexName = "week-index";
      const wk = isoWeek(new Date());
      keyCondition = "weekKey = :wk";
      exprValues = { ":wk": wk };
    } else {
      indexName = "day-index";
      const dk = new Date().toISOString().slice(0, 10);
      keyCondition = "dayKey = :dk";
      exprValues = { ":dk": dk };
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
