'use strict';
/* oxlint-disable typescript/no-require-imports -- Shared with the CommonJS Gulp task runner. */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SOURCE_LOCALE_DIR = path.join(PROJECT_ROOT, 'src', 'locale');
const DIST_LOCALE_DIR = path.join(PROJECT_ROOT, 'dist', 'locale');
const BASE_LOCALE = 'en';
const LOCALES = Object.freeze(['en', 'de', 'fr', 'ko', 'pt-BR']);
const MODULES = Object.freeze([
    'system',
    'common',
    'actors',
    'items',
    'skills-tests',
    'combat',
    'magic',
    'matrix',
    'effects',
    'applications',
    'messages',
    'ui',
]);
const EXPECTED_BASE_KEY_COUNT = 2545;
const MODULE_NAMESPACES = Object.freeze({
    actors: Object.freeze(['Actor', 'ActorTypes', 'Character', 'Contact', 'InventoryRename', 'MovementTypes', 'Vehicle', 'VehicleImport', 'Vision']),
    items: Object.freeze(['Ammo', 'Armor', 'Device', 'Element', 'Item', 'ItemTypes', 'Lifestyle', 'Modification', 'ModificationTypes', 'MoveInventoryDialog', 'Program', 'Quality', 'Weapon']),
    'skills-tests': Object.freeze(['ActionCategory', 'ActionType', 'CallInAction', 'ExtendedTestManager', 'ModifierTypes', 'Skill', 'TestResults', 'Tests']),
    combat: Object.freeze(['Combat', 'Damage', 'DamageApplication']),
    magic: Object.freeze(['AdeptPower', 'CritterPower', 'Magic', 'Ritual', 'Spell', 'Spirit']),
    matrix: Object.freeze(['ComplexForm', 'Grid', 'Host', 'IC', 'Matrix', 'MatrixNetworkHackingApplication', 'MatrixOpposedDeviceDialog', 'NetworkManager', 'RebootConfirmationDialog', 'SelectMatrixNetworkDialog', 'Sprite', 'SpritePower']),
    effects: Object.freeze(['ActiveEffect', 'StatusEffects']),
    applications: Object.freeze(['ChangelogApplication', 'CompendiumBrowser', 'CompendiumSettings', 'Compendiums', 'DeleteConfirmationApplication', 'EnvModifiersApplication', 'GMRequest', 'Import', 'KarmaManager', 'Migration', 'NuyenManager', 'OverwatchScoreTracker', 'ReputationManager', 'SituationalModifiersApplication', 'TimeControl', 'Tours']),
    messages: Object.freeze(['Dialogs', 'Errors', 'Messages', 'MissingResources', 'Notifications', 'Warnings']),
    ui: Object.freeze(['Content', 'ContextOptions', 'Keybindings', 'Labels', 'Tabs', 'Tooltips']),
});
const LEGACY_PATH_PREFIXES = Object.freeze([
    'SR5.COMBAT.', 'SR5.FOUNDRY.', 'SR5.MIGRATION.', 'SR5.Migrator.', 'SR5.DIALOG.', 'SR5.MissingRessource.',
    'SR5.CompendiaSettings.', 'SR5.Keybinding.', 'SETTINGS.MustHaveRessourcesOnTest',
    'SR5.Errors.KeyNotModifyableByActiveEffect', 'SR5.Warnings.CantSpendMulitplePointsOfEdge',
    'SR5.Content.Actions.EnterexitHost', 'SR5.Labels.Actions.HackontheFly', 'SR5.RangeWeaponAttack',
]);
const DYNAMIC_REFERENCE_PREFIXES = Object.freeze(['SR5.Skill.Groups', 'SR5.Skill.Sets']);

function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
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

function listModuleNames(locale) {
    const localeDir = path.join(SOURCE_LOCALE_DIR, locale);
    if (!fs.existsSync(localeDir)) throw new Error(`Missing locale directory: ${localeDir}`);
    return fs
        .readdirSync(localeDir, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
        .map((entry) => path.basename(entry.name, '.json'))
        .sort();
}

function assertModuleShape(locale, moduleName, fragment) {
    if (!isPlainObject(fragment)) throw new Error(`${locale}/${moduleName}.json must contain a JSON object`);
    const roots = Object.keys(fragment);
    if (moduleName === 'system') {
        const allowed = new Set(['CONTROLS', 'SETTINGS', 'TYPES']);
        const invalid = roots.filter((root) => !allowed.has(root));
        if (invalid.length) throw new Error(`${locale}/system.json has invalid roots: ${invalid.join(', ')}`);
        return;
    }
    if (roots.length !== 1 || roots[0] !== 'SR5' || !isPlainObject(fragment.SR5)) {
        throw new Error(`${locale}/${moduleName}.json must contain only an SR5 object`);
    }

    if (moduleName === 'common') {
        const nested = Object.entries(fragment.SR5)
            .filter(([, value]) => isPlainObject(value))
            .map(([key]) => key);
        if (nested.length) throw new Error(`${locale}/common.json must contain only shared scalar SR5 keys: ${nested.join(', ')}`);
        return;
    }

    const actualNamespaces = Object.keys(fragment.SR5).sort();
    const expectedNamespaces = [...MODULE_NAMESPACES[moduleName]].sort();
    if (JSON.stringify(actualNamespaces) !== JSON.stringify(expectedNamespaces)) {
        throw new Error(
            `${locale}/${moduleName}.json namespace set differs from the required set. ` +
            `Expected ${expectedNamespaces.join(', ')}; found ${actualNamespaces.join(', ')}`,
        );
    }
}

function validateSourceReferences(baseFlat, errors) {
    const sourceRoot = path.join(PROJECT_ROOT, 'src');
    const supportedExtensions = new Set(['.ts', '.hbs', '.json']);
    const files = [];
    function visit(directory) {
        for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
            if (entry.name === 'locale') continue;
            const filePath = path.join(directory, entry.name);
            if (entry.isDirectory()) visit(filePath);
            else if (supportedExtensions.has(path.extname(entry.name))) files.push(filePath);
        }
    }
    visit(sourceRoot);

    const referencePattern = /['"`](SR5(?:\.[A-Za-z0-9_]+)+)['"`]/g;
    for (const filePath of files) {
        const content = fs.readFileSync(filePath, 'utf8');
        for (const legacyPrefix of LEGACY_PATH_PREFIXES) {
            if (content.includes(legacyPrefix)) {
                errors.push(`${path.relative(PROJECT_ROOT, filePath)} references retired localization path prefix "${legacyPrefix}"`);
            }
        }
        for (const match of content.matchAll(referencePattern)) {
            const reference = match[1];
            if (DYNAMIC_REFERENCE_PREFIXES.some((prefix) => reference.startsWith(prefix))) continue;
            if (reference in baseFlat) continue;
            if (Object.keys(baseFlat).some((key) => key.startsWith(`${reference}.`))) continue;
            errors.push(`${path.relative(PROJECT_ROOT, filePath)} references unknown localization key "${reference}"`);
        }
    }
}

function loadLocale(locale) {
    const actualModules = listModuleNames(locale);
    const expectedModules = [...MODULES].sort();
    if (JSON.stringify(actualModules) !== JSON.stringify(expectedModules)) {
        throw new Error(
            `${locale} module set differs from the required set. Expected ${expectedModules.join(', ')}; ` +
                `found ${actualModules.join(', ')}`,
        );
    }

    const merged = {};
    const ownership = new Map();
    for (const moduleName of MODULES) {
        const filePath = path.join(SOURCE_LOCALE_DIR, locale, `${moduleName}.json`);
        const fragment = readJson(filePath);
        assertModuleShape(locale, moduleName, fragment);
        for (const key of Object.keys(flattenObject(fragment))) {
            if (ownership.has(key)) {
                throw new Error(`${locale} key "${key}" occurs in both ${ownership.get(key)} and ${moduleName}`);
            }
            ownership.set(key, moduleName);
        }
        mergeObject(merged, fragment, `${locale}/${moduleName}.json`);
    }
    return { data: merged, ownership };
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

function validateLocales() {
    const base = loadLocale(BASE_LOCALE);
    const baseFlat = flattenObject(base.data);
    const baseKeys = Object.keys(baseFlat).sort();
    const errors = [];

    if (baseKeys.length !== EXPECTED_BASE_KEY_COUNT) {
        errors.push(`English locale has ${baseKeys.length} keys; expected ${EXPECTED_BASE_KEY_COUNT}`);
    }
    for (const key of baseKeys) {
        if (LEGACY_PATH_PREFIXES.some((prefix) => key.startsWith(prefix))) {
            errors.push(`English locale contains retired localization key "${key}"`);
        }
    }

    for (const locale of LOCALES) {
        let loaded;
        try {
            loaded = locale === BASE_LOCALE ? base : loadLocale(locale);
        } catch (error) {
            errors.push(error.message);
            continue;
        }
        const flat = flattenObject(loaded.data);
        const keys = Object.keys(flat).sort();
        const missing = baseKeys.filter((key) => !(key in flat));
        const extra = keys.filter((key) => !(key in baseFlat));
        if (missing.length) errors.push(`${locale} is missing ${missing.length} keys: ${missing.join(', ')}`);
        if (extra.length) errors.push(`${locale} has ${extra.length} extra keys: ${extra.join(', ')}`);

        for (const key of baseKeys) {
            if (!(key in flat)) continue;
            const value = flat[key];
            const baseValue = baseFlat[key];
            if (typeof value !== typeof baseValue) {
                errors.push(`${locale} key "${key}" is ${typeof value}; expected ${typeof baseValue}`);
                continue;
            }
            if (typeof value !== 'string') continue;
            if (!value.trim()) errors.push(`${locale} key "${key}" is empty`);
            if (value.includes('[MISSING]')) errors.push(`${locale} key "${key}" contains [MISSING]`);
            if (!equalArray(extractPlaceholders(value), extractPlaceholders(baseValue))) {
                errors.push(`${locale} key "${key}" does not preserve interpolation placeholders`);
            }
            if (!equalArray(extractMarkupTags(value), extractMarkupTags(baseValue))) {
                errors.push(`${locale} key "${key}" does not preserve HTML tag structure`);
            }
            if (loaded.ownership.get(key) !== base.ownership.get(key)) {
                errors.push(
                    `${locale} key "${key}" belongs to ${loaded.ownership.get(key)}; ` +
                        `English assigns it to ${base.ownership.get(key)}`,
                );
            }
        }
    }

    validateSourceReferences(baseFlat, errors);

    if (errors.length) throw new Error(errors.join('\n'));
    return { keyCount: baseKeys.length, locales: [...LOCALES] };
}

function buildLocales(outputDir = DIST_LOCALE_DIR) {
    const validation = validateLocales();
    for (const locale of LOCALES) {
        const { data } = loadLocale(locale);
        const localeOutputDir = path.join(outputDir, locale);
        fs.mkdirSync(localeOutputDir, { recursive: true });
        fs.writeFileSync(path.join(localeOutputDir, 'config.json'), `${JSON.stringify(data, null, 4)}\n`, 'utf8');
    }
    return validation;
}

module.exports = {
    BASE_LOCALE,
    DIST_LOCALE_DIR,
    EXPECTED_BASE_KEY_COUNT,
    LOCALES,
    MODULE_NAMESPACES,
    MODULES,
    SOURCE_LOCALE_DIR,
    buildLocales,
    flattenObject,
    loadLocale,
    validateLocales,
};
