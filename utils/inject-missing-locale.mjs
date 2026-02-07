#!/usr/bin/env node

/**
 * NOTE: This file and READM-LOCALIZATION.md is fully AI generated.
 * Please review carefully before use and modify as needed.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALE_DIR = path.join(__dirname, '..', 'public', 'locale');
const BASE_LOCALE = 'en';

/**
 * Load and parse a JSON file
 * @param {string} filePath - Path to the JSON file
 * @returns {object|null} - Parsed JSON or null if error
 */
function loadJSON(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`Error loading ${filePath}:`, error.message);
        return null;
    }
}

/**
 * Save an object to a JSON file with proper formatting
 * @param {string} filePath - Path to save the JSON file
 * @param {object} data - Data to save
 * @returns {boolean} - True if successful
 */
function saveJSON(filePath, data) {
    try {
        const content = JSON.stringify(data, null, 4);
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    } catch (error) {
        console.error(`Error saving ${filePath}:`, error.message);
        return false;
    }
}

/**
 * Create a copy of an object structure with all leaf values set to [MISSING]
 * @param {object} obj - Object to copy structure from
 * @returns {object} - New object with [MISSING] values
 */
function createMissingStructure(obj) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            result[key] = createMissingStructure(value);
        } else {
            result[key] = '[MISSING]';
        }
    }
    return result;
}

/**
 * Recursively merge missing properties from source into target
 * Only adds properties that don't exist in target, preserves all existing values
 * Missing values are marked with [MISSING] instead of copying English text
 * @param {object} source - Source object (base locale)
 * @param {object} target - Target object (locale to update)
 * @param {string} path - Current path for tracking (for logging)
 * @param {string[]} addedKeys - Array to track added keys
 * @param {Array<{key: string, baseType: string, targetType: string}>} typeConflicts - Array to track type conflicts
 * @returns {object} - Merged object
 */
function mergeMissingProperties(source, target, path = '', addedKeys = [], typeConflicts = []) {
    const result = { ...target };
    
    for (const [key, sourceValue] of Object.entries(source)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (!(key in result)) {
            // Key is missing in target, add it with [MISSING] marker
            if (sourceValue !== null && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
                // For objects, recursively create structure with [MISSING] for leaf values
                result[key] = createMissingStructure(sourceValue);
            } else {
                // For primitive values, use [MISSING]
                result[key] = '[MISSING]';
            }
            addedKeys.push(currentPath);
        } else {
            // Key exists in both - check for type conflicts
            const sourceIsObject = sourceValue !== null && typeof sourceValue === 'object' && !Array.isArray(sourceValue);
            const targetIsObject = result[key] !== null && typeof result[key] === 'object' && !Array.isArray(result[key]);
            
            if (sourceIsObject && targetIsObject) {
                // Both are objects, recurse
                result[key] = mergeMissingProperties(sourceValue, result[key], currentPath, addedKeys, typeConflicts);
            } else if (sourceIsObject !== targetIsObject) {
                // Type mismatch: one is object, the other is not
                typeConflicts.push({
                    key: currentPath,
                    baseType: sourceIsObject ? 'object' : typeof sourceValue,
                    targetType: targetIsObject ? 'object' : typeof result[key]
                });
            }
            // If both are primitives or same type, leave target value unchanged
        }
    }
    
    return result;
}

/**
 * Recursively flatten a nested object into a flat object with dot-notation keys
 * @param {object} obj - The object to flatten
 * @param {string} prefix - The current key prefix
 * @returns {object} - Flattened object
 */
function flattenObject(obj, prefix = '') {
    const flattened = {};
    
    for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            Object.assign(flattened, flattenObject(value, newKey));
        } else {
            flattened[newKey] = value;
        }
    }
    
    return flattened;
}

/**
 * Count missing properties between base and target
 * @param {object} baseFlat - Flattened base locale
 * @param {object} targetFlat - Flattened target locale
 * @returns {number} - Number of missing properties
 */
function countMissing(baseFlat, targetFlat) {
    let count = 0;
    for (const key of Object.keys(baseFlat)) {
        if (!(key in targetFlat)) {
            count++;
        }
    }
    return count;
}

/**
 * Main function
 */
function main() {
    // Parse command-line arguments
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.error('Error: No locale specified.');
        console.error('Usage: npm run locale:inject-missing <locale>');
        console.error('Example: npm run locale:inject-missing de');
        process.exit(1);
    }
    
    const targetLocale = args[0];
    
    if (targetLocale === BASE_LOCALE) {
        console.error(`Error: Cannot inject into base locale '${BASE_LOCALE}'.`);
        process.exit(1);
    }
    
    console.log('🔄 Shadowrun 5e Locale Property Injector\n');
    console.log('='.repeat(80));
    
    // Load base locale
    const baseConfigPath = path.join(LOCALE_DIR, BASE_LOCALE, 'config.json');
    const baseConfig = loadJSON(baseConfigPath);
    
    if (!baseConfig) {
        console.error(`Failed to load base locale file: ${baseConfigPath}`);
        process.exit(1);
    }
    
    // Load target locale
    const targetConfigPath = path.join(LOCALE_DIR, targetLocale, 'config.json');
    
    if (!fs.existsSync(targetConfigPath)) {
        console.error(`Error: Locale '${targetLocale}' not found.`);
        console.error(`File does not exist: ${targetConfigPath}`);
        
        // List available locales
        try {
            const items = fs.readdirSync(LOCALE_DIR, { withFileTypes: true });
            const availableLocales = items
                .filter(item => item.isDirectory() && item.name !== BASE_LOCALE)
                .map(item => item.name)
                .sort();
            console.error(`Available locales: ${availableLocales.join(', ')}`);
        } catch (error) {
            // Ignore
        }
        
        process.exit(1);
    }
    
    const targetConfig = loadJSON(targetConfigPath);
    
    if (!targetConfig) {
        console.error(`Failed to load target locale file: ${targetConfigPath}`);
        process.exit(1);
    }
    
    console.log(`Base locale: ${BASE_LOCALE}`);
    console.log(`Target locale: ${targetLocale}`);
    console.log('='.repeat(80));
    console.log();
    
    // Count missing properties before merge
    const baseFlat = flattenObject(baseConfig);
    const targetFlatBefore = flattenObject(targetConfig);
    const missingBefore = countMissing(baseFlat, targetFlatBefore);
    
    console.log(`Properties in base locale: ${Object.keys(baseFlat).length}`);
    console.log(`Properties in target locale (before): ${Object.keys(targetFlatBefore).length}`);
    console.log(`Missing properties: ${missingBefore}`);
    console.log();
    
    if (missingBefore === 0) {
        console.log('✅ No missing properties found. Target locale is up to date!');
        process.exit(0);
    }
    
    // Merge missing properties
    console.log('Injecting missing properties...');
    const addedKeys = [];
    const typeConflicts = [];
    const mergedConfig = mergeMissingProperties(baseConfig, targetConfig, '', addedKeys, typeConflicts);
    
    // Verify merge
    const targetFlatAfter = flattenObject(mergedConfig);
    const missingAfter = countMissing(baseFlat, targetFlatAfter);
    
    console.log();
    console.log('='.repeat(80));
    console.log('MERGE RESULTS');
    console.log('='.repeat(80));
    console.log();
    console.log(`Properties added: ${addedKeys.length}`);
    console.log(`Properties in target locale (after): ${Object.keys(targetFlatAfter).length}`);
    console.log(`Missing properties (after): ${missingAfter}`);
    console.log();
    
    if (addedKeys.length > 0) {
        console.log('Added properties:');
        // Group by namespace for better readability
        const grouped = {};
        for (const key of addedKeys) {
            const topLevel = key.split('.')[0];
            if (!grouped[topLevel]) {
                grouped[topLevel] = [];
            }
            grouped[topLevel].push(key);
        }
        
        for (const [namespace, keys] of Object.entries(grouped).sort()) {
            console.log(`\n  ${namespace}:`);
            for (const key of keys.sort()) {
                console.log(`    + ${key}`);
            }
        }
        console.log();
    }
    
    // Show type conflicts if any
    if (typeConflicts.length > 0) {
        console.log('⚠️  Check these properties manually (type mismatch):');
        console.log();
        console.log('The following properties exist in both locales but have different types.');
        console.log('This usually indicates a structural change that needs manual review.');
        console.log();
        
        for (const conflict of typeConflicts.sort((a, b) => a.key.localeCompare(b.key))) {
            console.log(`  ⚠️  ${conflict.key}`);
            console.log(`      Base (${BASE_LOCALE}): ${conflict.baseType}`);
            console.log(`      Target (${targetLocale}): ${conflict.targetType}`);
            console.log();
        }
    }
    
    // Save the merged configuration
    console.log('='.repeat(80));
    console.log(`Saving updated configuration to: ${targetConfigPath}`);
    
    if (saveJSON(targetConfigPath, mergedConfig)) {
        console.log('✅ Successfully saved updated locale file!');
        console.log();
        console.log('='.repeat(80));
        console.log(`✨ Injection complete! Added ${addedKeys.length} properties to ${targetLocale} locale.`);
    } else {
        console.error('❌ Failed to save updated locale file.');
        process.exit(1);
    }
}

main();
