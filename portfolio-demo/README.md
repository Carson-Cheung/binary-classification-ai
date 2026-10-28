# Portfolio Demo

This is the version of the classifier that runs on my portfolio website.
It is based on v2.0 (repo root) with a few changes for the web:

- brain.js is pinned to `2.0.0-beta.24` instead of the latest version
- no hardcoded local training image counts
- the Check Accuracy and Download Model buttons are removed

## Run

Serve this folder with any local web server, for example:

```bash
npx serve .
```

## Build

TypeScript source is in `src/`. Compiled output goes to `js/`:

```bash
npx tsc -p .
```
