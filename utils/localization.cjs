'use strict';
/* oxlint-disable typescript/no-require-imports -- Shared with the CommonJS Gulp task runner. */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SYSTEM_MANIFEST = path.join(PROJECT_ROOT, 'system.json');
const SOURCE_LOCALE_DIR = path.join(PROJECT_ROOT, 'src', 'locale');
const DIST_LOCALE_DIR = path.join(PROJECT_ROOT, 'dist', 'locale');
const BASE_LOCALE = 'en';
const DYNAMIC_NAME_PREFIXES = Object.freeze(['SR5.Skill.Groups', 'SR5.Skill.Sets']);

function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function readJson(filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        throw new Error(`Unable to parse ${path.relative(PROJECT_ROOT, filePath)}: ${error.message}`);
    }
}

function getSupportedLocales() {
    const manifest = readJson(SYSTEM_MANIFEST);
    if (!Array.isArray(manifest.languages)) throw new Error('system.json must define a languages array');

    const locales = manifest.languages.map(({ lang }) => lang);
    if (locales.some((locale) => typeof locale !== 'string' || !locale)) {
        throw new Error('Every system.json language must define a non-empty lang code');
    }
    if (new Set(locales).size !== locales.length) throw new Error('system.json contains duplicate language codes');
    if (!locales.includes(BASE_LOCALE)) throw new Error(`system.json must include the ${BASE_LOCALE} base locale`);
    return Object.freeze(locales);
}

const LOCALES = getSupportedLocales();

function assertAlphabeticalKeys(value, sourceName, prefix = '') {
    if (!isPlainObject(value)) return;

    const keys = Object.keys(value);
    const sortedKeys = [...keys].sort();
    if (JSON.stringify(keys) !== JSON.stringify(sortedKeys)) {
        throw new Error(`${sourceName} has non-alphabetical keys at "${prefix || '<root>'}"`);
    }

    for (const key of keys) {
        assertAlphabeticalKeys(value[key], sourceName, prefix ? `${prefix}.${key}` : key);
    }
}

function flattenObject(object, prefix = '', flattened = {}) {
    for (const [key, value] of Object.entries(object)) {
        const flatKey = prefix ? `${prefix}.${key}` : key;
        if (isPlainObject(value)) flattenObject(value, flatKey, flattened);
        else flattened[flatKey] = value;
    }
    return flattened;
}

function mergeObject(target, source, sourceName, prefix = '') {
    for (const [key, value] of Object.entries(source)) {
        const keyPath = prefix ? `${prefix}.${key}` : key;
        if (!(key in target)) {
            target[key] = structuredClone(value);
            continue;
        }
        if (isPlainObject(target[key]) && isPlainObject(value)) {
            mergeObject(target[key], value, sourceName, keyPath);
            continue;
        }
        throw new Error(`Duplicate locale key "${keyPath}" in ${sourceName}`);
    }
    return target;
}

function listModuleNames(locale, sourceLocaleDir = SOURCE_LOCALE_DIR) {
    const localeDir = path.join(sourceLocaleDir, locale);
    if (!fs.existsSync(localeDir)) throw new Error(`Missing locale directory: ${localeDir}`);
    return fs
        .readdirSync(localeDir, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
        .map((entry) => path.basename(entry.name, '.json'))
        .sort();
}

/**
 * Load a locale from all of its JSON modules. Module names are discovered from the directory so adding a module does
 * not require changing the build utility.
 */
function loadLocale(locale, { sourceLocaleDir = SOURCE_LOCALE_DIR } = {}) {
    const modules = listModuleNames(locale, sourceLocaleDir);
    const data = {};

    for (const moduleName of modules) {
        const filePath = path.join(sourceLocaleDir, locale, `${moduleName}.json`);
        const sourceName = `${locale}/${moduleName}.json`;
        const fragment = readJson(filePath);
        if (!isPlainObject(fragment)) throw new Error(`${sourceName} must contain a JSON object`);
        assertAlphabeticalKeys(fragment, sourceName);
        mergeObject(data, fragment, sourceName);
    }

    return { data, modules };
}

function compareLocales(baseFlat, localeFlat) {
    const baseKeys = Object.keys(baseFlat).sort();
    const localeKeys = Object.keys(localeFlat).sort();
    return {
        missing: baseKeys.filter((key) => !(key in localeFlat)),
        extra: localeKeys.filter((key) => !(key in baseFlat)),
    };
}

function extractPlaceholders(value) {
    return [...value.matchAll(/\{([^{}]+)\}/g)].map((match) => match[1]).sort();
}

function extractMarkupTags(value) {
    return [...value.matchAll(/<\s*(\/?)\s*([a-z][a-z0-9-]*)\b[^>]*>/gi)].map(
        (match) => `${match[1]}${match[2].toLowerCase()}`,
    );
}

function equalArray(left, right) {
    return left.length === right.length && left.every((value, index) => value === right[index]);
}

function validateLeafValues(locale, localeFlat, baseFlat, errors) {
    for (const [key, value] of Object.entries(localeFlat)) {
        if (typeof value !== 'string') {
            errors.push(`${locale} key "${key}" is ${typeof value}; localization values must be strings`);
            continue;
        }
        if (!value.trim()) errors.push(`${locale} key "${key}" is empty`);
        if (value.includes('[MISSING]')) errors.push(`${locale} key "${key}" contains [MISSING]`);

        if (!baseFlat || !(key in baseFlat)) continue;
        const baseValue = baseFlat[key];
        if (typeof value !== typeof baseValue) {
            errors.push(`${locale} key "${key}" is ${typeof value}; expected ${typeof baseValue}`);
            continue;
        }
        if (!equalArray(extractPlaceholders(value), extractPlaceholders(baseValue))) {
            errors.push(`${locale} key "${key}" does not preserve interpolation placeholders`);
        }
        if (!equalArray(extractMarkupTags(value), extractMarkupTags(baseValue))) {
            errors.push(`${locale} key "${key}" does not preserve HTML tag structure`);
        }
    }
}

function validateSourceReferences(baseFlat, errors) {
    const sourceRoot = path.join(PROJECT_ROOT, 'src');
    const extensions = new Set(['.cjs', '.hbs', '.js', '.json', '.mjs', '.ts']);
    const files = [];
    function visit(directory) {
        for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
            if (entry.name === 'locale') continue;
            const filePath = path.join(directory, entry.name);
            if (entry.isDirectory()) visit(filePath);
            else if (extensions.has(path.extname(entry.name))) files.push(filePath);
        }
    }
    visit(sourceRoot);

    const branches = new Set();
    for (const key of Object.keys(baseFlat)) {
        const segments = key.split('.');
        for (let index = 1; index < segments.length; index += 1) branches.add(segments.slice(0, index).join('.'));
    }

    const quotePattern = '[\\x22\\x27\\x60]';
    const literalPattern = new RegExp(`${quotePattern}(SR5(?:\\.[A-Za-z0-9_]+)+)${quotePattern}`, 'g');
    const dynamicPattern = /\x60(SR5(?:\.[A-Za-z0-9_.]*)*)\$\{/g;
    for (const filePath of files) {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(PROJECT_ROOT, filePath);
        for (const match of content.matchAll(literalPattern)) {
            const reference = match[1];
            // These prefixes name user-configurable skill collections. Helpers fall back to their source name when no
            // matching SR5 locale key exists.
            if (DYNAMIC_NAME_PREFIXES.some((prefix) => reference.startsWith(prefix))) continue;
            if (reference in baseFlat || branches.has(reference)) continue;
            errors.push(`${relativePath} references unknown localization key "${reference}"`);
        }
        for (const match of content.matchAll(dynamicPattern)) {
            const ancestor = match[1].replace(/[^.]*$/, '').replace(/\.$/, '');
            if (!ancestor || branches.has(ancestor)) continue;
            errors.push(`${relativePath} builds a localization key below unknown branch "${ancestor}"`);
        }
    }
}

function resolveLocales(locales) {
    const requested = locales ?? LOCALES;
    const uniqueLocales = [...new Set(requested)];
    const unsupported = uniqueLocales.filter((locale) => !LOCALES.includes(locale));
    if (unsupported.length) throw new Error(`Unknown locale(s): ${unsupported.join(', ')}`);
    return uniqueLocales;
}

/**
 * Validate source integrity and compare non-English locales to the English canonical locale. Missing keys are
 * warnings because Foundry loads English as the fallback dictionary for every non-English language.
 */
function validateLocales({ sourceLocaleDir = SOURCE_LOCALE_DIR, locales, checkSourceReferences = true } = {}) {
    const requestedLocales = resolveLocales(locales);
    const errors = [];
    const base = loadLocale(BASE_LOCALE, { sourceLocaleDir });
    const baseFlat = flattenObject(base.data);
    validateLeafValues(BASE_LOCALE, baseFlat, undefined, errors);
    const reports = [];

    for (const locale of requestedLocales) {
        if (locale === BASE_LOCALE) continue;
        let loaded;
        try {
            loaded = loadLocale(locale, { sourceLocaleDir });
        } catch (error) {
            errors.push(error.message);
            continue;
        }

        const localeFlat = flattenObject(loaded.data);
        const report = { locale, ...compareLocales(baseFlat, localeFlat) };
        reports.push(report);
        validateLeafValues(locale, localeFlat, baseFlat, errors);
    }

    if (checkSourceReferences) validateSourceReferences(baseFlat, errors);
    if (errors.length) throw new Error(errors.join('\n'));

    return {
        keyCount: Object.keys(baseFlat).length,
        locales: requestedLocales,
        reports,
        warnings: reports.filter((report) => report.missing.length || report.extra.length),
    };
}

function buildLocales(outputDir = DIST_LOCALE_DIR, options = {}) {
    const validation = validateLocales(options);
    for (const locale of validation.locales) {
        const { data } = loadLocale(locale, options);
        const localeOutputDir = path.join(outputDir, locale);
        fs.mkdirSync(localeOutputDir, { recursive: true });
        fs.writeFileSync(path.join(localeOutputDir, 'config.json'), `${JSON.stringify(data, null, 4)}\n`, 'utf8');
    }
    return validation;
}

module.exports = {
    BASE_LOCALE,
    DIST_LOCALE_DIR,
    LOCALES,
    SOURCE_LOCALE_DIR,
    buildLocales,
    compareLocales,
    flattenObject,
    loadLocale,
    validateLocales,
};
