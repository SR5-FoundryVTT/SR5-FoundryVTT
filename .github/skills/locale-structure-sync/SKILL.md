---
name: locale-structure-sync
description: 'Use when: adding, changing, or removing labels in public/locale/en/config.json; updating Shadowrun 5e translations; or checking locale JSON structure. Keeps de, fr, ko, and pt-BR config.json files structurally identical to the English base locale.'
argument-hint: 'Describe the English locale keys being changed'
---

# Locale Structure Sync

Keep locale configuration files structurally aligned with `public/locale/en/config.json` for the requested change. English is the canonical key hierarchy.

## Scope Boundary

When an agent is changing the English locale as part of a feature, it must synchronize only the keys added, modified, moved, or removed by that feature. It must not fix unrelated missing, extra, or differently nested keys that already exist in other locales.

Only an agent explicitly instructed to fully synchronize all languages may perform repository-wide locale structural cleanup. That task must address every missing and extra key, not just the current feature's paths.

## When to Use

- Adding, modifying, moving, or removing labels in the English locale
- Updating translations after a feature introduces localization keys
- Investigating missing, obsolete, or differently nested locale entries
- Fully synchronizing all language files when explicitly requested

## Procedure

1. Inspect the changed keys in `public/locale/en/config.json` and identify whether each key was added, modified, moved, or removed.
2. Identify every `public/locale/*/config.json` other than English, then apply the corresponding structural change to each target locale. The current targets are `de`, `fr`, `ko`, and `pt-BR`.
3. For added keys, add the same nested path in every target locale. Preserve an existing translation when one is available; otherwise use the English value as a temporary fallback.
4. For renamed, moved, or removed English keys, make the equivalent rename, move, or removal in every target locale. Do not leave old keys behind.
5. Verify each edited JSON file parses and run:

   ```bash
   npm run locale:check
   ```

6. Resolve reported missing and extra properties for the changed key paths only. Do not fix unrelated findings unless the task explicitly requests a full synchronization of all languages. Identical values are a translation-quality signal, not a structural failure: retain intentional technical terms and translate other fallbacks when appropriate.

## Completion Criteria

- Every changed key path has the same flattened path in every target locale.
- No changed key path is reported as missing or extra by `npm run locale:check`.
- All edited locale files are valid JSON.
- English values remain the source of truth for the hierarchy; target locales differ only in translated values.

For an explicitly requested full synchronization, the stronger completion criterion applies: every target locale must have exactly the same flattened key paths as English.