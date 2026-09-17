# Warscript

A TypeScript-to-Lua library for Warcraft III, used with Warpack.

## Install from Git

Install the latest commit on `main`, including changes not yet published to npm:

```sh
npm install git+https://github.com/rhazarian/warscript.git#main
```

Replace `main` with a branch, tag, or full commit SHA to select another revision.
Commit `package-lock.json` to keep the resolved Git commit reproducible. To move
to the latest commit on the branch, run the install command again.

Git and a recent Node.js version are required (tested with Node.js 24). npm runs `prepare` to install the build
dependencies and compile the library to Lua and TypeScript declarations. Allow
lifecycle scripts when installing; `--ignore-scripts` skips the required build.
Peer dependencies, including the Warscript TSTL plugin, still come from npm.

Existing imports stay the same:

```ts
import "warscript"
import { Unit } from "warscript/core/types/unit"
```

## Build and publish

```sh
npm ci
npm run build
npm run publish -- --tag dev
```

`npm ci` also builds through `prepare`. `npm run build` rebuilds `dist` explicitly.
Registry releases continue to publish the contents of `dist` with the same module
paths as before. Git installations package `dist` and resolve those paths through
the repository's package manifest.
