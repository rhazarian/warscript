# warscript

A TypeScript library for **Warcraft III map development** (used together with [Warpack](https://github.com/rhazarian/warpack)). It is consumed by map projects as a library; it is not an application and never runs in Node or a browser.

## Compilation: tstl, not tsc

The project compiles **TypeScript → Lua** with [TypeScriptToLua](https://typescripttolua.github.io/) (`tstl`). It never compiles to JavaScript.

- **Plain `tsc` is not used at all.** Do not run it, do not suggest it, do not reason about JS output. (`tsc`/`tsc-watch` exist in `node_modules/.bin` only as transitive artifacts — ignore them.)
- **To check that the code compiles, run `tstl`** — that is the only meaningful build/typecheck. `tstl` performs the TypeScript type check *and* the Lua emit, and reports both TS diagnostics and tstl-specific ones (unsupported constructs, language-extension misuse, etc.), which `tsc` would silently miss.
- Compiler settings live in `tsconfig.json`, including the `tstl` section: `buildMode: "library"`, `luaTarget: "5.3"`, `noImplicitSelf`, `luaLibImport: "require"`, and the `@warscript/tstl-plugin` Lua plugin. The plugin affects emit, so the tstl run is the real source of truth.

## Running commands: npm yes, npx no

- **`npm` is used normally** — `npm install`, `npm run <script>`, etc.
- **`npx` is not used.** Invoke local binaries directly from `node_modules/.bin` (e.g. `.\node_modules\.bin\tstl.cmd` on Windows PowerShell, `./node_modules/.bin/tstl` in bash) or via an `npm run` script.

### Commands

```powershell
.\node_modules\.bin\tstl.cmd            # compile + typecheck (the check to run)
npm run build                           # clean + tstl + copy .d.ts/.lua/LICENSE/package.json into dist
npm run clean                           # rimraf dist
.\node_modules\.bin\eslint.cmd src      # lint (eslint + prettier via .eslintrc.cjs)
```

There are no tests.

## External TypeScript dependencies are shipped as Lua

Every "TypeScript" dependency in this ecosystem (`@warscript/*`, other tstl libraries) is itself compiled with tstl and **published as Lua plus `.d.ts` declarations** — exactly like this package's own `npm run build` output.

So when the `.d.ts` declarations are not enough to understand what a dependency actually does, **read the compiled Lua in `node_modules/<pkg>/`** (the `.lua` files sitting next to the `.d.ts` files). That is the real implementation; there is no JS or original TS to look at. Declarations tell you the types, the Lua tells you the behavior.

## Layout

- `src/` — library source. `src/engine/` is the Warcraft III game layer (units, abilities, buffs, object data/fields, behaviours); `src/core/` low-level primitives; plus `math/`, `net/`, `time/`, `util/`, `utility/`, `objutil/`, `global/`, `decl/`.
- `*.lua` and `*.d.ts` files inside `src/` are hand-written passthrough sources (e.g. `src/patch-lua.lua`, `src/types.lua`) — the build copies them into `dist` verbatim.
- `language-extensions/`, `tstl-plugin/` — local sources of the `@warscript/language-extensions` and `@warscript/tstl-plugin` peer packages.
- `dist/` — build output, generated; never edit.

## Environment notes

- Runtime target is the Warcraft III Lua VM (Lua 5.3 dialect via tstl), so no Node/DOM APIs, and standard-library assumptions must match what WC3's Lua and this library's patches (`patch-lua`, `patch-lualib`, `patch-natives`) provide.
- The repo is developed on Windows; shell examples above use PowerShell paths.

## Quirks of the Warcraft III Lua runtime

The WC3 Lua VM is not a complete Lua 5.3 environment — `lua-types` declares the full standard library, so the type checker will happily accept things that do not exist at runtime. Known gaps:

- **`collectgarbage` is not available.** Do not call it — not for `"count"`, not for `"collect"`, not as an entropy source. It type-checks and then fails in game.

Anything else discovered to be missing or to behave differently belongs in this list.
