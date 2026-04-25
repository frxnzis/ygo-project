# YGO Project

[YGO Project](https://frxnzis.github.io/ygo-project/) is a personal web app aimed at improving the UI and UX of a typical Yu-Gi-Oh! card finder, using the [YGOPRODECK](https://db.ygoprodeck.com/api-guide/) API.

## About This Rebuild

This branch includes a rebuild pass focused on making the app easier to run locally, improving the card search flow, and moving the UI toward a darker Duel Terminal-style experience.

Main improvements:

- Fixed local startup issues caused by dependency resolution problems.
- Added safer YGOPRODeck API requests using `URLSearchParams`.
- Added search by pressing `Enter`, in addition to clicking the search icon.
- Added a loading state while card results are being fetched.
- Replaced duplicate in-flight requests with an abortable request flow, so the latest search wins.
- Replaced the dynamic Masonry layout with responsive CSS Grid to reduce `ResizeObserver` runtime overlay issues.
- Rebuilt the base layout with a sticky top search bar, compact card grid, pagination controls, and a richer card detail modal.
- Removed external Bootstrap CSS/JS from `public/index.html`; the current UI is driven by local React, MUI dialog primitives, and SCSS.
- Added visible API error feedback instead of collapsing every failed request into an empty state.
- Added design mockups under `design-previews/` for future UI reference.
- Updated the default CRA test to verify the real app UI.

See [PROJECT_REVIEW.md](./PROJECT_REVIEW.md) for the full technical review, findings, fixes, risks, and recommended next steps.

## Current UI Direction

The active design is based on `design-previews/duel-terminal-pro.html`.

It uses:

- a dark tactical game-board background with subtle grid lines;
- a sticky top navigation/search bar;
- compact card tiles with image-first scanning;
- gold/blue accents for interaction states;
- a modal detail view with a large card image and structured stats.

There is also an alternate reference mockup:

- `design-previews/cyber-duel-search.html`: a more cyber-terminal variant using green/cyan scanline styling, denser technical chrome, and a stronger terminal aesthetic.

These mockups are static HTML references only. They are not part of the React runtime unless their patterns are manually ported into the app.

## Installation

Use the package manager [npm](https://nodejs.org/) to install node packages.

```bash
npm install --legacy-peer-deps
```

`--legacy-peer-deps` is recommended for this project because it uses older CRA/MUI/React dependency versions that can conflict with modern npm peer dependency resolution.

## Usage

```bash
# React development server
npm start
```

Then open:

```text
http://localhost:3000
```

## Build

```bash
npm run build
```

The app currently builds successfully, although ESLint may report minor warnings for unused imports.

## Tests

```bash
npm test -- --watchAll=false
```

If your environment blocks Jest worker processes, run tests from a normal terminal session instead of a restricted sandbox.

## API Notes

This app uses the YGOPRODeck v7 Card Information endpoint:

```text
https://db.ygoprodeck.com/api/v7/cardinfo.php
```

The search input uses `fname`, which performs fuzzy name matching. For exact card name lookup, the API supports `name`.

Useful API behavior:

- `fname=dragon` returns cards with `dragon` in the name.
- `misc=yes` returns additional card metadata.
- `language=fr|de|it|pt` returns translated card data when available.
- English is the default and does not require a `language` parameter.

YGOPRODeck rate limits requests to 20 requests per second. The app triggers searches manually with Enter or the search icon, and blocks duplicate in-flight requests.

The current request flow uses `AbortController`: when a newer search starts, the previous request is aborted and ignored. There is also a 15-second timeout that returns a visible error message if the API does not respond.

## Design Risk Notes

Changing the base design can introduce regressions that are easy to miss because this app renders remote card data with unpredictable names, descriptions, images, stats, and result counts.

Watch especially for:

- responsive layout breaks in the sticky navbar, search input, language selector, and pagination controls;
- long card names or translated text overflowing compact tiles and modal stat panels;
- card records without expected optional fields such as `race`, `attribute`, `def`, `scale`, `linkval`, `archetype`, or extra images;
- modal content becoming taller than the viewport on small screens;
- disabled pagination buttons looking clickable after restyling;
- low contrast when changing the dark theme palette;
- hover/animation effects causing layout shift in the card grid;
- excessive image loading if future designs increase the number of visible cards per page;
- reintroducing measurement-heavy layouts that can bring back `ResizeObserver` development overlays;
- inconsistent language between English UI text and Spanish user-facing error/loading states.

Before merging future design changes, test at least:

```bash
npm run build
npm test -- --watchAll=false
```

Then manually check mobile and desktop widths with searches such as `dragon`, `dark magician`, `blue-eyes`, and a no-result query.

## Troubleshooting

### `react-scripts` is not recognized

Reinstall dependencies:

```bash
npm install --legacy-peer-deps
```

Then retry:

```bash
npm start
```

### `ResizeObserver loop completed with undelivered notifications`

This error was commonly triggered by the previous Masonry layout in development. The results grid now uses CSS Grid to reduce this issue.

If the CRA overlay still appears after pulling this branch, refresh the browser tab and restart the dev server.

### Windows startup

The development script no longer uses Unix-only syntax like:

```bash
PORT=8000 react-scripts start
```

Use:

```bash
npm start
```

## Deployment

```bash
npm run build
npm run deploy
```

The `deploy` script publishes the `build` folder through `gh-pages`.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
