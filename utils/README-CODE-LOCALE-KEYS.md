# Code Locale Key Checker

## Overview

The `check-code-locale-keys.mjs` script scans the source code (`src/`) for localization keys and compares them with the English base locale (`public/locale/en/config.json`). It reports keys that are used in code but missing in `en`. With `--insert` it adds the missing keys to `en` as `[MISSING]` placeholders.

It is report-only by default and never fails the build because of missing keys.

## Usage

Report missing keys (no file is written):
```bash
npm run locale:code-keys
```

Insert the missing keys into `public/locale/en/config.json`:
```bash
npm run locale:code-keys -- --insert
```

Also list prefix fragments and keys that resolve to objects in `en`:
```bash
npm run locale:code-keys -- --verbose
```

Show the options:
```bash
npm run locale:code-keys -- --help
```

Or run the script directly:
```bash
node utils/check-code-locale-keys.mjs [--insert] [--verbose]
```

### Options

| Option | Description |
|--------|-------------|
| (none) | Report only, never writes any file |
| `--insert` | Insert all missing keys (kind `new`) into `en/config.json` |
| `--verbose` | Also list prefix fragments and keys that resolve to objects in `en` |
| `--help`, `-h` | Print usage and exit |

Any other argument prints an error and the usage, and exits with code 1.

## What It Checks

1. **Files**: all `.js`, `.ts`, `.hbs` and `.html` files below `src/`, skipping `node_modules`, `dist`, `.git` and `*.spec.ts` test files.
2. **Namespaces**: the top-level keys of `en/config.json` (currently `CONTROLS`, `SETTINGS`, `SR5`, `TYPES`). Only string literals starting with one of these namespaces are considered. Foundry core namespaces such as `COMBAT.` or `DOCUMENT.` are ignored.
3. **Classification** of every string literal:
   - **Dynamic**: contains `${` (template expression), e.g. `SR5.ExtendedTestManager.Status.${value}`. Never inserted, listed for manual review.
   - **Prefix fragment**: ends with `.`, e.g. `'SR5.GMRequest.' + x`. Not a key, only counted (listed with `--verbose`).
   - **Ignored**: does not look like a dotted key (spaces, parentheses, wildcards, consecutive dots).
   - **Literal key**: resolved against `en` by walking the nested object:
     - **exists**: resolves to a string value
     - **object**: resolves to an object (a parent of existing keys), listed with `--verbose`
     - **new** (missing): no segment of the path is a string in `en`
     - **blocked**: a segment of the path is a string in `en` (e.g. `SR5.Ammo` is `"Ammo"` but the code uses `SR5.Ammo.label`), or the key lies below another missing key. Blocked keys are reported as conflicts and never inserted.

Each missing key is reported with its first location per file (`file:line`, up to three locations, then `(+N more)`).

On GitHub Actions, each missing (`new`) key is also printed as a `::warning` annotation (report mode only).

## Output

The report contains a header with the scanned file count, distinct literal keys (exists, object, missing), dynamic keys and prefix fragments, followed by the sections *Missing keys (new)*, *Blocked keys*, *Dynamic keys* and a summary line.

## Insert Mode

With `--insert`:

- Each missing (`new`) key is created in `en/config.json`. Missing intermediate objects are created, existing objects are reused, and the final segment is set to `"[MISSING]"`.
- Existing values are never overwritten. Blocked and dynamic keys are never inserted.
- Only the objects that received keys are re-sorted (plain code-unit order), so the diff contains only the added lines.
- The file is only written if `JSON.stringify(JSON.parse(raw), null, 4)` reproduces the original content exactly (four-space indentation, LF, no trailing newline). Otherwise the script aborts without changes.
- The command is idempotent: a second run inserts nothing.

After inserting, replace all `[MISSING]` values with proper English text, then run `npm run locale:check` to see which other locales need the new keys.

## Limitations

- Only string literals are analysed. Keys built at runtime cannot be verified; they are listed as dynamic or prefix fragments for manual review.
- Template literals spanning several lines, and template expressions containing spaces or quotes, are not matched.
- Keys used only outside `src/` (for example `system.json`, packs, macros) are not seen.
- Any string literal starting with a system namespace counts, so some findings may not be locale keys (false positives). Review the inserted keys with `git diff` before keeping them.
- Foundry core namespaces are ignored because they are not part of this system's `en` file.

## Exit Codes

- `0`: normal run, also when missing keys are found
- `1`: `en/config.json` cannot be read or parsed, the file cannot be written, `src/` cannot be scanned, or an unknown option was passed

## Related

- `npm run locale:check`: compares each locale with `en`
- `npm run validate:locales`: structure check of all locales (used in CI)
