---
name: sr5-foundryvtt-code-review
description:
    'Use when: reviewing a change, diff, or pull request in the SR5-FoundryVTT Shadowrun 5e system; checking layer
    boundaries (rules, flows, application, tests); checking SuccessTest, TestCreator, and modifier usage; checking
    cross-document value resolution and getRollData injection; checking GM-only writes and socket messages; checking
    Quench coverage, translations, pack sources, and build output; deciding which verification commands a change needs.'
argument-hint: 'Name the branch, PR, or diff to review'
---

# SR5-FoundryVTT Code Review

How to review changes to the Shadowrun 5e FoundryVTT system. The rules live in the
[coding guideline skill](../sr5-foundryvtt-coding-guideline/SKILL.md). Load it first. This skill says what to look for
in a diff, how severe a finding is, and how to report it. Do not restate guideline rules in findings; link to them.

## Procedure

1. Read the diff and list the areas it touches, using the table below.
2. For each touched area, read the linked guideline section and check the diff against the signals.
3. Check that the author ran the [verification commands](../sr5-foundryvtt-coding-guideline/SKILL.md#verification) the
   change needs. Ask for evidence when it is missing. Quench cannot run in a pull request workflow, because the Foundry
   world only runs in a local session. Do not flag a missing Quench CI check. Ask for evidence that the author ran the
   relevant batch locally.
4. Report findings in the [output format](#output-format).

Only report findings you can point to in the diff. Do not flag style that oxlint or Prettier already enforce. When a
guideline rule is unclear, ask instead of guessing.

## Severity

- **Blocking**: breaks behaviour, corrupts or leaks data, or fails CI.
- **Should fix**: breaks a guideline rule without immediate breakage.
- **Nit**: clarity only.

## Signals by area

Severity is the default; raise or lower it with a reason.

| Area                     | Flag in the diff                                                                                                                                                                                                                     | Default                                              | Rule                                                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Rules layer              | New `game.`, `ui.`, `canvas.`, or `ChatMessage` in `src/module/rules/`. New `foundry.utils` calls (ask, do not block).                                                                                                               | Should fix                                           | [Layers](../sr5-foundryvtt-coding-guideline/SKILL.md#layers)                                                       |
| Flows and application    | Rule math reimplemented in a flow; Shadowrun decisions in a sheet, dialog, or template; a new mechanism where `ModifierFlow`, `TestCreator`, or `SocketMessage` already fits.                                                        | Should fix                                           | [Layers](../sr5-foundryvtt-coding-guideline/SKILL.md#layers)                                                       |
| Gameplay tests           | Test class not registered in `game.shadowrun5e.tests`; tests built without `TestCreator`; opposed or resist logic in sheets; `SuccessTest` changed for one test; changed `showDialog`/`showMessage` defaults.                        | Should fix; blocking if existing tests break         | [Gameplay tests](../sr5-foundryvtt-coding-guideline/SKILL.md#gameplay-tests-successtest)                           |
| Modifiers                | Modifier math outside `rules/modifiers/`; modifiers resolved without `ModifierFlow`; behaviour hard-coded per test class instead of by category.                                                                                     | Should fix                                           | [Modifiers and categories](../sr5-foundryvtt-coding-guideline/SKILL.md#modifiers-and-categories)                   |
| Cross-document values    | New `fromUuidSync`, `master`, `actorOwner`, `getVehicleDriver()`, or foreign `system` reads in sheets, templates, prep, or flows that `getRollData` should carry; sheets newly showing injected values without stated intent.        | Should fix                                           | [Cross-document value resolution](../sr5-foundryvtt-coding-guideline/SKILL.md#cross-document-value-resolution)     |
| Cross-document values    | Resolved values written into `system`; injection without `copySystem` or deep clone; injection without a relationship gate; async or compendium lookups in `getRollData`.                                                            | Blocking                                             | [Cross-document value resolution](../sr5-foundryvtt-coding-guideline/SKILL.md#cross-document-value-resolution)     |
| World writes and sockets | Player-reachable `update`, `setFlag`, `game.settings.set`, or `DataStorage` write without a GM guard or `emitForGM`; flag emitted but not handled; GM-only data in `SocketMessage.emit`; GM handler trusting client ids.             | Blocking                                             | [GM-only writes and sockets](../sr5-foundryvtt-coding-guideline/SKILL.md#gm-only-writes-and-sockets)               |
| Localization             | Hard-coded user-facing text; new keys missing from other locales.                                                                                                                                                                    | Should fix; blocking if `npm run locale:check` fails | [Localization](../sr5-foundryvtt-coding-guideline/SKILL.md#localization)                                           |
| Quench specs             | Rule change without a spec change; rule or flow change without evidence of a local Quench run (ask); spec not registered in `quench.ts`; production import of `src/unittests/` or `hooks-dev`; specs leaving world documents behind. | Should fix; production import is blocking            | [Quench unit tests](../sr5-foundryvtt-coding-guideline/SKILL.md#quench-unit-tests)                                 |
| Build and packs          | Edits in `dist/`; minification enabled or `keepNames` removed; LevelDB or `packs/` output committed; `system.json` entries outside `dist/` or `packs/`; reserved pack basenames without `_`.                                         | Blocking                                             | [Build output and compendium packs](../sr5-foundryvtt-coding-guideline/SKILL.md#build-output-and-compendium-packs) |
| Compatibility            | Foundry APIs outside the supported range. Do not flag the `CONST.ACTIVE_EFFECT_MODES` warning.                                                                                                                                       | Blocking                                             | [Compatibility](../sr5-foundryvtt-coding-guideline/SKILL.md#compatibility)                                         |
| Comments and docs        | Comments that restate code; new or changed sourcebook citations not checked; changed workflows without `README-DEV.md` or guideline updates.                                                                                         | Nit; unchecked citations should fix                  | [Comments and citations](../sr5-foundryvtt-coding-guideline/SKILL.md#comments-and-citations)                       |

## Output format

For each finding:

- severity
- file and line
- what is wrong, in one sentence, with a link to the guideline rule
- the smallest change that fixes it

Group findings by severity, blocking first. End with the verification commands that still need to run, or state that
none remain.
