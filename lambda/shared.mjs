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
