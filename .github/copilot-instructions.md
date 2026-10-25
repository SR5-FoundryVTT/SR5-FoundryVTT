# SR5-FoundryVTT Agent Instructions

FoundryVTT system for Shadowrun 5th edition, written in TypeScript, SCSS, and Handlebars.

## Skills

Load the matching skill before acting. The skills hold the detailed rules.

- Writing or changing code: `sr5-foundryvtt-coding-guideline`.
- Reviewing a diff or pull request: `sr5-foundryvtt-code-review`.
- Changing locale keys: `locale-structure-sync`.
- Sourcebook citations such as `SR5#140`: `sourcebook-citation-resolution` and
  `sourcebook-citation-implementation-review`.
- Live Foundry session at `http://localhost:30000`: `foundry-session`.

## Project map

Paths are relative to `src/module/`. Layer rules and folder roles are in the coding guideline's Layers section.

- Bootstrap: `main.ts` calls `HooksManager.registerHooks()` (`hooks.ts`) and `HandlebarManager.registerHelpers()`.
  `hooks.ts` registers document classes, sockets, global API (`game.shadowrun5e`), and optional module integrations.
- Documents: `SR5Actor`, `SR5Item`, `SR5Combat`, `SR5Combatant`, `SR5ChatMessage`, `SR5ActiveEffect`,
  `SR5TokenDocument`. System data lives under `.system`.
- Unit tests: Quench specs in `src/unittests/`. Test rules are in the guideline's Quench section.
- Generated output: `dist/` and `packs/` (except `packs/_source`). Build rules are in the guideline.

## Code style

- camelCase for variables, functions, and JSON properties; PascalCase for classes and types.
- Single quotes, 4-space indentation, `async`/`await`, template literals for interpolation.
- Keep edits surgical and local to the feature. Follow existing naming and folder patterns, and extend existing flows,
  rules, and tests instead of adding parallel abstractions.

## Before finishing

Pass the CI gates and run the narrower checks listed in the coding guideline's Verification section.

## Sourcebooks

Citation lookup rules are owned by the sourcebook skills; follow them rather than reading sourcebook files by path. This
repository holds no sourcebook text, generated indexes, or MCP server code. Those belong to the sibling project
`mcp-sourcebook-citation`.
