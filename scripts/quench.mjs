import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import fs from 'fs-extra';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROGRESS_SENTINEL = '__quench_progress__';
const log = (...args) => console.info('[quench]', ...args);

// ─── output formatting ───────────────────────────────────────────────────────

function isForceColor() {
    // "0", "false" and empty disable forced color.
    const value = process.env.FORCE_COLOR;
    if (value === undefined) return false;
    return value !== '0' && value !== 'false' && value !== '';
}
const colorsEnabled =
    !('NO_COLOR' in process.env) && (isForceColor() || process.stdout.isTTY || process.stderr.isTTY);
const colorCodes = {
    bold: ['\u001b[1m', '\u001b[22m'],
    dim: ['\u001b[2m', '\u001b[22m'],
    green: ['\u001b[32m', '\u001b[39m'],
    red: ['\u001b[31m', '\u001b[39m'],
    yellow: ['\u001b[33m', '\u001b[39m'],
};

function color(...styles) {
    const value = String(styles.pop());
    if (!colorsEnabled) return value;
    return styles.reduceRight((text, name) => {
        const [open, close] = colorCodes[name];
        return `${open}${text}${close}`;
    }, value);
}

function formatDuration(ms) {
    if (!Number.isFinite(ms)) return 'unknown';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
}

function indentText(value, spaces = 4) {
    const indentation = ' '.repeat(spaces);
    return String(value)
        .trimEnd()
        .split('\n')
        .map((line) => `${indentation}${line}`)
        .join('\n');
}

function formatValue(value) {
    if (value === undefined) return undefined;
    if (typeof value === 'string') return value;
    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value);
    }
}

function formatFailureDetails(failure) {
    const details = [];
    if (failure.file) details.push(`File: ${failure.file}`);
    if (failure.duration !== undefined) details.push(`Duration: ${formatDuration(failure.duration)}`);
    if (failure.speed) details.push(`Speed: ${failure.speed}`);
    if (failure.operator) details.push(`Operator: ${failure.operator}`);
    if (failure.error) details.push(failure.error);

    const expected = formatValue(failure.expected);
    const actual = formatValue(failure.actual);
    if (expected !== undefined) details.push(`Expected:\n${indentText(expected, 2)}`);
    if (actual !== undefined) details.push(`Actual:\n${indentText(actual, 2)}`);

    return details.join('\n');
}

function printQuenchSummary({ pattern, stats }) {
    const failed = stats.failures > 0;
    const status = color(failed ? 'red' : 'green', failed ? 'FAILED' : 'PASSED');

    console.info(`\n${color('bold', 'Quench result')}`);
    console.info(`  Status:   ${status}`);
    console.info(`  Pattern:  ${color('dim', pattern)}`);
    console.info(`  Tests:    ${stats.tests}`);
    console.info(`  Passed:   ${color('green', stats.passes)}`);
    console.info(`  Failed:   ${failed ? color('red', stats.failures) : stats.failures}`);
    console.info(`  Pending:  ${stats.pending > 0 ? color('yellow', stats.pending) : stats.pending}`);
    console.info(`  Duration: ${formatDuration(stats.duration)}`);
}

function printQuenchFailures({ failures }) {
    if (!failures.length) return;

    const width = String(failures.length).length;
    console.error(`\n${color('red', 'bold', 'Failures')}`);
    failures.forEach((failure, index) => {
        const number = String(index + 1).padStart(width, ' ');
        console.error(`\n${color('red', `${number}. ${failure.title}`)}`);
        console.error(color('dim', indentText(formatFailureDetails(failure))));
    });
}

function printProgress({ kind, title, duration, hook }) {
    const label = hook ? `Hook: ${title}` : title;
    const dur = color('dim', `(${kind === 'pending' ? 'skipped' : formatDuration(duration)})`);
    if (kind === 'pass') console.info(`  ${color('green', '✓')} ${label} ${dur}`);
    else if (kind === 'fail') console.error(`  ${color('red', '✗')} ${label} ${dur}`);
    else console.info(`  ${color('yellow', '○')} ${label} ${dur}`);
}

function printFatalError(error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`\n${color('red', 'bold', 'Quench runner failed')}`);
    console.error(color('dim', indentText(message, 2)));
}

// ─── source maps ─────────────────────────────────────────────────────────────

let _consumerPromise = null;
function getSourceMapConsumer() {
    if (_consumerPromise) return _consumerPromise;
    _consumerPromise = (async () => {
        const mapPath = path.join(repoRoot, 'dist', 'bundle.js.map');
        if (!(await fs.pathExists(mapPath))) return null;
        const { SourceMapConsumer } = require('source-map');
        return new SourceMapConsumer(JSON.parse(await fs.readFile(mapPath, 'utf8')));
    })();
    return _consumerPromise;
}

function remapStack(stack, consumer) {
    return stack.replace(/(?:systems\/shadowrun5e\/)?dist\/bundle\.js:(\d+):(\d+)/g, (m, line, col) => {
        const pos = consumer.originalPositionFor({ line: Number(line), column: Number(col) });
        if (!pos.source || pos.line == null) return m;
        const abs = path.resolve(path.join(repoRoot, 'dist'), pos.source);
        const rel = path.relative(repoRoot, abs).split(path.sep).join('/');
        return `${rel}:${pos.line}:${pos.column}`;
    });
}

async function remapFailureStacks(failures) {
    const consumer = await getSourceMapConsumer();
    if (!consumer) return;
    for (const failure of failures) {
        if (failure.error) failure.error = remapStack(failure.error, consumer);
    }
}

// ─── config & env ────────────────────────────────────────────────────────────

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
        } else {
            // Strip an inline comment from unquoted values.
            const comment = value.search(/\s#/);
            if (comment !== -1) value = value.slice(0, comment).trimEnd();
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

function resolveRunConfig() {
    const url = process.env.FOUNDRY_URL || 'http://localhost:30000';
    const positional = process.argv[2] && !process.argv[2].startsWith('-') ? process.argv[2] : undefined;
    const pattern = getArg('pattern') || process.env.QUENCH_PATTERN || positional || 'shadowrun5e.**';
    // This is a watchdog for the complete suite. Individual test timeouts remain
    // controlled by the test definitions registered with Quench.
    const configuredTimeout = Number(process.env.QUENCH_RUN_TIMEOUT);
    const runTimeoutMs =
        Number.isFinite(configuredTimeout) && configuredTimeout > 0 ? configuredTimeout : 10 * 60 * 1000;
    const headless = !process.argv.includes('--headed');
    const user = process.env.FOUNDRY_USER || 'Gamemaster';
    return { url, pattern, runTimeoutMs, headless, user };
}

// ─── Foundry orchestration ───────────────────────────────────────────────────

async function waitForGameReady(page, timeout = 120000) {
    await page.waitForFunction(() => globalThis.game?.ready === true, null, { timeout });
}

async function joinWorld(page, user = 'Gamemaster') {
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
        await select.selectOption({ label: user });
    } catch (labelError) {
        const options = await select.locator('option').evaluateAll((elements) =>
            elements.map((option) => ({
                value: option.value,
                text: (option.textContent ?? '').trim(),
            })),
        );
        const match = options.find((option) => option.text.toLowerCase() === user.toLowerCase());
        if (!match) {
            const available = options.map((option) => option.text).join(', ') || 'none';
            throw new Error(
                `User "${user}" is not available in the launched world (available users: ${available}). ` +
                    `Selecting by label failed: ${labelError}`,
            );
        }
        await select.selectOption(match.value);
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

async function ensureQuenchActive(page, user) {
    if (await quenchReady(page, 8000)) return;

    const installed = await page.evaluate(() => game.modules.has('quench'));
    if (!installed) {
        throw new Error('The Quench module is not installed in this Foundry data directory.');
    }

    log('enabling Quench in the launched world');
    try {
        await page.evaluate(async () => {
            const modules = { ...(game.settings.get('core', 'moduleConfiguration') ?? {}) };
            modules.quench = true;
            await game.settings.set('core', 'moduleConfiguration', modules);
        });
    } catch (error) {
        // Foundry's reload on config change can destroy the context mid-call; ignore that, rethrow else.
        if (!/execution context was destroyed|navigation/i.test(String(error))) throw error;
    }

    // Foundry reloads the world after its module configuration changes, so the
    // browser must join again before checking for the global Quench API.
    await joinWorld(page, user);
    if (!(await quenchReady(page, 60000))) {
        throw new Error('Quench is still unavailable after enabling the module and reloading the world.');
    }
}

// ─── browser run ─────────────────────────────────────────────────────────────

async function runQuench(page, pattern, runTimeoutMs) {
    return page.evaluate(
        async ({ pattern, runTimeoutMs, progressSentinel }) => {
            const quench = globalThis.quench;
            if (!quench) throw new Error('The global Quench API is unavailable.');
            const Runner = quench.mocha?.Runner ?? globalThis.Mocha?.Runner;
            if (!Runner) throw new Error('Mocha Runner is unavailable.');

            const cleanCycles = (value) => {
                const cache = [];
                return JSON.parse(
                    JSON.stringify(value, (_key, nested) => {
                        if (typeof nested === 'object' && nested !== null) {
                            if (cache.includes(nested)) return String(nested);
                            cache.push(nested);
                        }
                        return nested;
                    }),
                );
            };
            const serializeError = (error) => {
                if (!error || typeof error !== 'object') return { message: String(error ?? 'unknown error') };

                const result = {};
                for (const key of Object.getOwnPropertyNames(error)) {
                    result[key] = error[key];
                }
                if (!('message' in result)) result.message = error.message ?? String(error);
                if (!('stack' in result) && error.stack) result.stack = error.stack;
                return cleanCycles(result);
            };
            const errorText = (error) => {
                const message = error?.message ?? String(error ?? 'unknown error');
                if (error?.stack) return error.stack.startsWith(message) ? error.stack : `${message}\n${error.stack}`;
                return message;
            };
            const failureKey = (failure) => `${failure.title}\n${failure.error ?? ''}`;
            const makeFailure = ({ title, file, duration, speed, err, source }) => ({
                title,
                file,
                duration,
                speed,
                error: errorText(err),
                actual: err?.actual,
                expected: err?.expected,
                operator: err?.operator,
                source,
            });
            const fromMochaFailure = (test, error) => {
                const hook = test?.type === 'hook';
                const base = test?.fullTitle?.() ?? test?.title ?? 'Unknown failed test';
                return makeFailure({
                    title: hook ? `Hook failure: ${base}` : base,
                    file: test?.file,
                    duration: test?.duration,
                    speed: test?.speed,
                    err: serializeError(error),
                    source: hook ? 'mocha-hook' : 'mocha',
                });
            };
            const fromReportFailure = (test) =>
                makeFailure({
                    title: test.fullTitle ?? test.title ?? 'Unknown failed test',
                    file: test.file,
                    duration: test.duration,
                    speed: test.speed,
                    err: test.err ?? {},
                    source: 'quench-report',
                });

            // Quench's run handlers access the results application's DOM. If it
            // has not been rendered, runBatches can throw and leave Mocha stuck.
            await quench.app.render({ force: true });

            const capturedFailures = [];
            const eventKinds = {
                [Runner.constants?.EVENT_TEST_PASS ?? 'pass']: 'pass',
                [Runner.constants?.EVENT_TEST_FAIL ?? 'fail']: 'fail',
                [Runner.constants?.EVENT_TEST_PENDING ?? 'pending']: 'pending',
            };
            const originalEmit = Runner.prototype.emit;
            const patchedEmit = function (event, ...args) {
                const kind = eventKinds[event];
                if (kind === 'fail') capturedFailures.push(fromMochaFailure(args[0], args[1]));
                if (kind) {
                    const test = args[0];
                    console.log(
                        progressSentinel +
                            JSON.stringify({
                                kind,
                                title: test?.fullTitle?.() ?? test?.title ?? '',
                                duration: test?.duration,
                                hook: test?.type === 'hook',
                            }),
                    );
                }
                return originalEmit.call(this, event, ...args);
            };

            const waitForRunEnd = (runner) =>
                new Promise((resolve, reject) => {
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

            let runner;
            Runner.prototype.emit = patchedEmit;
            try {
                runner = await quench.runBatches(pattern);
                // Quench returns the runner before Mocha finishes. Register the
                // end listener before checking stats to avoid missing fast runs.
                await waitForRunEnd(runner);
            } finally {
                if (Runner.prototype.emit === patchedEmit) Runner.prototype.emit = originalEmit;
            }

            let report;
            if (typeof quench.reports?.json === 'string') {
                report = JSON.parse(quench.reports.json);
            }

            const stats = report?.stats ?? runner?.stats ?? {};
            if (!stats.tests) throw new Error(`No Quench tests matched "${pattern}".`);

            const failures = [];
            const seen = new Set();
            const addFailure = (failure) => {
                const key = failureKey(failure);
                if (seen.has(key)) return;
                seen.add(key);
                failures.push(failure);
            };

            for (const failure of report?.failures ?? []) addFailure(fromReportFailure(failure));
            for (const failure of capturedFailures) addFailure(failure);

            // Don't let a zero stats.failures hide failures we captured (e.g. hook failures).
            const failureCount = Math.max(stats.failures ?? 0, failures.length);
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
        { pattern, runTimeoutMs, progressSentinel: PROGRESS_SENTINEL },
    );
}

function attachConsoleHandlers(page) {
    const pageLogsEnabled = process.env.QUENCH_PAGE_LOGS === '1';
    page.on('console', (message) => {
        const text = message.text();
        if (text.startsWith(PROGRESS_SENTINEL)) {
            try {
                printProgress(JSON.parse(text.slice(PROGRESS_SENTINEL.length)));
            } catch {
                // malformed sentinel message; ignore
            }
            return;
        }
        if (pageLogsEnabled) {
            console.log(`[page:${message.type()}]`, text);
        }
    });
    page.on('pageerror', (error) => {
        if (pageLogsEnabled) console.error('[page:error]', error.message);
    });
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
    await loadEnvLocal();
    const { url, pattern, runTimeoutMs, headless, user } = resolveRunConfig();

    // Keep GPU rendering enabled in headless Chromium because Foundry and PIXI
    // canvas behavior differs when Chromium falls back to software rendering.
    const args = ['--enable-gpu', '--ignore-gpu-blocklist'];
    const viewport = headless ? { width: 1024, height: 768 } : null;
    if (!headless) args.push('--start-maximized');

    const browser = await chromium.launch({ headless, args });
    try {
        const context = await browser.newContext({ baseURL: url, viewport });
        const page = await context.newPage();
        attachConsoleHandlers(page);

        log(`connecting to ${url}`);
        await joinWorld(page, user);
        await ensureQuenchActive(page, user);

        log(`running "${pattern}"`);
        const result = await runQuench(page, pattern, runTimeoutMs);
        // Let any trailing console events flush before printing the summary.
        await page.waitForTimeout(50);
        await remapFailureStacks(result.failures);
        printQuenchFailures(result);
        printQuenchSummary(result);

        process.exitCode = result.stats.failures > 0 ? 1 : 0;
    } finally {
        await browser.close();
    }
}

main().catch((error) => {
    printFatalError(error);
    process.exitCode = 1;
});
