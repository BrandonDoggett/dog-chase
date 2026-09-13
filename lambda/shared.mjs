// Shared by the leaderboard Lambda and the game client. build.mjs inlines this
// file into the client bundle (with `export` stripped), so keep it plain JS with
// no imports.

// Leaderboard names are always generated from these word lists, never typed.
// The board is public and kids play this game, so no slurs and no real names.
// Only ever append words: removing one invalidates names players already have.
export const ADJ = ['Swift','Brave','Sneaky','Fluffy','Mighty','Zippy','Fuzzy','Turbo','Lucky','Sly',
  'Happy','Bouncy','Speedy','Clever','Jolly','Plucky','Scrappy','Snappy','Zoomy','Wiggly'];
export const NOU = ['Corgi','Doxie','Chaser','Dasher','Pouncer','Fetcher','Sprinter','Catcher','Hound','Pup',
  'Beagle','Poodle','Husky','Terrier','Collie','Boxer','Spaniel','Pointer','Setter','Retriever'];

// Shown on the public board next to each score, so only real catalog entries
// are accepted. Must match the DOGS / SQUIRRELS tables in src/game.js (tested).
export const DOG_NAMES = ['Aussie Doxie','Golden Retriever','Dalmatian','Corgi'];
export const SQUIRREL_NAMES = ['Gray Squirrel','Red Squirrel','Nihon Risu','Flying Squirrel'];

export function genName() {
  const pick = a => a[Math.floor(Math.random() * a.length)];
  return pick(ADJ) + pick(NOU) + Math.floor(Math.random() * 99 + 1);
}

const NAME_RE = new RegExp(`^(${ADJ.join('|')})(${NOU.join('|')})([1-9][0-9]?)$`);

export function isValidName(name) {
  return typeof name === 'string' && NAME_RE.test(name);
}

// A player can name their own dog. That name is kept on their device and never
// sent anywhere, but keep it short and printable so it fits on a card.
export function cleanDogName(raw) {
  const name = (typeof raw === 'string' ? raw : '')
    .replace(/[^A-Za-z0-9 '\-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 12)
    .trim(); // cutting to length can leave a trailing space
  return name || 'My Dog';
}

// ── Daily Chase ───────────────────────────────────────────────────────────────
// Everyone plays the same dog, squirrel and yard each day, so the day's scores
// compare like for like. The game and the Lambda work it out from this file, so
// a daily score played with the wrong dog can be rejected.

export const WORLD_COUNT = 4; // BGS in src/game.js, kept in step by a test

// The challenge changes at the same moment everywhere, and that moment is
// midnight Central, because that's where the players are. Keep the zone, never a
// fixed offset: Central is UTC-5 in summer and UTC-6 in winter, so a hardcoded
// offset would quietly start turning the day over at 11pm every November.
// See docs/adr/0001-daily-chase-turns-over-at-midnight-central.md.
export const DAILY_ZONE = 'America/Chicago';

const DAY_PARTS = new Intl.DateTimeFormat('en-US', {
  timeZone: DAILY_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});

function zoned(now) {
  const parts = {};
  for (const { type, value } of DAY_PARTS.formatToParts(now)) parts[type] = value;
  return parts;
}

export function dailyDate(now = new Date()) {
  const { year, month, day } = zoned(now);
  return `${year}-${month}-${day}`;
}

// How far into the local day we are, for the grace window just after midnight.
export function minutesIntoDay(now = new Date()) {
  const { hour, minute } = zoned(now);
  return Number(hour) * 60 + Number(minute);
}

// FNV-1a over the date: a small, stable hash that gives the same answer everywhere.
export function dailySeed(dateStr) {
  let h = 2166136261;
  for (let i = 0; i < dateStr.length; i++) {
    h ^= dateStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Each choice hashes the date with its own label. Taking different bit slices of
// a single hash rotated badly: one yard came up 46 days in 120, another twice.
function pick(dateStr, what, count) {
  return dailySeed(`${dateStr}:${what}`) % count;
}

export function dailySetup(dateStr) {
  return {
    seed: dailySeed(dateStr),
    dogIdx: pick(dateStr, 'dog', DOG_NAMES.length),
    sqIdx: pick(dateStr, 'squirrel', SQUIRREL_NAMES.length),
    bgIdx: pick(dateStr, 'world', WORLD_COUNT),
  };
}

// Daily runs live under their own day key, so they get their own board.
export function dailyDayKey(dateStr) {
  return `daily-${dateStr}`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// The line players paste into a chat: short, and it says where to play.
export function shareText({ dateStr, dogName, squirrelName, score, streak }) {
  const parts = dateStr.split('-');
  return [
    `Dog Chase · Daily ${Number(parts[2])} ${MONTHS[Number(parts[1]) - 1]}`,
    `🐕 ${dogName} vs 🐿️ ${squirrelName}`,
    `${score} caught${streak ? ` · ${streak}` : ''}`,
    'dogchase.eldoggosoftware.com',
  ].join('\n');
}
