#!/usr/bin/env node

/**
 * Checks the localization keys used in the source code against the base locale (en).
 *
 * Scans src/ (.js, .ts, .hbs, .html; no .spec.ts) for string literals that start with a system namespace,
 * i.e. a top-level key of public/locale/en/config.json (currently CONTROLS, SETTINGS, SR5, TYPES).
 * Every distinct literal is classified:
 *  - exists:  the key resolves to a string in en
 *  - object:  the key resolves to an object in en (a parent of existing keys)
 *  - new:     the key is missing in en and no segment of its path is a string
 *  - blocked: a segment of the path is a string in en (e.g. en "SR5.Ammo": "Ammo", code "SR5.Ammo.label"),
 *             or the key lies below another missing key, so both cannot be inserted
 *  - dynamic: contains '${' (template expression), cannot be verified
 *  - prefix:  ends with '.' (key built by concatenation), not a key
 *
 * Report only by default. Missing keys (new) are listed with their first locations (file:line).
 * Blocked and dynamic keys are never inserted.
 *
 * Options:
 *   (none)      report only, never writes any file
 *   --insert    insert missing keys (new) into public/locale/en/config.json with the placeholder '[MISSING]'.
 *               Existing values are never overwritten, the file is only written if its JSON round trip
 *               reproduces the original formatting, and only the objects that received keys are re-sorted.
 *   --verbose   also list prefix fragments and keys that resolve to objects in en
 *   -h, --help  print usage and exit
 *
 * Usage:
 *   npm run locale:code-keys                  # report only
 *   npm run locale:code-keys -- --insert      # insert missing keys as [MISSING] placeholders into en
 *   npm run locale:code-keys -- --verbose     # additionally list prefix fragments and object keys
 *
 * Exit codes:
 *   0  normal run, also when missing keys are found (informational, like utils/check-localization.mjs)
 *   1  en/config.json cannot be read or parsed, the file cannot be written, src/ cannot be scanned,
 *      or an unknown option was passed
 *
 * Limitations:
 *  - Only string literals are analysed. Keys built at runtime cannot be verified and are listed for review.
 *  - Template literals spanning several lines, and template expressions containing spaces or quotes, are not matched.
 *  - Keys used only outside src/ (system.json, packs, macros) are not seen.
 *  - Any string literal starting with a system namespace counts, so some findings may not be locale keys
 *    (false positives). Review the inserted keys with git diff before keeping them.
 *  - Foundry core namespaces (COMBAT., EFFECT., DOCUMENT., ...) are ignored because they are not part of en.
 *
 * On GitHub Actions, each missing key is also printed as a warning annotation (report mode only).
 * See utils/README-CODE-LOCALE-KEYS.md for details.
 *
 * NOTE: This file and README-CODE-LOCALE-KEYS.md is fully AI generated.
 * Please review carefully before use and modify as needed.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ROOT_DIR = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const EN_FILE = path.join(ROOT_DIR, 'public', 'locale', 'en', 'config.json');
const SOURCE_EXTENSIONS = ['.js', '.ts', '.hbs', '.html'];
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git']);
const LITERAL_KEY_PATTERN = /^[A-Za-z0-9_\-]+(\.[A-Za-z0-9_\-]+)+$/;
const PLACEHOLDER_VALUE = '[MISSING]';
const MAX_LOCATIONS = 3;

/**
 * @param {string} text
 * @returns {string}
 */
function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Regex matching a string literal (quoted by ', " or `) that starts with one of the namespaces.
 * Group 2 holds the literal content.
 * @param {string[]} namespaces
 * @returns {RegExp}
 */
function buildLiteralPattern(namespaces) {
    const alternatives = namespaces.map(escapeRegExp).join('|');
    return new RegExp(`(['"\`])((?:${alternatives})\\.[^'"\`\\s]*)\\1`, 'g');
}

/**
 * @param {unknown} value
 * @returns {boolean}
 */
function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * @param {string} name
 * @returns {boolean}
 */
function isSourceFile(name) {
    return !name.endsWith('.spec.ts') && SOURCE_EXTENSIONS.some((extension) => name.endsWith(extension));
}

/**
 * Recursively list the source files below a directory.
 * @param {string} dir
 * @returns {string[]} absolute file paths
 */
function listSourceFiles(dir) {
    const files = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const entryPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (!SKIP_DIRS.has(entry.name)) files.push(...listSourceFiles(entryPath));
        } else if (entry.isFile() && isSourceFile(entry.name)) {
            files.push(entryPath);
        }
    }
    return files;
}

/**
 * @param {string} filePath
 * @returns {string}
 */
function toDisplayPath(filePath) {
    return path.relative(ROOT_DIR, filePath).split(path.sep).join('/');
}

/**
 * Collect every literal candidate with its first location per file.
 * @param {string[]} files absolute file paths
 * @param {RegExp} pattern
 * @returns {Map<string, Array<{file: string, line: number}>>}
 */
function collectKeys(files, pattern) {
    const occurrences = new Map();
    for (const filePath of files) {
        const file = toDisplayPath(filePath);
        const lines = fs.readFileSync(filePath, 'utf8').split('\n');
        lines.forEach((text, index) => {
            for (const match of text.matchAll(pattern)) {
                const key = match[2];
                const locations = occurrences.get(key) ?? [];
                if (!locations.some((location) => location.file === file)) {
                    locations.push({ file, line: index + 1 });
                }
                occurrences.set(key, locations);
            }
        });
    }
    return occurrences;
}

/**
 * Walk the en object along the key path.
 * @param {object} en
 * @param {string} key
 * @returns {{status: 'exists'|'object'|'new'|'blocked', blockedBy?: string, blockedValue?: unknown}}
 */
function resolveKey(en, key) {
    const segments = key.split('.');
    let node = en;
    for (let index = 0; index < segments.length; index++) {
        if (!isObject(node)) {
            return { status: 'blocked', blockedBy: segments.slice(0, index).join('.'), blockedValue: node };
        }
        if (!Object.prototype.hasOwnProperty.call(node, segments[index])) {
            return { status: 'new' };
        }
        node = node[segments[index]];
    }
    return { status: isObject(node) ? 'object' : 'exists' };
}

/**
 * @param {string} key
 * @param {object} en
 * @returns {{kind: 'dynamic'|'prefix'|'ignored'} | {kind: 'literal', status: string, blockedBy?: string, blockedValue?: unknown}}
 */
function classifyKey(key, en) {
    if (key.includes('${')) return { kind: 'dynamic' };
    if (key.endsWith('.')) return { kind: 'prefix' };
    if (!LITERAL_KEY_PATTERN.test(key)) return { kind: 'ignored' };
    return { kind: 'literal', ...resolveKey(en, key) };
}

/**
 * Mark missing keys that lie below another missing key as blocked. Both cannot be inserted,
 * the shallowest missing key is kept as the insert candidate.
 * @param {Array<{key: string, status: string, blockedBy?: string, blockedValue?: unknown}>} entries mutated
 */
function markNestedConflicts(entries) {
    const newKeys = new Set(entries.filter((entry) => entry.status === 'new').map((entry) => entry.key));
    for (const entry of entries) {
        if (entry.status !== 'new') continue;
        const ancestor = findShallowestAncestor(entry.key, newKeys);
        if (ancestor) {
            entry.status = 'blocked';
            entry.blockedBy = ancestor;
            entry.blockedValue = undefined;
        }
    }
}

/**
 * @param {string} key
 * @param {Set<string>} keys
 * @returns {string|null}
 */
function findShallowestAncestor(key, keys) {
    const segments = key.split('.');
    for (let length = 1; length < segments.length; length++) {
        const ancestor = segments.slice(0, length).join('.');
        if (keys.has(ancestor)) return ancestor;
    }
    return null;
}

/**
 * Classify all collected candidates.
 * @param {Map<string, Array<{file: string, line: number}>>} occurrences
 * @param {object} en
 * @returns {{literals: object[], dynamics: object[], prefixes: object[]}}
 */
function analyse(occurrences, en) {
    const literals = [];
    const dynamics = [];
    const prefixes = [];
    for (const [key, locations] of occurrences) {
        const result = classifyKey(key, en);
        if (result.kind === 'literal') literals.push({ key, locations, ...result });
        else if (result.kind === 'dynamic') dynamics.push({ key, locations });
        else if (result.kind === 'prefix') prefixes.push({ key, locations });
    }
    markNestedConflicts(literals);
    return { literals, dynamics, prefixes };
}

/**
 * Insert placeholder values for the given keys. Existing values are never overwritten.
 * @param {object} en mutated
 * @param {string[]} keys keys that are missing and have no string ancestor
 * @returns {Set<object>} objects that received new keys
 */
function insertKeys(en, keys) {
    const touched = new Set();
    for (const key of keys) {
        const segments = key.split('.');
        const leaf = segments.pop();
        let node = en;
        for (const segment of segments) {
            if (!Object.prototype.hasOwnProperty.call(node, segment)) {
                node[segment] = {};
                touched.add(node);
            }
            node = node[segment];
            if (!isObject(node)) throw new Error(`Cannot insert '${key}': '${segment}' is not an object`);
        }
        if (Object.prototype.hasOwnProperty.call(node, leaf)) {
            throw new Error(`Refusing to overwrite existing key '${key}'`);
        }
        node[leaf] = PLACEHOLDER_VALUE;
        touched.add(node);
    }
    return touched;
}

/**
 * Re-sort the keys of the given objects in place (default string order), leaving all other objects untouched.
 * @param {Set<object>} touched
 */
function sortTouched(touched) {
    for (const obj of touched) {
        const entries = Object.keys(obj).sort().map((key) => [key, obj[key]]);
        for (const key of Object.keys(obj)) delete obj[key];
        for (const [key, value] of entries) obj[key] = value;
    }
}

/**
 * Abort if the JSON formatting would change on write (e.g. CRLF or a trailing newline).
 * @param {string} raw
 */
function assertRoundTrip(raw) {
    if (JSON.stringify(JSON.parse(raw), null, 4) !== raw) {
        throw new Error(`${toDisplayPath(EN_FILE)} would not keep its formatting when rewritten, aborting`);
    }
}

/**
 * @param {Array<{locations: Array<{file: string, line: number}>}>} locations
 * @returns {string}
 */
function formatLocations(locations) {
    const shown = locations.slice(0, MAX_LOCATIONS).map(({ file, line }) => `${file}:${line}`);
    const more = locations.length - shown.length;
    return shown.join(', ') + (more > 0 ? ` (+${more} more)` : '');
}

/**
 * Sort comparator by entry key (code-unit order).
 * @param {{key: string}} a
 * @param {{key: string}} b
 * @returns {number}
 */
function compareKeys(a, b) {
    if (a.key === b.key) return 0;
    return a.key < b.key ? -1 : 1;
}

/**
 * Print entries grouped by top-level namespace.
 * @param {Array<{key: string}>} entries
 * @param {(entry: object) => void} printEntry
 */
function printGroupedByNamespace(entries, printEntry) {
    const groups = new Map();
    for (const entry of [...entries].sort(compareKeys)) {
        const namespace = entry.key.split('.')[0];
        groups.set(namespace, [...(groups.get(namespace) ?? []), entry]);
    }
    if (groups.size === 0) console.log('  none');
    for (const [namespace, group] of groups) {
        console.log(`  ${namespace} (${group.length})`);
        group.forEach(printEntry);
    }
}

/**
 * @param {Array<{key: string}>} entries
 * @param {(entry: object) => void} printEntry
 */
function printList(entries, printEntry) {
    if (entries.length === 0) console.log('  none');
    [...entries].sort(compareKeys).forEach(printEntry);
}

/**
 * @param {object} entry
 * @returns {string}
 */
function describeBlock(entry) {
    if (entry.blockedValue !== undefined) {
        return `blocked by ${entry.blockedBy} = ${JSON.stringify(entry.blockedValue)}`;
    }
    return `blocked by missing key ${entry.blockedBy}, both cannot be inserted`;
}

/**
 * @param {{literals: object[], dynamics: object[], prefixes: object[]}} report
 * @param {{scannedFiles: number, namespaces: string[], verbose: boolean}} context
 */
function printReport(report, context) {
    const { literals, dynamics, prefixes } = report;
    const { scannedFiles, namespaces, verbose } = context;
    const count = (status) => literals.filter((entry) => entry.status === status).length;
    const missing = literals.filter((entry) => entry.status === 'new');
    const blocked = literals.filter((entry) => entry.status === 'blocked');

    console.log('🌍 Shadowrun 5e code locale key check\n');
    console.log(`Base locale: ${toDisplayPath(EN_FILE)}`);
    console.log(`Namespaces: ${namespaces.join(', ')}`);
    console.log(`Scanned files: ${scannedFiles}`);
    console.log(`Distinct literal keys: ${literals.length} (exist in en: ${count('exists')}, `
        + `resolve to object: ${count('object')}, missing: ${missing.length + blocked.length} `
        + `= new ${missing.length} + blocked ${blocked.length})`);
    console.log(`Dynamic keys: ${dynamics.length}`);
    console.log(`Prefix fragments: ${prefixes.length}`);

    console.log(`\nMissing keys (new): ${missing.length}`);
    printGroupedByNamespace(missing, (entry) => {
        console.log(`    ${entry.key}`);
        console.log(`        ${formatLocations(entry.locations)}`);
    });

    console.log(`\nBlocked keys (conflict with an existing string value in en): ${blocked.length}`);
    printList(blocked, (entry) => {
        console.log(`    ${entry.key}  (${describeBlock(entry)})`);
        console.log(`        ${formatLocations(entry.locations)}`);
    });

    console.log(`\nDynamic keys (cannot be verified): ${dynamics.length}`);
    printList(dynamics, (entry) => {
        console.log(`    ${entry.key}`);
        console.log(`        ${formatLocations(entry.locations)}`);
    });

    if (verbose) {
        const objects = literals.filter((entry) => entry.status === 'object');
        console.log(`\nKeys resolving to an object in en (verbose): ${objects.length}`);
        printList(objects, (entry) => console.log(`    ${entry.key}`));

        console.log(`\nPrefix fragments (verbose, not keys): ${prefixes.length}`);
        printList(prefixes, (entry) => {
            console.log(`    ${entry.key}`);
            console.log(`        ${formatLocations(entry.locations)}`);
        });
    }

    console.log(`\nSummary: ${missing.length} missing (new), ${blocked.length} blocked, `
        + `${dynamics.length} dynamic, ${prefixes.length} prefix fragments.`);
}

/**
 * Insert the missing keys into en and write the file.
 * @param {object} en
 * @param {string} raw original file content
 * @param {string[]} keys
 */
function runInsert(en, raw, keys) {
    if (keys.length === 0) {
        console.log('\nNo missing keys to insert.');
        return;
    }
    assertRoundTrip(raw);
    const touched = insertKeys(en, keys);
    sortTouched(touched);
    fs.writeFileSync(EN_FILE, JSON.stringify(en, null, 4), 'utf8');

    console.log(`\nInserted ${keys.length} key(s) into ${toDisplayPath(EN_FILE)}:`);
    keys.forEach((key) => console.log(`    ${key}`));
    console.log(`\nReplace all ${PLACEHOLDER_VALUE} values in en/config.json with proper English text, `
        + 'then run npm run locale:check to see which other locales need the new keys.');
}

/**
 * @param {string[]} args
 * @returns {{insert: boolean, verbose: boolean, help: boolean}}
 */
function parseArgs(args) {
    const options = { insert: false, verbose: false, help: false };
    for (const arg of args) {
        if (arg === '--insert') options.insert = true;
        else if (arg === '--verbose') options.verbose = true;
        else if (arg === '--help' || arg === '-h') options.help = true;
        else throw new Error(`Unknown option '${arg}'`);
    }
    return options;
}

/**
 * @param {(message: string) => void} print
 */
function printUsage(print) {
    print('Usage: npm run locale:code-keys -- [options]');
    print('');
    print('Options:');
    print('  (none)      report only, no file is written');
    print(`  --insert    insert missing keys as ${PLACEHOLDER_VALUE} placeholders into public/locale/en/config.json`);
    print('  --verbose   also list prefix fragments and keys that resolve to objects in en');
    print('  -h, --help  print this help and exit');
}

function main() {
    let options;
    try {
        options = parseArgs(process.argv.slice(2));
    } catch (error) {
        console.error(`✖ ${error.message}\n`);
        printUsage(console.error);
        process.exit(1);
    }

    if (options.help) {
        printUsage(console.log);
        return;
    }

    let raw;
    let en;
    try {
        raw = fs.readFileSync(EN_FILE, 'utf8');
        en = JSON.parse(raw);
    } catch (error) {
        console.error(`✖ Could not load ${toDisplayPath(EN_FILE)}: ${error.message}`);
        process.exit(1);
    }

    let files;
    try {
        files = listSourceFiles(SRC_DIR).sort();
    } catch (error) {
        console.error(`✖ Could not scan ${toDisplayPath(SRC_DIR)}: ${error.message}`);
        process.exit(1);
    }

    const namespaces = Object.keys(en);
    const occurrences = collectKeys(files, buildLiteralPattern(namespaces));
    const report = analyse(occurrences, en);
    printReport(report, { scannedFiles: files.length, namespaces, verbose: options.verbose });

    const missing = report.literals.filter((entry) => entry.status === 'new');
    if (options.insert) {
        try {
            runInsert(en, raw, missing.map((entry) => entry.key).sort());
        } catch (error) {
            console.error(`✖ Insert failed: ${error.message}`);
            process.exit(1);
        }
    } else if (process.env.GITHUB_ACTIONS) {
        for (const entry of missing) {
            const { file, line } = entry.locations[0];
            console.log(`::warning title=Locale key missing in en::${entry.key} (${file}:${line})`);
        }
    }
}

main();
