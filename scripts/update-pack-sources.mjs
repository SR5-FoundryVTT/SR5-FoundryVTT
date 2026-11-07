import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { matchExports } from '../utils/pack-source-export.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function readSources(directory) {
    const sources = [];
    for (const entry of (await fs.readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
        const file = path.join(directory, entry.name);
        if (entry.isDirectory()) sources.push(...await readSources(file));
        else if (entry.isFile() && entry.name.endsWith('.json')) {
            const original = await fs.readFile(file, 'utf8');
            sources.push({ file, original, data: JSON.parse(original) });
        }
    }
    return sources;
}

async function main() {
    try { process.loadEnvFile(path.join(root, '.env.local')); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    const args = process.argv.slice(2);
    if (args.some(arg => arg.startsWith('-') && arg !== '--check') || args.filter(arg => !arg.startsWith('-')).length > 1)
        throw new Error('Usage: npm run update:pack-sources -- [pack-name] [--check]');
    const check = args.includes('--check') || process.env.npm_config_check === 'true';
    const name = args.find(arg => !arg.startsWith('-'));
    const manifest = JSON.parse(await fs.readFile(path.join(root, 'system.json'), 'utf8'));
    const packs = manifest.packs.filter(pack => !name || pack.name === name);
    if (!packs.length) throw new Error(`No manifest packs match ${name ?? 'selection'}`);
    const migrator = await fs.readFile(path.join(root, 'src/module/migrator/Migrator.ts'), 'utf8');
    const migrationTargets = await Promise.all([...migrator.matchAll(/new (Version\d+_\d+_\d+)\(\)/g)].map(async match => {
        const source = await fs.readFile(path.join(root, 'src/module/migrator/versions', `${match[1]}.ts`), 'utf8');
        const version = source.match(/TargetVersion\s*=\s*['"]([^'"]+)['"]/u)?.[1];
        if (!version) throw new Error(`Cannot determine migration version: ${match[1]}`);
        return version;
    }));
    const latestMigration = migrationTargets.at(-1);
    const compareVersions = (left, right) => {
        const leftParts = left.split('.').map(Number);
        const rightParts = right.split('.').map(Number);
        for (let index = 0; index < Math.max(leftParts.length, rightParts.length); index++) {
            const difference = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
            if (difference) return Math.sign(difference);
        }
        return 0;
    };
    const migrationVersion = latestMigration && compareVersions(latestMigration, manifest.version) > 0
        ? latestMigration
        : manifest.version;
    let browser;
    try {
        try { browser = await chromium.launch({ headless: true, channel: process.env.FOUNDRY_BROWSER_CHANNEL || undefined }); }
        catch (error) {
            if (process.env.FOUNDRY_BROWSER_CHANNEL || !String(error).includes("Executable doesn't exist")) throw error;
            browser = await chromium.launch({ headless: true, channel: 'msedge' });
        }
        const page = await browser.newPage();
        const migrationErrors = [];
        const migrationReports = [];
        let exporting = false;
        page.on('console', message => {
            if (!exporting) return;
            if (message.type() === 'error' && /migration/i.test(message.text())) migrationErrors.push(message.text());
            if (message.type() === 'warning' && /Document Sanitized on Migration/.test(message.text())) console.info(message.text());
            if (message.type() === 'table') migrationReports.push(Promise.all(message.args().map(arg => arg.jsonValue()))
                .then(values => console.info(`Migration corrections: ${JSON.stringify(values)}`)));
        });
        page.setDefaultTimeout(60_000);
        await page.goto(process.env.FOUNDRY_URL || 'http://localhost:30000');
        if (!page.url().includes('/game')) {
            await page.locator('[name=username]').fill(process.env.FOUNDRY_USER || 'Gamemaster');
            if (process.env.FOUNDRY_PASSWORD) await page.locator('[name=password]').fill(process.env.FOUNDRY_PASSWORD);
            await Promise.all([page.waitForURL('**/game'), page.locator('button[name=join]').click()]);
        }
        await page.waitForFunction(() => globalThis.game?.ready);
        const runtime = await page.evaluate(() => ({
            id: game.system.id, version: game.system.version,
            migrationVersion: game.shadowrun5e?.PackSourceExportFlow?.migrationVersion,
        }));
        if (runtime.id !== manifest.id || runtime.version !== manifest.version || runtime.migrationVersion !== migrationVersion)
            throw new Error(`Runtime does not match repository system version/migrations. Reload the watched system. Runtime: ${JSON.stringify(runtime)}`);
        console.info(`Exporting from ${runtime.id} ${runtime.version}`);
        exporting = true;
        const changes = [];
        for (const pack of packs) {
            const sources = await readSources(path.join(root, 'packs/_source', pack.name));
            const exports = await page.evaluate(collection => game.shadowrun5e.PackSourceExportFlow.exportPack(collection), `${manifest.id}.${pack.name}`);
            const result = matchExports(sources, exports);
            changes.push(...result.changes);
            console.info(`${pack.name}: ${exports.length} documents, ${result.changes.length} changes`);
            for (const entry of exports) {
                if (Object.keys(entry.corrections).length) console.info(`Sanitized ${entry.data._id}: ${JSON.stringify(entry.corrections)}`);
            }
            if (result.extraIds.length) console.info(`Extra live entries (not exported): ${result.extraIds.join(', ')}`);
            // Reconstruct the final cleaned payload too, including all nested source documents.
            await page.evaluate(outputs => {
                for (const output of outputs) {
                    const { data, documentName } = JSON.parse(output);
                    const result = game.shadowrun5e.PackSourceExportFlow.prepare(data, documentName);
                    if (Object.keys(result.corrections).length) throw new Error(`${result.data._id}: cleaned export requires sanitation`);
                }
            }, result.changes.map(change => JSON.stringify({ data: JSON.parse(change.output), documentName: pack.type })));
        }
        await Promise.all(migrationReports);
        if (migrationErrors.length) throw new Error(migrationErrors.join('\n'));
        if (check) {
            for (const change of changes)
                console.info(`Would update ${path.relative(root, change.file)}`);
            console.info(`${changes.length} source files need updating.`);
            if (changes.length) process.exitCode = 1;
            return;
        }
        // Catch concurrent edits before the first write, including edits made by another developer.
        for (const change of changes) {
            if (await fs.readFile(change.file, 'utf8') !== change.original) throw new Error(`Source changed during export: ${change.file}`);
        }
        for (const change of changes) {
            console.info(`Updating ${path.relative(root, change.file)}`);
            await fs.writeFile(change.file, change.output);
        }
        console.info(`${changes.length} source files updated.`);
    } finally {
        await browser?.close();
    }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
