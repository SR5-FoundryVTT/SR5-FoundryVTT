#!/usr/bin/env node

/**
 * Checks that every locale under public/locale has the key structure of the base locale (en).
 *
 * Errors (exit code 1, error annotation on GitHub Actions):
 *  - unreadable file or invalid JSON in any locale, including en
 *
 * Warnings (exit code stays 0, warning annotation on GitHub Actions):
 *  - missing keys (present in en, absent in the locale)
 *  - extra keys (present in the locale, absent in en)
 *  - value type mismatches (e.g. object in en, string in the locale)
 *
 * Identical values are intentionally NOT reported, as many terms are legitimately equal across languages.
 * Use `npm run locale:check` for a full report including identical values.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LOCALE_DIR = path.join(__dirname, '..', 'public', 'locale');
const BASE_LOCALE = 'en';
const MAX_LISTED = 50;

/**
 * Flatten a nested object into dot-notation keys.
 * @param {object} obj
 * @param {string} prefix
 * @param {Record<string, unknown>} result
 */
function flatten(obj, prefix = '', result = {}) {
    for (const [key, value] of Object.entries(obj)) {
        const flatKey = prefix ? `${prefix}.${key}` : key;
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            flatten(value, flatKey, result);
        } else {
            result[flatKey] = value;
        }
    }
    return result;
}

/**
 * @param {string} locale
 * @returns {Record<string, unknown>}
 */
function loadFlat(locale) {
    const file = path.join(LOCALE_DIR, locale, 'config.json');
    const content = fs.readFileSync(file, 'utf8');
    return flatten(JSON.parse(content));
}

function listed(keys) {
    const lines = keys.slice(0, MAX_LISTED).map((key) => `      - ${key}`);
    if (keys.length > MAX_LISTED) lines.push(`      ... and ${keys.length - MAX_LISTED} more`);
    return lines.join('\n');
}

function warn(message) {
    console.warn(`⚠ ${message}`);
    if (process.env.GITHUB_ACTIONS) console.log(`::warning title=Locale out of sync::${message}`);
}

function error(message) {
    console.error(`✖ ${message}`);
    if (process.env.GITHUB_ACTIONS) console.log(`::error title=Locale unreadable::${message}`);
}

function main() {
    const locales = fs
        .readdirSync(LOCALE_DIR, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && entry.name !== BASE_LOCALE)
        .map((entry) => entry.name)
        .sort();

    let base;
    try {
        base = loadFlat(BASE_LOCALE);
    } catch (e) {
        error(`${BASE_LOCALE}: could not load config.json (${e.message})`);
        process.exit(1);
    }

    const baseKeys = Object.keys(base);
    console.log(`Base locale '${BASE_LOCALE}': ${baseKeys.length} keys`);

    let outOfSync = 0;
    let unreadable = 0;

    for (const locale of locales) {
        let target;
        try {
            target = loadFlat(locale);
        } catch (e) {
            unreadable++;
            error(`${locale}: could not load config.json (${e.message})`);
            continue;
        }

        const missing = baseKeys.filter((key) => !(key in target));
        const extra = Object.keys(target).filter((key) => !(key in base));
        const typeMismatch = baseKeys.filter((key) => key in target && typeof target[key] !== typeof base[key]);

        if (!missing.length && !extra.length && !typeMismatch.length) {
            console.log(`✔ ${locale}: in sync (${Object.keys(target).length} keys)`);
            continue;
        }

        outOfSync++;
        warn(`${locale}: out of sync with '${BASE_LOCALE}' (${missing.length} missing, ${extra.length} extra, ${typeMismatch.length} type mismatches)`);
        if (missing.length) console.warn(`    Missing keys (${missing.length}):\n${listed(missing)}`);
        if (extra.length) console.warn(`    Extra keys (${extra.length}):\n${listed(extra)}`);
        if (typeMismatch.length) console.warn(`    Value type mismatches (${typeMismatch.length}):\n${listed(typeMismatch)}`);
    }

    if (outOfSync) {
        console.log(`\n${outOfSync} of ${locales.length} locale(s) are out of sync. Details: npm run locale:check -- <locale>`);
    }

    if (unreadable) {
        console.error(`\n${unreadable} of ${locales.length} locale(s) could not be read or parsed.`);
        process.exit(1);
    }

    if (!outOfSync) console.log(`\nAll ${locales.length} locale(s) match '${BASE_LOCALE}'.`);
}

main();
