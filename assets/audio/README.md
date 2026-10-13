# assets/audio

Audio files used by wish pages.

## Required but NOT included: `birthday-music.mp3`

`wishes/birthday/birthday-01.js` loads `assets/audio/birthday-music.mp3`
(path `../../assets/audio/birthday-music.mp3` from the page). **That file is
not in the repository** — it was never part of the original upload, and no
audio has been invented to fill the gap.

Until you add it:

- The Birthday experience still works end to end.
- When the visitor presses play, the player detects the load failure and
  replaces itself with a friendly "music isn't available" message.
- The browser console shows one failed request for the .mp3 at that moment.
- `node scripts/check-repo.mjs` lists the file as a *known missing asset*.

To enable music: add a track you have the right to use (own work, or a
license that permits web redistribution) as `assets/audio/birthday-music.mp3`.
Keep it small (roughly under 2 MB; 96–128 kbps is plenty for a looping
background tune). Then remove the entry from `KNOWN_MISSING` in
`scripts/check-repo.mjs`.
