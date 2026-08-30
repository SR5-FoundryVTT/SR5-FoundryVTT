#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import localization from './localization.cjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const legacyDir = path.join(projectRoot, 'public', 'locale');

const ownership = {
    actors: new Set([
        'Actor', 'ActorTypes', 'Character', 'ConditionMonitor', 'Contact', 'InventoryRename', 'Movement', 'MovementTypes',
        'Vehicle', 'VehicleImport', 'Vision',
    ]),
    items: new Set([
        'Ammo', 'Armor', 'Cyberware', 'Device', 'Element', 'Gear', 'Item', 'ItemTypes', 'Lifestyle', 'Modification',
        'MoveInventoryDialog', 'Program', 'Quality', 'SIN', 'Weapon',
    ]),
    'skills-tests': new Set([
        'ActionCategory', 'ActionType', 'CallInAction', 'ExtendedTestManager', 'ModifierTypes', 'Skill', 'TestResults',
        'Tests',
    ]),
    combat: new Set(['COMBAT', 'DamageApplication', 'ReputationManager']),
    magic: new Set(['AdeptPower', 'CritterPower', 'Ritual', 'Spell', 'Spirit']),
    matrix: new Set([
        'ComplexForm', 'Grid', 'Host', 'IC', 'MatrixNetworkHackingApplication', 'NetworkManager', 'RebootConfirmationDialog',
        'SelectMatrixNetworkDialog', 'Sprite', 'SpritePower',
    ]),
    effects: new Set(['ActiveEffect', 'StatusEffects']),
    applications: new Set([
        'ChangelogApplication', 'CompendiaSettings', 'CompendiumBrowser', 'Compendiums', 'DeleteConfirmationApplication',
        'EnvModifiersApplication', 'GMRequest', 'Import', 'KarmaManager', 'MIGRATION', 'Migrator',
        'NuyenManager', 'OverwatchScoreTracker', 'SituationalModifiersApplication', 'TimeControl', 'Tours',
    ]),
    messages: new Set(['Dialogs', 'Errors', 'Messages', 'MissingRessource', 'Notifications', 'Warnings']),
    ui: new Set(['Content', 'ContextOptions', 'FOUNDRY', 'Keybinding', 'Labels', 'Tabs', 'Tooltips']),
};

function cloneCanonical(base, target) {
    if (base === null || typeof base !== 'object' || Array.isArray(base)) return target ?? base;
    const result = {};
    for (const [key, baseValue] of Object.entries(base)) {
        const targetValue = target && Object.hasOwn(target, key) ? target[key] : undefined;
        result[key] = cloneCanonical(baseValue, targetValue);
    }
    return result;
}

function moduleFor(namespace, value) {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) return 'common';
    for (const [moduleName, namespaces] of Object.entries(ownership)) {
        if (namespaces.has(namespace)) return moduleName;
    }
    return 'common';
}

const base = JSON.parse(fs.readFileSync(path.join(legacyDir, 'en', 'config.json'), 'utf8'));
for (const locale of localization.LOCALES) {
    const legacy = JSON.parse(fs.readFileSync(path.join(legacyDir, locale, 'config.json'), 'utf8'));
    const canonical = locale === 'en' ? base : cloneCanonical(base, legacy);
    const fragments = Object.fromEntries(localization.MODULES.map((moduleName) => [moduleName, moduleName === 'system' ? {} : { SR5: {} }]));
    for (const root of ['CONTROLS', 'SETTINGS', 'TYPES']) fragments.system[root] = canonical[root];
    for (const [namespace, value] of Object.entries(canonical.SR5)) {
        fragments[moduleFor(namespace, value)].SR5[namespace] = value;
    }
    const localeDir = path.join(localization.SOURCE_LOCALE_DIR, locale);
    fs.mkdirSync(localeDir, { recursive: true });
    for (const moduleName of localization.MODULES) {
        fs.writeFileSync(
            path.join(localeDir, `${moduleName}.json`),
            `${JSON.stringify(fragments[moduleName], null, 4)}\n`,
            'utf8',
        );
    }
}
