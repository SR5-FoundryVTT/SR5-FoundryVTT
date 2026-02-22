# AI Coding Agent Guide (SR5-FoundryVTT)

FoundryVTT Shadowrun 5e system implemented in TypeScript + SCSS + Handlebars templates.

## Architecture: layers and boundaries
- Keep the layer split strict: documents (`src/module/actor`, `src/module/item`, `src/module/combat`), sheets (`src/module/**/sheets`), flows (`src/module/**/flows`), rules (`src/module/rules`).
- Documents are the main API surface for game behavior and should orchestrate calls; rules should stay Shadowrun-specific and minimize direct Foundry API usage.
- Flows connect Foundry-facing behavior and rules; they may aggregate data, but avoid pushing Foundry details into rules.
- Core document classes: `SR5Item`, `SR5Actor`, `SR5Combat`, `SR5Scene`, `SR5Message`.
- System data lives on document instances under `.system` (example: `SR5Item.system.attributes.body.value`).
- Main bootstrap path is `src/module/main.ts` -> `HooksManager.registerHooks()` and `HandlebarManager.registerHelpers()`.

## Testing and key distinction
- `SuccessTest` and subclasses in `src/module/tests` are gameplay test implementations, not unit tests.
- Automated tests are registered through Quench in `src/unittests/quench.ts`, with spec files under `src/unittests/**/sr5.*.spec.ts`.
- Test style is Mocha/Chai compatible via Quench; do not assume standalone Mocha CLI execution in this repo.
- Test creation and value merge behavior is centered in `src/module/tests/TestCreator.ts`.

## Data and socket flows
- Shared cross-document state is centralized through `DataStorage` and exposed via `SRStorage` in `src/module/storage/storage.ts`.
- Socket transport is wrapped by `SocketMessage` in `src/module/sockets.ts` (`emit` for broadcast, `emitForGM` for GM-targeted calls).
- Socket handling is wired from hooks (`HooksManager` in `src/module/hooks.ts`) and flow handlers such as `src/module/flows/SocketMessageFlow.ts`.
- Player write escalation pattern: `DataStorage.set` -> `_setAsPlayer` -> `SocketMessage.emitForGM` -> GM socket handler in hooks.

## Critical workflows (run these, don’t invent)
- Watch/dev compile: `npm run watch`
- Type-check gate: `npm test`
- Lint: `npm run lint` (or `npm run lint:errors` for errors only)
- Auto-fix lint: `npm run lint:fix` (or `npm run lint:errors:fix`)
- Package compendiums: `npm run build:db`
- Unpack compendiums: `npm run unpack:db`
- Foundry runtime is usually launched via VS Code tasks (`FoundryVTT 12`, `FoundryVTT 13`).
- CI gates are `npm test` and `npm run lint`; keep changes passing both.

## Project conventions
- Use camelCase for variables/functions/JSON properties; PascalCase for classes/types.
- Use single quotes, 4 spaces indentation, async/await for async flows, template literals when interpolating variables.
- Keep edits surgical and local to the feature; preserve existing naming and folder patterns.
- Prefer updating existing flows/rules/tests over adding parallel abstractions.
- Keep esbuild output compatible with class-name based test registration (build uses non-minified output).

## Integration points to respect
- Hook registration and global API wiring: `src/module/hooks.ts`.
- Optional module integrations currently include `routinglib` and `dice-so-nice` (initialized in hooks).
- Active-effect and modifier behavior is centered around `DocumentSituationModifiers` and `SR5ActiveEffect` flows/rules.
- Core mechanics to preserve when changing logic: modifiers, combat/initiative, magic/spirits, matrix/hacking, technomancer, and rigging flows.
- Compendium source of truth is `packs/_source`; use pack scripts to persist GUI changes.