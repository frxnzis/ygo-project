# YGO Project

[YGO Project](https://frxnzis.github.io/ygo-project/) is a personal web app aimed at improving the UI and UX of a typical Yu-Gi-Oh! card finder, using the [YGOPRODECK](https://db.ygoprodeck.com/api-guide/) API.

## About This Rebuild

This branch includes a rebuild pass focused on making the app easier to run locally and improving the card search flow.

Main improvements:

- Fixed local startup issues caused by dependency resolution problems.
- Added safer YGOPRODeck API requests using `URLSearchParams`.
- Added search by pressing `Enter`, in addition to clicking the search icon.
- Added a loading state while card results are being fetched.
- Prevented duplicate API requests from repeated clicks or key presses.
- Replaced the dynamic Masonry layout with responsive CSS Grid to reduce `ResizeObserver` runtime overlay issues.
- Updated the default CRA test to verify the real app UI.

See [PROJECT_REVIEW.md](./PROJECT_REVIEW.md) for the full technical review, findings, fixes, risks, and recommended next steps.

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
