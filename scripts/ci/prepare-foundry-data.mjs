/**
 * Assemble the Foundry user-data tree the Quench workflow mounts into the felddy
 * container at `/data`. Produces:
 *
 *   .tmp/foundry/Data/systems/shadowrun5e/   <- the dev build of this system
 *   .tmp/foundry/Data/modules/quench/        <- the Quench module (downloaded)
 *   .tmp/foundry/Data/worlds/sr5-quench/     <- throwaway world fixture
 *
 * Run AFTER `npm run build:dev` so `dist/` and the LevelDB `packs/` exist.
 *
 * Env overrides:
 *   QUENCH_MODULE_MANIFEST  module.json URL to resolve the module zip from
 *                           (default: pinned Ethaks/FVTT-Quench v0.10.0)
 *   QUENCH_MODULE_URL       direct module zip URL (skips manifest resolution)
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import JSZip from 'jszip';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');

const dataDir = path.join(repoRoot, '.tmp', 'foundry', 'Data');
const systemDir = path.join(dataDir, 'systems', 'shadowrun5e');
const moduleDir = path.join(dataDir, 'modules', 'quench');
const worldDir = path.join(dataDir, 'worlds', 'sr5-quench');

const DEFAULT_MANIFEST = 'https://github.com/Ethaks/FVTT-Quench/releases/download/v0.10.0/module.json';

async function fetchJson(url) {
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) throw new Error(`GET ${url} -> ${res.status} ${res.statusText}`);
    return res.json();
}

async function fetchBuffer(url) {
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) throw new Error(`GET ${url} -> ${res.status} ${res.statusText}`);
    return Buffer.from(await res.arrayBuffer());
}

async function copySystem() {
    await fs.emptyDir(systemDir);

    const dist = path.join(repoRoot, 'dist');
    if (!(await fs.pathExists(path.join(dist, 'bundle.js')))) {
        throw new Error('dist/bundle.js missing - run `npm run build:dev` before this script.');
    }

    await fs.copy(dist, path.join(systemDir, 'dist'));
    await fs.copy(path.join(repoRoot, 'packs'), path.join(systemDir, 'packs'), {
        // packs/_source is source JSON, not a built Foundry pack.
        filter: (src) => !src.includes(`${path.sep}_source`),
    });

    const manifest = await fs.readJson(path.join(repoRoot, 'system.json'));
    for (const key of ['url', 'manifest', 'download']) {
        if (typeof manifest[key] === 'string' && manifest[key].includes('#{')) manifest[key] = '';
    }
    await fs.writeJson(path.join(systemDir, 'system.json'), manifest, { spaces: 4 });

    console.info(`[prepare] system -> ${systemDir}`);
}

function stripCommonPrefix(entryNames) {
    const tops = new Set(entryNames.map((n) => n.split('/')[0]));
    if (tops.size !== 1) return '';
    const [top] = tops;
    return entryNames.every((n) => n.startsWith(`${top}/`)) ? `${top}/` : '';
}

async function installQuench() {
    let zipUrl = process.env.QUENCH_MODULE_URL;
    if (!zipUrl) {
        const manifestUrl = process.env.QUENCH_MODULE_MANIFEST || DEFAULT_MANIFEST;
        console.info(`[prepare] resolving Quench module from ${manifestUrl}`);
        const manifest = await fetchJson(manifestUrl);
        zipUrl = manifest.download;
        if (!zipUrl) throw new Error(`Quench module.json has no "download" field: ${manifestUrl}`);
    }

    console.info(`[prepare] downloading Quench module ${zipUrl}`);
    const zip = await JSZip.loadAsync(await fetchBuffer(zipUrl));
    const entries = Object.values(zip.files).filter((f) => !f.dir);
    const prefix = stripCommonPrefix(entries.map((f) => f.name));

    await fs.emptyDir(moduleDir);
    for (const entry of entries) {
        const rel = prefix && entry.name.startsWith(prefix) ? entry.name.slice(prefix.length) : entry.name;
        if (!rel) continue;
        const dest = path.join(moduleDir, rel);
        await fs.ensureDir(path.dirname(dest));
        await fs.writeFile(dest, await entry.async('nodebuffer'));
    }

    if (!(await fs.pathExists(path.join(moduleDir, 'module.json')))) {
        throw new Error('Quench module.json not found after extraction - check the module zip layout.');
    }
    console.info(`[prepare] quench -> ${moduleDir}`);
}

async function copyWorld() {
    await fs.emptyDir(worldDir);
    await fs.copy(path.join(repoRoot, 'tests', 'ci', 'world'), worldDir);
    console.info(`[prepare] world -> ${worldDir}`);
}

async function main() {
    await fs.ensureDir(dataDir);
    await copySystem();
    await installQuench();
    await copyWorld();
    console.info('[prepare] Foundry data tree ready.');
}

main().catch((err) => {
    console.error('[prepare] failed:', err);
    process.exit(1);
});
