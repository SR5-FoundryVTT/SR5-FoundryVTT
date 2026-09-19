import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { compilePack } from '@foundryvtt/foundryvtt-cli';

const SOURCE_ROOT = path.resolve('packs/_source');
const ID_PATTERN = /^[A-Za-z0-9]{16}$/u;

async function listDirectories(directory) {
    return (await fs.readdir(directory, { withFileTypes: true }))
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort();
}

async function listJsonFiles(directory) {
    const files = [];
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) files.push(...(await listJsonFiles(entryPath)));
        else if (entry.isFile() && entry.name.endsWith('.json')) files.push(entryPath);
    }
    return files;
}

function inspectServerManagedIds(value, location, errors) {
    if (!value || typeof value !== 'object') return;

    if ('lastModifiedBy' in value && value.lastModifiedBy !== null && !ID_PATTERN.test(value.lastModifiedBy)) {
        errors.push(`${location}: invalid lastModifiedBy value ${JSON.stringify(value.lastModifiedBy)}`);
    }

    for (const [key, child] of Object.entries(value)) {
        inspectServerManagedIds(child, `${location}.${key}`, errors);
    }
}

async function validateSourcePack(packName, errors) {
    const packRoot = path.join(SOURCE_ROOT, packName);
    const files = await listJsonFiles(packRoot);
    const rootIds = new Map();

    if (files.length === 0) errors.push(`${packName}: source directory contains no JSON documents`);

    for (const file of files) {
        const relativeFile = path.relative(process.cwd(), file);
        let document;
        try {
            document = JSON.parse(await fs.readFile(file, 'utf8'));
        } catch (error) {
            errors.push(`${relativeFile}: invalid JSON (${error.message})`);
            continue;
        }

        if (!document || typeof document !== 'object' || Array.isArray(document)) {
            errors.push(`${relativeFile}: expected a JSON object`);
            continue;
        }
        if (!ID_PATTERN.test(document._id ?? '')) errors.push(`${relativeFile}: invalid or missing 16-character _id`);
        else if (rootIds.has(document._id)) {
            errors.push(`${relativeFile}: duplicate root _id also used by ${rootIds.get(document._id)}`);
        } else rootIds.set(document._id, relativeFile);

        inspectServerManagedIds(document._stats, `${relativeFile}._stats`, errors);
    }
}

async function main() {
    const manifest = JSON.parse(await fs.readFile('system.json', 'utf8'));
    const declaredPacks = manifest.packs.map((pack) => pack.name).sort();
    const sourcePacks = await listDirectories(SOURCE_ROOT);
    const errors = [];

    const duplicateNames = declaredPacks.filter((name, index) => name === declaredPacks[index - 1]);
    if (duplicateNames.length) errors.push(`duplicate manifest pack names: ${duplicateNames.join(', ')}`);

    for (const name of declaredPacks.filter((name) => !sourcePacks.includes(name))) {
        errors.push(`${name}: manifest pack has no source directory`);
    }
    for (const name of sourcePacks.filter((name) => !declaredPacks.includes(name))) {
        errors.push(`${name}: source directory is not declared in system.json`);
    }

    for (const packName of sourcePacks) await validateSourcePack(packName, errors);

    if (errors.length) throw new Error(`Compendium source validation failed:\n- ${errors.join('\n- ')}`);

    const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'sr5-packs-'));
    try {
        for (const packName of sourcePacks) {
            console.log(`Validating compiled pack ${packName}`);
            await compilePack(path.join(SOURCE_ROOT, packName), path.join(temporaryRoot, packName), {
                log: false,
                recursive: true,
            });
        }
    } finally {
        await fs.rm(temporaryRoot, { recursive: true, force: true });
    }

    console.log(`Validated ${sourcePacks.length} compendium source packs.`);
}

main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});
