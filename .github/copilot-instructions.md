# SR5-FoundryVTT Agent Instructions

FoundryVTT system for Shadowrun 5th edition, written in TypeScript, SCSS, and Handlebars.

## Skills

Load the matching skill before acting. The skills hold the detailed rules; this file only gives the always-on basics.

- Writing or changing code: `sr5-foundryvtt-coding-guideline` (layers, gameplay tests, modifiers, cross-document values,
  GM-only writes, Quench, packs, verification).
- Reviewing a diff or pull request: `sr5-foundryvtt-code-review`.
- Changing locale keys: `locale-structure-sync`.
- Sourcebook citations such as `SR5#140`: `sourcebook-citation-resolution` and
  `sourcebook-citation-implementation-review`.
- Live Foundry session at `http://localhost:30000`: `foundry-session`.

## Project map

Paths are relative to `src/module/`.

- Bootstrap: `main.ts` calls `HooksManager.registerHooks()` (`hooks.ts`) and `HandlebarManager.registerHelpers()`.
  `hooks.ts` registers document classes, sockets, global API (`game.shadowrun5e`), and optional module integrations.
- Documents: `SR5Actor`, `SR5Item`, `SR5Combat`, `SR5Combatant`, `SR5ChatMessage`, `SR5ActiveEffect`,
  `SR5TokenDocument`. System data lives under `.system`.
- Layers: rules in `rules/`, flows in `**/flows/`, sheets and apps in `**/sheets/` and `apps/`, gameplay tests
  (`SuccessTest`, not unit tests) in `tests/`.
- Unit tests: Quench specs in `src/unittests/`, registered in `src/unittests/quench.ts`. They run inside Foundry, not
  with a standalone Mocha CLI.
- Generated output: `dist/` and `packs/` (except `packs/_source`). Never edit them by hand.

## Code style

- camelCase for variables, functions, and JSON properties; PascalCase for classes and types.
- Single quotes, 4-space indentation, `async`/`await`, template literals for interpolation.
- Keep edits surgical and local to the feature. Follow existing naming and folder patterns, and extend existing flows,
  rules, and tests instead of adding parallel abstractions.

## Before finishing

CI runs `npm test`, `npm run lint:errors`, `npm run build:prod`, and `npm run validate:packs`. Keep all four passing.
Run the narrower checks listed in the coding guideline while working.

## Sourcebooks

Sourcebook citation tooling belongs to the sibling project `mcp-sourcebook-citation`. Use its MCP server for book codes,
pages, and headings. If MCP is unavailable, fall back in order to `mcp-sourcebook-citation/data/indexes/`
(`book-index.json`, `page-index.json`), `data/catalog/books.xml`, then `data/sourcebooks/md/`. Book-code overrides live
in `config/book-overrides.json`. Do not add sourcebook text, indexes, or MCP server code to this repository.
