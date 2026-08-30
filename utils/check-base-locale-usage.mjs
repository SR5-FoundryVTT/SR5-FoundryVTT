#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import localization from './localization.cjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, '..');
const SEARCH_EXTENSIONS = ['.js', '.ts', '.hbs', '.html', '.json'];

/**
 * Recursively get all files with specific extensions from a directory
 * @param {string} dir - Directory to search
 * @param {string[]} extensions - File extensions to match
 * @param {string[]} excludeDirs - Directory names to exclude
 * @returns {string[]} - Array of file paths relative to project root
 */
function getFilesRecursive(dir, extensions, excludeDirs = ['node_modules', 'dist', '.git', 'locale']) {
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
 * Roots Foundry resolves on its own: document type labels, setting labels, keybinding labels, and the `FIELDS`
 * label/hint pairs it reads straight off a DataModel schema. None of them ever appear as a literal in our sources, so
 * reporting them as unused only buries the keys that genuinely are.
 * @param {string} key - The localization key to classify
 * @returns {boolean} - True when Foundry consumes the key implicitly
 */
export function isImplicitlyConsumed(key) {
    const segments = key.split('.');
    return ['TYPES', 'SETTINGS', 'CONTROLS'].includes(segments[0]) || segments.includes('FIELDS');
}

/**
 * Collect every `SR5.*` path that appears in the project sources.
 * @param {Map<string, string>} fileContents - Map of file paths to their contents
 * @returns {{ paths: Set<string>, interpolatedPrefixes: Set<string> }} - Referenced paths and incomplete path segments
 */
export function collectReferencedPaths(fileContents) {
    const paths = new Set();
    const interpolatedPrefixes = new Set();

    for (const content of fileContents.values()) {
        for (const match of content.matchAll(/SR5(?:\.[A-Za-z0-9_]+)+/g)) {
            paths.add(match[0]);
        }
        for (const match of content.matchAll(/SR5(?:\.[A-Za-z0-9_]+)+(?=\$\{)/g)) {
            interpolatedPrefixes.add(match[0]);
        }
    }

    return { paths, interpolatedPrefixes };
}

/**
 * Check if a key is used in the project sources. A key counts as used when it is referenced outright, or when an
 * ancestor is, since keys below a referenced branch are built dynamically (`SR5.Skill.${name}`).
 * @param {string} key - The localization key to search for
 * @param {{ paths: Set<string>, interpolatedPrefixes: Set<string> }} references - Paths collected by collectReferencedPaths
 * @returns {boolean} - True if key is referenced
 */
export function isKeyUsed(key, { paths, interpolatedPrefixes }) {
    if (paths.has(key)) return true;
    if ([...interpolatedPrefixes].some((prefix) => key.startsWith(prefix))) return true;

    const segments = key.split('.');
    for (let index = segments.length - 1; index > 1; index -= 1) {
        if (paths.has(segments.slice(0, index).join('.'))) return true;
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
    console.log('Loading modular base locale...');
    const baseConfig = localization.loadLocale(localization.BASE_LOCALE).data;

    const allKeys = Object.keys(localization.flattenObject(baseConfig));
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
    const references = collectReferencedPaths(fileContents);
    const unusedKeys = [];
    let implicitCount = 0;

    for (const key of allKeys) {
        if (isImplicitlyConsumed(key)) {
            implicitCount++;
            continue;
        }

        if (!isKeyUsed(key, references)) {
            unusedKeys.push(key);
        }
    }

    const checkedCount = allKeys.length - implicitCount;
    console.log(`Skipped ${implicitCount} keys Foundry resolves implicitly; checked ${checkedCount}.\n`);

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
    console.log(`✨ Check complete! Total unused: ${unusedKeys.length}/${checkedCount} checked (${allKeys.length} total, ${implicitCount} implicit)`);
}

if (process.argv[1] === __filename) main();
