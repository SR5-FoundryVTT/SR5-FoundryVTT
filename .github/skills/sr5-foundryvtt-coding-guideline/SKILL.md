---
name: sr5-foundryvtt-coding-guideline
description:
    'Use when: writing or changing code in the SR5-FoundryVTT Shadowrun 5e system (TypeScript, Handlebars, SCSS);
    deciding which layer (app / sheet, data prep, flow, rules, tests) code belongs in; implementing or changing
    SuccessTest tests, actions, categories, or modifiers; resolving values that come from another document (roll data,
    vehicle drivers, PAN masters, rigging); writing world data as a player (GM-only writes, sockets); adding Quench unit
    tests; editing compendium pack sources or translations; choosing which npm check to run before finishing.'
argument-hint: 'Describe the code change (feature, rule, flow, test, or sheet)'
---

# SR5-FoundryVTT Coding Guideline

The rules for changing code in the Shadowrun 5e FoundryVTT system. Stack: TypeScript, esbuild, Sass, Handlebars, Gulp,
npm. The repository custom instructions (naming, formatting, async style) still apply.

This skill is the single source of these rules. The [code review skill](../sr5-foundryvtt-code-review/SKILL.md) links
here instead of repeating them.

How to use it: read the sections for every layer your change touches, follow the rules there, then run
[Verification](#verification).

## Layers

Paths are relative to `src/module/`. Documents are the main API surface and orchestrate calls into flows and rules.
Extend existing flows and rules instead of adding parallel abstractions.

| Layer          | Location                                                       | Rules                                                                                                                                                                                                                                                                                                                                                                                                        |
| -------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| App / sheet    | `*/sheets/`, `apps/`, dialogs, chat messages, templates        | Foundry logic: windows, dialogs, rendering, chat messages. Interface only. Do not make Shadowrun decisions here (for example computing a test pool in a sheet handler).                                                                                                                                                                                                                                      |
| Data prep      | `actor/prep/`, `item/prep/`                                    | Document data derived from system data and rules, run by `prepareBaseData` and `prepareDerivedData` on `SR5Actor` and `SR5Item`. Derive values from the document's own data and embedded items, and call rules for the math. Do not write documents, use `ui.*`, or create `ChatMessage`s. Do not pull values from other documents; see [Cross-document value resolution](#cross-document-value-resolution). |
| Flow           | `actor/flows/`, `item/flows/`, `tests/flows/`, `effect/flows/` | Connecting logic: order of operations between rules and Foundry documents, aggregating data, collecting output. Flows may use Foundry APIs. Call rules for calculations; do not reimplement them. Add Quench specs where practical.                                                                                                                                                                          |
| Rules          | `rules/`                                                       | System rule abstractions: Shadowrun logic on system types and plain data. Do not add `game`, `ui`, `canvas`, or `ChatMessage` usage. `WeaponRangeRules` and `DocumentSituationModifiers` already do; do not copy them. Prefer not to add `foundry.utils` calls. Cover rule changes with Quench specs.                                                                                                        |
| Gameplay tests | `tests/`                                                       | `SuccessTest` subclasses. See [Gameplay tests](#gameplay-tests-successtest).                                                                                                                                                                                                                                                                                                                                 |

## Gameplay tests (SuccessTest)

`SuccessTest` (`tests/SuccessTest.ts`) and its subclasses implement in-game dice tests. They are not unit tests; those
are [Quench specs](#quench-unit-tests).

- Extend `SuccessTest` for every new gameplay test and register it in `game.shadowrun5e.tests`. Look classes up only
  through that registry (`TestCreator._getTestClass` reads it).
- Create tests with the `from*` helpers of `TestCreator` (`tests/TestCreator.ts`, exposed as `game.shadowrun5e.test`).
  Do not assemble test data by hand or call a test constructor directly without a reason.
- Create opposed, resist, and followup tests with the existing helpers (for example
  `TestCreator.fromOpposedTestResistTest`), never in sheet code.
- Action-driven tests read their configuration from an item's `system.action` (example: `SR5MatrixActorSheet.ts`).
- Put test-specific behaviour (titles, followups, result handling) in a subclass override. Do not change `SuccessTest`
  for one test.
- `showDialog` and `showMessage` default to `true`. Set them to `false` only when a flow skips that UI on purpose.
- `TeamworkTest` (`actor/flows/TeamworkFlow.ts`) is a standalone class, not a `SuccessTest` subclass.

## Modifiers and categories

- Resolve test modifiers through `ModifierFlow` (`actor/flows/ModifierFlow.ts`) and situational modifiers through
  `rules/DocumentSituationModifiers.ts`.
- Put modifier math in `rules/modifiers/`, not in sheets or flows.
- Use the existing test and action categories to vary behaviour. Do not hard-code behaviour for a single test class.

## Cross-document value resolution

When a document needs a value owned by another document, resolve it in the roll data pipeline. Before adding the read,
check whether `getRollData`, or a flow it dispatches to, already resolves the value. Use it if so; otherwise extend that
flow. Do not write a separate resolver in a sheet, template, or data preparation method.

### How the pipeline works

- **Entry points.** `SR5Actor.getRollData` and `SR5Item.getRollData` start from a copy of `system` and delegate to
  `ActorRollDataFlow.getRollData` and `ItemRollDataFlow.getRollData`.
- **Dispatch.** `ActorRollDataFlow.injectVehicleDriverRollData` injects driver values into a vehicle. `ItemRollDataFlow`
  dispatches by action category; `matrix` goes to `matrixTestRollDataFlow`, which handles PAN slaves and owned devices.
- **Copy and merge.** Rules do the injection: `RiggingRules.modifyRollDataForDriver`, `AttributeRules.injectAttributes`,
  and `SkillRules.injectSkills`. They deep-clone each source value. `bigger: false` replaces the local value (rigger);
  `bigger: true` keeps the higher value (PAN master).
- **Timing.** `TestCreator` calls `actor.getRollData({againstData, copySystem: true})` and
  `item.getRollData({action, testData, againstData})` before building the pool. Tests see resolved values; stored data
  is unchanged.

Example, rigging: a vehicle with no driver, or in `autopilot`, tests with its own values. In any other control mode
(`manual`, `remote`, `rigger`) with a driver set, `isControlledByDriver()` is true and the driver's attributes and
skills are injected. For a rigger, tests that `RiggingRules.isConsideredMatrixAction` accepts also get Matrix modifiers
(`tests/flows/RiggingTestDataFlow.ts`).

### Rules

1. **Copy, never write.** Work on the roll data copy (`copySystem: true`) and deep-clone injected values. Never write
   resolved values into a document's `system`.
2. **Gate on relationship state.** Inject only when the relationship applies (`isControlledByDriver()`, PAN master
   checks).
3. **Stay synchronous.** `getRollData` is sync. Resolve links with sync accessors (`getVehicleDriver()`,
   `MatrixNetworkFlow.resolveLink`). Compendium documents cannot be resolved here (see the NOTE in
   `ItemRollDataFlow.getRollData`).
4. **Pass context as options.** Action, `testData`, and `againstData` travel in `RollDataOptions`, so one document can
   resolve differently per test (for example, `matrixTestRollDataFlow` skips master injection for `MatrixResistTest`).
5. **Split rule and wiring.** Which values and when goes in `rules/` with a sourcebook citation (as `RiggingRules` cites
   SR5#266). Document wiring goes in the flow.
6. **Use existing link accessors.** `master`, `actorOwner`, `getVehicleDriver()`, `getTechnomancer()`. Do not add
   `fromUuidSync` calls; some sheets still do, do not copy them.
7. **Know which accessors resolve.** `SR5Actor.getAttribute` and `getSkill` return resolved values unless you pass
   `rollData`. For the document's own value, read `system` or pass its own data.
8. **Decide what the sheet shows.** Edit mode renders local `toObject` data. Play mode builds context from `getRollData`
   (`handlebars/SR5ApplicationMixin.ts`), so injected values appear there. State which view a new value should show.

`MatrixICFlow.handleUpdateItemHost` predates this pattern (see its TODO). Move such logic onto `getRollData` when you
change it, not as a separate refactor.

## GM-only writes and sockets

Players cannot update world documents or settings they do not own. Use the existing escalation path:

- `DataStorage.set` and `DataStorage.unset` (`data/DataStorage.ts`) check `game.user?.isGM`. A player forwards the
  change with `SocketMessage.emitForGM` (`sockets.ts`) and a flag from `FLAGS` (`constants.ts`).
- GM handlers are registered in `hooks.ts` and implemented in `flows/SocketMessageFlow.ts`.

Rules:

- Guard every `update`, `setFlag`, `game.settings.set`, or `DataStorage` write that a player can trigger with
  `game.user?.isGM`, or route it through `SocketMessage.emitForGM`.
- Add each new socket flag to `FLAGS` and register a GM-side handler for it.
- `SocketMessage.emit` broadcasts to every client. Do not send GM-only data with it.
- In GM handlers, check that a client-supplied document exists and that the requesting user may change it.

## Localization

- Show user-facing text through `game.i18n.localize` or `game.i18n.format`, not hard-coded strings in code or templates.
- Edit translations in `public/locale/<language>/config.json`; `system.json` loads them from `dist/locale/`.
- `public/locale/en/config.json` is the base. Keep `de`, `fr`, `ko`, and `pt-BR` structurally identical with the
  `locale-structure-sync` skill and `npm run locale:check`.

## Quench unit tests

- Specs live in `src/unittests/` as `*.spec.ts` and run inside Foundry. Run them with the CLI in
  [Running Quench](#running-quench), not a standalone Mocha runner. Register each new spec in `src/unittests/quench.ts`,
  or it never runs. Batch keys are dotted (`shadowrun5e.<area>.<name>`).
- Rule changes need specs. Flows should have them where practical. Application code does not need them.
- Run the batch that covers your change before reporting it done. A failing batch is not done.
- Quench is dev-only: `hooks.ts` imports `hooks-dev` only when `process.env.ENV === 'dev'`. Never import
  `src/unittests/` or `hooks-dev` from production code.
- Clean up documents a spec creates in the world.

## Build output and compendium packs

- `dist/` is generated. Edit `src/` and `public/`, never `dist/`. The system loads `dist/bundle.js`, `dist/bundle.css`,
  `dist/locale/`, `dist/templates/`, and `dist/tours/`.
- Keep esbuild `minify: false` and `keepNames: true` (`gulp.tasks.js`). Class names are used as string references.
- New `system.json` entries (esmodules, styles, languages, packs) point into `dist/` or `packs/`.
- Compendium sources are JSON under `packs/_source/`, the source of truth. `packs/` output is git-ignored and must not
  be committed.
- Persist GUI compendium edits with `npm run unpack:db`. `npm run update:pack-sources` exports from a running world into
  `packs/_source` (`-- --check` reports without writing and exits `1` when changes are needed). Review the Git diff
  afterwards.
- Files whose names collide with `RESERVED_FILE_BASENAMES` (`utils/packs.mjs`) get a leading `_`.
- `npm run build:db` rebuilds `packs/`. `npm run package` builds assets and packs for a release.

## Compatibility

- Foundry VTT: minimum `14.363`, maximum `14` (`system.json`). Use only APIs that exist in that range; check them
  against the installed Foundry types.
- Node: `>=24.13.1 <25.0.0` (`package.json` engines).
- The console warning about `CONST.ACTIVE_EFFECT_MODES` is an expected Foundry v14 deprecation notice. Ignore it.

## Comments and citations

- Comment only code that needs clarification. Do not restate the code.
- When code implements or cites a Shadowrun rule with a book code (for example `SR5#140`), check it with the
  `sourcebook-citation-implementation-review` skill.
- When a change alters a documented workflow, command, or layer, update `README-DEV.md` and this skill.

## Verification

Run the smallest command that covers the change while working. Before finishing, the four CI gates
(`.github/workflows/test.yml`) must pass:

| Command                  | Checks                                                | Run for                               |
| ------------------------ | ----------------------------------------------------- | ------------------------------------- |
| `npm test`               | Type-checks `tsconfig.json` and `tsconfig.tests.json` | Any TypeScript                        |
| `npm run lint:errors`    | oxlint `--type-aware`, errors only (`.oxlintrc.json`) | Any TypeScript                        |
| `npm run build:prod`     | Production build                                      | Any source, build, or template change |
| `npm run validate:packs` | Compiles pack sources to a temp directory             | Pack source changes                   |

Change-specific checks:

| Change                    | Command                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------- |
| Rule or flow behaviour    | `npm run quench -- <batch>` against a dev world ([Running Quench](#running-quench))   |
| Sheet, template, or style | Check the running world with the `foundry-ui-debugging` instructions after rebuilding |
| Locale keys               | `npm run locale:check`                                                                |

`npm run lint` and `npm run lint:fix` cover warnings. `npm run format:all` runs Prettier; keep formatting-only changes
separate from behaviour changes.

### Running Quench

The CLI (`scripts/quench.mjs`, npm script `quench`) joins a running world through Playwright, runs the Quench batches
matching a pattern, and prints each result. Quench is not one of the CI gates, so run it locally. CI cannot run it: the
Foundry world only runs in a local session.

Setup, once per machine and then per session:

1. Install the browser: `npx playwright install chromium`.
2. Build the development bundle: `npm run build:dev`, or keep `npm run watch:dev` running. Quench batches load only in
   this build (`hooks-dev`).
3. Start Foundry on `http://localhost:30000` with a world that uses the development system and has Quench installed.

Commands (quote patterns that contain `*` so the shell does not expand them):

```bash
npm run quench -- shadowrun5e.rules.ranged_weapon   # one batch
npm run quench -- 'shadowrun5e.flow.**'             # a family of batches
npm run quench                                      # full suite, pull request preparation only
npm run quench -- 'shadowrun5e.rules.**' --headed   # watch the browser
```

- Batch keys are the `registerBatch` keys in `src/unittests/quench.ts`. The pattern matches these keys, so it selects
  which batches run.
- Agent runs: run only the batches connected to the feature being worked on, using the narrowest key or prefix that
  covers it. Do not run the full suite during development.
- Pattern precedence: `--pattern <p>` (or `--pattern=<p>`), then `QUENCH_PATTERN`, then the positional argument, then
  `shadowrun5e.**`.
- Output: `✓` passed, `✗` failed, `○` neither passed nor failed. Failure stacks are mapped back to `src/` through source
  maps.
- Exit code: `0` when all tests pass, `1` on any failure or fatal error.
- Full suite (`npm run quench` with no pattern): run it only once the work is complete and a pull request is being
  prepared.

Environment variables, also read from the git-ignored `.env.local` (existing variables win):

| Variable                  | Default                  | Purpose                                                        |
| ------------------------- | ------------------------ | -------------------------------------------------------------- |
| `FOUNDRY_URL`             | `http://localhost:30000` | World URL                                                      |
| `FOUNDRY_USER`            | `Gamemaster`             | User to join as                                                |
| `FOUNDRY_PASSWORD`        | none                     | Password, if the user has one                                  |
| `QUENCH_PATTERN`          | `shadowrun5e.**`         | Default batch pattern                                          |
| `QUENCH_RUN_TIMEOUT`      | 600000 (ms)              | Watchdog for the whole run; per-test timeouts stay in the spec |
| `QUENCH_PAGE_LOGS`        | off (`1` enables)        | Forward browser console output                                 |
| `FOUNDRY_BROWSER_CHANNEL` | Playwright Chromium      | Browser channel, for example to use an installed Chrome        |
