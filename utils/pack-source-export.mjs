import { isDeepStrictEqual } from 'node:util';
import { cleanPackEntry } from './packs.mjs';

// Storage hierarchy used by foundryvtt-cli's compilePack/extractPack. Flag data
// (including SR5 embeddedItems) is inline JSON, not a separate LevelDB record.
const hierarchy = {
    actors: ['items', 'effects'], cards: ['cards'], combats: ['combatants', 'groups'],
    delta: ['items', 'effects'], items: ['effects'], journal: ['pages', 'categories'],
    playlists: ['sounds'], regions: ['behaviors'], tables: ['results'], tokens: ['delta'],
    scenes: ['drawings', 'tokens', 'levels', 'lights', 'notes', 'regions', 'sounds', 'templates', 'tiles', 'walls'],
};

function restoreKeys(data, previous, key, seen = new Set()) {
    if (!data._id || seen.has(key)) throw new Error(`Missing or duplicate embedded ID: ${key}`);
    if (previous?._key !== undefined && previous._key !== key)
        throw new Error(`Source key does not match document hierarchy: ${previous._key}`);
    seen.add(key);
    data._key = previous?._key ?? key;
    const [, collection, id] = key.split('!');
    for (const childCollection of hierarchy[collection.split('.').at(-1)] ?? []) {
        const children = data[childCollection];
        const oldChildren = previous?.[childCollection];
        const old = Array.isArray(oldChildren) ? oldChildren : oldChildren ? [oldChildren] : [];
        if (new Set(old.map(child => child._id)).size !== old.length)
            throw new Error(`Duplicate source embedded ID in ${key}.${childCollection}`);
        for (const child of Array.isArray(children) ? children : children ? [children] : []) {
            restoreKeys(child, old.find(entry => entry._id === child._id),
                `!${collection}.${childCollection}!${id}.${child._id}`, seen);
        }
    }
}

/** Retain existing object property order; append new properties in a stable order. */
function orderLike(data, previous) {
    if (Array.isArray(data)) return data.map((entry, index) => orderLike(entry,
        entry?._id ? previous?.find?.(old => old?._id === entry._id) : previous?.[index]));
    if (!data || typeof data !== 'object') return data;
    const keys = [...Object.keys(previous ?? {}).filter(key => Object.hasOwn(data, key)),
        ...Object.keys(data).filter(key => !Object.hasOwn(previous ?? {}, key)).sort()];
    return Object.fromEntries(keys.map(key => [key, orderLike(data[key], previous?.[key])]));
}

/** Remove machine/session-specific metadata while retaining migration versions. */
export function normalizeExport(data) {
    cleanPackEntry(data);
    function visit(value) {
        if (!value || typeof value !== 'object') return;
        if (value._stats) {
            for (const key of ['createdTime', 'modifiedTime', 'lastModifiedBy', 'compendiumSource', 'duplicateSource', 'exportSource']) {
                if (key in value._stats) value._stats[key] = null;
            }
        }
        for (const child of Object.values(value)) visit(child);
    }
    visit(data);
    return data;
}

/** Match by ID, never by name. Complete this for every pack before writing anything. */
export function matchExports(sources, exports) {
    const live = new Map();
    for (const { data } of exports) {
        if (!data?._id || live.has(data._id)) throw new Error(`Missing or duplicate live ID: ${data?._id}`);
        live.set(data._id, data);
    }
    const seen = new Set();
    const changes = [];
    for (const source of sources) {
        if (source.data._key?.startsWith('!folders!')) continue;
        const id = source.data._id;
        if (!id || seen.has(id)) throw new Error(`Missing or duplicate source ID: ${id}`);
        seen.add(id);
        const entry = live.get(id);
        if (!entry) throw new Error(`${source.file}: live document ${id} is missing`);
        // Playwright preserves undefined properties; JSON files cannot. Compare the serialized shape.
        const data = JSON.parse(JSON.stringify(normalizeExport(structuredClone(entry))));
        if (!/^![^!]+![^!]+$/.test(source.data._key ?? '')) throw new Error(`${source.file}: missing or invalid source _key`);
        restoreKeys(data, source.data, source.data._key);
        if (!isDeepStrictEqual(source.data, data)) {
            changes.push({ ...source, output: JSON.stringify(orderLike(data, source.data), null, 2) + '\n' });
        }
    }
    return { changes, extraIds: [...live.keys()].filter(id => !seen.has(id)) };
}
