#!/usr/bin/env node

/**
 * NOTE: This file and READM-BASE-LOCALE-USAGE.md is fully AI generated.
 * Please review carefully before use and modify as needed.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALE_FILE = path.join(__dirname, '..', 'public', 'locale', 'en', 'config.json');
const PROJECT_ROOT = path.join(__dirname, '..');
const SEARCH_EXTENSIONS = ['.js', '.ts', '.hbs', '.html'];

/**
 * Recursively flatten a nested object into a flat object with dot-notation keys
 * @param {object} obj - The object to flatten
 * @param {string} prefix - The current key prefix
 * @returns {object} - Flattened object with keys as array
 */
function flattenObjectToKeys(obj, prefix = '') {
    const keys = [];
    
    for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            keys.push(...flattenObjectToKeys(value, newKey));
        } else {
            keys.push(newKey);
        }
    }
    
    return keys;
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
 * Recursively get all files with specific extensions from a directory
 * @param {string} dir - Directory to search
 * @param {string[]} extensions - File extensions to match
 * @param {string[]} excludeDirs - Directory names to exclude
 * @returns {string[]} - Array of file paths relative to project root
 */
function getFilesRecursive(dir, extensions, excludeDirs = ['node_modules', 'dist', '.git']) {
    const files = [];
    
    try {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            
            if (item.isDirectory()) {
                // Skip excluded directories
                if (excludeDirs.includes(item.name)) {
                    continue;
                }
                // Recursively search subdirectories
                files.push(...getFilesRecursive(fullPath, extensions, excludeDirs));
            } else if (item.isFile()) {
                // Check if file has one of the desired extensions
                const ext = path.extname(item.name);
                if (extensions.includes(ext)) {
                    // Store relative path from project root
                    const relativePath = path.relative(PROJECT_ROOT, fullPath);
                    files.push(relativePath);
                }
            }
        }
    } catch (error) {
        console.warn(`Warning: Could not read directory ${dir}: ${error.message}`);
    }
    
    return files;
}

/**
 * Get all project files matching the extensions
 * @returns {string[]} - Array of file paths
 */
function getProjectFiles() {
    const srcDir = path.join(PROJECT_ROOT, 'src');
    return getFilesRecursive(srcDir, SEARCH_EXTENSIONS);
}

/**
 * Check if a key is used in any of the project files
 * @param {string} key - The localization key to search for
 * @param {Map<string, string>} fileContents - Map of file paths to their contents
 * @returns {boolean} - True if key is found in any file
 */
function isKeyUsed(key, fileContents) {
    // Search for the key in any of the file contents
    for (const content of fileContents.values()) {
        if (content.includes(key)) {
            return true;
        }
    }
    return false;
}

/**
 * Main function
 */
async function main() {
    console.log('🔍 Shadowrun 5e Base Locale Usage Checker\n');
    console.log('='.repeat(80));
    
    // Load base locale
    console.log('Loading base locale file...');
    const baseConfig = loadJSON(LOCALE_FILE);
    
    if (!baseConfig) {
        console.error(`Failed to load locale file: ${LOCALE_FILE}`);
        process.exit(1);
    }
    
    const allKeys = flattenObjectToKeys(baseConfig);
    console.log(`Found ${allKeys.length} localization keys`);
    console.log('='.repeat(80));
    console.log();
    
    // Get all project files
    console.log('Scanning project files...');
    const projectFiles = getProjectFiles();
    console.log(`Found ${projectFiles.length} project files to search`);
    console.log();
    
    // Load all file contents
    console.log('Loading file contents...');
    const fileContents = new Map();
    
    for (const relativeFilePath of projectFiles) {
        const fullPath = path.join(PROJECT_ROOT, relativeFilePath);
        try {
            const content = fs.readFileSync(fullPath, 'utf8');
            fileContents.set(relativeFilePath, content);
        } catch (error) {
            console.warn(`Warning: Could not read ${relativeFilePath}: ${error.message}`);
        }
    }
    
    console.log(`Loaded ${fileContents.size} files`);
    console.log('='.repeat(80));
    console.log();
    
    // Check each key for usage
    console.log('Checking for unused localization keys...\n');
    const unusedKeys = [];
    
    let checked = 0;
    for (const key of allKeys) {
        checked++;
        if (checked % 100 === 0) {
            process.stdout.write(`\rProgress: ${checked}/${allKeys.length}`);
        }
        
        if (!isKeyUsed(key, fileContents)) {
            unusedKeys.push(key);
        }
    }
    
    process.stdout.write(`\rProgress: ${checked}/${allKeys.length}\n\n`);
    
    // Display results
    console.log('='.repeat(80));
    console.log('RESULTS');
    console.log('='.repeat(80));
    console.log();
    
    if (unusedKeys.length === 0) {
        console.log('✅ All localization keys are used in the project!');
    } else {
        console.log(`⚠️  Found ${unusedKeys.length} unused localization keys:\n`);
        
        // Group keys by their top-level namespace for better readability
        const grouped = {};
        for (const key of unusedKeys) {
            const topLevel = key.split('.')[0];
            if (!grouped[topLevel]) {
                grouped[topLevel] = [];
            }
            grouped[topLevel].push(key);
        }
        
        for (const [namespace, keys] of Object.entries(grouped).sort()) {
            console.log(`\n${namespace}:`);
            for (const key of keys.sort()) {
                console.log(`  - ${key}`);
            }
        }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log(`✨ Check complete! Total unused: ${unusedKeys.length}/${allKeys.length}`);
}

main();
