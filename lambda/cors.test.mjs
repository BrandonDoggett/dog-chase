import { test } from "node:test";
import assert from "node:assert/strict";
import { corsHeaders, ALLOWED_ORIGINS } from "./cors.mjs";

const allowOrigin = headers => corsHeaders(headers)["Access-Control-Allow-Origin"];

test("allows the website and the store apps' WebView origins", () => {
  assert.equal(allowOrigin({ origin: "https://dogchase.eldoggosoftware.com" }), "https://dogchase.eldoggosoftware.com");
  assert.equal(allowOrigin({ Origin: "https://localhost" }), "https://localhost");       // Android app
  assert.equal(allowOrigin({ origin: "capacitor://localhost" }), "capacitor://localhost"); // iOS app
});

test("any other origin gets the website's, so the browser blocks it", () => {
  for (const headers of [{ origin: "https://evil.example" }, { origin: "http://localhost" }, {}, null, undefined])
    assert.equal(allowOrigin(headers), ALLOWED_ORIGINS[0], JSON.stringify(headers));
});

test("responses vary by origin so shared caches can't mix them up", () => {
  assert.equal(corsHeaders({}).Vary, "Origin");
});
