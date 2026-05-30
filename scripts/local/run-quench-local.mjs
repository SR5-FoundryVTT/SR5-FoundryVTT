/**
 * Local Quench runner. Reuses the same driver as CI but loads connection details
 * from `.env.local` and supports headed mode for debugging.
 *
 * Prerequisites:
 *   - Foundry installed/licensed locally with the shadowrun5e dev build linked
 *     (`npm run build:dev`) and a world using this system + the Quench module.
 *   - That world must be launched. The runner joins it and enables Quench if needed.
 *   - `.env.local` (gitignored) with at least:
 *       FOUNDRY_URL=http://localhost:30000
 *
 * Usage:
 *   node scripts/local/run-quench-local.mjs            # headless
 *   node scripts/local/run-quench-local.mjs --headed   # watch the browser
 *   node scripts/local/run-quench-local.mjs --pattern shadowrun5e.rules.**
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import { driveQuench } from '../ci/lib/drive-foundry.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');

/** Minimal .env loader (avoids adding a dotenv dependency). */
async function loadEnvLocal() {
    const file = path.join(repoRoot, '.env.local');
    if (!(await fs.pathExists(file))) return;
    const content = await fs.readFile(file, 'utf8');
    for (const raw of content.split('\n')) {
        const line = raw.trim();
        if (!line || line.startsWith('#')) continue;
        const eq = line.indexOf('=');
        if (eq === -1) continue;
        const key = line.slice(0, eq).trim();
        let value = line.slice(eq + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        if (!(key in process.env)) process.env[key] = value;
    }
}

function getArg(name) {
    const idx = process.argv.indexOf(`--${name}`);
    return idx !== -1 ? process.argv[idx + 1] : undefined;
}

async function main() {
    await loadEnvLocal();

    const summary = await driveQuench({
        url: process.env.FOUNDRY_URL || 'http://localhost:30000',
        pattern: getArg('pattern') || process.env.QUENCH_PATTERN || 'shadowrun5e.**',
        headless: !process.argv.includes('--headed'),
    });

    const { stats, failures } = summary;
    console.info(
        `\nQuench: ${stats.passes}/${stats.tests} passed, ${stats.failures} failed, ${stats.pending} pending (${stats.duration}ms)`,
    );
    for (const f of failures) console.error(`  x ${f.title}\n      ${f.error}`);

    process.exit(stats.failures > 0 ? 1 : 0);
}

main().catch((err) => {
    console.error('[run-quench-local] failed:', err);
    process.exit(1);
});
