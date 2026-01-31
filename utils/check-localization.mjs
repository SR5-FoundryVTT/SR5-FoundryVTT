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
 * Get all locale directories except the base locale
 * @param {string|null} specificLocale - Optional specific locale to check
 * @returns {string[]} - Array of locale directory names
 */
function getLocales(specificLocale = null) {
    try {
        const items = fs.readdirSync(LOCALE_DIR, { withFileTypes: true });
        const allLocales = items
            .filter(item => item.isDirectory() && item.name !== BASE_LOCALE)
            .map(item => item.name)
            .sort();
        
        // If a specific locale is requested, validate and return only that one
        if (specificLocale) {
            if (specificLocale === BASE_LOCALE) {
                console.error(`Error: Cannot compare base locale '${BASE_LOCALE}' against itself.`);
                process.exit(1);
            }
            
            if (!allLocales.includes(specificLocale)) {
                console.error(`Error: Locale '${specificLocale}' not found.`);
                console.error(`Available locales: ${allLocales.join(', ')}`);
                process.exit(1);
            }
            
            return [specificLocale];
        }
        
        return allLocales;
    } catch (error) {
        console.error('Error reading locale directory:', error.message);
        return [];
    }
}

/**
 * Compare two locale files
 * @param {object} baseFlat - Flattened base locale object
 * @param {object} targetFlat - Flattened target locale object
 * @returns {object} - Object containing missing, untranslated, and extra keys
 */
function compareLocales(baseFlat, targetFlat) {
    const missing = [];
    const untranslated = [];
    const extra = [];
    
    for (const [key, baseValue] of Object.entries(baseFlat)) {
        if (!(key in targetFlat)) {
            missing.push(key);
        } else if (targetFlat[key] === baseValue && typeof baseValue === 'string') {
            untranslated.push({ key, value: baseValue });
        }
    }
    
    // Find keys that exist in target but not in base (should be removed)
    for (const [key, targetValue] of Object.entries(targetFlat)) {
        if (!(key in baseFlat)) {
            extra.push({ key, value: targetValue });
        }
    }
    
    return { missing, untranslated, extra };
}

/**
 * Main function
 */
function main() {
    // Parse command-line arguments
    const args = process.argv.slice(2);
    const specificLocale = args.length > 0 ? args[0] : null;
    
    console.log('🌍 Shadowrun 5e Localization Checker\n');
    console.log('=' .repeat(80));
    
    // Load base locale
    const baseConfigPath = path.join(LOCALE_DIR, BASE_LOCALE, 'config.json');
    const baseConfig = loadJSON(baseConfigPath);
    
    if (!baseConfig) {
        console.error(`Failed to load base locale file: ${baseConfigPath}`);
        process.exit(1);
    }
    
    const baseFlat = flattenObject(baseConfig);
    const totalKeys = Object.keys(baseFlat).length;
    
    console.log(`Base locale: ${BASE_LOCALE}`);
    console.log(`Total properties: ${totalKeys}`);
    if (specificLocale) {
        console.log(`Checking only: ${specificLocale}`);
    }
    console.log('=' .repeat(80));
    console.log();
    
    // Get all locales to check
    const locales = getLocales(specificLocale);
    
    if (locales.length === 0) {
        console.log('No other locales found to compare.');
        return;
    }
    
    // Compare each locale
    for (const locale of locales) {
        const configPath = path.join(LOCALE_DIR, locale, 'config.json');
        const config = loadJSON(configPath);
        
        if (!config) {
            console.log(`\n❌ ${locale.toUpperCase()}: Could not load config.json`);
            console.log('-'.repeat(80));
            continue;
        }
        
        const targetFlat = flattenObject(config);
        const { missing, untranslated, extra } = compareLocales(baseFlat, targetFlat);
        
        const translatedCount = totalKeys - missing.length - untranslated.length;
        const completionPercent = ((translatedCount / totalKeys) * 100).toFixed(1);
        
        console.log(`\n📋 ${locale.toUpperCase()}`);
        console.log('-'.repeat(80));
        console.log(`Translation progress: ${translatedCount}/${totalKeys} (${completionPercent}%)`);
        console.log(`Missing properties: ${missing.length}`);
        console.log(`Untranslated properties: ${untranslated.length}`);
        console.log(`Extra properties (should be removed): ${extra.length}`);
        
        if (missing.length > 0) {
            console.log(`\n  ⚠️  Missing Properties (${missing.length}):`);
            missing.forEach(key => {
                console.log(`    - ${key}`);
            });
        }
        
        if (untranslated.length > 0) {
            console.log(`\n  🔤 Untranslated Properties (${untranslated.length}):`);
            untranslated.forEach(({ key, value }) => {
                const displayValue = value.length > 50 ? value.substring(0, 47) + '...' : value;
                console.log(`    - ${key}: "${displayValue}"`);
            });
        }
        
        if (extra.length > 0) {
            console.log(`\n  🗑️  Extra Properties - Should Be Removed (${extra.length}):`);
            extra.forEach(({ key, value }) => {
                const displayValue = typeof value === 'string' && value.length > 50 
                    ? value.substring(0, 47) + '...' 
                    : JSON.stringify(value);
                console.log(`    - ${key}: ${displayValue}`);
            });
        }
        
        if (missing.length === 0 && untranslated.length === 0 && extra.length === 0) {
            console.log('\n  ✅ All properties are present, translated, and no extra keys!');
        }
        
        console.log('-'.repeat(80));
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✨ Localization check complete!');
}

main();
