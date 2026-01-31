# Base Locale Usage Checker

## Overview

The `check-base-locale-usage.mjs` script scans the entire project to identify localization keys in the English base locale (`public/locale/en/config.json`) that are not being used anywhere in the codebase.

## Usage

```bash
npm run check:base-locale-usage
```

Or run directly:
```bash
node utils/check-base-locale-usage.mjs
```

## What It Does

1. **Loads** the English base locale file and flattens all nested keys
2. **Scans** all project files (`.js`, `.ts`, `.hbs`, `.html`) in the `src/` directory
3. **Searches** for each localization key in the project files
4. **Reports** only the keys that are not found anywhere in the codebase

### Localization Key Format

Localization keys are always fully flattened when used in code. For example:
```json
{
  "SR5": {
    "Weapon": {
      "Range": {
        "Distance": "Weapon Distance in feet"
      }
    }
  }
}
```

Would be used in code as: `SR5.Weapon.Range.Distance`

## Output Format

The script outputs:
- Total number of localization keys found in the base locale
- Number of project files scanned
- Progress indicator while checking
- Grouped list of unused keys by namespace
- Summary of total unused keys

### Example Output

```
🔍 Shadowrun 5e Base Locale Usage Checker

================================================================================
Loading base locale file...
Found 2150 localization keys
================================================================================

Scanning project files...
Found 712 project files to search

Loading file contents...
Loaded 712 files
================================================================================

Checking for unused localization keys...

Progress: 2150/2150

================================================================================
RESULTS
================================================================================

⚠️  Found 894 unused localization keys:

SR5:
  - SR5.Accessory
  - SR5.Actor.FIELDS.magic.label
  - SR5.Weapon.FullReload
  ...

TYPES:
  - TYPES.Actor.character
  - TYPES.Item.weapon
  ...

================================================================================
✨ Check complete! Total unused: 894/2150
```

## Use Cases

- **Code Cleanup**: Identify obsolete localization keys that can be removed
- **Translation Efficiency**: Avoid translating unused strings
- **Refactoring**: Find keys that may have been orphaned during code changes
- **Maintenance**: Keep localization files lean and relevant

## Performance

The script:
- Loads all file contents into memory for fast searching
- Displays progress every 100 keys checked
- Excludes `node_modules`, `dist`, and `.git` directories
- Typically completes in a few seconds for the entire project

## Notes

- Only searches in the `src/` directory (where source code resides)
- Excludes build artifacts and dependencies
- Case-sensitive string matching (as localization keys are case-sensitive)
- Does not account for dynamically constructed key names
