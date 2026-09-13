# Poki

**Access request submitted 13 September 2026.** Poki answered: "Thank you. We
received your request! You'll hear back from us in a few days." Their reply goes
to hello@eldoggosoftware.com.

Sent at Kay's instruction. Note that reaching out to a company is normally his to
do, not an agent's (eldoggo-hq CHARTER.md), so this was his call to make and he
made it twice.

## What was sent

The form at https://developers.poki.com/guide/share is a request for access to
Poki for Developers, not a game submission. It asks about the developer, and has
no field for a description of the game.

- **Name:** Brandon Doggett
- **Email:** hello@eldoggosoftware.com
- **Studio:** eldoggo software
- **Country:** United States
- **Studio type:** Solo Developer
- **Platforms released on:** Web only. The Android build isn't public yet, so
  claiming app stores would have been false
- **Links:** https://dogchase.eldoggosoftware.com and https://eldoggosoftware.com
- **Genres:** Casual, arcade, high score
- **Engine:** Phaser 3 (JavaScript)
- **Goal:** Releasing existing titles

## What happens next

1. They reply in a few days, or not at all — they hand-curate and say they can't
   answer every request.
2. If they do, the game submission comes through their developer portal. That's
   where the build and the thumbnails are used.
3. **Ask before agreeing to anything:** Poki prefer web-exclusive for five years.
   App stores aren't covered, so the Android build is unaffected, but ask whether
   our installable web app counts as "web" under that clause, since players can
   add Dog Chase to their home screen from our own site.

## What's ready for them

- `npm run build:poki` → a build with no external requests, no outgoing links,
  their SDK wired to gameplay start and stop and the ad break, and storage that
  survives incognito
- 16:9 on desktop and portrait on phones, filling the frame either way
- `store/thumbnail.png` — 1080x1080, full-bleed, no text
- `store/thumbnail.mp4` — 1080x1080, 5 seconds, 50fps, recorded from a real round

## A description, for when there's a place to paste one

> Dog Chase is a one-minute chase game: pick a dog, pick a squirrel, and catch as
> many as you can before the clock runs out. Four dogs with different speed and
> reach, four squirrels from easy to expert, four yards, streak multipliers and six
> power-ups. It also has a daily challenge — everyone gets the same dog, squirrel
> and yard each day — with its own leaderboard and a line players can share.
>
> It's live at dogchase.eldoggosoftware.com, built in Phaser 3, plays with touch or
> keyboard, and installs from the browser.
