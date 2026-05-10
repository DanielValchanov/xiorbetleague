# Xiorbet Liga

Където страстта среща липсата на умения.

Европейският футбол е на колене. Шепа отбори диктуват правилата със своите безкрайни бюджети и статистически подходи към любимата игра. В опит да се прекъсне този омагьосан кръг, група студенти правят опит да върнат футбола там, където принадлежи - далеч от екселските таблици и близко до сърцата на публиката.

## What's Inside

- Individual player table
- Automatic countdown to the next Saturday match
- Suggested split for the next two teams
- Posts and clips section
- Short player cards
- Separate pages for the main sections
- Google Sheets-powered standings with a local fallback
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

Most league content lives in [`assets/js/data.js`](assets/js/data.js):

- `players` controls the table and recent form
- `sheet` controls the linked Google Sheet
- `teamSplit` controls the next team split
- `posts` controls Instagram links
- `nextMatch` controls match time and venue

For the live table to work, the spreadsheet must be accessible to visitors. If the Google request fails, the site automatically uses the local fallback data in `assets/js/data.js`.

## Project Files

- [`index.html`](index.html) - home page
- [`standings.html`](standings.html) - individual table
- [`match.html`](match.html) - countdown and team split
- [`posts.html`](posts.html) - Instagram posts and clips
- [`players.html`](players.html) - player cards
- [`assets/css/styles.css`](assets/css/styles.css) - visual design
- [`assets/js/data.js`](assets/js/data.js) - league data
- [`assets/js/app.js`](assets/js/app.js) - rendering and dynamic behavior
- [`assets/images/logo.jpg`](assets/images/logo.jpg) - league logo
- [`assets/images/current-ranking.png`](assets/images/current-ranking.png) - source ranking screenshot
