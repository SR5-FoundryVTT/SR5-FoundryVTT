/**
 * CI entry point: drive the running Foundry, run Quench, write results to
 * `.tmp/quench-results/`, and exit non-zero on any failure.
 *
 * The world is launched by felddy (FOUNDRY_WORLD); this script just joins it.
 *
 * Env:
 *   FOUNDRY_URL          base URL (default http://localhost:30000)
 *   QUENCH_PATTERN       batch glob (default shadowrun5e.**)
 *   QUENCH_RUN_TIMEOUT   overall cap for the whole run in ms (default 600000 = 10 min)
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import { driveQuench } from './lib/drive-foundry.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resultsDir = path.resolve(__dirname, '..', '..', '.tmp', 'quench-results');

function formatText(summary) {
    const { stats, failures } = summary;
    const lines = [
        `Quench results (${summary.pattern})`,
        `  tests:    ${stats.tests}`,
        `  passes:   ${stats.passes}`,
        `  failures: ${stats.failures}`,
        `  pending:  ${stats.pending}`,
        `  duration: ${stats.duration}ms`,
        '',
    ];
    if (failures.length) {
        lines.push('Failures:');
        for (const f of failures) lines.push(`  x ${f.title}\n      ${f.error}`);
    } else {
        lines.push('All batches passed.');
    }
    return lines.join('\n');
}

async function main() {
    const summary = await driveQuench({
        url: process.env.FOUNDRY_URL || 'http://localhost:30000',
        pattern: process.env.QUENCH_PATTERN || 'shadowrun5e.**',
        runTimeoutMs: Number(process.env.QUENCH_RUN_TIMEOUT) || 10 * 60 * 1000,
        headless: true,
    });

    await fs.ensureDir(resultsDir);
    await fs.writeJson(path.join(resultsDir, 'results.json'), summary, { spaces: 2 });
    const text = formatText(summary);
    await fs.writeFile(path.join(resultsDir, 'results.txt'), `${text}\n`);
    console.info(`\n${text}\n`);

    if (summary.stats.failures > 0) {
        console.error(`[run-quench] ${summary.stats.failures} failing test(s).`);
        process.exit(1);
    }
    console.info('[run-quench] all green.');
}

main().catch((err) => {
    console.error('[run-quench] failed:', err);
    process.exit(1);
});
