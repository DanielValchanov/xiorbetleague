# Xiorbet Liga

Където страстта среща липсата на умения.

A small static website for a friendly Saturday football league: individual standings, a countdown to the next match, a suggested team split, player cards, and links to posts from the public Instagram profile [`@xiorbetliga`](https://www.instagram.com/xiorbetliga/).

## What's Inside

- Individual player table
- Automatic countdown to the next Saturday match
- Suggested split for the next two teams
- Posts and clips section
- Short player cards
- Xiorbet Liga logo and visual identity

## Run Locally

This is plain HTML/CSS/JS, so there is no build step.

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:4173/
```

## Editing Data

Most league content lives in [`app.js`](app.js):

- `players` controls the table and recent form
- `teamSplit` controls the next team split
- `posts` controls Instagram links
- `nextMatch` controls match time and venue

## Project Files

- [`index.html`](index.html) - page structure
- [`styles.css`](styles.css) - visual design
- [`app.js`](app.js) - data and dynamic behavior
- `617368903_17848038321665505_5586529558101376955_n.jpg` - league logo
