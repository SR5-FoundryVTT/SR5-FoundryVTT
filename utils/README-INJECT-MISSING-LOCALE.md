# Locale Property Injector

## Overview

The `inject-missing-locale.mjs` script automatically injects missing properties from the English base locale (`public/locale/en/config.json`) into a target locale file. Missing properties are marked with `[MISSING]` to make them easy to identify and translate later.

## Usage

```bash
npm run locale:inject-missing <locale>
```

Or run directly:
```bash
node utils/inject-missing-locale.mjs <locale>
```

### Examples

```bash
# Inject missing properties into German locale
npm run locale:inject-missing de

# Inject missing properties into French locale
npm run locale:inject-missing fr
```

## What It Does

1. **Loads** the English base locale and the specified target locale
2. **Compares** the structure to find missing properties in the target
3. **Injects** missing properties with `[MISSING]` marker instead of copying English text
4. **Preserves** all existing translations (never overwrites)
5. **Detects** type conflicts where a property exists but has different types (string vs object)
6. **Saves** the updated target locale file with proper JSON formatting

### Key Features

- **Non-destructive**: Never overwrites existing translations
- **[MISSING] Markers**: All injected properties use `[MISSING]` instead of English text
- **Type Conflict Detection**: Warns about structural changes that need manual review
- **Recursive Injection**: Handles nested object structures correctly
- **Progress Reporting**: Shows exactly what was added and what needs attention

## Output Format

The script outputs detailed information about the injection process:

### Example Output

```
🔄 Shadowrun 5e Locale Property Injector

================================================================================
Base locale: en
Target locale: de
================================================================================

Properties in base locale: 2150
Properties in target locale (before): 1578
Missing properties: 625

Injecting missing properties...

================================================================================
MERGE RESULTS
================================================================================

Properties added: 92
Properties in target locale (after): 2010
Missing properties (after): 193

Added properties:

  SR5:
    + SR5.Actor.FIELDS.magic.label
    + SR5.Weapon.FIELDS.category.hint
    + SR5.Weapon.FIELDS.category.label
    ...

⚠️  Check these properties manually (type mismatch):

The following properties exist in both locales but have different types.
This usually indicates a structural change that needs manual review.

  ⚠️  SR5.Ammo
      Base (en): object
      Target (de): string

  ⚠️  SR5.Armor
      Base (en): object
      Target (de): string

================================================================================
Saving updated configuration to: C:\...\public\locale\de\config.json
✅ Successfully saved updated locale file!

================================================================================
✨ Injection complete! Added 92 properties to de locale.
```

## Understanding the Results

### Properties Added Count

The number of top-level or parent object properties that were completely missing and have been injected. This count may be lower than the "Missing properties" count because:

- Missing leaf properties within existing objects require manual translation
- Only complete missing object hierarchies are automatically injected
- The script is conservative to avoid structural conflicts

### Type Conflicts

Type conflicts occur when:
- **Base locale** has an object: `"Ammo": { "label": "Ammo", "FIELDS": {...} }`
- **Target locale** has a string: `"Ammo": "Munition"`

This indicates the structure changed (likely added new nested properties). These require manual review and restructuring of the target locale.

### [MISSING] Marker

All injected properties use the literal string `[MISSING]` instead of copying English text. This makes it easy to:
- Search for untranslated properties: Just search for `[MISSING]`
- Identify what needs translation work
- Avoid accidentally shipping English text in other locales

## Use Cases

- **New Locale Setup**: Quickly bootstrap a new translation with complete structure
- **Locale Maintenance**: Keep existing translations up-to-date after code changes
- **Translation Preparation**: Generate a list of properties that need translation
- **Structure Validation**: Identify structural changes between locale versions

## Workflow Example

1. **Run the injection script**:
   ```bash
   npm run locale:inject-missing de
   ```

2. **Review type conflicts** (if any):
   - Manually fix properties listed under "Check these properties manually"
   - Update the target locale structure to match the base locale

3. **Search for [MISSING]** in the target locale file:
   ```json
   "NewFeature": {
       "hint": "[MISSING]",
       "label": "[MISSING]"
   }
   ```

4. **Translate** all `[MISSING]` values:
   ```json
   "NewFeature": {
       "hint": "Tooltip für neue Funktion",
       "label": "Neue Funktion"
   }
   ```

5. **Verify** with the comparison tool:
   ```bash
   npm run check:locale de
   ```

## Important Notes

- **Cannot inject into base locale**: The script prevents injecting into `en` locale
- **Backup recommended**: Although non-destructive, it's good practice to commit before running
- **Type conflicts must be resolved manually**: The script will not automatically fix structural mismatches
- **JSON formatting**: The script maintains 4-space indentation
- **File must exist**: Target locale file must already exist (won't create new locales)

## Related Tools

- `npm run check:locale [locale]` - Compare localization files and identify issues
- `npm run check:base-locale-usage` - Find unused localization keys in codebase

## Error Handling

The script will exit with an error if:
- No locale parameter is provided
- Target locale file doesn't exist
- Unable to read or parse JSON files
- Cannot write to target file

Available locales are listed if an invalid locale is specified.
