/**
 * Parts of this script have been taken from https://github.com/foundryvtt/foundryvtt-cli utils/packs.mjs
 * and modified to fit the needs of this project.
 *
 * This script is used to handle Foundry VTT compendium packs.
 * It's designed to be run as an npm script and contains these commands:
 *
 * # Extract all compendium packs into JSON files
 * $ node ./utils/packs.mjs package unpack
 * 
 * # Pack all compendium packs into nedb files
 * $ node ./utils/packs.mjs package pack
 * # OR
 * $ npm run build:db
 * 
 * Both pack and unpack allow targeting specific packs by name, check command help for that.
 */
import fs from 'fs';
import path from 'path';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { compilePack, extractPack } from '@foundryvtt/foundryvtt-cli';

/**
 * Folder where the compiled compendium packs should be located relative to the
 * base 5e system folder.
 * @type {string}
 */
const PACK_DEST = 'packs';

/**
 * Folder where source JSON files should be located relative to the 5e system folder.
 * @type {string}
 */
const PACK_SRC = 'packs/_source';

// -------------------------------------------------------------------------
//  EXECUTION
// -------------------------------------------------------------------------

(async () => {
    try {
        await yargs(hideBin(process.argv))
            .command(packageCommand())
            .help()
            .alias('help', 'h')
            .parse();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();

// -------------------------------------------------------------------------
//  COMMAND CONFIGURATION
// -------------------------------------------------------------------------

/**
 * Script entry point for the package command.
 */
function packageCommand() {
    return {
        command: 'package [action] [pack] [entry]',
        describe: 'Manage packages',
        builder: (yargs) => {
            yargs.positional('action', {
                describe: 'The action to perform.',
                type: 'string',
                choices: ['unpack', 'pack', 'clean'],
            });
            yargs.positional('pack', {
                describe: 'Name of the pack upon which to work.',
                type: 'string',
            });
            yargs.positional('entry', {
                describe: 'Name of any entry within a pack upon which to work. Only applicable to extract & clean commands.',
                type: 'string',
            });
        },
        handler: async (argv) => {
            const { action, pack, entry } = argv;
            switch (action) {
                case 'clean':
                    return cleanPacks(pack, entry);
                case 'pack':
                    return compilePacks(pack);
                case 'unpack':
                    return extractPacks(pack, entry);
            }
        },
    };
}


// -------------------------------------------------------------------------
//  FUNCTIONS
// -------------------------------------------------------------------------

/**
 * Compile the source JSON files into compendium packs.
 * @param {string} [packName]  Name of a specific pack to compile. If omitted, all packs are compiled.
 * 
 * Usage:
 * - `npm run build:db` - Compile all JSON files into their LevelDB files.
 * - `npm run build:db -- classes` - Only compile the specified pack.
 */
async function compilePacks(packName) {
    // Determine which source folders to process
    const folders = fs
        .readdirSync(PACK_SRC, { withFileTypes: true })
        .filter((file) => file.isDirectory() && (!packName || packName === file.name));

    for (const folder of folders) {
        const src = path.join(PACK_SRC, folder.name);
        const dest = path.join(PACK_DEST, folder.name);
        console.log(`Compiling pack ${folder.name}`);

        await compilePack(src, dest, { 
            log: true,
            recursive: true,
            transformEntry: cleanPackEntry,
        });
    }
}

/**
 * Extract the contents of compendium packs to JSON files.
 * @param {string} [packName]       Name of pack to extract. If none provided, all packs will be unpacked.
 * @param {string} [entryName]      Name of a specific entry to extract.
 *
 * Usage:
 * - `npm build:json - Extract all compendium LevelDB files into JSON files.
 * - `npm build:json -- classes` - Only extract the contents of the specified compendium.
 * - `npm build:json -- classes Barbarian` - Only extract a single item from the specified compendium.
 */
async function extractPacks(packName, entryName) {
    entryName = entryName?.toLowerCase();

    // Load system.json.
    const system = JSON.parse(fs.readFileSync('./system.json', { encoding: 'utf8' }));

    // Determine which source packs to process.
    const packs = system.packs.filter((p) => !packName || p.name === packName);

    for (const packInfo of packs) {
        const dest = path.join(PACK_SRC, packInfo.name);
        console.log(`Extracting pack ${packInfo.name}`);

        const folders = {};
        const containers = {};

        // 1. Extract Folders and Containers first to build paths
        await extractPack(packInfo.path, dest, {
            log: false,
            transformEntry: (e) => {
                if (e._key.startsWith('!folders')) {
                    folders[e._id] = { name: slugify(e.name), folder: e.folder };
                } else if (e.type === 'container') {
                    containers[e._id] = {
                        name: slugify(e.name),
                        container: e.system?.container,
                        folder: e.folder,
                    };
                }
                return false;
            },
        });

        const buildPath = (collection, entry, parentKey) => {
            let parent = collection[entry[parentKey]];
            entry.path = entry.name;
            while (parent) {
                entry.path = path.join(parent.name, entry.path);
                parent = collection[parent[parentKey]];
            }
        };

        Object.values(folders).forEach((f) => buildPath(folders, f, 'folder'));
        Object.values(containers).forEach((c) => {
            buildPath(containers, c, 'container');
            const folder = folders[c.folder];
            if (folder) c.path = path.join(folder.path, c.path);
        });

        // 2. Extract actual content
        await extractPack(packInfo.path, dest, {
            log: true,
            transformEntry: (entry) => {
                if (entryName && entryName !== entry.name.toLowerCase()) return false;
                cleanPackEntry(entry);
                return true;
            },
            transformName: (entry) => {
                if (entry._id in folders) return path.join(folders[entry._id].path, '_folder.json');
                if (entry._id in containers) return path.join(containers[entry._id].path, '_container.json');
                
                const outputName = slugify(entry.name);
                const parent = containers[entry.system?.container] ?? folders[entry.folder];
                
                return path.join(parent?.path ?? '', `${outputName}.json`);
            },
        });
    }
}

/**
 * Clean existing source JSON files in place.
 * @param {string} [packName]       Name of the pack to clean. If omitted, all packs will be cleaned.
 * @param {string} [entryName]      Name of a specific entry to clean (only applicable when cleaning a single pack).
 *
 * Usage:
 * - `node ./utils/packs.mjs package clean` - Clean all source JSON files.
 * - `node ./utils/packs.mjs package clean classes` - Only clean the specified pack.
 * - `node ./utils/packs.mjs package clean classes Barbarian` - Only clean a single entry within the specified pack.
 */
async function cleanPacks(packName, entryName) {
    entryName = entryName?.toLowerCase();

    // Determine which source folders to process based on physical folders in PACK_SRC
    const folders = fs
        .readdirSync(PACK_SRC, { withFileTypes: true })
        .filter((file) => file.isDirectory() && (!packName || packName === file.name));

    for (const folder of folders) {
        console.log(`Cleaning pack ${folder.name}`);
        const packDir = path.join(PACK_SRC, folder.name);

        // Recursive function to walk through subfolders
        const walkAndClean = (dir) => {
            const files = fs.readdirSync(dir, { withFileTypes: true });

            for (const file of files) {
                const fullPath = path.join(dir, file.name);

                if (file.isDirectory()) {
                    walkAndClean(fullPath);
                } else if (file.isFile() && file.name.endsWith('.json')) {
                    // Read file
                    const content = fs.readFileSync(fullPath, 'utf8');
                    let json;
                    try {
                        json = JSON.parse(content);
                    } catch (err) {
                        console.error(`Error parsing JSON in ${file.name}:`, err);
                        continue;
                    }

                    // Filter by Entry Name if provided
                    if (entryName && json.name?.toLowerCase() !== entryName) continue;

                    // Apply cleaning logic
                    cleanPackEntry(json);

                    // Write back to disk
                    const output = JSON.stringify(json, null, 2) + '\n';
                    fs.writeFileSync(fullPath, output);
                }
            }
        };

        walkAndClean(packDir);
    }
}

/**
 * Removes invisible whitespace characters and normalizes single- and double-quotes.
 * @param {string} str  The string to be cleaned.
 * @returns {string}    The cleaned string.
 */
function cleanString(str) {
    return str
        .replace(/\u2060/gu, '')
        .replace(/[‘’]/gu, "'")
        .replace(/[“”]/gu, '"');
}

/**
 * Standardize name format.
 * @param {string} name
 * @returns {string}
 */
function slugify(name) {
    return name
        .normalize('NFD')                // split accents from letters
        .replace(/[\u0300-\u036f]/g, '') // remove diacritics
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')     // replace all non-alphanumerics with -
        .replace(/^-+|-+$/g, '');        // trim hyphens
}

/**
 * Removes unwanted flags, permissions, and other data from entries before extracting or compiling.
 * @param {object} data                           Data for a single entry to clean.
 * @param {object} [options={}]
 * @param {boolean} [options.clearSourceId=true]  Should the core sourceId flag be deleted.
 * @param {number} [options.ownership=0]          Value to reset default ownership to.
 */
function cleanPackEntry(data, { clearSourceId = true, ownership = 0 } = {}) {
    if (data.ownership) data.ownership = { default: ownership };
    if (clearSourceId) delete data.flags?.core?.sourceId;
    if (data._stats?.lastModifiedBy) data._stats.lastModifiedBy = 'sr5ebuilder';

    // Remove empty entries in flags
    if (!data.flags) data.flags = {};
    Object.entries(data.flags).forEach(([key, contents]) => {
        if (Object.keys(contents).length === 0) delete data.flags[key];
    });

    // Remove mystery-man.svg from Actors
    if (['character'].includes(data.type) && data.img === 'icons/svg/mystery-man.svg') {
        data.img = '';
        if (data.prototypeToken?.texture) data.prototypeToken.texture.src = '';
    }

    if (data.effects) data.effects.forEach((i) => cleanPackEntry(i, { clearSourceId: false }));
    if (data.items) data.items.forEach((i) => cleanPackEntry(i, { clearSourceId: false }));
    if (data.pages) data.pages.forEach((i) => cleanPackEntry(i, { ownership: -1 }));
    if (data.system?.description?.value) data.system.description.value = cleanString(data.system.description.value);
    if (data.label) data.label = cleanString(data.label);
    if (data.name) data.name = cleanString(data.name);

    return data;
}
