# Localization workflow

Locale sources live in `src/locale/<language>/`. The locale builder merges each language's JSON files by filename and
writes the Foundry-compatible output to `dist/locale/<language>/config.json`. Generated files are build output; do not
edit them directly.

English is the canonical locale. Foundry V14 loads it as the fallback dictionary whenever a non-English locale does not
define a key, including schema field labels and hints. Leave an untranslated key absent instead of adding an empty value
or a placeholder marker.

## Commands

```bash
npm run locale:check
npm run locale:check -- fr
npm run locale:test
npm run locale:build
npm run locale:base-usage
```

- `locale:check` reports missing and extra keys as warnings. It fails for malformed JSON, duplicate paths, empty values,
  `[MISSING]` markers, invalid value types, changed placeholders or markup, unsorted keys, and
  literal `SR5.*` source references missing from English.
- `locale:test` runs fixture tests for the locale builder and audit behavior.
- `locale:build` validates and writes the locale bundles. Normal build and watch tasks run it automatically.
- `locale:base-usage` reports English keys that are not referenced in source or resolved implicitly by Foundry. Treat
  its output as a review list, not an automatic deletion list.

## Editing locales

Add new strings to English first. Add translated values where available; missing non-English entries will safely fall
back to English. Review extra non-English keys reported by the audit before removing or retaining them.

Keep object keys alphabetical at every level. Preserve `{placeholder}` names and HTML tag structure in translations.
When adding a new English module file, also import it in `src/module/utils/strings.ts` so the `Translation` union
continues to include its keys.
