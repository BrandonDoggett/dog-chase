// Service worker template. build.mjs fills in the build id and asset list and
// writes dist/sw.js; edit this file, not the output.
const CACHE = 'dogchase-__BUILD_ID__';
const ASSETS = __ASSETS__;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('dogchase-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  // The leaderboard API (another origin) and any POST always go to the network.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    // Network first, so a new deploy shows up as soon as the player is online.
    e.respondWith(fetch(req)
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put('./', copy)); }
        return res;
      })
      .catch(() => caches.match('./')));
    return;
  }

  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
