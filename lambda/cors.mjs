// Browsers only let the game read API responses from these origins: the
// website, plus the WebView origins Capacitor uses in the store apps (Android
// serves the bundled game from https://localhost, iOS from capacitor://localhost).
// CORS only restricts browsers; the input checks in validate.mjs are the real guard.
export const ALLOWED_ORIGINS = [
  "https://dogchase.eldoggosoftware.com",
  "https://localhost",
  "capacitor://localhost",
];

export function corsHeaders(requestHeaders) {
  const origin = requestHeaders?.origin ?? requestHeaders?.Origin;
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}
