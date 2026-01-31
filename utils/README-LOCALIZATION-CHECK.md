# Localization Checker

## Overview

The `check-localization.mjs` script compares all localization files against the English base locale (`public/locale/en/config.json`) to identify missing and untranslated properties.

## Usage

Check all localizations:
```bash
npm run check:locale
```

Check a specific localization:
```bash
npm run check:locale de
npm run check:locale fr
npm run check:locale ko
npm run check:locale pt-BR
```

Or run the script directly:
```bash
node utils/check-localization.mjs [locale]
```

**Note:** The parameter cannot be 'en' as that is the base locale used for comparison.

## What It Checks

For each locale (de, fr, ko, pt-BR), the script identifies:

1. **Missing Properties**: JSON keys that exist in the English locale but are completely absent from the target locale
2. **Untranslated Properties**: JSON keys that exist but have the exact same value as the English version (indicating they haven't been translated)
3. **Extra Properties**: JSON keys that exist in the target locale but are missing from the English base (these should be removed as they're obsolete)

## Output Format

The script outputs:
- A summary for each locale showing translation progress percentage
- A list of all missing properties
- A list of all untranslated properties with their English values

### Example Output

```
📋 DE
--------------------------------------------------------------------------------
Translation progress: 1353/2150 (62.9%)
Missing properties: 623
Untranslated properties: 174
Extra properties (should be removed): 53

  ⚠️  Missing Properties (623):
    - SR5.Weapon.FIELDS.melee.reach.hint
    - SR5.Weapon.FIELDS.melee.reach.label
    ...

  🔤 Untranslated Properties (174):
    - SR5.ActorTypes.Sprite: "Sprite"
    - SR5.HotSim: "Hot Sim"
    ...

  🗑️  Extra Properties - Should Be Removed (53):
    - SR5.Ammo: "Munition"
    - SR5.Armor: "Panzerung"
    ...
```

## How It Works

1. Loads the English `config.json` as the reference
2. Recursively flattens all nested JSON objects into dot-notation keys
3. For each other locale:
   - Loads its `config.json`
   - Compares all keys against the English version
   - Identifies missing keys
   - Identifies keys with identical values (untranslated strings)
4. Outputs formatted results for each locale

## Use Cases

- **Translation Management**: Identify which strings need translation
- **Quality Assurance**: Ensure all locales have complete coverage
- **Maintenance**: Track translation progress after adding new features
- **Contributors**: Help translators know what work is needed

## Notes

- The script only checks string values for translation; it won't flag technical values like numbers or booleans as "untranslated"
- Proper nouns and technical terms that are the same across languages will appear as "untranslated" but may actually be correct
