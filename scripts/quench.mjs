import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import { chromium } from 'playwright';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const log = (...args) => console.info('[quench]', ...args);

async function loadEnvLocal() {
    const file = path.join(repoRoot, '.env.local');
    if (!(await fs.pathExists(file))) return;

    const content = await fs.readFile(file, 'utf8');
    for (const raw of content.split('\n')) {
        const line = raw.trim();
        if (!line || line.startsWith('#')) continue;

        const separator = line.indexOf('=');
        if (separator === -1) continue;

        const key = line.slice(0, separator).trim();
        let value = line.slice(separator + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        if (!(key in process.env)) process.env[key] = value;
    }
}

function getArg(name) {
    const inline = process.argv.find((arg) => arg.startsWith(`--${name}=`));
    if (inline) {
        const value = inline.slice(name.length + 3);
        if (!value) throw new Error(`--${name} requires a value`);
        return value;
    }

    const index = process.argv.indexOf(`--${name}`);
    if (index === -1) return undefined;

    const value = process.argv[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`--${name} requires a value`);
    return value;
}

async function waitForGameReady(page, timeout = 120000) {
    await page.waitForFunction(() => globalThis.game?.ready === true, null, { timeout });
}

async function joinWorld(page) {
    try {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
    } catch (error) {
        if (String(error).includes('ERR_CONNECTION_REFUSED')) {
            throw new Error('Could not connect to Foundry. Start it and launch the development world first.');
        }
        throw error;
    }
    const pathname = new URL(page.url()).pathname;

    if (pathname.endsWith('/game')) {
        await waitForGameReady(page);
        return;
    }

    if (!pathname.endsWith('/join')) {
        throw new Error(
            `Foundry redirected to "${pathname}". Launch the development world before running npm run quench.`,
        );
    }

    const select = page.locator('[name=userid]');
    await select.waitFor({ timeout: 30000 });
    try {
        await select.selectOption({ label: 'Gamemaster' });
    } catch {
        const options = await select.locator('option').evaluateAll((elements) =>
            elements.map((option) => ({
                value: option.value,
                text: (option.textContent ?? '').trim(),
            })),
        );
        const gamemaster = options.find((option) => /game ?master/i.test(option.text));
        if (!gamemaster) throw new Error('No Gamemaster user is available in the launched world.');
        await select.selectOption(gamemaster.value);
    }

    await Promise.all([page.waitForURL('**/game', { timeout: 60000 }), page.click('[name=join]')]);
    await waitForGameReady(page);
}

async function quenchReady(page, timeout) {
    return page
        .waitForFunction(() => typeof globalThis.quench !== 'undefined', null, { timeout })
        .then(() => true)
        .catch(() => false);
}

async function ensureQuenchActive(page) {
    if (await quenchReady(page, 8000)) return;

    const installed = await page.evaluate(() => game.modules.has('quench'));
    if (!installed) {
        throw new Error('The Quench module is not installed in this Foundry data directory.');
    }

    log('enabling Quench in the launched world');
    await page.evaluate(async () => {
        const modules = { ...(game.settings.get('core', 'moduleConfiguration') ?? {}) };
        modules.quench = true;
        await game.settings.set('core', 'moduleConfiguration', modules);
    });

    // Foundry reloads the world after its module configuration changes, so the
    // browser must join again before checking for the global Quench API.
    await joinWorld(page);
    if (!(await quenchReady(page, 60000))) {
        throw new Error('Quench is still unavailable after enabling the module and reloading the world.');
    }
}

async function runQuench(page, pattern, runTimeoutMs) {
    return page.evaluate(
        async ({ pattern, runTimeoutMs }) => {
            const quench = globalThis.quench;
            if (!quench) throw new Error('The global Quench API is unavailable.');

            // Quench's run handlers access the results application's DOM. If it
            // has not been rendered, runBatches can throw and leave Mocha stuck.
            await quench.app.render({ force: true });

            const runner = await quench.runBatches(pattern);
            const failures = [];
            const seen = new Set();
            const addFailure = (test, error) => {
                const title = test?.fullTitle?.() ?? test?.title ?? 'Unknown failed test';
                const message = error?.message ?? String(error ?? 'unknown error');
                const key = `${title}\n${message}`;
                if (seen.has(key)) return;
                seen.add(key);
                failures.push({ title, error: message });
            };
            // Capture Mocha fail events because failed hooks are not represented
            // by normal test entries in the suite tree.
            runner.on('fail', addFailure);

            // Quench returns the runner before Mocha finishes. Register the end
            // listener before checking stats to avoid missing a fast completion.
            await new Promise((resolve, reject) => {
                const timer = setTimeout(
                    () => reject(new Error(`Quench did not finish within ${runTimeoutMs}ms`)),
                    runTimeoutMs,
                );
                const finish = () => {
                    clearTimeout(timer);
                    resolve();
                };
                runner.once('end', finish);
                if (runner.stats?.end) finish();
            });

            const walk = (suite) => {
                for (const test of suite.tests ?? []) {
                    if (test.state === 'failed') addFailure(test, test.err);
                }
                for (const child of suite.suites ?? []) walk(child);
            };
            // runBatches starts immediately, so fast test failures can occur
            // before the fail listener is attached. Recover them from the suite.
            if (runner.suite) walk(runner.suite);

            const stats = runner.stats ?? {};
            if (!stats.tests) throw new Error(`No Quench tests matched "${pattern}".`);

            const failureCount = stats.failures ?? failures.length;
            while (failures.length < failureCount) {
                failures.push({
                    title: `Uncaptured Mocha failure ${failures.length + 1}`,
                    error: 'Mocha reported a failure without exposing its failed test object.',
                });
            }

            return {
                pattern,
                stats: {
                    tests: stats.tests ?? 0,
                    passes: stats.passes ?? 0,
                    failures: failureCount,
                    pending: stats.pending ?? 0,
                    duration: stats.duration ?? 0,
                },
                failures,
            };
        },
        { pattern, runTimeoutMs },
    );
}

async function main() {
    await loadEnvLocal();

    const url = process.env.FOUNDRY_URL || 'http://localhost:30000';
    const pattern = getArg('pattern') || process.env.QUENCH_PATTERN || 'shadowrun5e.**';
    // This is a watchdog for the complete suite. Individual test timeouts remain
    // controlled by the test definitions registered with Quench.
    const configuredTimeout = Number(process.env.QUENCH_RUN_TIMEOUT);
    const runTimeoutMs =
        Number.isFinite(configuredTimeout) && configuredTimeout > 0 ? configuredTimeout : 10 * 60 * 1000;
    const headless = !process.argv.includes('--headed');
    // Keep GPU rendering enabled in headless Chromium because Foundry and PIXI
    // canvas behavior differs when Chromium falls back to software rendering.
    const args = ['--enable-gpu', '--ignore-gpu-blocklist'];
    const viewport = headless ? { width: 1024, height: 768 } : null;
    if (!headless) args.push('--start-maximized');

    const browser = await chromium.launch({ headless, args });
    try {
        const context = await browser.newContext({ baseURL: url, viewport });
        const page = await context.newPage();
        page.on('console', (message) => {
            if (process.env.QUENCH_PAGE_LOGS === '1' || message.type() === 'error') {
                console.log(`[page:${message.type()}]`, message.text());
            }
        });
        page.on('pageerror', (error) => console.error('[page:error]', error.message));

        log(`connecting to ${url}`);
        await joinWorld(page);
        await ensureQuenchActive(page);

        log(`running "${pattern}"`);
        const result = await runQuench(page, pattern, runTimeoutMs);
        const { stats, failures } = result;
        console.info(
            `\nQuench: ${stats.passes}/${stats.tests} passed, ${stats.failures} failed, ` +
                `${stats.pending} pending (${stats.duration}ms)`,
        );
        for (const failure of failures) console.error(`  x ${failure.title}\n      ${failure.error}`);

        process.exitCode = stats.failures > 0 ? 1 : 0;
    } finally {
        await browser.close();
    }
}

main().catch((error) => {
    console.error('[quench] failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
